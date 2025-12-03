
import React, { useState } from 'react';

const MinecraftDev: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const SERVER_IP = "play.urnisa.live";

  const handleCopy = () => {
    navigator.clipboard.writeText(SERVER_IP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-12 font-sans text-white">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

            {/* How to Join Section */}
            <div className="bg-black/30 backdrop-blur-lg border border-white/10 p-8 rounded-[2.5rem] shadow-xl flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-2xl">🎮</div>
                    <h2 className="text-2xl font-bold text-white">How to Join</h2>
                </div>

                <div className="space-y-6 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-white/10 -z-10"></div>

                    {[
                        { step: 1, title: "Download Modpack", desc: "Get the official modpack from CurseForge." },
                        { step: 2, title: "Install Fabric", desc: "Ensure you have the latest Fabric Loader installed." },
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
                    <a 
                        href="https://discord.gg/urnisa" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 19.018 19.018 0 0 0-3.361 6.883 19.2 19.2 0 0 0-4.92 0C5.832 6.72 5.309 5.351 4.635 2.893a.074.074 0 0 0-.079-.037A19.736 19.736 0 0 0 .68 4.37a.075.075 0 0 0-.032.027C.533 9.046 1.583 13.578 4.53 18.16a.077.077 0 0 0 .084.011 19.73 19.73 0 0 0 5.995-3.016.077.077 0 0 0 .031-.102c-.613-.916-1.15-1.89-1.581-2.917a.075.075 0 0 1 .065-.105c1.204.573 2.58.892 4.004.892s2.8-.319 4.004-.892a.075.075 0 0 1 .065.105c-.43 1.027-.968 2.001-1.581 2.917a.077.077 0 0 0 .031.102 19.73 19.73 0 0 0 5.996 3.016.077.077 0 0 0 .084-.011c2.947-4.582 3.997-9.114 3.882-13.763a.076.076 0 0 0-.032-.027zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.418 2.157-2.418 1.21 0 2.176 1.096 2.157 2.418 0 1.334-.947 2.419-2.157 2.419z"/></svg>
                        Need Help? Join Discord
                    </a>
                </div>
            </div>

        </div>
    </div>
  );
};

export default MinecraftDev;
