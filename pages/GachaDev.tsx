
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import UserProfile from '../components/UserProfile';
import { CardData, LAMB_POOL, WAGYU_POOL } from '../data/gachaPoolsDev'; // Import from Dev Data

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    size: number;
}

// --- CONSTANTS ---
// Updated Weather Trio Images (Cropped/Tight Versions)
const RAYQUAZA_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1765409570/rayquazaSTILL_dp2prw.png";
const GROUDON_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1765409624/groudonSTILL_n9gwqt.png";
const KYOGRE_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1765409663/kyogreSTILL_ygpasz.png";
// Reverted Jirachi GIF (Big Size) for Pack
const WAGYU_PACK_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1765388052/jirachi_m5e7co.gif";
// Static Jirachi for Counter
const JIRACHI_ICON_IMAGE = "https://res.cloudinary.com/dsencimjn/image/upload/v1765409704/jirachiSTILL_ex5vkd.png";

// --- CACHE ---
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
        borderClass = "border-purple-500";
        glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.6)]";
        badgeColor = "bg-purple-900/80 text-purple-200 border border-purple-500/30";
        holoEffect = "foil-holo"; 
    } else if (card.rarity === 'Legendary') {
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

            // Force 3D Render for broken sprites (Kyogre, Groudon, Jirachi)
            const forced3D = ['kyogre', 'groudon', 'jirachi', 'rayquaza'];
            if (forced3D.includes(card.name.toLowerCase())) {
                setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`);
                return;
            }

            const cobbleName = getFormattedName(card.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            // Fallback 3D Render
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
                // Default to 3D fallback on error
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
        <div className={`relative w-48 h-72 rounded-3xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay ${holoEffect}`}></div>}
            
            <div className="absolute inset-0 bg-[#1a1a1a] z-0">
                <div className={`absolute inset-0 ${bgPattern} opacity-20`}></div>
                {(card.rarity === 'Legendary' || card.rarity === 'Mythical') && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                )}
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

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 z-10 pointer-events-none"></div>

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

            <div className="absolute top-2 right-2 z-30 text-[8px] font-mono text-white/50 bg-black/50 px-1.5 rounded-md">
                #{card.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
};

const GachaDev: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    const [cutYPercentage, setCutYPercentage] = useState(15); 
    const [cutVisuals, setCutVisuals] = useState({ rotate: -30, x: -50, y: -150 });
    const [particles, setParticles] = useState<Particle[]>([]);

    // Dispensing Logic
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    const [shakePack, setShakePack] = useState(false);
    
    // Auth & Packs Logic
    const [user, setUser] = useState<any>(null);
    const [packs, setPacks] = useState({ lambPacks: 0, wagyuPacks: 0 });
    const [processing, setProcessing] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const packRef = useRef<HTMLDivElement>(null);

    // Trail Decay
    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 150));
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    // Particle Physics
    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.8, // Gravity
                life: p.life - 0.03
            })).filter(p => p.life > 0));
        }, 16);
        return () => clearInterval(interval);
    }, [particles.length]);

    // Fetch Packs on mount/user change - DEV MODE USES DEV API
    useEffect(() => {
        // In Dev mode, we just fetch simulated packs so user can test immediately
        fetch(`${DISCORD_API_URL}/api/dev/packs`)
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) setPacks(data);
            })
            .catch(console.error);
    }, [user]);

    // --- AUTO SAVE LOGIC (DEV MOCKED) ---
    const saveToInventory = async (cards: CardData[], packType: PackType) => {
        // Even if no user, we allow testing in dev mode
        try {
            await fetch(`${DISCORD_API_URL}/api/dev/inventory/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user?.id || 'dev-tester',
                    items: cards,
                    packType: packType
                })
            });
            console.log("[DEV] Pack saved (Simulated)");
        } catch (e) {
            console.error("Auto-save failed", e);
        }
    };

    // --- HANDLERS ---

    const selectPack = async (type: PackType) => {
        if (!type) return;
        
        // Optimistic check
        if ((type === 'lamb' && packs.lambPacks < 1) || (type === 'wagyu' && packs.wagyuPacks < 1)) {
            alert("You don't have enough packs! (In Dev Mode this shouldn't happen)");
            return;
        }

        setProcessing(true);
        // Deduct pack (DEV API)
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/dev/packs/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user?.id || 'dev-tester', type })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                // Update local state
                if (type === 'lamb') setPacks(p => ({ ...p, lambPacks: data.remaining }));
                else setPacks(p => ({ ...p, wagyuPacks: data.remaining }));

                // Start Game
                setSelectedPack(type);
                setCurrentPool(type === 'lamb' ? LAMB_POOL : WAGYU_POOL);
                setStage('cutting');
                setIsCut(false);
                setRevealedCards([]);
                setTrail([]);
                setParticles([]);
                setCutCoords(null);
                setCutYPercentage(15);
            } else {
                alert(data.error || "Failed to open pack");
            }
        } catch (e) {
            alert("Network error opening pack");
        } finally {
            setProcessing(false);
        }
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
            if (cutCoords) setCutCoords(prev => prev ? { ...prev, end: pt } : null);
        }
    };

    const handleMouseUp = () => {
        if (isDragging && cutCoords) checkCut();
        setIsDragging(false);
    };

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const checkCut = () => {
        if (!cutCoords) return;
        const dx = cutCoords.end.x - cutCoords.start.x;
        const dy = cutCoords.end.y - cutCoords.start.y;
        
        // Lenient check: Reduced min distance to 150
        if (Math.abs(dx) < 150) return;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        // Lenient check: Increased angle tolerance to 35 degrees
        const isHorizontal = (Math.abs(angle) < 35) || (Math.abs(angle) > 145);
        if (!isHorizontal) return;

        const avgY = (cutCoords.start.y + cutCoords.end.y) / 2;
        const relativeY = avgY - 200;
        const percentage = (relativeY / 420) * 100;

        // Lenient check: Widen vertical range to 5% - 20%
        if (percentage >= 5 && percentage <= 20) {
            triggerCut(percentage);
        } else {
            setCutCoords(null);
        }
    };

    const triggerCut = (exactPercentage: number) => {
        setCutYPercentage(exactPercentage);
        
        // Generate Particles
        const newParticles: Particle[] = [];
        // Switch to Emerald color for Lamb (Weather Trio), Indigo for Wagyu (Wishmaker)
        const baseColor = selectedPack === 'lamb' ? '#10b981' : '#6366f1';
        const cutY = (exactPercentage / 100) * 420;

        for (let i = 0; i < 40; i++) {
            newParticles.push({
                id: Date.now() + i,
                x: Math.random() * 300, // Spread across pack width
                y: cutY + (Math.random() * 10 - 5), // Near cut line
                vx: (Math.random() - 0.5) * 15, // Explosion outward
                vy: (Math.random() - 1) * 15 - 5, // Explosion upward
                color: Math.random() > 0.6 ? '#ffffff' : baseColor,
                life: 1.0,
                size: Math.random() * 6 + 2
            });
        }
        setParticles(newParticles);

        // Dynamic Visuals
        const randomRotate = (Math.random() * 40) - 20; // More rotation
        const randomX = (Math.random() * 200) - 100; // Fly further sideways
        const randomY = -400 - (Math.random() * 50); // Fly further up
        setCutVisuals({ rotate: randomRotate, x: randomX, y: randomY });
        
        setIsCut(true);
        setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard) return;

        if (revealedCards.length < 5) {
            setShakePack(true);
            setTimeout(() => setShakePack(false), 300);

            let eligiblePool = [...currentPool];
            const hasIVCap = revealedCards.some(c => c.subType === 'IV Cap');
            if (hasIVCap) eligiblePool = eligiblePool.filter(c => c.subType !== 'IV Cap');
            
            const totalWeight = eligiblePool.reduce((sum, item) => sum + (item.weight || 10), 0);
            let randomNum = Math.random() * totalWeight;
            let nextCard: CardData | undefined;
            
            for (const card of eligiblePool) {
                const weight = card.weight || 10;
                if (randomNum < weight) {
                    nextCard = card;
                    break;
                }
                randomNum -= weight;
            }
            if (!nextCard) nextCard = eligiblePool[0] || currentPool[0];
            
            setTimeout(() => {
                setDispensingCard(nextCard!);
                setTimeout(() => {
                    setRevealedCards(prev => {
                        const newCards = [nextCard!, ...prev];
                        if (newCards.length === 5) {
                            saveToInventory(newCards, selectedPack);
                            setTimeout(() => setStage('finished'), 1500);
                        }
                        return newCards;
                    });
                    setDispensingCard(null);
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
        setParticles([]);
        setCutYPercentage(15);
        // Refresh Dev balance
        fetch(`${DISCORD_API_URL}/api/dev/packs`)
            .then(res => res.json())
            .then(data => { if (data && !data.error) setPacks(data); });
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
                /* DEV BANNER */
                .dev-stripe {
                    background: repeating-linear-gradient(
                        45deg,
                        #f59e0b,
                        #f59e0b 10px,
                        #000 10px,
                        #000 20px
                    );
                }
                
                /* NEW STAR STYLES */
                @keyframes spaceDrift {
                    from { background-position: 0 0; }
                    to { background-position: 600px 600px; }
                }
                .star-layer-1 {
                    background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
                    background-size: 300px 300px;
                    animation: spaceDrift 60s linear infinite;
                }
                .star-layer-2 {
                    background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
                    background-size: 600px 600px;
                    animation: spaceDrift 80s linear infinite reverse;
                }
            `}</style>

            {/* DEV BANNER */}
            <div className="fixed top-0 left-0 w-full h-2 dev-stripe z-[100] opacity-80"></div>
            <div className="fixed top-2 right-1/2 transform translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-b-xl font-black text-xs uppercase tracking-widest z-[100] shadow-lg border border-white/20">
                DEV ENVIRONMENT
            </div>

            {/* User Profile */}
            <UserProfile 
                onUserChange={setUser} 
                className="!absolute top-4 right-4"
            />

            {/* HEADER */}
            <div className="relative z-20 container mx-auto px-4 pt-12 pb-2 flex flex-col items-start gap-4">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm">
                    <span>←</span> Back to Dashboard
                </Link>

                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                    {/* Lamb Counter (Emerald/Green Theme) */}
                    <div className="bg-black/60 backdrop-blur-md border border-emerald-500/30 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group overflow-hidden">
                        <div className="bg-emerald-500/20 p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden border border-emerald-500/10">
                            <img src={RAYQUAZA_IMAGE} alt="Lamb" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-tight">Lamb Chop</div>
                            <div className="text-lg font-black text-white leading-none">{packs.lambPacks} <span className="text-[10px] text-gray-500">(DEV)</span></div>
                        </div>
                    </div>
                    {/* Wagyu Counter (Indigo Theme with Static Jirachi) */}
                    <div className="bg-black/60 backdrop-blur-md border border-indigo-500/30 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group overflow-hidden">
                        <div className="bg-indigo-500/20 p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden border border-indigo-500/10">
                            <img src={JIRACHI_ICON_IMAGE} alt="Wagyu" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                            <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-tight">Wagyu A5</div>
                            <div className="text-lg font-black text-white leading-none">{packs.wagyuPacks} <span className="text-[10px] text-gray-500">(DEV)</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[70vh] py-8">
                
                {/* WRAPPER CONTAINER - ROUNDED & THEMED */}
                <div className="w-full max-w-6xl bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                    {/* Inner Decor */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

                    {stage === 'selection' && (
                        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 mt-2 relative z-10">
                            <h1 className="text-4xl md:text-6xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                                <span className="text-amber-500">DEV</span> GACHA <span className="text-brand-primary">PACK</span>
                            </h1>
                            <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">
                                Testing Environment. Packs deducted here are simulated.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-20">
                                {/* LAMB CHOP (WEATHER TRIO) */}
                                <button 
                                    onClick={() => selectPack('lamb')}
                                    disabled={processing}
                                    className={`
                                        group relative aspect-[3/4] rounded-[3rem] transition-all duration-500 overflow-hidden
                                        hover:scale-105 hover:-rotate-1 cursor-pointer
                                    `}
                                >
                                    <div className="absolute inset-0 bg-emerald-600 blur-3xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-teal-900 to-black rounded-[3rem] border-[6px] border-emerald-500/50 shadow-2xl overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                        
                                        <div className="absolute top-0 left-0 right-0 h-6 bg-black/40 border-b border-emerald-500/30 flex items-center justify-center space-x-1">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-3 bg-emerald-500/20 rounded-full"></div>)}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/40 border-t border-emerald-500/30"></div>

                                        {/* Badge at Top */}
                                        <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                            <div className="bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-sm">
                                                Legendary Pack
                                            </div>
                                        </div>

                                        {/* Image Composition: Weather Trio (Clustered & Overlapping) */}
                                        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[3rem]">
                                            {/* Rayquaza: Top Center, Z-10, Shifted Down to Clear Badge */}
                                            <img 
                                                src={RAYQUAZA_IMAGE} 
                                                alt="Rayquaza" 
                                                className="absolute top-16 left-1/2 transform -translate-x-1/2 w-72 h-72 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10 transition-transform duration-700 group-hover:scale-110" 
                                            />
                                            {/* Groudon: Bottom Left, Overlapping Rayquaza, Z-20 */}
                                            <img 
                                                src={GROUDON_IMAGE} 
                                                alt="Groudon" 
                                                className="absolute bottom-20 left-4 w-56 h-56 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20 transition-transform duration-700 group-hover:translate-x-2" 
                                            />
                                            {/* Kyogre: Bottom Right, Overlapping Rayquaza, Z-20 */}
                                            <img 
                                                src={KYOGRE_IMAGE} 
                                                alt="Kyogre" 
                                                className="absolute bottom-20 right-4 w-56 h-56 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20 transition-transform duration-700 group-hover:-translate-x-2" 
                                            />
                                        </div>

                                        {/* Text at Bottom */}
                                        <div className="absolute bottom-12 left-0 right-0 text-center z-30">
                                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-md transform -rotate-2">Lamb Chop</h2>
                                            <p className="text-emerald-300 text-xs font-mono uppercase tracking-[0.2em] mt-1">Weather Trio</p>
                                        </div>
                                    </div>
                                </button>

                                {/* WAGYU (JIRACHI) */}
                                <button 
                                    onClick={() => selectPack('wagyu')}
                                    disabled={processing}
                                    className={`
                                        group relative aspect-[3/4] rounded-[3rem] transition-all duration-500 overflow-hidden
                                        hover:scale-105 hover:rotate-1 cursor-pointer
                                    `}
                                >
                                    {/* Pack Chassis remains Indigo as requested */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#312e81] to-[#0f172a] rounded-[3rem] border-[6px] border-indigo-400/50 shadow-2xl overflow-hidden">
                                        {/* NEW STARS BACKGROUND */}
                                        <div className="absolute inset-0 star-layer-1 opacity-30"></div>
                                        <div className="absolute inset-0 star-layer-2 opacity-40 mix-blend-screen"></div>
                                        
                                        <div className="absolute top-0 left-0 right-0 h-6 bg-black/40 border-b border-indigo-500/30 flex items-center justify-center space-x-1">
                                            {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-3 bg-indigo-500/20 rounded-full"></div>)}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/40 border-t border-indigo-500/30"></div>

                                        {/* Badge at Top */}
                                        <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                            <div className="bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-sm">
                                                Mythic Pack
                                            </div>
                                        </div>

                                        {/* Image in Center */}
                                        <div className="absolute inset-0 flex items-center justify-center z-10">
                                            {/* CHANGED: drop-shadow rgba to yellow/gold */}
                                            <img src={WAGYU_PACK_IMAGE} alt="Jirachi" className="w-80 h-80 object-contain drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] group-hover:scale-110 transition-transform duration-500" />
                                        </div>

                                        {/* Text at Bottom */}
                                        <div className="absolute bottom-12 left-0 right-0 text-center z-30">
                                            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 italic tracking-tighter uppercase drop-shadow-sm transform -rotate-2">Wagyu A5</h2>
                                            <p className="text-indigo-100 text-xs font-mono uppercase tracking-[0.2em] mt-1 text-shadow">Wishmaker Edition</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                        <div className="relative w-full max-w-4xl flex flex-col items-center z-10">
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

                                    {/* Particles */}
                                    {particles.map(p => (
                                        <div 
                                            key={p.id}
                                            className="absolute rounded-full pointer-events-none z-50 mix-blend-screen"
                                            style={{
                                                left: p.x,
                                                top: p.y,
                                                width: p.size + 'px',
                                                height: p.size + 'px',
                                                backgroundColor: p.color,
                                                opacity: p.life,
                                                transform: `scale(${p.life})`
                                            }}
                                        />
                                    ))}

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
                                            rounded-[3rem] overflow-hidden bg-gradient-to-b border-[6px]
                                            transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] origin-bottom-left
                                            ${selectedPack === 'lamb' 
                                                ? 'from-emerald-900 via-teal-900 to-black border-emerald-500/50' 
                                                : 'from-[#0f172a] via-[#312e81] to-[#0f172a] border-indigo-400/50'}
                                        `}
                                        style={{
                                            clipPath: `inset(0 0 ${100 - cutYPercentage}% 0)`,
                                            transform: isCut ? `translate(${cutVisuals.x}px, ${cutVisuals.y}px) rotate(${cutVisuals.rotate}deg)` : 'none',
                                            opacity: isCut ? 0 : 1,
                                        }}
                                    >
                                        {/* BACKGROUND LOGIC */}
                                        {selectedPack === 'lamb' ? (
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 star-layer-1 opacity-30"></div>
                                                <div className="absolute inset-0 star-layer-2 opacity-40 mix-blend-screen"></div>
                                            </>
                                        )}
                                        
                                        {/* Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                            {selectedPack === 'lamb' ? (
                                                <>
                                                    <img 
                                                        src={RAYQUAZA_IMAGE} 
                                                        alt="Rayquaza" 
                                                        className="absolute top-16 left-1/2 transform -translate-x-1/2 w-60 h-60 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10" 
                                                    />
                                                    <img 
                                                        src={GROUDON_IMAGE} 
                                                        alt="Groudon" 
                                                        className="absolute bottom-24 left-4 w-40 h-40 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20" 
                                                    />
                                                    <img 
                                                        src={KYOGRE_IMAGE} 
                                                        alt="Kyogre" 
                                                        className="absolute bottom-24 right-4 w-40 h-40 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20" 
                                                    />
                                                </>
                                            ) : (
                                                <img 
                                                    src={WAGYU_PACK_IMAGE} 
                                                    alt="Pack Icon"
                                                    className="w-80 h-80 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                                                />
                                            )}
                                        </div>

                                        {/* Badge */}
                                        <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                            <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-sm ${selectedPack === 'lamb' ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white'}`}>
                                                {selectedPack === 'lamb' ? 'Legendary Pack' : 'Mythic Pack'}
                                            </div>
                                        </div>

                                        {/* Text */}
                                        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-30">
                                            <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200'}`}>
                                                {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                            </h2>
                                        </div>
                                        <div className="absolute top-0 left-0 right-0 h-6 bg-black/20 border-b border-white/10 flex items-center justify-center space-x-1">
                                            {[...Array(10)].map((_, i) => <div key={i} className={`w-1 h-3 rounded-full ${selectedPack === 'lamb' ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}></div>)}
                                        </div>
                                        <div className="absolute left-0 w-full h-1 bg-white/50 blur-[1px]" style={{ bottom: `${100 - cutYPercentage}%` }}></div>
                                    </div>

                                    {/* --- BOTTOM HALF (BODY) --- */}
                                    <div 
                                        className={`
                                            absolute inset-0 z-10
                                            rounded-[3rem] overflow-hidden bg-gradient-to-b border-[6px]
                                            ${selectedPack === 'lamb' 
                                                ? 'from-emerald-900 via-teal-900 to-black border-emerald-500/50' 
                                                : 'from-[#0f172a] via-[#312e81] to-[#0f172a] border-indigo-400/50'}
                                        `}
                                        style={{
                                            clipPath: `inset(${cutYPercentage}% 0 0 0)`
                                        }}
                                    >
                                        {/* BACKGROUND LOGIC */}
                                        {selectedPack === 'lamb' ? (
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 star-layer-1 opacity-30"></div>
                                                <div className="absolute inset-0 star-layer-2 opacity-40 mix-blend-screen"></div>
                                            </>
                                        )}
                                        
                                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                            {selectedPack === 'lamb' ? (
                                                <>
                                                    <img 
                                                        src={RAYQUAZA_IMAGE} 
                                                        alt="Rayquaza" 
                                                        className="absolute top-16 left-1/2 transform -translate-x-1/2 w-60 h-60 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.6)] z-10" 
                                                    />
                                                    <img 
                                                        src={GROUDON_IMAGE} 
                                                        alt="Groudon" 
                                                        className="absolute bottom-24 left-4 w-40 h-40 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.5)] z-20" 
                                                    />
                                                    <img 
                                                        src={KYOGRE_IMAGE} 
                                                        alt="Kyogre" 
                                                        className="absolute bottom-24 right-4 w-40 h-40 object-contain drop-shadow-[0_0_10px_rgba(59,130,246,0.5)] z-20" 
                                                    />
                                                </>
                                            ) : (
                                                <img 
                                                    src={WAGYU_PACK_IMAGE} 
                                                    alt="Pack Icon"
                                                    className="w-80 h-80 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]"
                                                />
                                            )}
                                        </div>

                                        {/* Badge */}
                                        <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                            <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-sm ${selectedPack === 'lamb' ? 'bg-emerald-500' : 'bg-indigo-500 text-white'}`}>
                                                {selectedPack === 'lamb' ? 'Legendary Pack' : 'Mythic Pack'}
                                            </div>
                                        </div>

                                        <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-30">
                                            <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200'}`}>
                                                {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                            </h2>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/20 border-t border-white/10"></div>
                                        <div className="absolute left-0 w-full h-1 bg-white/30 blur-[1px]" style={{ top: `${cutYPercentage}%` }}></div>
                                        
                                        {isCut && (
                                            <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" style={{ top: `${cutYPercentage}%` }}></div>
                                        )}
                                    </div>

                                    {/* INNER GLOW */}
                                    <div className={`absolute inset-4 blur-2xl z-0 transition-opacity duration-500 ${selectedPack === 'lamb' ? 'bg-emerald-500/40' : 'bg-indigo-500/40'}`}
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
                                        <div className="w-full h-60 flex items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                                            <p className="text-gray-600 font-mono text-sm">Cards will appear here...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {stage === 'finished' && (
                                <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-4 mb-20 items-center">
                                    <button 
                                        onClick={resetGame}
                                        className="bg-brand-primary hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-wider"
                                    >
                                        Open Another Pack
                                    </button>
                                    <div className="text-white opacity-50">
                                        (Inventory link disabled in Dev)
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GachaDev;
