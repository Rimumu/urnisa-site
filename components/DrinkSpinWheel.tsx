import React, { useState, useEffect, useRef } from 'react';
import { DrinkWheelItem, DrinkSpinRecord } from '../hooks/useDrinkingEvent';

const SEGMENT_COLORS = [
    '#581c25',
    '#1a0b0e',
    '#e5383b',
    '#3a1017',
];

const CocktailGlassIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8" />
        <path d="M12 11v11" />
        <path d="m19 3-7 8-7-8Z" />
        <path d="M15 3l3-2" />
    </svg>
);

const SparkleWheelIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1.25L14.2 4.4H9.8L12 1.25Z" fill="currentColor" stroke="none" />
        <path d="M12 13L12 4.5A8.5 8.5 0 0 1 18.01 6.99Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L20.5 13A8.5 8.5 0 0 1 18.01 19.01Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L12 21.5A8.5 8.5 0 0 1 5.99 19.01Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L3.5 13A8.5 8.5 0 0 1 5.99 6.99Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <circle cx="12" cy="13" r="8.5" />
        <path d="M12 4.5V21.5" />
        <path d="M3.5 13H20.5" />
        <path d="M5.99 6.99L18.01 19.01" />
        <path d="M18.01 6.99L5.99 19.01" />
        <circle cx="12" cy="13" r="2.2" fill="#140608" />
        <circle cx="12" cy="13" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);

interface DrinkSpinWheelProps {
    items: DrinkWheelItem[];
    activeSpin: DrinkSpinRecord | null;
    isAdmin?: boolean;
    availableSpins?: number;
    nextSpinIn?: number;
    shotsPerSpin?: number;
    onSpinEarned?: () => void;
    onSpinFree?: () => void;
    spinningRequest?: boolean;
    compact?: boolean;
    size?: 'compact' | 'md' | 'lg';
}

const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const getCoordinatesForPercent = (percent: number, radius = 500) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
};

const DrinkSpinWheel: React.FC<DrinkSpinWheelProps> = ({
    items,
    activeSpin,
    isAdmin = false,
    availableSpins = 0,
    nextSpinIn = 5,
    shotsPerSpin = 5,
    onSpinEarned,
    onSpinFree,
    spinningRequest = false,
    compact = false,
    size,
}) => {
    const safeItems = items.length > 0 ? items : [{ label: 'Take a Shot', weight: 10 }];
    const [isAnimating, setIsAnimating] = useState(false);
    const [revealedSpin, setRevealedSpin] = useState<DrinkSpinRecord | null>(null);
    const wheelRef = useRef<SVGGElement>(null);
    const centerImgRef = useRef<HTMLImageElement>(null);
    const rotationRef = useRef(0);
    const lastSpinIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (!activeSpin) {
            setIsAnimating(false);
            return;
        }

        if (lastSpinIdRef.current === activeSpin.spinId) {
            return;
        }
        lastSpinIdRef.current = activeSpin.spinId;

        const now = Date.now();
        const revealMs = new Date(activeSpin.revealAt).getTime();
        const remainingMs = Math.max(0, revealMs - now);

        const count = safeItems.length;
        const clampedIndex = Math.min(Math.max(0, activeSpin.winningIndex), count - 1);
        const segmentAngle = 360 / count;
        const winningSegmentCenter = (clampedIndex * segmentAngle) + (segmentAngle / 2);

        // Deterministic jitter from spinId so every connected client lands identically
        const norm = (hashString(activeSpin.spinId) % 1000) / 1000;
        const jitter = (norm - 0.5) * segmentAngle * 0.65;
        const targetAngleLocal = 270 - (winningSegmentCenter + jitter);

        const currentRotation = rotationRef.current;
        const currentMod = ((currentRotation % 360) + 360) % 360;
        let distance = ((targetAngleLocal % 360) + 360) % 360 - currentMod;
        if (distance < 0) distance += 360;

        if (remainingMs > 350) {
            const fullRotations = Math.max(3, Math.round(remainingMs / 1000)) * 360;
            const nextRotation = currentRotation + distance + fullRotations;
            rotationRef.current = nextRotation;

            setIsAnimating(true);
            setRevealedSpin(null);

            const rafId = window.requestAnimationFrame(() => {
                const transitionValue = `transform ${remainingMs}ms cubic-bezier(0.15, 0, 0.1, 1)`;
                const transformValue = `rotate(${nextRotation}deg)`;
                if (wheelRef.current) {
                    wheelRef.current.style.transition = transitionValue;
                    wheelRef.current.style.transform = transformValue;
                }
                if (centerImgRef.current) {
                    centerImgRef.current.style.transition = transitionValue;
                    centerImgRef.current.style.transform = transformValue;
                }
            });

            const timerId = window.setTimeout(() => {
                setIsAnimating(false);
                setRevealedSpin(activeSpin);
            }, remainingMs);

            return () => {
                window.cancelAnimationFrame(rafId);
                window.clearTimeout(timerId);
            };
        } else {
            const nextRotation = currentRotation + distance;
            rotationRef.current = nextRotation;
            const transformValue = `rotate(${nextRotation}deg)`;
            if (wheelRef.current) {
                wheelRef.current.style.transition = 'none';
                wheelRef.current.style.transform = transformValue;
            }
            if (centerImgRef.current) {
                centerImgRef.current.style.transition = 'none';
                centerImgRef.current.style.transform = transformValue;
            }
            setIsAnimating(false);
            setRevealedSpin(activeSpin);
        }
    }, [activeSpin, safeItems.length]);

    const resolvedSize = size || (compact ? 'compact' : 'md');
    const lightsCount = 24;
    const isBusy = isAnimating || spinningRequest;
    const sizeClasses = resolvedSize === 'compact'
        ? 'w-[260px] h-[260px] sm:w-[300px] sm:h-[300px]'
        : resolvedSize === 'lg'
            ? 'w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] xl:w-[540px] xl:h-[540px]'
            : 'w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px]';

    const labelFontSize = safeItems.length >= 9 ? 26 : safeItems.length >= 7 ? 30 : 34;

    return (
        <div className="flex flex-col items-center gap-6 w-full">
            <div className={`relative ${sizeClasses} select-none my-4`}>
                {/* Top Gold Stopper / Pointer */}
                <div className={`absolute left-1/2 -translate-x-1/2 z-30 drop-shadow-md pointer-events-none ${
                    resolvedSize === 'lg' ? '-top-6 sm:-top-7' : '-top-5'
                }`}>
                    <svg
                        width={resolvedSize === 'lg' ? '54' : '42'}
                        height={resolvedSize === 'lg' ? '64' : '50'}
                        viewBox="0 0 60 70"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M30 70C30 70 55 25 55 15C55 6.71573 43.8071 0 30 0C16.1929 0 5 6.71573 5 15C5 25 30 70 30 70Z"
                            fill="#f7c548"
                            stroke="#3a1017"
                            strokeWidth="3.5"
                        />
                        <circle cx="30" cy="15" r="6" fill="#3a1017" />
                    </svg>
                </div>

                {/* Outer Speakeasy Rim + Bulbs */}
                <div className={`absolute rounded-full bg-[#120507] border-[#3a1017] shadow-[0_0_50px_rgba(229,56,59,0.22)] z-0 ${
                    resolvedSize === 'lg'
                        ? 'inset-[-16px] sm:inset-[-20px] border-[7px] sm:border-[8px]'
                        : 'inset-[-14px] border-[6px]'
                }`}>
                    {Array.from({ length: lightsCount }).map((_, i) => {
                        const angleRad = ((i / lightsCount) * 2 * Math.PI) - Math.PI / 2;
                        const xPct = 50 + Math.cos(angleRad) * 47.4;
                        const yPct = 50 + Math.sin(angleRad) * 47.4;
                        return (
                            <div
                                key={i}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                                    resolvedSize === 'lg' ? 'w-2.5 h-2.5 sm:w-3 sm:h-3' : 'w-2 h-2 sm:w-2.5 sm:h-2.5'
                                } ${
                                    isAnimating
                                        ? (i % 2 === 0 ? 'bg-brand-accent animate-ping' : 'bg-yellow-100/80')
                                        : (i % 2 === 0 ? 'bg-brand-accent/85' : 'bg-yellow-100/50')
                                }`}
                                style={{ left: `${xPct}%`, top: `${yPct}%` }}
                            />
                        );
                    })}
                </div>

                {/* Main SVG Wheel */}
                <div className="absolute inset-0 rounded-full border-[8px] border-[#1a0b0e] overflow-hidden z-10 bg-[#1a0b0e]">
                    <svg viewBox="-500 -500 1000 1000" className="w-full h-full">
                        <defs>
                            <filter id="drinkWheelShadow">
                                <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodColor="rgba(0,0,0,0.65)" />
                            </filter>
                        </defs>
                        <g ref={wheelRef} style={{ transformOrigin: '0 0' }}>
                            {safeItems.map((item, index) => {
                                const startAngle = index / safeItems.length;
                                const endAngle = (index + 1) / safeItems.length;
                                const [startX, startY] = getCoordinatesForPercent(startAngle, 500);
                                const [endX, endY] = getCoordinatesForPercent(endAngle, 500);
                                const largeArcFlag = endAngle - startAngle > 0.5 ? 1 : 0;

                                const pathData = safeItems.length === 1
                                    ? 'M 0 -500 A 500 500 0 1 1 0 500 A 500 500 0 1 1 0 -500 Z'
                                    : [
                                        'M 0 0',
                                        `L ${startX} ${startY}`,
                                        `A 500 500 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                        'L 0 0',
                                    ].join(' ');

                                const sliceAngle = 360 / safeItems.length;
                                const rotateAngle = (index * sliceAngle) + (sliceAngle / 2);
                                const displayText = item.label.length > 20 ? `${item.label.slice(0, 18)}…` : item.label;

                                return (
                                    <g key={`${item.label}-${index}`}>
                                        <path
                                            d={pathData}
                                            fill={SEGMENT_COLORS[index % SEGMENT_COLORS.length]}
                                            stroke="#1a0b0e"
                                            strokeWidth="4"
                                        />
                                        <g transform={`rotate(${rotateAngle}) translate(290, 0)`}>
                                            <text
                                                x="0"
                                                y="0"
                                                fill="#ffffff"
                                                textAnchor="middle"
                                                dominantBaseline="central"
                                                fontSize={labelFontSize}
                                                fontWeight="700"
                                                fontFamily="Poppins, sans-serif"
                                                filter="url(#drinkWheelShadow)"
                                            >
                                                {displayText}
                                            </text>
                                        </g>
                                    </g>
                                );
                            })}
                        </g>
                    </svg>
                </div>

                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                    {isAdmin ? (
                        <button
                            type="button"
                            onClick={() => {
                                if (!isBusy && availableSpins > 0 && onSpinEarned) {
                                    onSpinEarned();
                                }
                            }}
                            disabled={isBusy || availableSpins <= 0}
                            className={`rounded-full bg-[#1a0b0e] border-[4px] border-[#f7c548] flex flex-col items-center justify-center shadow-xl transition-all ${
                                resolvedSize === 'lg' ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24'
                            } ${
                                isBusy || availableSpins <= 0
                                    ? 'opacity-80 cursor-not-allowed'
                                    : 'cursor-pointer hover:scale-105 active:scale-95'
                            }`}
                            title={availableSpins > 0 ? 'Spin earned wheel' : 'No earned spins available yet'}
                        >
                            <span className="font-black text-base sm:text-lg text-[#f7c548] tracking-widest leading-none">
                                {isBusy ? '...' : 'SPIN'}
                            </span>
                            {!isBusy && (
                                <span className="text-[10px] font-mono tabular-nums text-white/75 mt-1">
                                    {availableSpins > 0 ? `${availableSpins} READY` : 'LOCKED'}
                                </span>
                            )}
                        </button>
                    ) : (
                        <div className={`rounded-full bg-[#1a0b0e] border-[4px] border-[#f7c548] flex items-center justify-center shadow-xl overflow-hidden ${
                            resolvedSize === 'lg' ? 'w-24 h-24 sm:w-32 sm:h-32' : 'w-20 h-20 sm:w-24 sm:h-24'
                        }`}>
                            <img
                                ref={centerImgRef}
                                src="/assets/aistudio/nisa-nomnom_d38a94a6.png"
                                alt="Nisa brand emblem"
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover p-1 rounded-full"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Revealed Winning Outcome Banner */}
            {revealedSpin && !isAnimating && (
                <div className="w-full max-w-md rounded-2xl bg-gradient-to-r from-[#3a1017]/90 via-[#1a0b0e] to-[#3a1017]/90 border border-brand-accent/45 px-5 py-4 text-center shadow-[0_0_28px_rgba(247,197,72,0.18)] animate-in fade-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-accent">
                        <SparkleWheelIcon className="w-3.5 h-3.5" />
                        <span>{revealedSpin.isFreeSpin ? 'Latest Wheel Spin' : 'Milestone Wheel Spin Result'}</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-white mt-1">
                        {revealedSpin.reward}
                    </div>
                    <div className="text-[11px] font-mono tabular-nums text-gray-400 mt-1">
                        Spun at {revealedSpin.shotCountAtSpin} served shot{revealedSpin.shotCountAtSpin === 1 ? '' : 's'}
                    </div>
                </div>
            )}

            {/* Admin Controls */}
            {isAdmin && (
                <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    <button
                        type="button"
                        disabled={isBusy || availableSpins <= 0}
                        onClick={onSpinEarned}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
                    >
                        {isBusy ? 'Spinning Wheel...' : `Spin Earned Wheel (${availableSpins})`}
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={onSpinFree}
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 px-4 py-2.5 rounded-xl bg-brand-accent/15 hover:bg-brand-accent text-brand-accent hover:text-black border border-brand-accent/35 text-xs font-black uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
                    >
                        Free Admin Spin
                    </button>
                </div>
            )}
        </div>
    );
};

export default DrinkSpinWheel;
