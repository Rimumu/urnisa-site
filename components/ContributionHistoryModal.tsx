import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { ContributorEvent } from '../hooks/useNisathonStats';

export const NISATHON_START_DATE = new Date('2026-09-18T00:00:00.000Z').getTime();

interface ContributionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: ContributorEvent[];
    timePerNb?: number;
}

export const formatAddedTime = (nisaballAmount: number, timePerNb: number = 5): string => {
    if (!nisaballAmount || nisaballAmount <= 0) return '';
    const totalMinutes = nisaballAmount * (timePerNb || 5);
    const totalSeconds = Math.round(totalMinutes * 60);

    if (totalSeconds < 60) {
        return `+${totalSeconds} ${totalSeconds === 1 ? 'Second' : 'Seconds'}`;
    }

    if (totalMinutes < 60) {
        if (Number.isInteger(totalMinutes)) {
            return `+${totalMinutes} ${totalMinutes === 1 ? 'Minute' : 'Minutes'}`;
        }
        const m = Math.floor(totalMinutes);
        const s = Math.round((totalMinutes % 1) * 60);
        if (s === 0) return `+${m} ${m === 1 ? 'Minute' : 'Minutes'}`;
        return `+${m}m ${s}s`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = Math.round(totalMinutes % 60);

    if (remainingMinutes === 0) {
        return `+${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
    }
    return `+${hours}h ${remainingMinutes}m`;
};

export const getContributionTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
        case 'sub':
        case 'subscriber':
            return {
                label: 'Subscriber',
                badgeClass: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
                dotClass: 'bg-purple-400',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                )
            };
        case 'gift':
            return {
                label: 'Gift Sub',
                badgeClass: 'text-pink-400 bg-pink-500/15 border-pink-500/30',
                dotClass: 'bg-pink-400',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect x="2" y="7" width="20" height="5" />
                        <line x1="12" y1="22" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                    </svg>
                )
            };
        case 'bits':
        case 'cheer':
            return {
                label: 'Bits',
                badgeClass: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
                dotClass: 'bg-cyan-400',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2.25c-.297 0-.58.14-.757.377L2.25 14.25l9 7.5a1.125 1.125 0 0 0 1.5 0l9-7.5-8.993-11.623a1.125 1.125 0 0 0-.757-.377ZM3.536 13.5l7.714-9.971v9.971H3.536Zm8.464-9.971 7.714 9.971H12V3.529Z" clipRule="evenodd" />
                    </svg>
                )
            };
        case 'donation':
        case 'tip':
            return {
                label: 'Donation',
                badgeClass: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
                dotClass: 'bg-emerald-400',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                )
            };
        default:
            return {
                label: type,
                badgeClass: 'text-gray-300 bg-white/10 border-white/20',
                dotClass: 'bg-gray-400',
                icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                )
            };
    }
};

export const formatEventDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

export const ContributionHistoryModal: React.FC<ContributionHistoryModalProps> = ({
    isOpen,
    onClose,
    events,
    timePerNb = 5
}) => {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Filter events strictly from Sep 18, 2026 onwards
    const filteredEvents = useMemo(() => {
        return (events || []).filter(e => {
            const time = new Date(e.createdAt).getTime();
            return !isNaN(time) && time >= NISATHON_START_DATE;
        });
    }, [events]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-xl cursor-pointer"
                    />

                    {/* Modal Window Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] md:rounded-[3rem] p-1 md:p-1.5 bg-gradient-to-b from-white/20 via-white/5 to-white/10 border border-white/15 shadow-[0_25px_80px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden"
                    >
                        <div className="bg-[#121114] backdrop-blur-2xl rounded-[2.35rem] md:rounded-[2.85rem] flex flex-col h-full overflow-hidden relative">
                            {/* Ambient Crimson Glow behind top header */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-brand-primary/15 blur-[100px] pointer-events-none rounded-full" />

                            {/* Header */}
                            <div className="relative z-10 p-5 sm:p-7 pb-4 sm:pb-5 border-b border-white/10 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                                        Contribution History
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                                        Contributions for the next Nisathon!
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 hover:text-white transition-all text-gray-400 hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                                    aria-label="Close contribution history"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Scrollable Events List */}
                            <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-7 space-y-3 custom-scrollbar">
                                {filteredEvents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 mb-3">
                                            <Sparkles className="w-6 h-6 text-brand-primary/60" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-300">No contributions found</p>
                                        <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                            Contributions for the next Nisathon will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    filteredEvents.map((event) => {
                                        const config = getContributionTypeConfig(event.type);
                                        const addedTime = formatAddedTime(event.nisaballAmount, timePerNb);
                                        return (
                                            <div
                                                key={event._id}
                                                className="bg-black/50 border border-white/10 hover:border-white/20 rounded-2xl p-4 sm:p-5 transition-all duration-200 backdrop-blur-sm flex flex-col gap-2.5 hover:shadow-lg"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    {/* User & Icon Info */}
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${config.badgeClass}`}>
                                                            {config.icon}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-white text-sm sm:text-base truncate">
                                                                    {event.user}
                                                                </span>
                                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                                                                    {config.label}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs sm:text-sm font-mono font-bold text-gray-300 flex items-center gap-2 mt-0.5">
                                                                <span className="text-emerald-400">{event.amountDisplay}</span>
                                                                {addedTime && (
                                                                    <>
                                                                        <span className="text-gray-500">•</span>
                                                                        <span className="text-brand-primary font-bold">{addedTime}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Timestamp (Month and Date only) */}
                                                    <div className="text-right shrink-0">
                                                        <span className="text-[10px] sm:text-xs text-gray-400 font-mono">
                                                            {formatEventDate(event.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Contributor Message */}
                                                {event.message && (
                                                    <p className="text-xs text-gray-300 italic border-l-2 border-brand-primary/40 pl-3 py-1 bg-white/[0.02] rounded-r-lg">
                                                        "{event.message}"
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
