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
    const [addedTimeBubble, setAddedTimeBubble] = useState<{ text: string, id: number } | null>(null);
    const prevEndTimeRef = useRef(stats.timerEndTime);
    
    // --- ANIMATION LOGIC ---
    useEffect(() => {
        const currentEnd = new Date(stats.timerEndTime).getTime();
        const prevEnd = new Date(prevEndTimeRef.current).getTime();

        // If time increased by more than 10 seconds (ignore small drifts), show bubble
        if (currentEnd > prevEnd + 10000) {
            const addedMs = currentEnd - prevEnd;
            const addedMins = Math.round(addedMs / 60000);
            if (addedMins > 0) {
                setAddedTimeBubble({ text: `+${addedMins}m`, id: Date.now() });
                // Auto-remove after animation
                setTimeout(() => setAddedTimeBubble(null), 3000);
            }
        }
        prevEndTimeRef.current = stats.timerEndTime;
    }, [stats.timerEndTime]);

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

            const h = hours < 10 ? "0" + hours : hours;
            const m = minutes < 10 ? "0" + minutes : minutes;
            const s = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeft(`${h}:${m}:${s}`);
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
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(0.8); opacity: 0; }
                    20% { transform: translateY(-20px) scale(1.1); opacity: 1; }
                    80% { transform: translateY(-60px) scale(1); opacity: 1; }
                    100% { transform: translateY(-80px) scale(0.9); opacity: 0; }
                }
                .bubble-anim {
                    animation: floatUp 2s ease-out forwards;
                }
                .bubbly-text {
                    text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* TOP BAR: TIMER & EVENT */}
            <div className="flex justify-center items-start gap-8">
                {/* TIMER CONTAINER */}
                <div className="relative">
                    {/* Bubbly Background */}
                    <div className={`
                        relative px-8 py-4 rounded-[40px] border-[6px] shadow-2xl transition-all duration-500
                        ${isDoubleTimer 
                            ? 'bg-purple-600 border-purple-300 shadow-[0_0_30px_rgba(147,51,234,0.6)] scale-110' 
                            : 'bg-[#3a1017] border-[#f7c548]'}
                    `}>
                        {isDoubleTimer && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full font-black text-sm uppercase tracking-widest border-2 border-white shadow-lg animate-bounce whitespace-nowrap z-20">
                                2x Timer Active!
                            </div>
                        )}
                        
                        <div className="text-center">
                            <div className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${isDoubleTimer ? 'text-purple-200' : 'text-[#f7c548]'}`}>
                                Subathon Timer
                            </div>
                            <div className={`text-6xl font-black tabular-nums bubbly-text ${stats.isPaused ? 'text-amber-400 animate-pulse' : 'text-white'}`}>
                                {timeLeft}
                            </div>
                        </div>
                    </div>

                    {/* Floating Added Time Bubble */}
                    {addedTimeBubble && (
                        <div key={addedTimeBubble.id} className="absolute -right-16 top-0 bubble-anim z-30">
                            <div className="bg-green-500 text-white font-black text-2xl px-4 py-2 rounded-full border-4 border-white shadow-lg transform rotate-12">
                                {addedTimeBubble.text}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM BAR: WIDGETS */}
            <div className="flex items-end gap-6 w-full">
                
                {/* 1. GOAL BAR */}
                <div className="flex-1 bg-black/60 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-xl">
                    <div className="flex justify-between items-end mb-2 px-2">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Next Goal</span>
                            <span className="text-xl font-black text-white leading-none">{nextGoal.secret ? "?? Secret ??" : nextGoal.reward}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-brand-accent">{Math.floor(currentNB)}</span>
                            <span className="text-sm font-bold text-gray-400"> / {nextGoal.count} NB</span>
                        </div>
                    </div>
                    <div className="h-6 bg-black/50 rounded-full overflow-hidden border border-white/10 relative">
                        <div 
                            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-1000 ease-out relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                        </div>
                    </div>
                </div>

                {/* 2. RECENT EVENT */}
                <div className="w-80 bg-black/60 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10">
                        🔔
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Latest Activity</div>
                        {recentEvents.length > 0 ? (
                            <div>
                                <div className="text-lg font-black text-white truncate">{recentEvents[0].user}</div>
                                <div className="text-sm font-bold text-brand-primary truncate">{recentEvents[0].amountDisplay}</div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500 italic">Waiting...</div>
                        )}
                    </div>
                </div>

                {/* 3. WHEEL WINNER */}
                {wheelHistory.length > 0 && (
                    <div className="w-72 bg-gradient-to-br from-brand-bg to-black backdrop-blur-md rounded-3xl p-4 border border-brand-accent/30 shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-accent text-black rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white shadow-lg animate-pulse">
                            🎡
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-brand-accent uppercase tracking-wider">Last Spin</div>
                            <div className="text-lg font-black text-white truncate">{wheelHistory[0].user}</div>
                            <div className="text-sm font-bold text-gray-300 truncate">Won: {wheelHistory[0].reward}</div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Overlay;