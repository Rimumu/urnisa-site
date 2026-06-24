
import React, { useState, useRef } from 'react';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';

// A sophisticated palette matching the site's dark/burgundy/gold theme
const SEGMENT_COLORS = [
    '#581c25', // brand-surface (Lighter Burgundy)
    '#1a0b0e', // Deep Black/Brown
    '#e5383b', // brand-primary (Red)
    '#3a1017', // brand-bg (Dark Burgundy)
];

interface SpinWheelProps {
    disabled?: boolean;
    onSpinEnd?: (winnerLabel: string) => void;
    onUnlockRequest?: () => void;
    overrideItems?: WheelItem[];
}

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const SpinWheel: React.FC<SpinWheelProps> = ({ disabled = false, onSpinEnd, onUnlockRequest, overrideItems }) => {
    const { items: fetchedItems, loading } = useWheelSettings();
    const items = overrideItems || fetchedItems;
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const wheelRef = useRef<SVGGElement>(null); // Ref attached to the rotating SVG group
    const rotationRef = useRef(0);

    // Weighted Random Picker
    const pickWinner = (items: WheelItem[]) => {
        const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            if (random < items[i].weight) {
                return i;
            }
            random -= items[i].weight;
        }
        return 0; // Fallback
    };

    const spin = () => {
        if (isSpinning || items.length === 0) return;
        
        // If disabled (locked), trigger unlock request instead of spinning
        if (disabled) {
            if (onUnlockRequest) onUnlockRequest();
            return;
        }

        setIsSpinning(true);
        setWinner(null);

        // 1. Determine the winner index
        const winningIndex = pickWinner(items);
        
        // 2. Calculate Angles
        const segmentAngle = 360 / items.length;
        
        // Angle of the center of the winning segment relative to 0deg (3 o'clock)
        const winningSegmentCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
        
        // Add random jitter (+/- 40% of segment width) to make it feel physics-based
        const jitter = (Math.random() - 0.5) * segmentAngle * 0.8;
        
        // We want the winning segment to land at 270deg (12 o'clock/Top).
        // Target Rotation (absolute) = 270 - (winningSegmentCenter + jitter).
        const targetAngleLocal = 270 - (winningSegmentCenter + jitter);
        
        const currentRotation = rotationRef.current;
        const currentMod = currentRotation % 360;
        
        // Calculate minimal distance to reach targetAngleLocal from currentMod in clockwise direction
        let distance = targetAngleLocal - currentMod;
        while (distance < 0) {
            distance += 360;
        }
        
        // Add minimum spins (e.g. 5 full rotations)
        const minSpins = 5 * 360;
        const totalRotation = currentRotation + distance + minSpins;

        rotationRef.current = totalRotation;

        if (wheelRef.current) {
            // Use cubic-bezier for a realistic "spin up then friction slow down" feel
            wheelRef.current.style.transition = 'transform 6s cubic-bezier(0.15, 0, 0.1, 1)'; 
            wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }

        setTimeout(() => {
            setIsSpinning(false);
            const wonLabel = items[winningIndex].label;
            setWinner(wonLabel);
            if (onSpinEnd) onSpinEnd(wonLabel);
        }, 6000); // Sync with transition duration
    };

    // Math Helper: Polar to Cartesian
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent) * 500; // Radius 500
        const y = Math.sin(2 * Math.PI * percent) * 500;
        return [x, y];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-white animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-bold tracking-widest uppercase">Loading Wheel...</span>
                </div>
            </div>
        );
    }

    const lightsCount = 24;

    return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[600px] animate-in fade-in duration-700">
            
            <div className="relative w-[340px] h-[340px] md:w-[600px] md:h-[600px]">
                
                {/* Pointer / Stopper */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-md pointer-events-none">
                     <svg width="60" height="70" viewBox="0 0 60 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform origin-top">
                        <path d="M30 70C30 70 55 25 55 15C55 6.71573 43.8071 0 30 0C16.1929 0 5 6.71573 5 15C5 25 30 70 30 70Z" fill="#f7c548" stroke="#3a1017" strokeWidth="3"/>
                        <circle cx="30" cy="15" r="6" fill="#3a1017"/>
                     </svg>
                </div>

                {/* Decorative Outer Ring with Lights */}
                <div className="absolute inset-[-24px] rounded-full bg-[#120507] border-[8px] border-[#3a1017] shadow-xl z-0">
                    {Array.from({ length: lightsCount }).map((_, i) => (
                        <div 
                            key={i}
                            className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-yellow-100/80"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${i * (360 / lightsCount)}deg) translate(0, -190px) md:translate(0, -320px)`,
                                animation: `pulse 1s infinite ${i % 2 === 0 ? '0s' : '0.5s'}`
                            }}
                        />
                    ))}
                    <style>{`
                        @keyframes pulse {
                            0%, 100% { opacity: 0.8; transform: scale(1); }
                            50% { opacity: 0.3; transform: scale(0.9); }
                        }
                    `}</style>
                </div>

                {/* The Wheel Container */}
                <div className="absolute inset-0 rounded-full border-[10px] border-[#1a0b0e] overflow-hidden z-10 bg-[#1a0b0e]">
                    <svg 
                        viewBox="-500 -500 1000 1000" 
                        className="w-full h-full"
                        style={{ overflow: 'visible' }}
                    >
                        <defs>
                            <filter id="textShadow">
                                <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.5)" />
                            </filter>
                        </defs>

                        <g ref={wheelRef} style={{ transformOrigin: '0 0' }}>
                            {items.map((item, index) => {
                                const startAngle = index / items.length;
                                const endAngle = (index + 1) / items.length;
                                const [startX, startY] = getCoordinatesForPercent(startAngle);
                                const [endX, endY] = getCoordinatesForPercent(endAngle);
                                const largeArcFlag = endAngle - startAngle > 0.5 ? 1 : 0;
                                
                                const pathData = [
                                    `M 0 0`,
                                    `L ${startX} ${startY}`,
                                    `A 500 500 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                    `L 0 0`,
                                ].join(' ');

                                const sliceAngle = 360 / items.length;
                                const rotateAngle = (index * sliceAngle) + (sliceAngle / 2);
                                
                                return (
                                    <g key={index}>
                                        <path 
                                            d={pathData} 
                                            fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} 
                                            stroke="#1a0b0e" 
                                            strokeWidth="4" 
                                        />
                                        <g transform={`rotate(${rotateAngle}) translate(300, 0)`}>
                                            <text
                                                x="0"
                                                y="0"
                                                fill="white"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize="32" 
                                                fontWeight="700"
                                                fontFamily="Poppins, sans-serif"
                                                filter="url(#textShadow)"
                                                style={{ letterSpacing: '0.05em' }}
                                            >
                                                {item.label.length > 20 ? item.label.substring(0, 18) + '...' : item.label}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Center Cap / Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <button
                        onClick={spin}
                        disabled={isSpinning} // Only disable visual clicking if spinning. Logic inside handles 'disabled' prop.
                        className={`
                            relative w-24 h-24 md:w-32 md:h-32 rounded-full 
                            bg-[#1a0b0e]
                            border-[4px] border-[#f7c548]
                            flex items-center justify-center
                            shadow-xl
                            group transition-all duration-300
                            ${(isSpinning) ? 'cursor-not-allowed opacity-90' : 'hover:scale-105 active:scale-95 cursor-pointer'}
                        `}
                    >
                        {disabled ? (
                            <LockIcon />
                        ) : (
                            <span className={`
                                font-black text-2xl md:text-3xl text-[#f7c548] tracking-widest
                                drop-shadow-sm
                                ${isSpinning ? '' : 'animate-pulse'}
                            `}>
                                {isSpinning ? '...' : 'SPIN'}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Winner Display Overlay (Full Screen Blur) */}
            {winner && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500 cursor-pointer"
                    onClick={() => setWinner(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
                    
                    {/* Content Card */}
                    <div className="relative z-10 bg-[#1a0b0e] border-[3px] border-brand-accent p-10 md:p-16 rounded-[3rem] text-center shadow-[0_0_100px_rgba(247,197,72,0.3)] max-w-2xl w-full mx-4 overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-brand-accent/10 to-transparent pointer-events-none"></div>
                        
                        <div className="space-y-4 relative">
                            <p className="text-brand-accent font-black uppercase tracking-[0.3em] text-sm md:text-lg animate-pulse">You've spun</p>
                            <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl leading-tight">
                                {winner}
                            </h2>
                            <p className="text-gray-500 text-xs mt-8 uppercase tracking-widest opacity-60">Tap to dismiss</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpinWheel;
