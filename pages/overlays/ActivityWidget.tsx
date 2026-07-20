import React, { useState, useEffect } from 'react';
import { useNisathonStats } from '../../hooks/useNisathonStats';

const getEventIcon = (type: string, className: string = "w-6 h-6") => {
    switch (type.toLowerCase()) {
        case 'sub':
        case 'subscriber': 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
        case 'gift': 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 12 20 22 4 22 4 12" />
                    <rect x="2" y="7" width="20" height="5" />
                    <line x1="12" y1="22" x2="12" y2="7" />
                    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                </svg>
            );
        case 'bits': 
        case 'cheer': 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M12 2.25c-.297 0-.58.14-.757.377L2.25 14.25l9 7.5a1.125 1.125 0 0 0 1.5 0l9-7.5-8.993-11.623a1.125 1.125 0 0 0-.757-.377ZM3.536 13.5l7.714-9.971v9.971H3.536Zm8.464-9.971 7.714 9.971H12V3.529Z" clipRule="evenodd" />
                </svg>
            );
        case 'donation': 
        case 'tip': 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            );
        case 'follower': 
        case 'follow': 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
            );
        default: 
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            );
    }
};

const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'sub':
        case 'subscriber': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        case 'gift': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
        case 'bits':
        case 'cheer': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        case 'donation':
        case 'tip': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'follower': 
        case 'follow': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        default: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
};

const ActivityWidget: React.FC = () => {
    const { recentEvents } = useNisathonStats(2000);
    const latest = recentEvents[0];
    const [timeAgo, setTimeAgo] = useState("Just now");

    // Helper to calculate relative time
    useEffect(() => {
        if (!latest) return;
        
        const updateTime = () => {
            const diff = Date.now() - new Date(latest.createdAt).getTime();
            const seconds = Math.floor(diff / 1000);
            
            if (seconds < 60) setTimeAgo("Just now");
            else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
            else setTimeAgo(`${Math.floor(seconds / 3600)}h ago`);
        };

        updateTime();
        const interval = setInterval(updateTime, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, [latest]);

    const iconColorClass = latest ? getEventColor(latest.type) : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

    return (
        <div className="w-full h-full bg-transparent p-2 font-sans flex items-center justify-center">
            <style>{`
                @keyframes elasticSlideUp {
                    0% { opacity: 0; transform: translateY(40px) scale(0.9); }
                    50% { opacity: 1; transform: translateY(-5px) scale(1.02); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-entry {
                    animation: elasticSlideUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>

            <div className="w-full max-w-md relative flex items-center gap-4 p-4 rounded-2xl border border-[#fda4af] bg-gradient-to-r from-[#9f1239]/90 to-black/90 shadow-[0_0_20px_rgba(251,113,133,0.25)] overflow-hidden">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner z-10 border ${iconColorClass}`}>
                    {latest ? getEventIcon(latest.type) : (
                        <span className="text-2xl">🔔</span>
                    )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                    <div className="flex justify-between items-center mb-0.5">
                        <div className="text-[10px] font-black text-[#fda4af] uppercase tracking-widest">Latest Activity</div>
                        {latest && <div className="text-[10px] font-bold text-[#fda4af]/60">{timeAgo}</div>}
                    </div>
                    
                    {latest ? (
                        /* Key triggers re-render animation when user/id changes */
                        <div key={latest._id} className="animate-entry">
                            <div className="text-lg font-black text-white truncate leading-tight drop-shadow-md">{latest.user}</div>
                            <div className="text-xs font-bold text-rose-200 truncate">{latest.amountDisplay}</div>
                        </div>
                    ) : (
                        <div className="text-sm text-rose-200/50 italic animate-pulse">Waiting...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityWidget;