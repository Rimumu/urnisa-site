
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
        // This allows bubbles to show up even if the timer is frozen (e.g. donation during pause)
        if (stats.isPaused && prevStats.isPaused) {
            const currentRemaining = stats.remainingTimeMs || 0;
            const prevRemaining = prevStats.remainingTimeMs || 0;
            // Use 1000ms threshold to ignore tiny drifts
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
        // 3. Transitions (Paused <-> Running): 
        // We explicitly do NOTHING here. This prevents the bubble from triggering 
        // when the timerEndTime jumps due to the pause/resume calculation logic on the backend.

        if (addedMs > 0) {
            const addedSeconds = Math.round(addedMs / 1000);
            
            // Attempt to find the user responsible from recent events.
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

            // Trigger Bubble
            setAddedTimeBubble({ user, timeText, id: Date.now() });
            
            // Remove bubble after animation completes
            setTimeout(() => setAddedTimeBubble(null), 4000);
        }
        
        // Update ref for next render
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

            // Handle 3+ digit hours
            const hStr = hours >= 100 ? hours.toString() : (hours < 10 ? "0" + hours : hours);
            const mStr = minutes < 10 ? "0" + minutes : minutes;
            const sStr = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeft(`${hStr}:${mStr}:${sStr}`);
        };
        
        // Run update more frequently (100ms) for smoother UI response
        const interval = setInterval(updateTimer, 100);
        updateTimer();
        return () => clearInterval(interval);
    }, [stats.timerEndTime, stats.isPaused, stats.remainingTimeMs]);

    // --- GOAL TIMELINE LOGIC ---
    const currentNB = stats.totalNisaballs;
    
    // Find index of the first goal that is NOT yet completed
    let activeGoalIndex = goals.findIndex(g => g.count > currentNB);
    
    // If all completed, stick to the last one
    if (activeGoalIndex === -1 && goals.length > 0) activeGoalIndex = goals.length - 1;
    // If no goals loaded yet
    if (activeGoalIndex === -1) activeGoalIndex = 0;

    const prevGoal = activeGoalIndex > 0 ? goals[activeGoalIndex - 1] : null;
    const currentGoal = goals[activeGoalIndex] || { count: 100, reward: "Loading..." };
    const nextGoal = (activeGoalIndex < goals.length - 1) ? goals[activeGoalIndex + 1] : null;

    // Calculate Progress for Current Goal (Relative to previous goal)
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
                /* Fire Pulse Animation for 2x Event Badge */
                @keyframes fire-pulse {
                    0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 69, 0, 0.8); }
                    100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                }
                .fire-anim {
                    animation: fire-pulse 1.5s infinite ease-in-out;
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
                            ? 'bg-gradient-to-br from-[#FFD700] via-[#E6C200] to-[#B8860B] border-[#FFF8DC] shadow-[0_0_60px_rgba(255,215,0,0.6)] scale-105' 
                            : 'bg-gradient-to-br from-[#9f1239] to-[#4c0519] border-[#fda4af] shadow-[0_0_30px_rgba(251,113,133,0.4)]'}
                    `}>
                        {/* Status Badges Container (Stacks upwards if both exist) */}
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
                            {/* Updated text color to text-rose-100 / white for better contrast on gold */}
                            <div className={`text-xs font-black uppercase tracking-[0.3em] mb-1 ${isDoubleTimer ? 'text-white gold-text-shadow' : 'text-rose-100'}`}>
                                Time Remaining
                            </div>
                            {/* Digits stay white but blink when paused */}
                            <div className={`text-8xl font-black tabular-nums bubbly-text tracking-tight text-white ${stats.isPaused ? 'animate-pulse' : ''} ${isDoubleTimer ? 'gold-text-shadow' : ''}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR: WIDGETS */}
            <div className="flex items-end gap-6 w-full">
                
                {/* 1. REVAMPED GOAL TIMELINE */}
                <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-3xl p-2 border border-white/10 shadow-2xl flex items-stretch gap-2">
                    
                    {/* PREVIOUS GOAL (Small, Dimmed) */}
                    {prevGoal && (
                        <div className="hidden lg:flex w-32 flex-col justify-center items-start px-4 py-2 rounded-2xl bg-white/5 border border-white/5 opacity-50 grayscale">
                            <div className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1">
                                <span>Completed</span>
                                <span className="text-green-400 text-xs">✓</span>
                            </div>
                            <div className="text-xs font-bold text-gray-300 truncate w-full">{prevGoal.secret ? "Secret" : prevGoal.reward}</div>
                            <div className="text-[10px] font-mono text-gray-500">{prevGoal.count} NB</div>
                        </div>
                    )}

                    {/* CURRENT GOAL (Main Focus) */}
                    <div className="flex-1 bg-gradient-to-r from-brand-bg to-black border border-brand-accent/30 rounded-2xl p-3 flex flex-col justify-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest flex items-center gap-1">
                                        <span className="animate-pulse">▶</span> Current Goal
                                    </span>
                                    <div className="text-xl font-black text-white leading-none mt-0.5">
                                        {currentGoal.secret ? <span className="text-brand-primary italic">?? Secret ??</span> : currentGoal.reward}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-brand-accent font-mono">{Math.floor(currentNB)}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">/ {currentGoal.count} NB</div>
                                </div>
                            </div>
                            {/* Progress Bar */}
                            <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                                <div 
                                    className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000 ease-out relative shadow-[0_0_10px_rgba(229,56,59,0.5)]"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_1.5s_infinite]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NEXT GOAL (Small, Dimmed) */}
                    {nextGoal && (
                        <div className="hidden lg:flex w-32 flex-col justify-center items-end px-4 py-2 rounded-2xl bg-white/5 border border-white/5 opacity-60">
                            <div className="text-[9px] font-bold uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1">
                                <span className="text-xs">🔒</span>
                                <span>Up Next</span>
                            </div>
                            <div className="text-xs font-bold text-gray-300 truncate w-full text-right">{nextGoal.secret ? "?? Secret ??" : nextGoal.reward}</div>
                            <div className="text-[10px] font-mono text-gray-500">{nextGoal.count} NB</div>
                        </div>
                    )}
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
