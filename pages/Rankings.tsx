
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants';

// --- CONSTANTS & STYLES ---

const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string; icon: React.ReactNode }> = {
    DIRT: { 
        bg: 'bg-[#2a2522]', 
        text: 'text-[#a8a29e]', 
        border: 'border-[#44403c]', 
        glow: '', 
        icon: '🟤' 
    },
    CASUAL: { 
        bg: 'bg-gray-800', 
        text: 'text-gray-300', 
        border: 'border-gray-600', 
        glow: '', 
        icon: '⚪' 
    },
    OMEGA: { 
        bg: 'bg-emerald-950', 
        text: 'text-emerald-400', 
        border: 'border-emerald-600', 
        glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]', 
        icon: '🟢' 
    },
    BETA: { 
        bg: 'bg-blue-950', 
        text: 'text-blue-400', 
        border: 'border-blue-600', 
        glow: 'shadow-[0_0_10px_rgba(59,130,246,0.3)]', 
        icon: '🔵' 
    },
    ALPHA: { 
        bg: 'bg-purple-950', 
        text: 'text-purple-400', 
        border: 'border-purple-600', 
        glow: 'shadow-[0_0_15px_rgba(147,51,234,0.4)]', 
        icon: '🟣' 
    },
    LEGENDARY: { 
        bg: 'bg-yellow-950', 
        text: 'text-yellow-400', 
        border: 'border-yellow-600', 
        glow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]', 
        icon: '🟡' 
    },
    MYTHIC: { 
        bg: 'bg-pink-950', 
        text: 'text-pink-400', 
        border: 'border-pink-600', 
        glow: 'shadow-[0_0_25px_rgba(236,72,153,0.6)]', 
        icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-[1.1em] h-[1.1em] inline-block align-sub"><circle cx="12" cy="12" r="10" /></svg>
    },
    ETERNAL: { 
        bg: 'bg-[#450a0a]', 
        text: 'text-red-500', 
        border: 'border-red-600', 
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.7)] animate-pulse', 
        icon: '👹' 
    },
};

interface Player {
    rank: number;
    uuid: string;
    minecraftName: string;
    elo: number;
    wins: number;
    losses: number;
    tier: string;
    tierInfo: { name: string; color: string };
    winRate: number;
    winStreak: number;
    bestWinStreak: number;
    totalKOs?: number;
    totalDeaths?: number;
}

interface MatchHistory {
    id: string;
    isWin: boolean;
    opponent: string;
    opponentUuid: string;
    eloChange: number;
    battleType: string;
    endReason: string;
    date: string;
}

// --- COMPONENTS ---

const TierBadge: React.FC<{ tier: string; size?: 'sm' | 'md' | 'lg' }> = ({ tier, size = 'md' }) => {
    const styles = TIER_STYLES[tier] || TIER_STYLES.DIRT;
    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5',
        md: 'text-xs px-3 py-1',
        lg: 'text-sm px-4 py-1.5'
    };

    return (
        <span className={`
            ${styles.bg} ${styles.text} ${styles.border} ${styles.glow} 
            border rounded-full ${sizeClasses[size]} font-black uppercase tracking-wider flex items-center gap-1.5 w-fit
        `}>
            <span>{styles.icon}</span>
            <span>{tier}</span>
        </span>
    );
};

const PlayerModal: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
    const [history, setHistory] = useState<MatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const styles = TIER_STYLES[player.tier] || TIER_STYLES.DIRT;

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/ranked/player/${player.uuid}/history?limit=10`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [player.uuid]);

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div 
                className="bg-[#120507] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/20 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className={`absolute inset-0 blur-xl rounded-full opacity-50 ${styles.bg}`}></div>
                            <img 
                                src={`https://mc-heads.net/avatar/${player.uuid}/128`} 
                                className="w-24 h-24 rounded-[2rem] border-4 border-white/10 shadow-2xl relative z-10 bg-[#120507]" 
                                alt={player.minecraftName} 
                            />
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20">
                                <TierBadge tier={player.tier} size="sm" />
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 drop-shadow-lg">{player.minecraftName}</h2>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-gray-400 font-mono">
                                <span className="font-bold text-white">Rank #{player.rank}</span>
                                <span>•</span>
                                <span className="text-brand-primary font-bold">{player.elo} ELO</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="group p-3 rounded-full bg-white/5 hover:bg-red-600 hover:text-white text-gray-400 transition-all duration-300 border border-white/10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-black/20">
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Win Rate</div>
                        <div className={`text-2xl font-black ${player.winRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>{player.winRate}%</div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Record</div>
                        <div className="text-xl font-bold text-white">
                            <span className="text-green-400">{player.wins}W</span> <span className="text-gray-600">/</span> <span className="text-red-400">{player.losses}L</span>
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Streak</div>
                        <div className="text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                            {player.winStreak > 0 ? '🔥' : '❄️'} {player.winStreak}
                        </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/5">
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Best Streak</div>
                        <div className="text-2xl font-black text-yellow-500">{player.bestWinStreak}</div>
                    </div>
                </div>

                {/* Match History */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/40">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Recent Matches</h3>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 animate-pulse font-bold">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 italic">No matches recorded yet.</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map(match => (
                                <div 
                                    key={match.id} 
                                    className={`
                                        flex items-center justify-between p-3 rounded-xl border border-white/5 transition-all
                                        ${match.isWin ? 'bg-green-900/10 hover:bg-green-900/20' : 'bg-red-900/10 hover:bg-red-900/20'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                            w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs
                                            ${match.isWin ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}
                                        `}>
                                            {match.isWin ? 'W' : 'L'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">vs {match.opponent}</div>
                                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{match.battleType} • {new Date(match.date).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${match.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {match.eloChange > 0 ? '+' : ''}{match.eloChange}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Rankings: React.FC = () => {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [totalPlayers, setTotalPlayers] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/ranked/leaderboard?limit=100`);
                if (!response.ok) throw new Error("Failed to fetch");
                const data = await response.json();
                setPlayers(data.players || []);
                setTotalPlayers(data.total || 0);
            } catch (err) {
                setError('Failed to load leaderboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate Tier Stats
    const tierCounts = players.reduce((acc, p) => {
        acc[p.tier] = (acc[p.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen py-4 font-sans text-white relative">
            {/* Top Bar */}
            <div className="container mx-auto px-4 pt-4 pb-2">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* Hero Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-block bg-brand-primary/20 border border-brand-primary/30 text-brand-primary px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                            Season 1
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                            COMPETITIVE <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-red-400">RANKINGS</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                            Battle your way to the top of the Cobblemon league. Earn ELO, climb tiers, and become an Eternal legend.
                        </p>
                    </div>
                    
                    {/* Top 1 Display if available */}
                    {players.length > 0 && (
                        <div className="relative group cursor-pointer" onClick={() => setSelectedPlayer(players[0])}>
                            <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none"></div>
                            <div className="relative bg-[#1a0b0e] border-4 border-yellow-500 rounded-[2.5rem] p-6 flex flex-col items-center gap-4 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                                <div className="absolute -top-6 bg-yellow-500 text-black font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg border-2 border-white">
                                    Current #1
                                </div>
                                <img 
                                    src={`https://mc-heads.net/avatar/${players[0].uuid}/128`} 
                                    alt={players[0].minecraftName}
                                    className="w-32 h-32 rounded-2xl shadow-lg mt-2"
                                />
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{players[0].minecraftName}</div>
                                    <div className="text-yellow-400 font-mono font-bold">{players[0].elo} ELO</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">Tier Distribution</h3>
                            <div className="space-y-3">
                                {['ETERNAL', 'MYTHIC', 'LEGENDARY', 'ALPHA', 'BETA', 'OMEGA', 'CASUAL', 'DIRT'].map(tier => {
                                    const count = tierCounts[tier] || 0;
                                    const styles = TIER_STYLES[tier];
                                    const percentage = totalPlayers > 0 ? (count / totalPlayers) * 100 : 0;

                                    return (
                                        <div key={tier} className="group">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className={`text-xs font-bold flex items-center gap-2 ${styles.text}`}>
                                                    <span>{styles.icon}</span> {tier}
                                                </div>
                                                <div className="text-xs font-mono text-gray-500">{count}</div>
                                            </div>
                                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${styles.bg}`} 
                                                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                <span className="text-3xl font-black text-white">{totalPlayers}</span>
                                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Ranked Players</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Leaderboard */}
                    <div className="lg:col-span-3">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[800px]">
                            {/* Table Header */}
                            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-white/5 border-b border-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-5 md:col-span-4">Player</div>
                                <div className="col-span-3 md:col-span-2 text-center">Tier</div>
                                <div className="col-span-2 md:col-span-2 text-center">ELO</div>
                                <div className="col-span-3 md:col-span-2 text-center">W/L</div>
                                <div className="hidden md:block col-span-1 text-center">Win %</div>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="animate-spin text-4xl">⏳</div>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center justify-center h-full text-red-400 font-bold">
                                        {error}
                                    </div>
                                ) : players.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <div className="text-4xl mb-2">🌱</div>
                                        <div className="font-bold">No ranked players yet.</div>
                                        <div className="text-sm">Be the first to battle!</div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {players.map((player) => (
                                            <div 
                                                key={player.uuid}
                                                onClick={() => setSelectedPlayer(player)}
                                                className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-white/5 transition-colors cursor-pointer group"
                                            >
                                                <div className="col-span-1 text-center font-mono font-bold text-gray-500 group-hover:text-white">
                                                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                                                </div>
                                                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                                    <img src={`https://mc-heads.net/avatar/${player.uuid}/32`} className="w-8 h-8 rounded-md bg-black/20" alt="" />
                                                    <span className="font-bold text-white truncate text-sm">{player.minecraftName}</span>
                                                </div>
                                                <div className="col-span-3 md:col-span-2 flex justify-center">
                                                    <TierBadge tier={player.tier} size="sm" />
                                                </div>
                                                <div className="col-span-2 md:col-span-2 text-center font-mono font-bold text-brand-primary">
                                                    {player.elo}
                                                </div>
                                                <div className="col-span-3 md:col-span-2 text-center text-xs font-bold">
                                                    <span className="text-green-400">{player.wins}W</span> <span className="text-gray-600">/</span> <span className="text-red-400">{player.losses}L</span>
                                                </div>
                                                <div className="hidden md:block col-span-1 text-center text-xs font-mono text-gray-400">
                                                    {player.winRate}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedPlayer && (
                <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            )}
        </div>
    );
};

export default Rankings;
