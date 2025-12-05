
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';

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
    description?: string; // Kept in interface but not used in UI
    hp?: number; 
}

// --- MOCK DATA ---
const MOCK_CARDS: CardData[] = [
    { 
        id: 1, 
        name: "Wooloo", 
        type: 'Pokemon', 
        subType: "Normal", 
        rarity: 'Common', 
        hp: 60, 
        description: "Its fleece is extremely fluffy.", 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/831.png" 
    },
    { 
        id: 2, 
        name: "Rare Candy", 
        type: 'Item', 
        subType: "Consumable", 
        rarity: 'Rare', 
        description: "Level up.", 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png" 
    },
    { 
        id: 3, 
        name: "Miltank", 
        type: 'Pokemon', 
        subType: "Normal", 
        rarity: 'Common', 
        hp: 110, 
        description: "Moo.", 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/241.png" 
    },
    { 
        id: 4, 
        name: "Master Ball", 
        type: 'Item', 
        subType: "Ball", 
        rarity: 'Ultra', 
        description: "Catch anything.", 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" 
    },
    { 
        id: 5, 
        name: "Mewtwo", 
        type: 'Pokemon', 
        subType: "Psychic", 
        rarity: 'Legendary', 
        hp: 150, 
        description: "Genetic Pokemon.", 
        image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" 
    },
];

// --- COMPONENTS ---

const TradingCard: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    // Rarity styles
    let borderClass = "border-gray-600";
    let glowClass = "";
    let holoEffect = "";
    let badgeColor = "bg-gray-700 text-gray-300";

    if (card.rarity === 'Common') {
        borderClass = "border-gray-400";
    } else if (card.rarity === 'Rare') {
        borderClass = "border-blue-400";
        glowClass = "shadow-[0_0_15px_rgba(96,165,250,0.5)]";
        badgeColor = "bg-blue-900/80 text-blue-200 border border-blue-500/30";
        holoEffect = "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/20 after:to-transparent after:opacity-50 after:pointer-events-none";
    } else if (card.rarity === 'Ultra') {
        borderClass = "border-purple-500";
        glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.6)]";
        badgeColor = "bg-purple-900/80 text-purple-200 border border-purple-500/30";
        holoEffect = "foil-holo"; 
    } else if (card.rarity === 'Legendary') {
        borderClass = "border-yellow-400";
        glowClass = "shadow-[0_0_25px_rgba(250,204,21,0.7)]";
        badgeColor = "bg-yellow-900/80 text-yellow-200 border border-yellow-500/30";
        holoEffect = "foil-holo"; 
    }

    return (
        <div className={`relative w-48 h-72 rounded-xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
            {/* Holographic Overlay */}
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay ${holoEffect}`}></div>}
            
            {/* Background Image / Art */}
            <div className="absolute inset-0 bg-[#1a1a1a] z-0">
                {/* Fallback pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                
                {/* Main Artwork - Padded bottom to avoid text overlap */}
                <div className="absolute inset-0 p-4 pb-20 flex items-center justify-center z-10">
                    <OptimizedImage 
                        src={card.image || `https://via.placeholder.com/300?text=${card.name}`} 
                        alt={card.name}
                        className="w-full h-full transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        contain={true}
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
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    
    // Dynamic Split Logic
    // We store where the cut happened (0-100%) to visually split the pack at that exact line
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
        setStage('cutting');
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutCoords(null);
        setCutYPercentage(15); // Default visual guide position
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) {
            setCutCoords({ start: pt, end: pt });
            setTrail([{ ...pt, id: Date.now() }]); // Start trail immediately
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        // ONLY update trail if dragging
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
        // Coordinates relative to the SVG overlay
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
        
        // 1. Check Horizontal Length (Must cover width of pack approx)
        if (Math.abs(dx) < 200) return;

        // 2. Check Flatness (Angle)
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const isHorizontal = (Math.abs(angle) < 30) || (Math.abs(angle) > 150);
        if (!isHorizontal) return;

        // 3. Check Vertical Position (Validation + Real Time Calculation)
        // SVG Offset is 200px. Pack Height is 420px.
        // Pack starts at Y=200 in SVG coords.
        const avgY = (cutCoords.start.y + cutCoords.end.y) / 2;
        
        // Calculate where the cut is relative to the pack (0px to 420px)
        const relativeY = avgY - 200;
        
        // Calculate Percentage (0% is top, 100% is bottom)
        const percentage = (relativeY / 420) * 100;

        // Valid Zone: STRICT 10% to 15%
        if (percentage >= 10 && percentage <= 15) {
            triggerCut(percentage);
        } else {
            setCutCoords(null);
        }
    };

    const triggerCut = (exactPercentage: number) => {
        setCutYPercentage(exactPercentage);

        // Generate random physics for the top piece
        // Less extreme ranges to prevent flying off screen
        const randomRotate = (Math.random() * 20) - 10; // +/- 10 deg
        const randomX = (Math.random() * 60) - 30; // +/- 30px
        const randomY = -80 - (Math.random() * 40); // Up 80-120px

        setCutVisuals({
            rotate: randomRotate,
            x: randomX,
            y: randomY
        });

        setIsCut(true);
        setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard) return; // Wait for current animation

        if (revealedCards.length < 5) {
            // Shake effect
            setShakePack(true);
            setTimeout(() => setShakePack(false), 300);

            const nextCard = MOCK_CARDS[revealedCards.length];
            
            // Delay dispense slightly to allow shake
            setTimeout(() => {
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
            }, 100);
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedPack(null);
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
                @keyframes holoSheen {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 200%; }
                }
                @keyframes flyOut {
                    0% { transform: translateY(0) scale(0.1) rotateX(90deg); opacity: 0; }
                    40% { transform: translateY(-300px) scale(1) rotateX(0deg) rotateZ(5deg); opacity: 1; z-index: 50; }
                    100% { transform: translateY(1000px) scale(0.5); opacity: 0; } /* Fall "into" the grid */
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

            {/* New Background: TCG Playmat Style */}
            <div className="absolute inset-0 bg-[#0f0f11] z-0">
                {/* Radial Gradient Spotlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2a30_0%,_#0f0f11_70%)]"></div>
                {/* Hex Pattern Texture */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                {/* Subtle Grid */}
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            {/* Nav Back */}
            <div className="relative z-20 container mx-auto px-4 mb-8">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
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
                        
                        {/* HEADER - NOW EMPTY FOR SPACING, TEXT MOVED BELOW */}
                        <div className="h-4 mb-4"></div>

                        {/* GAME AREA CONTAINER */}
                        <div className="relative h-[500px] w-full flex justify-center items-center perspective-1000">
                            
                            {/* PACK ITSELF */}
                            <div 
                                ref={packRef}
                                className={`relative w-[300px] h-[420px] cursor-pointer ${shakePack ? 'animate-shake' : ''}`}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                                onClick={handlePackClick}
                            >
                                {/* SVG INTERACTION LAYER (ALWAYS ON TOP) - Only show if not cut yet */}
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

                                {/* VISUAL GUIDE LINE (Dashed) - Indicates general cut area */}
                                {!isCut && (
                                    <div className="absolute top-[15%] left-[-20px] right-[-20px] h-0 border-t-2 border-dashed border-white/30 z-40 pointer-events-none flex items-center justify-between px-2 opacity-50">
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2">✂️</span>
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2 rotate-180">✂️</span>
                                    </div>
                                )}

                                {/* DISPENSING CARD (ANIMATED) */}
                                {dispensingCard && (
                                    <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none">
                                        <div className="animate-fly-out">
                                            <TradingCard card={dispensingCard} />
                                        </div>
                                    </div>
                                )}

                                {/* --- PACK VISUALS (REAL-TIME SPLIT) --- */}
                                
                                {/* 
                                    Instead of two predefined divs, we render the EXACT SAME pack content twice.
                                    The Top Div is clipped to show only the top part (based on cutYPercentage).
                                    The Bottom Div is clipped to show only the bottom part.
                                */}

                                {/* TOP HALF - DYNAMIC HEIGHT */}
                                <div 
                                    className={`
                                        absolute inset-0 z-20 
                                        rounded-[2rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        transition-all duration-500 ease-out origin-bottom-left
                                        ${selectedPack === 'lamb' ? 'from-red-500 to-red-900 border-white/20' : 'from-gray-900 to-black border-yellow-500/30'}
                                    `}
                                    style={{
                                        // Dynamic Clip Path for Straight Cut
                                        clipPath: `inset(0 0 ${100 - cutYPercentage}% 0)`,
                                        transform: isCut ? `translate(${cutVisuals.x}px, ${cutVisuals.y}px) rotate(${cutVisuals.rotate}deg)` : 'none',
                                        opacity: isCut ? 0 : 1,
                                    }}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    
                                    {/* Content (duplicated) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-90 pb-8">
                                        <div className="text-[8rem]">{selectedPack === 'lamb' ? '🍖' : '🥩'}</div>
                                    </div>
                                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>

                                    {/* Crimp Top */}
                                    <div className="absolute top-0 left-0 right-0 h-4 bg-black/20 border-b border-white/10"></div>
                                    
                                    {/* Cut Edge Highlight (Bottom of top piece) */}
                                    <div className="absolute left-0 w-full h-1 bg-white/50 blur-[1px]" style={{ bottom: `${100 - cutYPercentage}%` }}></div>
                                </div>

                                {/* BOTTOM HALF - DYNAMIC HEIGHT */}
                                <div 
                                    className={`
                                        absolute inset-0 z-10
                                        rounded-[2rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        ${selectedPack === 'lamb' ? 'from-red-500 to-red-900 border-white/20' : 'from-gray-900 to-black border-yellow-500/30'}
                                    `}
                                    style={{
                                        // Dynamic Clip Path for Straight Cut
                                        clipPath: `inset(${cutYPercentage}% 0 0 0)`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                    
                                    {/* Content (duplicated) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-90 pb-8">
                                        <div className="text-[8rem]">{selectedPack === 'lamb' ? '🍖' : '🥩'}</div>
                                    </div>
                                    <div className="absolute bottom-16 left-0 right-0 text-center pointer-events-none">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>

                                    {/* Crimp Bottom */}
                                    <div className="absolute bottom-0 left-0 right-0 h-4 bg-black/20 border-t border-white/10"></div>
                                    
                                    {/* Cut Edge Highlight (Top of bottom piece) */}
                                    <div className="absolute left-0 w-full h-1 bg-white/30 blur-[1px]" style={{ top: `${cutYPercentage}%` }}></div>
                                    
                                    {/* Inner Shadow to simulate depth when open */}
                                    {isCut && (
                                        <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" style={{ top: `${cutYPercentage}%` }}></div>
                                    )}
                                </div>

                                {/* INNER GOLDEN GLOW (Behind split) */}
                                <div className="absolute inset-4 bg-yellow-400/30 blur-2xl z-0 transition-opacity duration-500"
                                     style={{ 
                                         top: `${cutYPercentage}%`, 
                                         height: '20%', 
                                         opacity: isCut ? 1 : 0 
                                     }}>
                                </div>

                            </div>
                        </div>

                        {/* STATUS TEXT (MOVED BELOW PACK FOR VISIBILITY) */}
                        <div className="mt-6 mb-4 h-12 flex items-center justify-center w-full relative z-30">
                            {!isCut ? (
                                <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 animate-pulse">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/90">
                                        SWIPE TOP TO OPEN ✂️
                                    </h2>
                                </div>
                            ) : stage !== 'finished' ? (
                                <div className="bg-brand-primary/20 backdrop-blur-md px-6 py-2 rounded-full border border-brand-primary/50 animate-in fade-in zoom-in duration-300">
                                    <h2 className="text-lg font-bold uppercase tracking-widest text-brand-primary">
                                        TAP PACK TO DISPENSE ({5 - revealedCards.length} LEFT)
                                    </h2>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-green-500/50">
                                    <h2 className="text-xl font-black uppercase text-green-400">OPENING COMPLETE!</h2>
                                </div>
                            )}
                        </div>

                        {/* INVENTORY GRID (Cards Land Here) */}
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
