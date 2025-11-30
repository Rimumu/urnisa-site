
import React, { useState, useEffect, useRef } from 'react';
import { useNisathonStats } from '../hooks/useNisathonStats';
import { useWheelGame } from '../hooks/useWheelGame';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';

const Overlay: React.FC = () => {
    const { stats, leaderboard, recentEvents } = useNisathonStats();
    const { history: wheelHistory } = useWheelGame();
    const { goals } = useNisathonGoals();

    // --- TIMER STATE ---
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    // Updated state to hold user info and display text
    const [addedTimeBubble, setAddedTimeBubble] = useState<{ user: string, timeText: string, id: number } | null>(null);
    const prevEndTimeRef = useRef(stats.timerEndTime);
    
    // --- ANIMATION LOGIC ---
    useEffect(() => {
        const currentEnd = new Date(stats.timerEndTime).getTime();
        const prevEnd = new Date(prevEndTimeRef.current).getTime();

        // If time increased by more than 1 second (filter small drifts)
        if (currentEnd > prevEnd + 1000) {
            const addedMs = currentEnd - prevEnd;
            const addedSeconds = Math.round(addedMs / 1000);
            
            // Attempt to find the user responsible from recent events
            // We look for the most recent event created within the last minute
            let user = "Anonymous";
            if (recentEvents.length > 0) {
                const latestEvent = recentEvents[0];
                const eventTime = new Date(latestEvent.createdAt).getTime();
                const now = Date.now();
                // If event is recent (< 60s), attribute it to them
                if (Math.abs(now - eventTime) < 60000) {
                    user = latestEvent.user;
                }
            }

            // Format Time (e.g. +10m or +45s)
            let timeText = "";
            if (addedSeconds >= 60) {
                const mins = Math.round(addedSeconds / 60);
                timeText = `+${mins}m`;
            } else {
                timeText = `+${addedSeconds}s`;
            }

            if (addedSeconds > 0) {
                setAddedTimeBubble({ user, timeText, id: Date.now() });
                // Remove bubble after animation completes
                setTimeout(() => setAddedTimeBubble(null), 4000);
            }
        }
        prevEndTimeRef.current = stats.timerEndTime;
    }, [stats.timerEndTime, recentEvents]);

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

            // Handle 3+ digit hours
            const hStr = hours >= 100 ? hours.toString() : (hours < 10 ? "0" + hours : hours);
            const mStr = minutes < 10 ? "0" + minutes : minutes;
            const sStr = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeft(`${hStr}:${mStr}:${sStr}`);
        };
        const interval = setInterval(updateTimer, 1000);
        updateTimer();
        return () => clearInterval(interval);
    }, [stats.timerEndTime, stats.isPaused, stats.remainingTimeMs]);

    // --- NEXT GOAL LOGIC ---
    let nextGoal: NisathonGoal = { count: 1000, reward: "All Goals Done!" };
    const currentNB = stats.totalNisaballs;
    for (const g of goals) {
        if (g.count > currentNB) {
            nextGoal = g;
            break;
        }
    }
    const progressPercent = Math.min((currentNB / nextGoal.count) * 100, 100);

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
            `}</style>

            {/* TOP BAR: TIMER & EVENT */}
            <div className="flex justify-center items-start gap-8 pt-12">
                {/* TIMER CONTAINER */}
                <div className="relative">
                    
                    {/* Floating Added Time Pill (Aligned Right Flush & Closer) */}
                    {addedTimeBubble && (
                        <div key={addedTimeBubble.id} className="absolute right-0 -top-14 bubble-anim z-30 whitespace-nowrap">
                            <div className="flex items-center rounded-full overflow-hidden shadow-[0_10px_25px_rgba(0,0,0,0.6)] border border-white/20 ring-1 ring-black/40 bg-black/80 backdrop-blur-xl">
                                {/* Username Side */}
                                <div className="bg-[#18181b] px-4 py-2 flex items-center h-full border-r border-white/10">
                                    <span className="font-bold text-white text-lg tracking-tight">{addedTimeBubble.user}</span>
                                </div>
                                {/* Time Side */}
                                <div className="bg-[#34d399] px-3 py-2 flex items-center h-full">
                                    <span className="font-black text-[#064e3b] text-lg tracking-tight">{addedTimeBubble.timeText}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timer Widget */}
                    {/* Fixed dimensions to prevent layout shifts */}
                    <div className={`
                        relative w-[640px] h-[160px] rounded-[50px] border-[4px] shadow-2xl transition-all duration-500 z-20 flex flex-col justify-center items-center
                        ${isDoubleTimer 
                            ? 'bg-gradient-to-br from-purple-900 to-black border-purple-400 shadow-[0_0_40px_rgba(168,85,247,0.6)] scale-105' 
                            : 'bg-gradient-to-br from-[#9f1239] to-[#4c0519] border-[#fda4af] shadow-[0_0_30px_rgba(251,113,133,0.4)]'}
                    `}>
                        {/* Status Badges Container (Stacks upwards if both exist) */}
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col-reverse items-center gap-2 w-full z-30">
                            {isDoubleTimer && (
                                <div className="bg-purple-500 text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest border border-white shadow-lg animate-pulse whitespace-nowrap">
                                    2x Timer Event
                                </div>
                            )}
                            {stats.isPaused && (
                                <div className="bg-amber-500 text-black px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse whitespace-nowrap">
                                    ⛔ TIMER PAUSED ⛔
                                </div>
                            )}
                        </div>
                        
                        <div className="text-center w-full">
                            {/* Updated text color to text-rose-100 / text-purple-100 for better contrast */}
                            <div className={`text-xs font-black uppercase tracking-[0.3em] mb-1 ${isDoubleTimer ? 'text-purple-100' : 'text-rose-100'}`}>
                                Time Remaining
                            </div>
                            <div className={`text-8xl font-black tabular-nums bubbly-text tracking-tight ${stats.isPaused ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR: WIDGETS */}
            <div className="flex items-end gap-6 w-full">
                
                {/* 1. GOAL BAR */}
                <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-end mb-2 px-1">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Next Goal</span>
                            <span className="text-xl font-black text-white leading-none">{nextGoal.secret ? "?? Secret ??" : nextGoal.reward}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-brand-accent">{Math.floor(currentNB)}</span>
                            <span className="text-xs font-bold text-gray-400"> / {nextGoal.count} NB</span>
                        </div>
                    </div>
                    <div className="h-4 bg-black/50 rounded-full overflow-hidden border border-white/5 relative">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* 2. RECENT EVENT */}
                <div className="w-80 bg-black/60 backdrop-blur-xl rounded-3xl p-5 border border-white/10 shadow-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl border border-white/10 shrink-0">
                        🔔
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Latest Activity</div>
                        {recentEvents.length > 0 ? (
                            <div>
                                <div className="text-lg font-black text-white truncate leading-tight">{recentEvents[0].user}</div>
                                <div className="text-xs font-bold text-brand-primary truncate">{recentEvents[0].amountDisplay}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">Waiting...</div>
                        )}
                    </div>
                </div>

                {/* 3. WHEEL WINNER */}
                {wheelHistory.length > 0 && (
                    <div className="w-72 bg-gradient-to-br from-[#1a0b0e] to-black backdrop-blur-xl rounded-3xl p-5 border border-brand-accent/20 shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center text-2xl font-bold border border-brand-accent/30 shrink-0">
                            🎡
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-bold text-brand-accent uppercase tracking-wider mb-0.5">Last Spin</div>
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
