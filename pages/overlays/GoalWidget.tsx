import React from 'react';
import { useNisathonStats } from '../../hooks/useNisathonStats';
import { useNisathonGoals } from '../../hooks/useNisathonGoals';

const GoalWidget: React.FC = () => {
    const { stats } = useNisathonStats(2000);
    const { goals } = useNisathonGoals();

    const currentNB = stats.totalNisaballs;
    let activeGoalIndex = goals.findIndex(g => g.count > currentNB);
    if (activeGoalIndex === -1 && goals.length > 0) activeGoalIndex = goals.length - 1;
    if (activeGoalIndex === -1) activeGoalIndex = 0;

    let startIndex = activeGoalIndex - 1;
    if (startIndex < 0) startIndex = 0;
    if (startIndex + 3 > goals.length) startIndex = Math.max(0, goals.length - 3);

    const visibleGoals = goals.slice(startIndex, startIndex + 3).map((g, i) => {
        const actualIndex = startIndex + i;
        let status = 'locked';
        if (actualIndex < activeGoalIndex) status = 'completed';
        else if (actualIndex === activeGoalIndex) status = 'active';
        return { ...g, status, uniqueId: `${g.count}-${g.reward}` }; // Add unique ID for key
    });

    const prevGoal = activeGoalIndex > 0 ? goals[activeGoalIndex - 1] : null;
    const currentGoal = goals[activeGoalIndex] || { count: 100, reward: "Loading..." };
    
    const baseCount = prevGoal ? prevGoal.count : 0;
    const range = currentGoal.count - baseCount;
    const progressInStep = Math.max(0, currentNB - baseCount);
    const progressPercent = range > 0 ? Math.min((progressInStep / range) * 100, 100) : 100;

    return (
        <div className="w-full h-full bg-transparent p-4 font-sans flex flex-col justify-end">
            <style>{`
                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
            `}</style>
            
            <div className="flex flex-col gap-3">
                {/* Goal List */}
                <div className="flex flex-col gap-2">
                    {visibleGoals.map((goal) => (
                        <div 
                            key={goal.uniqueId} // KEY IS CRITICAL FOR ANIMATION
                            className={`
                                relative flex items-center justify-between p-3 rounded-xl border transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] shadow-md
                                animate-in fade-in slide-in-from-bottom-2
                                ${goal.status === 'active' 
                                    ? 'bg-gradient-to-r from-[#9f1239]/90 to-black/90 border-[#fda4af] shadow-[0_0_15px_rgba(251,113,133,0.3)] scale-[1.02] z-10' 
                                    : 'bg-black/60 border-white/10 opacity-80'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`
                                    w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-300
                                    ${goal.status === 'completed' ? 'border-green-500 bg-green-500' : 
                                      goal.status === 'active' ? 'border-[#fda4af] animate-pulse bg-[#fda4af]/20' : 'border-gray-600'}
                                `}>
                                    {goal.status === 'completed' && (
                                        <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <span className={`text-sm font-bold truncate transition-colors ${goal.status === 'active' ? 'text-white' : 'text-gray-300'}`}>
                                    {goal.secret && goal.status !== 'completed' ? <span className="text-[#fda4af] tracking-wider italic">?? Secret ??</span> : goal.reward}
                                </span>
                            </div>
                            <div className={`
                                px-2 py-1 rounded-md text-xs font-mono font-bold ml-2 shrink-0 transition-colors
                                ${goal.status === 'active' ? 'bg-[#fda4af] text-[#4c0519]' : 'bg-white/10 text-gray-500'}
                            `}>
                                {goal.count}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Progress Bar & Counter */}
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-4 bg-black/60 rounded-full border border-[#fda4af]/50 overflow-hidden shadow-lg relative">
                        <div 
                            className="h-full bg-gradient-to-r from-[#e11d48] to-[#fda4af] transition-all duration-700 ease-out relative overflow-hidden"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_2s_infinite]"></div>
                        </div>
                    </div>
                    <div className="bg-black/40 border border-[#fda4af]/40 px-3 py-1 rounded-lg shadow-[0_0_10px_rgba(253,164,175,0.1)] backdrop-blur-sm">
                        <span className="text-xs font-black font-mono text-[#fda4af] drop-shadow-sm whitespace-nowrap">
                            {Math.floor(currentNB)} / {currentGoal.count} NB
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalWidget;