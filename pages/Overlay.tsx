
import React, { useState, useEffect, useRef } from 'react';
import { useNisathonStats } from '../hooks/useNisathonStats';
import { useWheelGame } from '../hooks/useWheelGame';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';

const Overlay: React.FC = () => {
    // Poll every 1000ms (1s) to minimize lag/glitching on pause/resume
    const { stats, leaderboard, recentEvents } = useNisathonStats(1000);
    const { history: wheelHistory } = useWheelGame();
    const { goals } = useNisathonGoals();

    // --- TIMER STATE ---
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    // Updated state to hold user info and display text
    const [addedTimeBubble, setAddedTimeBubble] = useState<{ user: string, timeText: string, id: number } | null>(null);
    
    // Track previous stats to detect changes correctly (Pause vs Running)
    const prevStatsRef = useRef(stats);
    
    // --- ANIMATION LOGIC ---
    useEffect(() => {
        const prevStats = prevStatsRef.current;
        let addedMs = 0;

        // 1. If currently PAUSED and was PAUSED: Check remainingTimeMs increase
        if (stats.isPaused && prevStats.isPaused) {
            const currentRemaining = stats.remainingTimeMs || 0;
            const prevRemaining = prevStats.remainingTimeMs || 0;
            if (currentRemaining > prevRemaining + 1000) {
                addedMs = currentRemaining - prevRemaining;
            }
        }
        // 2. If currently RUNNING and was RUNNING: Check timerEndTime increase
        else if (!stats.isPaused && !prevStats.isPaused) {
            const currentEnd = new Date(stats.timerEndTime).getTime();
            const prevEnd = new Date(prevStats.timerEndTime).getTime();
            if (currentEnd > prevEnd + 1000) {
                addedMs = currentEnd - prevEnd;
            }
        }

        if (addedMs > 0) {
            const addedSeconds = Math.round(addedMs / 1000);
            
            let user = "Anonymous";
            if (recentEvents.length > 0) {
                const latestEvent = recentEvents[0];
                const eventTime = new Date(latestEvent.createdAt).getTime();
                const now = Date.now();
                if (Math.abs(now - eventTime) < 60000) {
                    user = latestEvent.user;
                }
            }

            let timeText = "";
            if (addedSeconds >= 60) {
                const mins = Math.round(addedSeconds / 60);
                timeText = `+${mins}m`;
            } else {
                timeText = `+${addedSeconds}s`;
            }

            setAddedTimeBubble({ user, timeText, id: Date.now() });
            setTimeout(() => setAddedTimeBubble(null), 4000);
        }
        
        prevStatsRef.current = stats;
    }, [stats, recentEvents]);

    // Timer Ticker
    useEffect(() => {
        const updateTimer = () => {
            let ms = 0;
            if (stats.isPaused) {
                ms = stats.remainingTimeMs || 0;
            } else {
                const now = new Date().getTime();
                const end = new Date(stats.timerEndTime).getTime();
                ms = end - now;
            }
            
            if (ms < 0) ms = 0;
            
            const hours = Math.floor((ms / (1000 * 60 * 60)));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((ms % (1000 * 60)) / 1000);

            const hStr = hours >= 100 ? hours.toString() : (hours < 10 ? "0" + hours : hours);
            const mStr = minutes < 10 ? "0" + minutes : minutes;
            const sStr = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeft(`${hStr}:${mStr}:${sStr}`);
        };
        
        const interval = setInterval(updateTimer, 100);
        updateTimer();
        return () => clearInterval(interval);
    }, [stats.timerEndTime, stats.isPaused, stats.remainingTimeMs]);

    // --- GOAL LIST LOGIC ---
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
        return { ...g, status };
    });

    const prevGoal = activeGoalIndex > 0 ? goals[activeGoalIndex - 1] : null;
    const currentGoal = goals[activeGoalIndex] || { count: 100, reward: "Loading..." };
    
    const baseCount = prevGoal ? prevGoal.count : 0;
    const range = currentGoal.count - baseCount;
    const progressInStep = Math.max(0, currentNB - baseCount);
    const progressPercent = range > 0 ? Math.min((progressInStep / range) * 100, 100) : 100;

    const isDoubleTimer = stats.activeEvent === 'DOUBLE_TIMER';

    return (
        <div className="w-screen h-screen overflow-hidden bg-transparent font-sans text-white p-10 flex flex-col justify-between">
            <style>{`
                @keyframes popInFloat {
                    0% { transform: translate(0, 10px) scale(0.8); opacity: 0; }
                    15% { transform: translate(0, 0) scale(1.05); opacity: 1; }
                    25% { transform: translate(0, 0) scale(1); opacity: 1; }
                    80% { transform: translate(0, -5px) scale(1); opacity: 1; }
                    100% { transform: translate(0, -20px) scale(0.9); opacity: 0; }
                }
                .bubble-anim {
                    animation: popInFloat 4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
                .bubbly-text {
                    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
                }
                .gold-text-shadow {
                    text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
                }
                @keyframes fire-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 69, 0, 0.8); }
                    100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                }
                .fire-anim {
                    animation: fire-pulse 1.5s infinite ease-in-out;
                }
                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
            `}</style>

            {/* TOP BAR: TIMER */}
            <div className="flex justify-center items-start gap-8 pt-12">
                <div className="relative">
                    {/* Time Added Bubble */}
                    {addedTimeBubble && (
                        <div key={addedTimeBubble.id} className="absolute right-0 -top-14 bubble-anim z-30 whitespace-nowrap">
                            <div className="flex items-center rounded-full overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.6)] border border-white/20 ring-1 ring-black/40 bg-black/80 backdrop-blur-xl">
                                <div className="bg-[#18181b] px-4 py-2 flex items-center h-full border-r border-white/10">
                                    <span className="font-bold text-white text-lg tracking-tight">{addedTimeBubble.user}</span>
                                </div>
                                <div className="bg-[#34d399] px-3 py-2 flex items-center h-full">
                                    <span className="font-black text-[#064e3b] text-lg tracking-tight">{addedTimeBubble.timeText}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timer Widget */}
                    <div className={`
                        relative w-[640px] h-[160px] rounded-[50px] border-[4px] shadow-2xl transition-all duration-500 z-20 flex flex-col justify-center items-center
                        ${isDoubleTimer 
                            ? 'bg-gradient-to-br from-[#FFD700] via-[#E6C200] to-[#B8860B] border-[#FFF8DC] shadow-[0_0_60px_rgba(255,215,0,0.6)] scale-105' 
                            : 'bg-gradient-to-br from-[#9f1239] to-[#4c0519] border-[#fda4af] shadow-[0_0_30px_rgba(251,113,133,0.4)]'}
                    `}>
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col-reverse items-center gap-2 w-full z-30">
                            {isDoubleTimer && (
                                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border border-white/80 fire-anim whitespace-nowrap gold-text-shadow">
                                    🔥 2x Timer Event 🔥
                                </div>
                            )}
                            {stats.isPaused && (
                                <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse whitespace-nowrap">
                                    TIMER PAUSED
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center w-full">
                            <div className={`text-xs font-black uppercase tracking-[0.3em] mb-1 ${isDoubleTimer ? 'text-white gold-text-shadow' : 'text-rose-100'}`}>
                                Time Remaining
                            </div>
                            <div className={`text-8xl font-black tabular-nums bubbly-text tracking-tight text-white ${stats.isPaused ? 'animate-pulse' : ''} ${isDoubleTimer ? 'gold-text-shadow' : ''}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR: WIDGETS */}
            <div className="flex items-end gap-6 w-full">
                
                {/* 1. VERTICAL GOAL LIST (Minimal Design) */}
                <div className="flex-1 max-w-[28rem] flex flex-col gap-3">
                    
                    {/* Goal Rows */}
                    <div className="flex flex-col gap-2">
                        {visibleGoals.map((goal, idx) => (
                            <div 
                                key={idx} 
                                className={`
                                    relative flex items-center justify-between p-3 rounded-xl border transition-all duration-500 shadow-md
                                    ${goal.status === 'active' 
                                        ? 'bg-gradient-to-r from-[#9f1239]/90 to-black/90 border-[#fda4af] shadow-[0_0_15px_rgba(251,113,133,0.3)] scale-[1.02] z-10' 
                                        : 'bg-black/60 border-white/10 opacity-80'}
                                `}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {/* Indicator Dot */}
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
                                    
                                    {/* Label */}
                                    <span className={`text-sm font-bold truncate transition-colors ${goal.status === 'active' ? 'text-white' : 'text-gray-300'}`}>
                                        {goal.secret && goal.status !== 'completed' ? <span className="text-[#fda4af] tracking-wider italic">?? Secret ??</span> : goal.reward}
                                    </span>
                                </div>

                                {/* Count Pill */}
                                <div className={`
                                    px-2 py-1 rounded-md text-xs font-mono font-bold ml-2 shrink-0 transition-colors
                                    ${goal.status === 'active' ? 'bg-[#fda4af] text-[#4c0519]' : 'bg-white/10 text-gray-500'}
                                `}>
                                    {goal.count}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar with Boxed Counter */}
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-4 bg-black/60 rounded-full border border-[#fda4af]/50 overflow-hidden shadow-lg relative">
                            <div 
                                className="h-full bg-gradient-to-r from-[#e11d48] to-[#fda4af] transition-all duration-700 ease-out relative overflow-hidden"
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* Diagonal Shine Animation */}
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

                {/* 2. RECENT EVENT (Themed to match) */}
                <div className="w-80 bg-gradient-to-b from-[#2a0a10]/90 to-black/90 backdrop-blur-xl rounded-3xl p-5 border border-[#fda4af]/30 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shrink-0">
                        🔔
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-[#fda4af] uppercase tracking-wider mb-0.5">Latest Activity</div>
                        {recentEvents.length > 0 ? (
                            <div>
                                <div className="text-lg font-black text-white truncate leading-tight">{recentEvents[0].user}</div>
                                <div className="text-xs font-bold text-gray-400 truncate">{recentEvents[0].amountDisplay}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">Waiting...</div>
                        )}
                    </div>
                </div>

                {/* 3. WHEEL WINNER (Themed to match) */}
                {wheelHistory.length > 0 && (
                    <div className="w-72 bg-gradient-to-b from-[#2a0a10]/90 to-black/90 backdrop-blur-xl rounded-3xl p-5 border border-[#fda4af]/30 shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#fda4af]/10 text-[#fda4af] rounded-full flex items-center justify-center text-2xl font-bold border border-[#fda4af]/30 shrink-0">
                            🎡
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-[#fda4af] uppercase tracking-wider mb-0.5">Last Spin</div>
                            <div className="text-lg font-black text-white truncate leading-tight">{wheelHistory[0].user}</div>
                            <div className="text-xs font-bold text-gray-400 truncate">Won: {wheelHistory[0].reward}</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Overlay;
