import React from 'react';

export const SOJU_BAR_KEYFRAMES = `
@keyframes waveSlide {
    0% { transform: translateX(0px); }
    100% { transform: translateX(32px); }
}
@keyframes waveSlideReverse {
    0% { transform: translateX(32px); }
    100% { transform: translateX(0px); }
}
@keyframes idleLiquidTilt {
    0%, 100% { transform: rotate(8deg) translateY(0px); }
    25% { transform: rotate(8.9deg) translateY(-0.18px); }
    75% { transform: rotate(7.1deg) translateY(0.18px); }
}
@keyframes idleWaveSlide {
    0% { transform: translateX(0px); }
    100% { transform: translateX(32px); }
}
@keyframes idleBubbleRise {
    0%, 62% { transform: translate(0px, 8px) scale(0.55); opacity: 0; }
    70% { opacity: 0.62; }
    88% { transform: translate(0.6px, 2px) scale(0.88); opacity: 0.48; }
    97%, 100% { transform: translate(-0.3px, -1px) scale(0.95); opacity: 0; }
}
@keyframes streamFlowDown {
    0% { transform: translate(-3.36px, -24px); }
    100% { transform: translate(0px, 0px); }
}
@keyframes overflowFlowDown {
    0% { transform: translate(-2.8px, -20px); }
    100% { transform: translate(0px, 0px); }
}
@keyframes splashBounce {
    0% { transform: translateY(1px) scale(0.75); opacity: 0.9; }
    60% { transform: translateY(-2.5px) scale(1.1); opacity: 0.75; }
    100% { transform: translateY(-4px) scale(1.25); opacity: 0; }
}
@keyframes bubbleRise {
    0% { transform: translateY(10px) scale(0.7); opacity: 0; }
    30% { opacity: 0.85; }
    100% { transform: translateY(-18px) scale(1.1); opacity: 0; }
}
@keyframes foamPulse {
    0%, 100% { transform: scale(1) translateY(0px); opacity: 0.92; }
    50% { transform: scale(1.06) translateY(-1px); opacity: 1; }
}
@keyframes dripCascade {
    0%, 100% { transform: scaleY(0.95); opacity: 0.9; }
    50% { transform: scaleY(1.06); opacity: 1; }
}
@keyframes dropletFallLong {
    0% { transform: translate(0px, -1px) scale(0.75); opacity: 0; }
    18% { opacity: 0.95; }
    85% { opacity: 0.9; }
    100% { transform: translate(6.4px, 46px) scale(0.95); opacity: 0; }
}
@keyframes puddleRipple {
    0% { transform: scale(0.55); opacity: 0.9; }
    100% { transform: scale(1.55); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
    .drinks-motion { animation: none !important; }
}
`;

export const BigStreamShotGlass: React.FC<{
    percent: number;
    isPouring: boolean;
    isOverfilled: boolean;
    className?: string;
}> = ({ percent, isPouring, isOverfilled, className = 'w-full h-auto overflow-visible' }) => {
    const clamped = Math.max(0, Math.min(100, percent));
    // Inner wine glass bowl runs from y=12.2 (full rim) to y=52.2 (curved bowl bottom), total 40 units
    const liquidTopY = isOverfilled ? 8.4 : 52.2 - (clamped / 100) * 40;
    const visibleLiquidDepth = isOverfilled ? 40 : Math.max(0, 52.2 - liquidTopY);

    const streamEndY = Math.min(52.2, Math.max(12.5, liquidTopY + 2));
    const gravityDriftX = Math.max(0, streamEndY - 21) * 0.14;
    const streamBottomLeftX = 37.8 + gravityDriftX;
    const streamBottomRightX = 40.4 + gravityDriftX;
    const streamPathD = `M 31.2 8.8 Q 36.2 12.2 37.6 21 L ${streamBottomLeftX.toFixed(1)} ${streamEndY.toFixed(1)} L ${streamBottomRightX.toFixed(1)} ${streamEndY.toFixed(1)} L 40.6 21 Q 39.6 10.2 34.4 5.2 Z`;
    const overflowLeftStreamD = 'M 28.3 11.4 L 32.8 11.9 C 28.4 19.5 26.2 28.8 25.7 38.5 C 25.5 43.5 26.6 50.5 27.9 59.0 L 31.6 90.6 L 29.2 90.8 L 25.4 59.2 C 24.1 50.5 23.1 43.5 23.3 38.2 C 23.8 27.8 25.6 18.8 28.3 11.4 Z';
    const impactX = 39.1 + Math.max(0, liquidTopY - 21) * 0.14;

    return (
        <svg
            viewBox="0 -18 80 120"
            className={className}
            aria-hidden="true"
        >
            <defs>
                <clipPath id="big-stream-shot-glass-clip">
                    <path d="M29.0 10.5 L51.0 10.5 C53.8 21 55.2 30.5 55.2 38.2 C55.2 45.8 51.8 50.6 43.8 52.0 Q40 52.8 36.2 52.0 C28.2 50.6 24.8 45.8 24.8 38.2 C24.8 30.5 26.2 21 29.0 10.5 Z" />
                </clipPath>
                <clipPath id="mini-pour-glass-clip">
                    <path d="M-6.0 -9.2 L6.0 -9.2 L4.5 5.4 C 4.3 6.2 3.6 6.6 2.7 6.6 L-2.7 6.6 C -3.6 6.6 -4.3 6.2 -4.5 5.4 Z" />
                </clipPath>
                <clipPath id="big-stream-flow-clip">
                    <path d={streamPathD} />
                </clipPath>
                <clipPath id="overflow-left-stream-clip">
                    <path d={overflowLeftStreamD} />
                </clipPath>
                <linearGradient id="big-glass-liquid-grad" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#690d12" />
                    <stop offset="55%" stopColor="#e5383b" />
                    <stop offset="100%" stopColor="#f7c548" />
                </linearGradient>
                <linearGradient id="big-glass-stream-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" stopOpacity="0.98" />
                    <stop offset="30%" stopColor="#f7c548" stopOpacity="0.95" />
                    <stop offset="75%" stopColor="#e5383b" stopOpacity="0.92" />
                    <stop offset="100%" stopColor="#f7c548" stopOpacity="0.88" />
                </linearGradient>
                <linearGradient id="big-glass-drip-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="28%" stopColor="#f7c548" />
                    <stop offset="72%" stopColor="#e5383b" />
                    <stop offset="100%" stopColor="#991b1b" />
                </linearGradient>
                <linearGradient id="overflow-dome-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.98" />
                    <stop offset="45%" stopColor="#f7c548" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#e5383b" stopOpacity="0.92" />
                </linearGradient>
                <linearGradient id="mini-shot-glass-wall" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.24" />
                    <stop offset="28%" stopColor="#ffffff" stopOpacity="0.06" />
                    <stop offset="72%" stopColor="#ffffff" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id="mini-shot-glass-base" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.38" />
                </linearGradient>
                <linearGradient id="wine-glass-bowl-fill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                    <stop offset="22%" stopColor="#ffffff" stopOpacity="0.05" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.02" />
                    <stop offset="78%" stopColor="#ffffff" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.18" />
                </linearGradient>
                <linearGradient id="wine-glass-stem-fill" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="35%" stopColor="#ffffff" stopOpacity="0.72" />
                    <stop offset="70%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.42" />
                </linearGradient>
                <linearGradient id="wine-glass-foot-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
                    <stop offset="55%" stopColor="#ffffff" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.34" />
                </linearGradient>
            </defs>

            {/* Ambient glow behind wine glass bowl */}
            {(clamped > 0 || isOverfilled) && (
                <ellipse
                    cx="40"
                    cy="34"
                    rx={isOverfilled ? 24 : 20}
                    ry={isOverfilled ? 28 : 24}
                    fill={isOverfilled ? '#f7c548' : '#e5383b'}
                    opacity={isOverfilled ? 0.28 : 0.18}
                    style={{ filter: 'blur(14px)' }}
                />
            )}

            {/* Overfill Rim Halo & Gold Spill Puddle */}
            {isOverfilled && (
                <>
                    <ellipse
                        cx="40"
                        cy="11.5"
                        rx="15"
                        ry="4"
                        fill="#f7c548"
                        opacity="0.36"
                        className="drinks-motion"
                        style={{ filter: 'blur(7px)', animation: 'foamPulse 1.8s ease-in-out infinite' }}
                    />
                    <ellipse
                        cx="40"
                        cy="93.5"
                        rx="18"
                        ry="3"
                        fill="#f7c548"
                        opacity="0.3"
                        className="drinks-motion"
                        style={{ filter: 'blur(5px)', animation: 'foamPulse 2.2s ease-in-out infinite' }}
                    />
                </>
            )}

            {/* Wine glass translucent crystal body & back rim behind liquid */}
            <path
                d="M 28.5 11.5 C 25.5 21 24.0 30.5 24.0 38.5 C 24.0 46.5 27.5 51.8 35.8 54.6 C 38.0 55.4 38.7 56.3 38.7 58.5 L 41.3 58.5 C 41.3 56.3 42.0 55.4 44.2 54.6 C 52.5 51.8 56.0 46.5 56.0 38.5 C 56.0 30.5 54.5 21 51.5 11.5 A 11.5 2.3 0 0 1 28.5 11.5 Z"
                fill="url(#wine-glass-bowl-fill)"
            />
            <path
                d="M 28.5 11.5 A 11.5 2.3 0 0 1 51.5 11.5"
                fill="rgba(255,255,255,0.06)"
                stroke="rgba(255,255,255,0.42)"
                strokeWidth="1"
            />

            {/* Tilted Pouring Shot Glass & Flowing Still Liquid Stream */}
            {isPouring && (
                <g>
                    {/* Still stream silhouette with continuous downward-flowing highlight streaks */}
                    <path d={streamPathD} fill="url(#big-glass-stream-grad)" opacity="0.95" />
                    <g clipPath="url(#big-stream-flow-clip)">
                        <g
                            className="drinks-motion"
                            style={{ animation: 'streamFlowDown 0.55s linear infinite' }}
                        >
                            {[-3, 21, 45, 69].map((baseY) => {
                                const shiftX = (baseY - 21) * 0.14;
                                return (
                                    <g key={baseY} transform={`translate(${shiftX.toFixed(2)}, ${baseY})`}>
                                        <path
                                            d="M 38.5 0 L 39.4 0 L 40.8 10 L 39.9 10 Z"
                                            fill="#fffbeb"
                                            opacity="0.72"
                                        />
                                        <path
                                            d="M 40.5 13 L 41.2 13 L 42.2 20 L 41.5 20 Z"
                                            fill="#fde68a"
                                            opacity="0.6"
                                        />
                                        <circle cx="41.4" cy="16.5" r="0.65" fill="#ffffff" opacity="0.85" />
                                        <circle cx="39.8" cy="5.2" r="0.6" fill="#fff3c4" opacity="0.78" />
                                    </g>
                                );
                            })}
                        </g>
                    </g>

                    {/* Tilted Shot Glass pouring into the cup */}
                    <g transform="translate(26, -1) rotate(116)">
                        {/* Outer crystal glass body fill */}
                        <path
                            d="M -7.2 -9.5 L 7.2 -9.5 L 5.3 11.2 C 5.1 12.1 4.3 12.6 3.3 12.6 L -3.3 12.6 C -4.3 12.6 -5.1 12.1 -5.3 11.2 Z"
                            fill="url(#mini-shot-glass-wall)"
                        />

                        {/* Heavy thick glass base (sham) */}
                        <path
                            d="M -4.7 6.3 Q 0 7.1 4.7 6.3 L 5.3 11.2 C 5.1 12.1 4.3 12.6 3.3 12.6 L -3.3 12.6 C -4.3 12.6 -5.1 12.1 -5.3 11.2 Z"
                            fill="url(#mini-shot-glass-base)"
                        />

                        {/* Back half of 3D elliptical rim */}
                        <path
                            d="M -7.2 -9.5 A 7.2 1.8 0 0 1 7.2 -9.5"
                            fill="rgba(255,255,255,0.08)"
                            stroke="rgba(255,255,255,0.42)"
                            strokeWidth="0.75"
                        />

                        {/* Liquid inside inner glass cavity (stops above thick glass base) */}
                        <g clipPath="url(#mini-pour-glass-clip)">
                            <path
                                d="M 1.4 -9.8 L 5.4 -1.3 L 7.2 7.2 L 8.2 -9.8 Z"
                                fill="url(#big-glass-liquid-grad)"
                                opacity="0.96"
                            />
                            <line
                                x1="1.4"
                                y1="-9.5"
                                x2="5.4"
                                y2="-1.3"
                                stroke="#fde68a"
                                strokeWidth="1"
                                strokeLinecap="round"
                                opacity="0.9"
                            />
                        </g>

                        {/* Inner cavity wall & base refraction lines */}
                        <path
                            d="M -6.0 -8.8 L -4.5 5.4 C -4.3 6.3 -3.5 6.8 -2.5 6.8 L 2.5 6.8 C 3.5 6.8 4.3 6.3 4.5 5.4 L 6.0 -8.8"
                            fill="none"
                            stroke="rgba(255,255,255,0.34)"
                            strokeWidth="0.65"
                            strokeLinecap="round"
                        />
                        <path
                            d="M -3.9 7.5 Q 0 8.3 3.9 7.5"
                            fill="none"
                            stroke="rgba(255,255,255,0.45)"
                            strokeWidth="0.7"
                            strokeLinecap="round"
                        />

                        {/* Glossy glass specular highlight streaks */}
                        <path
                            d="M -5.4 -7.2 L -4.0 -7.2 L -3.1 5.0 L -4.0 5.0 Z"
                            fill="#ffffff"
                            opacity="0.24"
                        />
                        <path
                            d="M 4.4 -6.0 L 5.2 -6.0 L 4.3 4.5 L 3.7 4.5 Z"
                            fill="#ffffff"
                            opacity="0.14"
                        />

                        {/* Crisp outer shot glass silhouette */}
                        <path
                            d="M -7.2 -9.5 L -5.3 11.2 C -5.1 12.1 -4.3 12.6 -3.3 12.6 L 3.3 12.6 C 4.3 12.6 5.1 12.1 5.3 11.2 L 7.2 -9.5"
                            fill="none"
                            stroke="rgba(255,255,255,0.82)"
                            strokeWidth="1.2"
                            strokeLinejoin="round"
                        />

                        {/* Front half of 3D elliptical rim */}
                        <path
                            d="M -7.2 -9.5 A 7.2 1.8 0 0 0 7.2 -9.5"
                            fill="none"
                            stroke="rgba(255,255,255,0.88)"
                            strokeWidth="1.15"
                            strokeLinecap="round"
                        />
                    </g>
                </g>
            )}

            {/* Liquid body clipped inside large wine glass bowl */}
            <g clipPath="url(#big-stream-shot-glass-clip)">
                <g
                    style={{
                        transform: `translateY(${liquidTopY}px)`,
                        transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                >
                    {isPouring ? (
                        <>
                            {/* Fluid sloshing waves using the exact same liquid gradient as the still state */}
                            <g transform="rotate(8 40 2.5)">
                                <g className="drinks-motion" style={{ animation: 'waveSlideReverse 3.4s linear infinite' }}>
                                    <path
                                        d="M-36 2.5 Q-28 4.1 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5 L108 62.5 L-36 62.5 Z"
                                        fill="url(#big-glass-liquid-grad)"
                                        opacity="0.55"
                                    />
                                    <path
                                        d="M-36 2.5 Q-28 4.1 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5"
                                        fill="none"
                                        stroke="#f7c548"
                                        strokeWidth="0.7"
                                        opacity="0.45"
                                    />
                                </g>
                                <g className="drinks-motion" style={{ animation: 'waveSlide 2.6s linear infinite' }}>
                                    <path
                                        d="M-36 2.5 Q-28 0.9 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5 L108 62.5 L-36 62.5 Z"
                                        fill="url(#big-glass-liquid-grad)"
                                    />
                                    <path
                                        d="M-36 2.5 Q-28 0.9 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5"
                                        fill="none"
                                        stroke="#fde68a"
                                        strokeWidth="0.95"
                                        opacity="0.88"
                                    />
                                </g>
                            </g>

                            {/* Animated pour impact splash & droplets on the liquid surface */}
                            <g transform={`translate(${impactX.toFixed(1)}, 2)`}>
                                <ellipse
                                    cx="0"
                                    cy="0.5"
                                    rx="4.2"
                                    ry="1.4"
                                    fill="#fffbeb"
                                    opacity="0.7"
                                    className="drinks-motion"
                                    style={{ animation: 'splashBounce 0.65s ease-out infinite' }}
                                />
                                <circle
                                    cx="-3.6"
                                    cy="-2.2"
                                    r="0.95"
                                    fill="#fde68a"
                                    className="drinks-motion"
                                    style={{ animation: 'splashBounce 0.7s ease-out infinite 0.1s' }}
                                />
                                <circle
                                    cx="3.8"
                                    cy="-2.6"
                                    r="0.85"
                                    fill="#fffbeb"
                                    className="drinks-motion"
                                    style={{ animation: 'splashBounce 0.6s ease-out infinite 0.25s' }}
                                />
                            </g>

                            {/* Rising bubbles while actively pouring */}
                            {clamped > 4 && (
                                <>
                                    <circle cx="31" cy="11" r="1.4" fill="#fff7d6" className="drinks-motion" style={{ animation: 'bubbleRise 2.1s ease-in infinite' }} />
                                    <circle cx="48" cy="16" r="1.3" fill="#f7c548" className="drinks-motion" style={{ animation: 'bubbleRise 2.7s ease-in infinite 0.5s' }} />
                                    <circle cx="39" cy="21" r="1.6" fill="#ffffff" className="drinks-motion" style={{ animation: 'bubbleRise 1.9s ease-in infinite 1s' }} />
                                    <circle cx="45" cy="27" r="1.2" fill="#fff7d6" className="drinks-motion" style={{ animation: 'bubbleRise 2.4s ease-in infinite 1.4s' }} />
                                </>
                            )}
                        </>
                    ) : (
                        <g
                            className="drinks-motion"
                            style={{
                                transform: 'rotate(8deg)',
                                transformOrigin: '40px 2.5px',
                                animation: 'idleLiquidTilt 8s ease-in-out infinite'
                            }}
                        >
                            <ellipse cx="40" cy="2.6" rx="18" ry="1.8" fill="#f7c548" opacity="0.72" />
                            <g className="drinks-motion" style={{ animation: 'idleWaveSlide 8.5s linear infinite' }}>
                                <path
                                    d="M-36 2.5 Q-28 2.95 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5 L108 62.5 L-36 62.5 Z"
                                    fill="url(#big-glass-liquid-grad)"
                                />
                                <path
                                    d="M-36 2.5 Q-28 2.95 -20 2.5 T-4 2.5 T12 2.5 T28 2.5 T44 2.5 T60 2.5 T76 2.5 T92 2.5 T108 2.5"
                                    fill="none"
                                    stroke="#fde68a"
                                    strokeWidth="0.85"
                                    opacity="0.82"
                                />
                            </g>

                            {/* Infrequent, gentle rising bubbles when resting */}
                            {visibleLiquidDepth >= 4 && (
                                <circle
                                    cx="34.5"
                                    cy={Math.min(7.5, 2.8 + visibleLiquidDepth * 0.25).toFixed(1)}
                                    r="0.85"
                                    fill="#fff7d6"
                                    className="drinks-motion"
                                    style={{ animation: 'idleBubbleRise 9.5s ease-in-out infinite -4.2s', opacity: 0 }}
                                />
                            )}
                            {visibleLiquidDepth >= 7 && (
                                <circle
                                    cx="44.2"
                                    cy={Math.min(11.5, 3.2 + visibleLiquidDepth * 0.35).toFixed(1)}
                                    r="0.72"
                                    fill="#fde68a"
                                    className="drinks-motion"
                                    style={{ animation: 'idleBubbleRise 11.5s ease-in-out infinite 0.4s', opacity: 0 }}
                                />
                            )}
                            {visibleLiquidDepth >= 12 && (
                                <circle
                                    cx="39.4"
                                    cy={Math.min(16.0, 3.6 + visibleLiquidDepth * 0.45).toFixed(1)}
                                    r="0.9"
                                    fill="#ffffff"
                                    className="drinks-motion"
                                    style={{ animation: 'idleBubbleRise 13s ease-in-out infinite 3.5s', opacity: 0 }}
                                />
                            )}
                        </g>
                    )}
                </g>
            </g>

            {/* Crystal Wine Glass Bowl Base Refraction, Stem & Pedestal Foot */}
            <path
                d="M 32.2 51.4 Q 40 54.2 47.8 51.4"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="0.9"
                strokeLinecap="round"
            />
            <path
                d="M 34.8 53.2 Q 40 55.8 45.2 53.2"
                fill="none"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="1.05"
                strokeLinecap="round"
            />
            <path
                d="M 37.0 55.0 Q 40 56.7 43.0 55.0"
                fill="none"
                stroke="rgba(255,255,255,0.52)"
                strokeWidth="0.85"
                strokeLinecap="round"
            />

            {/* Tall Slender Flared Stem */}
            <path
                d="M 36.8 55.4 C 38.2 56.2 38.7 57.2 38.7 59.0 L 38.7 84.5 C 38.7 87.3 37.6 89.0 34.8 90.0 L 45.2 90.0 C 42.4 89.0 41.3 87.3 41.3 84.5 L 41.3 59.0 C 41.3 57.2 41.8 56.2 43.2 55.4 Z"
                fill="url(#wine-glass-stem-fill)"
            />
            <line
                x1="39.5"
                y1="57.4"
                x2="39.5"
                y2="87.8"
                stroke="rgba(255,255,255,0.75)"
                strokeWidth="0.85"
                strokeLinecap="round"
            />

            {/* Circular Pedestal Foot / Base */}
            <ellipse
                cx="40"
                cy="91.2"
                rx="14.5"
                ry="2.4"
                fill="url(#wine-glass-foot-fill)"
                stroke={isOverfilled ? '#f7c548' : clamped > 0 ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.48)'}
                strokeWidth="1.35"
            />
            <path
                d="M 25.5 91.2 L 25.5 92.1 A 14.5 2.4 0 0 0 54.5 92.1 L 54.5 91.2"
                fill="none"
                stroke="rgba(255,255,255,0.52)"
                strokeWidth="1.05"
            />
            <path
                d="M 28.8 91.8 A 11.2 1.5 0 0 0 51.2 91.8"
                fill="none"
                stroke="rgba(255,255,255,0.45)"
                strokeWidth="0.8"
                strokeLinecap="round"
            />
            <path
                d="M 34.8 90.0 Q 40 91.1 45.2 90.0"
                fill="none"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.9"
                strokeLinecap="round"
            />

            {/* Glossy Bowl Wall Reflections */}
            <path
                d="M 28.8 17.5 C 26.4 25.5 25.4 33.0 25.6 39.2 C 25.8 44.2 27.6 48.0 31.0 50.4"
                fill="none"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="1.25"
                strokeLinecap="round"
            />
            <path
                d="M 51.6 18.5 C 53.6 26.0 54.5 33.5 54.2 39.5 C 54.0 43.8 52.4 47.4 49.6 49.8"
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="0.95"
                strokeLinecap="round"
            />

            {/* Crystal Wine Glass Bowl & Stem Outline */}
            <path
                d="M 28.5 11.5 C 25.5 21 24.0 30.5 24.0 38.5 C 24.0 46.5 27.5 51.8 35.8 54.6 C 38.0 55.4 38.7 56.3 38.7 58.5 L 38.7 84.5 C 38.7 87.3 37.6 89.0 34.8 90.0 M 45.2 90.0 C 42.4 89.0 41.3 87.3 41.3 84.5 L 41.3 58.5 C 41.3 56.3 42.0 55.4 44.2 54.6 C 52.5 51.8 56.0 46.5 56.0 38.5 C 56.0 30.5 54.5 21 51.5 11.5"
                fill="none"
                stroke={isOverfilled ? '#f7c548' : clamped > 0 ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.5)'}
                strokeWidth="1.5"
                strokeLinejoin="round"
                strokeLinecap="round"
            />

            {/* Front Half of 3D Elliptical Wine Glass Rim */}
            <path
                d="M 28.5 11.5 A 11.5 2.3 0 0 0 51.5 11.5"
                fill="none"
                stroke={isOverfilled ? '#fde68a' : 'rgba(255,255,255,0.82)'}
                strokeWidth="1.35"
                strokeLinecap="round"
            />

            {/* OVERFILL (> 25 Shots): Brimming Liquid Spill, Flowing Streams, Droplets & Foot Puddle */}
            {isOverfilled && (
                <g>
                    {/* Brimming liquid bulge swelling above the rim */}
                    <path
                        d="M 28.4 11.5 Q 34.0 8.2 40.0 8.6 Q 46.0 9.0 51.6 11.5 A 11.6 2.3 0 0 1 28.4 11.5 Z"
                        fill="url(#overflow-dome-grad)"
                    />
                    {/* Liquid spilling cleanly over the front curved lip */}
                    <path
                        d="M 28.4 11.5 A 11.6 2.3 0 0 0 51.6 11.5 Q 45.8 14.3 40.0 13.8 Q 34.2 13.3 28.4 11.5 Z"
                        fill="url(#overflow-dome-grad)"
                        opacity="0.92"
                    />
                    <path
                        d="M 30.8 10.6 Q 39.6 8.9 48.6 10.8"
                        fill="none"
                        stroke="#fffbeb"
                        strokeWidth="0.9"
                        strokeLinecap="round"
                        opacity="0.85"
                    />

                    {/* Primary left overflowing waterfall stream running down bowl & pouring onto pedestal foot */}
                    <path d={overflowLeftStreamD} fill="url(#big-glass-drip-grad)" opacity="0.96" />
                    <g clipPath="url(#overflow-left-stream-clip)">
                        <g
                            className="drinks-motion"
                            style={{ animation: 'overflowFlowDown 0.7s linear infinite' }}
                        >
                            {[8, 28, 48, 68, 88].map((baseY) => {
                                const shiftX = (baseY - 28) * 0.14;
                                return (
                                    <g key={baseY} transform={`translate(${shiftX.toFixed(2)}, ${baseY})`}>
                                        <path d="M 24.4 0 L 25.1 0 L 26.3 9 L 25.6 9 Z" fill="#fffbeb" opacity="0.72" />
                                        <circle cx="25.9" cy="14" r="0.55" fill="#fde68a" opacity="0.85" />
                                    </g>
                                );
                            })}
                        </g>
                    </g>

                    {/* Front-center thick spill tongue */}
                    <path
                        d="M 33.8 12.1 C 34.6 15.8 35.0 19.6 35.2 22.8 C 35.3 24.8 37.8 24.8 37.9 22.6 C 38.0 19.4 38.4 15.8 39.2 12.4 Z"
                        fill="url(#big-glass-drip-grad)"
                        opacity="0.94"
                        className="drinks-motion"
                        style={{ animation: 'dripCascade 1.9s ease-in-out infinite', transformOrigin: '36.5px 12.2px' }}
                    />
                    <path
                        d="M 36.1 13.5 L 36.4 20.5"
                        stroke="#fffbeb"
                        strokeWidth="0.55"
                        strokeLinecap="round"
                        opacity="0.65"
                    />

                    {/* Right rim overflow rivulet hugging curved bowl */}
                    <path
                        d="M 48.6 11.9 L 51.7 11.4 C 54.4 19.2 56.1 28.4 56.2 38.2 C 56.3 41.2 54.3 41.2 54.1 38.2 C 53.9 29.2 52.4 20.4 49.6 13.2 Z"
                        fill="url(#big-glass-drip-grad)"
                        opacity="0.93"
                        className="drinks-motion"
                        style={{ animation: 'dripCascade 2.3s ease-in-out infinite 0.35s', transformOrigin: '52px 12px' }}
                    />

                    {/* Falling liquid teardrops detaching from front/right spill */}
                    <g transform="translate(55.4, 41.5)">
                        <path
                            d="M 0 -2.2 C 1.0 -0.2 1.3 1.5 0 2.2 C -1.3 1.5 -1.0 -0.2 0 -2.2 Z"
                            fill="#f7c548"
                            className="drinks-motion"
                            style={{ animation: 'dropletFallLong 1.6s ease-in infinite' }}
                        />
                    </g>
                    <g transform="translate(36.6, 25.0)">
                        <path
                            d="M 0 -1.9 C 0.9 -0.1 1.1 1.3 0 1.9 C -1.1 1.3 -0.9 -0.1 0 -1.9 Z"
                            fill="#fde68a"
                            className="drinks-motion"
                            style={{ animation: 'dropletFallLong 1.85s ease-in infinite 0.75s' }}
                        />
                    </g>

                    {/* Overflow pool & splash ripple collected on pedestal foot */}
                    <ellipse
                        cx="35.2"
                        cy="90.8"
                        rx="9.4"
                        ry="1.55"
                        fill="url(#overflow-dome-grad)"
                        opacity="0.92"
                    />
                    <ellipse
                        cx="30.4"
                        cy="90.7"
                        rx="3.4"
                        ry="0.95"
                        fill="none"
                        stroke="#fffbeb"
                        strokeWidth="0.7"
                        className="drinks-motion"
                        style={{ animation: 'puddleRipple 1.1s ease-out infinite', transformOrigin: '30.4px 90.7px' }}
                    />
                </g>
            )}
        </svg>
    );
};

export const SojuBottleGraphic: React.FC = () => {
    return (
        <svg
            viewBox="0 0 76 220"
            className="w-full h-auto overflow-visible drop-shadow-[0_14px_22px_rgba(0,0,0,0.85)]"
            aria-hidden="true"
        >
            <defs>
                {/* Smoked crimson-gold translucent glass matching Steak House Bar palette */}
                <linearGradient id="jinro-glass-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#1f0306" />
                    <stop offset="14%" stopColor="#690d12" />
                    <stop offset="32%" stopColor="#9f1239" />
                    <stop offset="54%" stopColor="#b45309" />
                    <stop offset="76%" stopColor="#881337" />
                    <stop offset="92%" stopColor="#450a0a" />
                    <stop offset="100%" stopColor="#1f0306" />
                </linearGradient>

                {/* Liquid matching BigStreamShotGlass (#690d12 -> #e5383b -> #f7c548) */}
                <linearGradient id="jinro-liquid-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#690d12" stopOpacity="0.92" />
                    <stop offset="52%" stopColor="#e5383b" stopOpacity="0.82" />
                    <stop offset="88%" stopColor="#f7c548" stopOpacity="0.78" />
                    <stop offset="100%" stopColor="#fde68a" stopOpacity="0.85" />
                </linearGradient>

                {/* Metallic crimson & gold ribbed Peach screw cap */}
                <linearGradient id="jinro-cap-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#690d12" />
                    <stop offset="24%" stopColor="#e5383b" />
                    <stop offset="48%" stopColor="#f7c548" />
                    <stop offset="74%" stopColor="#be123c" />
                    <stop offset="100%" stopColor="#450a0a" />
                </linearGradient>

                {/* Warm ivory label with gentle cylindrical shading */}
                <linearGradient id="jinro-label-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e7dbd1" />
                    <stop offset="18%" stopColor="#fffaf5" />
                    <stop offset="78%" stopColor="#fdf4ec" />
                    <stop offset="100%" stopColor="#dccbc0" />
                </linearGradient>

                {/* NISA crimson-to-gold wordmark gradient */}
                <linearGradient id="jinro-word-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9f1239" />
                    <stop offset="55%" stopColor="#e5383b" />
                    <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Ripe crimson-gold peach radial shading */}
                <radialGradient id="peach-fruit-grad" cx="35%" cy="32%" r="72%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="35%" stopColor="#fb923c" />
                    <stop offset="72%" stopColor="#e5383b" />
                    <stop offset="100%" stopColor="#881337" />
                </radialGradient>

                {/* Sliced peach flesh radial shading */}
                <radialGradient id="peach-slice-grad" cx="45%" cy="40%" r="65%">
                    <stop offset="0%" stopColor="#fffbeb" />
                    <stop offset="55%" stopColor="#fed7aa" />
                    <stop offset="100%" stopColor="#fda4af" />
                </radialGradient>

                {/* Bottle body silhouette clip */}
                <clipPath id="jinro-bottle-clip">
                    <path d="M 30 27 L 46 27 L 48.5 67 C 49.5 78 65 87 65 103 L 65 201 C 65 210 58.5 214 50 214 L 26 214 C 17.5 214 11 210 11 201 L 11 103 C 11 87 26.5 78 27.5 67 Z" />
                </clipPath>
            </defs>

            {/* Ground contact shadow */}
            <ellipse cx="38" cy="215.5" rx="22" ry="3.2" fill="#000000" opacity="0.55" />

            {/* Bottle Smoked Crimson-Gold Glass Silhouette */}
            <path
                d="M 30 27 L 46 27 L 48.5 67 C 49.5 78 65 87 65 103 L 65 201 C 65 210 58.5 214 50 214 L 26 214 C 17.5 214 11 210 11 201 L 11 103 C 11 87 26.5 78 27.5 67 Z"
                fill="url(#jinro-glass-grad)"
                stroke="#f7c548"
                strokeOpacity="0.45"
                strokeWidth="0.85"
            />

            {/* Clipped Bottle Interior, Crimson-Gold Liquid, Meniscus, Peach Label & Reflections */}
            <g clipPath="url(#jinro-bottle-clip)">
                {/* Crimson-gold liquid interior starting high in the neck */}
                <rect x="9" y="34" width="58" height="182" fill="url(#jinro-liquid-grad)" />

                {/* Characteristic high-neck golden liquid meniscus */}
                <ellipse cx="38" cy="34" rx="9.2" ry="1.4" fill="#fde68a" fillOpacity="0.92" />
                <path
                    d="M 29.5 34.4 Q 38 35.9 46.5 34.4"
                    fill="none"
                    stroke="#690d12"
                    strokeOpacity="0.65"
                    strokeWidth="0.7"
                />

                {/* Glass neck ring collar shadow */}
                <ellipse cx="38" cy="28" rx="9" ry="1.6" fill="#2a0408" opacity="0.7" />

                {/* Thick dark-crimson glass heel & gold refraction at bottom */}
                <path
                    d="M 11 196 Q 38 203 65 196 L 65 215 L 11 215 Z"
                    fill="#2a0408"
                    opacity="0.82"
                />
                <path
                    d="M 13 199 Q 38 206 63 199"
                    fill="none"
                    stroke="#f7c548"
                    strokeOpacity="0.48"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                />

                {/* Subtle gold embossed NISA near bottle heel */}
                <text
                    x="38"
                    y="206.5"
                    textAnchor="middle"
                    fill="#f7c548"
                    fillOpacity="0.42"
                    fontSize="5.4"
                    fontWeight="800"
                    letterSpacing="2.2"
                >
                    NISA
                </text>

                {/* Signature Sweeping Asymmetric NISA Peach Label */}
                <g>
                    <path
                        d="M 11 131 C 11 114 25 106 47 106 L 65 106 L 65 162 C 65 178 55 186 38 186 L 11 186 Z"
                        fill="url(#jinro-label-grad)"
                        stroke="#f7c548"
                        strokeOpacity="0.55"
                        strokeWidth="0.55"
                    />

                    {/* Faint vertical left-edge micro-text */}
                    <text
                        x="14.2"
                        y="179"
                        fill="#7f1d1d"
                        fontSize="2.2"
                        fontWeight="600"
                        opacity="0.55"
                        transform="rotate(-90 14.2 179)"
                    >
                        NISA BAR · PEACH SOJU
                    </text>

                    {/* Tiny mascot mark at top-right corner of label */}
                    <g opacity="0.35" stroke="#7f1d1d" strokeWidth="0.5" fill="none">
                        <ellipse cx="60.5" cy="113" rx="2.4" ry="1.8" />
                        <circle cx="59.7" cy="111.5" r="0.55" />
                        <circle cx="61.3" cy="111.5" r="0.55" />
                    </g>

                    {/* Iconic Bold Crimson-Gold NISA Wordmark */}
                    <text
                        x="39"
                        y="137.5"
                        textAnchor="middle"
                        fill="url(#jinro-word-grad)"
                        fontSize="18.5"
                        fontWeight="900"
                        letterSpacing="0.5"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
                    >
                        NISA
                    </text>

                    {/* PEACH subtitle */}
                    <text
                        x="39"
                        y="145.2"
                        textAnchor="middle"
                        fill="#9f1239"
                        fontSize="5.4"
                        fontWeight="900"
                        letterSpacing="0.8"
                    >
                        PEACH
                    </text>

                    {/* Whole Peach + Sliced Peach + Perched Mascot */}
                    <g>
                        {/* Whole ripe peach behind */}
                        <ellipse cx="35.6" cy="162.8" rx="7.6" ry="7.9" fill="url(#peach-fruit-grad)" />
                        {/* Peach cleft crease */}
                        <path
                            d="M 35.6 155.4 Q 33.4 161.5 35.8 169.5"
                            fill="none"
                            stroke="#881337"
                            strokeOpacity="0.32"
                            strokeWidth="0.8"
                            strokeLinecap="round"
                        />
                        {/* Gold-tinted leaf on top of whole peach */}
                        <path
                            d="M 35.4 155.4 C 37.8 152.2 42.2 152.6 43.2 155.6 C 40.4 156.6 37.2 156.4 35.4 155.4 Z"
                            fill="#a16207"
                            stroke="#f7c548"
                            strokeOpacity="0.6"
                            strokeWidth="0.4"
                        />
                        <line x1="36.2" y1="155.2" x2="41.2" y2="154.6" stroke="#fde68a" strokeOpacity="0.65" strokeWidth="0.45" />

                        {/* Sliced peach half in front-left */}
                        <ellipse cx="24.2" cy="171.2" rx="5.6" ry="4.9" transform="rotate(-14 24.2 171.2)" fill="#e5383b" />
                        <ellipse cx="24.2" cy="170.5" rx="5.0" ry="4.2" transform="rotate(-14 24.2 170.5)" fill="url(#peach-slice-grad)" />
                        {/* Peach pit cavity */}
                        <ellipse cx="24.6" cy="170.5" rx="1.6" ry="1.2" transform="rotate(-14 24.6 170.5)" fill="#be123c" opacity="0.65" />

                        {/* Cute frog mascot sitting on the sliced peach */}
                        <g>
                            <ellipse cx="22.8" cy="164.4" rx="2.9" ry="2.7" fill="#d97706" />
                            <ellipse cx="23.2" cy="165.0" rx="1.9" ry="1.8" fill="#fffbeb" />
                            <circle cx="21.5" cy="161.2" r="1.2" fill="#d97706" />
                            <circle cx="23.9" cy="161.0" r="1.2" fill="#d97706" />
                            <circle cx="21.5" cy="161.2" r="0.72" fill="#ffffff" />
                            <circle cx="23.9" cy="161.0" r="0.72" fill="#ffffff" />
                            <circle cx="21.65" cy="161.2" r="0.38" fill="#1c070b" />
                            <circle cx="24.05" cy="161.0" r="0.38" fill="#1c070b" />
                            <ellipse cx="20.6" cy="166.9" rx="1.2" ry="0.6" fill="#b45309" />
                            <ellipse cx="24.9" cy="166.9" rx="1.2" ry="0.6" fill="#b45309" />
                            <line x1="24.6" y1="164.2" x2="29.0" y2="171.6" stroke="#b45309" strokeWidth="0.65" strokeLinecap="round" />
                        </g>
                    </g>

                    {/* Custom Korean Brush Calligraphy: 복숭아 (Peach, crimson) + 니사 (Nisa, dark brush script) */}
                    <g transform="rotate(-4 52 164)">
                        {/* 복숭아 (top crimson calligraphy) */}
                        <g
                            fill="none"
                            stroke="#e5383b"
                            strokeWidth="1.05"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {/* 복 */}
                            <path d="M 43.0 153.1 L 43.1 156.0 L 46.3 155.8 L 46.4 152.9" />
                            <path d="M 43.1 154.5 L 46.3 154.4" />
                            <path d="M 44.7 156.1 L 44.7 157.4" />
                            <path d="M 42.3 157.5 C 44.0 157.3 45.6 157.3 47.2 157.5" />
                            <path d="M 43.0 158.8 L 46.4 158.6 C 46.5 159.8 46.4 160.6 46.1 161.4" />

                            {/* 숭 */}
                            <path d="M 51.2 152.8 C 50.4 154.2 49.6 155.1 48.8 155.9" />
                            <path d="M 51.0 154.1 C 51.9 154.7 52.6 155.2 53.3 155.7" />
                            <path d="M 48.5 157.0 C 50.3 156.8 52.0 156.8 53.7 156.9" />
                            <path d="M 51.2 157.0 L 51.2 158.2" />
                            <ellipse cx="51.2" cy="160.0" rx="1.65" ry="1.25" />

                            {/* 아 */}
                            <ellipse cx="56.3" cy="156.5" rx="1.45" ry="1.65" />
                            <path d="M 58.9 152.9 C 58.8 155.6 58.8 158.4 58.9 161.1" />
                            <path d="M 58.9 156.5 L 60.6 156.3" />
                        </g>

                        {/* 니사 (bold dark brush-calligraphy Nisa signature) */}
                        <g
                            fill="none"
                            stroke="#1c070b"
                            strokeWidth="2.05"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {/* 니 */}
                            <path d="M 44.3 165.4 C 44.0 168.8 44.1 171.8 44.3 173.8 C 46.2 174.1 48.0 173.7 49.3 173.1" />
                            <path d="M 50.8 164.0 C 50.5 168.5 50.4 173.0 50.6 177.2" />

                            {/* 사 */}
                            <path d="M 55.6 164.8 C 54.8 168.5 53.5 172.0 52.1 174.5" />
                            <path d="M 54.7 168.6 C 55.9 170.5 56.9 172.2 57.6 173.6" />
                            <path d="M 58.9 163.5 C 58.7 168.2 58.6 172.8 58.8 177.0" />
                            <path d="M 58.8 169.4 C 59.8 169.2 60.7 169.1 61.4 169.3" />
                        </g>
                    </g>
                </g>

                {/* Primary left warm gold-white glass specular highlight */}
                <path
                    d="M 15.5 102 L 15.5 194"
                    stroke="#fef3c7"
                    strokeOpacity="0.62"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                />
                <path
                    d="M 29 30 L 29 66 C 28 77 16 86 15.5 100"
                    fill="none"
                    stroke="#fef3c7"
                    strokeOpacity="0.58"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Center-left soft backlit glass sheen across bottle & label */}
                <path
                    d="M 23 106 L 27.5 106 L 27.5 186 L 23 186 Z"
                    fill="#ffffff"
                    opacity="0.16"
                />
                <path
                    d="M 33.5 34 L 35.5 66 C 36 78 33.5 88 33.5 104"
                    fill="none"
                    stroke="#fde68a"
                    strokeOpacity="0.34"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                />

                {/* Right golden rim highlight */}
                <path
                    d="M 61.5 104 L 61.5 192"
                    stroke="#f7c548"
                    strokeOpacity="0.4"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                />
            </g>

            {/* Dark Crimson & Gold Neck Collar Ring */}
            <rect
                x="28"
                y="24"
                width="20"
                height="4.2"
                rx="1.8"
                fill="#450a0a"
                stroke="#f7c548"
                strokeOpacity="0.62"
                strokeWidth="0.65"
            />
            <line x1="30" y1="25.3" x2="46" y2="25.3" stroke="#fde68a" strokeOpacity="0.55" strokeWidth="0.6" />

            {/* Metallic Crimson-Gold Ribbed Screw Cap */}
            <rect
                x="28.2"
                y="7"
                width="19.6"
                height="17"
                rx="2.8"
                fill="url(#jinro-cap-grad)"
                stroke="#fde68a"
                strokeOpacity="0.7"
                strokeWidth="0.7"
            />
            {/* Cap top gold metallic glint */}
            <line x1="30.5" y1="8.8" x2="45.5" y2="8.8" stroke="#fef08a" strokeOpacity="0.82" strokeWidth="0.85" strokeLinecap="round" />
            {/* Cap horizontal thread ridges */}
            <line x1="28.5" y1="14.5" x2="47.5" y2="14.5" stroke="#450a0a" strokeOpacity="0.58" strokeWidth="0.7" />
            <line x1="28.5" y1="18.2" x2="47.5" y2="18.2" stroke="#450a0a" strokeOpacity="0.62" strokeWidth="0.75" />
            <line x1="28.5" y1="21.4" x2="47.5" y2="21.4" stroke="#2a0408" strokeOpacity="0.68" strokeWidth="0.8" />
            {/* Cap vertical knurling along upper band */}
            <g stroke="#450a0a" strokeOpacity="0.48" strokeWidth="0.7" strokeLinecap="round">
                <line x1="31" y1="9.8" x2="31" y2="13.5" />
                <line x1="33.5" y1="9.8" x2="33.5" y2="13.5" />
                <line x1="36" y1="9.8" x2="36" y2="13.5" />
                <line x1="38.5" y1="9.8" x2="38.5" y2="13.5" />
                <line x1="41" y1="9.8" x2="41" y2="13.5" />
                <line x1="43.5" y1="9.8" x2="43.5" y2="13.5" />
                <line x1="45.5" y1="9.8" x2="45.5" y2="13.5" />
            </g>
        </svg>
    );
};

interface SojuBarShowcaseProps {
    glassFillPercent: number;
    isPouring: boolean;
    isGlassOverfilled: boolean;
    className?: string;
}

export const SojuBarShowcase: React.FC<SojuBarShowcaseProps> = ({
    glassFillPercent,
    isPouring,
    isGlassOverfilled,
    className = 'relative w-full max-w-[380px] sm:max-w-[430px] lg:max-w-full mx-auto flex flex-col items-end'
}) => {
    return (
        <div className={className}>
            {/* Warm crimson & gold aura centered around the glass and feet */}
            <div
                className="absolute top-[18%] right-[8%] w-72 h-72 bg-brand-primary/20 rounded-full blur-[95px] pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-2 inset-x-4 h-24 rounded-full bg-gradient-to-t from-brand-primary/35 via-brand-accent/15 to-transparent blur-2xl pointer-events-none"
                aria-hidden="true"
            />

            {/* Crimson & gold Soju bottle glow & bottle to the left of the wine glass */}
            <div
                className="pointer-events-none absolute left-[0%] sm:left-[1%] bottom-[38%] w-36 h-60 bg-gradient-to-t from-brand-primary/25 via-brand-accent/20 to-transparent rounded-full blur-2xl"
                aria-hidden="true"
            />
            <div className="pointer-events-none absolute left-[-2%] sm:left-[0%] bottom-[31%] z-10 w-[36%] origin-bottom -rotate-[4deg]">
                <SojuBottleGraphic />
            </div>

            {/* BIG Wine Glass nestled directly into the cradle of her raised heels */}
            <div className="relative z-10 w-[78%] ml-auto mr-[-9%] -mb-[29%] origin-bottom -rotate-[8deg] pointer-events-none">
                <BigStreamShotGlass
                    percent={glassFillPercent}
                    isPouring={isPouring}
                    isOverfilled={isGlassOverfilled}
                />
            </div>

            {/* Lounging Character Artwork in foreground so her heels cradle the glass base */}
            <img
                src="/assets/aistudio/Untitled7_20251208184026_50dc60b6.png"
                alt="Urnisa lounging with a bottle of soju and balancing the Steak House Bar wine glass on her feet"
                referrerPolicy="no-referrer"
                className="relative z-20 w-full h-auto object-contain select-none pointer-events-none drop-shadow-[0_14px_26px_rgba(0,0,0,0.85)]"
                loading="eager"
            />
        </div>
    );
};
