import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DISCORD_API_URL, DISCORD_REDIRECT_URI } from '../constants';

const MinecraftTeaser: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

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

        if (code) {
            handleDiscordLogin(code);
        }
    }, [searchParams]);

    const handleDiscordLogin = async (code: string) => {
        setIsLoggingIn(true);
        setLoginError(null);

        // Instantly clean up the URL search params so the code isn't visible or reusable
        window.history.replaceState({}, document.title, window.location.pathname);

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
                localStorage.setItem('urnisa_mc_user', JSON.stringify(data));
                
                // Get the saved redirect path, then clean it up
                const redirectPath = localStorage.getItem('discord_login_redirect_to');
                localStorage.removeItem('discord_login_redirect_to');
                
                // Redirect back to the original page or default to home/minecraft teaser page
                if (redirectPath && redirectPath !== '/minecraft') {
                    navigate(redirectPath);
                } else {
                    navigate('/');
                }
            } else {
                console.error("Login failed");
                setLoginError("Failed to authenticate with Discord.");
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            }
        } catch (e) {
            console.error("Network error", e);
            setLoginError("Network error. Could not connect to authentication server.");
            setTimeout(() => {
                navigate('/');
            }, 3000);
        } finally {
            setIsLoggingIn(false);
        }
    };

    if (isLoggingIn) {
        return (
            <div className="w-full flex items-center justify-center py-20 px-4 mt-10">
                <div className="relative w-full max-w-4xl p-8 md:p-16 rounded-[2rem] overflow-hidden bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Logging you in...</h2>
                    <p className="text-gray-400 text-sm">Please wait while we sync your Discord session.</p>
                </div>
            </div>
        );
    }

    if (loginError) {
        return (
            <div className="w-full flex items-center justify-center py-20 px-4 mt-10">
                <div className="relative w-full max-w-4xl p-8 md:p-16 rounded-[2rem] overflow-hidden bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center text-3xl font-bold">✕</div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase text-red-500">Login Failed</h2>
                    <p className="text-gray-400 text-sm">{loginError}</p>
                    <p className="text-gray-500 text-xs">Redirecting you to the home page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-center py-20 px-4 mt-10">
            {/* Main Container - transparent/glassmorphism modern look */}
            <div 
                className="relative w-full max-w-4xl p-8 md:p-16 rounded-[2rem] overflow-hidden bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-1000"
            >
                {/* Decorative floating elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 text-center">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
                        Next <span className="text-brand-primary">Nisamon</span>
                        <br />
                        <span className="text-white mt-4 block text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            COMING SOON
                        </span>
                    </h1>

                    <div className="flex flex-col items-center justify-center gap-6 mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
                        <div className="flex justify-center text-gray-300 font-extrabold tracking-[0.3em] text-sm md:text-base cursor-default select-none hover:text-brand-primary transition-colors duration-300">
                            {"GREMLINS WORKING...".split("").map((char, index) => (
                                <span 
                                    key={index} 
                                    className="inline-block animate-wave" 
                                    style={{ 
                                        animationDelay: `${index * 0.05}s` 
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </span>
                            ))}
                        </div>
                        
                        {/* Endless Gif Loop */}
                        <div className="w-full max-w-[200px] sm:max-w-xs mt-2 transform hover:scale-105 transition-transform duration-500">
                            <img 
                                src="https://s13.gifyu.com/images/bdEGa.gif" 
                                alt="Loading..." 
                                className="w-full h-auto object-contain opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinecraftTeaser;
