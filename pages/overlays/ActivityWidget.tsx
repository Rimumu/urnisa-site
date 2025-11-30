
import React from 'react';
import { useNisathonStats } from '../../hooks/useNisathonStats';

const ActivityWidget: React.FC = () => {
    const { recentEvents } = useNisathonStats(2000);

    return (
        <div className="w-full h-full bg-transparent p-2 font-sans flex items-center">
            <div className="w-full relative flex items-center gap-4 p-4 rounded-2xl border border-[#fda4af] bg-gradient-to-r from-[#9f1239]/90 to-black/90 shadow-[0_0_20px_rgba(251,113,133,0.25)]">
                <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#fda4af]/30 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    🔔
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-[#fda4af] uppercase tracking-widest mb-0.5">Latest Activity</div>
                    {recentEvents.length > 0 ? (
                        <>
                            <div className="text-lg font-black text-white truncate leading-tight drop-shadow-md">{recentEvents[0].user}</div>
                            <div className="text-xs font-bold text-rose-200 truncate">{recentEvents[0].amountDisplay}</div>
                        </>
                    ) : (
                        <div className="text-sm text-rose-200/50 italic">Waiting...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityWidget;
