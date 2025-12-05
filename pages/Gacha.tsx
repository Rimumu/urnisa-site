
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface CardData {
    id: number;
    name: string;
    type: 'Pokemon' | 'Item';
    subType: string; // e.g. "Genetic", "Mythical", "Normal"
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical';
    image?: string; 
    description?: string;
    hp?: number; 
    weight?: number; // Higher number = more frequent
}

// --- DATA POOLS ---

// THEME: MEWTWO (Genetic / Science / Lab)
const LAMB_POOL: CardData[] = [
    // The Chase (Guaranteed at end, excluded from random pulls via logic)
    { id: 150, name: "Mewtwo", type: 'Pokemon', subType: "Artificial", rarity: 'Legendary', hp: 180, description: "A clone created by science.", weight: 0 },
    
    // Rares (Weight: 5)
    { id: 142, name: "Aerodactyl", type: 'Pokemon', subType: "Fossil", rarity: 'Rare', hp: 120, description: "Resurrected from amber.", weight: 5 },
    { id: 65, name: "Alakazam", type: 'Pokemon', subType: "Psi", rarity: 'Rare', hp: 55, description: "Brain power.", weight: 5 },
    
    // Uncommon (Weight: 15)
    { id: 88, name: "Grimer", type: 'Pokemon', subType: "Sludge", rarity: 'Uncommon', hp: 80, description: "Bio-waste.", weight: 15 },
    { id: 93, name: "Haunter", type: 'Pokemon', subType: "Gas", rarity: 'Uncommon', hp: 45, description: "Licks you.", weight: 15 },
    { id: 64, name: "Kadabra", type: 'Pokemon', subType: "Psi", rarity: 'Uncommon', hp: 40, description: "Emit alpha waves.", weight: 15 },
    { id: 101, name: "Electrode", type: 'Pokemon', subType: "Ball", rarity: 'Uncommon', hp: 60, description: "Explodes.", weight: 15 },
    { id: 137, name: "Porygon", type: 'Pokemon', subType: "Virtual", rarity: 'Uncommon', hp: 65, description: "Man-made code.", weight: 15 },

    // Common Pokemon (Weight: 30)
    { id: 109, name: "Koffing", type: 'Pokemon', subType: "Gas", rarity: 'Common', hp: 40, description: "Toxic fumes.", weight: 30 },
    { id: 81, name: "Magnemite", type: 'Pokemon', subType: "Magnet", rarity: 'Common', hp: 25, description: "Anti-gravity.", weight: 30 },
    { id: 63, name: "Abra", type: 'Pokemon', subType: "Psi", rarity: 'Common', hp: 25, description: "Sleeps 18 hours.", weight: 30 },
    { id: 41, name: "Zubat", type: 'Pokemon', subType: "Bat", rarity: 'Common', hp: 40, description: "Cave dweller.", weight: 30 },
    { id: 100, name: "Voltorb", type: 'Pokemon', subType: "Ball", rarity: 'Common', hp: 40, description: "Looks like a ball.", weight: 30 },

    // Common Items (Variable Weights)
    // Bronze Coin is most frequent (Weight 150)
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 150 },
    
    // Other Common Items (Weight 50-60)
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-candy-xs.png", weight: 50 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-candy-s.png", weight: 50 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Tool", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 60 },
];

// THEME: MEW (Mythic / Rare / Ancestor)
const WAGYU_POOL: CardData[] = [
    // The Chase
    { id: 151, name: "Mew", type: 'Pokemon', subType: "Originator", rarity: 'Mythical', hp: 100, description: "The ancestor of all.", weight: 0 },
    
    // Ultra-Rare (Weight: 5)
    { id: 149, name: "Dragonite", type: 'Pokemon', subType: "Dragon", rarity: 'Ultra-Rare', hp: 150, description: "Marine guardian.", weight: 5 },
    { id: 94, name: "Gengar", type: 'Pokemon', subType: "Shadow", rarity: 'Ultra-Rare', hp: 130, description: "Hides in shadows.", weight: 5 },
    { id: 131, name: "Lapras", type: 'Pokemon', subType: "Transport", rarity: 'Ultra-Rare', hp: 190, description: "Gentle giant.", weight: 5 },
    { id: 143, name: "Snorlax", type: 'Pokemon', subType: "Sleeping", rarity: 'Ultra-Rare', hp: 200, description: "Blocks the road.", weight: 5 },
    { id: 59, name: "Arcanine", type: 'Pokemon', subType: "Legendary", rarity: 'Ultra-Rare', hp: 160, description: "Majestic flame.", weight: 5 },
    { id: 130, name: "Gyarados", type: 'Pokemon', subType: "Atrocious", rarity: 'Ultra-Rare', hp: 170, description: "Destructive rage.", weight: 5 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Ultra-Rare', hp: 140, description: "Reads minds.", weight: 5 },
    { id: 282, name: "Gardevoir", type: 'Pokemon', subType: "Embrace", rarity: 'Ultra-Rare', hp: 130, description: "Protects trainer.", weight: 5 },
    { id: 133, name: "Eevee", type: 'Pokemon', subType: "Evolution", rarity: 'Ultra-Rare', hp: 60, description: "Infinite potential.", weight: 5 },
    { id: 175, name: "Togepi", type: 'Pokemon', subType: "Spike Ball", rarity: 'Ultra-Rare', hp: 50, description: "Full of joy.", weight: 5 },
];

// --- CACHE ---
// Persist validity results in memory during session to avoid redundant API calls
const clientImageCache = new Map<string, boolean>();

// --- COMPONENTS ---

const TradingCard: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    // Rarity styles
    let borderClass = "border-gray-600";
    let glowClass = "";
    let holoEffect = "";
    let badgeColor = "bg-gray-700 text-gray-300";
    let bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]";

    if (card.rarity === 'Common') {
        borderClass = "border-stone-500";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]";
    } else if (card.rarity === 'Uncommon') {
        borderClass = "border-slate-300";
        badgeColor = "bg-slate-700 text-white";
    } else if (card.rarity === 'Rare') {
        borderClass = "border-blue-400";
        glowClass = "shadow-[0_0_15px_rgba(96,165,250,0.5)]";
        badgeColor = "bg-blue-900/80 text-blue-200 border border-blue-500/30";
        holoEffect = "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/20 after:to-transparent after:opacity-50 after:pointer-events-none";
    } else if (card.rarity === 'Ultra-Rare') {
        // Ultra-Rare is now Purple
        borderClass = "border-purple-500";
        glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.6)]";
        badgeColor = "bg-purple-900/80 text-purple-200 border border-purple-500/30";
        holoEffect = "foil-holo"; 
    } else if (card.rarity === 'Legendary') {
        // Legendary is now Yellow/Gold
        borderClass = "border-yellow-400";
        glowClass = "shadow-[0_0_30px_rgba(250,204,21,0.8)]";
        badgeColor = "bg-yellow-900/90 text-yellow-100 border border-yellow-400/50 shadow-[0_0_10px_#eab308]";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]";
        holoEffect = "foil-holo after:bg-yellow-500/10"; 
    } else if (card.rarity === 'Mythical') {
        borderClass = "border-pink-400";
        glowClass = "shadow-[0_0_35px_rgba(244,114,182,0.9)] ring-2 ring-white/50";
        badgeColor = "bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-white/50 shadow-[0_0_15px_#ec4899]";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]";
        holoEffect = "mythic-holo"; // Custom class for rainbow effect
    }

    // --- SMART IMAGE LOGIC ---
    const [imgSrc, setImgSrc] = useState<string>("");

    const getFormattedName = (name: string) => {
        // Convert "Mr. Mime" -> "mr-mime", "Nidoran♀" -> "nidoran-f", etc.
        return name.toLowerCase()
            .replace(/[.']/g, '') // remove dots and apostrophes
            .replace(/♀/g, '-f')
            .replace(/♂/g, '-m')
            .replace(/\s+/g, '-'); // spaces to hyphens
    };

    // Use server-side checking to detect placeholder images by size
    // WITH CLIENT-SIDE CACHING to speed up repeated pulls
    useEffect(() => {
        const verifyImage = async () => {
            if (card.image) {
                setImgSrc(card.image);
                return;
            }

            const cobbleName = getFormattedName(card.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`;

            // 1. CHECK LOCAL CACHE
            if (clientImageCache.has(primaryUrl)) {
                const isValid = clientImageCache.get(primaryUrl);
                setImgSrc(isValid ? primaryUrl : fallback3d);
                return;
            }

            try {
                // Call our backend to check file size (avoiding CORS issues)
                // If size > 2KB, we assume it's a valid sprite. If < 2KB, it's likely the question mark placeholder.
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();

                // 2. STORE IN CACHE
                clientImageCache.set(primaryUrl, data.valid);

                if (data.valid) {
                    setImgSrc(primaryUrl);
                } else {
                    console.log(`[Gacha] Placeholder detected via size check for ${card.name}, using 3D fallback.`);
                    setImgSrc(fallback3d);
                }
            } catch (error) {
                console.warn("[Gacha] Image check failed, defaulting to primary.", error);
                setImgSrc(primaryUrl);
            }
        };

        verifyImage();
    }, [card]);

    const handleImageError = () => {
        // FALLBACK CHAIN (triggered if image loads 404, or if our pre-check failed logic)
        
        // 1. If Cobblemon Tools fails, go to PokeAPI Home (3D Render) - User Preferred Fallback
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`);
        } 
        // 2. If Home Render fails, try Official Artwork (2D High Quality)
        else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`);
        } 
        // 3. If Official Artwork fails, try Standard Pixel Sprite
        else if (imgSrc.includes('official-artwork')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.id}.png`);
        } 
        // 4. Final Fallback: Text Placeholder
        else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(card.name)}`);
        }
    };

    return (
        <div className={`relative w-48 h-72 rounded-xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
            {/* Holographic Overlay */}
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay ${holoEffect}`}></div>}
            
            {/* Background Image / Art */}
            <div className="absolute inset-0 bg-[#1a1a1a] z-0">
                {/* Fallback pattern */}
                <div className={`absolute inset-0 ${bgPattern} opacity-20`}></div>
                
                {/* Special Radial BG for high tiers */}
                {(card.rarity === 'Legendary' || card.rarity === 'Mythical') && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                )}

                {/* Main Artwork - Padded bottom to avoid text overlap */}
                <div className="absolute inset-0 p-4 pb-20 flex items-center justify-center z-10">
                    <img 
                        src={imgSrc} 
                        alt={card.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        onError={handleImageError}
                        loading="lazy"
                    />
                </div>
            </div>

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 z-10 pointer-events-none"></div>

            {/* Content - Bottom Aligned */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-30 flex flex-col items-center text-center">
                <div className={`mb-2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${badgeColor}`}>
                    {card.rarity}
                </div>
                <h3 className="text-white font-black text-lg leading-none mb-1 drop-shadow-md tracking-wide">
                    {card.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                    {card.subType}
                </span>
            </div>

            {/* Top Right ID */}
            <div className="absolute top-2 right-2 z-30 text-[8px] font-mono text-white/50 bg-black/50 px-1.5 rounded">
                #{card.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const Gacha: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    
    // Dynamic Split Logic
    const [cutYPercentage, setCutYPercentage] = useState(15); 
    
    // Animation State for Randomness
    const [cutVisuals, setCutVisuals] = useState({ rotate: -30, x: -50, y: -150 });

    // Dispensing Logic
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    const [shakePack, setShakePack] = useState(false);
    
    const svgRef = useRef<SVGSVGElement>(null);
    const packRef = useRef<HTMLDivElement>(null);

    // --- EFFECT: TRAIL FADING ---
    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 150)); // Faster fade out (150ms)
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    // --- HANDLERS ---

    const selectPack = (type: PackType) => {
        setSelectedPack(type);
        // Set the pool based on selection
        setCurrentPool(type === 'lamb' ? LAMB_POOL : WAGYU_POOL);
        setStage('cutting');
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutCoords(null);
        setCutYPercentage(15);
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) {
            setCutCoords({ start: pt, end: pt });
            setTrail([{ ...pt, id: Date.now() }]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;

        const pt = getPoint(e);
        if (pt) {
            setTrail(prev => [...prev, { ...pt, id: Date.now() }]);
            
            if (cutCoords) {
                setCutCoords(prev => prev ? { ...prev, end: pt } : null);
            }
        }
    };

    const handleMouseUp = () => {
        if (isDragging && cutCoords) {
            checkCut();
        }
        setIsDragging(false);
    };

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return null;
        
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const checkCut = () => {
        if (!cutCoords) return;
        const dx = cutCoords.end.x - cutCoords.start.x;
        const dy = cutCoords.end.y - cutCoords.start.y;
        
        if (Math.abs(dx) < 200) return;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const isHorizontal = (Math.abs(angle) < 30) || (Math.abs(angle) > 150);
        if (!isHorizontal) return;

        const avgY = (cutCoords.start.y + cutCoords.end.y) / 2;
        const relativeY = avgY - 200;
        const percentage = (relativeY / 420) * 100;

        if (percentage >= 10 && percentage <= 15) {
            triggerCut(percentage);
        } else {
            setCutCoords(null);
        }
    };

    const triggerCut = (exactPercentage: number) => {
        setCutYPercentage(exactPercentage);
        const randomRotate = (Math.random() * 20) - 10;
        const randomX = (Math.random() * 60) - 30;
        const randomY = -80 - (Math.random() * 40);

        setCutVisuals({
            rotate: randomRotate,
            x: randomX,
            y: randomY
        });

        setIsCut(true);
        setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard) return;

        if (revealedCards.length < 5) {
            setShakePack(true);
            setTimeout(() => setShakePack(false), 300);

            // LOGIC: Guaranteed Chase on 5th card (index 4)
            // revealedCards length is 0, 1, 2, 3... so when it is 4, this is the 5th click.
            
            let nextCard: CardData | undefined;
            const isLamb = selectedPack === 'lamb';
            const chaseName = isLamb ? "Mewtwo" : "Mew";

            if (revealedCards.length === 4) {
                // FORCE CHASE CARD
                nextCard = currentPool.find(c => c.name === chaseName)!;
                // Fallback (should never happen if pool is correct)
                if (!nextCard) nextCard = currentPool[0]; 
            } else {
                // RANDOM CARD (Exclude Chase Card to keep it special for the end)
                const regularPool = currentPool.filter(c => c.name !== chaseName);
                
                // WEIGHTED SELECTION
                const totalWeight = regularPool.reduce((sum, item) => sum + (item.weight || 10), 0);
                let randomNum = Math.random() * totalWeight;
                
                for (const card of regularPool) {
                    const weight = card.weight || 10;
                    if (randomNum < weight) {
                        nextCard = card;
                        break;
                    }
                    randomNum -= weight;
                }
                
                // Fallback if float math goes slightly off
                if (!nextCard) nextCard = regularPool[0];
            }
            
            setTimeout(() => {
                setDispensingCard(nextCard!);
                setTimeout(() => {
                    setRevealedCards(prev => [nextCard!, ...prev]);
                    setDispensingCard(null);
                    
                    if (revealedCards.length + 1 === 5) {
                        setTimeout(() => setStage('finished'), 1500);
                    }
                }, 800); 
            }, 100);
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedPack(null);
        setCurrentPool([]);
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutYPercentage(15);
    };

    return (
        <div className="min-h-screen py-10 font-sans text-white relative overflow-hidden select-none">
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
                @keyframes flyOut {
                    0% { transform: translateY(0) scale(0.1) rotateX(90deg); opacity: 0; }
                    40% { transform: translateY(-300px) scale(1) rotateX(0deg) rotateZ(5deg); opacity: 1; z-index: 50; }
                    100% { transform: translateY(1000px) scale(0.5); opacity: 0; }
                }
                .animate-fly-out {
                    animation: flyOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>

            <div className="absolute inset-0 bg-[#0f0f11] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2a30_0%,_#0f0f11_70%)]"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <div className="relative z-20 container mx-auto px-4 mb-8">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh]">
                
                {stage === 'selection' && (
                    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
                        <h1 className="text-4xl md:text-6xl font-black text-center mb-4 tracking-tighter drop-shadow-2xl">
                            BOOSTER <span className="text-brand-primary">SHOP</span>
                        </h1>
                        <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
                            Choose your destiny. Will you clone the ultimate power or discover the mythical ancestor?
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 md:px-20">
                            {/* LAMB CHOP (MEWTWO) */}
                            <button 
                                onClick={() => selectPack('lamb')}
                                className="group relative aspect-[3/4] rounded-[2rem] transition-transform duration-500 hover:scale-105 hover:-rotate-1"
                            >
                                <div className="absolute inset-0 bg-purple-600 blur-3xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-[2rem] border-[6px] border-purple-500/50 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    
                                    {/* Tech Crimp */}
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-black/40 border-b border-purple-500/30 flex items-center justify-center space-x-1">
                                        {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-3 bg-purple-500/20 rounded-full"></div>)}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/40 border-t border-purple-500/30"></div>

                                    {/* Art */}
                                    <div className="absolute inset-x-4 top-16 bottom-16 bg-purple-900/10 rounded-xl flex flex-col items-center justify-center border border-purple-500/20 backdrop-blur-sm">
                                        <div className="text-[7rem] filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-500 mb-2">🧬</div>
                                        <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Genetic Pack</div>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-16 left-0 right-0 text-center">
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-md transform -rotate-2">Lamb Chop</h2>
                                        <p className="text-purple-300 text-xs font-mono uppercase tracking-[0.2em] mt-1">Mewtwo Edition</p>
                                    </div>
                                </div>
                            </button>

                            {/* WAGYU (MEW) */}
                            <button 
                                onClick={() => selectPack('wagyu')}
                                className="group relative aspect-[3/4] rounded-[2rem] transition-transform duration-500 hover:scale-105 hover:rotate-1"
                            >
                                <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-rose-400 via-pink-500 to-rose-900 rounded-[2rem] border-[6px] border-pink-300/50 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                    
                                    {/* Soft Crimp */}
                                    <div className="absolute top-0 left-0 right-0 h-5 bg-white/10 border-b border-white/20"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-white/10 border-t border-white/20"></div>

                                    {/* Art */}
                                    <div className="absolute inset-x-4 top-16 bottom-16 bg-pink-900/10 rounded-xl flex flex-col items-center justify-center border border-pink-300/20 backdrop-blur-sm">
                                        <div className="text-[7rem] filter drop-shadow-[0_0_15px_rgba(244,114,182,0.5)] group-hover:scale-110 transition-transform duration-500 mb-2">🫧</div>
                                        <div className="bg-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Mythic Pack</div>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-16 left-0 right-0 text-center">
                                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200 italic tracking-tighter uppercase drop-shadow-sm transform -rotate-2">Wagyu A5</h2>
                                        <p className="text-pink-100 text-xs font-mono uppercase tracking-[0.2em] mt-1 text-shadow">Mew Edition</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                    <div className="relative w-full max-w-4xl flex flex-col items-center">
                        
                        <div className="mb-8 h-12 flex items-center justify-center w-full relative z-30">
                            {!isCut ? (
                                <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 animate-pulse">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/90">
                                        SWIPE TOP TO OPEN ✂️
                                    </h2>
                                </div>
                            ) : stage !== 'finished' ? (
                                <div className="bg-brand-primary/20 backdrop-blur-md px-6 py-2 rounded-full border border-brand-primary/50 animate-in fade-in zoom-in duration-300">
                                    <h2 className="text-lg font-bold uppercase tracking-widest text-brand-primary">
                                        TAP PACK TO REVEAL ({5 - revealedCards.length} LEFT)
                                    </h2>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-green-500/50">
                                    <h2 className="text-xl font-black uppercase text-green-400">OPENING COMPLETE!</h2>
                                </div>
                            )}
                        </div>

                        <div className="relative h-[500px] w-full flex justify-center items-center perspective-1000">
                            <div 
                                ref={packRef}
                                className={`relative w-[300px] h-[420px] cursor-pointer ${shakePack ? 'animate-shake' : ''}`}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                                onClick={handlePackClick}
                            >
                                {!isCut && (
                                    <svg 
                                        ref={svgRef}
                                        className="absolute inset-[-200px] w-[calc(100%+400px)] h-[calc(100%+400px)] z-50 pointer-events-auto touch-none"
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        onTouchMove={handleMouseMove}
                                        onTouchEnd={handleMouseUp}
                                    >
                                        <defs>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <polyline 
                                            points={trail.map(p => `${p.x},${p.y}`).join(' ')}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#glow)"
                                            style={{ opacity: 0.8 }}
                                        />
                                    </svg>
                                )}

                                {!isCut && (
                                    <div className="absolute top-[15%] left-[-20px] right-[-20px] h-0 border-t-2 border-dashed border-white/30 z-40 pointer-events-none flex items-center justify-between px-2 opacity-50">
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2">✂️</span>
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2 rotate-180">✂️</span>
                                    </div>
                                )}

                                {dispensingCard && (
                                    <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none">
                                        <div className="animate-fly-out">
                                            <TradingCard card={dispensingCard} />
                                        </div>
                                    </div>
                                )}

                                {/* --- TOP HALF (CUT) --- */}
                                <div 
                                    className={`
                                        absolute inset-0 z-20 
                                        rounded-[2rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        transition-all duration-500 ease-out origin-bottom-left
                                        ${selectedPack === 'lamb' 
                                            ? 'from-indigo-900 via-purple-900 to-black border-purple-500/50' 
                                            : 'from-rose-400 via-pink-500 to-rose-900 border-pink-300/50'}
                                    `}
                                    style={{
                                        clipPath: `inset(0 0 ${100 - cutYPercentage}% 0)`,
                                        transform: isCut ? `translate(${cutVisuals.x}px, ${cutVisuals.y}px) rotate(${cutVisuals.rotate}deg)` : 'none',
                                        opacity: isCut ? 0 : 1,
                                    }}
                                >
                                    <div className={`absolute inset-0 ${selectedPack === 'lamb' ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"} opacity-20`}></div>
                                    
                                    {/* Icon */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90 pb-8 pt-12">
                                        <div className={`text-[7rem] mb-2 ${selectedPack === 'lamb' ? 'filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'filter drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]'}`}>
                                            {selectedPack === 'lamb' ? '🧬' : '🫧'}
                                        </div>
                                        <div className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${selectedPack === 'lamb' ? 'bg-purple-500' : 'bg-pink-400'}`}>
                                            {selectedPack === 'lamb' ? 'Genetic Pack' : 'Mythic Pack'}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>
                                    <div className="absolute top-0 left-0 right-0 h-5 bg-black/20 border-b border-white/10"></div>
                                    <div className="absolute left-0 w-full h-1 bg-white/50 blur-[1px]" style={{ bottom: `${100 - cutYPercentage}%` }}></div>
                                </div>

                                {/* --- BOTTOM HALF (BODY) --- */}
                                <div 
                                    className={`
                                        absolute inset-0 z-10
                                        rounded-[2rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        ${selectedPack === 'lamb' 
                                            ? 'from-indigo-900 via-purple-900 to-black border-purple-500/50' 
                                            : 'from-rose-400 via-pink-500 to-rose-900 border-pink-300/50'}
                                    `}
                                    style={{
                                        clipPath: `inset(${cutYPercentage}% 0 0 0)`
                                    }}
                                >
                                    <div className={`absolute inset-0 ${selectedPack === 'lamb' ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"} opacity-20`}></div>
                                    
                                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90 pb-8 pt-12">
                                        <div className={`text-[7rem] mb-2 ${selectedPack === 'lamb' ? 'filter drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'filter drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]'}`}>
                                            {selectedPack === 'lamb' ? '🧬' : '🫧'}
                                        </div>
                                        <div className={`text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest ${selectedPack === 'lamb' ? 'bg-purple-500' : 'bg-pink-400'}`}>
                                            {selectedPack === 'lamb' ? 'Genetic Pack' : 'Mythic Pack'}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-black/20 border-t border-white/10"></div>
                                    <div className="absolute left-0 w-full h-1 bg-white/30 blur-[1px]" style={{ top: `${cutYPercentage}%` }}></div>
                                    
                                    {isCut && (
                                        <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" style={{ top: `${cutYPercentage}%` }}></div>
                                    )}
                                </div>

                                {/* INNER GLOW */}
                                <div className={`absolute inset-4 blur-2xl z-0 transition-opacity duration-500 ${selectedPack === 'lamb' ? 'bg-purple-500/40' : 'bg-pink-400/40'}`}
                                     style={{ 
                                         top: `${cutYPercentage}%`, 
                                         height: '20%', 
                                         opacity: isCut ? 1 : 0 
                                     }}>
                                </div>

                            </div>
                        </div>

                        <div className="w-full max-w-5xl mt-2">
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4 text-center">Revealed Cards</h3>
                            
                            <div className="flex flex-wrap justify-center gap-4 min-h-[320px]">
                                {revealedCards.map((card, idx) => (
                                    <div 
                                        key={idx} 
                                        className="animate-in zoom-in-50 fade-in duration-500 slide-in-from-top-10"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <TradingCard card={card} className="w-40 h-60 hover:z-50 hover:scale-110 cursor-pointer shadow-xl" />
                                    </div>
                                ))}
                                
                                {revealedCards.length === 0 && stage !== 'finished' && (
                                    <div className="w-full h-60 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                        <p className="text-gray-600 font-mono text-sm">Cards will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {stage === 'finished' && (
                            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-4 mb-20">
                                <button 
                                    onClick={resetGame}
                                    className="bg-brand-primary hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-wider"
                                >
                                    Open Another Pack
                                </button>
                                <Link 
                                    to="/minecraft"
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-10 rounded-full transition-colors uppercase tracking-wider text-center"
                                >
                                    Back to Menu
                                </Link>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Gacha;
