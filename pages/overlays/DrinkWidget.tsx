import React, { useEffect, useRef, useState } from 'react';
import { DrinkSpinRecord, useDrinkingEvent } from '../../hooks/useDrinkingEvent';

const DRAWER_VISIBLE_MS = 15000;

const CocktailGlassIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8" />
        <path d="M12 11v11" />
        <path d="m19 3-7 8-7-8Z" />
        <path d="M15 3l3-2" />
    </svg>
);

const ShotCupIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h12l-1.5 15a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L6 4Z" />
        <path d="M7.2 10.5h9.6" />
        <path d="M8.5 17.5h7" />
    </svg>
);

const WheelIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1.25L14.2 4.4H9.8L12 1.25Z" fill="currentColor" stroke="none" />
        <path d="M12 13L12 4.5A8.5 8.5 0 0 1 18.01 6.99Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L20.5 13A8.5 8.5 0 0 1 18.01 19.01Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L12 21.5A8.5 8.5 0 0 1 5.99 19.01Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <path d="M12 13L3.5 13A8.5 8.5 0 0 1 5.99 6.99Z" fill="currentColor" fillOpacity="0.28" stroke="none" />
        <circle cx="12" cy="13" r="8.5" />
        <path d="M12 4.5V21.5" />
        <path d="M3.5 13H20.5" />
        <path d="M5.99 6.99L18.01 19.01" />
        <path d="M18.01 6.99L5.99 19.01" />
        <circle cx="12" cy="13" r="2.2" fill="#140608" />
        <circle cx="12" cy="13" r="0.9" fill="currentColor" stroke="none" />
    </svg>
);

const DrinkWidget: React.FC = () => {
    const { settings, stats, pendingQueue, recentHistory, latestTrigger, activeSpin, spinHistory } = useDrinkingEvent(2500);
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    const [drawerSpin, setDrawerSpin] = useState<DrinkSpinRecord | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const acknowledgedSpinIdRef = useRef<string | null>(null);
    const hideTimerRef = useRef<number | null>(null);
    const clearTimerRef = useRef<number | null>(null);

    const clearDrawerTimers = () => {
        if (hideTimerRef.current !== null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        if (clearTimerRef.current !== null) {
            window.clearTimeout(clearTimerRef.current);
            clearTimerRef.current = null;
        }
    };

    useEffect(() => {
        return () => clearDrawerTimers();
    }, []);

    // Keep local clock synchronized with activeSpin.revealAt so the drawer slides out immediately upon landing
    useEffect(() => {
        if (!activeSpin) return;
        const revealAtMs = new Date(activeSpin.revealAt).getTime();
        const remainingMs = revealAtMs - Date.now();
        if (remainingMs <= 0) {
            setNowMs(Date.now());
            return;
        }
        const timer = window.setTimeout(() => {
            setNowMs(Date.now());
        }, remainingMs + 30);
        return () => window.clearTimeout(timer);
    }, [activeSpin]);

    const activeRevealMs = activeSpin ? new Date(activeSpin.revealAt).getTime() : 0;
    const isSpinning = Boolean(activeSpin && nowMs < activeRevealMs);

    // If a new spin starts while an older result drawer is still open, tuck it away first
    useEffect(() => {
        if (isSpinning && activeSpin && drawerSpin && activeSpin.spinId !== drawerSpin.spinId) {
            clearDrawerTimers();
            setIsDrawerOpen(false);
            clearTimerRef.current = window.setTimeout(() => {
                setDrawerSpin(null);
            }, 350);
        }
    }, [isSpinning, activeSpin, drawerSpin]);

    // Trigger the 15-second bottom slide-out drawer when a spin lands on a segment
    useEffect(() => {
        const revealedCandidate =
            activeSpin && nowMs >= new Date(activeSpin.revealAt).getTime()
                ? activeSpin
                : spinHistory[0] || null;

        if (!revealedCandidate) return;

        const spinId = revealedCandidate.spinId;
        if (acknowledgedSpinIdRef.current === spinId) return;

        const revealAtMs = new Date(revealedCandidate.revealAt).getTime();
        const elapsedSinceReveal = Date.now() - revealAtMs;
        if (elapsedSinceReveal < 0) return;

        acknowledgedSpinIdRef.current = spinId;

        // Ignore historical spins older than the 15s display window on initial page load
        if (elapsedSinceReveal > DRAWER_VISIBLE_MS) return;

        clearDrawerTimers();
        setDrawerSpin(revealedCandidate);
        setIsDrawerOpen(false);

        let innerFrame = 0;
        const outerFrame = window.requestAnimationFrame(() => {
            innerFrame = window.requestAnimationFrame(() => {
                setIsDrawerOpen(true);
            });
        });

        const stayOpenMs = Math.max(1000, DRAWER_VISIBLE_MS - elapsedSinceReveal);
        hideTimerRef.current = window.setTimeout(() => {
            setIsDrawerOpen(false);
            clearTimerRef.current = window.setTimeout(() => {
                setDrawerSpin(null);
            }, 420);
        }, stayOpenMs);

        return () => {
            window.cancelAnimationFrame(outerFrame);
            if (innerFrame) window.cancelAnimationFrame(innerFrame);
        };
    }, [activeSpin, spinHistory, nowMs]);

    const nextUp = pendingQueue[0] || null;
    const skippedShotsCount = stats.skippedShots ?? Array.from(
        new Map([...pendingQueue, ...recentHistory].map((item) => [item._id, item])).values()
    ).reduce((sum, item) => sum + (Number(item.skippedShots) || 0), 0);

    const hasAdditionalSpinQueue = stats.pendingShotsCount > 0 || stats.shotsIntoCurrentSpin > 0;
    const isProgressBarFull = stats.spinReady && !hasAdditionalSpinQueue;

    const spinPercent = stats.shotsPerSpin > 0
        ? (isProgressBarFull ? 100 : Math.min(100, Math.round((stats.shotsIntoCurrentSpin / stats.shotsPerSpin) * 100)))
        : 0;

    const queuedPourPercent = stats.shotsPerSpin > 0 && !isProgressBarFull && !isSpinning
        ? Math.min(100 - spinPercent, Math.round((stats.pendingShotsCount / stats.shotsPerSpin) * 100))
        : 0;

    return (
        <div className="w-full h-full bg-transparent p-6 font-sans flex items-start justify-center">
            <style>{`
                @keyframes drinkElasticSlideUp {
                    0% { opacity: 0; transform: translateY(20px) scale(0.96); }
                    55% { opacity: 1; transform: translateY(-2px) scale(1.01); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes drawerCountdown {
                    0% { transform: scaleX(1); }
                    100% { transform: scaleX(0); }
                }
                .drink-animate-entry {
                    animation: drinkElasticSlideUp 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                .drawer-timer-bar {
                    transform-origin: left center;
                    animation: drawerCountdown ${DRAWER_VISIBLE_MS}ms linear forwards;
                }
                @media (prefers-reduced-motion: reduce) {
                    .drink-animate-entry,
                    .drawer-timer-bar {
                        animation: none !important;
                    }
                }
            `}</style>

            <div className="w-full max-w-md flex flex-col items-center">
                {/* Main Rose-Pink OBS Card */}
                <div className="relative z-20 w-full rounded-2xl border border-[#fda4af]/80 bg-gradient-to-r from-[#881337]/95 via-[#18070a]/95 to-black/95 shadow-[0_0_24px_rgba(225,29,72,0.28)] p-4 space-y-3">
                    {/* Top Header + Counters (Served · Queue · Skips) */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-amber-300 shrink-0">
                                <CocktailGlassIcon className="w-4 h-4" />
                            </span>
                            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#fda4af] truncate">
                                STEAK HOUSE BAR
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-mono font-bold tabular-nums shrink-0 whitespace-nowrap">
                            <span className="text-white">
                                Served <span className="text-rose-300">{stats.completedShots}</span>
                            </span>
                            <span className="text-white/25" aria-hidden="true">·</span>
                            <span className="text-white">
                                Queue <span className="text-amber-300">{stats.pendingShotsCount}</span>
                            </span>
                            <span className="text-white/25" aria-hidden="true">·</span>
                            <span className="text-white">
                                Skips <span className="text-rose-400">{skippedShotsCount}</span>
                            </span>
                        </div>
                    </div>

                    {/* Compact Dual Spotlight: Now Drinking + Latest Bartender */}
                    <div className="rounded-xl border border-white/10 bg-black/45 divide-y divide-white/10 overflow-hidden">
                        {/* Row 1: Now Drinking */}
                        <div className="flex items-center gap-3 px-3.5 py-2.5">
                            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                                nextUp
                                    ? 'text-[#fda4af] bg-rose-500/15 border-[#fda4af]/40'
                                    : 'text-white/40 bg-white/5 border-white/10'
                            }`}>
                                <ShotCupIcon className="w-4 h-4" />
                            </div>
                            {nextUp ? (
                                <div key={`next-${nextUp._id}-${nextUp.remainingShots}`} className="drink-animate-entry flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#fda4af]">
                                            Now Drinking
                                        </span>
                                        <span className="text-[10px] font-mono font-bold tabular-nums text-amber-300 shrink-0">
                                            {nextUp.totalShots > 1
                                                ? `${nextUp.remainingShots}/${nextUp.totalShots} ${settings.shotLabel}s`
                                                : nextUp.drinkLabel}
                                        </span>
                                    </div>
                                    <div className="text-sm font-black text-white truncate leading-tight">
                                        {nextUp.user}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                    <div>
                                        <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200/55">
                                            Now Drinking
                                        </div>
                                        <div className="text-xs font-semibold text-white/55">
                                            Bar counter clear
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-mono text-white/40 shrink-0">
                                        Queue empty
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Row 2: Latest Bartender */}
                        <div className="flex items-center gap-3 px-3.5 py-2.5">
                            <div className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 text-amber-300 bg-amber-500/15 border-amber-400/35">
                                <CocktailGlassIcon className="w-4 h-4" />
                            </div>
                            {latestTrigger ? (
                                <div key={latestTrigger._id} className="drink-animate-entry flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200/75">
                                            Latest Bartender
                                        </span>
                                        <span className="text-[10px] font-mono tabular-nums text-white/55 shrink-0">
                                            {latestTrigger.amountDisplay}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5 min-w-0">
                                        <span className="text-sm font-black text-white truncate leading-tight">
                                            {latestTrigger.user}
                                        </span>
                                        <span className="text-white/30 text-xs shrink-0" aria-hidden="true">·</span>
                                        <span className="text-xs font-semibold text-amber-200 truncate">
                                            {latestTrigger.drinkLabel}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest text-rose-200/60">
                                        Latest Bartender
                                    </div>
                                    <div className="text-xs font-semibold text-white/55">
                                        Waiting for £{settings.gbpPerShot}+ donation...
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Wheel Spin Meter */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                            <span className="flex items-center gap-1.5 text-amber-300 uppercase tracking-wider min-w-0">
                                <WheelIcon className={`w-3.5 h-3.5 shrink-0 ${isSpinning ? 'animate-spin' : ''}`} />
                                <span className="font-mono tabular-nums truncate">
                                    {isSpinning
                                        ? 'WHEEL IS SPINNING'
                                        : stats.shotsPerSpin > 0
                                            ? (stats.spinReady
                                                ? (hasAdditionalSpinQueue
                                                    ? `${stats.shotsIntoCurrentSpin} / ${stats.shotsPerSpin} ${settings.shotLabel.toUpperCase()}S · ${stats.availableSpins} SPIN${stats.availableSpins === 1 ? '' : 'S'} READY`
                                                    : `${stats.availableSpins} SPIN${stats.availableSpins === 1 ? '' : 'S'} READY`)
                                                : `${stats.shotsIntoCurrentSpin} / ${stats.shotsPerSpin} ${settings.shotLabel.toUpperCase()}S`)
                                            : 'MANUAL BAR SPINS'}
                                </span>
                            </span>

                            {stats.shotsPerSpin > 0 && !stats.spinReady && !isSpinning && (
                                <span className="text-white/60 font-mono tabular-nums shrink-0">
                                    Spin in {stats.nextSpinIn}
                                </span>
                            )}
                        </div>

                        <div className="relative h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                            {stats.shotsPerSpin > 1 && (
                                <div className="absolute inset-0 pointer-events-none z-20">
                                    {Array.from({ length: stats.shotsPerSpin - 1 }).map((_, i) => (
                                        <span
                                            key={i}
                                            className="absolute top-0 bottom-0 w-[1px] bg-black/45"
                                            style={{ left: `${((i + 1) / stats.shotsPerSpin) * 100}%` }}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="relative h-full w-full flex items-center">
                                <div
                                    className={`h-full transition-all duration-700 ${
                                        isProgressBarFull || isSpinning ? 'bg-amber-400' : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${isSpinning ? 100 : spinPercent}%` }}
                                />
                                {queuedPourPercent > 0 && (
                                    <div
                                        className="h-full bg-amber-300/45 border-r border-amber-300/80 transition-all duration-700 animate-pulse"
                                        style={{ width: `${queuedPourPercent}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sliding Bottom Wheel Result Container (auto-hides after 15s) */}
                {drawerSpin && (
                    <div
                        className={`relative z-10 w-full -mt-2 grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            isDrawerOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                    >
                        <div className="overflow-hidden min-h-0 px-6">
                            <div
                                className={`pt-2 pb-7 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                    isDrawerOpen ? 'translate-y-0' : '-translate-y-full'
                                }`}
                            >
                                <div className="rounded-b-2xl overflow-hidden border border-t-0 border-[#fda4af]/80 bg-gradient-to-r from-[#881337]/95 via-[#18070a]/95 to-black/95 shadow-[0_0_24px_rgba(225,29,72,0.28)]">
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <div className="w-9 h-9 rounded-lg border border-amber-400/40 bg-amber-500/15 text-amber-300 flex items-center justify-center shrink-0">
                                            <WheelIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase tracking-widest">
                                                <span className="text-[#fda4af]">Wheel Result</span>
                                                <span className="text-amber-300/80 font-mono tabular-nums shrink-0">
                                                    {drawerSpin.isFreeSpin ? 'Free Spin' : `At ${drawerSpin.shotCountAtSpin} Shot${drawerSpin.shotCountAtSpin === 1 ? '' : 's'}`}
                                                </span>
                                            </div>
                                            <div className="text-sm font-black text-white truncate leading-snug mt-0.5">
                                                {drawerSpin.reward}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-[2px] w-full bg-white/10 overflow-hidden">
                                        <div
                                            key={drawerSpin.spinId}
                                            className="h-full w-full bg-gradient-to-r from-[#fda4af] to-amber-300 drawer-timer-bar"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DrinkWidget;
