import React, { useState, useEffect } from 'react';

const ClockWidget: React.FC = () => {
    const [timeData, setTimeData] = useState<{
        hours: string;
        minutes: string;
        seconds: string;
        ampm: string;
        timeZoneName: string;
        formattedDate: string;
    }>({
        hours: '00',
        minutes: '00',
        seconds: '00',
        ampm: 'AM',
        timeZoneName: 'BST',
        formattedDate: '',
    });

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();

            // Format parts for Europe/London timezone
            try {
                const timeFormatter = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Europe/London',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                });

                const tzFormatter = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Europe/London',
                    timeZoneName: 'short',
                });

                const dateFormatter = new Intl.DateTimeFormat('en-GB', {
                    timeZone: 'Europe/London',
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                });

                const parts = timeFormatter.formatToParts(now);
                let hours = '00';
                let minutes = '00';
                let seconds = '00';
                let ampm = '';

                parts.forEach((part) => {
                    if (part.type === 'hour') hours = part.value;
                    if (part.type === 'minute') minutes = part.value;
                    if (part.type === 'second') seconds = part.value;
                    if (part.type === 'dayPeriod') ampm = part.value.toUpperCase();
                });

                const tzParts = tzFormatter.formatToParts(now);
                const tzPart = tzParts.find((p) => p.type === 'timeZoneName');
                const timeZoneName = tzPart ? tzPart.value : 'UK';

                const formattedDate = dateFormatter.format(now);

                setTimeData({
                    hours,
                    minutes,
                    seconds,
                    ampm,
                    timeZoneName,
                    formattedDate,
                });
            } catch {
                // Fallback
                const hours = String(now.getUTCHours()).padStart(2, '0');
                const minutes = String(now.getUTCMinutes()).padStart(2, '0');
                const seconds = String(now.getUTCSeconds()).padStart(2, '0');
                setTimeData({
                    hours,
                    minutes,
                    seconds,
                    ampm: 'UTC',
                    timeZoneName: 'GMT',
                    formattedDate: '',
                });
            }
        };

        updateClock();
        const timer = setInterval(updateClock, 250);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-full flex items-center justify-center bg-transparent overflow-visible p-6 font-sans">
            <style>{`
                .bubbly-text { 
                    text-shadow: 2px 2px 0px rgba(0,0,0,0.8), 0 0 25px rgba(255,255,255,0.15), 0 0 10px rgba(244,63,94,0.3); 
                }
            `}</style>

            <div className="relative flex flex-col items-center">
                {/* Main Clock Card - Black & White with Red Accent */}
                <div
                    className="relative w-[480px] sm:w-[520px] h-[165px] rounded-[50px] border-[4px] shadow-2xl transition-all duration-500 z-20 flex flex-col justify-center items-center px-6 bg-gradient-to-b from-[#18181b] via-[#101012] to-[#09090b] border-white/80 shadow-[0_0_35px_rgba(0,0,0,0.8),0_0_20px_rgba(244,63,94,0.25)]"
                >
                    {/* Faint Red Ambient Radial Glow */}
                    <div className="absolute inset-0 rounded-[46px] bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 pointer-events-none" />

                    {/* Top Floating Badge */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-2 z-30">
                        <div className="bg-[#09090b] text-white px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest border-2 border-white/60 shadow-[0_0_15px_rgba(244,63,94,0.3)] whitespace-nowrap">
                            <span>LONDON, UK (<span className="text-rose-400">{timeData.timeZoneName}</span>)</span>
                        </div>
                    </div>

                    {/* Content Container */}
                    <div className="text-center w-full flex flex-col items-center justify-center -translate-y-1 relative z-10">
                        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.25em] pl-[0.25em] mb-0.5 text-zinc-400">
                            <span className="text-zinc-200">CURRENT TIME</span>
                            {timeData.formattedDate && (
                                <>
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span className="text-zinc-300">{timeData.formattedDate}</span>
                                </>
                            )}
                        </div>

                        {/* Centered Digits Display with Vertically Centered AM/PM (Hours & Minutes only) */}
                        <div className="flex items-center justify-center leading-none text-8xl font-black tabular-nums bubbly-text text-white tracking-tight -translate-y-1.5 select-none">
                            <span className="inline-block text-center">{timeData.hours}</span>
                            <span className="inline-block mx-2 text-rose-500 opacity-90 -translate-y-1 select-none">:</span>
                            <span className="inline-block text-center">{timeData.minutes}</span>

                            {timeData.ampm && (
                                <span className="ml-4 text-2xl font-black tracking-wider text-zinc-100 uppercase bg-black/60 px-3 py-1.5 rounded-xl border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)] leading-none inline-flex items-center justify-center">
                                    {timeData.ampm}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClockWidget;
