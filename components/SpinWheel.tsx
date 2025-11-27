
import React, { useState, useRef, useEffect } from 'react';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';

const SEGMENT_COLORS = ['#e5383b', '#3a1017']; // brand-primary, brand-bg

const SpinWheel: React.FC = () => {
    const { items, loading } = useWheelSettings();
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const wheelRef = useRef<HTMLDivElement>(null);
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

        setIsSpinning(true);
        setWinner(null);

        // 1. Determine the winner mathematically first
        const winningIndex = pickWinner(items);
        
        // 2. Calculate the angle to land on that winner
        // Wheel setup: 
        // 0 deg = 3 o'clock position in CSS rotation.
        // Pointer is at 12 o'clock (270 degrees relative to 0).
        // To land segment i at the pointer, we need to rotate the wheel such that segment i is at 270 deg.
        
        const segmentAngle = 360 / items.length;
        
        // The center of the winning segment needs to align with the pointer.
        // If segment 0 starts at 0 deg, its center is at segmentAngle/2.
        const winningSegmentCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
        
        // We need to rotate the wheel so that `winningSegmentCenter` ends up at `270` (aka -90).
        // TargetRotation = (CurrentRotation + (Distance to 270))
        // Distance = 270 - winningSegmentCenter.
        // However, we want to spin FORWARD (clockwise).
        // Let's calculate the target absolute angle.
        
        // Add random jitter within the segment (+/- 40% of segment width) so it doesn't always land dead center
        const jitter = (Math.random() - 0.5) * segmentAngle * 0.8;
        
        // Calculate required rotation:
        // We want the final position to be: 270 - winningSegmentCenter + jitter
        // But we must add full spins to ensure it looks like it's spinning.
        
        const currentRotation = rotationRef.current;
        const minSpins = 5 * 360; // 5 full spins
        
        // Calculate the next rotation that satisfies the winning position.
        // We want (FinalRotation % 360) to align the segment to the top.
        // The segment is at `winningSegmentCenter` relative to the wheel's 0.
        // If wheel rotates R degrees, segment is at `winningSegmentCenter + R`.
        // We want `winningSegmentCenter + R = 270 (mod 360)`.
        // => R = 270 - winningSegmentCenter.
        
        let targetRotation = 270 - winningSegmentCenter + jitter;
        
        // Ensure target is greater than current rotation to spin clockwise
        while (targetRotation < currentRotation + minSpins) {
            targetRotation += 360;
        }

        rotationRef.current = targetRotation;

        if (wheelRef.current) {
            wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.15, 0, 0.2, 1)';
            wheelRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
        }

        setTimeout(() => {
            setIsSpinning(false);
            setWinner(items[winningIndex].label);
        }, 4000);
    };

    // SVG Helpers
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20 text-white animate-pulse">
                Loading Wheel...
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center py-10 min-h-[600px] animate-in fade-in duration-700">
            
            <div className="relative w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
                {/* Pointer / Stopper */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                     <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-brand-accent drop-shadow-lg"></div>
                </div>

                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-8 border-brand-accent shadow-[0_0_50px_rgba(229,56,59,0.4)] bg-black z-0"></div>

                {/* The Wheel */}
                <div 
                    ref={wheelRef}
                    className="w-full h-full rounded-full overflow-hidden relative z-10"
                    style={{ transform: `rotate(${rotationRef.current}deg)` }}
                >
                    <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-0">
                        {items.map((item, index) => {
                            // Calculate SVG Path for slice
                            const startAngle = index / items.length;
                            const endAngle = (index + 1) / items.length;
                            const [startX, startY] = getCoordinatesForPercent(startAngle);
                            const [endX, endY] = getCoordinatesForPercent(endAngle);
                            const largeArcFlag = endAngle - startAngle > 0.5 ? 1 : 0;
                            const pathData = [
                                `M 0 0`,
                                `L ${startX} ${startY}`,
                                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                `L 0 0`,
                            ].join(' ');

                            return (
                                <g key={index}>
                                    <path d={pathData} fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]} stroke="#f7c548" strokeWidth="0.01" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Text Labels Overlay */}
                    {items.map((item, index) => {
                         const angle = (360 / items.length) * index + (360 / items.length / 2);
                         return (
                            <div
                                key={index}
                                className="absolute top-1/2 left-1/2 origin-left flex items-center"
                                style={{
                                    transform: `rotate(${angle}deg) translateY(-50%)`,
                                    width: '50%',
                                    height: '2px', // Invisible axis
                                }}
                            >
                                <span 
                                    className="text-white font-bold text-xs md:text-sm uppercase tracking-wider pl-8 md:pl-12 truncate w-full"
                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                                >
                                    {item.label}
                                </span>
                            </div>
                         );
                    })}
                </div>

                {/* Center Cap / Button */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
                    <button
                        onClick={spin}
                        disabled={isSpinning}
                        className={`
                            w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-brand-accent shadow-[0_0_30px_rgba(247,197,72,0.4)]
                            flex items-center justify-center
                            font-black text-brand-secondary text-lg md:text-xl uppercase tracking-widest
                            transition-all duration-300
                            ${isSpinning 
                                ? 'bg-gray-800 cursor-not-allowed scale-95 opacity-80' 
                                : 'bg-gradient-to-br from-brand-accent to-yellow-600 hover:scale-110 hover:shadow-[0_0_50px_rgba(247,197,72,0.6)] cursor-pointer'
                            }
                        `}
                    >
                        {isSpinning ? '...' : 'SPIN'}
                    </button>
                </div>
            </div>

            {/* Winner Display */}
            <div className={`mt-12 transition-all duration-500 transform ${winner ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90'}`}>
                {winner && (
                    <div className="bg-black/60 backdrop-blur-xl border-2 border-brand-accent p-8 rounded-[2rem] text-center shadow-[0_0_50px_rgba(229,56,59,0.3)] animate-bounce-short">
                        <p className="text-brand-accent font-bold uppercase tracking-widest mb-2 text-sm">Winner</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-xl">{winner}</h2>
                    </div>
                )}
            </div>

            {/* Decoration */}
            <div className="mt-8 text-gray-400 text-sm font-mono text-center max-w-md">
                Spend your <span className="text-brand-accent font-bold">Nisaballs</span> to spin the wheel and win special rewards!
            </div>
        </div>
    );
};

export default SpinWheel;
