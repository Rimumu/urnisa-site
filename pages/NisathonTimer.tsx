import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pause, Sparkles } from 'lucide-react';
import { useNisathonStats } from '../hooks/useNisathonStats';
import { ContributionHistoryModal, getContributionTypeConfig, formatEventDate, formatAddedTime, NISATHON_START_DATE } from '../components/ContributionHistoryModal';

export const NisathonTimer: React.FC = () => {
    const { stats, recentEvents, loading } = useNisathonStats(2000);
    const [showTimer, setShowTimer] = useState<boolean>(false);
    const [showInfoCard, setShowInfoCard] = useState<boolean>(false);
    const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

    // Filter contributions (subs, gift subs, bits, donations) from Sep 18 onwards
    const contributions = useMemo(() => {
        return (recentEvents || []).filter(e => {
            const type = e.type?.toLowerCase() || '';
            const isContrib = ['sub', 'subscriber', 'gift', 'bits', 'cheer', 'donation', 'tip'].includes(type);
            if (!isContrib) return false;
            const time = new Date(e.createdAt).getTime();
            return !isNaN(time) && time >= NISATHON_START_DATE;
        });
    }, [recentEvents]);

    const latestContribution = contributions.length > 0 ? contributions[0] : null;

    // Compute remaining time in milliseconds
    const [remainingMs, setRemainingMs] = useState<number>(() => {
        const cached = localStorage.getItem('nisathon_preserved_timer_ms');
        return cached ? Math.max(0, Number(cached)) : 0;
    });

    useEffect(() => {
        const calculateMs = () => {
            let ms = 0;
            if (stats.isPaused || stats.isEnded) {
                if (typeof stats.remainingTimeMs === 'number' && stats.remainingTimeMs > 0) {
                    ms = stats.remainingTimeMs;
                } else {
                    const cached = localStorage.getItem('nisathon_preserved_timer_ms');
                    ms = cached ? Math.max(0, Number(cached)) : (stats.remainingTimeMs || 0);
                }
            } else {
                const now = Date.now();
                const end = new Date(stats.timerEndTime).getTime();
                ms = Math.max(0, end - now);
            }
            return ms;
        };

        const update = () => {
            const ms = calculateMs();
            setRemainingMs(ms);
            if (ms > 0) {
                try {
                    localStorage.setItem('nisathon_preserved_timer_ms', ms.toString());
                } catch (_) {}
            }
        };

        update();

        // If not paused and not ended, tick every second
        if (!stats.isPaused && !stats.isEnded) {
            const interval = setInterval(update, 1000);
            return () => clearInterval(interval);
        }
    }, [stats.timerEndTime, stats.isPaused, stats.isEnded, stats.remainingTimeMs]);

    // Cooldown & transition refs to prevent double-scrolling / momentum carryover
    const timerRevealedAtRef = React.useRef<number>(0);
    const infoCardRevealedAtRef = React.useRef<number>(0);
    const isTransitioningRef = React.useRef<boolean>(false);

    const handleOpenTimer = () => {
        setShowTimer(true);
        timerRevealedAtRef.current = Date.now();
        isTransitioningRef.current = true;
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 1200); // 1.2s cooldown so initial scroll gesture/momentum never opens info card accidentally
    };

    const handleCloseTimer = () => {
        setShowTimer(false);
        setShowInfoCard(false);
        timerRevealedAtRef.current = 0;
        infoCardRevealedAtRef.current = 0;
        isTransitioningRef.current = true;
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 600);
    };

    const handleOpenInfoCard = () => {
        setShowInfoCard(true);
        infoCardRevealedAtRef.current = Date.now();
        isTransitioningRef.current = true;
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 600);
    };

    const handleCloseInfoCard = () => {
        setShowInfoCard(false);
        isTransitioningRef.current = true;
        setTimeout(() => {
            isTransitioningRef.current = false;
        }, 600);
    };

    // Intercept scroll/wheel/touch/keys
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isTransitioningRef.current) return;

            if (!showTimer && e.deltaY > 15) {
                e.preventDefault();
                handleOpenTimer();
            } else if (showTimer && !showInfoCard && e.deltaY > 25) {
                // Must have been on timer page for at least 1.2s to prevent double-scroll opening
                if (Date.now() - timerRevealedAtRef.current < 1200) return;
                e.preventDefault();
                handleOpenInfoCard();
            } else if (showTimer && showInfoCard && e.deltaY < -20 && window.scrollY <= 10) {
                if (Date.now() - infoCardRevealedAtRef.current < 400) return;
                e.preventDefault();
                handleCloseInfoCard();
            } else if (showTimer && !showInfoCard && e.deltaY < -25 && window.scrollY <= 10) {
                e.preventDefault();
                handleCloseTimer();
            }
        };

        let touchStartY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                touchStartY = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isTransitioningRef.current || e.touches.length === 0) return;
            const currentY = e.touches[0].clientY;
            const deltaY = touchStartY - currentY; // positive = swipe up = scroll down

            if (!showTimer && deltaY > 30) {
                if (e.cancelable) e.preventDefault();
                handleOpenTimer();
            } else if (showTimer && !showInfoCard && deltaY > 35) {
                if (Date.now() - timerRevealedAtRef.current < 1200) return;
                if (e.cancelable) e.preventDefault();
                handleOpenInfoCard();
            } else if (showTimer && showInfoCard && deltaY < -40 && window.scrollY <= 10) {
                if (Date.now() - infoCardRevealedAtRef.current < 400) return;
                if (e.cancelable) e.preventDefault();
                handleCloseInfoCard();
            } else if (showTimer && !showInfoCard && deltaY < -40 && window.scrollY <= 10) {
                if (e.cancelable) e.preventDefault();
                handleCloseTimer();
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (isTransitioningRef.current) return;

            if (!showTimer && (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ')) {
                e.preventDefault();
                handleOpenTimer();
            } else if (showTimer && !showInfoCard && (e.key === 'ArrowDown' || e.key === 'PageDown')) {
                if (Date.now() - timerRevealedAtRef.current < 1200) return;
                e.preventDefault();
                handleOpenInfoCard();
            } else if (showTimer && showInfoCard && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
                if (window.scrollY <= 10) {
                    e.preventDefault();
                    handleCloseInfoCard();
                }
            } else if (showTimer && !showInfoCard && (e.key === 'ArrowUp' || e.key === 'PageUp')) {
                if (window.scrollY <= 10) {
                    e.preventDefault();
                    handleCloseTimer();
                }
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [showTimer, showInfoCard]);

    // Format remaining time into components
    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const totalSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const hStr = totalHours < 10 ? `0${totalHours}` : `${totalHours}`;
    const mStr = totalMinutes < 10 ? `0${totalMinutes}` : `${totalMinutes}`;
    const sStr = totalSeconds < 10 ? `0${totalSeconds}` : `${totalSeconds}`;

    return (
        <div className="w-full min-h-[calc(100vh-14rem)] flex flex-col items-center justify-center relative overflow-hidden py-6">
            <AnimatePresence mode="wait">
                {!showTimer ? (
                    /* 1. INTRO VIEW: Big Centered Animated Title + Bouncing Arrow */
                    <motion.div
                        key="intro-screen"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.94, y: -40 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col items-center justify-center text-center max-w-5xl px-4 my-auto select-none"
                    >
                        {/* Ambient Glow Aura */}
                        <div className="relative flex flex-col items-center justify-center">
                            <motion.div 
                                className="absolute -inset-12 bg-brand-primary/25 rounded-full blur-[100px] pointer-events-none"
                                animate={{
                                    scale: [1, 1.15, 1],
                                    opacity: [0.35, 0.65, 0.35],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            <h1 className="relative text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tight drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] leading-tight">
                                NISATHON{" "}
                                <span className="text-brand-primary drop-shadow-[0_0_45px_rgba(229,56,59,0.8)] inline-block">
                                    WILL RETURN
                                </span>
                            </h1>
                        </div>

                        {/* Scroll Down Bouncing Arrow (matching Homepage design) */}
                        <div className="mt-14 md:mt-20 text-center">
                            <button
                                onClick={handleOpenTimer}
                                className="text-brand-primary animate-bounce transition-transform duration-200 hover:scale-110 focus:outline-none cursor-pointer flex flex-col items-center gap-3 group"
                                aria-label="Scroll down to reveal timer"
                                title="Scroll down to reveal timer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-16 w-16 md:h-20 md:w-20 drop-shadow-[0_0_20px_rgba(229,56,59,0.7)]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* 2. TIMER VIEW: Seamlessly Replaces Title with Preserved Timer */
                    <motion.div
                        key="timer-screen"
                        initial={{ opacity: 0, scale: 0.94, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -30 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full max-w-5xl px-4 py-4 md:py-8 space-y-4 my-auto"
                    >
                        {/* Return to Title Indicator */}
                        <div className="text-center">
                            <button
                                onClick={handleCloseTimer}
                                className="text-gray-400 hover:text-white transition-all duration-200 inline-flex items-center justify-center p-2 rounded-full hover:bg-white/10 hover:scale-110 active:scale-95 cursor-pointer"
                                aria-label="Return to title"
                                title="Return to title"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                        </div>

                        {/* Next Nisathon Timer Vault Card (Top Layer) */}
                        <div className="relative z-20 pt-3 sm:pt-4">
                            {/* Timer Paused Status Pill mounted on top border of container (Overlay style) with synchronized blinking */}
                            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 inline-flex">
                                <div className="p-0.5 bg-gradient-to-b from-white/25 via-white/10 to-white/5 rounded-2xl border border-white/15 shadow-[0_4px_25px_rgba(0,0,0,0.85)] inline-flex animate-pause-blink">
                                    <div className="bg-[#121114] backdrop-blur-xl px-4 py-1.5 sm:px-5 sm:py-2 rounded-[0.9rem] inline-flex items-center gap-2.5 whitespace-nowrap">
                                        <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary fill-brand-primary shrink-0 animate-pause-blink" />
                                        <span className="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-gray-200">
                                            Timer Paused
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Vault Card Frame */}
                            <div className="rounded-[3rem] p-1 md:p-1.5 bg-gradient-to-b from-white/15 via-white/5 to-white/10 border border-white/10 shadow-2xl overflow-hidden">
                                <div className="bg-[#121114]/90 backdrop-blur-2xl rounded-[2.85rem] p-6 sm:p-10 md:p-14 text-center relative overflow-hidden">
                                    {/* Subtle Background Ambient Lighting */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] pointer-events-none rounded-full"></div>

                                    {/* Section Eyebrow */}
                                    <div className="relative z-10 flex flex-col items-center mb-8">
                                        <span className="text-gray-300 text-xs md:text-sm font-black uppercase tracking-[0.3em]">
                                            Next Nisathon Timer
                                        </span>
                                    </div>

                                    {/* Unified Countdown Display */}
                                    <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-4 md:gap-6 my-4 max-w-4xl mx-auto">
                                    {/* Hours Segment (Red) */}
                                    <div className="flex-1 flex flex-col items-center bg-black/55 border border-brand-primary/40 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-[0_0_25px_rgba(229,56,59,0.15)]">
                                        <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight text-brand-primary drop-shadow-[0_10px_30px_rgba(229,56,59,0.6)] tabular-nums animate-pause-blink">
                                            {loading && remainingMs === 0 ? "00" : hStr}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-brand-primary/80 mt-2 sm:mt-3">
                                            Hours
                                        </span>
                                    </div>

                                    {/* Colon Separator */}
                                    <div className="flex flex-col gap-2 sm:gap-3 justify-center pb-5 sm:pb-7 animate-pause-blink">
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-white/60"></div>
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-white/60"></div>
                                    </div>

                                    {/* Minutes Segment (White) */}
                                    <div className="flex-1 flex flex-col items-center bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-inner">
                                        <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)] tabular-nums animate-pause-blink">
                                            {loading && remainingMs === 0 ? "00" : mStr}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mt-2 sm:mt-3">
                                            Minutes
                                        </span>
                                    </div>

                                    {/* Colon Separator */}
                                    <div className="flex flex-col gap-2 sm:gap-3 justify-center pb-5 sm:pb-7 animate-pause-blink">
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-white/60"></div>
                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 rounded-full bg-white/60"></div>
                                    </div>

                                    {/* Seconds Segment (White) */}
                                    <div className="flex-1 flex flex-col items-center bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 backdrop-blur-md shadow-inner">
                                        <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.85)] tabular-nums animate-pause-blink">
                                            {loading && remainingMs === 0 ? "00" : sStr}
                                        </div>
                                        <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-gray-400 mt-2 sm:mt-3">
                                            Seconds
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Small Grey Chevron below Timer when Info Card is collapsed */}
                    {!showInfoCard && (
                        <div className="flex justify-center pt-2 pb-1 relative z-20">
                            <button
                                onClick={handleOpenInfoCard}
                                className="text-gray-400 hover:text-white transition-all duration-200 inline-flex items-center justify-center p-2 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
                                aria-label="Reveal currency and timer info"
                                title="Scroll down or click to view Nisaballs Currency"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 animate-bounce"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Nisaballs Currency & Timer Add Info Card (Directly attached, sliding out from behind the timer container) */}
                    <AnimatePresence initial={false}>
                        {showInfoCard && (
                            <motion.div
                                key="nisaballs-currency-card"
                                initial={{ opacity: 0, height: 0, y: -40 }}
                                animate={{ 
                                    opacity: 1, 
                                    height: "auto", 
                                    y: 0,
                                    transition: {
                                        height: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                                        opacity: { duration: 0.35, ease: "easeOut" },
                                        y: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                                    }
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    height: 0, 
                                    y: -40,
                                    transition: {
                                        height: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
                                        opacity: { duration: 0.2, ease: "easeIn" },
                                        y: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
                                    }
                                }}
                                className="relative z-10 -mt-6 sm:-mt-8 w-[92%] sm:w-[85%] md:w-[80%] max-w-3xl mx-auto rounded-b-[2.5rem] md:rounded-b-[3rem] rounded-t-none p-1 md:p-1.5 pt-0 md:pt-0 bg-gradient-to-b from-[#121114] via-[#121114] to-white/10 border-x border-b border-t-0 border-white/10 shadow-2xl overflow-hidden"
                            >
                                <div className="bg-[#121114] backdrop-blur-2xl rounded-b-[2.35rem] md:rounded-b-[2.85rem] rounded-t-none pt-8 sm:pt-10 pb-6 sm:pb-8 px-6 sm:px-8 text-center relative overflow-hidden space-y-5">
                                    {/* Subtle Background Ambient Lighting */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-primary/10 blur-[120px] pointer-events-none rounded-full"></div>

                                        {/* Section Eyebrow matching timer container style */}
                                        <div className="relative z-10 flex flex-col items-center gap-1.5 mb-4">
                                            <span className="text-gray-300 text-xs md:text-sm font-black uppercase tracking-[0.3em]">
                                                Nisaballs Currency
                                            </span>
                                        </div>

                                        {/* Currency Rates with segment card styling */}
                                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                            {/* $5 USD -> 1 NB */}
                                            <div className="bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 flex items-center justify-center gap-3 text-center backdrop-blur-md shadow-inner hover:border-emerald-500/40 transition-colors">
                                                <span className="text-emerald-400 font-bold text-sm md:text-base font-mono">$5 USD</span>
                                                <span className="text-gray-400 text-base font-bold">→</span>
                                                <span className="text-white font-extrabold text-sm md:text-base font-mono">1 NB</span>
                                            </div>

                                            {/* 1 Subs -> 1 NB */}
                                            <div className="bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 flex items-center justify-center gap-3 text-center backdrop-blur-md shadow-inner hover:border-purple-500/40 transition-colors">
                                                <span className="text-purple-400 font-bold text-sm md:text-base font-mono">1 Subs</span>
                                                <span className="text-gray-400 text-base font-bold">→</span>
                                                <span className="text-white font-extrabold text-sm md:text-base font-mono">1 NB</span>
                                            </div>

                                            {/* 500 Bits -> 1 NB */}
                                            <div className="bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 sm:p-5 flex items-center justify-center gap-3 text-center backdrop-blur-md shadow-inner hover:border-blue-500/40 transition-colors">
                                                <span className="text-blue-400 font-bold text-sm md:text-base font-mono">500 Bits</span>
                                                <span className="text-gray-400 text-base font-bold">→</span>
                                                <span className="text-white font-extrabold text-sm md:text-base font-mono">1 NB</span>
                                            </div>
                                        </div>

                                        {/* Timer Add Section with crimson accent styling */}
                                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/55 border border-brand-primary/35 rounded-2xl md:rounded-3xl px-6 py-5 backdrop-blur-md shadow-[0_0_25px_rgba(229,56,59,0.15)]">
                                            <div className="flex items-center gap-2.5">
                                                <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-brand-primary">
                                                    Timer Add
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white font-mono font-black text-base md:text-lg">
                                                <span>1 NB</span>
                                                <span className="text-brand-primary">=</span>
                                                <span className="text-brand-primary">5 Minutes</span>
                                            </div>
                                        </div>

                                        {/* Latest Contribution Section */}
                                        <div className="relative z-10 pt-2 text-left">
                                            <div className="flex items-center justify-center mb-3 px-1">
                                                <span className="text-gray-300 text-xs md:text-sm font-black uppercase tracking-[0.25em] flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                    Latest Contribution
                                                </span>
                                            </div>

                                            {latestContribution ? (
                                                <div
                                                    onClick={() => setShowHistoryModal(true)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowHistoryModal(true); }}
                                                    className="group cursor-pointer bg-black/55 hover:bg-black/75 border border-white/10 hover:border-brand-primary/40 rounded-2xl md:rounded-3xl p-4 sm:p-5 backdrop-blur-md transition-all duration-200 shadow-inner flex flex-col gap-3"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${getContributionTypeConfig(latestContribution.type).badgeClass}`}>
                                                                {getContributionTypeConfig(latestContribution.type).icon}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-white font-extrabold text-sm sm:text-base truncate group-hover:text-brand-primary transition-colors">
                                                                        {latestContribution.user}
                                                                    </span>
                                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getContributionTypeConfig(latestContribution.type).badgeClass}`}>
                                                                        {getContributionTypeConfig(latestContribution.type).label}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs sm:text-sm font-mono font-bold text-gray-300 flex items-center gap-2 mt-0.5">
                                                                    <span className="text-emerald-400">{latestContribution.amountDisplay}</span>
                                                                    {latestContribution.nisaballAmount > 0 && (
                                                                        <>
                                                                            <span className="text-gray-500">•</span>
                                                                            <span className="text-brand-primary font-bold">
                                                                                {formatAddedTime(latestContribution.nisaballAmount, stats.timePerNb || 5)}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="text-[11px] sm:text-xs text-gray-400 font-mono">
                                                                {formatEventDate(latestContribution.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {latestContribution.message && (
                                                        <p className="text-xs text-gray-300 italic border-l-2 border-brand-primary/40 pl-3 py-1 line-clamp-2 bg-white/[0.02] rounded-r-lg">
                                                            "{latestContribution.message}"
                                                        </p>
                                                    )}

                                                    <div className="flex items-center justify-center pt-1 border-t border-white/5 text-[11px] text-gray-400 font-medium group-hover:text-gray-300 transition-colors">
                                                        <span>Click to view contribution history</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-black/55 border border-white/10 rounded-2xl md:rounded-3xl p-4 text-center text-xs text-gray-500">
                                                    No contributions recorded since Sep 18 yet
                                                </div>
                                            )}
                                        </div>

                                        {/* Collapse chevron at bottom of card */}
                                        <div className="flex justify-center pt-1">
                                            <button
                                                onClick={handleCloseInfoCard}
                                                className="text-gray-500 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
                                                aria-label="Collapse currency card"
                                                title="Click or scroll up to collapse"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contribution History Modal */}
            <ContributionHistoryModal
                isOpen={showHistoryModal}
                onClose={() => setShowHistoryModal(false)}
                events={contributions}
                timePerNb={stats.timePerNb || 5}
            />
        </div>
    );
};

export default NisathonTimer;
