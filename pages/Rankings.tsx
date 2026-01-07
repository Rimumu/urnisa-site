import React, { useState, useEffect } from 'react';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://urnisa-backend-21ls.onrender.com';

// Tier colors and styles
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

interface PokemonInfo {
    species: string;
    nickname?: string;
    level: number;
    fainted: boolean;
}

interface MatchHistory {
    id: string;
    isWin: boolean;
    opponent: string;
    opponentUuid: string;
    eloChange: number;
    eloBefore: number;
    eloAfter: number;
    battleType: string;
    endReason: string;
    pokemonAlive: number;
    pokemonTotal: number;
    date: string;
}

interface MatchDetail {
    id: string;
    winner: {
        uuid: string;
        name: string;
        eloChange: number;
        eloBefore: number;
        eloAfter: number;
        pokemonAlive: number;
        pokemonTotal: number;
        kos: number;
        pokemon: PokemonInfo[];
    };
    loser: {
        uuid: string;
        name: string;
        eloChange: number;
        eloBefore: number;
        eloAfter: number;
        pokemonAlive: number;
        pokemonTotal: number;
        kos: number;
        pokemon: PokemonInfo[];
    };
    battleType: string;
    endReason: string;
    date: string;
}

interface MatchHistoryResponse {
    matches: MatchHistory[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Simple in-memory cache for Pokemon IDs to avoid spamming PokeAPI
const idCache = new Map<string, number>();

// Pokemon Sprite Component with Cobblemon -> PokeAPI fallback
const PokemonSprite: React.FC<{ pokemon: PokemonInfo }> = ({ pokemon }) => {
    const [imgSrc, setImgSrc] = useState<string>('');

    const getFormattedName = (name: string) => {
        return name.toLowerCase()
            .replace(/[.']/g, '')
            .replace(/♀/g, '-f')
            .replace(/♂/g, '-m')
            .replace(/\s+/g, '-');
    };

    useEffect(() => {
        const cobbleName = getFormattedName(pokemon.species);
        // Try Cobblemon tools first
        setImgSrc(`https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`);
    }, [pokemon.species]);

    const handleImageError = () => {
        const cobbleName = getFormattedName(pokemon.species);

        if (imgSrc.includes('cobblemon.tools')) {
            // Check cache first
            if (idCache.has(cobbleName)) {
                setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${idCache.get(cobbleName)}.png`);
                return;
            }

            // Fallback to PokeAPI Home (3D) - Requires ID
            fetch(`https://pokeapi.co/api/v2/pokemon/${cobbleName}`)
                .then(res => res.json())
                .then(data => {
                    if (data.id) {
                        idCache.set(cobbleName, data.id);
                        setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${data.id}.png`);
                    } else {
                        // Fallback to Pokemondb (Name based) if no ID found
                        setImgSrc(`https://img.pokemondb.net/sprites/home/normal/${cobbleName}.png`);
                    }
                })
                .catch(() => {
                    // Network error or not found -> fallback to Pokemondb
                    setImgSrc(`https://img.pokemondb.net/sprites/home/normal/${cobbleName}.png`);
                });
        } else if (imgSrc.includes('other/home')) {
            // If Home sprite fails (or wasn't found), try official artwork (also needs ID usually, but trying name just in case or pokemondb)
            // Actually, if we are here, it means we MIGHT have an ID or tried an ID.
            // Let's fallback to Pokemondb which is reliable with names
            setImgSrc(`https://img.pokemondb.net/sprites/home/normal/${cobbleName}.png`);
        } else if (imgSrc.includes('pokemondb')) {
            // Final fallback
            setImgSrc(`https://via.placeholder.com/64x64/1a1a1a/666666?text=${encodeURIComponent(pokemon.species.substring(0, 3))}`);
        }
    };

    return (
        <div
            className={`relative w-14 h-14 rounded-lg flex items-center justify-center transition-all ${pokemon.fainted
                ? 'bg-red-900/50 border-2 border-red-500/50 grayscale-[50%]'
                : 'bg-gray-800/50 border border-gray-700/50'
                }`}
            title={`${pokemon.nickname || pokemon.species} Lv.${pokemon.level}${pokemon.fainted ? ' (Fainted)' : ''}`}
        >
            <img
                src={imgSrc}
                alt={pokemon.species}
                className={`w-12 h-12 object-contain transition-all ${pokemon.fainted ? 'opacity-60' : ''}`}
                onError={handleImageError}
            />
            {pokemon.fainted && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-red-400 text-xl font-bold opacity-80">✕</span>
                </div>
            )}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] bg-black/80 px-1 rounded text-gray-400">
                {pokemon.level}
            </div>
        </div>
    );
};


const TierBadge: React.FC<{ tier: string; size?: 'sm' | 'md' | 'lg' }> = ({ tier, size = 'md' }) => {
    const styles = TIER_STYLES[tier] || TIER_STYLES.UNRANKED;
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
    // Mock match history for preview
    const MOCK_HISTORY: MatchHistory[] = [
        { id: 'match-1', isWin: true, opponent: 'ShadowNinja', opponentUuid: 'a2bf8d3c-8e39-4c7f-a9e8-1d3f4b7c6e9a', eloChange: 25, eloBefore: 2125, eloAfter: 2150, battleType: '1v1', endReason: 'normal', pokemonAlive: 2, pokemonTotal: 3, date: new Date(Date.now() - 3600000).toISOString() },
        { id: 'match-2', isWin: true, opponent: 'FireBreather', opponentUuid: 'b3c9e0d4-9f4a-5d8b-b0f9-2e4g5h8i7j0k', eloChange: 22, eloBefore: 2103, eloAfter: 2125, battleType: '1v1', endReason: 'normal', pokemonAlive: 1, pokemonTotal: 3, date: new Date(Date.now() - 7200000).toISOString() },
        { id: 'match-3', isWin: false, opponent: 'PikachuMaster', opponentUuid: 'd9fb0cc5-4dc7-47a4-b4bf-5c1a8f9c9668', eloChange: -18, eloBefore: 2121, eloAfter: 2103, battleType: '1v1', endReason: 'normal', pokemonAlive: 0, pokemonTotal: 3, date: new Date(Date.now() - 10800000).toISOString() },
        { id: 'match-4', isWin: true, opponent: 'IceQueen', opponentUuid: 'c4d0f1e5-0g5b-6e9c-c1g0-3f5h6i9j8k1l', eloChange: 20, eloBefore: 2101, eloAfter: 2121, battleType: '2v2', endReason: 'forfeit', pokemonAlive: 3, pokemonTotal: 4, date: new Date(Date.now() - 14400000).toISOString() },
        { id: 'match-5', isWin: true, opponent: 'ThunderBolt', opponentUuid: 'd5e1g2f6-1h6c-7f0d-d2h1-4g6i7j0k9l2m', eloChange: 15, eloBefore: 2086, eloAfter: 2101, battleType: '1v1', endReason: 'normal', pokemonAlive: 2, pokemonTotal: 3, date: new Date(Date.now() - 18000000).toISOString() },
    ];

    const [history, setHistory] = useState<MatchHistory[]>(MOCK_HISTORY);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const styles = TIER_STYLES[player.tier] || TIER_STYLES.UNRANKED;

    const onMatchSelect = (matchId: string) => {
        setSelectedMatchId(matchId);
    };

    useEffect(() => {
        // Try to fetch real history, fallback to mock
        fetch(`${API_BASE}/api/ranked/player/${player.uuid}/history?limit=10&page=${page}`)
            .then(res => res.json())
            .then((data: MatchHistoryResponse) => {
                if (data.matches && data.matches.length > 0) {
                    setHistory(data.matches);
                    setTotalPages(data.pagination?.totalPages || 1);
                }
            })
            .catch(() => console.log('Using mock match history'));
    }, [player.uuid, page]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1a0b0e;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.35);
                }
            `}</style>
            <div
                className={`bg-[#1a0b0e] border ${styles.border} rounded-3xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl ${styles.glow}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="max-h-[85vh] overflow-y-auto custom-scrollbar">
                    {/* Header */}
                    <div className={`p-6 ${styles.bg} border-b border-white/10`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://mc-heads.net/avatar/${player.uuid}/64`}
                                    alt={player.minecraftName}
                                    className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{player.minecraftName}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <TierBadge tier={player.tier} size="md" />
                                        <span className="text-gray-400">#{player.rank}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:text-brand-primary transition-all text-gray-400">✕</button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-6 grid grid-cols-3 gap-4">
                        <div className="text-center bg-white/5 rounded-xl p-3">
                            <div className={`text-3xl font-bold ${styles.text}`}>{player.elo}</div>
                            <div className="text-sm text-gray-400">ELO</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-xl p-3">
                            <div className="text-3xl font-bold text-green-400">{player.wins}</div>
                            <div className="text-sm text-gray-400">Wins</div>
                        </div>
                        <div className="text-center bg-white/5 rounded-xl p-3">
                            <div className="text-3xl font-bold text-red-400">{player.losses}</div>
                            <div className="text-sm text-gray-400">Losses</div>
                        </div>
                    </div>

                    <div className="px-6 pb-4 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                            <div className="text-xl font-bold text-yellow-400">{player.winRate}%</div>
                            <div className="text-xs text-gray-400">Win Rate</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                            <div className="text-xl font-bold text-orange-400">{player.bestWinStreak}</div>
                            <div className="text-xs text-gray-400">Best Streak</div>
                        </div>
                    </div>

                    {/* Match History */}
                    <div className="p-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-white">Match History</h3>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1 text-sm bg-white/10 rounded-lg hover:bg-brand-primary/20 hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ←
                                    </button>
                                    <span className="text-sm text-gray-400">{page}/{totalPages}</span>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1 text-sm bg-white/10 rounded-lg hover:bg-brand-primary/20 hover:text-brand-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                        {loading ? (
                            <div className="text-gray-400 text-center py-4">Loading...</div>
                        ) : history.length === 0 ? (
                            <div className="text-gray-400 text-center py-4">No matches yet</div>
                        ) : (
                            <div className="space-y-2">
                                {history.map(match => (
                                    <div
                                        key={match.id}
                                        onClick={() => onMatchSelect(match.id)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${match.isWin ? 'bg-green-900/30 hover:bg-green-900/50' : 'bg-red-900/30 hover:bg-red-900/50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-bold text-lg w-6 ${match.isWin ? 'text-green-400' : 'text-red-400'}`}>
                                                    {match.isWin ? 'W' : 'L'}
                                                </span>
                                                <div>
                                                    <span className="text-white font-medium">vs {match.opponent}</span>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs text-gray-400 bg-gray-700 px-2 py-0.5 rounded">
                                                            {match.battleType}
                                                        </span>
                                                        {match.endReason === 'forfeit' && (
                                                            <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded">
                                                                Forfeit
                                                            </span>
                                                        )}
                                                        <span className="text-xs text-gray-500">
                                                            {match.pokemonAlive}/{match.pokemonTotal} alive
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`font-bold ${match.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    {match.eloChange >= 0 ? '+' : ''}{match.eloChange}
                                                </span>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(match.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1 text-center">
                                            Click to view Pokemon details →
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Match Detail Modal */}
            {selectedMatchId && (
                <MatchDetailModal matchId={selectedMatchId} onClose={() => setSelectedMatchId(null)} />
            )}
        </div>
    );
};

// Match Detail Modal - Shows Pokemon for both players
const MatchDetailModal: React.FC<{ matchId: string; onClose: () => void }> = ({ matchId, onClose }) => {
    // Mock match detail for preview
    const MOCK_MATCH: MatchDetail = {
        id: matchId,
        winner: {
            uuid: 'c06f8906-4c8a-4911-9c29-ea1dbd1aab82',
            name: 'DragonSlayer99',
            eloChange: 25,
            eloBefore: 2125,
            eloAfter: 2150,
            pokemonAlive: 2,
            pokemonTotal: 3,
            kos: 3,
            pokemon: [
                { species: 'Charizard', nickname: 'Blaze', level: 50, fainted: false },
                { species: 'Dragonite', nickname: 'Stormy', level: 50, fainted: false },
                { species: 'Garchomp', nickname: 'Chompy', level: 50, fainted: true },
            ]
        },
        loser: {
            uuid: 'a2bf8d3c-8e39-4c7f-a9e8-1d3f4b7c6e9a',
            name: 'ShadowNinja',
            eloChange: -25,
            eloBefore: 1875,
            eloAfter: 1850,
            pokemonAlive: 0,
            pokemonTotal: 3,
            kos: 1,
            pokemon: [
                { species: 'Gengar', nickname: 'Shadow', level: 50, fainted: true },
                { species: 'Alakazam', nickname: 'Psycho', level: 50, fainted: true },
                { species: 'Greninja', nickname: 'Ninja', level: 50, fainted: true },
            ]
        },
        battleType: '1v1',
        endReason: 'normal',
        date: new Date(Date.now() - 3600000).toISOString()
    };

    const [match, setMatch] = useState<MatchDetail | null>(MOCK_MATCH);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Try to fetch real match data
        fetch(`${API_BASE}/api/ranked/match/${matchId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.winner) {
                    setMatch(data);
                }
            })
            .catch(() => console.log('Using mock match detail'));
    }, [matchId]);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[110] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="bg-[#1a0b0e] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar"
                onClick={e => e.stopPropagation()}
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-brand-primary border-t-transparent"></div>
                        <p className="text-gray-400 mt-4">Loading match details...</p>
                    </div>
                ) : !match ? (
                    <div className="p-12 text-center text-red-400">Failed to load match</div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-green-900/30 via-black/50 to-red-900/30 border-b border-white/10 flex items-center justify-between rounded-t-3xl">
                            <div>
                                <span className="text-xs text-gray-400">{match.battleType} • {new Date(match.date).toLocaleString()}</span>
                                <h3 className="text-lg font-bold text-white">Battle Result</h3>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/20 hover:text-brand-primary transition-all text-gray-400">✕</button>
                        </div>

                        {/* Winner Section */}
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://mc-heads.net/avatar/${match.winner.uuid}/40`}
                                        alt={match.winner.name}
                                        className="w-10 h-10 rounded-lg border border-green-500/50"
                                    />
                                    <div>
                                        <span className="text-green-400 text-xs font-bold uppercase">Winner</span>
                                        <h4 className="text-white font-bold">{match.winner.name}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-green-400 font-bold text-lg">+{match.winner.eloChange}</span>
                                    <div className="text-xs text-gray-500">{match.winner.eloBefore} → {match.winner.eloAfter}</div>
                                </div>
                            </div>
                            {match.winner.pokemon && match.winner.pokemon.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center bg-gray-800/30 rounded-lg p-3">
                                    {match.winner.pokemon.map((poke, i) => (
                                        <PokemonSprite key={i} pokemon={poke} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-3">
                                    Pokemon data not available
                                </div>
                            )}
                            <div className="text-center text-xs text-gray-500 mt-2">
                                {match.winner.pokemonAlive}/{match.winner.pokemonTotal} alive • {match.winner.kos} KOs
                            </div>
                        </div>

                        {/* VS Divider */}
                        <div className="flex items-center justify-center py-2 bg-gray-800/50">
                            <span className="text-2xl font-black text-gray-600">VS</span>
                        </div>

                        {/* Loser Section */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://mc-heads.net/avatar/${match.loser.uuid}/40`}
                                        alt={match.loser.name}
                                        className="w-10 h-10 rounded-lg border border-red-500/50 opacity-75"
                                    />
                                    <div>
                                        <span className="text-red-400 text-xs font-bold uppercase">Loser</span>
                                        <h4 className="text-white font-bold">{match.loser.name}</h4>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-red-400 font-bold text-lg">{match.loser.eloChange}</span>
                                    <div className="text-xs text-gray-500">{match.loser.eloBefore} → {match.loser.eloAfter}</div>
                                </div>
                            </div>
                            {match.loser.pokemon && match.loser.pokemon.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center bg-gray-800/30 rounded-lg p-3">
                                    {match.loser.pokemon.map((poke, i) => (
                                        <PokemonSprite key={i} pokemon={poke} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 text-sm py-3">
                                    Pokemon data not available
                                </div>
                            )}
                            <div className="text-center text-xs text-gray-500 mt-2">
                                {match.loser.pokemonAlive}/{match.loser.pokemonTotal} alive • {match.loser.kos} KOs
                            </div>
                        </div>

                        {/* Footer */}
                        {match.endReason === 'forfeit' && (
                            <div className="p-3 bg-yellow-900/20 border-t border-yellow-500/30 text-center">
                                <span className="text-yellow-400 text-sm font-medium">⚠️ Match ended by forfeit</span>
                            </div>
                        )}
                    </>
                )}
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
        <div className="min-h-screen py-8 font-sans text-white relative">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-2xl">
                        <span className="text-brand-primary">RANKED</span> LEADERBOARD
                    </h1>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-primary/5 blur-[60px] -z-10 rounded-full"></div>
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
                                        className={`px-6 py-4 grid grid-cols-12 gap-4 items-center cursor-pointer transition-all duration-200 hover:bg-white/5 border-b border-white/5 ${isTop3 ? `${styles.bg} ${styles.glow}` : ''
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
