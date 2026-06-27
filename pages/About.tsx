
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProfileContent } from '../hooks/useProfileContent';
import OptimizedImage from '../components/OptimizedImage';
import TwitchEmbed from '../components/TwitchEmbed';
import { TWITCH_CHANNEL_NAME, DISCORD_SERVER_ID } from '../constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useSchedule } from '../hooks/useSchedule';
import DiscordWidget from '../components/DiscordWidget';

// Assets
const PROFILE_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764677430/urnisapfp2_l3a3xx.png";
const BANNER_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764647084/with_Background_z8fi2l.jpg";
const TRADEMARK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1764631493/urnisamark_qq8lso.png";

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

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const roles = ["VTuber", "Streamer", "Yapper", "Gremlin"];

type TabType = 'about' | 'contact' | 'credits' | null;

const About: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>(null);
    const { aboutContent, creditsContent, avatar } = useProfileContent();
    
    // Typewriter State
    const [text, setText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    const [showSpecs, setShowSpecs] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const rightPanelRef = React.useRef<HTMLDivElement>(null);

    // Lightbox State
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);

    // Dashboard Hooks and State
    const [twitchRef, isTwitchVisible] = useScrollAnimation<HTMLDivElement>();
    const [scheduleRef, isScheduleVisible] = useScrollAnimation<HTMLDivElement>();
    const [discordRef, isDiscordVisible] = useScrollAnimation<HTMLDivElement>();
    const { scheduleUrl } = useSchedule();
    const [hasDiscordLoaded, setHasDiscordLoaded] = useState(false);

    useEffect(() => {
        if (isDiscordVisible && !hasDiscordLoaded) {
            setHasDiscordLoaded(true);
        }
    }, [isDiscordVisible, hasDiscordLoaded]);

    const handleScrollToTwitch = () => {
        twitchRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScrollToSchedule = () => {
        scheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const currentRole = roles[loopNum % roles.length];
    const isWaiting = isDeleting && text === currentRole;

    // Typewriter Effect Logic
    useEffect(() => {
        const handleTyping = () => {
            const i = loopNum % roles.length;
            const fullText = roles[i];

            setText(isDeleting 
                ? fullText.substring(0, text.length - 1) 
                : fullText.substring(0, text.length + 1)
            );

            let speed = 150;
            if (isDeleting) speed = 75;

            if (!isDeleting && text === fullText) {
                speed = 2000;
                setIsDeleting(true);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
                speed = 500;
            }

            setTypingSpeed(speed);
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, loopNum, typingSpeed]);

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
            // On mobile, scroll to the content when a tab is opened
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    rightPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 font-sans text-white relative py-10">
            <style>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .cursor-blink::after {
                    content: '|';
                    display: inline-block;
                    margin-left: 0;
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
                
                /* Rich Text Content Styles */
                .rich-text ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .rich-text li {
                    margin-bottom: 0.25rem;
                }
                .rich-text b, .rich-text strong {
                    font-weight: bold;
                    color: white;
                }
                .rich-text i, .rich-text em {
                    font-style: italic;
                }
                .rich-text u {
                    text-decoration: underline;
                }
            `}</style>

            {/* Toast Notification */}
            <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-brand-primary text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{toastMessage}</span>
            </div>

            {/* Lightbox */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setLightboxImage(null)}
                >
                    <img 
                        src={lightboxImage} 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl select-none"
                        alt="Full size artwork"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                        className="absolute top-4 right-4 text-white/70 hover:text-brand-primary p-2 bg-black/50 rounded-full transition-colors z-50"
                        onClick={() => setLightboxImage(null)}
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}

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
                    <div 
                        className="h-32 w-full relative overflow-hidden flex-shrink-0"
                        style={{
                            maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                        }}
                    >
                        <OptimizedImage 
                            src={BANNER_IMAGE} 
                            alt="Banner" 
                            className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                            priority
                        />
                    </div>

                    <div className="px-6 pb-8 relative flex-1 flex flex-col">
                        {/* PFP Section with z-20 to ensure it sits above any background bleed */}
                        <div className="relative -mt-16 mb-4 w-fit mx-auto group z-20">
                            <div className="w-28 h-28 rounded-full p-1 bg-[#121212] relative z-10 overflow-hidden">
                                <OptimizedImage 
                                    src={avatar || PROFILE_IMAGE} 
                                    alt="PFP" 
                                    className="w-full h-full rounded-full object-cover border-2 border-brand-primary/50 group-hover:border-brand-primary transition-colors duration-300" 
                                    priority
                                />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-brand-primary/40 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                        </div>

                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-1">
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide drop-shadow-lg">URNISA</h1>
                            </div>
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-1 font-mono min-h-[1.5em]">
                                <span className={`text-brand-primary font-semibold ${isWaiting ? '' : 'cursor-blink'}`}>{text}</span>
                            </div>
                        </div>

                        <div className="bg-black/85 rounded-2xl p-4 border border-white/5 mb-4 text-center backdrop-blur-md">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                "heloo ! i'm nisa & i don't stream"
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                            {[
                                { name: 'Twitch', url: 'https://twitch.tv/urnisa_', icon: 'https://cdn.simpleicons.org/twitch/9146FF' },
                                { name: 'X', url: 'https://x.com/urnisa__', icon: 'https://cdn.simpleicons.org/x/white' },
                                { name: 'Youtube', url: 'https://www.youtube.com/@urnisa_ttv', icon: 'https://cdn.simpleicons.org/youtube/e5383b' },
                                { name: 'TikTok', url: 'https://www.tiktok.com/@urniisa', icon: 'https://cdn.simpleicons.org/tiktok/white' },
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
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button 
                                onClick={handleCopyDiscord}
                                className="w-full bg-[#5865F2]/20 hover:bg-[#5865F2]/30 border border-[#5865F2]/50 text-[#5865F2] font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(88,101,242,0.3)] text-sm"
                            >
                                <img src="https://cdn.simpleicons.org/discord/5865F2" className="w-5 h-5 flex-shrink-0" alt="Discord" />
                                <span className="truncate">@urnisa</span>
                                <CopyIcon />
                            </button>
                            <a 
                                href="https://streamelements.com/urnisa_/tip"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-400 hover:text-emerald-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm cursor-pointer"
                            >
                                <DollarIcon />
                                <span>Donate</span>
                            </a>
                        </div>

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
                            <div className="bg-black/20 rounded-xl p-4 border border-white/5 text-xs space-y-3 font-mono text-gray-400">
                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4"><span className="text-white font-bold">CPU</span> <span className="sm:text-right">AMD Ryzen 7 7700x</span></div>
                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4"><span className="text-white font-bold">GPU</span> <span className="sm:text-right">NVIDIA Zotac RTX 3070 8GB White</span></div>
                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4"><span className="text-white font-bold">RAM</span> <span className="sm:text-right">Corsair Vengeance RGB DDR5 5200mhz DDR5 64GB</span></div>
                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4"><span className="text-white font-bold">Motherboard</span> <span className="sm:text-right">MSI Gaming Plus X670e AM5</span></div>
                                <div className="flex flex-col sm:flex-row justify-between gap-1 sm:gap-4"><span className="text-white font-bold">Case</span> <span className="sm:text-right">Armageddon Ruby B V Pink ATX</span></div>
                            </div>
                        </div>

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
                    ref={rightPanelRef}
                    className={`
                        relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] bg-black/40 md:border-l border-white/10 flex flex-col
                        ${activeTab ? 'opacity-100 max-h-[1200px] md:max-h-none flex-1' : 'opacity-0 max-h-0 md:max-h-full md:w-0'}
                    `}
                >
                    <div className="h-full w-full md:absolute md:inset-0 overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="flex justify-between items-center bg-brand-secondary/60 backdrop-blur-2xl border-b border-white/10 px-6 py-4 md:px-8 md:py-5 shadow-sm">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md truncate pr-4">
                                {activeTab === 'about' && <span className="text-brand-primary">About Me</span>}
                                {activeTab === 'contact' && <span className="text-brand-primary">Contact</span>}
                                {activeTab === 'credits' && <span className="text-brand-primary">Credits</span>}
                            </h2>
                            <button 
                                onClick={() => setActiveTab(null)} 
                                className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:text-brand-primary transition-all duration-300 transform hover:rotate-90 shrink-0"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10" key={activeTab || 'empty'}>
                            {activeTab === 'about' && (
                                <div className="text-gray-300 leading-relaxed space-y-4 text-sm md:text-base">
                                    {aboutContent.map((item, index) => (
                                        <React.Fragment key={item.id}>
                                            <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                                                {item.title && <h3 className="font-bold text-white mb-2">{item.title}</h3>}
                                                {/* Rich Text Renderer */}
                                                <div 
                                                    className="rich-text text-gray-300 whitespace-pre-wrap" 
                                                    dangerouslySetInnerHTML={{ __html: item.text }} 
                                                />
                                            </div>
                                            {index === 0 && (
                                                <div className="text-center text-xs text-gray-500 font-mono py-2">
                                                    EST. 2023 • urnisa_
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-brand-primary/20 to-black/40 p-6 rounded-xl border border-brand-primary/30 relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-brand-primary/20 rounded-full blur-2xl group-hover:bg-brand-primary/30 transition-colors"></div>
                                        <h3 className="text-white font-bold text-xl mb-2">Business Inquiries</h3>
                                        <p className="text-sm text-gray-300 mb-4">For sponsorships, collaborations, and other professional matters.</p>
                                        
                                        <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
                                            <span className="text-white font-mono text-sm truncate mr-2">urniisaa@gmail.com</span>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText('urniisaa@gmail.com'); triggerToast("Copied email to clipboard!"); }}
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
                                    {creditsContent.map((credit) => {
                                        const Wrapper = credit.link ? 'a' : 'div';
                                        const wrapperProps = credit.link ? {
                                            href: credit.link,
                                            target: "_blank",
                                            rel: "noreferrer",
                                            className: "flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors cursor-pointer hover:border-brand-primary/50"
                                        } : {
                                            className: "flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors"
                                        };

                                        return (
                                            <Wrapper key={credit.id} {...wrapperProps}>
                                                <div className="w-12 h-12 flex-shrink-0">
                                                    {credit.image ? (
                                                        <OptimizedImage 
                                                            src={credit.image} 
                                                            alt={credit.name} 
                                                            className="w-full h-full rounded-full object-cover shadow-lg"
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="w-full h-full rounded-full flex items-center justify-center font-bold text-white text-xl shadow-lg"
                                                            style={{ backgroundColor: credit.color || '#e5383b' }}
                                                        >
                                                            {credit.initial || credit.name.charAt(0)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg group-hover:text-brand-primary transition-colors">{credit.name}</h4>
                                                    <p className="text-sm text-gray-400">{credit.role}</p>
                                                </div>
                                            </Wrapper>
                                        );
                                    })}
                                    
                                    {/* View Art Gallery Button */}
                                    <Link 
                                        to="/gallery"
                                        className="w-full mt-4 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/50 text-brand-primary font-bold py-4 rounded-xl transition-all duration-300 flex flex-col items-center justify-center group"
                                    >
                                        <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🎨</span>
                                        <span>View Art Gallery</span>
                                    </Link>

                                    <div className="mt-8 pt-6 border-t border-white/10 flex flex-col items-center gap-2 text-center">
                                        <p className="text-gray-500 text-xs">
                                            Built with React and Vite by Rimu<br/>
                                            © {new Date().getFullYear()} urnisa_ All rights reserved.
                                        </p>
                                        <img src={TRADEMARK_IMAGE} alt="TM" className="h-20 md:h-28 w-auto opacity-60 select-none" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            

            {/* Scroll Down Arrow moved below the About Me card */}
            <div className="text-center mt-6 md:mt-8 mb-16">
                <button
                    onClick={handleScrollToTwitch}
                    className="text-brand-primary animate-bounce transition-transform duration-200 hover:scale-110 focus:outline-none cursor-pointer"
                    aria-label="Scroll to Twitch stream"
                    title="Scroll to Twitch stream"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 md:h-20 md:w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* --- DASHBOARD CONTENT COMBINED --- */}
            <div className="w-full flex flex-col items-center text-center max-w-5xl overflow-hidden mt-8">
                {/* Twitch Section */}
                <div 
                    ref={twitchRef}
                    className={`w-full transition-all duration-1000 ease-out transform ${isTwitchVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                    style={{ scrollMarginTop: '5rem' }} // Offset for the sticky navbar
                >
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-2 text-white">
                        Welcome to the <span className="text-brand-primary">STEAK</span> House!
                    </h1>
                    <p className="text-gray-300 mb-8 max-w-2xl text-sm md:text-base mx-auto">
                        The hub for everything related to nisa. Check out the streams and enjoy your meat!
                    </p>

                    <div className="w-full mt-4 md:mt-0">
                        <div className="w-full bg-black/30 backdrop-blur-lg rounded-2xl p-1 md:p-2 border border-white/10 shadow-2xl shadow-black/40">
                            <TwitchEmbed channel={TWITCH_CHANNEL_NAME} />
                        </div>
                    </div>
                </div>

                {/* Schedule Section */}
                <div 
                    ref={scheduleRef}
                    className={`mt-8 w-full transition-all duration-1000 ease-out transform ${isScheduleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                    style={{ scrollMarginTop: '5rem' }} // Offset for the sticky navbar
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
                        Stream <span className="text-brand-primary">Schedule</span>
                    </h2>
                    <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-1 md:p-2 border border-white/10 shadow-2xl shadow-black/40">
                        <OptimizedImage
                            src={scheduleUrl}
                            alt="Urnisa's weekly stream schedule"
                            className="rounded-lg w-full h-auto aspect-video md:aspect-auto"
                            contain
                            priority
                        />
                    </div>
                </div>

                {/* Discord Section */}
                <div 
                    ref={discordRef}
                    className={`mt-16 w-full transition-all duration-1000 ease-out transform mb-16 ${isDiscordVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-white">
                        Join our <span className="text-brand-primary">Discord</span>
                    </h2>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-sm md:text-base">
                        Become a part of the STEAK House community! Join our Discord server to chat with others, get live notifications, and stay updated on all events.
                    </p>
                    {/* Keep DiscordWidget mounted once loaded to ensure smooth exit animations */}
                    {hasDiscordLoaded && <DiscordWidget serverId={DISCORD_SERVER_ID} />}
                </div>
            </div>
        </div>
    );
};

export default About;
