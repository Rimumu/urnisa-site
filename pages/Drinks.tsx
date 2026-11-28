import React, { useState, useEffect } from 'react';
import { useDrinkingEvent, DrinkQueueItem } from '../hooks/useDrinkingEvent';
import DrinkSpinWheel from '../components/DrinkSpinWheel';
import { SOJU_BAR_KEYFRAMES, SojuBarShowcase } from '../components/SojuBarShowcase';
import { API_BASE_URL } from '../constants';

// --- CUSTOM VECTOR ICONS (NO EMOJIS) ---

const CocktailGlassIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 22h8" />
        <path d="M12 11v11" />
        <path d="m19 3-7 8-7-8Z" />
        <path d="M15 3l3-2" />
    </svg>
);

const WheelIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

const LedgerIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2.5" />
        <path d="M8 8h8" />
        <path d="M8 12h8" />
        <path d="M8 16h5" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const SlidersIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
);

const getItemVisual = (triggerType?: string) => {
    const normalized = (triggerType || '').toLowerCase();
    if (normalized.includes('sociabuzz')) {
        return {
            icon: <CocktailGlassIcon className="w-5 h-5" />,
            box: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30',
            label: 'text-brand-accent'
        };
    }
    if (normalized.includes('manual')) {
        return {
            icon: <CocktailGlassIcon className="w-5 h-5" />,
            box: 'text-rose-300 bg-rose-500/15 border-rose-500/30',
            label: 'text-brand-accent'
        };
    }
    return {
        icon: <CocktailGlassIcon className="w-5 h-5" />,
        box: 'text-brand-accent bg-brand-accent/15 border-brand-accent/30',
        label: 'text-brand-accent'
    };
};

const formatRelativeTime = (isoDate?: string) => {
    if (!isoDate) return 'Just now';
    const diff = Math.max(0, Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000));
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
};

const DonateModal: React.FC<{ onClose: () => void; gbpPerShot: number }> = ({
    onClose,
    gbpPerShot
}) => (
    <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
    >
        <div
            className="bg-[#1a0b0e] rounded-[2rem] border border-white/10 p-6 md:p-8 max-w-sm w-full relative shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={onClose}
                className="cursor-pointer absolute top-5 right-5 text-white/50 hover:text-brand-primary p-2 bg-black/40 rounded-full transition-colors"
                aria-label="Close order modal"
            >
                <CloseIcon />
            </button>

            <div className="text-center mb-7 mt-2">
                <div className="w-14 h-14 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent flex items-center justify-center mx-auto mb-4">
                    <CocktailGlassIcon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Order a Shot for Urnisa</h3>
                <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
                    <span className="font-mono font-bold text-brand-accent">£{gbpPerShot} GBP = 1 Shot</span>. Tips in USD, MYR, EUR &amp; other currencies auto-convert to GBP and round down.
                </p>
            </div>

            <div className="space-y-3">
                <a
                    href="https://streamelements.com/urnisa_/tip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-purple-900/35 to-blue-900/35 hover:from-purple-900/55 hover:to-blue-900/55 border border-purple-500/30 hover:border-blue-400/50 text-gray-300 hover:text-white p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer"
                >
                    <span className="text-purple-300/80 text-[10px] mb-1 uppercase tracking-widest font-bold">
                        Card / PayPal · Auto → £ GBP
                    </span>
                    <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                        StreamElements
                    </span>
                </a>
                <a
                    href="https://sociabuzz.com/urnisa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-emerald-900/35 to-teal-900/35 hover:from-emerald-900/55 hover:to-teal-900/55 border border-emerald-500/30 hover:border-emerald-400/50 text-gray-300 hover:text-white p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer"
                >
                    <span className="text-emerald-300/80 text-[10px] mb-1 uppercase tracking-widest font-bold">
                        SEA / Multi-Currency · Auto → £ GBP
                    </span>
                    <span className="font-bold text-lg tracking-wide bg-gradient-to-r from-emerald-300 to-teal-200 bg-clip-text text-transparent">
                        SociaBuzz
                    </span>
                </a>
            </div>
        </div>
    </div>
);

const LEDGER_ITEMS_PER_PAGE = 5;

const ServedLedgerModal: React.FC<{
    onClose: () => void;
    recentHistory: DrinkQueueItem[];
    completedShots: number;
}> = ({ onClose, recentHistory, completedShots }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(recentHistory.length / LEDGER_ITEMS_PER_PAGE));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * LEDGER_ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + LEDGER_ITEMS_PER_PAGE, recentHistory.length);
    const pageItems = recentHistory.slice(startIndex, endIndex);

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="served-ledger-modal-title"
        >
            <div
                className="bg-gradient-to-b from-[#1d080d] to-[#110407] rounded-[2rem] border border-brand-accent/30 p-6 md:p-8 max-w-2xl w-full max-h-[90vh] flex flex-col relative shadow-2xl cursor-default space-y-5"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer absolute top-5 right-5 text-white/50 hover:text-brand-primary p-2 bg-black/40 rounded-full transition-colors"
                    aria-label="Close Served Ledger"
                >
                    <CloseIcon />
                </button>

                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 pr-10">
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-brand-accent/15 border border-brand-accent/30 text-brand-accent flex items-center justify-center shrink-0">
                            <LedgerIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <h3 id="served-ledger-modal-title" className="text-xl font-black text-white tracking-tight">
                                Served Ledger
                            </h3>
                            <p className="text-xs text-gray-400">
                                Completed and skipped donation orders from tonight&apos;s session.
                            </p>
                        </div>
                    </div>
                    <span className="text-xs font-mono tabular-nums font-bold text-brand-accent bg-black/40 border border-brand-accent/25 px-3 py-1.5 rounded-xl shrink-0">
                        {completedShots} Shot{completedShots === 1 ? '' : 's'} Served
                    </span>
                </div>

                {pageItems.length > 0 ? (
                    <>
                        <div className="divide-y divide-white/10 overflow-y-auto pr-1 custom-scrollbar">
                            {pageItems.map((item) => {
                                const visual = getItemVisual(item.triggerType);
                                const statusText = [
                                    item.servedShots > 0 ? `${item.servedShots} served` : null,
                                    item.skippedShots > 0 ? `${item.skippedShots} skipped` : null
                                ].filter(Boolean).join(' · ') || 'Resolved';

                                return (
                                    <div
                                        key={item._id}
                                        className="flex items-start gap-4 py-3.5 first:pt-1 last:pb-1 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${visual.box}`}>
                                            {visual.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="font-bold text-white text-sm sm:text-base truncate">{item.user}</span>
                                                    {item.isTest && (
                                                        <span className="text-[10px] font-mono uppercase tracking-wider text-brand-accent">
                                                            · TEST
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-mono tabular-nums text-gray-400 shrink-0">
                                                    {formatRelativeTime(item.completedAt || item.createdAt)}
                                                </span>
                                            </div>

                                            <div className="mt-0.5 text-xs sm:text-sm flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                                <span className={`font-bold ${visual.label}`}>{item.drinkLabel}</span>
                                                <span className="text-white/25" aria-hidden="true">·</span>
                                                <span className="text-gray-300 text-xs">{item.amountDisplay}</span>
                                                <span className="text-white/25" aria-hidden="true">·</span>
                                                <span className={`text-xs font-mono tabular-nums font-semibold ${
                                                    item.status === 'skipped' ? 'text-gray-500' : 'text-gray-400'
                                                }`}>
                                                    {statusText}
                                                </span>
                                            </div>

                                            {item.message && (
                                                <p className="mt-1.5 text-xs text-gray-300/80 italic break-words">
                                                    “{item.message}”
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs font-mono tabular-nums text-gray-400">
                                Showing {startIndex + 1}–{endIndex} of {recentHistory.length}
                            </span>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={safePage <= 1}
                                    aria-label="Previous ledger page"
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 px-2.5 py-1.5 rounded-lg bg-black/45 border border-white/15 hover:border-brand-accent/45 text-xs font-bold text-gray-200 inline-flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 18l-6-6 6-6" />
                                    </svg>
                                    <span>Prev</span>
                                </button>

                                {Array.from({ length: totalPages }, (_, idx) => idx + 1)
                                    .filter((page) => {
                                        if (totalPages <= 5) return true;
                                        return page === 1 || page === totalPages || Math.abs(page - safePage) <= 1;
                                    })
                                    .map((page, index, arr) => {
                                        const prevPage = arr[index - 1];
                                        const showGap = prevPage !== undefined && page - prevPage > 1;
                                        return (
                                            <React.Fragment key={page}>
                                                {showGap && (
                                                    <span className="px-1 text-xs font-mono text-gray-500 select-none">…</span>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    aria-label={`Page ${page}`}
                                                    aria-current={page === safePage ? 'page' : undefined}
                                                    className={`cursor-pointer min-w-[30px] h-8 px-2 rounded-lg border text-xs font-mono tabular-nums font-bold transition-colors ${
                                                        page === safePage
                                                            ? 'bg-brand-primary border-brand-accent/60 text-white shadow-sm'
                                                            : 'bg-black/45 border-white/15 text-gray-300 hover:border-brand-accent/45 hover:text-white'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={safePage >= totalPages}
                                    aria-label="Next ledger page"
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 px-2.5 py-1.5 rounded-lg bg-black/45 border border-white/15 hover:border-brand-accent/45 text-xs font-bold text-gray-200 inline-flex items-center gap-1 transition-colors"
                                >
                                    <span>Next</span>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-12 text-center border-t border-dashed border-white/10">
                        <p className="text-sm font-bold text-gray-300">Ledger is empty</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Served shots will log here as the stream progresses.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminLoginModal: React.FC<{
    passwordInput: string;
    onPasswordChange: (val: string) => void;
    error: string;
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}> = ({ passwordInput, onPasswordChange, error, loading, onSubmit, onClose }) => (
    <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drinks-admin-login-title"
    >
        <div
            className="bg-gradient-to-b from-[#1d080d] to-[#110407] rounded-[2rem] border border-brand-accent/30 p-6 md:p-7 max-w-sm w-full relative shadow-2xl cursor-default space-y-5"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                type="button"
                onClick={onClose}
                className="cursor-pointer absolute top-5 right-5 text-white/50 hover:text-brand-primary p-2 bg-black/40 rounded-full transition-colors"
                aria-label="Close admin login"
            >
                <CloseIcon />
            </button>

            <div className="flex items-center gap-3 pr-8">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/15 border border-brand-accent/35 text-brand-accent flex items-center justify-center shrink-0">
                    <LockIcon className="w-5 h-5" />
                </div>
                <div>
                    <h3 id="drinks-admin-login-title" className="text-lg font-black text-white tracking-tight">
                        Admin Access
                    </h3>
                    <p className="text-xs text-gray-400">
                        Enter admin password to unlock live controls
                    </p>
                </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
                <input
                    type="password"
                    autoFocus
                    placeholder="Admin password"
                    value={passwordInput}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 focus:border-brand-accent rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                />
                {error && (
                    <p className="text-xs font-semibold text-red-400">{error}</p>
                )}
                <button
                    type="submit"
                    disabled={loading || !passwordInput}
                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 w-full py-3 px-5 rounded-xl bg-brand-primary hover:bg-red-700 text-white text-sm font-black tracking-wide transition-colors shadow-lg shadow-brand-primary/25"
                >
                    {loading ? 'Verifying...' : 'Unlock Bar Controls'}
                </button>
            </form>
        </div>
    </div>
);

const Drinks: React.FC = () => {
    const {
        settings,
        stats,
        pendingQueue,
        recentHistory,
        leaderboard,
        latestTrigger,
        activeSpin,
        spinHistory,
        loading,
        refetch
    } = useDrinkingEvent(3000);

    const [showDonatePopup, setShowDonatePopup] = useState(false);
    const [showLedgerPopup, setShowLedgerPopup] = useState(false);

    // Hidden Admin Mode State
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');
    const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [adminLoginError, setAdminLoginError] = useState('');
    const [adminLoginLoading, setAdminLoginLoading] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [adminBusyId, setAdminBusyId] = useState<string | null>(null);
    const [wheelSpinLoading, setWheelSpinLoading] = useState(false);
    const [adminStatus, setAdminStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showTransientAdminStatus = (type: 'success' | 'error', message: string) => {
        setAdminStatus({ type, message });
        window.setTimeout(() => {
            setAdminStatus((prev) => (prev?.message === message ? null : prev));
        }, 2600);
    };

    // Restore verified admin session on reload if cached
    useEffect(() => {
        const savedPw = sessionStorage.getItem('drinks_admin_pw');
        if (!savedPw) return;
        let cancelled = false;
        fetch(`${API_BASE_URL}/api/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: savedPw })
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!cancelled && res.ok && data.success) {
                    setAdminPassword(savedPw);
                    setIsAdminMode(true);
                } else if (!cancelled) {
                    sessionStorage.removeItem('drinks_admin_pw');
                }
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!showDonatePopup && !showLedgerPopup && !showAdminLoginModal) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setShowDonatePopup(false);
                setShowLedgerPopup(false);
                setShowAdminLoginModal(false);
            }
        };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [showDonatePopup, showLedgerPopup, showAdminLoginModal]);

    const handleSecretTriggerClick = () => {
        if (isAdminMode) {
            setShowAdminPanel((prev) => !prev);
        } else {
            setAdminLoginError('');
            setAdminPasswordInput('');
            setShowAdminLoginModal(true);
        }
    };

    const handleAdminLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminPasswordInput) return;
        setAdminLoginLoading(true);
        setAdminLoginError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: adminPasswordInput })
            });
            const data = await response.json().catch(() => ({}));
            if (response.ok && data.success) {
                sessionStorage.setItem('drinks_admin_pw', adminPasswordInput);
                setAdminPassword(adminPasswordInput);
                setIsAdminMode(true);
                setShowAdminPanel(true);
                setShowAdminLoginModal(false);
                setAdminPasswordInput('');
            } else {
                setAdminLoginError('Incorrect password.');
            }
        } catch {
            setAdminLoginError('Failed to connect to server.');
        } finally {
            setAdminLoginLoading(false);
        }
    };

    const handleExitAdminMode = () => {
        sessionStorage.removeItem('drinks_admin_pw');
        setIsAdminMode(false);
        setShowAdminPanel(false);
        setAdminPassword('');
        setAdminStatus(null);
    };

    const handleAdminQueueAction = async (itemId: string, action: 'complete_one' | 'complete_all' | 'skip_one' | 'skip_all', toastMsg: string) => {
        if (!adminPassword) return;
        setAdminBusyId(itemId);
        try {
            const res = await fetch(`${API_BASE_URL}/api/drinks/queue/${itemId}/action`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: adminPassword },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                showTransientAdminStatus('success', toastMsg);
                await refetch();
            } else {
                const data = await res.json().catch(() => ({}));
                showTransientAdminStatus('error', data.error || 'Action failed');
            }
        } catch {
            showTransientAdminStatus('error', 'Network error updating queue');
        } finally {
            setAdminBusyId(null);
        }
    };

    const handleAdminWheelSpin = async (freeSpin: boolean) => {
        if (!adminPassword) return;
        setWheelSpinLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/drinks/wheel/spin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: adminPassword },
                body: JSON.stringify({ freeSpin })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success && data.spin) {
                showTransientAdminStatus('success', freeSpin ? 'Free admin spin started!' : 'Wheel spinning live!');
                await refetch();
            } else {
                showTransientAdminStatus('error', data.error || 'Could not spin wheel');
            }
        } catch {
            showTransientAdminStatus('error', 'Network error spinning wheel');
        } finally {
            setWheelSpinLoading(false);
        }
    };

    const spotlightItem = pendingQueue[0] || latestTrigger || null;
    const spotlightMode = pendingQueue[0] ? 'Now Drinking' : latestTrigger ? 'Last Shot' : 'Bar Counter';

    const isWheelCurrentlySpinning = Boolean(
        activeSpin && Date.now() < new Date(activeSpin.revealAt).getTime()
    );

    const hasAdditionalSpinQueue = stats.pendingShotsCount > 0 || stats.shotsIntoCurrentSpin > 0;
    const isProgressBarFull = stats.spinReady && !hasAdditionalSpinQueue;

    const spinPercent = stats.shotsPerSpin > 0
        ? (isProgressBarFull ? 100 : Math.min(100, Math.round((stats.shotsIntoCurrentSpin / stats.shotsPerSpin) * 100)))
        : 0;

    const queuedPourPercent = stats.shotsPerSpin > 0 && !isProgressBarFull && !isWheelCurrentlySpinning
        ? Math.min(100 - spinPercent, Math.round((stats.pendingShotsCount / stats.shotsPerSpin) * 100))
        : 0;

    const MAX_GLASS_SHOTS = 25;
    const glassFillPercent = Math.min(100, Math.round((stats.completedShots / MAX_GLASS_SHOTS) * 100));
    const isGlassOverfilled = stats.completedShots > MAX_GLASS_SHOTS;
    const skippedShotsCount = stats.skippedShots ?? Array.from(
        new Map([...pendingQueue, ...recentHistory].map((item) => [item._id, item])).values()
    ).reduce((sum, item) => sum + (Number(item.skippedShots) || 0), 0);

    return (
        <div className="min-h-screen py-10 sm:py-12 relative font-sans">
            <style>{`
                ${SOJU_BAR_KEYFRAMES}
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes barPourWave {
                    0% { transform: translateX(-60%) skewX(-18deg); }
                    100% { transform: translateX(220%) skewX(-18deg); }
                }
                @keyframes gentleFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
                .bg-speakeasy-dots {
                    background-image: radial-gradient(rgba(247, 197, 72, 0.14) 1px, transparent 1px);
                    background-size: 28px 28px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.25); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(229, 56, 59, 0.5); border-radius: 10px; }
            `}</style>

            {/* Subtle Crimson Speakeasy Atmosphere */}
            <div className="absolute inset-0 bg-speakeasy-dots opacity-35 pointer-events-none z-0" />
            <div className="absolute top-0 right-10 w-[440px] h-[440px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-10 left-0 w-[440px] h-[440px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none" />

            {showDonatePopup && (
                <DonateModal
                    onClose={() => setShowDonatePopup(false)}
                    gbpPerShot={settings.gbpPerShot}
                />
            )}

            {showLedgerPopup && (
                <ServedLedgerModal
                    onClose={() => setShowLedgerPopup(false)}
                    recentHistory={recentHistory}
                    completedShots={stats.completedShots}
                />
            )}

            {showAdminLoginModal && (
                <AdminLoginModal
                    passwordInput={adminPasswordInput}
                    onPasswordChange={setAdminPasswordInput}
                    error={adminLoginError}
                    loading={adminLoginLoading}
                    onSubmit={handleAdminLoginSubmit}
                    onClose={() => setShowAdminLoginModal(false)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-10 animate-in fade-in duration-500">
                {/* 1. CENTERED NISATHON-STYLE HEADER */}
                <header className="text-center space-y-3">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl [text-wrap:balance]">
                        <span className="text-brand-primary">STEAK</span> HOUSE BAR
                    </h1>
                    <p className="text-sm sm:text-base text-gray-300/85 leading-relaxed max-w-2xl mx-auto">
                        {settings.eventSubtitle}
                    </p>
                </header>

                {/* 2. UNIFIED THE BAR CONTAINER (WITH BIG 25-SHOT GLASS, CHARACTER & RIGHT-EDGE MENU TAB) */}
                <section className="flex items-stretch">
                    <div className="flex-1 min-w-0 rounded-l-[2rem] bg-gradient-to-b from-[#23090f]/95 via-black/65 to-[#110407]/95 backdrop-blur-2xl border border-white/10 p-5 sm:p-8 flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 shadow-2xl relative overflow-hidden">
                        {/* Ambient crimson rail glow */}
                        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-primary/15 rounded-full blur-[95px] pointer-events-none" />
                        <div className="absolute -bottom-24 -left-16 w-64 h-64 bg-brand-accent/10 rounded-full blur-[90px] pointer-events-none" />

                        {/* Left Side: Bar Controls, Tally, Spotlight, Progress Bar & Order CTA */}
                        <div className="lg:col-span-7 flex flex-col justify-between gap-5 relative z-10">

                            {/* Header */}
                            <div className="relative z-10 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSecretTriggerClick}
                                        className="w-9 h-9 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-accent flex items-center justify-center shrink-0 cursor-pointer"
                                        aria-label="The Bar"
                                    >
                                        <CocktailGlassIcon className="w-5 h-5" />
                                    </button>
                                    <div className="flex items-center">
                                        <h2 className="text-2xl sm:text-3xl leading-none font-black text-white tracking-tight mr-0 pl-0 ml-0 mt-0 pt-0 pb-[4px] translate-y-[1px]">
                                            The Bar
                                        </h2>
                                    </div>
                                </div>
                                <span className="text-[18px] font-mono tabular-nums font-bold text-brand-accent shrink-0">
                                    £{settings.gbpPerShot} / {settings.shotLabel}
                                </span>
                            </div>

                            {/* 4 Bar Tally Stat Tiles */}
                            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div className="rounded-2xl bg-white/[0.035] border border-white/10 hover:border-white/20 p-3.5 sm:p-4 transition-all duration-300">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Shots Served</div>
                                    <div className="mt-1 text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                                        {loading ? '—' : stats.completedShots}
                                    </div>
                                </div>

                                <div className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 ${
                                    stats.pendingShotsCount > 0
                                        ? 'bg-brand-accent/[0.08] border-brand-accent/35 shadow-[0_0_24px_rgba(247,197,72,0.12)]'
                                        : 'bg-white/[0.035] border-white/10 hover:border-white/20'
                                }`}>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Up Next</div>
                                    <div className="mt-1 text-2xl sm:text-3xl font-black font-mono tabular-nums text-brand-accent">
                                        {loading ? '—' : stats.pendingShotsCount}
                                    </div>
                                </div>

                                <div className={`rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 ${
                                    stats.availableSpins > 0
                                        ? 'bg-brand-accent/[0.12] border-brand-accent/45 shadow-[0_0_26px_rgba(247,197,72,0.18)]'
                                        : 'bg-white/[0.035] border-white/10 hover:border-white/20'
                                }`}>
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-brand-accent/90">Spins Ready</div>
                                    <div className="mt-1 text-2xl sm:text-3xl font-black font-mono tabular-nums text-brand-accent">
                                        {loading ? '—' : stats.availableSpins}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white/[0.035] border border-white/10 hover:border-brand-primary/40 p-3.5 sm:p-4 transition-all duration-300">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Shots Skipped</div>
                                    <div className="mt-1 text-2xl sm:text-3xl font-black font-mono tabular-nums text-brand-primary">
                                        {loading ? '—' : skippedShotsCount}
                                    </div>
                                </div>
                            </div>

                            {/* Bar Counter Spotlight (Now Pouring / Last Poured / Bar Counter Clear) */}
                            <div className="relative z-10 rounded-2xl bg-gradient-to-r from-[#280b11]/85 via-black/55 to-black/45 border border-white/10 p-4 sm:p-5 space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-accent">
                                        {spotlightMode}
                                    </span>
                                    {spotlightItem && (
                                        <span className="text-xs font-mono tabular-nums text-gray-400">
                                            {formatRelativeTime(spotlightItem.createdAt)}
                                        </span>
                                    )}
                                </div>

                                {spotlightItem ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                                                getItemVisual(spotlightItem.triggerType).box
                                            }`}>
                                                <CocktailGlassIcon className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-lg sm:text-xl font-black text-white truncate">
                                                    {spotlightItem.user}
                                                </div>
                                                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs sm:text-sm">
                                                    <span className="font-extrabold text-brand-accent">
                                                        {spotlightItem.drinkLabel}
                                                    </span>
                                                    <span className="text-white/25" aria-hidden="true">·</span>
                                                    <span className="text-gray-300 text-xs">{spotlightItem.amountDisplay}</span>
                                                    {pendingQueue[0] && pendingQueue[0].totalShots > 1 && (
                                                        <>
                                                            <span className="text-white/25" aria-hidden="true">·</span>
                                                            <span className="text-xs font-mono tabular-nums text-gray-400">
                                                                {pendingQueue[0].remainingShots} of {pendingQueue[0].totalShots} left
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {spotlightItem.message && (
                                            <p className="text-xs text-gray-300/90 italic break-words">
                                                “{spotlightItem.message}”
                                            </p>
                                        )}

                                        {pendingQueue.length > 1 && (
                                            <div className="text-[11px] font-mono tabular-nums text-gray-400">
                                                +{pendingQueue.length - 1} more order{pendingQueue.length - 1 === 1 ? '' : 's'} waiting · {stats.pendingShotsCount} shot{stats.pendingShotsCount === 1 ? '' : 's'} pending
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-0.5">
                                        <div className="text-base font-bold text-white">Bar Counter Clear</div>
                                        <p className="text-xs text-gray-400">
                                            No shots in line right now. First tip (£{settings.gbpPerShot}+ GBP) takes the spotlight.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Streamlined Wheel Spin Pour Progress (Progress Bar Only) */}
                            <div className="relative z-10 rounded-2xl bg-black/55 border border-brand-accent/20 p-4 sm:p-5 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <WheelIcon className={`w-5 h-5 text-brand-accent ${isWheelCurrentlySpinning ? 'animate-spin' : ''}`} />
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                                            {stats.shotsPerSpin > 0 ? 'Wheel Spin Progress' : 'Wheel Pour Meter'}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-mono tabular-nums font-black ${
                                        stats.spinReady || isWheelCurrentlySpinning ? 'text-brand-accent' : 'text-gray-300'
                                    }`}>
                                        {isWheelCurrentlySpinning
                                            ? 'WHEEL IS SPINNING'
                                            : stats.shotsPerSpin > 0
                                                ? (stats.spinReady
                                                    ? (hasAdditionalSpinQueue
                                                        ? `${stats.shotsIntoCurrentSpin} / ${stats.shotsPerSpin} ${settings.shotLabel.toUpperCase()}S · ${stats.availableSpins} SPIN${stats.availableSpins === 1 ? '' : 'S'} READY`
                                                        : `${stats.availableSpins} SPIN${stats.availableSpins === 1 ? '' : 'S'} READY`)
                                                    : `${stats.shotsIntoCurrentSpin} / ${stats.shotsPerSpin} ${settings.shotLabel.toUpperCase()}S`)
                                                : 'MANUAL BAR SPINS'}
                                    </span>
                                </div>

                                <div className="relative h-6 w-full rounded-full bg-[#090305] border border-brand-accent/30 p-1 overflow-hidden shadow-inner">
                                    <div className="relative h-full w-full rounded-full overflow-hidden flex items-center bg-black/60">
                                        {stats.shotsPerSpin > 1 && (
                                            <div className="absolute inset-0 pointer-events-none z-20">
                                                {Array.from({ length: stats.shotsPerSpin - 1 }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className="absolute top-0 bottom-0 w-[1px] bg-white/[0.15]"
                                                        style={{ left: `${((i + 1) / stats.shotsPerSpin) * 100}%` }}
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div
                                            className={`h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                                                isProgressBarFull || isWheelCurrentlySpinning
                                                    ? 'bg-gradient-to-r from-brand-primary via-[#f26430] to-brand-accent shadow-[0_0_22px_rgba(247,197,72,0.75)]'
                                                    : 'bg-gradient-to-r from-[#7e1116] via-brand-primary to-[#f5b041] shadow-[0_0_16px_rgba(229,56,59,0.55)]'
                                            }`}
                                            style={{ width: `${isWheelCurrentlySpinning ? 100 : spinPercent}%` }}
                                        >
                                            <div className="drinks-motion absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[barPourWave_2s_infinite]" />
                                            <span className="drinks-motion absolute top-1/2 -translate-y-1/2 left-[16%] w-1 h-1 rounded-full bg-white/80 animate-pulse" />
                                            <span className="drinks-motion absolute top-1/2 -translate-y-1/2 left-[48%] w-1.5 h-1.5 rounded-full bg-brand-accent/90 animate-pulse" />
                                            <span className="drinks-motion absolute inset-y-0.5 right-0.5 w-2 rounded-full bg-white/85 blur-[1px]" />
                                        </div>

                                        {queuedPourPercent > 0 && (
                                            <div
                                                className="h-full bg-brand-accent/35 border-r-2 border-brand-accent/80 transition-all duration-700 animate-pulse"
                                                style={{ width: `${queuedPourPercent}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Eye-Catching Full-Width Order a Shot CTA */}
                            <div className="relative z-10 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowDonatePopup(true)}
                                    className="cursor-pointer group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#b91c1c] via-brand-primary to-[#d93829] hover:from-brand-primary hover:via-[#e5383b] hover:to-[#f25438] border border-brand-accent/45 py-4 sm:py-5 px-6 text-white shadow-[0_10px_32px_rgba(229,56,59,0.38)] hover:shadow-[0_14px_38px_rgba(229,56,59,0.55)] transition-all duration-200 flex items-center justify-between gap-4"
                                >
                                    <div className="drinks-motion absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                                    <div className="relative z-10 flex items-center gap-3.5">
                                        <span className="w-10 h-10 rounded-xl bg-black/30 border border-brand-accent/40 text-brand-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <CocktailGlassIcon className="w-5 h-5" />
                                        </span>
                                        <div className="flex items-center">
                                            <div className="text-xl sm:text-2xl font-black tracking-tight leading-none ml-0 pt-0 pb-[5px] translate-y-[1px]">
                                                Order a Shot
                                            </div>
                                        </div>
                                    </div>
                                    <span className="relative z-10 font-mono tabular-nums text-xs sm:text-sm font-black text-brand-accent bg-black/35 border border-brand-accent/30 px-3.5 py-1.5 rounded-xl whitespace-nowrap shrink-0">
                                        £{settings.gbpPerShot}+ GBP
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Right Side Inside The Bar: BIG Glass Balanced on Urnisa's Raised Feet */}
                        <div className="lg:col-span-5 relative z-10 flex flex-col items-center justify-end pt-4 border-none lg:pl-6 lg:pt-0 -mb-5 sm:-mb-8">
                            <SojuBarShowcase
                                glassFillPercent={glassFillPercent}
                                isPouring={stats.pendingShotsCount > 0}
                                isGlassOverfilled={isGlassOverfilled}
                            />
                        </div>
                    </div>

                    {/* Attached Right-Edge SERVED LEDGER Tab */}
                    <button
                        type="button"
                        onClick={() => setShowLedgerPopup(true)}
                        aria-label="Open Served Ledger"
                        className="cursor-pointer w-11 sm:w-12 shrink-0 rounded-r-[2rem] bg-gradient-to-b from-[#2c0b13] via-[#1b070c] to-[#120407] hover:from-[#3d0f1a] hover:to-[#24090e] border border-l-0 border-brand-accent/35 hover:border-brand-accent/70 flex flex-col items-center justify-center gap-3 px-1 py-6 text-brand-accent shadow-2xl transition-all duration-200 group"
                    >
                        <LedgerIcon className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                        <span
                            className="text-[11px] font-black uppercase tracking-[0.22em] text-white group-hover:text-brand-accent transition-colors whitespace-nowrap select-none"
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            SERVED LEDGER
                        </span>
                    </button>
                </section>

                {/* 3. FULL-WIDTH BIG DRINK WHEEL SHOWCASE */}
                <section className="rounded-[2rem] bg-gradient-to-b from-[#250b10]/90 to-[#120508]/95 backdrop-blur-2xl border border-brand-accent/25 p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-xl bg-brand-accent/15 border border-brand-accent/30 text-brand-accent flex items-center justify-center shrink-0">
                                <WheelIcon className="w-5 h-5" />
                            </span>
                            <div className="flex items-center">
                                <h2 className="text-2xl sm:text-3xl leading-none font-black text-white tracking-tight pb-[3px] translate-y-[1px]">Wheel of Balls</h2>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-10 items-center">
                        {/* BIG WHEEL */}
                        <div className="xl:col-span-7 flex justify-center py-2">
                            <DrinkSpinWheel
                                items={settings.wheelItems}
                                activeSpin={activeSpin}
                                isAdmin={false}
                                availableSpins={stats.availableSpins}
                                nextSpinIn={stats.nextSpinIn}
                                shotsPerSpin={settings.shotsPerSpin}
                                size="lg"
                            />
                        </div>

                        {/* RIGHT: SPIN HISTORY */}
                        <div className="xl:col-span-5 flex flex-col gap-6">
                            {/* Spin History List */}
                            <div className="space-y-3">
                                <div className="flex items-baseline justify-between gap-2">
                                    <h3 className="text-lg font-black text-white tracking-tight">
                                        Spin History ({spinHistory.length})
                                    </h3>
                                </div>

                                {spinHistory.length > 0 ? (
                                    <div className="divide-y divide-white/10 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                                        {spinHistory.map((spin) => (
                                            <div
                                                key={spin.spinId}
                                                className="flex items-center justify-between gap-3 py-3.5 first:pt-1 last:pb-1"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 rounded-lg bg-brand-accent/15 border border-brand-accent/30 text-brand-accent flex items-center justify-center shrink-0">
                                                        <WheelIcon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white text-sm truncate">
                                                            {spin.reward}
                                                        </div>
                                                        <div className="text-xs font-mono tabular-nums text-gray-400">
                                                            At {spin.shotCountAtSpin} shot{spin.shotCountAtSpin === 1 ? '' : 's'}
                                                            {spin.isFreeSpin ? ' · Bonus Spin' : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-mono tabular-nums text-gray-400 shrink-0">
                                                    {formatRelativeTime(spin.revealAt || spin.startedAt)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center border-t border-dashed border-white/10">
                                        <p className="text-sm font-bold text-gray-300">No spins recorded yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. STANDALONE TOP BARTENDERS */}
                <section className="rounded-[2rem] bg-black/45 backdrop-blur-2xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-5">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-white/10">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Top Bartenders</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Biggest tippers ranked by total shots &amp; GBP donated.
                                </p>
                            </div>
                            <span className="text-xs font-mono tabular-nums text-gray-400">
                                {leaderboard.length} Ranked
                            </span>
                        </div>

                        {leaderboard.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-white/10">
                                            <th className="py-3 pr-2 font-bold">Rank</th>
                                            <th className="py-3 px-2 font-bold">Bartender</th>
                                            <th className="py-3 px-2 font-bold text-right">Served</th>
                                            <th className="py-3 pl-2 font-bold text-right">Shots</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {leaderboard.map((entry) => {
                                            const rankBadge = entry.rank === 1
                                                ? 'bg-brand-accent/20 text-brand-accent border-brand-accent/50'
                                                : entry.rank === 2
                                                    ? 'bg-gray-300/15 text-gray-200 border-gray-300/35'
                                                    : entry.rank === 3
                                                        ? 'bg-amber-700/20 text-amber-500 border-amber-700/45'
                                                        : 'bg-white/5 text-gray-400 border-white/10';
                                            const gbpTotalLabel = typeof entry.totalGbp === 'number' && entry.totalGbp > 0
                                                ? `£${entry.totalGbp.toFixed(2)} GBP`
                                                : entry.lastTrigger;
                                            return (
                                                <tr key={entry.user} className="hover:bg-white/[0.03] transition-colors">
                                                    <td className="py-3.5 pr-2">
                                                        <span className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center font-mono tabular-nums text-xs font-black ${rankBadge}`}>
                                                            {entry.rank}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-2 max-w-[170px]">
                                                        <div className="font-bold text-white truncate">{entry.user}</div>
                                                        {gbpTotalLabel && (
                                                            <div className="text-xs font-mono tabular-nums text-gray-400 truncate">
                                                                {gbpTotalLabel}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-2 text-right font-mono tabular-nums text-gray-300">
                                                        {entry.servedShots}
                                                    </td>
                                                    <td className="py-3.5 pl-2 text-right font-mono tabular-nums font-black text-brand-accent">
                                                        {entry.totalShots}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-14 text-center border-t border-dashed border-white/10">
                                <p className="text-sm font-bold text-gray-300">No bartenders ranked yet</p>
                            </div>
                        )}
                </section>

            </div>

            {/* FLOATING BOTTOM-LEFT ADMIN MODE TOGGLE & CONCISE MINI PANEL */}
            {isAdminMode && (
                <>
                    {showAdminPanel && (
                        <div className="fixed bottom-20 left-5 z-[90] w-[340px] sm:w-[376px] max-w-[calc(100vw-2.5rem)] rounded-2xl bg-[#15060a]/95 backdrop-blur-2xl border border-brand-accent/35 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
                            {/* Panel Header */}
                            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-black/45 border-b border-white/10">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-brand-accent shrink-0">
                                        <ShieldCheckIcon className="w-4 h-4" />
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider text-white truncate">
                                        Bar Admin
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleExitAdminMode}
                                        title="Lock & Exit Admin Mode"
                                        aria-label="Lock and exit admin mode"
                                        className="cursor-pointer p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 transition-colors"
                                    >
                                        <LockIcon className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdminPanel(false)}
                                        title="Hide Admin Panel"
                                        aria-label="Hide admin panel"
                                        className="cursor-pointer p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <CloseIcon className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Status Feedback */}
                            {adminStatus && (
                                <div className={`px-4 py-1.5 text-[11px] font-semibold border-b border-white/10 ${
                                    adminStatus.type === 'success'
                                        ? 'bg-emerald-500/15 text-emerald-300'
                                        : 'bg-red-500/15 text-red-300'
                                }`}>
                                    {adminStatus.message}
                                </div>
                            )}

                            {/* Queued Shots List */}
                            <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                                {pendingQueue.length > 0 ? pendingQueue.map((item, idx) => {
                                    const isMulti = item.remainingShots > 1;
                                    const isBusy = adminBusyId === item._id;
                                    return (
                                        <div
                                            key={item._id}
                                            className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-2"
                                        >
                                            <div className="flex items-center justify-between gap-2 text-xs">
                                                <div className="min-w-0 truncate">
                                                    <span className="font-mono text-gray-500 mr-1.5">#{idx + 1}</span>
                                                    <span className="font-bold text-white">{item.user}</span>
                                                    <span className="text-brand-accent font-semibold"> · {item.drinkLabel}</span>
                                                </div>
                                                {item.totalShots > 1 && (
                                                    <span className="font-mono tabular-nums text-[11px] text-gray-300 shrink-0">
                                                        {item.remainingShots}/{item.totalShots}
                                                    </span>
                                                )}
                                            </div>
                                            {isMulti ? (
                                                <div className="grid grid-cols-2 gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'complete_one', `Marked 1 shot served for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/35 text-[11px] font-bold transition-colors"
                                                    >
                                                        Take 1 Shot
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'complete_all', `Marked all ${item.remainingShots} shots served for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-200 hover:text-black border border-emerald-500/25 text-[11px] font-bold transition-colors"
                                                    >
                                                        Done All ({item.remainingShots})
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'skip_one', `Skipped 1 shot for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/35 text-[11px] font-bold transition-colors"
                                                    >
                                                        Skip 1 Shot
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'skip_all', `Skipped all ${item.remainingShots} remaining shots for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/25 text-[11px] font-bold transition-colors"
                                                    >
                                                        Skip All ({item.remainingShots})
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'complete_one', `Marked 1 shot served for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/35 text-[11px] font-bold transition-colors"
                                                    >
                                                        Mark Served
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => handleAdminQueueAction(item._id, 'skip_all', `Skipped shot for ${item.user}`)}
                                                        className="cursor-pointer disabled:opacity-50 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/25 text-[11px] font-bold transition-colors ml-auto"
                                                    >
                                                        Skip
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                }) : (
                                    <div className="py-5 text-center text-xs text-gray-500">
                                        No queued shots right now.
                                    </div>
                                )}
                            </div>

                            {/* Wheel Spin Controls */}
                            <div className="p-3 pt-2.5 border-t border-white/10 bg-black/40 grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    disabled={wheelSpinLoading || isWheelCurrentlySpinning || stats.availableSpins <= 0}
                                    onClick={() => handleAdminWheelSpin(false)}
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 py-2 px-3 rounded-xl bg-brand-primary hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider transition-colors truncate"
                                >
                                    {wheelSpinLoading ? 'Spinning...' : `Spin Wheel (${stats.availableSpins})`}
                                </button>
                                <button
                                    type="button"
                                    disabled={wheelSpinLoading || isWheelCurrentlySpinning}
                                    onClick={() => handleAdminWheelSpin(true)}
                                    className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-45 py-2 px-3 rounded-xl bg-brand-accent/15 hover:bg-brand-accent text-brand-accent hover:text-black border border-brand-accent/35 text-[11px] font-black uppercase tracking-wider transition-colors truncate"
                                >
                                    Free Admin Spin
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowAdminPanel((prev) => !prev)}
                        aria-label={showAdminPanel ? 'Hide Bar Admin Panel' : 'Open Bar Admin Panel'}
                        title={showAdminPanel ? 'Hide Bar Admin Panel' : 'Open Bar Admin Panel'}
                        className={`fixed bottom-5 left-5 z-[90] w-12 h-12 rounded-2xl border flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.7)] transition-all duration-200 cursor-pointer ${
                            showAdminPanel
                                ? 'bg-brand-primary border-brand-accent text-white scale-105'
                                : 'bg-[#1a070c]/95 hover:bg-[#2a0b13] border-brand-accent/50 hover:border-brand-accent text-brand-accent hover:scale-105'
                        }`}
                    >
                        <SlidersIcon className="w-5 h-5" />
                        {stats.pendingShotsCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-brand-accent text-black text-[10px] font-black font-mono flex items-center justify-center shadow">
                                {stats.pendingShotsCount}
                            </span>
                        )}
                    </button>
                </>
            )}
        </div>
    );
};

export default Drinks;
