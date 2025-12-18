
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import UserProfile from '../components/UserProfile';
import { CardData, LAMB_POOL, WAGYU_POOL } from '../data/gachaPoolsDev'; 

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
// Creation Trio Assets
const DIALGA_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/483.png";
const PALKIA_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/484.png";
const GIRATINA_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/487.png";
// Arceus Assets
const ARCEUS_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png";
const DIVINE_EFFECT_IMAGE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/493.png";

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
        holoEffect = "mythic-holo"; 
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
                setImgSrc(data.valid ? primaryUrl : fallback3d);
            } catch (error) {
                setImgSrc(fallback3d);
            }
        };
        verifyImage();
    }, [card]);

    const handleImageError = () => {
        setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`);
    };

    return (
        <div className={`relative rounded-3xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay ${holoEffect}`}></div>}
            
            <div className="absolute inset-0 bg-[#1a1a1a] z-0">
                <div className={`absolute inset-0 ${bgPattern} opacity-20`}></div>
                <div className="absolute inset-0 p-2 md:p-4 pb-16 md:pb-20 flex items-center justify-center z-10">
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
            <div className="absolute bottom-0 left-0 right-0 p-2 md:p-3 z-30 flex flex-col items-center text-center">
                <div className={`mb-1 md:mb-2 px-2 md:px-3 py-0.5 rounded-full text-[8px] md:text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${badgeColor}`}>
                    {card.rarity}
                </div>
                <h3 className="text-white font-black text-sm md:text-lg leading-none mb-1 drop-shadow-md tracking-wide truncate w-full px-1">
                    {card.name}
                </h3>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-mono">{card.subType}</span>
            </div>
        </div>
    );
};

const GachaDev: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    const [cutYPercentage, setCutYPercentage] = useState(15); 
    const [cutVisuals, setCutVisuals] = useState({ rotate: -30, x: -50, y: -150 });
    const [particles, setParticles] = useState<Particle[]>([]);
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    const [shakePack, setShakePack] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [packs, setPacks] = useState({ lambPacks: 0, wagyuPacks: 0 });
    const [processing, setProcessing] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const packRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 150));
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    useEffect(() => {
        if (particles.length === 0) return;
        const interval = setInterval(() => {
            setParticles(prev => prev.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                vy: p.vy + 0.8,
                life: p.life - 0.03
            })).filter(p => p.life > 0));
        }, 16);
        return () => clearInterval(interval);
    }, [particles.length]);

    useEffect(() => {
        fetch(`${DISCORD_API_URL}/api/dev/packs`)
            .then(res => res.json())
            .then(data => { if (data && !data.error) setPacks(data); });
    }, [user]);

    const selectPack = async (type: PackType) => {
        if (!type) return;
        setProcessing(true);
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/dev/packs/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user?.id || 'dev-tester', type })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                if (type === 'lamb') setPacks(p => ({ ...p, lambPacks: data.remaining }));
                else setPacks(p => ({ ...p, wagyuPacks: data.remaining }));
                setSelectedPack(type);
                setCurrentPool(type === 'lamb' ? LAMB_POOL : WAGYU_POOL);
                setStage('cutting');
            }
        } catch (e) { alert("Error opening pack"); } finally { setProcessing(false); }
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) { setCutCoords({ start: pt, end: pt }); setTrail([{ ...pt, id: Date.now() }]); }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const pt = getPoint(e);
        if (pt) { setTrail(prev => [...prev, { ...pt, id: Date.now() }]); if (cutCoords) setCutCoords(prev => prev ? { ...prev, end: pt } : null); }
    };

    const handleMouseUp = () => { if (isDragging && cutCoords) checkCut(); setIsDragging(false); };

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const checkCut = () => {
        if (!cutCoords || !packRef.current || !svgRef.current) return;
        const dx = cutCoords.end.x - cutCoords.start.x;
        const dy = cutCoords.end.y - cutCoords.start.y;
        if (Math.abs(dx) < 100) return;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (!(Math.abs(angle) < 35 || Math.abs(angle) > 145)) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const packRect = packRef.current.getBoundingClientRect();
        const avgY = (cutCoords.start.y + cutCoords.end.y) / 2;
        const offsetInSvg = packRect.top - svgRect.top; 
        const yInPack = avgY - offsetInSvg;
        const percentage = (yInPack / packRect.height) * 100;
        if (percentage >= 5 && percentage <= 25) triggerCut(percentage);
        else setCutCoords(null);
    };

    const triggerCut = (exactPercentage: number) => {
        setCutYPercentage(exactPercentage);
        const newParticles: Particle[] = [];
        const baseColor = selectedPack === 'lamb' ? '#60a5fa' : '#fbbf24';
        const packHeight = packRef.current?.clientHeight || 420;
        const cutY = (exactPercentage / 100) * packHeight;
        for (let i = 0; i < 30; i++) {
            newParticles.push({ id: Date.now() + i, x: Math.random() * 300, y: cutY + (Math.random() * 10 - 5), vx: (Math.random() - 0.5) * 15, vy: (Math.random() - 1) * 15 - 5, color: Math.random() > 0.6 ? '#ffffff' : baseColor, life: 1.0, size: Math.random() * 6 + 2 });
        }
        setParticles(newParticles);
        setCutVisuals({ rotate: (Math.random() * 40) - 20, x: (Math.random() * 200) - 100, y: -400 - (Math.random() * 50) });
        setIsCut(true); setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard || revealedCards.length >= 5) return;
        setShakePack(true);
        setTimeout(() => setShakePack(false), 300);
        const totalWeight = currentPool.reduce((sum, item) => sum + (item.weight || 10), 0);
        let randomNum = Math.random() * totalWeight;
        let nextCard = currentPool[0];
        for (const card of currentPool) {
            if (randomNum < (card.weight || 10)) { nextCard = card; break; }
            randomNum -= (card.weight || 10);
        }
        setDispensingCard(nextCard);
        setTimeout(() => {
            setRevealedCards(prev => {
                const newCards = [nextCard, ...prev];
                if (newCards.length === 5) setTimeout(() => setStage('finished'), 1500);
                return newCards;
            });
            setDispensingCard(null);
        }, 800);
    };

    const resetGame = () => {
        setStage('selection'); setSelectedPack(null); setCurrentPool([]); setIsCut(false);
        setRevealedCards([]); setTrail([]); setParticles([]); setCutYPercentage(15);
    };

    return (
        <div className="min-h-screen py-4 font-sans text-white relative overflow-hidden select-none">
            <style>{`
                .foil-holo { background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%); background-size: 200% 200%; animation: holoSheen 3s infinite linear; }
                .mythic-holo { background: linear-gradient(115deg, transparent 20%, rgba(255,215,0,0.3) 40%, rgba(255,255,255,0.3) 60%, transparent 80%); background-size: 200% 200%; animation: holoSheen 2s infinite linear alternate; }
                @keyframes holoSheen { 0% { background-position: 0% 0%; } 100% { background-position: 200% 200%; } }
                @keyframes flyOut { 0% { transform: translateY(0) scale(0.1) rotateX(90deg); opacity: 0; } 40% { transform: translateY(-300px) scale(1) rotateX(0deg) rotateZ(5deg); opacity: 1; z-index: 50; } 100% { transform: translateY(1000px) scale(0.5); opacity: 0; } }
                .animate-fly-out { animation: flyOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes shake { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
                .animate-shake { animation: shake 0.3s ease-in-out; }
                @keyframes divineDrift { from { background-position: 0 0; } to { background-position: 600px 600px; } }
                .divine-stars { background-image: url('https://www.transparenttextures.com/patterns/stardust.png'); animation: divineDrift 60s linear infinite; }
            `}</style>

            <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

            <div className="relative z-20 container mx-auto px-4 pt-12 flex flex-col items-start gap-4">
                <Link to="/minecraft" className="bg-black/40 px-4 py-2 rounded-full border border-white/5 text-sm">← Back</Link>
                <div className="flex gap-3">
                    <div className="bg-black/60 border border-blue-500/30 rounded-full px-5 py-1.5 flex items-center gap-3">
                        <img src={DIALGA_IMAGE} className="w-8 h-8 object-contain" />
                        <span className="font-black text-blue-400 uppercase text-xs">Creation Trio: {packs.lambPacks}</span>
                    </div>
                    <div className="bg-black/60 border border-yellow-500/30 rounded-full px-5 py-1.5 flex items-center gap-3">
                        <img src={ARCEUS_IMAGE} className="w-8 h-8 object-contain" />
                        <span className="font-black text-yellow-400 uppercase text-xs">Divine Alpha: {packs.wagyuPacks}</span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh] py-8">
                <div className="w-full max-w-6xl bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-4 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                    
                    {stage === 'selection' && (
                        <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 mt-2 relative z-10">
                            <h1 className="text-4xl md:text-6xl font-black text-center mb-2 tracking-tighter">DEITY <span className="text-blue-500">PACKS</span></h1>
                            <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">Witness the birth of the universe. Choose between the masters of space-time or the Alpha Creator.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 md:px-20">
                                <button onClick={() => selectPack('lamb')} className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden border-[6px] border-blue-500/50 bg-gradient-to-b from-blue-900 via-slate-900 to-black hover:scale-105 transition-all">
                                    <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay"></div>
                                    <div className="absolute top-12 left-0 right-0 text-center z-30">
                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">Creation Trio</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={DIALGA_IMAGE} className="w-64 h-64 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] z-20" />
                                        <img src={PALKIA_IMAGE} className="absolute left-0 w-40 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                        <img src={GIRATINA_IMAGE} className="absolute right-0 w-40 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                    <div className="absolute bottom-10 left-0 right-0 text-center z-30">
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase transform -rotate-1">Temporal</h2>
                                    </div>
                                </button>
                                <button onClick={() => selectPack('wagyu')} className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden border-[6px] border-yellow-500/50 bg-gradient-to-b from-yellow-900 via-orange-950 to-black hover:scale-105 transition-all">
                                    <div className="absolute inset-0 divine-stars opacity-40"></div>
                                    <div className="absolute top-12 left-0 right-0 text-center z-30">
                                        <span className="bg-yellow-600 text-black text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">The Original One</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <img src={ARCEUS_IMAGE} className="w-72 h-72 object-contain drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
                                    </div>
                                    <div className="absolute bottom-10 left-0 right-0 text-center z-30">
                                        <h2 className="text-4xl font-black text-yellow-400 italic tracking-tighter uppercase transform rotate-1">Alpha</h2>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                        <div className="relative w-full max-w-4xl flex flex-col items-center z-10">
                            <div className="mb-4 h-12 flex items-center justify-center w-full z-30">
                                {!isCut ? (
                                    <div className="bg-black/50 px-6 py-2 rounded-full border border-white/10 animate-pulse text-sm font-black uppercase tracking-widest">SLICE DIMENSIONAL VEIL ✂️</div>
                                ) : (
                                    <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20 text-sm font-bold uppercase tracking-widest">TAP TO MANIFEST ({5 - revealedCards.length})</div>
                                )}
                            </div>
                            <div className="relative h-[450px] w-full flex justify-center items-center">
                                <div ref={packRef} onClick={handlePackClick} onMouseDown={handleMouseDown} onTouchStart={handleMouseDown} className={`relative w-[280px] aspect-[280/400] cursor-pointer transition-all ${shakePack ? 'animate-shake' : ''}`}>
                                    <svg ref={svgRef} className="absolute inset-[-100px] w-[calc(100%+200px)] h-[calc(100%+200px)] z-50 pointer-events-auto" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchMove={handleMouseMove} onTouchEnd={handleMouseUp}>
                                        <polyline points={trail.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                    {particles.map(p => <div key={p.id} className="absolute rounded-full pointer-events-none z-50" style={{ left: p.x, top: p.y, width: p.size + 'px', height: p.size + 'px', backgroundColor: p.color, opacity: p.life }} />)}
                                    {dispensingCard && <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none"><div className="animate-fly-out w-48"><TradingCard card={dispensingCard} /></div></div>}
                                    
                                    <div className={`absolute inset-0 z-20 rounded-[3rem] border-[6px] transition-all duration-700 ease-out ${selectedPack === 'lamb' ? 'from-blue-900 to-black border-blue-500/50' : 'from-yellow-900 to-black border-yellow-500/50'} bg-gradient-to-b`} style={{ clipPath: `inset(0 0 ${100 - cutYPercentage}% 0)`, transform: isCut ? `translate(${cutVisuals.x}px, ${cutVisuals.y}px) rotate(${cutVisuals.rotate}deg)` : 'none', opacity: isCut ? 0 : 1 }}>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-80"><img src={selectedPack === 'lamb' ? DIALGA_IMAGE : ARCEUS_IMAGE} className="w-full object-contain" /></div>
                                    </div>
                                    <div className={`absolute inset-0 z-10 rounded-[3rem] border-[6px] ${selectedPack === 'lamb' ? 'from-blue-900 to-black border-blue-500/50' : 'from-yellow-900 to-black border-yellow-500/50'} bg-gradient-to-b`} style={{ clipPath: `inset(${cutYPercentage}% 0 0 0)` }}>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-80"><img src={selectedPack === 'lamb' ? DIALGA_IMAGE : ARCEUS_IMAGE} className="w-full object-contain" /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full mt-4 flex flex-wrap justify-center gap-3 min-h-[250px]">
                                {revealedCards.map((card, idx) => <div key={idx} className="animate-in zoom-in fade-in duration-500"><TradingCard card={card} className="w-36 h-56" /></div>)}
                            </div>
                            {stage === 'finished' && <button onClick={resetGame} className="mt-8 bg-brand-primary font-black py-4 px-12 rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Open More</button>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GachaDev;
