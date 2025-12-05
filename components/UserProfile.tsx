
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI, DISCORD_API_URL } from '../constants';

export interface UserData {
    id: string;
    username: string;
    global_name?: string;
    avatar: string;
    minecraftUsername?: string | null;
}

interface UserProfileProps {
    onUserChange?: (user: UserData | null) => void;
    className?: string;
}

// Icons
const DiscordLogo = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08 0-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.31-1.08.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12z"/>
    </svg>
);

const PowerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
        <line x1="12" y1="2" x2="12" y2="12"></line>
    </svg>
);

const BackpackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/>
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
        <path d="M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5"/>
        <path d="M8 10h8"/>
        <path d="M8 18h8"/>
    </svg>
);

const UserProfile: React.FC<UserProfileProps> = ({ onUserChange, className = "" }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showUnlinkModal, setShowUnlinkModal] = useState(false);
    const [mcInput, setMcInput] = useState('');
    const [linkStatus, setLinkStatus] = useState<'idle' | 'success' | 'error' | 'conflict'>('idle');
    const navigate = useNavigate();

    // Check for existing user on mount
    useEffect(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) {
            const parsed = JSON.parse(stored);
            setUser(parsed);
            if (onUserChange) onUserChange(parsed);
        } else {
            if (onUserChange) onUserChange(null);
        }
    }, []); // Empty dependency array to run only once on mount

    const loginRedirect = () => {
        const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
        window.location.href = url;
    };

    const logout = () => {
        localStorage.removeItem('urnisa_mc_user');
        setUser(null);
        setMenuOpen(false);
        if (onUserChange) onUserChange(null);
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
                if (onUserChange) onUserChange(updatedUser);
                
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
                if (onUserChange) onUserChange(updatedUser);
                setShowUnlinkModal(false); 
                setMenuOpen(false);
            }
        } catch (e) {
            console.error("Unlink failed", e);
        }
    };

    return (
        <div className={`relative ${className} z-50`}>
            {user ? (
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
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-[#1e1f22] rounded-xl shadow-xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="px-4 py-3 border-b border-white/5 bg-black/20">
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Connected As</p>
                                <p className="text-sm text-white truncate font-bold">@{user.username}</p>
                            </div>
                            
                            {/* Inventory Link */}
                            <button 
                                onClick={() => { navigate('/inventory'); setMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-2 font-bold border-b border-white/5"
                            >
                                <BackpackIcon />
                                My Inventory
                            </button>

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
                                className="w-full text-left px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
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

            {/* LINK MODAL */}
            {showLinkModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1a0b0e] border border-white/10 p-0 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative">
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
        </div>
    );
};

export default UserProfile;
