import React, { useState, useEffect } from 'react';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://urnisa-backend-21ls.onrender.com';

// Tier colors and styles
const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    DIRT: { bg: 'bg-stone-800', text: 'text-stone-400', border: 'border-stone-600', glow: '' },
    CASUAL: { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-500', glow: '' },
    OMEGA: { bg: 'bg-green-900/50', text: 'text-green-400', border: 'border-green-500', glow: 'shadow-green-500/20' },
    BETA: { bg: 'bg-blue-900/50', text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-blue-500/20' },
    ALPHA: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/20' },
    LEGENDARY: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-yellow-500/30' },
    MYTHIC: { bg: 'bg-pink-900/50', text: 'text-pink-400', border: 'border-pink-500', glow: 'shadow-pink-500/30' },
    ETERNAL: { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-red-500', glow: 'shadow-red-500/40 shadow-lg' },
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

const TierBadge: React.FC<{ tier: string; size?: 'sm' | 'md' | 'lg' }> = ({ tier, size = 'md' }) => {
    const styles = TIER_STYLES[tier] || TIER_STYLES.DIRT;
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5 font-bold'
    };

    return (
        <span className={`${styles.bg} ${styles.text} ${styles.border} ${styles.glow} border rounded-full ${sizeClasses[size]} font-semibold`}>
            {tier}
        </span>
    );
};

const PlayerCard: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => {
    const [history, setHistory] = useState<MatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const styles = TIER_STYLES[player.tier] || TIER_STYLES.DIRT;

    useEffect(() => {
        fetch(`${API_BASE}/api/ranked/player/${player.uuid}/history?limit=10`)
            .then(res => res.json())
            .then(data => {
                setHistory(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [player.uuid]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className={`bg-gray-900 border-2 ${styles.border} rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${styles.glow}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`p-6 ${styles.bg} border-b ${styles.border} rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={`https://mc-heads.net/avatar/${player.uuid}/64`}
                                alt={player.minecraftName}
                                className="w-16 h-16 rounded-lg border-2 border-white/20"
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-white">{player.minecraftName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <TierBadge tier={player.tier} size="md" />
                                    <span className="text-gray-400">#{player.rank}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="p-6 grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className={`text-3xl font-bold ${styles.text}`}>{player.elo}</div>
                        <div className="text-sm text-gray-400">ELO</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{player.wins}</div>
                        <div className="text-sm text-gray-400">Wins</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{player.losses}</div>
                        <div className="text-sm text-gray-400">Losses</div>
                    </div>
                </div>

                <div className="px-6 pb-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-yellow-400">{player.winRate}%</div>
                        <div className="text-xs text-gray-400">Win Rate</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-orange-400">{player.bestWinStreak}</div>
                        <div className="text-xs text-gray-400">Best Streak</div>
                    </div>
                </div>

                {/* Match History */}
                <div className="p-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-3">Recent Matches</h3>
                    {loading ? (
                        <div className="text-gray-400 text-center py-4">Loading...</div>
                    ) : history.length === 0 ? (
                        <div className="text-gray-400 text-center py-4">No matches yet</div>
                    ) : (
                        <div className="space-y-2">
                            {history.map(match => (
                                <div
                                    key={match.id}
                                    className={`flex items-center justify-between p-3 rounded-lg ${match.isWin ? 'bg-green-900/30' : 'bg-red-900/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${match.isWin ? 'text-green-400' : 'text-red-400'}`}>
                                            {match.isWin ? 'W' : 'L'}
                                        </span>
                                        <span className="text-white">vs {match.opponent}</span>
                                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                                            {match.battleType}
                                        </span>
                                    </div>
                                    <span className={match.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}>
                                        {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                                    </span>
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
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetch(`${API_BASE}/api/ranked/leaderboard?limit=100`)
            .then(res => res.json())
            .then(data => {
                setPlayers(data.players || []);
                setTotal(data.total || 0);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load leaderboard');
                setLoading(false);
            });
    }, []);

    // Tier distribution for sidebar
    const tierCounts = players.reduce((acc, p) => {
        acc[p.tier] = (acc[p.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative py-16 mb-8">
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-purple-900/10 to-transparent"></div>
                <div className="relative max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                        <span className="bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                            RANKED LEADERBOARD
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400">
                        Compete in Cobblemon battles to climb the ranks
                    </p>

                    {/* Tier Legend */}
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {['DIRT', 'CASUAL', 'OMEGA', 'BETA', 'ALPHA', 'LEGENDARY', 'MYTHIC', 'ETERNAL'].map(tier => (
                            <TierBadge key={tier} tier={tier} size="sm" />
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - Stats */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-white mb-4">Tier Distribution</h3>
                            <div className="space-y-3">
                                {['ETERNAL', 'MYTHIC', 'LEGENDARY', 'ALPHA', 'BETA', 'OMEGA', 'CASUAL', 'DIRT'].map(tier => {
                                    const count = tierCounts[tier] || 0;
                                    const styles = TIER_STYLES[tier];
                                    const percentage = total > 0 ? (count / total) * 100 : 0;

                                    return (
                                        <div key={tier} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`${styles.text} font-semibold text-sm`}>{tier}</span>
                                                <span className="text-gray-400 text-sm">{count}</span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${styles.bg} ${styles.border} border-r transition-all duration-500`}
                                                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-700">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white">{total}</div>
                                    <div className="text-sm text-gray-400">Ranked Players</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden">
                            {/* Table Header */}
                            <div className="bg-gray-900/80 px-6 py-4 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-400 border-b border-gray-700">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-4">Player</div>
                                <div className="col-span-2 text-center">Tier</div>
                                <div className="col-span-2 text-center">ELO</div>
                                <div className="col-span-2 text-center">W/L</div>
                                <div className="col-span-1 text-center">WR</div>
                            </div>

                            {/* Loading State */}
                            {loading && (
                                <div className="p-12 text-center">
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                                    <p className="text-gray-400 mt-4">Loading rankings...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="p-12 text-center">
                                    <p className="text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!loading && !error && players.length === 0 && (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400">No ranked players yet. Be the first to climb!</p>
                                </div>
                            )}

                            {/* Player Rows */}
                            {!loading && !error && players.map((player, index) => {
                                const styles = TIER_STYLES[player.tier] || TIER_STYLES.DIRT;
                                const isTop3 = player.rank <= 3;

                                return (
                                    <div
                                        key={player.uuid}
                                        onClick={() => setSelectedPlayer(player)}
                                        className={`px-6 py-4 grid grid-cols-12 gap-4 items-center cursor-pointer transition-all duration-200 hover:bg-gray-700/50 border-b border-gray-700/50 ${isTop3 ? `${styles.bg} ${styles.glow}` : ''
                                            }`}
                                    >
                                        {/* Rank */}
                                        <div className="col-span-1 text-center">
                                            {player.rank === 1 && <span className="text-2xl">🥇</span>}
                                            {player.rank === 2 && <span className="text-2xl">🥈</span>}
                                            {player.rank === 3 && <span className="text-2xl">🥉</span>}
                                            {player.rank > 3 && <span className="text-gray-400 font-mono">{player.rank}</span>}
                                        </div>

                                        {/* Player Info */}
                                        <div className="col-span-4 flex items-center gap-3">
                                            <img
                                                src={`https://mc-heads.net/avatar/${player.uuid}/32`}
                                                alt={player.minecraftName}
                                                className="w-8 h-8 rounded-md"
                                            />
                                            <span className="font-semibold text-white truncate">{player.minecraftName}</span>
                                        </div>

                                        {/* Tier */}
                                        <div className="col-span-2 flex justify-center">
                                            <TierBadge tier={player.tier} size="sm" />
                                        </div>

                                        {/* ELO */}
                                        <div className={`col-span-2 text-center font-bold ${styles.text}`}>
                                            {player.elo}
                                        </div>

                                        {/* W/L */}
                                        <div className="col-span-2 text-center">
                                            <span className="text-green-400">{player.wins}</span>
                                            <span className="text-gray-500">/</span>
                                            <span className="text-red-400">{player.losses}</span>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="col-span-1 text-center text-yellow-400 font-semibold">
                                            {player.winRate}%
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Detail Modal */}
            {selectedPlayer && (
                <PlayerCard player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
            )}
        </div>
    );
};

export default Rankings;
