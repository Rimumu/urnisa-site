import React from 'react';

export const TournamentCrown: React.FC<{ className?: string }> = ({ className = "w-16 h-16 md:w-20 md:h-20" }) => (
    <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} filter drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]`}>
        <defs>
            <linearGradient id="crownBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="25%" stopColor="#FACC15" />
                <stop offset="70%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="crownBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CA8A04" />
                <stop offset="100%" stopColor="#713F12" />
            </linearGradient>
            <radialGradient id="gemRed" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#FCA5A5" />
                <stop offset="40%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
            </radialGradient>
            <radialGradient id="gemBlue" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="40%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E40AF" />
            </radialGradient>
            <radialGradient id="gemPurple" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#F0ABFC" />
                <stop offset="40%" stopColor="#D946EF" />
                <stop offset="100%" stopColor="#86198F" />
            </radialGradient>
            <radialGradient id="gemGreen" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#86EFAC" />
                <stop offset="40%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#166534" />
            </radialGradient>
        </defs>

        {/* Crown Peaks and Body */}
        <path
            d="M10 65 L18 24 L34 45 L50 14 L66 45 L82 24 L90 65 Z"
            fill="url(#crownBodyGrad)"
            stroke="#FEF08A"
            strokeWidth="3"
            strokeLinejoin="round"
        />

        {/* Crown Bottom Rim */}
        <rect x="10" y="58" width="80" height="12" rx="4" fill="url(#crownBaseGrad)" stroke="#FEF08A" strokeWidth="2.5" />

        {/* Top Jewels on Peaks */}
        <circle cx="18" cy="24" r="5" fill="url(#gemRed)" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="50" cy="14" r="6.5" fill="url(#gemBlue)" stroke="#FFF" strokeWidth="1.5" />
        <circle cx="82" cy="24" r="5" fill="url(#gemPurple)" stroke="#FFF" strokeWidth="1.5" />

        {/* Band Jewels */}
        <circle cx="22" cy="64" r="3.5" fill="url(#gemBlue)" stroke="#FFF" strokeWidth="0.75" />
        <circle cx="36" cy="64" r="3.5" fill="url(#gemRed)" stroke="#FFF" strokeWidth="0.75" />
        <circle cx="50" cy="64" r="4" fill="url(#gemGreen)" stroke="#FFF" strokeWidth="0.75" />
        <circle cx="64" cy="64" r="3.5" fill="url(#gemPurple)" stroke="#FFF" strokeWidth="0.75" />
        <circle cx="78" cy="64" r="3.5" fill="url(#gemBlue)" stroke="#FFF" strokeWidth="0.75" />
    </svg>
);

export const TournamentMedalBadge: React.FC<{ rank: 2 | 3; size?: 'sm' | 'md' }> = ({ rank, size = 'md' }) => {
    const isSilver = rank === 2;
    const dimension = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
    
    return (
        <div className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${dimension} filter drop-shadow-md`}>
                <defs>
                    <linearGradient id={`ribbonGrad-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#0284C7" />
                    </linearGradient>
                    <linearGradient id={`medalSurface-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        {isSilver ? (
                            <>
                                <stop offset="0%" stopColor="#F8FAFC" />
                                <stop offset="50%" stopColor="#CBD5E1" />
                                <stop offset="100%" stopColor="#64748B" />
                            </>
                        ) : (
                            <>
                                <stop offset="0%" stopColor="#FED7AA" />
                                <stop offset="50%" stopColor="#F97316" />
                                <stop offset="100%" stopColor="#9A3412" />
                            </>
                        )}
                    </linearGradient>
                </defs>
                {/* Ribbons */}
                <path d="M12 15L7 30L13 27L17 21" fill={`url(#ribbonGrad-${rank})`} stroke="#0369A1" strokeWidth="0.8" strokeLinejoin="round" />
                <path d="M24 15L29 30L23 27L19 21" fill={`url(#ribbonGrad-${rank})`} stroke="#0369A1" strokeWidth="0.8" strokeLinejoin="round" />
                
                {/* Medal Coin */}
                <circle cx="18" cy="14" r="10.5" fill={`url(#medalSurface-${rank})`} stroke={isSilver ? "#F1F5F9" : "#FFEDD5"} strokeWidth="1.5" />
                <circle cx="18" cy="14" r="8.5" stroke={isSilver ? "#475569" : "#7C2D12"} strokeWidth="0.8" strokeDasharray="1.5 1.5" />
                
                {/* Rank Number */}
                <text
                    x="18"
                    y="18"
                    textAnchor="middle"
                    fill={isSilver ? "#0F172A" : "#431407"}
                    fontSize="11"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    {rank}
                </text>
            </svg>
        </div>
    );
};
