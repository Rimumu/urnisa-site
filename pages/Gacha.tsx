
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface Card {
    id: number;
    name: string;
    type: 'pokemon' | 'item';
    rarity: 'common' | 'rare' | 'legendary';
    image?: string;
}

// --- MOCK DATA ---
const MOCK_CARDS: Card[] = [
    { id: 1, name: "Wooloo", type: 'pokemon', rarity: 'common' },
    { id: 2, name: "Rare Candy", type: 'item', rarity: 'rare' },
    { id: 3, name: "Miltank", type: 'pokemon', rarity: 'common' },
    { id: 4, name: "Master Ball", type: 'item', rarity: 'legendary' },
    { id: 5, name: "Shiny Bidoof", type: 'pokemon', rarity: 'legendary' },
];

const Gacha: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [isCut, setIsCut] = useState(false);
    const [revealedCards, setRevealedCards] = useState<Card[]>([]);
    const [packShake, setPackShake] = useState(false);
    
    // Cutting Logic State
    const [isDragging, setIsDragging] = useState(false);
    const [cutPath, setCutPath] = useState<{x: number, y: number}[]>([]);
    const svgRef = useRef<SVGSVGElement>(null);

    // --- HANDLERS ---

    const selectPack = (type: PackType) => {
        setSelectedPack(type);
        setStage('cutting');
        setIsCut(false);
        setRevealedCards([]);
        setCutPath([]);
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) setCutPath([pt]);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || isCut) return;
        const pt = getPoint(e);
        if (pt) {
            setCutPath(prev => [...prev, pt]);
            checkCut(pt);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        // If cut wasn't valid, fade line out
        if (!isCut) {
            setTimeout(() => setCutPath([]), 200);
        }
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

    const checkCut = (currentPt: {x: number, y: number}) => {
        // Simple logic: If path goes from generally left to generally right (or vice versa) 
        // across the middle "meat" of the pack.
        if (cutPath.length < 5) return;
        const start = cutPath[0];
        const distance = Math.sqrt(Math.pow(currentPt.x - start.x, 2) + Math.pow(currentPt.y - start.y, 2));
        
        // If swipe is long enough (simulating a cut)
        if (distance > 200) {
            triggerCut();
        }
    };

    const triggerCut = () => {
        setIsDragging(false);
        setIsCut(true);
        // Play cut sound effect here if we had one
    };

    const handlePackClick = () => {
        if (!isCut) return; // Cannot click until cut

        if (revealedCards.length < 5) {
            // Dispense next card
            setPackShake(true);
            setTimeout(() => setPackShake(false), 200);

            const nextCard = MOCK_CARDS[revealedCards.length];
            setRevealedCards(prev => [...prev, nextCard]);
            
            if (revealedCards.length + 1 === 5) {
                setTimeout(() => setStage('finished'), 1000);
            }
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedPack(null);
        setIsCut(false);
        setRevealedCards([]);
        setCutPath([]);
    };

    return (
        <div className="min-h-screen py-10 font-sans text-white relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[#1a0b0e] z-0">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
            </div>

            {/* Nav Back */}
            <div className="relative z-20 container mx-auto px-4 mb-8">
                <Link to="/minecraft-dev" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
                
                {/* --- SELECTION STAGE --- */}
                {stage === 'selection' && (
                    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <h1 className="text-4xl md:text-5xl font-black text-center mb-2">CHOOSE YOUR CUT</h1>
                        <p className="text-center text-gray-400 mb-12">Select a pack to slice open.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* LAMB CHOP */}
                            <button 
                                onClick={() => selectPack('lamb')}
                                className="group relative h-96 rounded-[3rem] bg-gradient-to-b from-[#fca5a5] to-[#ef4444] p-1 shadow-2xl transition-transform hover:scale-105"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 rounded-[3rem]"></div>
                                <div className="h-full w-full bg-black/10 rounded-[2.8rem] flex flex-col items-center justify-center p-6 border-4 border-white/20 group-hover:border-white/50 transition-colors">
                                    <div className="text-6xl mb-4 transform group-hover:rotate-12 transition-transform">🍖</div>
                                    <h2 className="text-3xl font-black uppercase tracking-widest text-white drop-shadow-md">Lamb Chop</h2>
                                    <p className="text-white/80 font-bold mt-2">Standard Pack</p>
                                </div>
                            </button>

                            {/* WAGYU */}
                            <button 
                                onClick={() => selectPack('wagyu')}
                                className="group relative h-96 rounded-[3rem] bg-gradient-to-b from-[#111] via-[#333] to-[#111] p-1 shadow-2xl transition-transform hover:scale-105 border-2 border-[#f7c548]"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 rounded-[3rem]"></div>
                                <div className="h-full w-full bg-black/10 rounded-[2.8rem] flex flex-col items-center justify-center p-6 border-4 border-[#f7c548]/30 group-hover:border-[#f7c548] transition-colors">
                                    <div className="text-6xl mb-4 transform group-hover:-rotate-12 transition-transform">🥩</div>
                                    <h2 className="text-3xl font-black uppercase tracking-widest text-[#f7c548] drop-shadow-md">Wagyu A5</h2>
                                    <p className="text-[#f7c548]/80 font-bold mt-2">Premium Pack</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- CUTTING & DISPENSING STAGE --- */}
                {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                    <div className="relative w-full max-w-2xl flex flex-col items-center">
                        
                        <h2 className={`text-2xl font-bold uppercase tracking-widest mb-8 transition-all duration-300 ${isCut ? 'opacity-0 h-0' : 'opacity-100'}`}>
                            {isDragging ? "SLICING..." : "SLICE THE PACK!"}
                        </h2>

                        {/* PACK CONTAINER */}
                        <div 
                            className="relative w-72 h-96 cursor-pointer select-none"
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                            onClick={handlePackClick}
                        >
                            {/* SVG Overlay for Slicing Line */}
                            {!isCut && (
                                <svg 
                                    ref={svgRef}
                                    className="absolute inset-[-100px] w-[calc(100%+200px)] h-[calc(100%+200px)] z-50 pointer-events-auto touch-none"
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchMove={handleMouseMove}
                                    onTouchEnd={handleMouseUp}
                                >
                                    {cutPath.length > 1 && (
                                        <polyline 
                                            points={cutPath.map(p => `${p.x},${p.y}`).join(' ')}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            style={{ filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.8))' }}
                                        />
                                    )}
                                </svg>
                            )}

                            {/* THE PACK VISUALS */}
                            <div className={`relative w-full h-full transition-transform duration-100 ${packShake ? 'translate-x-1 translate-y-1' : ''}`}>
                                
                                {/* TOP HALF */}
                                <div className={`
                                    absolute top-0 left-0 w-full h-[55%] z-20 
                                    rounded-t-[2rem] overflow-hidden border-x-4 border-t-4
                                    transition-transform duration-700 ease-out origin-bottom-left
                                    ${selectedPack === 'lamb' ? 'bg-[#ef4444] border-white/20' : 'bg-[#222] border-[#f7c548]/50'}
                                    ${isCut ? '-rotate-12 -translate-y-10 translate-x-[-20px] shadow-xl' : ''}
                                `}>
                                    <div className="absolute inset-0 flex items-center justify-center pt-10">
                                        <span className="text-6xl">{selectedPack === 'lamb' ? '🍖' : '🥩'}</span>
                                    </div>
                                    {/* Pack Label */}
                                    <div className="absolute top-4 left-0 right-0 text-center font-black uppercase text-white/20 text-4xl tracking-tighter">
                                        {selectedPack}
                                    </div>
                                </div>

                                {/* BOTTOM HALF */}
                                <div className={`
                                    absolute bottom-0 left-0 w-full h-[45%] z-20
                                    rounded-b-[2rem] overflow-hidden border-x-4 border-b-4
                                    transition-transform duration-700 ease-out origin-top-right
                                    ${selectedPack === 'lamb' ? 'bg-[#ef4444] border-white/20' : 'bg-[#222] border-[#f7c548]/50'}
                                    ${isCut ? 'rotate-6 translate-y-10 translate-x-[20px] shadow-xl' : ''}
                                `}>
                                    <div className="absolute inset-0 flex items-start justify-center pt-2 opacity-50">
                                        <div className="w-16 h-1 bg-black/20 rounded-full"></div>
                                    </div>
                                </div>
                                
                                {/* INNER CONTENTS (Visible after cut) */}
                                <div className={`absolute inset-4 bg-black/50 rounded-2xl z-10 transition-opacity duration-300 ${isCut ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-full h-full flex items-center justify-center">
                                         {revealedCards.length < 5 ? (
                                             <div className="animate-pulse text-white/50 font-bold uppercase tracking-widest text-xs">Tap to Dispense</div>
                                         ) : (
                                             <div className="text-green-400 font-bold uppercase tracking-widest text-xs">Empty</div>
                                         )}
                                    </div>
                                </div>

                                {/* CUT LINE VISUAL (Static after cut) */}
                                {isCut && (
                                    <div className="absolute top-[55%] left-[-10%] w-[120%] h-1 bg-white shadow-[0_0_20px_white] z-30 rotate-[-12deg] opacity-0 animate-[flash_0.5s_ease-out_forwards]"></div>
                                )}
                            </div>
                        </div>

                        {/* DISPENSED CARDS AREA */}
                        <div className="mt-12 w-full min-h-[140px] flex flex-wrap justify-center gap-4 perspective-1000">
                            {revealedCards.map((card, idx) => (
                                <div 
                                    key={idx}
                                    className="w-24 h-32 md:w-32 md:h-44 bg-white rounded-xl shadow-2xl border-4 border-white animate-[popOut_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards] relative overflow-hidden group hover:scale-110 transition-transform duration-300"
                                    style={{ 
                                        animationDelay: '0ms',
                                        rotate: `${(idx - 2) * 5}deg`, 
                                        translate: `0 ${Math.abs(idx - 2) * 5}px`
                                    }}
                                >
                                    {/* Card Rarity Glow */}
                                    <div className={`absolute inset-0 opacity-20 ${card.rarity === 'legendary' ? 'bg-yellow-500' : card.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                    
                                    <div className="absolute inset-1 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-between p-2">
                                        <div className="text-[8px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider w-full text-center border-b border-gray-100 pb-1">
                                            {card.type}
                                        </div>
                                        <div className="text-2xl md:text-4xl my-1">{card.type === 'pokemon' ? '🐾' : '💊'}</div>
                                        <div className="text-[10px] md:text-xs font-black text-gray-800 text-center leading-tight">
                                            {card.name}
                                        </div>
                                    </div>
                                    
                                    {/* Legendary Effect */}
                                    {card.rarity === 'legendary' && (
                                        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/30 to-transparent animate-pulse pointer-events-none"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* FINISHED STATE ACTIONS */}
                        {stage === 'finished' && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 flex gap-4">
                                <button 
                                    onClick={resetGame}
                                    className="bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
                                >
                                    Open Another Pack
                                </button>
                                <Link 
                                    to="/minecraft-dev"
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-full transition-colors"
                                >
                                    Done
                                </Link>
                            </div>
                        )}

                    </div>
                )}
            </div>

            <style>{`
                @keyframes flash {
                    0% { opacity: 1; transform: scaleX(1); }
                    100% { opacity: 0; transform: scaleX(1.5); }
                }
                @keyframes popOut {
                    0% { opacity: 0; transform: translateY(50px) scale(0.5) rotateX(90deg); }
                    100% { opacity: 1; transform: translateY(0) scale(1) rotateX(0deg); }
                }
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
};

export default Gacha;
