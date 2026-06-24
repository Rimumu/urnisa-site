import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';
import { DEFAULT_NISATHON_GOALS } from '../constants';
import archiveData from '../data/nisathon-archive.json';

// --- DATA CONSTANTS ---
const NISABALL_ICON = "https://res.cloudinary.com/dsencimjn/image/upload/v1764173339/1341377045602766868_fbuvnf.webp";

const CURRENCY_RATES = [
    { label: "$5 USD", value: "1 Nisaball" },
    { label: "2 Subs", value: "1 Nisaball" },
    { label: "500 Bits", value: "1 Nisaball" },
];

const TIMER_CONVERSION = "1 Nisaball → 10 Minutes";

const TOP_REWARDS = [
    "1. VIP Status",
    "2. Art Together",
    "3. Maid Outfit Special Pics"
];

const PERSONALISED_REWARDS = [
    { cost: "1 NB", reward: "Name On Stream" },
    { cost: "5 NB", reward: "1 Spin The Wheel" },
    { cost: "10 NB", reward: "Small Sketch Drawing" },
];

// Types
interface ArchiveStats {
    archiveId: string;
    eventName: string;
    archivedAt: string;
    finalStats: {
        currentSubs: number;
        currentBits: number;
        currentDonations: number;
        totalNisaballs: number;
    };
}

// --- ICONS & HELPERS ---
const getEventIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'sub':
        case 'subscriber': return <span className="text-lg">⭐</span>;
        case 'gift': return <span className="text-lg">🎁</span>;
        case 'bits': 
        case 'cheer': return <span className="text-lg">💎</span>;
        case 'donation': 
        case 'tip': return <span className="text-lg">💸</span>;
        case 'follower': 
        case 'follow': return <span className="text-lg">💙</span>;
        default: return <span className="text-lg">✨</span>;
    }
};

const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'sub':
        case 'subscriber': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
        case 'gift': return 'text-pink-400 bg-pink-500/10 border-pink-500/20';
        case 'bits':
        case 'cheer': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
        case 'donation':
        case 'tip': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        case 'follower': 
        case 'follow': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

const FireIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.246-3.646-2.5-4.5A7 7 0 0 1 15 2c1.5 2 4 4 2.5 6.5C16.5 10.5 16 11.5 17 14c.5 1 2 2.5 2 4a5 5 0 0 1-9.5 2.5z"></path>
    </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9l6 6 6-6"/>
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-accent" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.719 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
    </svg>
);

// --- COMPONENTS ---
interface ProgressBarProps {
    label: string;
    current: number;
    max: number;
    color?: string;
    icon?: React.ReactNode;
    subLabel?: string;
    size?: 'sm' | 'lg';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    label, current, max, color = "bg-brand-primary", icon, subLabel, size = 'sm'
}) => {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const heightClass = size === 'lg' ? 'h-8' : 'h-3';

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2 relative z-10 px-1">
                <div className="flex items-center gap-2">
                    {icon && <span className="text-xl">{icon}</span>}
                    <span className={`font-bold text-white font-sans ${size === 'lg' ? 'text-xl' : 'text-sm'}`}>{label}</span>
                </div>
                <div className="text-right">
                    <span className={`font-mono font-bold ${color.replace('bg-', 'text-')} ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}>
                        {current.toLocaleString()} / {max.toLocaleString()}
                    </span>
                    {subLabel && <span className="ml-2 text-xs text-gray-400 font-sans hidden md:inline">{subLabel}</span>}
                </div>
            </div>
            <div className={`w-full ${heightClass} bg-black/50 rounded-full overflow-hidden border border-white/5 p-[2px]`}>
                <div
                    className={`h-full rounded-full ${color} relative transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
                </div>
            </div>
        </div>
    );
};

interface ContributionStatProps {
    label: string;
    rawCount: number;
    rawUnit?: string;
    nbAmount: number;
    totalNb: number;
    color: string;
    icon: string;
    rate: string;
}

const ContributionStat: React.FC<ContributionStatProps> = ({ label, rawCount, rawUnit, nbAmount, totalNb, color, icon, rate }) => {
    const contributionPercent = totalNb > 0 ? (nbAmount / totalNb) * 100 : 0;

    return (
        <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col h-full relative overflow-hidden group hover:bg-white/10 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-gray-400 font-sans font-bold uppercase tracking-wider text-[10px]">{label}</span>
                </div>
            </div>

            {/* Big Numbers */}
            <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-extrabold text-white font-sans">{rawCount.toLocaleString()}</span>
                {rawUnit && <span className="text-xs text-gray-500 font-bold uppercase">{rawUnit}</span>}
            </div>

            {/* Converted Value */}
            <div className="text-sm font-medium text-brand-accent mb-4 flex justify-between items-center bg-black/20 rounded-lg px-2 py-1">
                <span>{nbAmount.toFixed(1)} NB</span>
                <span className="text-[10px] text-gray-500 font-sans font-semibold">{contributionPercent.toFixed(0)}% Impact</span>
            </div>

            {/* Contribution Bar */}
            <div className="mt-auto">
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden flex p-[1px]">
                    <div
                        className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
                        style={{ width: `${contributionPercent}%` }}
                    ></div>
                </div>
                <div className="text-[10px] text-gray-500 text-right mt-1.5 font-sans font-medium">{rate}</div>
            </div>
        </div>
    );
};

interface NisaballWidgetProps {
    currentSubs: number;
    currentBits: number;
    currentDonations: number;
    totalNisaballs: number;
    nextGoal: number;
    nextGoalLabel: string;
    nbFromSubs: number;
    nbFromBits: number;
    nbFromDonations: number;
    className?: string;
    eventName?: string;
}

const NisaballWidget: React.FC<NisaballWidgetProps> = ({
    currentSubs, currentBits, currentDonations,
    totalNisaballs, nextGoal, nextGoalLabel,
    nbFromSubs, nbFromBits, nbFromDonations,
    className = "",
    eventName
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            className={`w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-10 cursor-pointer group transition-all duration-300 hover:border-brand-accent/30 hover:shadow-2xl relative overflow-hidden ${className}`}
        >
            {/* Main Header / Combined Progress */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold font-sans text-white tracking-tight flex items-center gap-4">
                        <img
                            src={NISABALL_ICON}
                            alt="Nisaball"
                            className="w-12 h-12 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(247,197,72,0.5)]"
                        />
                        <span>NISABALL <span className="text-brand-accent">GOAL</span></span>
                    </h2>

                    <div className="flex items-center gap-2 md:gap-3 ml-auto">
                        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            ARCHIVED
                        </span>
                        <div
                            onClick={() => setExpanded(!expanded)}
                            className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center transform transition-all duration-300 text-brand-accent group-hover:bg-brand-accent group-hover:text-brand-bg ${expanded ? 'rotate-180' : 'rotate-0'} cursor-pointer`}
                        >
                            <ChevronDownIcon className="w-6 h-6" />
                        </div>
                    </div>
                </div>



                <ProgressBar
                    label={nextGoalLabel}
                    current={totalNisaballs}
                    max={nextGoal}
                    color="bg-brand-accent"
                    size="lg"
                />
            </div>

            {/* Expanded Breakdown */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-0 transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[600px] opacity-100 pt-8 mt-6 border-t border-white/5' : 'max-h-0 opacity-0'}`}>
                <ContributionStat
                    label="Subscriptions"
                    rawCount={currentSubs}
                    nbAmount={nbFromSubs}
                    totalNb={totalNisaballs}
                    color="bg-purple-500"
                    icon="⭐"
                    rate="2 Subs = 1 NB"
                />
                <ContributionStat
                    label="Cheered Bits"
                    rawCount={currentBits}
                    nbAmount={nbFromBits}
                    totalNb={totalNisaballs}
                    color="bg-pink-500"
                    icon="💎"
                    rate="500 Bits = 1 NB"
                />
                <ContributionStat
                    label="Donations"
                    rawCount={currentDonations}
                    rawUnit="$"
                    nbAmount={nbFromDonations}
                    totalNb={totalNisaballs}
                    color="bg-emerald-500"
                    icon="💸"
                    rate="$5 USD = 1 NB"
                />
            </div>

            <div className={`absolute bottom-3 left-0 right-0 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest transition-opacity duration-300 ${expanded ? 'opacity-0' : 'opacity-60'}`}>
                Tap to view details
            </div>
        </div>
    );
};

interface MilestoneProps {
    item: {
        count: number;
        reward: string;
        secret?: boolean;
        status: 'completed' | 'active' | 'locked'
    }
}

const MilestoneItem: React.FC<MilestoneProps> = ({ item }) => {
    let statusClass = "";
    let icon;
    let textClass = "text-gray-300";

    if (item.status === 'completed') {
        statusClass = "bg-green-500/10 border-green-500/30";
        icon = <div className="text-green-400"><CheckIcon /></div>;
        textClass = "text-gray-400 line-through decoration-gray-600 decoration-2";
    } else if (item.status === 'active') {
        statusClass = "bg-brand-primary/10 border-brand-primary shadow-[0_0_20px_rgba(229,56,59,0.2)] scale-[1.02] z-10";
        icon = <div className="text-brand-accent animate-pulse"><FireIcon /></div>;
        textClass = "text-white font-bold";
    } else {
        statusClass = "bg-black/20 border-white/5 opacity-70";
        icon = <div className="text-gray-600"><LockIcon /></div>;
        textClass = "text-gray-500";
    }

    return (
        <div className={`
            relative flex items-center gap-5 p-4 rounded-3xl border transition-all duration-300
            ${statusClass}
        `}>
            {/* Status Bubble */}
            <div className={`
                flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center rounded-2xl
                bg-black/40 border border-white/5 font-sans
            `}>
                <span className={`text-lg font-extrabold leading-none ${item.status === 'active' ? 'text-brand-accent' : 'text-gray-400'}`}>
                    {item.count}
                </span>
                <span className="text-[9px] uppercase font-bold text-gray-600">Goal</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-between">
                <div className={`font-sans text-lg tracking-tight ${textClass}`}>
                    {item.secret && item.status !== 'completed'
                        ? <span className="text-brand-accent font-black tracking-wider uppercase text-sm italic">??? Top Secret ???</span>
                        : item.reward
                    }
                </div>
                <div className="pr-2 opacity-80">
                    {icon}
                </div>
            </div>
        </div>
    );
};

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string; onClick?: () => void }> = ({ title, children, className = "", onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-lg ${onClick ? 'cursor-pointer hover:border-brand-primary/30 hover:shadow-brand-primary/10 transition-all duration-300' : ''} ${className}`}
    >
        <div className="bg-white/5 border-b border-white/5 p-4 text-center">
            <h3 className="text-brand-accent font-sans font-extrabold tracking-widest text-xs uppercase">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

// --- MODALS ---

const ContributionHistorySection: React.FC<{ events: any[] }> = ({ events }) => {
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const itemsPerPage = 20;

    const filteredEvents = events.filter(e => {
        let textMatched = true;
        if (searchQuery) {
            textMatched = e.user?.toLowerCase().includes(searchQuery.toLowerCase());
        }

        if (!textMatched) return false;

        if (filter === 'all') return true;
        if (filter === 'sub' && (e.type.toLowerCase() === 'sub' || e.type.toLowerCase() === 'subscriber')) return true;
        if (filter === 'gift' && e.type.toLowerCase() === 'gift') return true;
        if (filter === 'bits' && (e.type.toLowerCase() === 'bits' || e.type.toLowerCase() === 'cheer')) return true;
        if (filter === 'donation' && (e.type.toLowerCase() === 'donation' || e.type.toLowerCase() === 'tip')) return true;
        if (filter === 'follow' && (e.type.toLowerCase() === 'follower' || e.type.toLowerCase() === 'follow')) return true;
        return false;
    });

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const currentEvents = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    const filterOptions = [
        { id: 'all', label: 'All Events' },
        { id: 'sub', label: 'Subs' },
        { id: 'gift', label: 'Gifts' },
        { id: 'bits', label: 'Bits' },
        { id: 'donation', label: 'Donations' },
        { id: 'follow', label: 'Follows' }
    ];

    return (
        <div className="w-full bg-[#1a0b0e]/80 rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative mt-16 backdrop-blur-md">
            <div className="p-6 border-b border-white/10 flex flex-col gap-4 bg-black/20 shrink-0">
                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Contribution History</h2>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            placeholder="Filter by name..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                            className="bg-black/50 text-white text-sm px-4 py-2 rounded-xl border border-white/10 outline-none focus:border-brand-primary w-full sm:w-64 placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => { setFilter(opt.id); setPage(1); }}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === opt.id ? 'bg-brand-primary text-white shadow-[0_0_15px_rgba(229,56,59,0.3)] border border-brand-primary/50' : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-[400px]">
                {currentEvents.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">No events found matching your filter.</div>
                ) : (
                    currentEvents.map((event) => (
                        <div key={event._id || Math.random().toString()} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getEventColor(event.type)}`}>
                                {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-white truncate text-lg">{event.user}</span>
                                    <span className="text-xs text-gray-500 font-mono">{formatTimeAgo(event.createdAt || new Date().toISOString())}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${getEventColor(event.type).split(' ')[0]} bg-black/30`}>
                                        {event.type}
                                    </span>
                                    <span className="text-sm font-bold text-gray-300">
                                        {event.amountDisplay}
                                    </span>
                                </div>
                                {event.message && (
                                    <p className="text-xs text-gray-400 mt-2 italic border-l-2 border-white/10 pl-2">"{event.message}"</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {totalPages > 1 && (
                <div className="p-4 border-t border-white/10 bg-black/20 flex justify-center items-center gap-4 shrink-0">
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-400 font-medium">Page {page} of {totalPages}</span>
                    <button 
                        disabled={page === totalPages} 
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold text-white transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

const TopContributorsModal: React.FC<{ onClose: () => void; contributors: any[] }> = ({ onClose, contributors }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a0b0e] w-full max-w-lg max-h-[80vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                             <span className="text-brand-accent">🏆</span> Top Contributors
                        </h2>
                        <p className="text-sm text-gray-400">The legends of the Nisathon!</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-brand-primary transition-colors">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {contributors.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No data available.</div>
                    ) : (
                        contributors.map((contributor) => {
                            let rankColor = "text-gray-400 border-gray-600/30";
                            if (contributor.rank === 1) rankColor = "text-brand-accent border-brand-accent/50 bg-brand-accent/10";
                            if (contributor.rank === 2) rankColor = "text-gray-300 border-gray-400/50 bg-gray-400/10";
                            if (contributor.rank === 3) rankColor = "text-amber-700 border-amber-700/50 bg-amber-700/10";

                            return (
                                <div key={contributor.rank} className={`flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors ${contributor.rank <= 3 ? 'border-l-4' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg border ${rankColor}`}>
                                        {contributor.rank}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-lg">{contributor.user}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-mono font-bold text-brand-primary text-xl">{contributor.totalNisaballs}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-500">Nisaballs</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

const ArchiveNisathon: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Archived stats - loaded once, no polling
    const [archivedStats, setArchivedStats] = useState<{
        currentSubs: number;
        currentBits: number;
        currentDonations: number;
        totalNisaballs: number;
    } | null>(archiveData.stats as any);

    const [eventName, setEventName] = useState('Nisathon Dashboard');

    const [showTopContributorsModal, setShowTopContributorsModal] = useState(false);

    // Leaderboard for archived event
    const [leaderboard, setLeaderboard] = useState<{rank: number; user: string; totalNisaballs: number}[]>(archiveData.leaderboard as any);

    // Recent events for archived event
    const [events, setEvents] = useState<{
        _id: string;
        user: string;
        type: string;
        amountDisplay: string;
        message: string;
        createdAt: string;
        nisaballAmount: number;
    }[]>(archiveData.events as any);

    useEffect(() => {
        // Data is now loaded synchronously from local json file
        setLoading(false);
    }, []);

    // Calculations
    const currentSubs = archivedStats?.currentSubs ?? 0;
    const currentBits = archivedStats?.currentBits ?? 0;
    const currentDonations = archivedStats?.currentDonations ?? 0;
    const totalNisaballs = archivedStats?.totalNisaballs ?? 0;

    const nbFromSubs = currentSubs * 0.5;
    const nbFromBits = currentBits * 0.002;
    const nbFromDonations = currentDonations * 0.2;

    // Processed milestones with completed/active states based on archived final totals
    let nextActiveFound = false;
    let nextGoal = 1000;
    let nextGoalLabel = "All Goals Completed!";

    const processedMilestones = DEFAULT_NISATHON_GOALS.map(m => {
        if (totalNisaballs >= m.count) {
            return { ...m, status: 'completed' as const };
        } else if (!nextActiveFound) {
            nextActiveFound = true;
            nextGoal = m.count;
            nextGoalLabel = m.secret ? "Top Secret Goal" : m.reward;
            return { ...m, status: 'active' as const };
        } else {
            return { ...m, status: 'locked' as const };
        }
    });

    return (
        <div className="min-h-screen py-12 relative font-sans">
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(229, 56, 59, 0.5); border-radius: 10px; }
            `}</style>

            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            {showTopContributorsModal && <TopContributorsModal onClose={() => setShowTopContributorsModal(false)} contributors={leaderboard} />}

            <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-12 animate-in fade-in duration-700">

                {/* 1. HEADER & ARCHIVED BADGE */}
                <div className="flex flex-col items-center justify-center space-y-10">
                    <div className="text-center space-y-3">
                        <div className="inline-block bg-amber-500/20 px-4 py-1 rounded-full border border-amber-500/30 mb-2">
                            <span className="text-amber-400 font-black text-xs uppercase tracking-widest">ARCHIVED CONTENT</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                            <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-red-400">UNCAPPED</span> BIRTHDAY NISATHON
                        </h1>
                        <div className="inline-block bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                             <h2 className="text-xl md:text-2xl font-bold text-brand-accent tracking-widest uppercase">{eventName}</h2>
                        </div>
                    </div>
                </div>

                <div className="space-y-16">
                    {/* 2. PROGRESS SECTION */}
                    <div className="w-full">
                        <NisaballWidget
                            currentSubs={currentSubs}
                            currentBits={currentBits}
                            currentDonations={currentDonations}
                            totalNisaballs={totalNisaballs}
                            nextGoal={nextGoal}
                            nextGoalLabel={nextGoalLabel}
                            nbFromSubs={nbFromSubs}
                            nbFromBits={nbFromBits}
                            nbFromDonations={nbFromDonations}
                            eventName={eventName}
                            className="h-full"
                        />
                    </div>

                    {/* 3. MAIN CONTENT SPLIT */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* LEFT: ROADMAP */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center gap-6 mb-6 px-2">
                                <h3 className="text-3xl font-black text-white tracking-tight">Goals Roadmap</h3>
                                <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-brand-primary to-transparent w-full opacity-30"></div>
                                </div>
                            </div>

                            <div className="space-y-4 relative pl-4 md:pl-0">
                                <div className="absolute left-[3.2rem] md:left-[3.25rem] top-8 bottom-8 w-[2px] bg-gradient-to-b from-brand-accent/50 via-white/10 to-transparent hidden md:block"></div>
                                {processedMilestones.map((milestone, idx) => (
                                    <MilestoneItem key={idx} item={milestone} />
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: SIDEBAR */}
                        <div className="space-y-6 lg:sticky lg:top-24">
                            
                            <InfoCard 
                                title="Top 3 Contributors" 
                                className="group hover:ring-2 hover:ring-brand-accent/30"
                                onClick={() => setShowTopContributorsModal(true)}
                            >
                                <div className="space-y-3 relative">
                                    {leaderboard.length === 0 ? (
                                        <div className="text-center text-sm text-gray-500 py-2">No contributor data</div>
                                    ) : (
                                        leaderboard.slice(0, 3).map((user) => {
                                            let rankColor = "bg-white/5 text-gray-400";
                                            if (user.rank === 1) { rankColor = "bg-brand-accent/20 text-brand-accent border-brand-accent/50"; }
                                            if (user.rank === 2) { rankColor = "bg-gray-400/20 text-gray-300 border-gray-400/50"; }
                                            if (user.rank === 3) { rankColor = "bg-amber-700/20 text-amber-600 border-amber-700/50"; }

                                            return (
                                                <div key={user.rank} className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black border border-transparent ${rankColor}`}>
                                                        {user.rank <= 3 ? <TrophyIcon /> : user.rank}
                                                    </div>
                                                    <div className="flex-1 min-w-0 font-bold text-white truncate">
                                                        {user.user}
                                                    </div>
                                                    <div className="text-xs font-mono font-bold text-brand-primary bg-black/30 px-2 py-1 rounded">
                                                        {user.totalNisaballs} NB
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div className="pt-2 text-center">
                                        <span className="text-xs font-bold text-gray-400 group-hover:text-brand-accent transition-colors flex items-center justify-center gap-1">
                                            View Top 10 <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                        </span>
                                    </div>
                                </div>
                            </InfoCard>

                            <InfoCard title="Nisaballs Currency">
                                <ul className="space-y-4 font-sans text-sm flex-1">
                                    {CURRENCY_RATES.map((rate, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-brand-accent font-bold">{rate.label}</span>
                                            <span className="text-gray-500 font-bold text-lg">→</span>
                                            <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">{rate.value}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 p-4 bg-brand-primary/10 rounded-2xl border border-brand-primary/20 text-center">
                                    <div className="text-brand-primary font-bold text-xs uppercase tracking-wider mb-2">Timer Add</div>
                                    <div className="text-white font-black text-lg">{TIMER_CONVERSION}</div>
                                </div>
                            </InfoCard>

                            <InfoCard title="Event Rewards">
                                <div className="mb-6">
                                    <h4 className="text-brand-primary text-xs font-bold uppercase tracking-wider mb-3 text-center opacity-80">Top 3 Supporters</h4>
                                    <div className="text-center mb-3 text-4xl drop-shadow-lg filter grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">🌹</div>
                                    <ul className="space-y-2 text-gray-200">
                                        {TOP_REWARDS.map((reward, idx) => (
                                            <li key={idx} className="bg-black/20 py-2 rounded-xl border border-white/5 font-medium text-sm text-center">{reward}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="h-px bg-white/10 my-6 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                </div>
                                <div>
                                    <h4 className="text-brand-primary text-xs font-bold uppercase tracking-wider mb-3 text-center opacity-80">Personalised Rewards</h4>
                                    <ul className="space-y-3 text-sm">
                                        {PERSONALISED_REWARDS.map((item, idx) => (
                                            <li key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                                                <span className="text-brand-accent font-bold font-mono bg-black/30 px-2 py-1 rounded-lg text-xs">{item.cost}</span>
                                                <span className="text-gray-300 font-medium text-xs text-right">{item.reward}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </InfoCard>

                        </div>
                    </div>
                    
                    <ContributionHistorySection events={events} />
                </div>
            </div>
        </div>
    );
};

export default ArchiveNisathon;