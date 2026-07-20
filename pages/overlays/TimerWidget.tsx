import React, { useState, useEffect, useRef } from 'react';
import { useNisathonStats } from '../../hooks/useNisathonStats';
import { useNisathonGoals, NisathonGoal } from '../../hooks/useNisathonGoals';

const TimerWidget: React.FC = () => {
    // Poll every 1000ms for smooth updates from server
    const { stats, recentEvents } = useNisathonStats(1000);
    const [timeLeft, setTimeLeft] = useState("00:00:00");
    const [addedTimeBubble, setAddedTimeBubble] = useState<{ user: string, timeText: string, id: number } | null>(null);
    const [timerBump, setTimerBump] = useState(false); // State for the bump animation
    
    // Refs for animation logic
    const prevStatsRef = useRef(stats);
    const displayMsRef = useRef(0);
    const initializedRef = useRef(false);

    // --- EVENT BUBBLE LOGIC ---
    useEffect(() => {
        const prevStats = prevStatsRef.current;
        let addedMs = 0;

        // Detect Time Added (Pause aware)
        if (stats.isPaused && prevStats.isPaused) {
            const currentRemaining = stats.remainingTimeMs || 0;
            const prevRemaining = prevStats.remainingTimeMs || 0;
            if (currentRemaining > prevRemaining + 1000) addedMs = currentRemaining - prevRemaining;
        }
        else if (!stats.isPaused && !prevStats.isPaused) {
            const currentEnd = new Date(stats.timerEndTime).getTime();
            const prevEnd = new Date(prevStats.timerEndTime).getTime();
            if (currentEnd > prevEnd + 1000) addedMs = currentEnd - prevEnd;
        }

        if (addedMs > 0) {
            const addedSeconds = Math.round(addedMs / 1000);
            let user = "Anonymous";
            if (recentEvents.length > 0) {
                const latestEvent = recentEvents[0];
                const eventTime = new Date(latestEvent.createdAt).getTime();
                if (Math.abs(Date.now() - eventTime) < 60000) user = latestEvent.user;
            }

            let timeText = addedSeconds >= 60 ? `+${Math.round(addedSeconds / 60)}m` : `+${addedSeconds}s`;
            setAddedTimeBubble({ user, timeText, id: Date.now() });
            setTimeout(() => setAddedTimeBubble(null), 4000);

            // Trigger Bump/Glow
            setTimerBump(true);
            setTimeout(() => setTimerBump(false), 300);
        }
        prevStatsRef.current = stats;
    }, [stats, recentEvents]);

    // --- SMOOTH TICKER ANIMATION ---
    useEffect(() => {
        let frameId: number;

        const animate = () => {
            // 1. Calculate the Real Target Time in MS
            let targetMs = 0;
            if (stats.isPaused) {
                targetMs = stats.remainingTimeMs || 0;
            } else {
                const now = Date.now();
                const end = new Date(stats.timerEndTime).getTime();
                targetMs = Math.max(0, end - now);
            }

            // 2. Initial Snap (on mount)
            if (!initializedRef.current) {
                displayMsRef.current = targetMs;
                initializedRef.current = true;
            }

            // 3. Interpolation Logic
            const diff = targetMs - displayMsRef.current;

            if (diff > 1000) {
                // If target is significantly ahead (Time Added), animate UP towards it.
                // We move 10% of the difference per frame for a smooth "Zeno's paradox" ease-out.
                // Minimum step of 100ms ensures it finishes reasonably fast even at the end.
                const step = Math.max(diff * 0.1, 100); 
                displayMsRef.current += step;
                
                // Snap if very close to avoid infinite micro-decimals
                if (Math.abs(targetMs - displayMsRef.current) < 50) {
                    displayMsRef.current = targetMs;
                }
            } else {
                // If counting down (diff is negative or small), just snap to target.
                // This ensures the countdown remains accurate to real-time.
                displayMsRef.current = targetMs;
            }

            // 4. Format Output
            const ms = Math.floor(displayMsRef.current);
            const hours = Math.floor((ms / (1000 * 60 * 60)));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((ms % (1000 * 60)) / 1000);

            const hStr = hours >= 100 ? hours.toString() : (hours < 10 ? "0" + hours : hours);
            const mStr = minutes < 10 ? "0" + minutes : minutes;
            const sStr = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeft(`${hStr}:${mStr}:${sStr}`);

            frameId = requestAnimationFrame(animate);
        };

        frameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameId);
    }, [stats.timerEndTime, stats.isPaused, stats.remainingTimeMs]);

    const isDoubleTimer = stats.activeEvent === 'DOUBLE_TIMER';

    return (
        <div className="w-full h-full flex items-start justify-center bg-transparent overflow-visible pt-28 font-sans">
            <style>{`
                @keyframes popInFloat {
                    0% { transform: translate(0, 10px) scale(0.8); opacity: 0; }
                    15% { transform: translate(0, 0) scale(1.05); opacity: 1; }
                    25% { transform: translate(0, 0) scale(1); opacity: 1; }
                    80% { transform: translate(0, -5px) scale(1); opacity: 1; }
                    100% { transform: translate(0, -20px) scale(0.9); opacity: 0; }
                }
                .bubble-anim { animation: popInFloat 4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
                .bubbly-text { text-shadow: 2px 2px 0px rgba(0,0,0,0.5); }
                .gold-text-shadow { text-shadow: 0px 2px 4px rgba(0,0,0,0.3); }
                @keyframes fire-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
                    50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 69, 0, 0.8); }
                }
                .fire-anim { animation: fire-pulse 1.5s infinite ease-in-out; }
            `}</style>

            <div className="relative">
                {/* Bubble - Positioned relative to the container which has top padding now */}
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

                {/* Main Timer Box */}
                <div className={`
                    relative w-[640px] h-[160px] rounded-[50px] border-[4px] shadow-2xl transition-all duration-500 z-20 flex flex-col justify-center items-center
                    ${isDoubleTimer 
                        ? 'bg-gradient-to-br from-[#FFD700] via-[#E6C200] to-[#B8860B] border-[#FFF8DC] shadow-[0_0_60px_rgba(255,215,0,0.6)]' 
                        : 'bg-gradient-to-br from-[#9f1239] to-[#4c0519] border-[#fda4af] shadow-[0_0_30px_rgba(251,113,133,0.4)]'}
                `}>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-2 z-30">
                        {isDoubleTimer && (
                            <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border border-white/80 fire-anim whitespace-nowrap gold-text-shadow">
                                2x Timer Event
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
                        {/* ANIMATED DIGITS: Scale up and flash green when time is added */}
                        <div 
                            className={`
                                text-8xl font-black tabular-nums bubbly-text tracking-tight transition-all duration-500 ease-out transform
                                ${timerBump ? 'scale-105 text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'scale-100 text-white'}
                                ${stats.isPaused && !timerBump ? 'animate-pulse' : ''} 
                                ${isDoubleTimer && !timerBump ? 'gold-text-shadow' : ''}
                            `}
                        >
                            {timeLeft}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimerWidget;