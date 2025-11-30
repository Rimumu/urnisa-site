import React from 'react';
import { useWheelGame } from '../../hooks/useWheelGame';

const SpinWidget: React.FC = () => {
    const { history: wheelHistory } = useWheelGame();
    const latest = wheelHistory[0];

    return (
        <div className="w-full h-full bg-transparent p-2 font-sans flex items-center justify-center">
            {latest ? (
                <div className="w-full max-w-md relative flex items-center gap-4 p-4 rounded-2xl border border-[#fda4af] bg-gradient-to-r from-[#9f1239]/90 to-black/90 shadow-[0_0_20px_rgba(251,113,133,0.25)] overflow-hidden">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-[#fda4af]/30 flex items-center justify-center text-2xl shrink-0 shadow-inner z-10">
                        🎡
                    </div>
                    <div className="flex-1 min-w-0 z-10">
                        <div className="text-[10px] font-black text-[#fda4af] uppercase tracking-widest mb-0.5">Last Spin</div>
                        
                        {/* Key triggers re-render animation when spin ID changes */}
                        <div key={latest._id} className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="text-lg font-black text-white truncate leading-tight drop-shadow-md">{latest.user}</div>
                            <div className="text-xs font-bold text-rose-200 truncate">{latest.reward}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md relative flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-black/40 opacity-50">
                     <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                        🎡
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Last Spin</div>
                        <div className="text-sm font-medium text-gray-400 italic">No spins yet</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpinWidget;