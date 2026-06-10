import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Tier colors and styles matching the live Rankings page
const TIER_STYLES: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    UNRANKED: { bg: 'bg-gray-900', text: 'text-gray-500', border: 'border-gray-700', glow: '' },
    DIRT: { bg: 'bg-amber-900/50', text: 'text-amber-600', border: 'border-amber-700', glow: '' },
    CASUAL: { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-500', glow: '' },
    OMEGA: { bg: 'bg-green-900/50', text: 'text-green-400', border: 'border-green-500', glow: 'shadow-green-500/20' },
    BETA: { bg: 'bg-blue-900/50', text: 'text-blue-400', border: 'border-blue-500', glow: 'shadow-blue-500/20' },
    ALPHA: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-500', glow: 'shadow-purple-500/20' },
    LEGENDARY: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', border: 'border-yellow-500', glow: 'shadow-yellow-500/30' },
    MYTHIC: { bg: 'bg-pink-900/50', text: 'text-pink-400', border: 'border-pink-500', glow: 'shadow-pink-500/30' },
    ETERNAL: { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-red-500', glow: 'shadow-red-500/40 shadow-lg' },
};

interface ArchivedPlayer {
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

interface ArchivedRankingsResponse {
    players: ArchivedPlayer[];
    archiveInfo: {
        seasonName: string;
        archivedAt: string;
        totalMatches: number;
    };
}

const ArchiveRankings: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [players, setPlayers] = useState<ArchivedPlayer[]>([]);
    const [archiveInfo, setArchiveInfo] = useState<ArchivedRankingsResponse['archiveInfo'] | null>(null);

    useEffect(() => {
        // Load archived rankings - no live polling
        fetch('https://urnisa-backend-3b3m.onrender.com/api/archive/rankings')
            .then(res => res.json())
            .then((data: ArchivedRankingsResponse) => {
                setPlayers(data.players || []);
                setArchiveInfo(data.archiveInfo || null);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load archived rankings');
                setLoading(false);
            });
    }, []);

    // Tier distribution for sidebar
    const tierCounts = players.reduce((acc, p) => {
        acc[p.tier] = (acc[p.tier] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const total = players.length;
    const archiveDate = archiveInfo?.archivedAt
        ? new Date(archiveInfo.archivedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'Unknown Date';

    return (
        <div className="min-h-screen py-8 font-sans text-white relative">
            <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}</style>

            {/* Background Decorations */}
            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Header Section */}
            <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative z-10">
                    <div className="inline-block bg-amber-500/20 px-4 py-1 rounded-full border border-amber-500/30 mb-3">
                        <span className="text-amber-400 font-black text-xs uppercase tracking-widest">ARCHIVED CONTENT</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
                        <span className="text-brand-primary">ARCHIVED</span> RANKINGS
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/5 blur-[60px] -z-10 rounded-full"></div>
                    {archiveInfo && (
                        <p className="text-gray-400 mt-2">
                            {archiveInfo.seasonName} • Archived {archiveDate}
                        </p>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - Stats */}
                    <div className="lg:col-span-1">
                        <div className="bg-black/30 backdrop-blur-lg rounded-[2rem] border border-white/10 p-6 sticky top-24 shadow-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center text-xl">📊</div>
                                <h3 className="text-lg font-bold text-white">Tier Distribution</h3>
                            </div>
                            <div className="space-y-3">
                                {['ETERNAL', 'MYTHIC', 'LEGENDARY', 'ALPHA', 'BETA', 'OMEGA', 'CASUAL', 'DIRT', 'UNRANKED'].map(tier => {
                                    const count = tierCounts[tier] || 0;
                                    const styles = TIER_STYLES[tier];
                                    const percentage = total > 0 ? (count / total) * 100 : 0;

                                    return (
                                        <div key={tier} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <span className={`${styles.text} font-semibold text-sm`}>{tier}</span>
                                                <span className="text-gray-400 text-sm">{count}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${styles.bg} transition-all duration-500`}
                                                    style={{ width: `${Math.max(percentage, count > 0 ? 5 : 0)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/10">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-brand-primary">{total}</div>
                                    <div className="text-sm text-gray-400">Ranked Players</div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <div className="text-center">
                                    <span className="inline-block bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                                        ARCHIVED
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Table */}
                    <div className="lg:col-span-3">
                        <div className="bg-black/30 backdrop-blur-lg rounded-[2rem] border border-white/10 overflow-hidden shadow-xl">
                            {/* Table Header */}
                            <div className="bg-black/40 px-6 py-4 grid grid-cols-12 gap-4 text-sm font-semibold text-gray-400 border-b border-white/10">
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
                                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
                                    <p className="text-gray-400 mt-4">Loading archived rankings...</p>
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
                                    <p className="text-gray-400">No archived ranked players found.</p>
                                </div>
                            )}

                            {/* Player Rows - Archived (no click interactions) */}
                            {!loading && !error && players.map((player) => {
                                const styles = TIER_STYLES[player.tier] || TIER_STYLES.DIRT;
                                const isTop3 = player.rank <= 3;

                                return (
                                    <div
                                        key={player.uuid}
                                        className={`px-6 py-4 grid grid-cols-12 gap-4 items-center border-b border-white/5 ${isTop3 ? `${styles.bg} ${styles.glow}` : ''}`}
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
                                                className="w-8 h-8 rounded-md grayscale opacity-70"
                                            />
                                            <span className="font-semibold text-white truncate">{player.minecraftName}</span>
                                        </div>

                                        {/* Tier */}
                                        <div className="col-span-2 flex justify-center">
                                            <span className={`${styles.bg} ${styles.text} ${styles.border} ${styles.glow} border rounded-full px-3 py-1 text-sm font-semibold`}>
                                                {player.tier}
                                            </span>
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
        </div>
    );
};

export default ArchiveRankings;