import React, { useState, useEffect } from 'react';
import { useCountdown } from '../../hooks/useCountdown';

const CountdownWidget: React.FC = () => {
    const { stats } = useCountdown(1000);
    const [timeLeft, setTimeLeft] = useState("00:00:00");

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

    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent font-sans p-10">
            <style>{`
                .bubbly-text { text-shadow: 2px 2px 0px rgba(0,0,0,0.5); }
                .gold-text-shadow { text-shadow: 0px 2px 4px rgba(0,0,0,0.3); }
            `}</style>

            <div className={`
                relative w-[640px] h-[160px] rounded-[50px] border-[4px] shadow-2xl transition-all duration-500 z-20 flex flex-col justify-center items-center
                bg-gradient-to-br from-[#9f1239] to-[#4c0519] border-[#fda4af] shadow-[0_0_30px_rgba(251,113,133,0.4)]
            `}>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col-reverse items-center gap-2 w-full z-30">
                    {stats.isPaused && (
                        <div className="bg-amber-500 text-white px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse whitespace-nowrap">
                            TIMER PAUSED
                        </div>
                    )}
                </div>

                <div className="text-center w-full">
                    <div className="text-xs font-black uppercase tracking-[0.3em] mb-1 text-rose-100">
                        Timer
                    </div>
                    <div className={`text-8xl font-black tabular-nums bubbly-text tracking-tight text-white ${stats.isPaused ? 'animate-pulse' : ''}`}>
                        {timeLeft}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CountdownWidget;