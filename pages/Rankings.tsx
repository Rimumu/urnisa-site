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
// Cache for image validity to avoid repeated backend checks
const clientImageValidationCache = new Map<string, boolean>();

// Pokemon Type Colors for Tooltip
const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
    normal: { bg: 'bg-gray-400', text: 'text-gray-900' },
    fire: { bg: 'bg-orange-500', text: 'text-white' },
    water: { bg: 'bg-blue-500', text: 'text-white' },
    electric: { bg: 'bg-yellow-400', text: 'text-gray-900' },
    grass: { bg: 'bg-green-500', text: 'text-white' },
    ice: { bg: 'bg-cyan-300', text: 'text-gray-900' },
    fighting: { bg: 'bg-red-700', text: 'text-white' },
    poison: { bg: 'bg-purple-500', text: 'text-white' },
    ground: { bg: 'bg-amber-600', text: 'text-white' },
    flying: { bg: 'bg-indigo-300', text: 'text-gray-900' },
    psychic: { bg: 'bg-pink-500', text: 'text-white' },
    bug: { bg: 'bg-lime-500', text: 'text-gray-900' },
    rock: { bg: 'bg-stone-500', text: 'text-white' },
    ghost: { bg: 'bg-purple-800', text: 'text-white' },
    dragon: { bg: 'bg-indigo-600', text: 'text-white' },
    dark: { bg: 'bg-gray-800', text: 'text-white' },
    steel: { bg: 'bg-slate-400', text: 'text-gray-900' },
    fairy: { bg: 'bg-pink-300', text: 'text-gray-900' },
};

// Pokemon Sprite Component with Cobblemon -> PokeAPI fallback
const PokemonSprite: React.FC<{ pokemon: PokemonInfo }> = ({ pokemon }) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [types, setTypes] = useState<string[]>([]);

    const getFormattedName = (name: string) => {
        return name.toLowerCase()
            .replace(/[.']/g, '')
            .replace(/♀/g, '-f')
            .replace(/♂/g, '-m')
            .replace(/\s+/g, '-');
    };

    // Helper to get fallback URL (Home high-res)
    const getFallbackUrl = async (cobbleName: string): Promise<string> => {
        // Check ID cache first
        if (idCache.has(cobbleName)) {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${idCache.get(cobbleName)}.png`;
        }

        // Fetch ID from PokeAPI
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cobbleName}`);
            const data = await res.json();
            if (data.id) {
                idCache.set(cobbleName, data.id);
                // Also cache types while we have them
                if (data.types) {
                    setTypes(data.types.map((t: { type: { name: string } }) => t.type.name));
                }
                return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${data.id}.png`;
            }
        } catch (e) {
            console.warn(`Failed to fetch ID for ${cobbleName}`);
        }

        // Final fallback to name-based Home sprite (likely to fail if needs ID, but acts as safety) 
        // OR Pokemondb which supports names
        return `https://img.pokemondb.net/sprites/home/normal/${cobbleName}.png`;
    };

    // Fetch types on mount
    useEffect(() => {
        const fetchTypes = async () => {
            const cobbleName = getFormattedName(pokemon.species);
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${cobbleName}`);
                const data = await res.json();
                if (data.types) {
                    setTypes(data.types.map((t: { type: { name: string } }) => t.type.name));
                }
            } catch (e) {
                // Silently fail - types are optional
            }
        };
        fetchTypes();
    }, [pokemon.species]);

    useEffect(() => {
        let mounted = true;

        const verifyImage = async () => {
            setIsLoading(true);
            const cobbleName = getFormattedName(pokemon.species);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;

            // 1. Check Validation Cache
            if (clientImageValidationCache.has(primaryUrl)) {
                const isValid = clientImageValidationCache.get(primaryUrl);
                if (isValid) {
                    if (mounted) setImgSrc(primaryUrl);
                } else {
                    const fallback = await getFallbackUrl(cobbleName);
                    if (mounted) setImgSrc(fallback);
                }
                if (mounted) setIsLoading(false);
                return;
            }

            // 2. Validate via Backend
            try {
                // Using API_BASE defined in file
                const response = await fetch(`${API_BASE}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();

                if (mounted) {
                    clientImageValidationCache.set(primaryUrl, data.valid);

                    if (data.valid) {
                        setImgSrc(primaryUrl);
                    } else {
                        const fallback = await getFallbackUrl(cobbleName);
                        setImgSrc(fallback);
                    }
                }
            } catch (error) {
                // Backend check failed? Assume primary is bad or network error, try fallback
                if (mounted) {
                    const fallback = await getFallbackUrl(cobbleName);
                    setImgSrc(fallback);
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        verifyImage();

        return () => { mounted = false; };
    }, [pokemon.species]);

    const handleImageError = async () => {
        // If the assigned image (validated or fallback) FAILS to load, try next fallback
        if (imgSrc.includes('cobblemon.tools')) {
            // If validation said YES but it failed loading (rare), go to fallback
            const cobbleName = getFormattedName(pokemon.species);
            const fallback = await getFallbackUrl(cobbleName);
            setImgSrc(fallback);
        } else if (imgSrc.includes('other/home')) {
            const cobbleName = getFormattedName(pokemon.species);
            setImgSrc(`https://img.pokemondb.net/sprites/home/normal/${cobbleName}.png`);
        } else if (imgSrc.includes('pokemondb')) {
            setImgSrc(`https://via.placeholder.com/64x64/1a1a1a/666666?text=${encodeURIComponent(pokemon.species.substring(0, 3))}`);
        }
    };

    const displayName = pokemon.nickname || pokemon.species;

    return (
        <div
            className={`relative w-14 h-14 rounded-lg flex items-center justify-center transition-all ${pokemon.fainted
                ? 'bg-red-900/50 border-2 border-red-500/50 grayscale-[50%]'
                : 'bg-gray-800/50 border border-gray-700/50'
                }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <img
                src={imgSrc || `https://via.placeholder.com/64x64/1a1a1a/666666?text=?`}
                alt={pokemon.species}
                className={`w-12 h-12 object-contain transition-all ${pokemon.fainted ? 'opacity-60' : ''} ${isLoading ? 'opacity-0' : 'opacity-100'}`}
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

            {/* Custom Styled Tooltip */}
            {isHovered && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none animate-fade-in">
                    <div className="bg-gray-900/95 border border-gray-700 rounded-lg p-2 shadow-lg min-w-[100px] text-center backdrop-blur-sm">
                        <div className="text-white font-semibold text-sm mb-1 capitalize">
                            {displayName}
                        </div>
                        {types.length > 0 && (
                            <div className="flex gap-1 justify-center flex-wrap">
                                {types.map((type) => {
                                    const colors = TYPE_COLORS[type] || { bg: 'bg-gray-500', text: 'text-white' };
                                    return (
                                        <span
                                            key={type}
                                            className={`${colors.bg} ${colors.text} text-[10px] px-2 py-0.5 rounded-full font-medium uppercase`}
                                        >
                                            {type}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        {pokemon.fainted && (
                            <div className="text-red-400 text-[10px] mt-1 font-medium">Fainted</div>
                        )}
                    </div>
                    {/* Tooltip Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-700"></div>
                </div>
            )}
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
    const [history, setHistory] = useState<MatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
    const styles = TIER_STYLES[player.tier] || TIER_STYLES.UNRANKED;

    const onMatchSelect = (matchId: string) => {
        setSelectedMatchId(matchId);
    };

    useEffect(() => {
        setLoading(true);
        // Try to fetch real history
        fetch(`${API_BASE}/api/ranked/player/${player.uuid}/history?limit=10&page=${page}`)
            .then(res => res.json())
            .then((data: MatchHistoryResponse) => {
                if (data.matches) {
                    setHistory(data.matches);
                    setTotalPages(data.pagination?.totalPages || 1);
                } else {
                    setHistory([]);
                }
            })
            .catch(() => {
                console.error('Failed to fetch history');
                setHistory([]);
            })
            .finally(() => setLoading(false));
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
    const [match, setMatch] = useState<MatchDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // Try to fetch real match data
        fetch(`${API_BASE}/api/ranked/match/${matchId}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.winner) {
                    setMatch(data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch match detail', err);
            })
            .finally(() => setLoading(false));
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
