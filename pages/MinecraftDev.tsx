import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DISCORD_API_URL, DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '../constants';

interface UserData {
    id: string;
    username: string;
    global_name?: string;
    avatar: string;
    minecraftUsername?: string | null;
}

// Corrected Discord Logo SVG Path (Standardized for 24x24)
const DiscordLogo = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08 0-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.31-1.08.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12z"/>
    </svg>
);

// Power Icon for Logout
const PowerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
);

const MinecraftDev: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const SERVER_IP = "play.urnisa.live";
  
  // Auth State
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Modal States
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showUnlinkModal, setShowUnlinkModal] = useState(false);
  
  // New Alert Modals for Requirement Checks
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showMCAlert, setShowMCAlert] = useState(false);
  
  // Whitelist State
  const [applying, setApplying] = useState(false);
  const [whitelistStatus, setWhitelistStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [mcInput, setMcInput] = useState('');
  const [linkStatus, setLinkStatus] = useState<'idle' | 'success' | 'error' | 'conflict'>('idle');
  const [searchParams, setSearchParams] = useSearchParams();

  // Load user from local storage on mount
  useEffect(() => {
      const stored = localStorage.getItem('urnisa_mc_user');
      if (stored) {
          setUser(JSON.parse(stored));
      }
  }, []);

  // Handle OAuth Code Callback
  useEffect(() => {
      const code = searchParams.get('code');
      if (code && !user) {
          handleDiscordLogin(code);
      }
  }, [searchParams]);

  const handleDiscordLogin = async (code: string) => {
      setLoading(true);
      window.history.replaceState({}, document.title, "/minecraft-dev");
      
      try {
          const response = await fetch(`${DISCORD_API_URL}/api/auth/discord`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  code, 
                  redirectUri: DISCORD_REDIRECT_URI 
              })
          });
          
          if (response.ok) {
              const data = await response.json();
              setUser(data);
              localStorage.setItem('urnisa_mc_user', JSON.stringify(data));
          } else {
              console.error("Login failed");
          }
      } catch (e) {
          console.error("Network error", e);
      } finally {
          setLoading(false);
      }
  };

  const loginRedirect = () => {
      const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
      window.location.href = url;
  };

  const logout = () => {
      localStorage.removeItem('urnisa_mc_user');
      setUser(null);
      setMenuOpen(false);
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user || !mcInput) return;
      
      setLinkStatus('idle');

      if (!/^[a-zA-Z0-9_]{3,16}$/.test(mcInput)) {
          setLinkStatus('error');
          return;
      }

      try {
          const response = await fetch(`${DISCORD_API_URL}/api/minecraft/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  discordId: user.id,
                  discordUsername: user.username,
                  discordAvatar: user.avatar,
                  minecraftUsername: mcInput
              })
          });
          
          if (response.ok) {
              setLinkStatus('success');
              const updatedUser = { ...user, minecraftUsername: mcInput };
              setUser(updatedUser);
              localStorage.setItem('urnisa_mc_user', JSON.stringify(updatedUser));
              setTimeout(() => {
                  setShowLinkModal(false);
                  setLinkStatus('idle');
              }, 1500);
          } else if (response.status === 409) {
              setLinkStatus('conflict');
          } else {
              setLinkStatus('error');
          }
      } catch (e) {
          setLinkStatus('error');
      }
  };

  const handleUnlinkMinecraft = async () => {
      if (!user) return;

      try {
          const response = await fetch(`${DISCORD_API_URL}/api/minecraft/link`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discordId: user.id })
          });

          if (response.ok) {
              const updatedUser = { ...user, minecraftUsername: null };
              setUser(updatedUser as UserData); 
              localStorage.setItem('urnisa_mc_user', JSON.stringify(updatedUser));
              setShowUnlinkModal(false); 
              setMenuOpen(false);
          }
      } catch (e) {
          console.error("Unlink failed", e);
      }
  };

  const handleApplyWhitelist = async () => {
      // 1. Check Login
      if (!user) {
          setShowLoginAlert(true); // Show Modal instead of redirect
          return;
      }

      // 2. Check Linked Account
      if (!user.minecraftUsername) {
          setShowMCAlert(true); // Show Modal instead of opening link form
          return;
      }

      // 3. Check Role & Apply
      setApplying(true);
      setWhitelistStatus(null);

      try {
          const response = await fetch(`${DISCORD_API_URL}/api/whitelist/apply`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discordId: user.id })
          });

          const data = await response.json();

          if (response.ok) {
              setWhitelistStatus({ type: 'success', msg: data.message || "Application Sent! Pending Admin Approval." });
          } else if (response.status === 409) {
               setWhitelistStatus({ type: 'success', msg: "Application already pending!" });
          } else {
              setWhitelistStatus({ type: 'error', msg: data.error || "Application Failed" });
          }
      } catch (e) {
          setWhitelistStatus({ type: 'error', msg: "Server Error. Try again later." });
      } finally {
          setApplying(false);
          setTimeout(() => setWhitelistStatus(null), 5000);
      }
  };


  const handleCopy = () => {
    navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-8 font-sans text-white relative">
        
        {/* Whitelist Status Toast */}
        {whitelistStatus && (
            <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-4 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-3 ${whitelistStatus.type === 'success' ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
                <span className="text-2xl">{whitelistStatus.type === 'success' ? '🎉' : '⛔'}</span>
                <div>
                    <div className="font-bold text-white text-lg">{whitelistStatus.type === 'success' ? 'Success!' : 'Access Denied'}</div>
                    <div className="text-sm text-white/90">{whitelistStatus.msg}</div>
                </div>
            </div>
        )}

        {/* REQUIREMENT ALERT: NO LOGIN */}
        {showLoginAlert && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center relative">
                    <button onClick={() => setShowLoginAlert(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-3xl border border-red-500/20">
                        🔒
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Login Required</h3>
                    <p className="text-gray-400 text-sm mb-6">You have not logged into a Discord account yet!</p>
                    <button onClick={() => setShowLoginAlert(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                        Close
                    </button>
                </div>
            </div>
        )}

        {/* REQUIREMENT ALERT: NO MINECRAFT */}
        {showMCAlert && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center relative">
                    <button onClick={() => setShowMCAlert(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                    <div className="w-16 h-16 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 text-3xl border border-amber-500/20">
                        🔗
                    </div>
                    <h3 className="text-xl font-black text-white mb-2">Account Link Required</h3>
                    <p className="text-gray-400 text-sm mb-6">You have not linked a Minecraft account yet!</p>
                    <button onClick={() => setShowMCAlert(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                        Close
                    </button>
                </div>
            </div>
        )}


        {/* USER TOP BAR */}
        <div className="absolute top-0 right-0 p-4 z-50 flex justify-end w-full">
            {loading ? (
                <div className="bg-black/40 px-4 py-2 rounded-full border border-white/10 animate-pulse text-xs font-bold">
                    Connecting to Discord...
                </div>
            ) : user ? (
                <div className="relative">
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center gap-3 bg-black/60 hover:bg-black/80 border border-white/10 hover:border-brand-primary/50 px-4 py-2 rounded-full transition-all duration-300 shadow-lg group"
                    >
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors">{user.global_name || user.username}</div>
                            {user.minecraftUsername ? (
                                <div className="text-[10px] text-green-400 font-mono flex items-center justify-end gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    {user.minecraftUsername}
                                </div>
                            ) : (
                                <div className="text-[10px] text-gray-500 font-mono">No MC Linked</div>
                            )}
                        </div>
                        <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#1e1f22] rounded-xl shadow-xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-3 border-b border-white/5 bg-black/20">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Connected As</p>
                                <p className="text-sm text-white truncate font-bold">@{user.username}</p>
                            </div>
                            
                            {user.minecraftUsername ? (
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Minecraft Account</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/24`} alt="Head" className="w-6 h-6 rounded" />
                                            <span className="text-sm font-mono text-white">{user.minecraftUsername}</span>
                                        </div>
                                        <button 
                                            onClick={() => { setShowUnlinkModal(true); setMenuOpen(false); }}
                                            className="text-[10px] text-red-400 hover:text-red-300 underline"
                                        >
                                            Unlink
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => { setShowLinkModal(true); setMenuOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-sm text-brand-primary hover:bg-brand-primary/10 transition-colors flex items-center gap-2 font-bold"
                                >
                                    <span>🔗</span> Link Minecraft Account
                                </button>
                            )}

                            <button 
                                onClick={logout}
                                className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2 border-t border-white/5"
                            >
                                <PowerIcon />
                                Unlink Discord & Sign Out
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    onClick={loginRedirect}
                    className="flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:scale-105"
                >
                    <DiscordLogo />
                    Login with Discord
                </button>
            )}
        </div>

        {/* LINK MODAL */}
        {showLinkModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1a0b0e] border border-white/10 p-0 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
                    {/* Decor Header */}
                    <div className="h-24 bg-gradient-to-br from-brand-primary/20 to-black relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                         <div className="w-16 h-16 bg-[#1a0b0e] rounded-2xl border-4 border-[#1a0b0e] shadow-xl flex items-center justify-center translate-y-8 z-10">
                            <span className="text-3xl">🔗</span>
                         </div>
                    </div>

                    <div className="px-8 pt-12 pb-8 text-center">
                        <h2 className="text-2xl font-black text-white mb-2">Link Minecraft Account</h2>
                        <p className="text-gray-400 text-sm mb-6">Enter your Minecraft username to link:</p>
                        
                        <form onSubmit={handleLinkSubmit} className="space-y-6 text-left">
                            <div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <img 
                                            src={mcInput ? `https://mc-heads.net/avatar/${mcInput}/20` : "https://mc-heads.net/avatar/Steve/20"} 
                                            alt="" 
                                            className="w-5 h-5 rounded-sm grayscale opacity-70 transition-all duration-300"
                                            onError={(e) => (e.currentTarget.style.display = 'none')}
                                        />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={mcInput}
                                        onChange={(e) => { setMcInput(e.target.value); setLinkStatus('idle'); }}
                                        className={`
                                            w-full bg-black/40 border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none font-mono transition-all placeholder:text-gray-600
                                            ${linkStatus === 'conflict' ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary'}
                                        `}
                                        placeholder="Notch"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {linkStatus === 'error' && <p className="text-red-400 text-xs mt-2 font-bold flex items-center gap-1"><span className="text-lg leading-none">•</span> Failed to link. Invalid username.</p>}
                                {linkStatus === 'conflict' && <p className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1"><span className="text-lg leading-none">•</span> This minecraft username has been linked already!</p>}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowLinkModal(false)} 
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={linkStatus === 'success' || linkStatus === 'conflict'}
                                    className={`
                                        flex-1 font-bold py-3 rounded-xl transition-all shadow-lg text-sm text-white
                                        ${linkStatus === 'success' ? 'bg-green-600 scale-105' : linkStatus === 'conflict' ? 'bg-red-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 hover:scale-[1.02]'}
                                    `}
                                >
                                    {linkStatus === 'success' ? '✓ Linked!' : linkStatus === 'conflict' ? 'Taken ✕' : 'Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}

        {/* UNLINK MODAL */}
        {showUnlinkModal && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-[#1a0b0e] border border-white/10 p-0 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
                    <div className="h-24 bg-gradient-to-br from-red-900/40 to-black relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                         <div className="w-16 h-16 bg-[#1a0b0e] rounded-2xl border-4 border-[#1a0b0e] shadow-xl flex items-center justify-center translate-y-8 z-10 text-red-500">
                            <span className="text-3xl">⚠️</span>
                         </div>
                    </div>

                    <div className="px-8 pt-12 pb-8 text-center">
                        <h2 className="text-2xl font-black text-white mb-2">Unlink Account?</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Are you sure you want to unlink <strong>{user?.minecraftUsername}</strong>? You will lose your whitelist status on the server.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowUnlinkModal(false)} 
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUnlinkMinecraft}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg text-sm"
                            >
                                Unlink
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-16">
            <div className="relative z-10">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
                    WELCOME TO <span className="text-brand-primary">URNISA</span> MINECRAFT
                    <br />
                    <span className="text-[#60a5fa] drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">COBBLEMON</span> SERVER
                </h1>
                {/* Decorative element behind title */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/5 blur-[60px] -z-10 rounded-full"></div>
            </div>
            
            <p className="text-gray-300 max-w-2xl text-lg md:text-xl px-4">
                Embark on a journey where Pokémon meets Minecraft! Catch 'em all, build your dream home, and battle with friends in our cozy community server.
            </p>

            {/* Server IP Box */}
            <div className="w-full max-w-md px-4">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl mt-8 flex flex-col items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary via-[#60a5fa] to-brand-primary opacity-50"></div>
                    
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Server IP Address</div>
                    
                    <button 
                        onClick={handleCopy}
                        className="relative flex items-center justify-between gap-4 bg-black/30 border border-white/10 hover:border-white/30 px-6 py-4 rounded-2xl w-full transition-all duration-300 group/btn hover:bg-white/5"
                    >
                        <div className="flex flex-col items-start">
                             <span className="font-mono text-xl md:text-2xl font-bold text-brand-accent tracking-wide group-hover/btn:text-white transition-colors">
                                {SERVER_IP}
                            </span>
                        </div>
                        
                        <div className={`
                            flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300
                            ${copied ? 'bg-green-500 text-black scale-110' : 'bg-white/10 text-gray-400 group-hover/btn:bg-brand-primary group-hover/btn:text-white'}
                        `}>
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </div>
                    </button>

                    <div className="flex items-center gap-2 text-sm font-medium text-green-400 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                        <span>Server Online</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Grid */}
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Features Section */}
            <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#60a5fa]/20 flex items-center justify-center text-2xl">🌟</div>
                    <h2 className="text-2xl font-bold text-white">Server Features</h2>
                </div>
                
                <ul className="space-y-4">
                    {[
                        { title: "Cobblemon Mod", desc: "Experience Pokémon in Minecraft seamlessly." },
                        { title: "Custom Starters", desc: "Choose from a unique selection of starter Pokémon." },
                        { title: "Player Gyms", desc: "Challenge other players to become the champion." },
                        { title: "Land Claiming", desc: "Protect your base and builds easily." },
                        { title: "Cosmetics", desc: "Unlock hats, backpacks and trails!" }
                    ].map((item, i) => (
                        <li key={i} className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-6 h-6 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary shrink-0 mt-0.5 text-xs font-bold">✓</div>
                            <div>
                                <div className="font-bold text-white">{item.title}</div>
                                <div className="text-sm text-gray-400">{item.desc}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* How to Join Section - UPDATED */}
            <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-2xl">🎮</div>
                    <h2 className="text-2xl font-bold text-white">How to Join</h2>
                </div>

                <div className="space-y-6 relative">
                    <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-white/10 -z-10"></div>
                    {[
                        { step: 1, title: "Download Modpack", desc: "Get the official modpack from CurseForge." },
                        { step: 2, title: "Get Whitelisted", desc: "Apply below to get whitelisted to the server." }, // CHANGED
                        { step: 3, title: "Launch Game", desc: "Open Minecraft and go to Multiplayer." },
                        { step: 4, title: "Connect", desc: "Add server IP: play.urnisa.live" }
                    ].map((item) => (
                        <div key={item.step} className="flex gap-6 items-start">
                            <div className="w-10 h-10 rounded-full bg-[#1f090c] border-2 border-brand-primary text-brand-primary font-black flex items-center justify-center shrink-0 z-10 shadow-lg">
                                {item.step}
                            </div>
                            <div className="pt-1">
                                <div className="font-bold text-white text-lg">{item.title}</div>
                                <div className="text-gray-400 text-sm">{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-8">
                    {/* APPLY BUTTON */}
                    <button 
                        onClick={handleApplyWhitelist}
                        disabled={applying}
                        className={`
                            flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg
                            ${applying ? 'bg-gray-600 cursor-wait' : 'bg-[#5865F2] hover:bg-[#4752c4] hover:scale-[1.02] shadow-indigo-500/20'}
                        `}
                    >
                        {applying ? (
                            <>Verifying Status...</>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                Apply for Whitelist!
                            </>
                        )}
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default MinecraftDev;