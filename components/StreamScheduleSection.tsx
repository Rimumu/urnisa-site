import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import OptimizedImage from './OptimizedImage';
import {
    BackdropFit,
    ScheduleConfig,
    getStoredScheduleLiveState,
    saveStoredScheduleLiveState,
} from '../hooks/useSchedule';
import { fetchTwitchStreamTitle, useTwitchStreamInfo } from '../hooks/useTwitchStatus';
import { TWITCH_CHANNEL_NAME } from '../constants';

const TWITCH_CHANNEL_URL = `https://www.twitch.tv/${TWITCH_CHANNEL_NAME}`;
const LIVE_START_DELAY_MS = 30_000;

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
    liveDetectedAt?: string;
    streamStarted?: boolean;
    streamTitle?: string;
    isPreview?: boolean;
    onSyncRequest?: () => void;
}

export const StreamCountdownDisplay: React.FC<StreamCountdownDisplayProps> = ({
    title,
    targetIso,
    backdropUrl,
    backdropFit = 'cover',
    compact = false,
    liveDetectedAt = '',
    streamStarted = false,
    streamTitle = '',
    isPreview = false,
    onSyncRequest,
}) => {
    const shouldReduceMotion = useReducedMotion();
    const [nowMs, setNowMs] = useState<number>(() => Date.now());
    const [backdropError, setBackdropError] = useState(false);

    const [localLiveDetectedAt, setLocalLiveDetectedAt] = useState<string>(() => {
        if (liveDetectedAt) return liveDetectedAt;
        if (!isPreview && targetIso) {
            return getStoredScheduleLiveState(targetIso)?.liveDetectedAt || '';
        }
        return '';
    });

    const [localStreamStarted, setLocalStreamStarted] = useState<boolean>(() => {
        if (streamStarted) return true;
        if (!isPreview && targetIso) {
            return Boolean(getStoredScheduleLiveState(targetIso)?.streamStarted);
        }
        return false;
    });

    const [localStreamTitle, setLocalStreamTitle] = useState<string>(() => {
        if (streamTitle) return streamTitle;
        if (!isPreview && targetIso) {
            return getStoredScheduleLiveState(targetIso)?.streamTitle || '';
        }
        return '';
    });

    const lastSyncedRef = useRef<string>('');

    useEffect(() => {
        setBackdropError(false);
    }, [backdropUrl]);

    // Sync local state when backend props or targetIso update
    useEffect(() => {
        if (isPreview) {
            setLocalLiveDetectedAt(liveDetectedAt || '');
            setLocalStreamStarted(Boolean(streamStarted));
            setLocalStreamTitle(streamTitle || '');
            return;
        }

        const stored = targetIso ? getStoredScheduleLiveState(targetIso) : null;

        if (streamStarted) {
            setLocalStreamStarted(true);
            setLocalLiveDetectedAt(liveDetectedAt || stored?.liveDetectedAt || '');
            if (streamTitle) {
                setLocalStreamTitle(streamTitle);
            }
            return;
        }

        // If backend explicitly provides liveDetectedAt, sync it
        if (liveDetectedAt) {
            setLocalLiveDetectedAt(liveDetectedAt);
            if (streamTitle) setLocalStreamTitle(streamTitle);
            return;
        }

        // Otherwise hydrate from local fallback if matching the same targetIso
        if (stored) {
            setLocalLiveDetectedAt(stored.liveDetectedAt);
            setLocalStreamStarted(stored.streamStarted);
            if (stored.streamTitle) setLocalStreamTitle(stored.streamTitle);
        } else {
            setLocalLiveDetectedAt('');
            setLocalStreamStarted(false);
            setLocalStreamTitle('');
        }
    }, [targetIso, liveDetectedAt, streamStarted, streamTitle, isPreview]);

    const targetMs = useMemo(() => {
        if (!targetIso) return NaN;
        return new Date(targetIso).getTime();
    }, [targetIso]);

    const hasValidTarget = !Number.isNaN(targetMs) && Boolean(targetIso);

    const breakdown = useMemo(() => {
        if (!hasValidTarget) {
            return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isZero: true };
        }
        return getCalendarCountdown(nowMs, targetMs);
    }, [hasValidTarget, nowMs, targetMs]);

    const effectiveLiveDetectedAt = liveDetectedAt || localLiveDetectedAt;

    const liveDetectedMs = useMemo(() => {
        if (!effectiveLiveDetectedAt) return NaN;
        return new Date(effectiveLiveDetectedAt).getTime();
    }, [effectiveLiveDetectedAt]);

    const elapsedSinceLiveMs = !Number.isNaN(liveDetectedMs) ? Math.max(0, nowMs - liveDetectedMs) : 0;
    const isStreamStarted =
        hasValidTarget &&
        breakdown.isZero &&
        (streamStarted || localStreamStarted || (!Number.isNaN(liveDetectedMs) && elapsedSinceLiveMs >= LIVE_START_DELAY_MS));

    // Tick every second while counting down OR waiting through the 30-second live stabilization buffer
    useEffect(() => {
        let timerId: number | undefined;
        const needsTick =
            hasValidTarget &&
            !isStreamStarted &&
            (nowMs < targetMs || (!isPreview && breakdown.isZero && Boolean(effectiveLiveDetectedAt)));

        if (!needsTick) return;

        const scheduleNextTick = () => {
            const current = Date.now();
            setNowMs(current);

            if (current < targetMs) {
                const remainder = (targetMs - current) % 1000;
                const delay = remainder > 0 ? remainder + 12 : 1000;
                timerId = window.setTimeout(scheduleNextTick, delay);
            } else if (!isPreview && Boolean(effectiveLiveDetectedAt)) {
                timerId = window.setTimeout(scheduleNextTick, 1000);
            }
        };

        scheduleNextTick();
        return () => {
            if (timerId !== undefined) {
                window.clearTimeout(timerId);
            }
        };
    }, [hasValidTarget, targetMs, isStreamStarted, isPreview, breakdown.isZero, effectiveLiveDetectedAt, nowMs]);

    // Poll Twitch live status & stream title once countdown hits 0 (and refresh title periodically when started)
    const shouldPollTwitch = !isPreview && hasValidTarget && (breakdown.isZero || isStreamStarted);
    const twitchPollIntervalMs = isStreamStarted ? 30_000 : breakdown.isZero ? 5_000 : 60_000;

    const { isLive, streamTitle: polledTwitchTitle } = useTwitchStreamInfo({
        enabled: shouldPollTwitch,
        pollIntervalMs: twitchPollIntervalMs,
        fetchTitle: isStreamStarted || breakdown.isZero,
    });

    // Advance state machine: Stream Starting Soon... -> (live detected) -> wait 30s -> Stream Started!
    useEffect(() => {
        if (isPreview || !hasValidTarget || !breakdown.isZero) return;

        if (isStreamStarted) {
            if (!localStreamStarted) {
                setLocalStreamStarted(true);
                saveStoredScheduleLiveState(targetIso, {
                    liveDetectedAt: effectiveLiveDetectedAt || new Date().toISOString(),
                    streamStarted: true,
                    streamTitle: polledTwitchTitle || localStreamTitle || streamTitle || '',
                });
            }
            return;
        }

        if (isLive) {
            if (!effectiveLiveDetectedAt) {
                const detectedIso = new Date().toISOString();
                setLocalLiveDetectedAt(detectedIso);
                saveStoredScheduleLiveState(targetIso, {
                    liveDetectedAt: detectedIso,
                    streamStarted: false,
                    streamTitle: polledTwitchTitle || localStreamTitle || '',
                });
                if (lastSyncedRef.current !== `detected:${targetIso}`) {
                    lastSyncedRef.current = `detected:${targetIso}`;
                    onSyncRequest?.();
                }
            } else if (!Number.isNaN(liveDetectedMs) && nowMs - liveDetectedMs >= LIVE_START_DELAY_MS) {
                setLocalStreamStarted(true);
                saveStoredScheduleLiveState(targetIso, {
                    liveDetectedAt: effectiveLiveDetectedAt,
                    streamStarted: true,
                    streamTitle: polledTwitchTitle || localStreamTitle || streamTitle || '',
                });
                if (lastSyncedRef.current !== `started:${targetIso}`) {
                    lastSyncedRef.current = `started:${targetIso}`;
                    onSyncRequest?.();
                }
            }
        } else if (effectiveLiveDetectedAt && !streamStarted && !localStreamStarted) {
            setLocalLiveDetectedAt('');
            saveStoredScheduleLiveState(targetIso, {
                liveDetectedAt: '',
                streamStarted: false,
                streamTitle: '',
            });
        }
    }, [
        isPreview,
        hasValidTarget,
        breakdown.isZero,
        isStreamStarted,
        isLive,
        effectiveLiveDetectedAt,
        liveDetectedMs,
        nowMs,
        localStreamStarted,
        polledTwitchTitle,
        localStreamTitle,
        streamTitle,
        targetIso,
        onSyncRequest,
    ]);

    // Fetch / keep stream title updated when Stream Started! activates
    useEffect(() => {
        if (isPreview || !isStreamStarted) return;

        if (polledTwitchTitle && polledTwitchTitle !== localStreamTitle) {
            setLocalStreamTitle(polledTwitchTitle);
            saveStoredScheduleLiveState(targetIso, {
                liveDetectedAt: effectiveLiveDetectedAt || new Date().toISOString(),
                streamStarted: true,
                streamTitle: polledTwitchTitle,
            });
            return;
        }

        if (!polledTwitchTitle && !localStreamTitle && !streamTitle) {
            let cancelled = false;
            fetchTwitchStreamTitle().then((fetched) => {
                if (!cancelled && fetched) {
                    setLocalStreamTitle(fetched);
                    saveStoredScheduleLiveState(targetIso, {
                        liveDetectedAt: effectiveLiveDetectedAt || new Date().toISOString(),
                        streamStarted: true,
                        streamTitle: fetched,
                    });
                }
            });
            return () => {
                cancelled = true;
            };
        }
    }, [
        isPreview,
        isStreamStarted,
        polledTwitchTitle,
        localStreamTitle,
        streamTitle,
        targetIso,
        effectiveLiveDetectedAt,
    ]);

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
    const resolvedTwitchTitle = (polledTwitchTitle || localStreamTitle || streamTitle || '').trim();
    const showZeroState = hasValidTarget && breakdown.isZero;
    const isClickable = isStreamStarted && !isPreview;

    const containerClasses = `relative w-full overflow-hidden rounded-lg flex flex-col items-center justify-center text-center select-none transition-all duration-300 ${
        compact
            ? 'min-h-[240px] sm:min-h-[290px] px-4 py-8'
            : 'aspect-video min-h-[260px] md:min-h-[420px] px-4 sm:px-8 py-10 md:py-16'
    } ${
        isClickable
            ? 'group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#140608]'
            : ''
    }`;

    const innerContent = (
        <>
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
                            className={`w-full h-full transition-transform duration-500 ${
                                isClickable ? 'group-hover:scale-[1.02]' : ''
                            } ${
                                backdropFit === 'contain'
                                    ? 'object-contain object-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.65)]'
                                    : 'object-cover object-center'
                            }`}
                        />
                    </div>
                    {/* Focused center readability scrim so transparent artwork stays vibrant while white text remains crisp */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.38)_55%,rgba(0,0,0,0.22)_100%)] pointer-events-none" />
                </>
            )}

            {/* Foreground Content */}
            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
                {/* Event Title (always kept above) */}
                <h3
                    className={`font-black uppercase text-white tracking-[0.2em] drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)] text-balance leading-tight ${
                        compact
                            ? 'text-xl sm:text-2xl md:text-3xl mb-5'
                            : 'text-2xl sm:text-4xl md:text-5xl mb-6 md:mb-9'
                    }`}
                >
                    {displayTitle}
                </h3>

                {/* Center Slot: Countdown Digits OR Starting Soon / Stream Started! */}
                <AnimatePresence mode="wait">
                    {!showZeroState ? (
                        <motion.div
                            key="countdown-clock"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className="w-full flex flex-col items-center"
                        >
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

                            {hasValidTarget && localTargetLabel ? (
                                <p className="mt-6 md:mt-8 text-xs sm:text-sm text-gray-300/85 font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                    <span className="text-brand-primary font-bold">{localTargetLabel}</span>{' '}
                                    <span className="text-gray-400">@ Your Local Time</span>
                                </p>
                            ) : (
                                <p className="mt-6 md:mt-8 text-xs sm:text-sm text-gray-400 font-medium tracking-wide">
                                    Stream date and time to be announced
                                </p>
                            )}
                        </motion.div>
                    ) : isStreamStarted ? (
                        <motion.div
                            key="stream-started"
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="w-full flex flex-col items-center justify-center"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-center gap-3 sm:gap-4">
                                <svg
                                    className={`text-brand-primary drop-shadow-[0_0_14px_rgba(229,56,59,0.7)] shrink-0 ${
                                        compact ? 'w-7 h-7 sm:w-9 sm:h-9' : 'w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12'
                                    }`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
                                    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
                                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                                    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
                                    <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
                                </svg>
                                <span
                                    className={`font-black tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] ${
                                        compact
                                            ? 'text-2xl sm:text-4xl'
                                            : 'text-3xl sm:text-5xl md:text-6xl'
                                    }`}
                                >
                                    Stream Started!
                                </span>
                            </div>

                            {/* Replaces the date below with the live stream title from Twitch */}
                            <p
                                className={`mt-4 sm:mt-6 max-w-2xl font-semibold text-gray-100 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] text-balance leading-snug ${
                                    compact ? 'text-sm sm:text-base' : 'text-base sm:text-xl md:text-2xl'
                                }`}
                            >
                                {resolvedTwitchTitle || `Live now on twitch.tv/${TWITCH_CHANNEL_NAME}`}
                            </p>

                            <span className="mt-4 sm:mt-5 inline-flex items-center gap-2 text-xs sm:text-sm font-bold tracking-wide text-brand-primary group-hover:text-white transition-colors">
                                <span>Watch on Twitch</span>
                                <svg
                                    className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M7 17 17 7" />
                                    <path d="M7 7h10v10" />
                                </svg>
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="stream-starting-soon"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="w-full flex flex-col items-center justify-center"
                            aria-live="polite"
                        >
                            <div className="flex items-center justify-center gap-3">
                                <svg
                                    className={`text-brand-primary shrink-0 ${
                                        shouldReduceMotion ? '' : 'animate-pulse'
                                    } ${compact ? 'w-6 h-6 sm:w-8 sm:h-8' : 'w-7 h-7 sm:w-10 sm:h-10'}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span
                                    className={`font-black tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.95)] ${
                                        compact
                                            ? 'text-2xl sm:text-4xl'
                                            : 'text-3xl sm:text-5xl md:text-6xl'
                                    }`}
                                >
                                    Stream Starting Soon...
                                </span>
                            </div>

                            <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-300/85 font-medium tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                                {effectiveLiveDetectedAt
                                    ? 'Stream detected on Twitch — preparing broadcast...'
                                    : `Checking twitch.tv/${TWITCH_CHANNEL_NAME} for live status...`}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );

    if (isClickable) {
        return (
            <a
                href={TWITCH_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={containerClasses}
                aria-label={`Stream Started! Watch ${TWITCH_CHANNEL_NAME} on Twitch`}
            >
                {innerContent}
            </a>
        );
    }

    return <div className={containerClasses}>{innerContent}</div>;
};

interface StreamScheduleSectionProps {
    config: ScheduleConfig;
    onSyncRequest?: () => void;
}

const StreamScheduleSection: React.FC<StreamScheduleSectionProps> = ({ config, onSyncRequest }) => {
    return (
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-1 md:p-2 border border-white/10 shadow-2xl shadow-black/40 transition-colors duration-300 hover:border-white/20">
            {config.mode === 'countdown' ? (
                <StreamCountdownDisplay
                    title={config.countdownTitle}
                    targetIso={config.countdownTarget}
                    backdropUrl={config.countdownBackdropUrl}
                    backdropFit={config.countdownBackdropFit}
                    liveDetectedAt={config.liveDetectedAt}
                    streamStarted={config.streamStarted}
                    streamTitle={config.streamTitle}
                    onSyncRequest={onSyncRequest}
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
