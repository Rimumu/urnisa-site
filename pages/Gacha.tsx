
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface CardData {
    id: number;
    name: string;
    type: 'Pokemon' | 'Item';
    subType: string; // e.g. "Normal", "Tool", "Ball"
    rarity: 'Common' | 'Rare' | 'Legendary' | 'Ultra';
    image?: string;
    description?: string;
    hp?: number; // Just for visuals
}

// --- MOCK DATA ---
const MOCK_CARDS: CardData[] = [
    { id: 1, name: "Wooloo", type: 'Pokemon', subType: "Normal", rarity: 'Common', hp: 60, description: "Its fleece is extremely fluffy. It can roll away from enemies.", image: "https://img.pokemondb.net/artwork/large/wooloo.jpg" },
    { id: 2, name: "Rare Candy", type: 'Item', subType: "Consumable", rarity: 'Rare', description: "Instantly raises the level of a single Pokémon by one.", image: "https://archives.bulbagarden.net/media/upload/a/a2/Dream_Rare_Candy_Sprite.png" },
    { id: 3, name: "Miltank", type: 'Pokemon', subType: "Normal", rarity: 'Common', hp: 110, description: "Its milk is packed with nutrition, making it the ultimate beverage.", image: "https://img.pokemondb.net/artwork/large/miltank.jpg" },
    { id: 4, name: "Master Ball", type: 'Item', subType: "Ball", rarity: 'Ultra', description: "The best Ball with the ultimate level of performance.", image: "https://archives.bulbagarden.net/media/upload/9/95/Dream_Master_Ball_Sprite.png" },
    { id: 5, name: "Shiny Bidoof", type: 'Pokemon', subType: "God", rarity: 'Legendary', hp: 999, description: "The true creator of the universe in a humble form.", image: "https://img.pokemondb.net/artwork/large/bidoof.jpg" },
];

// --- COMPONENTS ---

const TradingCard: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    // Rarity styles
    let borderClass = "border-gray-300";
    let bgGradient = "bg-slate-100";
    let holoEffect = "";

    if (card.rarity === 'Rare') {
        borderClass = "border-blue-400";
        bgGradient = "bg-slate-50";
        holoEffect = "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/30 after:to-transparent after:opacity-50 after:pointer-events-none";
    } else if (card.rarity === 'Legendary' || card.rarity === 'Ultra') {
        borderClass = "border-yellow-400";
        bgGradient = "bg-amber-50";
        holoEffect = "foil-holo"; // Custom CSS class for rainbow shine
    }

    return (
        <div className={`relative w-48 h-72 rounded-xl p-2 shadow-2xl transition-all duration-500 select-none ${bgGradient} border-[6px] ${borderClass} ${className} group overflow-hidden`}>
            {/* Holographic Overlay for high rarity */}
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-30 mix-blend-overlay ${holoEffect}`}></div>}
            
            {/* Card Content Container */}
            <div className="flex flex-col h-full w-full bg-opacity-90 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-center mb-1 px-1">
                    <span className="font-bold text-xs text-gray-800 truncate">{card.name}</span>
                    {card.type === 'Pokemon' && <span className="text-[10px] font-black text-red-600">{card.hp} HP</span>}
                </div>

                {/* Image Area */}
                <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 rounded border-2 border-gray-400/50 shadow-inner overflow-hidden relative mb-2">
                    <img 
                        src={card.image || `https://via.placeholder.com/150?text=${card.name}`} 
                        alt={card.name}
                        className="w-full h-full object-contain p-2 hover:scale-110 transition-transform duration-700"
                    />
                </div>

                {/* Info Bar */}
                <div className="bg-gradient-to-r from-gray-300 to-gray-200 px-2 py-0.5 rounded-full text-[8px] font-bold text-gray-600 uppercase tracking-wider mb-2 shadow-sm text-center">
                    {card.rarity} {card.type}
                </div>

                {/* Description */}
                <div className="flex-1 bg-white/50 rounded border border-gray-200 p-1.5 overflow-hidden">
                    <p className="text-[9px] text-gray-700 leading-tight font-serif italic">
                        {card.description}
                    </p>
                </div>

                {/* Footer */}
                <div className="mt-1 text-[8px] text-gray-400 font-mono text-center">
                    {card.id}/150 • URNISA SET
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const Gacha: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    
    // Dispensing Logic
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    
    const svgRef = useRef<SVGSVGElement>(null);
    const packRef = useRef<HTMLDivElement>(null);

    // --- EFFECT: TRAIL FADING ---
    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 200)); // Keep points for 200ms
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    // --- HANDLERS ---

    const selectPack = (type: PackType) => {
        setSelectedPack(type);
        setStage('cutting');
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutCoords(null);
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) setCutCoords({ start: pt, end: pt });
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        const pt = getPoint(e);
        if (pt) {
            // Add to trail regardless of dragging for visual effect
            setTrail(prev => [...prev, { ...pt, id: Date.now() }]);
            
            if (isDragging && cutCoords) {
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
        if (!packRef.current) return null;
        // Coordinates relative to the VIEWPORT to draw fixed trail on screen, 
        // but for cutting logic we need relative to pack.
        // Let's use relative to SVG overlay which covers the pack container.
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
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Need a decent swipe length
        if (distance > 150) {
            // Calculate angle to ensure it's roughly horizontal (+/- 45 degrees)
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            // Valid horizontal cuts are around 0 or 180 degrees
            const isHorizontal = (Math.abs(angle) < 45) || (Math.abs(angle) > 135);
            
            if (isHorizontal) {
                triggerCut();
            }
        }
    };

    const triggerCut = () => {
        setIsCut(true);
        // Clean up visual state
        setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard) return; // Wait for current animation

        if (revealedCards.length < 5) {
            const nextCard = MOCK_CARDS[revealedCards.length];
            
            // 1. Trigger Fly-Out Animation (Temporary state)
            setDispensingCard(nextCard);

            // 2. After animation, add to list and clear temporary
            setTimeout(() => {
                setRevealedCards(prev => [nextCard, ...prev]);
                setDispensingCard(null);
                
                if (revealedCards.length + 1 === 5) {
                    setTimeout(() => setStage('finished'), 1500);
                }
            }, 800); // Sync with CSS animation duration
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedPack(null);
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
    };

    return (
        <div className="min-h-screen py-10 font-sans text-white relative overflow-hidden select-none">
            <style>{`
                .foil-holo {
                    background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%);
                    background-size: 200% 200%;
                    animation: holoSheen 3s infinite linear;
                }
                @keyframes holoSheen {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 200%; }
                }
                @keyframes flyOut {
                    0% { transform: translateY(0) scale(0.1) rotateX(90deg); opacity: 0; }
                    40% { transform: translateY(-300px) scale(1) rotateX(0deg) rotateZ(10deg); opacity: 1; z-index: 50; }
                    100% { transform: translateY(1000px) scale(0.5); opacity: 0; } /* Fall "into" the grid */
                }
                .animate-fly-out {
                    animation: flyOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes flashWhite {
                    0% { background-color: rgba(255,255,255,0); }
                    10% { background-color: rgba(255,255,255,0.8); }
                    100% { background-color: rgba(255,255,255,0); }
                }
            `}</style>

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#1a0b0e] z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50"></div>
            </div>

            {/* Nav Back */}
            <div className="relative z-20 container mx-auto px-4 mb-8">
                <Link to="/minecraft-dev" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh]">
                
                {/* --- SELECTION STAGE --- */}
                {stage === 'selection' && (
                    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 mt-10">
                        <h1 className="text-4xl md:text-6xl font-black text-center mb-4 tracking-tighter drop-shadow-2xl">
                            BOOSTER <span className="text-brand-primary">SHOP</span>
                        </h1>
                        <p className="text-center text-gray-400 mb-16 max-w-xl mx-auto">
                            Choose your flavor. Each pack contains 5 random items or Pokémon for the server.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-4 md:px-20">
                            {/* LAMB CHOP */}
                            <button 
                                onClick={() => selectPack('lamb')}
                                className="group relative aspect-[3/4] rounded-[2rem] transition-transform duration-500 hover:scale-105 hover:-rotate-1"
                            >
                                {/* Glow */}
                                <div className="absolute inset-0 bg-red-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                
                                {/* Pack Body */}
                                <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-900 rounded-[2rem] border-[6px] border-white/10 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    
                                    {/* Crimp Top/Bottom */}
                                    <div className="absolute top-0 left-0 right-0 h-4 bg-black/20 border-b border-white/10 bg-[length:10px_10px] bg-repeat-x" style={{ backgroundImage: 'linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.3) 50%, transparent 55%)' }}></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20 border-t border-white/10 bg-[length:10px_10px] bg-repeat-x" style={{ backgroundImage: 'linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.3) 50%, transparent 55%)' }}></div>

                                    {/* Art */}
                                    <div className="absolute inset-x-4 top-12 bottom-12 bg-black/20 rounded-xl flex items-center justify-center border border-white/5">
                                        <div className="text-[8rem] filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">🍖</div>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-16 left-0 right-0 text-center">
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-md transform -rotate-2">Lamb Chop</h2>
                                    </div>
                                </div>
                            </button>

                            {/* WAGYU */}
                            <button 
                                onClick={() => selectPack('wagyu')}
                                className="group relative aspect-[3/4] rounded-[2rem] transition-transform duration-500 hover:scale-105 hover:rotate-1"
                            >
                                {/* Glow */}
                                <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-10 group-hover:opacity-30 transition-opacity"></div>
                                
                                {/* Pack Body */}
                                <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black rounded-[2rem] border-[6px] border-yellow-500/30 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    
                                    {/* Crimp */}
                                    <div className="absolute top-0 left-0 right-0 h-4 bg-white/5 border-b border-white/5"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-white/5 border-t border-white/5"></div>

                                    {/* Art */}
                                    <div className="absolute inset-x-4 top-12 bottom-12 bg-yellow-500/5 rounded-xl flex items-center justify-center border border-yellow-500/20">
                                        <div className="text-[8rem] filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">🥩</div>
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-16 left-0 right-0 text-center">
                                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 italic tracking-tighter uppercase drop-shadow-sm transform -rotate-2">Wagyu A5</h2>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- INTERACTIVE STAGE --- */}
                {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                    <div className="relative w-full max-w-4xl flex flex-col items-center">
                        
                        {/* HEADER STATUS */}
                        <div className="h-16 mb-4 flex items-center justify-center">
                            {!isCut ? (
                                <h2 className="text-2xl font-black uppercase tracking-[0.2em] animate-pulse text-white/80">
                                    SWIPE TO OPEN &rarr;
                                </h2>
                            ) : stage !== 'finished' ? (
                                <h2 className="text-xl font-bold uppercase tracking-widest text-brand-primary">
                                    TAP PACK TO DISPENSE ({5 - revealedCards.length} LEFT)
                                </h2>
                            ) : (
                                <h2 className="text-2xl font-black uppercase text-green-500">OPENING COMPLETE!</h2>
                            )}
                        </div>

                        {/* GAME AREA CONTAINER */}
                        <div className="relative h-[500px] w-full flex justify-center items-center perspective-1000">
                            
                            {/* PACK ITSELF */}
                            <div 
                                ref={packRef}
                                className="relative w-[300px] h-[420px] cursor-pointer"
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                                onClick={handlePackClick}
                            >
                                {/* SVG INTERACTION LAYER (ALWAYS ON TOP) */}
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

                                {/* FLASH OVERLAY (Triggers on cut) */}
                                {isCut && (
                                    <div className="absolute inset-0 z-40 pointer-events-none animate-[flashWhite_0.5s_ease-out_forwards] rounded-[2rem]"></div>
                                )}

                                {/* DISPENSING CARD (ANIMATED) */}
                                {dispensingCard && (
                                    <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none">
                                        <div className="animate-fly-out">
                                            <TradingCard card={dispensingCard} />
                                        </div>
                                    </div>
                                )}

                                {/* --- PACK VISUALS (SPLITTABLE) --- */}
                                
                                {/* TOP HALF */}
                                <div className={`
                                    absolute top-0 left-0 w-full h-[30%] z-20 
                                    rounded-t-[2rem] overflow-hidden bg-gradient-to-b
                                    transition-all duration-700 ease-out origin-bottom-left border-t-4 border-x-4
                                    ${selectedPack === 'lamb' ? 'from-red-500 to-red-600 border-white/20' : 'from-gray-800 to-gray-900 border-yellow-500/30'}
                                    ${isCut ? '-rotate-[15deg] -translate-y-24 -translate-x-10 opacity-0' : ''}
                                `}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    {/* Crimp */}
                                    <div className="absolute top-0 left-0 right-0 h-4 bg-black/20 border-b border-white/10"></div>
                                    {/* Label */}
                                    <div className="absolute top-8 left-0 right-0 text-center font-black uppercase text-white/20 text-3xl tracking-tighter">
                                        {selectedPack}
                                    </div>
                                </div>

                                {/* BOTTOM HALF (Container) */}
                                <div className={`
                                    absolute bottom-0 left-0 w-full h-[70%] z-20
                                    rounded-b-[2rem] overflow-hidden bg-gradient-to-b border-b-4 border-x-4
                                    transition-all duration-700 ease-out
                                    ${selectedPack === 'lamb' ? 'from-red-600 to-red-800 border-white/20' : 'from-gray-900 to-black border-yellow-500/30'}
                                    ${isCut ? 'translate-y-4' : ''}
                                `}>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    
                                    {/* Main Art */}
                                    <div className="absolute inset-0 flex items-center justify-center -mt-16 opacity-90">
                                        <div className="text-[8rem]">{selectedPack === 'lamb' ? '🍖' : '🥩'}</div>
                                    </div>

                                    {/* Crimp */}
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20 border-t border-white/10"></div>
                                    
                                    {/* Inner Shadow to simulate depth when open */}
                                    {isCut && (
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent"></div>
                                    )}
                                </div>

                                {/* INNER GOLDEN GLOW (Behind split) */}
                                <div className={`absolute inset-4 top-[30%] bg-yellow-400/20 blur-xl z-10 transition-opacity duration-500 ${isCut ? 'opacity-100' : 'opacity-0'}`}></div>

                            </div>
                        </div>

                        {/* INVENTORY GRID (Cards Land Here) */}
                        <div className="w-full max-w-5xl mt-8">
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4 text-center">Revealed Cards</h3>
                            
                            <div className="flex flex-wrap justify-center gap-4 min-h-[320px]">
                                {revealedCards.map((card, idx) => (
                                    <div 
                                        key={idx} 
                                        className="animate-in zoom-in-50 fade-in duration-500 slide-in-from-top-10"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <TradingCard card={card} className="w-40 h-60 hover:z-50 hover:scale-110" />
                                    </div>
                                ))}
                                
                                {revealedCards.length === 0 && stage !== 'finished' && (
                                    <div className="w-full h-60 flex items-center justify-center border-2 border-dashed border-white/10 rounded-xl">
                                        <p className="text-gray-600 font-mono text-sm">Cards will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* FINISHED ACTIONS */}
                        {stage === 'finished' && (
                            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-4 mb-20">
                                <button 
                                    onClick={resetGame}
                                    className="bg-brand-primary hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-wider"
                                >
                                    Open Another Pack
                                </button>
                                <Link 
                                    to="/minecraft-dev"
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
