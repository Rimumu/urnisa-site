import React, { useState, useEffect } from 'react';
import { useNisathonStats } from '../../hooks/useNisathonStats';

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

    return (
        <div className="w-full h-full bg-transparent p-2 font-sans flex items-center justify-center">
            <style>{`
                @keyframes slideUpFade {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-entry {
                    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <div className="w-full max-w-md relative flex items-center gap-4 p-4 rounded-2xl border border-[#fda4af] bg-gradient-to-r from-[#9f1239]/90 to-black/90 shadow-[0_0_20px_rgba(251,113,133,0.25)] overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#fda4af]/30 flex items-center justify-center text-2xl shrink-0 shadow-inner z-10">
                    🔔
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