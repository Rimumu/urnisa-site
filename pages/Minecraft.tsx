
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { DISCORD_API_URL, DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '../constants';
import UserProfile, { UserData } from '../components/UserProfile';

const CurseforgeLogo = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M7.19 2.5C6.11 2.76 5.11 3.2 4.22 3.78c-.76.5-1.52 1.14-2.11 1.77C1.45 6.3 1 7.21.75 8.16a10.63 10.63 0 0 0 .58 7.37c.56 1.34 1.46 2.52 2.62 3.44c1.16.92 2.52 1.57 3.97 1.88c1.45.31 2.96.31 4.41 0c1.39-.3 2.7-.92 3.83-1.8c.37-.28.72-.59 1.05-.92c-.27-.2-.55-.38-.83-.54c-.65-.36-1.41-.5-2.15-.4c-.74.1-1.42.48-1.89 1.05c-.47.57-.65 1.32-.48 2.05c.08.35.25.68.48.96c-1.36.42-2.8.53-4.21.32c-2.63-.39-4.99-1.92-6.3-4.1c-1.31-2.18-1.55-4.88-.65-7.25c.9-2.37 2.86-4.25 5.25-5.04c.59-.19 1.2-.31 1.82-.36c.62-.05 1.24.01 1.85.17c1.22.32 2.34.91 3.26 1.72c.46.4.87.86 1.23 1.36c.18.25.35.51.5.78c.07.13.14.27.2.4l-.56-.21c-1.28-.48-2.66-.66-4.01-.52c-.84.09-1.66.33-2.42.71c-1.52.76-2.69 2.05-3.23 3.65c-.54 1.6-.45 3.36.26 4.9c.71 1.54 1.95 2.78 3.51 3.46c1.56.68 3.33.74 4.93.16c1.6-.58 2.87-1.84 3.52-3.44c.65-1.6.61-3.39-.12-4.95c-.37-.78-.88-1.48-1.5-2.07c-.31-.29-.65-.55-1.01-.78c-.09-.06-.18-.11-.27-.16l.24.47c.21.42.38.86.51 1.31c.26.9.3 1.85.12 2.78c-.18.93-.58 1.8-1.16 2.54c-.58.74-1.33 1.31-2.19 1.66c-.86.35-1.81.47-2.73.35c-.92-.12-1.79-.47-2.52-1.01c-.73-.54-1.29-1.26-1.62-2.1c-.33-.84-.42-1.76-.26-2.66c.16-.9.56-1.73 1.15-2.42c.59-.69 1.36-1.21 2.23-1.5c.87-.29 1.81-.34 2.7-.15c.89.19 1.71.61 2.39 1.2c.68.59 1.2 1.33 1.51 2.18c.08.21.14.43.18.65l.59-.22c.6-.22 1.14-.58 1.59-1.04c.9-.92 1.48-2.1 1.64-3.37c.16-1.27-.12-2.56-.81-3.66c-.69-1.1-1.73-1.95-2.94-2.42c-1.21-.47-2.53-.55-3.79-.22z" />
    </svg>
);

const Minecraft: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const SERVER_IP = "mc.urnisa.live";

    // Auth State
    const [user, setUser] = useState<UserData | null>(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
        return null;
    });

    // Alert Modals for Requirement Checks
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [showMCAlert, setShowMCAlert] = useState(false);
    const [showTwitchAlert, setShowTwitchAlert] = useState(false);
    const [showSubAlert, setShowSubAlert] = useState(false);

    // Whitelist State
    const [applying, setApplying] = useState(false);
    const [whitelistStatus, setWhitelistStatus] = useState<{ type: 'success' | 'error' | 'pending', msg: string } | null>(null);

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Handle OAuth Code Callback - Pass it to a handler that saves to LocalStorage, 
    // then UserProfile will pick it up on mount/update. 
    // However, UserProfile reads from LS on mount. We need to manually handle the code exchange here
    // Handles OAuth Code Callback
    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        // If there is a state pointing to a different origin, redirect there with code
        if (state && state.startsWith('http')) {
            try {
                const stateUrl = new URL(state);
                const currentUrl = new URL(window.location.href);
                // Compare hostnames, ignoring www. prefix
                const stateHost = stateUrl.hostname.replace(/^www\./, '');
                const currentHost = currentUrl.hostname.replace(/^www\./, '');
                
                if (stateHost !== currentHost) {
                    if (code) {
                        stateUrl.searchParams.set('code', code);
                    }
                    window.location.href = stateUrl.toString();
                    return;
                }
            } catch (e) {
                console.error("Failed to redirect to state origin:", e);
            }
        }

        if (code && !user) {
            handleDiscordLogin(code);
        }
    }, [searchParams]);

    const handleDiscordLogin = async (code: string) => {
        window.history.replaceState({}, document.title, "/minecraft");

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
                
                // Redirect if we have a saved path
                const redirectPath = localStorage.getItem('discord_login_redirect_to');
                if (redirectPath) {
                    localStorage.removeItem('discord_login_redirect_to');
                    if (redirectPath !== window.location.pathname) {
                        navigate(redirectPath);
                    }
                }
            } else {
                console.error("Login failed");
            }
        } catch (e) {
            console.error("Network error", e);
        }
    };

    const handleApplyWhitelist = async () => {
        // 1. Check Login
        if (!user) {
            setShowLoginAlert(true);
            return;
        }

        // 2. Check Minecraft Linked Account
        if (!user.minecraftUsername) {
            setShowMCAlert(true);
            return;
        }

        // Check Twitch Linked Account
        if (!user.twitchUsername) {
            setShowTwitchAlert(true);
            return;
        }

        // 3. Check Role & Apply
        setApplying(true);
        setWhitelistStatus(null);

        try {
            // Sync with backend to ensure the Minecraft and Twitch credentials are fully saved in the DB
            await fetch(`${DISCORD_API_URL}/api/minecraft/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    discordId: user.id,
                    discordUsername: user.global_name || user.username,
                    discordAvatar: user.avatar,
                    minecraftUsername: user.minecraftUsername,
                    twitchUsername: user.twitchUsername,
                    twitchAvatar: user.twitchAvatar
                })
            });

            const response = await fetch(`${DISCORD_API_URL}/api/whitelist/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id })
            });

            const data = await response.json();

            if (response.ok) {
                setWhitelistStatus({ type: 'success', msg: "Application Sent! Please wait for admin approval." });
            } else if (response.status === 403) {
                // Explicitly show Modal for Role Failure
                setShowSubAlert(true);
            } else if (response.status === 409) {
                setWhitelistStatus({ type: 'pending', msg: "Application already pending!" });
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
                <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 flex items-center gap-4 min-w-[320px] max-w-md ${
                    whitelistStatus.type === 'success' 
                        ? 'bg-zinc-950/90 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                        : whitelistStatus.type === 'pending'
                        ? 'bg-zinc-950/90 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                        : 'bg-zinc-950/90 border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
                }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        whitelistStatus.type === 'success'
                            ? 'bg-emerald-500/10'
                            : whitelistStatus.type === 'pending'
                            ? 'bg-amber-500/10'
                            : 'bg-rose-500/10'
                    }`}>
                        {whitelistStatus.type === 'success' && (
                            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        )}
                        {whitelistStatus.type === 'pending' && (
                            <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        )}
                        {whitelistStatus.type === 'error' && (
                            <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="font-extrabold text-white text-base tracking-wide">
                            {whitelistStatus.type === 'success' && 'Success!'}
                            {whitelistStatus.type === 'pending' && 'Notice!'}
                            {whitelistStatus.type === 'error' && 'Access Denied'}
                        </div>
                        <div className="text-sm text-zinc-300 font-medium mt-0.5">{whitelistStatus.msg}</div>
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
                        <h3 className="text-xl font-black text-white mb-2">Minecraft Link Required</h3>
                        <p className="text-gray-400 text-sm mb-6">You have not linked a Minecraft account yet!</p>
                        <button onClick={() => setShowMCAlert(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* REQUIREMENT ALERT: NO TWITCH */}
            {showTwitchAlert && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center relative">
                        <button onClick={() => setShowTwitchAlert(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                        <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400 text-3xl border border-purple-500/20">
                            🔗
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Twitch Link Required</h3>
                        <p className="text-gray-400 text-sm mb-6">You have not linked your Twitch account yet!</p>
                        <button onClick={() => setShowTwitchAlert(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* REQUIREMENT ALERT: NO SUB ROLE */}
            {showSubAlert && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center relative">
                        <button onClick={() => setShowSubAlert(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                        <div className="w-16 h-16 bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-400 text-3xl border border-purple-500/20">
                            ⭐
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Access Required</h3>
                        <p className="text-gray-400 text-sm mb-6">You must be subscribed to the Twitch channel or have the Minecraft access role in Discord to apply!</p>
                        <button onClick={() => setShowSubAlert(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}


            {/* USER TOP BAR */}
            <UserProfile
                onUserChange={setUser}
                className="absolute top-0 right-0 p-4 w-full flex justify-end"
            />

            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-16">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
                        WELCOME TO <span className="text-red-500">NISAMON</span>
                    </h1>
                    {/* Decorative element behind title */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-500/5 blur-[60px] -z-10 rounded-full"></div>
                </div>

                <p className="text-gray-300 max-w-2xl text-lg md:text-xl px-4">
                    This is urnisa's Minecraft cobblemon server where you can embark on a journey with nisa and use your balls with her to catch some little gremlins. Well... some are big!
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

                        <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Server Online</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* New Navigation Boxes */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Bingo Card - DISABLED */}
                    <div className="block flex-1 bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden opacity-50 cursor-not-allowed grayscale">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#60a5fa]/20 flex items-center justify-center shadow-inner text-[#60a5fa]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Bingo Card</h2>
                        </div>

                        <p className="text-gray-400 font-medium leading-relaxed">
                            Join the community bingo challenge with everyone and compete and finish first to win rewards on the server!
                        </p>

                        <div className="mt-6 flex items-center text-gray-500 font-bold text-sm uppercase tracking-wider">
                            COMING SOON
                        </div>
                    </div>

                    {/* Gacha Pack - DISABLED */}
                    <div className="block flex-1 bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden opacity-50 cursor-not-allowed grayscale">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand-accent/20 flex items-center justify-center shadow-inner text-brand-accent">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Gacha Crate</h2>
                        </div>

                        <p className="text-gray-400 font-medium leading-relaxed">
                            Try your luck and open a lamb or steak loot crate to see if you'll get some delicious rewards!
                        </p>

                        <div className="mt-6 flex items-center text-gray-500 font-bold text-sm uppercase tracking-wider">
                            COMING SOON
                        </div>
                    </div>

                    {/* Tournament - DISABLED */}
                    <div className="block flex-1 bg-black/30 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden opacity-50 cursor-not-allowed grayscale">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center shadow-inner text-red-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-wide">Tournament</h2>
                        </div>

                        <p className="text-gray-400 font-medium leading-relaxed">
                            Compete and work your way up the brackets to be crowned the STEAK House Nisamon Champion!
                        </p>

                        <div className="mt-6 flex items-center text-gray-500 font-bold text-sm uppercase tracking-wider">
                            COMING SOON
                        </div>
                    </div>
                </div>

                {/* How to Join Section - UPDATED */}
                <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full">
                    <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><rect width="20" height="12" x="2" y="6" rx="2"/></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white">How to Join</h2>
                    </div>

                    <div className="space-y-6 relative">
                        <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-white/10 -z-10"></div>
                        {[
                            { step: 1, title: "Download Modpack", desc: "Get the Cobbleverse Nisamon modpack below." },
                            { step: 2, title: "Get Whitelisted", desc: "Apply below to get whitelisted to the server." },
                            { step: 3, title: "Launch Game", desc: "Launch Minecraft with the modpack and go to Multiplayer." },
                            { step: 4, title: "Connect", desc: `Add server IP: ${SERVER_IP}` }
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

                    <div className="mt-auto pt-8 flex flex-col gap-3">
                        {/* DOWNLOAD BUTTON */}
                        <a
                            href="https://www.curseforge.com/minecraft/modpacks/nisamon"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full text-white font-bold py-4 rounded-xl transition-all shadow-lg bg-[#f16436] hover:bg-[#d6552a] hover:scale-[1.02] shadow-orange-500/20"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                            Download Modpack
                        </a>

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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                                        <rect x="9" y="3" width="6" height="4" rx="2" ry="2"></rect>
                                        <path d="M9 14l2 2 4-4"></path>
                                    </svg>
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

export default Minecraft;
