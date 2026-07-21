import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import UserProfile from '../components/UserProfile';
import { CardData, LAMB_POOL, WAGYU_POOL } from '../data/gachaPoolsDev';


// --- TYPES ---
type CrateType = 'lamb' | 'steak' | null;
type GameStage = 'selection' | 'opening' | 'finished';

// --- CACHE ---
const clientImageCache = new Map<string, boolean>();

// --- COMPONENTS ---
const CrateItem: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    let rarityColor = "#b0c3d9"; // Common (Consumer grade / Mil-Spec)

    if (card.rarity === 'Uncommon') {
        rarityColor = "#5e98d9"; // Restricted
    } else if (card.rarity === 'Rare') {
        rarityColor = "#4b69ff"; // Classified
    } else if (card.rarity === 'Ultra-Rare') {
        rarityColor = "#8847ff"; // Covert
    } else if (card.rarity === 'Legendary') {
        rarityColor = "#d32ce6"; // Contraband / Exceedingly Rare
    } else if (card.rarity === 'Mythical') {
        rarityColor = "#eb4b4b"; // Extraordinary
    }

    const [imgSrc, setImgSrc] = useState<string>("");

    const getFormattedName = (name: string) => {
        return name.toLowerCase()
            .replace(/[.']/g, '')
            .replace(/♀/g, '-f')
            .replace(/♂/g, '-m')
            .replace(/\s+/g, '-');
    };

    useEffect(() => {
        const verifyImage = async () => {
            if (card.image) {
                setImgSrc(card.image);
                return;
            }

            const cobbleName = getFormattedName(card.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`;

            if (clientImageCache.has(primaryUrl)) {
                const isValid = clientImageCache.get(primaryUrl);
                setImgSrc(isValid ? primaryUrl : fallback3d);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();
                clientImageCache.set(primaryUrl, data.valid);

                if (data.valid) {
                    setImgSrc(primaryUrl);
                } else {
                    setImgSrc(fallback3d);
                }
            } catch (error) {
                setImgSrc(fallback3d);
            }
        };

        verifyImage();
    }, [card]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`);
        } else if (imgSrc.includes('official-artwork')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(card.name)}`);
        }
    };

        return (
        <div className={`relative flex flex-col bg-gradient-to-b from-[#333] to-[#1a1a1a] border-b-[6px] ${className} overflow-hidden rounded-sm`} 
             style={{ 
                 borderBottomColor: rarityColor,
                 boxShadow: `inset 0 0 60px -20px ${rarityColor}40, 0 0 20px -5px ${rarityColor}30`
             }}>
            <div className="absolute top-0 right-0 p-2 text-[10px] font-bold text-white/40 uppercase font-mono tracking-widest z-10">{card.subType}</div>
            
            <div className="flex-1 p-4 pb-2 flex items-center justify-center min-h-0 relative z-0">
                <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at center, ${rarityColor} 0%, transparent 70%)` }}></div>
                <img 
                    src={imgSrc} 
                    alt={card.name} 
                    className="w-full h-full object-contain filter z-10 transition-transform duration-300 hover:scale-110" 
                    style={{ filter: `drop-shadow(0 0 15px ${rarityColor}80)` }}
                    onError={handleImageError}
                />
            </div>

            <div className="p-2 bg-black/60 flex flex-col text-left z-10 border-t border-white/5 relative">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `linear-gradient(to top, ${rarityColor}, transparent)` }}></div>
                <span className="text-[10px] uppercase font-bold tracking-wider mb-0.5" style={{ color: rarityColor, textShadow: `0 0 10px ${rarityColor}` }}>{card.rarity}</span>
                <span className="text-sm font-bold text-white truncate drop-shadow-md">{card.name}</span>
            </div>
        </div>
    );
};

const Spinner: React.FC<{ items: CardData[], winningIndex: number, isSpinning: boolean, onFinish: () => void }> = ({ items, winningIndex, isSpinning, onFinish }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (isSpinning && trackRef.current && containerRef.current) {
            const itemWidth = 208 + 8; // w-[208px] + gap-2
            const containerCenter = containerRef.current.clientWidth / 2;
            
            // Random offset within the winning card to make it look natural
            const randomOffset = Math.random() * (itemWidth - 40) - (itemWidth - 40) / 2;
            
            const finalTranslation = -(winningIndex * itemWidth) + containerCenter - (itemWidth / 2) + randomOffset;
            
            setOffset(finalTranslation);

            const timer = setTimeout(() => {
                onFinish();
            }, 6500); 

            return () => clearTimeout(timer);
        } else {
            setOffset(0);
        }
    }, [isSpinning, winningIndex, onFinish]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md" ref={containerRef}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <h2 className="absolute top-24 text-2xl md:text-3xl font-black uppercase tracking-widest text-white/50 animate-pulse">
                Unlocking Crate...
            </h2>
            
            <div className="relative w-full h-64 bg-[#111] border-y border-white/10 overflow-hidden shadow-2xl">
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-yellow-400 -translate-x-1/2 z-20 shadow-[0_0_15px_#facc15]"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-yellow-400 z-30 drop-shadow-md"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-yellow-400 z-30 drop-shadow-md"></div>
                
                <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-[#111] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-[#111] to-transparent z-10 pointer-events-none"></div>

                <div 
                    ref={trackRef}
                    className="absolute top-1/2 -translate-y-1/2 left-0 flex gap-2 h-48"
                    style={{
                        transform: `translateX(${offset}px)`,
                        transition: isSpinning ? 'transform 6.5s cubic-bezier(0.15, 1, 0.05, 1)' : 'none'
                    }}
                >
                    {items.map((card, i) => (
                        <div key={`${i}-${card.id}`} className="w-[208px] shrink-0 h-full">
                            <CrateItem card={card} className="w-full h-full opacity-100" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GachaDev: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedCrate, setSelectedCrate] = useState<CrateType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Spinner logic
    const [spinnerItems, setSpinnerItems] = useState<CardData[]>([]);
    const [winningCard, setWinningCard] = useState<CardData | null>(null);
    
    // Auth & Keys Logic
    const [user, setUser] = useState<any>(null);
    const [keys, setKeys] = useState({ lambKeys: 999, steakKeys: 999 });
    const [processing, setProcessing] = useState(false);

    // Fetch Keys on mount/user change
    

    // --- AUTO SAVE LOGIC ---
    const saveToInventory = async (card: CardData, crateType: CrateType) => {};

    const getRandomCard = (pool: CardData[]): CardData => {
        const totalWeight = pool.reduce((sum, item) => sum + (item.weight || 10), 0);
        let randomNum = Math.random() * totalWeight;
        for (const card of pool) {
            const weight = card.weight || 10;
            if (randomNum < weight) {
                return card;
            }
            randomNum -= weight;
        }
        return pool[0];
    };

    const generateSpinnerItems = (pool: CardData[], winningItem: CardData): CardData[] => {
        const items: CardData[] = [];
        // Generate 60 items
        for (let i = 0; i < 60; i++) {
            if (i === 50) {
                items.push(winningItem);
            } else {
                items.push(getRandomCard(pool));
            }
        }
        return items;
    };

    const handleOpenCrate = async (type: CrateType) => {
        if (!type) return;
        setProcessing(true);
        setTimeout(() => {
            if (type === 'lamb') setKeys(k => ({ ...k, lambKeys: k.lambKeys - 1 }));
            else setKeys(k => ({ ...k, steakKeys: k.steakKeys - 1 }));

            setSelectedCrate(type);
            const pool = type === 'lamb' ? LAMB_POOL : WAGYU_POOL;
            setCurrentPool(pool);
            
            const winner = getRandomCard(pool);
            setWinningCard(winner);
            setSpinnerItems(generateSpinnerItems(pool, winner));
            
            setStage('opening');
            setProcessing(false);
        }, 100);
    };

    const handleFinishOpening = () => {
        if (winningCard && selectedCrate) {
            saveToInventory(winningCard, selectedCrate);
            setTimeout(() => {
                setStage('finished');
            }, 1500); // Wait a bit before showing result screen
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedCrate(null);
        setCurrentPool([]);
        setSpinnerItems([]);
        setWinningCard(null);
    };

    return (
        <div className="min-h-screen py-4 font-sans text-white relative overflow-hidden select-none">
            {/* CSS & Backgrounds */}
            <style>{`
                .foil-holo {
                    background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%);
                    background-size: 200% 200%;
                    animation: holoSheen 3s infinite linear;
                }
                .mythic-holo {
                    background: linear-gradient(115deg, transparent 20%, rgba(255,0,255,0.3) 40%, rgba(0,255,255,0.3) 60%, transparent 80%);
                    background-size: 200% 200%;
                    animation: holoSheen 2s infinite linear alternate;
                }
                @keyframes holoSheen {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 200%; }
                }
                .crate-float {
                    animation: crateFloat 4s ease-in-out infinite;
                }
                @keyframes crateFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

            <div className="relative z-20 container mx-auto px-4 pt-12 pb-2 flex flex-col items-start gap-4">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="5" y1="12" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back to Dashboard
                </Link>

                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="bg-black/60 backdrop-blur-md border border-amber-800/50 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group">
                        <div className="bg-amber-900/30 p-2 rounded-full flex items-center justify-center border border-amber-800/30 text-amber-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#92400e" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest leading-tight">Lamb Keys</div>
                            <div className="text-lg font-black text-white leading-none">{keys.lambKeys}</div>
                        </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md border border-[#d7485c]/40 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group">
                        <div className="bg-[#7a2034]/40 p-2 rounded-full flex items-center justify-center border border-[#fbbf24]/20 text-[#fbbf24]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="url(#steakKeyGrad18)" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="steakKeyGrad18" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7a2034"/><stop offset="50%" stopColor="#fb7185"/><stop offset="100%" stopColor="#9f1239"/></linearGradient></defs><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest leading-tight">Steak Keys</div>
                            <div className="text-lg font-black text-white leading-none">{keys.steakKeys}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh] py-4 md:py-8">
                <div className="w-full max-w-6xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                    {stage === 'selection' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8 relative z-10 p-8">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                                GACHA <span className="text-brand-primary">CRATES</span>
                            </h1>
                            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                                Use your keys to unlock crates and discover rare Pokemon!
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-2 md:px-12 max-w-5xl mx-auto">
                                {/* LAMB CRATE */}
                                <div className="flex flex-col items-center p-8 bg-gradient-to-b from-amber-900/20 to-black border border-amber-900/40 rounded-3xl shadow-xl hover:border-amber-700/60 transition-colors">
                                    <div className="w-48 h-32 mb-6 text-amber-800 crate-float drop-shadow-[0_0_15px_rgba(146,64,14,0.5)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(146,64,14,0.6)]">
    <defs>
        <linearGradient id="lambCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f"/>
            <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
        <linearGradient id="lambLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b45309"/>
            <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <clipPath id="lambLockClip">
            <circle cx="75" cy="67" r="15"/>
        </clipPath>
    </defs>
    
    {/* Main Box */}
    <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#lambCrateGrad)" stroke="#020617" strokeWidth="2"/>
    {/* Top Lid Angle */}
    <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#lambLidGrad)" stroke="#020617" strokeWidth="2"/>
    
    {/* Case Details / Texture */}
    <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
    
    {/* Vertical Straps */}
    <rect x="35" y="15" width="16" height="75" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
    <rect x="99" y="15" width="16" height="75" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
    
    {/* Horizontal Strap */}
    <rect x="10" y="60" width="130" height="12" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
    
    {/* Rivets */}
    <circle cx="43" cy="22" r="2" fill="#d97706"/>
    <circle cx="43" cy="40" r="2" fill="#d97706"/>
    <circle cx="43" cy="66" r="2" fill="#d97706"/>
    <circle cx="43" cy="83" r="2" fill="#d97706"/>
    
    <circle cx="107" cy="22" r="2" fill="#d97706"/>
    <circle cx="107" cy="40" r="2" fill="#d97706"/>
    <circle cx="107" cy="66" r="2" fill="#d97706"/>
    <circle cx="107" cy="83" r="2" fill="#d97706"/>

                {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#0f172a" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Lamb Chop Image */}
    <image href="/lambc.png" x="55" y="47" width="40" height="40" clipPath="url(#lambLockClip)" />
</svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Lamb Crate</h2>
                                    <p className="text-amber-200/80 text-sm text-center mb-8 h-10">Contains Legendary Beasts and other rare Pokemon</p>
                                    
                                    <button 
                                        onClick={() => handleOpenCrate('lamb')}
                                        disabled={processing}
                                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                            keys.lambKeys > 0 
                                                ? 'bg-amber-900 hover:bg-amber-800 text-white shadow-[0_0_20px_rgba(120,53,15,0.6)] hover:shadow-[0_0_30px_rgba(146,64,14,0.8)] hover:scale-105' 
                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {keys.lambKeys > 0 ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#92400e" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#374151" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#4b5563" stroke="none" /></svg>}
                                        {keys.lambKeys > 0 ? 'Unlock Crate' : 'Requires Lamb Key'}
                                    </button>
                                </div>

                                {/* STEAK CRATE */}
                                <div className="flex flex-col items-center p-8 bg-gradient-to-b from-[#7a2034]/20 to-black border border-[#d7485c]/20 rounded-3xl shadow-xl hover:border-[#fbbf24]/50 transition-colors">
                                    <div className="w-48 h-32 mb-6 text-[#fbbf24] crate-float drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.4)]">
    <defs>
        <linearGradient id="steakCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a2034"/>
            <stop offset="100%" stopColor="#421019"/>
        </linearGradient>
        <linearGradient id="steakLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7485c"/>
            <stop offset="50%" stopColor="#e37b88"/>
            <stop offset="100%" stopColor="#7a2034"/>
        </linearGradient>
        <clipPath id="steakLockClip">
            <circle cx="75" cy="67" r="15"/>
        </clipPath>
    </defs>
    
    {/* Main Box */}
    <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#steakCrateGrad)" stroke="#020617" strokeWidth="2"/>
    {/* Top Lid Angle */}
    <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#steakLidGrad)" stroke="#020617" strokeWidth="2"/>
    
    {/* Case Details / Texture */}
    <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
    
    {/* Vertical Straps */}
    <rect x="35" y="15" width="16" height="75" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
    <rect x="99" y="15" width="16" height="75" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
    
    {/* Horizontal Strap */}
    <rect x="10" y="60" width="130" height="12" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
    
    {/* Rivets */}
    <circle cx="43" cy="22" r="2" fill="#fbbf24"/>
    <circle cx="43" cy="40" r="2" fill="#fbbf24"/>
    <circle cx="43" cy="66" r="2" fill="#fbbf24"/>
    <circle cx="43" cy="83" r="2" fill="#fbbf24"/>
    
    <circle cx="107" cy="22" r="2" fill="#fbbf24"/>
    <circle cx="107" cy="40" r="2" fill="#fbbf24"/>
    <circle cx="107" cy="66" r="2" fill="#fbbf24"/>
    <circle cx="107" cy="83" r="2" fill="#fbbf24"/>

        {/* Lock / Keyhole Area */}
    <circle cx="75" cy="67" r="18" fill="#1c1917" stroke="#020617" strokeWidth="2"/>
    <circle cx="75" cy="67" r="15" fill="#020617"/>
    
    {/* Glowing Steak Image */}
    <image href="/steak.png" x="55" y="47" width="40" height="40" clipPath="url(#steakLockClip)" />
</svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Steak Crate</h2>
                                    <p className="text-[#fbbf24]/80 text-sm text-center mb-8 h-10">Contains Mythical Celebi and other premium drops</p>
                                    
                                    <button 
                                        onClick={() => handleOpenCrate('steak')}
                                        disabled={processing}
                                        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                                            keys.steakKeys > 0 
                                                ? 'bg-gradient-to-r from-[#7a2034] to-[#d7485c] hover:from-[#d7485c] hover:to-[#fbbf24] text-white shadow-[0_0_20px_rgba(215,72,92,0.5)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] hover:scale-105' 
                                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {keys.steakKeys > 0 ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="url(#steakKeyGrad20)" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="steakKeyGrad20" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7a2034"/><stop offset="50%" stopColor="#fb7185"/><stop offset="100%" stopColor="#9f1239"/></linearGradient></defs><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#374151" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#4b5563" stroke="none" /></svg>}
                                        {keys.steakKeys > 0 ? 'Unlock Crate' : 'Requires Steak Key'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                                    </div>
            </div>
            
            {/* RENDER FULLSCREEN ANIMATIONS OUTSIDE OF THE CONSTRAINED CONTAINER */}
            {stage === 'opening' && (
                <Spinner 
                    items={spinnerItems} 
                    winningIndex={50} 
                    isSpinning={true} 
                    onFinish={handleFinishOpening} 
                />
            )}

            {stage === 'finished' && winningCard && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in zoom-in-95 duration-500 p-8">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-brand-primary mb-12 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] z-10 relative">
                        You Received!
                    </h2>
                    
                    <div className="w-64 md:w-80 h-80 z-10 relative">
                        <CrateItem card={winningCard} className="w-full h-full shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-in slide-in-from-bottom-12 duration-700" />
                    </div>

                    <button 
                        onClick={resetGame}
                        className="mt-12 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors shadow-xl hover:scale-105 z-10 relative"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

export default GachaDev;
