import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import UserProfile from '../components/UserProfile';
import { CardData, LAMB_POOL, WAGYU_POOL } from '../data/gachaPools';


// --- TYPES ---
type CrateType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'focus_crate' | 'pre_opening' | 'opening' | 'finished';

// --- CACHE ---
const clientImageCache = new Map<string, boolean>();

// --- PARSER HELPER FOR ACCURATE SPINNER TRANSFORMS ---
const parseTransformX = (transformStr: string): number => {
    if (!transformStr || transformStr === 'none') return 0;
    try {
        if (typeof window.DOMMatrix !== 'undefined') {
            return new window.DOMMatrix(transformStr).m41;
        }
        if (typeof (window as any).WebKitCSSMatrix !== 'undefined') {
            return new (window as any).WebKitCSSMatrix(transformStr).m41;
        }
        const matrixValues = transformStr.match(/matrix.*\((.+)\)/);
        if (matrixValues && matrixValues[1]) {
            const values = matrixValues[1].split(', ');
            if (values.length === 6) {
                return parseFloat(values[4]);
            } else if (values.length === 16) {
                return parseFloat(values[12]);
            }
        }
    } catch (e) {}
    return 0;
};

// --- WEB AUDIO API SYNTHESIZER ---
let sharedAudioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
    try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!sharedAudioCtx) {
            sharedAudioCtx = new AudioContextClass();
        }
        if (sharedAudioCtx.state === 'suspended') {
            sharedAudioCtx.resume().catch(() => {});
        }
        return sharedAudioCtx;
    } catch (e) {
        return null;
    }
};

if (typeof window !== 'undefined') {
    const resumeAudio = () => {
        const ctx = getAudioContext();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }
    };
    window.addEventListener('click', resumeAudio, { once: true });
    window.addEventListener('touchstart', resumeAudio, { once: true });
}

const playTick = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // High frequency plastic/wood click component
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(2200, now);
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.006);
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.006);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(now + 0.008);

        // Tight low-frequency mechanical thud component
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(140, now);
        osc2.frequency.exponentialRampToValueAtTime(35, now + 0.015);
        gain2.gain.setValueAtTime(0.18, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start();
        osc2.stop(now + 0.018);
    } catch (e) {}
};

const playOpen = () => {
    // Removed crate opening sound effect
};

const playReveal = (rarity: string) => {
    // Removed reward reveal sound effect
};

// --- COMPONENTS ---


const LambCrateSVG: React.FC<{ stage: string; selectedCrate: string | null }> = ({ stage, selectedCrate }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(146,64,14,0.6)] relative z-10">
    <defs>
        <linearGradient id="lambCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#78350f"/>
            <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
        <linearGradient id="lambLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b45309"/>
            <stop offset="100%" stopColor="#78350f"/>
        </linearGradient>
        <linearGradient id="lambLockPlateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="50%" stopColor="#b45309"/>
            <stop offset="100%" stopColor="#451a03"/>
        </linearGradient>
    </defs>
    
    <g>
        {/* Main Box */}
        <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#lambCrateGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Case Details / Texture */}
        <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
        {/* Vertical Straps */}
        <rect x="35" y="35" width="16" height="55" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="35" width="16" height="55" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Horizontal Strap */}
        <rect x="10" y="60" width="130" height="12" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Rivets */}
        <circle cx="43" cy="40" r="2" fill="#d97706"/>
        <circle cx="43" cy="66" r="2" fill="#d97706"/>
        <circle cx="43" cy="83" r="2" fill="#d97706"/>
        <circle cx="107" cy="40" r="2" fill="#d97706"/>
        <circle cx="107" cy="66" r="2" fill="#d97706"/>
        <circle cx="107" cy="83" r="2" fill="#d97706"/>
    </g>

    {/* Lid Group */}
    <g className={stage === 'pre_opening' && selectedCrate === 'lamb' ? 'lid-opening' : ''} style={{ transformOrigin: '75px 25px' }}>
        {/* Top Lid Angle */}
        <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#lambLidGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Vertical Straps (Lid Part) */}
        <rect x="35" y="15" width="16" height="20" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="15" width="16" height="20" fill="#361704" stroke="#020617" strokeWidth="1.5"/>
        {/* Lid Rivets */}
        <circle cx="43" cy="22" r="2" fill="#d97706"/>
        <circle cx="107" cy="22" r="2" fill="#d97706"/>
    </g>

    {/* Lock / Keyhole Area */}
    <g className={stage === 'pre_opening' && selectedCrate === 'lamb' ? 'lock-popping' : ''} style={{ transformOrigin: '75px 67px' }}>
        {/* Outer Heavy Lock Plate */}
        <rect x="56" y="50" width="38" height="34" rx="6" fill="url(#lambLockPlateGrad)" stroke="#09090b" strokeWidth="2"/>
        <rect x="58" y="52" width="34" height="30" rx="4" fill="none" stroke="#fcd34d" strokeWidth="0.8" opacity="0.6"/>
        
        {/* Lock Plate Screws */}
        <circle cx="60" cy="54" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="90" cy="54" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="60" cy="80" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>
        <circle cx="90" cy="80" r="1.3" fill="#1e1b18" stroke="#d97706" strokeWidth="0.5"/>

        {/* Circular Keyhole Escutcheon */}
        <circle cx="75" cy="67" r="11" fill="#180e05" stroke="#f59e0b" strokeWidth="1.5"/>

        {/* Keyhole Cutout */}
        <path d="M75 61.5 a3.5 3.5 0 0 1 2.5 6 L78 72.5 H72 L72.5 67.5 A3.5 3.5 0 0 1 75 61.5 Z" fill="#020617" stroke="#451a03" strokeWidth="0.8"/>
        {/* Inner Void */}
        <path d="M75 62.5 a2.5 2.5 0 0 1 1.8 4.2 L77.2 71.5 H72.8 L73.2 66.7 A2.5 2.5 0 0 1 75 62.5 Z" fill="#000000"/>
    </g>
</svg>
);

const WagyuCrateSVG: React.FC<{ stage: string; selectedCrate: string | null }> = ({ stage, selectedCrate }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" className="w-full h-full drop-shadow-[0_0_25px_rgba(251,191,36,0.4)] relative z-10">
    <defs>
        <linearGradient id="wagyuCrateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a2034"/>
            <stop offset="100%" stopColor="#421019"/>
        </linearGradient>
        <linearGradient id="wagyuLidGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d7485c"/>
            <stop offset="50%" stopColor="#e37b88"/>
            <stop offset="100%" stopColor="#7a2034"/>
        </linearGradient>
        <linearGradient id="wagyuLockPlateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a"/>
            <stop offset="35%" stopColor="#fb7185"/>
            <stop offset="70%" stopColor="#9f1239"/>
            <stop offset="100%" stopColor="#4c0519"/>
        </linearGradient>
    </defs>
    
    <g>
        {/* Main Box */}
        <rect x="10" y="35" width="130" height="55" rx="4" fill="url(#wagyuCrateGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Case Details / Texture */}
        <path d="M15 45 L135 45 M15 60 L135 60 M15 75 L135 75" stroke="#000" strokeWidth="1" opacity="0.3"/>
        {/* Vertical Straps */}
        <rect x="35" y="35" width="16" height="55" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="35" width="16" height="55" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Horizontal Strap */}
        <rect x="10" y="60" width="130" height="12" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Rivets */}
        <circle cx="43" cy="40" r="2" fill="#fbbf24"/>
        <circle cx="43" cy="66" r="2" fill="#fbbf24"/>
        <circle cx="43" cy="83" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="40" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="66" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="83" r="2" fill="#fbbf24"/>
    </g>

    {/* Lid Group */}
    <g className={stage === 'pre_opening' && selectedCrate === 'wagyu' ? 'lid-opening' : ''} style={{ transformOrigin: '75px 25px' }}>
        {/* Top Lid Angle */}
        <path d="M10 35 L25 15 L125 15 L140 35 Z" fill="url(#wagyuLidGrad)" stroke="#020617" strokeWidth="2"/>
        {/* Vertical Straps (Lid Part) */}
        <rect x="35" y="15" width="16" height="20" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        <rect x="99" y="15" width="16" height="20" fill="#2a1114" stroke="#020617" strokeWidth="1.5"/>
        {/* Lid Rivets */}
        <circle cx="43" cy="22" r="2" fill="#fbbf24"/>
        <circle cx="107" cy="22" r="2" fill="#fbbf24"/>
    </g>

    {/* Lock / Keyhole Area */}
    <g className={stage === 'pre_opening' && selectedCrate === 'wagyu' ? 'lock-popping' : ''} style={{ transformOrigin: '75px 67px' }}>
        {/* Outer Heavy Lock Plate */}
        <rect x="56" y="50" width="38" height="34" rx="6" fill="url(#wagyuLockPlateGrad)" stroke="#09090b" strokeWidth="2"/>
        <rect x="58" y="52" width="34" height="30" rx="4" fill="none" stroke="#fef08a" strokeWidth="0.8" opacity="0.6"/>
        
        {/* Lock Plate Screws */}
        <circle cx="60" cy="54" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="90" cy="54" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="60" cy="80" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>
        <circle cx="90" cy="80" r="1.3" fill="#1c0a10" stroke="#fbbf24" strokeWidth="0.5"/>

        {/* Circular Keyhole Escutcheon */}
        <circle cx="75" cy="67" r="11" fill="#1c0a10" stroke="#fb7185" strokeWidth="1.5"/>

        {/* Keyhole Cutout */}
        <path d="M75 61.5 a3.5 3.5 0 0 1 2.5 6 L78 72.5 H72 L72.5 67.5 A3.5 3.5 0 0 1 75 61.5 Z" fill="#020617" stroke="#9f1239" strokeWidth="0.8"/>
        {/* Inner Void */}
        <path d="M75 62.5 a2.5 2.5 0 0 1 1.8 4.2 L77.2 71.5 H72.8 L73.2 66.7 A2.5 2.5 0 0 1 75 62.5 Z" fill="#000000"/>
    </g>
</svg>
);
const CrateItem: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    let rarityColor = "#9ca3af"; // Common (Grey)

    if (card.rarity === 'Uncommon') {
        rarityColor = "#22c55e"; // Uncommon (Green)
    } else if (card.rarity === 'Rare') {
        rarityColor = "#3b82f6"; // Rare (Blue)
    } else if (card.rarity === 'Ultra-Rare') {
        rarityColor = "#a855f7"; // Ultra-Rare (Purple)
    } else if (card.rarity === 'Legendary') {
        rarityColor = "#eab308"; // Legendary (Yellow Gold)
    } else if (card.rarity === 'Mythical') {
        rarityColor = "#fb7185"; // Mythical (Light Red Pink)
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
                    style={{ filter: `drop-shadow(0 0 15px ${rarityColor}80)`, imageRendering: 'pixelated' }}
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
    const lastIndexRef = useRef<number>(-1);

    useEffect(() => {
        if (isSpinning && trackRef.current && containerRef.current) {
            const cardWidth = 208;
            const gap = 8;
            const itemWidth = cardWidth + gap; // 216px total slot width
            const containerCenter = containerRef.current.clientWidth / 2;
            
            // Subtle, premium organic offset within the card boundaries (-45px to +45px)
            const randomOffset = (Math.random() - 0.5) * 90;
            
            // Math for exact centering:
            // Shift left past preceding slots, add containerCenter to point to the screen center, 
            // then subtract half of cardWidth to center the target card directly on the pointer.
            const finalTranslation = -(winningIndex * itemWidth) + containerCenter - (cardWidth / 2) + randomOffset;
            
            setOffset(finalTranslation);

            const timer = setTimeout(() => {
                onFinish();
            }, 6500); 

            return () => clearTimeout(timer);
        } else {
            setOffset(0);
        }
    }, [isSpinning, winningIndex, onFinish]);

    useEffect(() => {
        if (!isSpinning) {
            lastIndexRef.current = -1;
            return;
        }

        let animationFrameId: number;
        
        const checkTick = () => {
            if (trackRef.current && containerRef.current) {
                try {
                    const style = window.getComputedStyle(trackRef.current);
                    const transform = style.transform;
                    if (transform && transform !== 'none') {
                        const currentX = parseTransformX(transform);
                        
                        const cardWidth = 208;
                        const gap = 8;
                        const itemWidth = cardWidth + gap;
                        const containerCenter = containerRef.current.clientWidth / 2;
                        
                        // Centering logic matches pointer exactly:
                        const relativeCenter = containerCenter - currentX;
                        const currentIndex = Math.floor(relativeCenter / itemWidth);
                        
                        if (currentIndex !== lastIndexRef.current && currentIndex >= 0 && currentIndex < items.length) {
                            lastIndexRef.current = currentIndex;
                            playTick();
                        }
                    }
                } catch (e) {}
            }
            animationFrameId = requestAnimationFrame(checkTick);
        };

        animationFrameId = requestAnimationFrame(checkTick);
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isSpinning, items.length]);

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md" ref={containerRef}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="relative w-full h-64 bg-gradient-to-r from-[#0d0d0d] via-[#151515] to-[#0d0d0d] border-y-2 border-white/10 overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,0,0,0.6)]">
                {/* Tech grid overlay background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                
                {/* Center glowing volume block behind items */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[208px] bg-yellow-500/5 blur-[24px] pointer-events-none z-0"></div>
                
                {/* Side Fade Shrouds - Premium dark overlay gradients that obscure incoming cards */}
                <div className="absolute inset-y-0 left-0 w-24 md:w-64 bg-gradient-to-r from-black via-black/85 to-transparent z-20 pointer-events-none"></div>
                <div className="absolute inset-y-0 right-0 w-24 md:w-64 bg-gradient-to-l from-black via-black/85 to-transparent z-20 pointer-events-none"></div>

                {/* Center simple yellow golden line indicator like CS:GO */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-amber-500 z-30 shadow-[0_0_10px_rgba(245,158,11,0.6)] pointer-events-none">
                    {/* Top Triangle */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent border-t-amber-500" />
                    {/* Bottom Triangle */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-amber-500" />
                </div>

                <div 
                    ref={trackRef}
                    className="absolute top-1/2 left-0 flex gap-2 h-48"
                    style={{
                        transform: `translateY(-50%) translateX(${offset}px)`,
                        transition: isSpinning ? 'transform 6.5s cubic-bezier(0.12, 0.9, 0.08, 1)' : 'none'
                    }}
                >
                    {items.map((card, i) => (
                        <div key={`${i}-${card.id}`} className="w-[208px] shrink-0 h-full flex items-center justify-center">
                            <CrateItem card={card} className="w-full h-full opacity-100 shadow-xl transition-transform duration-300 hover:scale-102" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Gacha: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedCrate, setSelectedCrate] = useState<CrateType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Spinner logic
    const [spinnerItems, setSpinnerItems] = useState<CardData[]>([]);
    const [winningCard, setWinningCard] = useState<CardData | null>(null);
    
    // Auth & Keys Logic
    const [user, setUser] = useState<any>(null);
    const [keys, setKeys] = useState({ lambKeys: 0, wagyuKeys: 0 });
    const [processing, setProcessing] = useState(false);

    // Interactive Key Dragging State
    const [keyDragPos, setKeyDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDraggingKey, setIsDraggingKey] = useState(false);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Interactive Key Dragging Handlers
    useEffect(() => {
        if (stage !== 'focus_crate') {
            setKeyDragPos({ x: 0, y: 0 });
            setIsDraggingKey(false);
            setIsOverDropZone(false);
        }
    }, [stage]);

    const handleKeyPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault();
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch (err) {}
        setIsDraggingKey(true);
        dragStartRef.current = { x: e.clientX - keyDragPos.x, y: e.clientY - keyDragPos.y };
    };

    const handleKeyPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingKey) return;
        const newX = e.clientX - dragStartRef.current.x;
        const newY = e.clientY - dragStartRef.current.y;
        setKeyDragPos({ x: newX, y: newY });

        if (dropZoneRef.current) {
            const rect = dropZoneRef.current.getBoundingClientRect();
            const over = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            setIsOverDropZone(over);
        }
    };

    const handleKeyPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingKey) return;
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {}
        setIsDraggingKey(false);

        if (dropZoneRef.current) {
            const rect = dropZoneRef.current.getBoundingClientRect();
            const over = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
            if (over && selectedCrate) {
                handleOpenCrate(selectedCrate);
                setIsOverDropZone(false);
                setKeyDragPos({ x: 0, y: 0 });
                return;
            }
        }
        setKeyDragPos({ x: 0, y: 0 });
        setIsOverDropZone(false);
    };

    // Fetch Keys on mount/user change (Live database)
    useEffect(() => {
        if (!user?.id) {
            setKeys({ lambKeys: 0, wagyuKeys: 0 });
            return;
        }

        const fetchKeys = async () => {
            try {
                const response = await fetch(`${DISCORD_API_URL}/api/packs?discordId=${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setKeys({
                        lambKeys: data.lambKeys ?? 0,
                        wagyuKeys: data.wagyuKeys ?? data.steakKeys ?? 0
                    });
                }
            } catch (err) {
                console.error("Failed to fetch pack keys balance:", err);
            }
        };

        fetchKeys();
    }, [user]);

    useEffect(() => {
        if (stage === 'pre_opening') {
            const timer = setTimeout(() => {
                setStage('opening');
            }, 2500); // 2.5s animation duration
            return () => clearTimeout(timer);
        }
    }, [stage]);

    // --- AUTO SAVE LOGIC ---
    const saveToInventory = async (card: CardData, crateType: CrateType) => {
        if (!user?.id) return;
        try {
            await fetch(`${DISCORD_API_URL}/api/inventory/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    items: [card], // Just one item from CSGO crates
                    packType: crateType
                })
            });
        } catch (e) {
            console.error("Auto-save failed", e);
        }
    };

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
        const chaseItemIds = [40001, 40051];
        
        const chaseItem = pool.find(item => chaseItemIds.includes(item.id));
        const regularPool = pool.filter(item => !chaseItemIds.includes(item.id));

        // Generate 60 items
        for (let i = 0; i < 60; i++) {
            if (i === 50) {
                items.push(winningItem);
            } else {
                items.push(getRandomCard(regularPool));
            }
        }

        if (chaseItem && !chaseItemIds.includes(winningItem.id)) {
            const teasePositions = [42, 43, 44, 45, 46, 47, 48, 51, 52, 53, 54, 55];
            const teaseIndex = teasePositions[Math.floor(Math.random() * teasePositions.length)];
            items[teaseIndex] = chaseItem;
        }

        return items;
    };

    const handleSelectCrate = (type: CrateType) => {
        if (!type || !user) return;
        if ((type === 'lamb' && keys.lambKeys < 1) || (type === 'wagyu' && keys.wagyuKeys < 1)) {
            alert("You don't have enough keys! Purchase one from the shop or get one from the admin.");
            return;
        }
        setSelectedCrate(type);
        setStage('focus_crate');
    };

    const handleOpenCrate = async (type: CrateType) => {
        if (!type || !user) return;
        
        // Optimistic check
        if ((type === 'lamb' && keys.lambKeys < 1) || (type === 'wagyu' && keys.wagyuKeys < 1)) {
            alert("You don't have enough keys! Purchase one from the shop or get one from the admin.");
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch(`${DISCORD_API_URL}/api/packs/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    type: type
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || "Failed to use a crate key.");
                setProcessing(false);
                return;
            }

            const data = await response.json();
            
            // data.remaining contains the new key balance for that type
            if (type === 'lamb') {
                setKeys(k => ({ ...k, lambKeys: data.remaining }));
            } else {
                setKeys(k => ({ ...k, wagyuKeys: data.remaining }));
            }

            setSelectedCrate(type);
            const pool = type === 'lamb' ? LAMB_POOL : WAGYU_POOL;
            setCurrentPool(pool);
            
            const winner = getRandomCard(pool);
            setWinningCard(winner);
            setSpinnerItems(generateSpinnerItems(pool, winner));
            
            setStage('pre_opening');
            playOpen();
        } catch (err) {
            console.error("Error opening crate:", err);
            alert("Connection error. Failed to open crate.");
        } finally {
            setProcessing(false);
        }
    };

    const handleFinishOpening = () => {
        if (winningCard && selectedCrate) {
            saveToInventory(winningCard, selectedCrate);
            setTimeout(() => {
                setStage('finished');
                playReveal(winningCard.rarity);
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
                @keyframes crate-anticipation {
                    0%, 32% { /* 0s to 0.8s of 2.5s */
                        transform: scale(1.2) translateY(0) rotate(0);
                    }
                    32% { transform: scale(1.2) translateY(0) rotate(0.5deg); }
                    35% { transform: scale(1.2) translateY(-1px) rotate(-0.5deg); }
                    38% { transform: scale(1.2) translateY(1px) rotate(0.5deg); }
                    41% { transform: scale(1.2) translateY(-1px) rotate(-0.5deg); }
                    44% { transform: scale(1.2) translateY(1px) rotate(0.5deg); }
                    46% { transform: scale(1.2) translateY(-1px) rotate(-0.5deg); }
                    /* 1.2s of 2.5s - the explosion squash/stretch */
                    48% {
                        transform: scale(1.3, 0.95) translateY(4px); /* Squash */
                    }
                    52% {
                        transform: scale(1.1, 1.25) translateY(-12px); /* Stretch upward from explosion */
                    }
                    58% {
                        transform: scale(1.2) translateY(0); /* Return to size */
                    }
                    100% {
                        transform: scale(1.2) translateY(0);
                    }
                }
                .crate-anticipation-anim {
                    animation: crate-anticipation 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
                .lid-opening {
                    animation: lid-fly 1.3s cubic-bezier(0.15, 0.85, 0.3, 1) forwards;
                    animation-delay: 1.2s;
                }
                @keyframes lid-fly {
                    0% { transform: translateY(0) rotate(0); opacity: 1; }
                    15% { transform: translateY(-4px) rotate(-1deg); opacity: 1; }
                    20% { transform: translateY(-8px) rotate(2deg); opacity: 1; }
                    25% { transform: translateY(-12px) rotate(-1deg); opacity: 1; }
                    /* Blown off upward at 1.2s lock break */
                    100% { transform: translateY(-170px) rotate(-50deg) scale(1.25); opacity: 0; filter: blur(3px); }
                }
                .lock-popping {
                    animation: lock-break 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    animation-delay: 1.2s;
                }
                @keyframes lock-break {
                    0% { transform: scale(1); opacity: 1; filter: brightness(1); }
                    30% { transform: scale(1.4); opacity: 1; filter: brightness(2) drop-shadow(0 0 25px rgba(251, 191, 36, 1)); }
                    100% { transform: scale(0) translateY(30px); opacity: 0; filter: blur(4px); }
                }
                .key-insert-turn {
                    transform-origin: 16.6% 83.3%;
                    animation: key-anim 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
                @keyframes key-anim {
                    0% {
                        transform: translate(220%, -83.3%) rotate(45deg) scale(1.1);
                        opacity: 0;
                        filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.2));
                    }
                    15% {
                        transform: translate(140%, -83.3%) rotate(45deg) scale(1.05);
                        opacity: 1;
                        filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.8));
                    }
                    35% {
                        /* Key tip smoothly slides directly into the keyhole cutout from the side */
                        transform: translate(-16.6%, -83.3%) rotate(45deg) scale(1);
                        opacity: 1;
                        filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.9)) brightness(1.3);
                    }
                    48% {
                        /* Anchors firmly inside the keyhole before the twist */
                        transform: translate(-16.6%, -83.3%) rotate(45deg) scale(1);
                        opacity: 1;
                        filter: drop-shadow(0 0 35px rgba(251, 191, 36, 1)) brightness(1.6);
                    }
                    67% {
                        /* Key turns a full 90 degrees inside the keyhole, unlocking the crate! */
                        transform: translate(-16.6%, -83.3%) rotate(135deg) scale(1);
                        opacity: 1;
                        filter: drop-shadow(0 0 45px rgba(251, 191, 36, 1)) brightness(2);
                    }
                    78% {
                        /* Unlock feedback pulse */
                        transform: translate(-16.6%, -83.3%) rotate(135deg) scale(1.05);
                        opacity: 0.5;
                        filter: drop-shadow(0 0 65px rgba(255, 255, 255, 1)) brightness(2.5);
                    }
                    100% {
                        /* Key dissolves into sparkling energy */
                        transform: translate(-16.6%, -83.3%) rotate(135deg) scale(0.1);
                        opacity: 0;
                        filter: drop-shadow(0 0 80px rgba(255, 255, 255, 1));
                    }
                }
                /* Volumetric Light Pillar Styles with Depth */
                .scale-out-source {
                    animation: source-glow-expand 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                }
                @keyframes source-glow-expand {
                    0% { transform: translateX(-50%) scale(0); opacity: 0; }
                    15% { transform: translateX(-50%) scale(1.2); opacity: 0.9; filter: brightness(2); }
                    40% { transform: translateX(-50%) scale(1); opacity: 0.7; }
                    100% { transform: translateX(-50%) scale(0.5); opacity: 0; }
                }

                .light-ring-anim {
                    animation: ring-expand 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                    width: 140px;
                    height: 40px;
                }
                .light-ring-anim-delayed {
                    animation: ring-expand 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                    animation-delay: 1.35s;
                    opacity: 0;
                    width: 120px;
                    height: 35px;
                }
                @keyframes ring-expand {
                    0% {
                        transform: translateX(-50%) scale(0.2);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateX(-50%) scale(2.4);
                        opacity: 0;
                        filter: blur(4px);
                    }
                }

                .light-beam-shroud {
                    animation: shroud-shoot 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                    transform: translateX(-50%) scaleX(0);
                }
                @keyframes shroud-shoot {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) scaleX(0) scaleY(0.2);
                    }
                    15% {
                        opacity: 0.85;
                        transform: translateX(-50%) scaleX(1.15) scaleY(1);
                    }
                    35% {
                        opacity: 0.7;
                        transform: translateX(-50%) scaleX(1) scaleY(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) scaleX(0.3) scaleY(1);
                    }
                }

                .light-beam-core {
                    animation: core-shoot 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                    transform: translateX(-50%) scaleX(0);
                }
                @keyframes core-shoot {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) scaleX(0) scaleY(0.1);
                    }
                    12% {
                        opacity: 1;
                        transform: translateX(-50%) scaleX(1.3) scaleY(1);
                        filter: brightness(2);
                    }
                    30% {
                        opacity: 0.9;
                        transform: translateX(-50%) scaleX(0.9) scaleY(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) scaleX(0.1) scaleY(1.05);
                    }
                }

                .light-beam-ray-left {
                    animation: ray-left-shoot 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: 1.25s;
                    opacity: 0;
                    transform: translateX(-50%) rotate(-5deg) scaleY(0);
                }
                @keyframes ray-left-shoot {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) rotate(-2deg) scaleY(0);
                    }
                    15% {
                        opacity: 0.45;
                        transform: translateX(-50%) rotate(-6deg) scaleY(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) rotate(-12deg) scaleY(1);
                    }
                }

                .light-beam-ray-right {
                    animation: ray-right-shoot 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    animation-delay: 1.25s;
                    opacity: 0;
                    transform: translateX(-50%) rotate(5deg) scaleY(0);
                }
                @keyframes ray-right-shoot {
                    0% {
                        opacity: 0;
                        transform: translateX(-50%) rotate(2deg) scaleY(0);
                    }
                    15% {
                        opacity: 0.45;
                        transform: translateX(-50%) rotate(6deg) scaleY(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translateX(-50%) rotate(12deg) scaleY(1);
                    }
                }

                .light-beam-ribbon {
                    animation: ribbon-wiggle 1.3s ease-out forwards;
                    animation-delay: 1.2s;
                    opacity: 0;
                    transform: scaleY(0);
                }
                .light-beam-ribbon-delayed {
                    animation: ribbon-wiggle-alt 1.3s ease-out forwards;
                    animation-delay: 1.25s;
                    opacity: 0;
                    transform: scaleY(0);
                }
                @keyframes ribbon-wiggle {
                    0% { opacity: 0; transform: scaleY(0) translateX(0); }
                    15% { opacity: 0.6; transform: scaleY(1) translateX(-5px); }
                    50% { transform: scaleY(1) translateX(5px); }
                    100% { opacity: 0; transform: scaleY(1.1) translateX(-2px); }
                }
                @keyframes ribbon-wiggle-alt {
                    0% { opacity: 0; transform: scaleY(0) translateX(0); }
                    15% { opacity: 0.6; transform: scaleY(1) translateX(4px); }
                    50% { transform: scaleY(1) translateX(-4px); }
                    100% { opacity: 0; transform: scaleY(1.1) translateX(1px); }
                }
                .animate-particle {
                    animation: particle-float 1.5s ease-out forwards;
                    opacity: 0;
                }
                @keyframes particle-float {
                    0% {
                        transform: translateY(0) translateX(0) scale(1);
                        opacity: 0;
                    }
                    15% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-250px) translateX(var(--particle-tx, 20px)) scale(0);
                        opacity: 0;
                    }
                }
                .crate-glow-burst {
                    animation: glow-burst 1.5s ease-out forwards;
                    animation-delay: 1.2s;
                }
                @keyframes glow-burst {
                    0% { opacity: 0; transform: scale(0.5); }
                    30% { opacity: 1; transform: scale(1.2); }
                    100% { opacity: 0; transform: scale(2.5); }
                }
                .pre-opening-text-anim {
                    animation: pre-opening-fade 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                    display: inline-block;
                }
                @keyframes pre-opening-fade {
                    0% { opacity: 1; }
                    50% { opacity: 1; }
                    75% { opacity: 0; }
                    100% { opacity: 0; }
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="url(#wagyuKeyGrad18)" stroke="#451a03" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><defs><linearGradient id="wagyuKeyGrad18" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7a2034"/><stop offset="50%" stopColor="#fb7185"/><stop offset="100%" stopColor="#9f1239"/></linearGradient></defs><path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" /><circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" /></svg>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-[#fbbf24] uppercase tracking-widest leading-tight">Wagyu Keys</div>
                            <div className="text-lg font-black text-white leading-none">{keys.wagyuKeys}</div>
                        </div>
                    </div>
                </div>
            </div>

            {stage === 'selection' && (
                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh] py-4 md:py-8">
                    <div className="w-full max-w-6xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8 relative z-10 p-8">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-8 tracking-tighter drop-shadow-2xl">
                                <>GACHA <span className="text-brand-primary">CRATES</span></>
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-2 md:px-12 max-w-5xl mx-auto">
                                {/* LAMB CRATE */}
                                <div 
                                    className={`flex flex-col items-center p-8 bg-gradient-to-b from-amber-900/20 to-black border border-amber-900/40 rounded-3xl shadow-xl transition-all duration-300 ${keys.lambKeys > 0 ? 'hover:border-amber-700/60 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(146,64,14,0.4)]' : 'cursor-not-allowed opacity-80'}`}
                                    onClick={() => stage === 'selection' && handleSelectCrate('lamb')}
                                >
                                    <div className="w-48 h-32 mb-6 text-amber-800 drop-shadow-[0_0_15px_rgba(146,64,14,0.5)] relative crate-float">
                                        <LambCrateSVG stage={stage} selectedCrate={selectedCrate} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Lamb Crate</h2>
                                    <p className="text-amber-200/80 text-sm text-center mb-8 min-h-[2.5rem]">Contains common to rare loot and hats, relic coins and the 1999 Base Set TCG Pack!</p>
                                </div>

                                {/* WAGYU CRATE */}
                                <div 
                                    className={`flex flex-col items-center p-8 bg-gradient-to-b from-[#7a2034]/20 to-black border border-[#d7485c]/20 rounded-3xl shadow-xl transition-all duration-300 ${keys.wagyuKeys > 0 ? 'hover:border-[#fbbf24]/50 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(215,72,92,0.4)]' : 'cursor-not-allowed opacity-80'}`}
                                    onClick={() => stage === 'selection' && handleSelectCrate('wagyu')}
                                >
                                    <div className="w-48 h-32 mb-6 text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,113,133,0.5)] relative crate-float">
                                        <WagyuCrateSVG stage={stage} selectedCrate={selectedCrate} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Wagyu Crate</h2>
                                    <p className="text-[#fbbf24]/80 text-sm text-center mb-8 min-h-[2.5rem]">Contains epic to legendary loot and hats, koban coins, the 2023 Scarlet & Violet-Mew 151 TCG Pack and a MEW EX TCG card!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(stage === 'focus_crate' || stage === 'pre_opening') && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <h1 className="text-4xl md:text-5xl font-black text-center mb-12 tracking-tighter drop-shadow-2xl">
                        {stage === 'pre_opening' ? <span className="text-amber-500 pre-opening-text-anim">OPENING...</span> : <span className="text-white uppercase tracking-widest">{selectedCrate} CRATE</span>}
                    </h1>
                    
                    <div className={`relative w-64 h-48 md:w-96 md:h-64 mb-16 animate-in zoom-in duration-300 ${stage === 'pre_opening' ? 'crate-anticipation-anim' : ''}`}>
                        {stage === 'pre_opening' && (
                            <div className="absolute inset-0 bg-white rounded-full blur-[60px] opacity-0 crate-glow-burst" style={{ zIndex: 0 }}></div>
                        )}
                        <div className={`w-full h-full ${stage === 'pre_opening' ? '' : 'crate-float'}`}>
                            {selectedCrate === 'lamb' ? <LambCrateSVG stage={stage} selectedCrate={selectedCrate} /> : <WagyuCrateSVG stage={stage} selectedCrate={selectedCrate} />}
                        </div>
                        
                        {/* Immersive Key Insertion & Turn Overlay during pre_opening */}
                        {stage === 'pre_opening' && (
                            selectedCrate === 'lamb' ? (
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="absolute key-insert-turn pointer-events-none z-30 w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]" 
                                    style={{ left: '50%', top: '61.33%' }}
                                    viewBox="0 0 24 24" 
                                    fill="#d97706" 
                                    stroke="#451a03" 
                                    strokeWidth="1.2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                    <circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" />
                                </svg>
                            ) : (
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="absolute key-insert-turn pointer-events-none z-30 w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_20px_rgba(244,63,94,0.9)]" 
                                    style={{ left: '50%', top: '61.33%' }}
                                    viewBox="0 0 24 24" 
                                    fill="url(#wagyuKeyInsertGrad)" 
                                    stroke="#451a03" 
                                    strokeWidth="1.2" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                >
                                    <defs>
                                        <linearGradient id="wagyuKeyInsertGrad" x1="0" y1="0" x2="1" y2="1">
                                            <stop offset="0%" stopColor="#7a2034"/>
                                            <stop offset="50%" stopColor="#fb7185"/>
                                            <stop offset="100%" stopColor="#9f1239"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                    <circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" />
                                </svg>
                            )
                        )}

                        {/* Majestic Light Beam Shooting from Inside the Crate with Volumetric Depth */}
                        {stage === 'pre_opening' && (
                            <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-[240px] md:w-[320px] h-[500px] pointer-events-none z-0 overflow-visible">
                                {/* Ground Flare / Source Glow */}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-xl scale-out-source bg-gradient-to-r ${
                                    selectedCrate === 'lamb' ? 'from-amber-400 to-yellow-300' : 'from-rose-500 to-amber-400'
                                }`} />

                                {/* Horizontal Energy Rings expanding from the lid */}
                                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 border-2 rounded-full light-ring-anim ${
                                    selectedCrate === 'lamb' ? 'border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'border-rose-400/80 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                                }`} />
                                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 border rounded-full light-ring-anim-delayed ${
                                    selectedCrate === 'lamb' ? 'border-yellow-300/60' : 'border-orange-400/60'
                                }`} />

                                {/* Wide Volumetric Shroud (The outer glowing cone) */}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom w-32 md:w-48 h-full light-beam-shroud ${
                                    selectedCrate === 'lamb' 
                                        ? 'bg-gradient-to-t from-amber-500/60 via-yellow-500/20 to-transparent' 
                                        : 'bg-gradient-to-t from-rose-500/60 via-orange-500/20 to-transparent'
                                }`} 
                                style={{
                                    clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                                    filter: 'blur(8px)'
                                }} />

                                {/* Solid Bright Core (Intense white-hot center) */}
                                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 origin-bottom w-6 md:w-10 h-full light-beam-core ${
                                    selectedCrate === 'lamb'
                                        ? 'bg-gradient-to-t from-white via-yellow-200/90 to-transparent'
                                        : 'bg-gradient-to-t from-white via-rose-200/90 to-transparent'
                                }`}
                                style={{
                                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                                    filter: 'blur(2px)'
                                }} />

                                {/* Left Side Ray (Angled) */}
                                <div className={`absolute bottom-0 left-1/2 origin-bottom w-4 md:w-6 h-full light-beam-ray-left ${
                                    selectedCrate === 'lamb'
                                        ? 'bg-gradient-to-t from-amber-400/40 via-yellow-400/10 to-transparent'
                                        : 'bg-gradient-to-t from-rose-400/40 via-pink-400/10 to-transparent'
                                }`}
                                style={{
                                    clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
                                    filter: 'blur(3px)'
                                }} />

                                {/* Right Side Ray (Angled) */}
                                <div className={`absolute bottom-0 left-1/2 origin-bottom w-4 md:w-6 h-full light-beam-ray-right ${
                                    selectedCrate === 'lamb'
                                        ? 'bg-gradient-to-t from-amber-400/40 via-yellow-400/10 to-transparent'
                                        : 'bg-gradient-to-t from-rose-400/40 via-pink-400/10 to-transparent'
                                }`}
                                style={{
                                    clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
                                    filter: 'blur(3px)'
                                }} />

                                {/* Intermittent Energy Pillars / Ribbons that wiggle */}
                                <div className={`absolute bottom-0 left-[45%] origin-bottom w-1 h-[80%] light-beam-ribbon ${
                                    selectedCrate === 'lamb' ? 'bg-yellow-200/50' : 'bg-white/50'
                                } blur-[1px]`} />
                                <div className={`absolute bottom-0 left-[55%] origin-bottom w-1.5 h-[90%] light-beam-ribbon-delayed ${
                                    selectedCrate === 'lamb' ? 'bg-amber-300/50' : 'bg-rose-300/50'
                                } blur-[1px]`} />
                            </div>
                        )}

                        {/* Magical Rising Sparkles / Energy Particles */}
                        {stage === 'pre_opening' && Array.from({ length: 8 }).map((_, i) => {
                            const delay = 1.2 + (i * 0.1);
                            const leftOffset = -50 + ((i * 73) % 100);
                            const size = 4 + ((i * 17) % 6);
                            const particleDuration = 0.8 + ((i * 11) % 10) * 0.1;
                            const particleTranslateX = -30 + ((i * 29) % 60);
                            const color = selectedCrate === 'lamb' ? 'bg-amber-400' : 'bg-rose-400';
                            return (
                                <div 
                                    key={i}
                                    className={`absolute rounded-full pointer-events-none blur-[1px] animate-particle ${color}`}
                                    style={{
                                        left: `calc(50% + ${leftOffset}px)`,
                                        bottom: '30%',
                                        width: `${size}px`,
                                        height: `${size}px`,
                                        animationDelay: `${delay}s`,
                                        animationDuration: `${particleDuration}s`,
                                        '--particle-tx': `${particleTranslateX}px`
                                    } as React.CSSProperties}
                                />
                            );
                        })}

                        {/* The Drop Target for Keyhole */}
                        {stage === 'focus_crate' && (
                            <div 
                                ref={dropZoneRef}
                                className="absolute w-36 h-36 rounded-full z-20 pointer-events-auto"
                                style={{ left: '50%', top: '61.33%', transform: 'translate(-50%, -50%)' }}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.getData('keyType') === selectedCrate && selectedCrate) {
                                        handleOpenCrate(selectedCrate);
                                    }
                                }}
                            />
                        )}
                    </div>
                    
                    {/* Render the Key to Drag */}
                    {stage === 'focus_crate' && (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both select-none relative z-30">
                            <p className="text-sm font-bold tracking-widest uppercase mb-4 text-gray-400">
                                Drag key to unlock
                            </p>
                            <div 
                                onPointerDown={handleKeyPointerDown}
                                onPointerMove={handleKeyPointerMove}
                                onPointerUp={handleKeyPointerUp}
                                onPointerCancel={handleKeyPointerUp}
                                style={{
                                    transform: `translate3d(${keyDragPos.x}px, ${keyDragPos.y}px, 0) scale(${isDraggingKey ? 1.25 : 1}) rotate(${isDraggingKey ? '-12deg' : '0deg'})`,
                                    transition: isDraggingKey ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    touchAction: 'none',
                                    zIndex: isDraggingKey ? 9999 : 30
                                }}
                                className="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform flex items-center justify-center relative select-none"
                            >
                                {selectedCrate === 'lamb' ? (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_0_25px_rgba(251,191,36,0.85)] group-hover:drop-shadow-[0_0_35px_rgba(251,191,36,1)] transition-all pointer-events-none" 
                                        viewBox="0 0 24 24" 
                                        fill="#d97706" 
                                        stroke="#451a03" 
                                        strokeWidth="1.2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                        <circle cx="16.5" cy="7.5" r="1.5" fill="#fcd34d" stroke="none" />
                                    </svg>
                                ) : (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="w-24 h-24 md:w-28 md:h-28 drop-shadow-[0_0_25px_rgba(244,63,94,0.85)] group-hover:drop-shadow-[0_0_35px_rgba(244,63,94,1)] transition-all pointer-events-none" 
                                        viewBox="0 0 24 24" 
                                        fill="url(#wagyuKeyDragGrad)" 
                                        stroke="#451a03" 
                                        strokeWidth="1.2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <defs>
                                            <linearGradient id="wagyuKeyDragGrad" x1="0" y1="0" x2="1" y2="1">
                                                <stop offset="0%" stopColor="#7a2034"/>
                                                <stop offset="50%" stopColor="#fb7185"/>
                                                <stop offset="100%" stopColor="#9f1239"/>
                                            </linearGradient>
                                        </defs>
                                        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
                                        <circle cx="16.5" cy="7.5" r="1.5" fill="#fef08a" stroke="none" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Cancel button */}
                    {stage === 'focus_crate' && (
                        <button 
                            className="cursor-pointer absolute top-24 md:top-10 right-6 md:right-10 z-[10001] text-white/60 hover:text-white transition-all bg-black/40 hover:bg-black/60 p-2.5 rounded-full border border-white/10 shadow-lg"
                            onClick={() => {
                                setStage('selection');
                                setSelectedCrate(null);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    )}
                </div>
            )}
            
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
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in zoom-in-95 duration-500 p-8">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-brand-primary mb-12 drop-shadow-[0_0_15px_rgba(248,113,113,0.65)] z-10 relative">
                        You Received!
                    </h2>
                    
                    <div className="w-64 md:w-80 h-80 z-10 relative">
                        <CrateItem card={winningCard} className="w-full h-full shadow-[0_0_50px_rgba(255,255,255,0.1)] animate-in slide-in-from-bottom-12 duration-700" />
                    </div>

                    <button 
                        onClick={resetGame}
                        className="cursor-pointer mt-12 px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-colors shadow-xl hover:scale-105 z-10 relative"
                    >
                        Continue
                    </button>
                </div>
            )}
        </div>
    );
};

export default Gacha;
