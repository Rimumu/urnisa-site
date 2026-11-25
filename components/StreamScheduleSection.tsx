import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import OptimizedImage from './OptimizedImage';
import { BackdropFit, ScheduleConfig } from '../hooks/useSchedule';

export interface CalendarCountdownBreakdown {
    months: number;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isZero: boolean;
}

const addMonthsSafe = (date: Date, monthsToAdd: number): Date => {
    const year = date.getFullYear();
    const month = date.getMonth() + monthsToAdd;
    const day = date.getDate();

    const targetMonthAnchor = new Date(
        year,
        month,
        1,
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds()
    );
    const daysInTargetMonth = new Date(
        targetMonthAnchor.getFullYear(),
        targetMonthAnchor.getMonth() + 1,
        0
    ).getDate();
    targetMonthAnchor.setDate(Math.min(day, daysInTargetMonth));
    return targetMonthAnchor;
};

export const getCalendarCountdown = (nowMs: number, targetMs: number): CalendarCountdownBreakdown => {
    if (!targetMs || Number.isNaN(targetMs) || targetMs <= nowMs) {
        return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true };
    }

    // Snap effective current time to whole remaining seconds so digits count down cleanly 3 -> 2 -> 1 -> 0
    const remainingWholeSeconds = Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
    const effectiveNowMs = targetMs - remainingWholeSeconds * 1000;

    const cursor = new Date(effectiveNowMs);
    const target = new Date(targetMs);

    let months =
        (target.getFullYear() - cursor.getFullYear()) * 12 +
        (target.getMonth() - cursor.getMonth());

    let anchor = addMonthsSafe(cursor, months);
    if (anchor.getTime() > target.getTime()) {
        months = Math.max(0, months - 1);
        anchor = addMonthsSafe(cursor, months);
    }

    const remMs = Math.max(0, target.getTime() - anchor.getTime());
    const days = Math.floor(remMs / 86_400_000);
    const hours = Math.floor((remMs % 86_400_000) / 3_600_000);
    const minutes = Math.floor((remMs % 3_600_000) / 60_000);
    const seconds = Math.floor((remMs % 60_000) / 1000);

    return {
        months,
        days,
        hours,
        minutes,
        seconds,
        isZero: false,
    };
};

interface DoomsdayDigitProps {
    digit: string;
    compact?: boolean;
}

const DoomsdayDigit: React.FC<DoomsdayDigitProps> = ({ digit, compact = false }) => {
    const shouldReduceMotion = useReducedMotion();

    return (
        <span
            className={`relative inline-flex items-center justify-center overflow-hidden tabular-nums select-none align-middle ${
                compact ? 'w-[0.68em] h-[1.2em]' : 'w-[0.72em] h-[1.2em]'
            }`}
        >
            <span aria-hidden="true" className="invisible pointer-events-none">
                {digit}
            </span>
            <AnimatePresence initial={false}>
                <motion.span
                    key={digit}
                    initial={shouldReduceMotion ? false : { y: '85%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { y: '-85%', opacity: 0 }}
                    transition={
                        shouldReduceMotion
                            ? { duration: 0.05 }
                            : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="absolute inset-0 flex items-center justify-center text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] will-change-transform"
                >
                    {digit}
                </motion.span>
            </AnimatePresence>
        </span>
    );
};

interface StreamCountdownDisplayProps {
    title: string;
    targetIso: string;
    backdropUrl?: string;
    backdropFit?: BackdropFit;
    compact?: boolean;
}

export const StreamCountdownDisplay: React.FC<StreamCountdownDisplayProps> = ({
    title,
    targetIso,
    backdropUrl,
    backdropFit = 'cover',
    compact = false,
}) => {
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    const [backdropError, setBackdropError] = useState(false);

    useEffect(() => {
        setBackdropError(false);
    }, [backdropUrl]);

    const targetMs = useMemo(() => {
        if (!targetIso) return NaN;
        return new Date(targetIso).getTime();
    }, [targetIso]);

    useEffect(() => {
        let timerId: number | undefined;

        const scheduleNextTick = () => {
            const current = Date.now();
            setNowMs(current);

            if (Number.isNaN(targetMs) || current >= targetMs) {
                return;
            }

            const remainder = (targetMs - current) % 1000;
            const delay = remainder > 0 ? remainder + 12 : 1000;
            timerId = window.setTimeout(scheduleNextTick, delay);
        };

        scheduleNextTick();
        return () => {
            if (timerId !== undefined) {
                window.clearTimeout(timerId);
            }
        };
    }, [targetMs]);

    const hasValidTarget = !Number.isNaN(targetMs) && Boolean(targetIso);

    const breakdown = useMemo(() => {
        if (!hasValidTarget) {
            return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true };
        }
        return getCalendarCountdown(nowMs, targetMs);
    }, [hasValidTarget, nowMs, targetMs]);

    const localTargetLabel = useMemo(() => {
        if (!hasValidTarget) return '';
        try {
            const dateObj = new Date(targetMs);
            const datePart = new Intl.DateTimeFormat('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            }).format(dateObj);
            const timePart = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            }).format(dateObj);
            return `${datePart} ${timePart}`;
        } catch {
            return '';
        }
    }, [hasValidTarget, targetMs]);

    const units = [
        { key: 'months', label: 'MONTHS', value: String(breakdown.months).padStart(2, '0') },
        { key: 'days', label: 'DAYS', value: String(breakdown.days).padStart(2, '0') },
        { key: 'hours', label: 'HOURS', value: String(breakdown.hours).padStart(2, '0') },
        { key: 'minutes', label: 'MINUTES', value: String(breakdown.minutes).padStart(2, '0') },
        { key: 'seconds', label: 'SECONDS', value: String(breakdown.seconds).padStart(2, '0') },
    ];

    const showBackdrop = Boolean(backdropUrl && backdropUrl.trim() && !backdropError);
    const displayTitle = (title || 'NEXT STREAM').trim();

    return (
        <div
            className={`relative w-full overflow-hidden rounded-lg flex flex-col items-center justify-center text-center select-none ${
                compact ? 'min-h-[240px] sm:min-h-[290px] px-4 py-8' : 'aspect-video min-h-[260px] md:min-h-[420px] px-4 sm:px-8 py-10 md:py-16'
            }`}
        >

            {/* Native STEAK House Crimson Obsidian Atmosphere (Always sits behind transparent backdrops too) */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1f090c] via-[#140608] to-[#0b0304]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(229,56,59,0.2)_0%,rgba(58,16,23,0.16)_50%,transparent_80%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-primary/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />

            {/* Optional Custom Backdrop Image + Balanced Contrast Scrim */}
            {showBackdrop && (
                <>
                    <div
                        className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                            backdropFit === 'contain' ? 'p-2 sm:p-4' : ''
                        }`}
                    >
                        <img
                            src={backdropUrl}
                            alt={displayTitle}
                            referrerPolicy="no-referrer"
                            onError={() => setBackdropError(true)}
                            className={`w-full h-full ${
                                backdropFit === 'contain'
                                    ? 'object-contain object-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]'
                                    : 'object-cover object-center'
                            }`}
                        />
                    </div>
                    {/* Focused center readability scrim so transparent artwork stays vibrant while white digits remain crisp */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_55%,rgba(0,0,0,0.22)_100%)] pointer-events-none" />
                </>
            )}

            {/* Foreground Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
                {/* Title */}
                <h3
                    className={`font-black uppercase text-white tracking-[0.2em] drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] text-balance leading-tight ${
                        compact
                            ? 'text-xl sm:text-2xl md:text-3xl mb-5'
                            : 'text-2xl sm:text-4xl md:text-5xl mb-6 md:mb-9'
                    }`}
                >
                    {displayTitle}
                </h3>

                {/* Clock Row: MONTHS : DAYS : HOURS : MINUTES : SECONDS */}
                <div
                    className="w-full flex items-start justify-center font-sans"
                    role="timer"
                    aria-live="off"
                    aria-label={`${displayTitle} countdown`}
                >
                    {units.map((unit, idx) => (
                        <React.Fragment key={unit.key}>
                            <div className="flex flex-col items-center min-w-0">
                                <div
                                    className={`font-semibold tracking-[0.06em] leading-none flex items-center justify-center tabular-nums ${
                                        compact
                                            ? 'text-2xl sm:text-4xl'
                                            : 'text-[1.65rem] sm:text-4xl md:text-6xl lg:text-7xl'
                                    }`}
                                >
                                    {unit.value.split('').map((ch, digitIdx) => (
                                        <DoomsdayDigit
                                            key={`${unit.key}-${digitIdx}`}
                                            digit={ch}
                                            compact={compact}
                                        />
                                    ))}
                                </div>
                                <span
                                    className={`uppercase font-semibold text-gray-300/85 mt-2 sm:mt-3 tracking-[0.14em] sm:tracking-[0.24em] whitespace-nowrap ${
                                        compact ? 'text-[8px] sm:text-[10px]' : 'text-[8px] sm:text-[10px] md:text-xs'
                                    }`}
                                >
                                    {unit.label}
                                </span>
                            </div>

                            {idx < units.length - 1 && (
                                <span
                                    aria-hidden="true"
                                    className={`font-semibold text-brand-primary drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] leading-none select-none shrink-0 ${
                                        compact
                                            ? 'text-2xl sm:text-4xl mx-1 sm:mx-2.5'
                                            : 'text-[1.5rem] sm:text-4xl md:text-6xl lg:text-7xl mx-1 sm:mx-2.5 md:mx-4'
                                    }`}
                                >
                                    :
                                </span>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Zero-Time Starting Soon State OR Unboxed Viewer Local Time */}
                {hasValidTarget && breakdown.isZero ? (
                    <div className="mt-6 md:mt-8 flex items-center justify-center gap-2 text-brand-primary font-extrabold uppercase tracking-[0.22em] text-xs sm:text-sm animate-pulse">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>Starting Soon</span>
                    </div>
                ) : hasValidTarget && localTargetLabel ? (
                    <p className="mt-6 md:mt-8 text-xs sm:text-sm text-gray-300/85 font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        <span className="text-brand-primary font-bold">{localTargetLabel}</span>{' '}
                        <span className="text-gray-400">@ Your Local Time</span>
                    </p>
                ) : (
                    <p className="mt-6 md:mt-8 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
                        Stream date and time to be announced
                    </p>
                )}
            </div>
        </div>
    );
};

interface StreamScheduleSectionProps {
    config: ScheduleConfig;
}

const StreamScheduleSection: React.FC<StreamScheduleSectionProps> = ({ config }) => {
    return (
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-1 md:p-2 border border-white/10 shadow-2xl shadow-black/40">
            {config.mode === 'countdown' ? (
                <StreamCountdownDisplay
                    title={config.countdownTitle}
                    targetIso={config.countdownTarget}
                    backdropUrl={config.countdownBackdropUrl}
                    backdropFit={config.countdownBackdropFit}
                />
            ) : (
                <OptimizedImage
                    src={config.url}
                    alt="Urnisa's weekly stream schedule"
                    className="rounded-lg w-full h-auto aspect-video md:aspect-auto"
                    contain
                    priority
                />
            )}
        </div>
    );
};

export default StreamScheduleSection;
