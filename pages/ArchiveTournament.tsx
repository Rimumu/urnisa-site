import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

interface Pokemon {
    id: number;
    name: string;
}

interface TournamentWinner {
    rank: number;
    username?: string;
    teamName?: string;
    player1?: string;
    player2?: string;
    score: string;
}

interface ArchivedSeason {
    seasonId: number;
    name: string;
    format: string;
    status: string;
    archivedAt: string;
    winners: TournamentWinner[];
    challongeUrl?: string;
}

// Tier colors matching the live Tournament page
const TIER_STYLES: Record<string, { bg: string; text: string; border: string }> = {
    UNRANKED: { bg: 'bg-gray-900', text: 'text-gray-500', border: 'border-gray-700' },
    DIRT: { bg: 'bg-amber-900/50', text: 'text-amber-600', border: 'border-amber-700' },
    CASUAL: { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-500' },
    OMEGA: { bg: 'bg-green-900/50', text: 'text-green-400', border: 'border-green-500' },
    BETA: { bg: 'bg-blue-900/50', text: 'text-blue-400', border: 'border-blue-500' },
    ALPHA: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-500' },
    LEGENDARY: { bg: 'bg-yellow-900/50', text: 'text-yellow-400', border: 'border-yellow-500' },
    MYTHIC: { bg: 'bg-pink-900/50', text: 'text-pink-400', border: 'border-pink-500' },
    ETERNAL: { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-red-500' },
};

const ArchiveTournament: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [seasons, setSeasons] = useState<ArchivedSeason[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

    useEffect(() => {
        // Load archived tournament seasons
        fetch(`${API_BASE_URL}/api/archive/tournament/seasons`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data && Array.isArray(data)) {
                    setSeasons(data);
                    if (data.length > 0) {
                        setSelectedSeasonId(data[0].seasonId);
                    }
                }
            })
            .catch(() => {
                setError('Failed to load archived tournaments');
            })
            .finally(() => setLoading(false));
    }, []);

    const selectedSeason = seasons.find(s => s.seasonId === selectedSeasonId) || seasons[0];
    const winners = selectedSeason?.winners || [];

    return (
        <div className="py-12 font-sans text-white relative">
            <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}</style>

            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-12 animate-in fade-in duration-700">

                {/* HEADER */}
                <div className="flex flex-col items-center justify-center space-y-10 mb-12">
                    <div className="text-center space-y-3">
                        <div className="inline-block bg-amber-500/20 px-4 py-1 rounded-full border border-amber-500/30 mb-2">
                            <span className="text-amber-400 font-black text-xs uppercase tracking-widest">ARCHIVED CONTENT</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
                            <span className="text-brand-primary">ARCHIVED TOURNAMENTS</span>
                        </h1>
                    </div>

                    {/* Season Selector */}
                    {seasons.length > 0 && (
                        <div className="flex items-center gap-4">
                            <label className="text-gray-400 font-bold text-sm uppercase">Season:</label>
                            <select
                                value={selectedSeasonId || ''}
                                onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
                                className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-white font-bold focus:border-brand-primary/50 outline-none"
                            >
                                {seasons.map(season => (
                                    <option key={season.seasonId} value={season.seasonId} className="bg-[#120507] text-white">
                                        {season.name} ({new Date(season.archivedAt).toLocaleDateString()})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* WINNERS DISPLAY */}
                <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl min-h-[850px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {selectedSeason?.name || 'Tournament'} Winners
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                {selectedSeason?.format} • Archived {selectedSeason?.archivedAt ? new Date(selectedSeason.archivedAt).toLocaleDateString() : ''}
                            </p>
                        </div>
                        {winners.length > 0 && (
                            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                                ARCHIVED
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-primary border-t-transparent"></div>
                                <p className="text-gray-400 mt-4">Loading archived tournament data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center text-red-400">
                            {error}
                        </div>
                    ) : winners.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-6xl opacity-50">🏆</div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">No Winners Found</h3>
                                <p className="text-gray-400 max-w-md mx-auto">No archived winner data available for this tournament season.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
                            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none rounded-3xl"></div>

                            {winners.length >= 1 && winners[0]?.player2 ? (
                                // DUOS WINNERS DISPLAY
                                <div className="flex flex-col md:flex-row items-end gap-4 md:gap-8 w-full max-w-6xl mx-auto px-4 justify-center">
                                    {/* 2ND PLACE - DUOS */}
                                    {winners.find(w => w.rank === 2) && (() => {
                                        const winner = winners.find(w => w.rank === 2)!;
                                        return (
                                            <div className="order-2 md:order-1 flex flex-col w-full md:w-1/3">
                                                <div className="bg-[#2a2a2a] border-t-4 border-slate-300 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-8">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-slate-300">2</div>
                                                    <div className="flex flex-col gap-3 mb-4 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                                                                    <span className="font-black text-slate-300 text-lg">2ND</span>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 text-xl">🥈</div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-xl font-black text-white italic tracking-tighter truncate">{winner.teamName || `${winner.player1} & ${winner.player2}`}</h3>
                                                                <p className="text-slate-400 font-mono font-bold text-sm">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-slate-400 font-bold">
                                                            <span className="text-yellow-400">{winner.player1}</span> & <span className="text-purple-400">{winner.player2}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-slate-400"></div></div>
                                                </div>
                                                <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                <div className="mt-4 flex justify-center gap-2">
                                                    <img src={`https://mc-heads.net/body/${winner.player1}/right`} className="h-40 md:h-56 object-contain filter drop-shadow-2xl grayscale-[0.3]" alt={winner.player1} />
                                                    {winner.player2 && (
                                                        <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-40 md:h-56 object-contain filter drop-shadow-2xl grayscale-[0.3]" alt={winner.player2} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* 1ST PLACE - DUOS */}
                                    {winners.find(w => w.rank === 1) && (() => {
                                        const winner = winners.find(w => w.rank === 1)!;
                                        return (
                                            <div className="order-1 md:order-2 flex flex-col w-full md:w-1/3 -mt-12 z-10">
                                                <div className="relative flex justify-center mb-6">
                                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                                    <div className="flex gap-2 relative">
                                                        <img src={`https://mc-heads.net/body/${winner.player1}/right`} className="h-56 md:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" alt={winner.player1} />
                                                        {winner.player2 && (
                                                            <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-56 md:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" alt={winner.player2} />
                                                        )}
                                                    </div>
                                                    <div className="absolute -top-16 animate-bounce">
                                                        <span className="text-6xl filter drop-shadow-lg">👑</span>
                                                    </div>
                                                </div>

                                                <div className="bg-[#2a2a2a] border-t-4 border-yellow-400 rounded-t-2xl p-6 relative group overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/30">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black text-yellow-400">1</div>

                                                    <div className="flex flex-col gap-2 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-full bg-yellow-900/50 flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] shrink-0">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
                                                                    <span className="font-black text-yellow-900 text-xl">1ST</span>
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter truncate leading-none">{winner.teamName || `${winner.player1} & ${winner.player2}`}</h3>
                                                                <p className="text-yellow-400 font-mono font-bold text-lg">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-bold mt-2">
                                                            <span className="text-yellow-400">{winner.player1}</span> <span className="text-white/50">&</span> {winner.player2 && <span className="text-purple-400">{winner.player2}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-3 bg-yellow-900/50 rounded-full overflow-hidden mt-4"><div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-200 animate-pulse"></div></div>
                                                </div>
                                                <div className="h-6 bg-[#1a1a1a] mx-4 rounded-b-xl opacity-50 border-t border-white/5"></div>
                                            </div>
                                        );
                                    })()}

                                    {/* 3RD PLACE - DUOS */}
                                    {winners.find(w => w.rank === 3) && (() => {
                                        const winner = winners.find(w => w.rank === 3)!;
                                        return (
                                            <div className="order-3 flex flex-col w-full md:w-1/3">
                                                <div className="bg-[#2a2a2a] border-t-4 border-orange-700/80 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-16">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-orange-700">3</div>
                                                    <div className="flex flex-col gap-3 mb-4 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-full bg-orange-900/30 flex items-center justify-center border-2 border-orange-700 shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                                                                    <span className="font-black text-orange-500 text-lg">3RD</span>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 text-xl">🥉</div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-xl font-black text-white italic tracking-tighter truncate">{winner.teamName || `${winner.player1} & ${winner.player2}`}</h3>
                                                                <p className="text-orange-500 font-mono font-bold text-sm">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-xs text-orange-300/70 font-bold">
                                                            <span className="text-yellow-400">{winner.player1}</span> & {winner.player2 && <span className="text-purple-400">{winner.player2}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2 bg-orange-900/30 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-orange-600"></div></div>
                                                </div>
                                                <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                <div className="mt-4 flex justify-center gap-2">
                                                    <img src={`https://mc-heads.net/body/${winner.player1}/right`} className="h-36 md:h-48 object-contain filter drop-shadow-2xl grayscale-[0.5]" alt={winner.player1} />
                                                    {winner.player2 && (
                                                        <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-36 md:h-48 object-contain filter drop-shadow-2xl grayscale-[0.5]" alt={winner.player2} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                // SINGLES WINNERS DISPLAY
                                <div className="flex flex-col md:flex-row items-end gap-4 md:gap-8 w-full max-w-6xl mx-auto px-4 justify-center">
                                    {/* 2ND PLACE - SINGLES */}
                                    {winners.find(w => w.rank === 2) && (() => {
                                        const winner = winners.find(w => w.rank === 2)!;
                                        return (
                                            <div className="flex flex-col w-full md:w-1/3">
                                                <div className="bg-[#2a2a2a] border-t-4 border-slate-300 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-8">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-slate-300">2</div>
                                                    <div className="flex flex-col gap-3 mb-4 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                                                                    <span className="font-black text-slate-300 text-lg">2ND</span>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 text-xl">🥈</div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-xl font-black text-white italic tracking-tighter truncate">{winner.username || winner.player1}</h3>
                                                                <p className="text-slate-400 font-mono font-bold text-sm">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-slate-400"></div></div>
                                                </div>
                                                <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                <div className="mt-4 flex justify-center">
                                                    <img src={`https://mc-heads.net/body/${winner.username || winner.player1}/right`} className="h-40 md:h-56 object-contain filter drop-shadow-2xl grayscale-[0.3]" alt={winner.username || winner.player1} />
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* 1ST PLACE - SINGLES */}
                                    {winners.find(w => w.rank === 1) && (() => {
                                        const winner = winners.find(w => w.rank === 1)!;
                                        return (
                                            <div className="flex flex-col w-full md:w-1/3 -mt-12 z-10">
                                                <div className="relative flex justify-center mb-6">
                                                    <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                                    <div className="relative">
                                                        <img src={`https://mc-heads.net/body/${winner.username || winner.player1}/right`} className="h-56 md:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" alt={winner.username || winner.player1} />
                                                    </div>
                                                    <div className="absolute -top-16 animate-bounce">
                                                        <span className="text-6xl filter drop-shadow-lg">👑</span>
                                                    </div>
                                                </div>

                                                <div className="bg-[#2a2a2a] border-t-4 border-yellow-400 rounded-t-2xl p-6 relative group overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/30">
                                                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black text-yellow-400">1</div>

                                                    <div className="flex flex-col gap-2 relative z-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-16 rounded-full bg-yellow-900/50 flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] shrink-0">
                                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
                                                                    <span className="font-black text-yellow-900 text-xl">1ST</span>
                                                                </div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter truncate leading-none">{winner.username || winner.player1}</h3>
                                                                <p className="text-yellow-400 font-mono font-bold text-lg">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-3 bg-yellow-900/50 rounded-full overflow-hidden mt-4"><div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-200 animate-pulse"></div></div>
                                                </div>
                                                <div className="h-6 bg-[#1a1a1a] mx-4 rounded-b-xl opacity-50 border-t border-white/5"></div>
                                            </div>
                                        );
                                    })()}

                                    {/* 3RD PLACE - SINGLES */}
                                    {winners.find(w => w.rank === 3) && (() => {
                                        const winner = winners.find(w => w.rank === 3)!;
                                        return (
                                            <div className="flex flex-col w-full md:w-1/3">
                                                <div className="bg-[#2a2a2a] border-t-4 border-orange-700/80 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-16">
                                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-orange-700">3</div>
                                                    <div className="flex flex-col gap-3 mb-4 relative z-10">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-14 h-14 rounded-full bg-orange-900/30 flex items-center justify-center border-2 border-orange-700 shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                                                                    <span className="font-black text-orange-500 text-lg">3RD</span>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 text-xl">🥉</div>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="text-xl font-black text-white italic tracking-tighter truncate">{winner.username || winner.player1}</h3>
                                                                <p className="text-orange-500 font-mono font-bold text-sm">{winner.score}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-full h-2 bg-orange-900/30 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-orange-600"></div></div>
                                                </div>
                                                <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                <div className="mt-4 flex justify-center">
                                                    <img src={`https://mc-heads.net/body/${winner.username || winner.player1}/right`} className="h-36 md:h-48 object-contain filter drop-shadow-2xl grayscale-[0.5]" alt={winner.username || winner.player1} />
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Bracket/Tournament Archive Link */}
                            {selectedSeason?.challongeUrl && (
                                <div className="mt-8 text-center">
                                    <a
                                        href={selectedSeason.challongeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-brand-primary/20 hover:bg-brand-primary/30 text-brand-primary font-bold px-6 py-3 rounded-xl transition-all border border-brand-primary/30"
                                    >
                                        <span>View Bracket Archive</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchiveTournament;