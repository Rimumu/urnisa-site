
import React, { useState, useEffect } from 'react';

// Assets
const PROFILE_IMAGE = "https://i.ibb.co/XZnspyRV/b7587fee-97a4-4c4b-a046-b7ae4ec6650c-profile-image-70x70.png";
const BANNER_IMAGE = "https://i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png";

// Icons
const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const HardwareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

const roles = ["Streamer", "Content Creator", "Yapper", "Gamer"];

type TabType = 'about' | 'contact' | 'credits' | null;

const About: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>(null);
    const [roleIndex, setRoleIndex] = useState(0);
    const [showSpecs, setShowSpecs] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Role rotator effect
    useEffect(() => {
        const interval = setInterval(() => {
            setRoleIndex((prev) => (prev + 1) % roles.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const handleCopyDiscord = () => {
        navigator.clipboard.writeText('urnisa');
        triggerToast("Copied 'urnisa' to clipboard!");
    };

    const toggleTab = (tab: TabType) => {
        if (activeTab === tab) {
            setActiveTab(null);
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 font-sans text-white relative py-10">
            {/* Styles for custom animations */}
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .cursor-blink::after {
                    content: '|';
                    display: inline-block;
                    margin-left: 2px;
                    animation: blink 1s infinite;
                    color: #e5383b;
                }
                .glass-card {
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(229, 56, 59, 0.5);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(229, 56, 59, 0.8);
                }
            `}</style>

            {/* Toast Notification */}
            <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{toastMessage}</span>
            </div>

            {/* Expanding Card Container */}
            <div 
                className={`
                    glass-card rounded-[30px] border border-white/10 overflow-hidden relative
                    flex flex-col md:flex-row
                    transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
                    ${activeTab ? 'w-full max-w-4xl' : 'w-full max-w-md'}
                `}
            >
                {/* LEFT PANEL: Main Profile */}
                <div className="w-full md:w-[28rem] flex-shrink-0 bg-black/20 relative z-10 flex flex-col">
                    {/* Banner */}
                    <div className="h-32 w-full relative overflow-hidden flex-shrink-0">
                        <img 
                            src={BANNER_IMAGE} 
                            alt="Banner" 
                            className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
                    </div>

                    <div className="px-6 pb-8 relative flex-1 flex flex-col">
                        {/* Profile Picture */}
                        <div className="relative -mt-16 mb-4 w-fit mx-auto group">
                            <div className="w-28 h-28 rounded-full p-1 bg-[#121212] relative z-10">
                                <img 
                                    src={PROFILE_IMAGE} 
                                    alt="PFP" 
                                    className="w-full h-full rounded-full object-cover border-2 border-brand-primary/50 group-hover:border-brand-primary transition-colors duration-300" 
                                />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-brand-primary/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                        </div>

                        {/* Header Info */}
                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-1">
                                <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">urnisa</h1>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1 font-mono">
                                <span className="cursor-blink text-brand-primary font-semibold">{roles[roleIndex]}</span>
                            </div>
                        </div>

                        {/* Bio Section */}
                        <div className="bg-[#0a0a0a]/60 rounded-2xl p-4 border border-white/5 mb-4 text-center backdrop-blur-md">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                "Just here to have fun together being a gremlin and try out new things!"
                            </p>
                        </div>

                        {/* Socials Grid */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { name: 'Twitch', url: 'https://twitch.tv/urnisa_', icon: 'https://cdn.simpleicons.org/twitch/e5383b' },
                                { name: 'X', url: 'https://x.com/urnisa__', icon: 'https://cdn.simpleicons.org/x/white' },
                                { name: 'Youtube', url: 'https://www.youtube.com/@urniisaa', icon: 'https://cdn.simpleicons.org/youtube/e5383b' },
                                { name: 'TikTok', url: 'https://www.tiktok.com/@urnisa_ttv', icon: 'https://cdn.simpleicons.org/tiktok/white' },
                            ].map((social) => (
                                <a 
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-primary/50 rounded-xl p-3 flex items-center justify-center transition-all duration-300 group hover:-translate-y-1"
                                >
                                    <img src={social.icon} alt={social.name} className="w-6 h-6 opacity-70 group-hover:opacity-100 transition-opacity" />
                                </a>
                            ))}
                        </div>
                        
                        {/* Discord Button */}
                        <button 
                            onClick={handleCopyDiscord}
                            className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/50 text-[#5865F2] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 mb-4 group hover:shadow-[0_0_15px_rgba(88,101,242,0.3)]"
                        >
                            <img src="https://cdn.simpleicons.org/discord/5865F2" className="w-5 h-5" alt="Discord" />
                            <span>@urnisa</span>
                            <CopyIcon />
                        </button>

                        {/* Specs Toggle */}
                        <button 
                            onClick={() => setShowSpecs(!showSpecs)}
                            className="w-full flex items-center justify-between bg-black/40 hover:bg-black/60 border border-white/10 px-4 py-3 rounded-xl text-sm text-gray-300 transition-all mb-4"
                        >
                            <div className="flex items-center gap-2">
                                <HardwareIcon />
                                <span className="font-semibold">My Setup</span>
                            </div>
                            <span className={`transform transition-transform duration-300 ${showSpecs ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showSpecs ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-xs space-y-2 font-mono text-gray-400">
                                <div className="flex justify-between"><span className="text-white">CPU</span> <span>AMD Ryzen 7 7700x</span></div>
                                <div className="flex justify-between"><span className="text-white">GPU</span> <span>NVIDIA Zotac RTX 3070 8GB White</span></div>
                                <div className="flex justify-between"><span className="text-white">RAM</span> <span>Corsair Vengeance RGB DDR5 5200mhz DDR5 64GB</span></div>
                                <div className="flex justify-between"><span className="text-white">Motherboard</span> <span>MSI Gaming Plus X670e AM5</span></div>
                                <div className="flex justify-between"><span className="text-white">Case</span> <span>Armageddon Ruby B V Pink ATX</span></div>
                            </div>
                        </div>

                        {/* Navigation Buttons - Pushed to bottom */}
                        <div className="mt-auto grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
                            <button 
                                onClick={() => toggleTab('about')} 
                                className={`
                                    rounded-xl py-3 flex flex-col items-center gap-1 transition-all duration-300 group
                                    ${activeTab === 'about' 
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                                        : 'bg-white/5 hover:bg-brand-primary/20 border border-white/5 hover:border-brand-primary/50 text-gray-400 hover:text-white'}
                                `}
                            >
                                <InfoIcon />
                                <span className="text-xs font-medium">About</span>
                            </button>
                            <button 
                                onClick={() => toggleTab('contact')} 
                                className={`
                                    rounded-xl py-3 flex flex-col items-center gap-1 transition-all duration-300 group
                                    ${activeTab === 'contact' 
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                                        : 'bg-white/5 hover:bg-brand-primary/20 border border-white/5 hover:border-brand-primary/50 text-gray-400 hover:text-white'}
                                `}
                            >
                                <MailIcon />
                                <span className="text-xs font-medium">Contact</span>
                            </button>
                            <button 
                                onClick={() => toggleTab('credits')} 
                                className={`
                                    rounded-xl py-3 flex flex-col items-center gap-1 transition-all duration-300 group
                                    ${activeTab === 'credits' 
                                        ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' 
                                        : 'bg-white/5 hover:bg-brand-primary/20 border border-white/5 hover:border-brand-primary/50 text-gray-400 hover:text-white'}
                                `}
                            >
                                <StarIcon />
                                <span className="text-xs font-medium">Credits</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL: Content Area */}
                <div 
                    className={`
                        relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black/40 md:border-l border-white/10
                        ${activeTab ? 'opacity-100 max-h-[800px] md:max-h-none flex-1' : 'opacity-0 max-h-0 md:max-h-full md:w-0'}
                    `}
                >
                    <div className="h-full w-full absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        <div className="flex justify-between items-start mb-6 sticky top-0 z-20 bg-transparent">
                            <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                                {activeTab === 'about' && <span className="text-brand-primary">About Me</span>}
                                {activeTab === 'contact' && <span className="text-brand-primary">Contact</span>}
                                {activeTab === 'credits' && <span className="text-brand-primary">Credits</span>}
                            </h2>
                            <button 
                                onClick={() => setActiveTab(null)} 
                                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:text-brand-primary transition-all duration-300 transform hover:rotate-90"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10" key={activeTab || 'empty'}>
                            {activeTab === 'about' && (
                                <div className="text-gray-300 leading-relaxed space-y-4 text-sm md:text-base">
                                    <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                        <p className="text-gray-300">put introduction here</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-brand-primary/20 to-black/40 p-6 rounded-xl border border-brand-primary/30 relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-colors"></div>
                                        <h3 className="text-white font-bold text-xl mb-2">Business Inquiries</h3>
                                        <p className="text-sm text-gray-300 mb-4">For sponsorships, collaborations, and other professional matters.</p>
                                        
                                        <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                                            <span className="text-white font-mono text-sm truncate mr-2">business email here</span>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText('business email here'); triggerToast("Copied email to clipboard!"); }}
                                                className="text-brand-primary hover:text-white transition-colors p-1"
                                                title="Copy Email"
                                            >
                                                <CopyIcon />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                                        <h3 className="text-white font-bold text-lg mb-2">Community Support</h3>
                                        <p className="text-sm text-gray-400">
                                            The best way to reach me for non-business stuff, suggestions, or just to say hi is through the <a href="https://discord.gg/urnisa" className="text-brand-primary hover:underline">Discord server</a> or on <a href="https://x.com/urnisa__" className="text-brand-primary hover:underline">X</a>!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'credits' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-brand-primary/30">R</div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Rimu</h4>
                                            <p className="text-sm text-gray-400">Website Developer</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-purple-600/30">A</div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">ArtistName</h4>
                                            <p className="text-sm text-gray-400">Stream Overlays & Emotes</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/30">M</div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Moderators</h4>
                                            <p className="text-sm text-gray-400">Keeping the chat clean & cozy</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                                        <p className="text-gray-500 text-xs">
                                            Built with React, Tailwind, and Vite <br/>
                                            © {new Date().getFullYear()} Urnisa. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Footer text */}
            <div className="mt-6 text-xs text-gray-600 font-mono animate-in fade-in delay-500 duration-1000">
                EST. 2023 • URNISA
            </div>
        </div>
    );
};

export default About;
