
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserProfile, { UserData } from '../components/UserProfile';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

// --- TYPES ---
interface Pokemon {
    id: number;
    name: string;
}

interface TournamentEntry {
    discordId: string;
    minecraftUsername: string;
    team: (Pokemon | null)[];
    isLocked: boolean;
}

type TournamentStatus = 'DRAFTING' | 'LOCK_IN' | 'ONGOING' | 'ENDED';

interface TournamentMatch {
    id: string;
    bracketGroup?: string;
    round: number;
    matchIndex: number;
    player1: string | null;
    player2: string | null;
    winner: string | null;
    score: string;
    status: string;
    nextMatchId: string | null;
}

interface Duo {
    duoId: string;
    seasonId: number;
    player1DiscordId: string;
    player1Username: string;
    player2DiscordId: string;
    player2Username: string;
    captainDiscordId: string;
    teamName?: string;
    team: ({ id: number; name: string } | null)[];
    isLocked: boolean;
}

// --- CONSTANTS ---
const TYPE_COLORS: Record<string, string> = {
    normal: 'bg-stone-400 text-stone-900',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    grass: 'bg-green-500 text-white',
    electric: 'bg-yellow-400 text-black',
    ice: 'bg-cyan-300 text-black',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-yellow-700 text-white',
    flying: 'bg-indigo-300 text-black',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-white',
    rock: 'bg-yellow-800 text-white',
    ghost: 'bg-indigo-800 text-white',
    dragon: 'bg-violet-600 text-white',
    steel: 'bg-slate-400 text-slate-900',
    fairy: 'bg-pink-300 text-black',
    dark: 'bg-neutral-800 text-white',
};

// --- BAN LIST LOGIC ---

// Season 1: Ban all Legendaries and Mythicals
const SEASON1_BANNED_IDS = new Set([
    // Gen 1
    144, 145, 146, 150, 151,
    // Gen 2
    243, 244, 245, 249, 250, 251,
    // Gen 3
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    // Gen 4
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
    // Gen 5
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    // Gen 6
    716, 717, 718, 719, 720, 721,
    // Gen 7 (Incl. Ultra Beasts)
    772, 773, 785, 786, 787, 789, 790, 791, 792,
    793, 794, 795, 796, 797, 798, 799, // UBs
    800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    // Gen 8
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
    // Gen 9 (Treasures of Ruin + Box Legends + DLC Legends/Mythics)
    1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
]);

// Season 2: Categories for selective bans
// Mythical Pokemon (Completely Banned)
const MYTHICAL_IDS = new Set([
    151,  // Mew
    251,  // Celebi
    385,  // Jirachi
    386,  // Deoxys (all forms)
    489, 490,  // Phione, Manaphy
    491,  // Darkrai
    492,  // Shaymin
    493,  // Arceus
    494,  // Victini
    647,  // Keldeo
    648,  // Meloetta
    649,  // Genesect
    719,  // Diancie
    720,  // Hoopa
    721,  // Volcanion
    801,  // Magearna
    802,  // Marshadow
    807,  // Zeraora
    808, 809,  // Meltan, Melmetal
    893,  // Zarude
    1001, 1002, 1003, 1004,  // Treasures of Ruin (Chi-Yu, Chien-Pao, Ting-Lu, Wo-Chien)
    1025  // Pecharunt
]);

// Ultra Beasts (Completely Banned)
const ULTRA_BEAST_IDS = new Set([
    793,  // Nihilego
    794,  // Buzzwole
    795,  // Pheromosa
    796,  // Xurkitree
    797,  // Celesteela
    798,  // Kartana
    799,  // Guzzlord
    803,  // Poipole
    804,  // Naganadel
    805,  // Stakataka
    806   // Blacephalon
]);

// Paradox Pokemon (Completely Banned)
const PARADOX_IDS = new Set([
    // Past Paradox
    984,  // Great Tusk
    985,  // Scream Tail
    986,  // Brute Bonnet
    987,  // Flutter Mane
    988,  // Slither Wing
    989,  // Sandy Shocks
    990,  // Roaring Moon
    // Future Paradox
    991,  // Iron Treads
    992,  // Iron Bundle
    993,  // Iron Hands
    994,  // Iron Jugulis
    995,  // Iron Moth
    996,  // Iron Thorns
    997,  // Iron Valiant
    // Box Legends (Moved to Legendary list)
    // 1007, 1008,  // Koraidon, Miraidon
    // DLC Paradox
    1005, 1006,  // Walking Wake, Iron Leaves
    1009, 1010   // Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown
]);

// Specific restricted Pokemon (Banned even if their category is allowed)
const RESTRICTED_IDS = new Set([
    890 // Eternatus
]);

// Legendary Pokemon (Only 1 allowed per team in Season 2)
const LEGENDARY_IDS = new Set([
    // Gen 1
    144, 145, 146,  // Articuno, Zapdos, Moltres
    150,  // Mewtwo
    // Gen 2
    243, 244, 245,  // Raikou, Entei, Suicune
    249, 250,  // Lugia, Ho-Oh
    // Gen 3
    377, 378, 379,  // Regis
    380, 381,  // Latias, Latios
    382, 383, 384,  // Kyogre, Groudon, Rayquaza
    // Gen 4
    480, 481, 482,  // Lake Trio
    483, 484,  // Dialga, Palkia
    485,  // Heatran
    486,  // Regigigas
    487, 488,  // Giratina, Cresselia
    // Gen 5
    638, 639, 640,  // Swords of Justice
    641, 642,  // Tornadus, Thundurus
    643, 644,  // Reshiram, Zekrom
    645, 646,  // Landorus, Kyurem
    // Gen 6
    716, 717, 718,  // Xerneas, Yveltal, Zygarde
    // Gen 7
    772, 773,  // Type: Null, Silvally
    785, 786, 787, 788,  // Tapus
    789, 790, 791, 792,  // Cosmog line + Legendaries
    800,  // Necrozma
    // Gen 8
    888, 889,  // Zacian, Zamazenta
    891, 892,  // Kubfu, Urshifu
    894, 895, 896, 897, 898,  // Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
    905,  // Enamorus
    // Gen 9
    1014, 1015, 1016, 1017,  // Ogerpon, Okidogi, Munkidori, Fezandipiti
    1024,  // Terapagos
    1007, 1008  // Koraidon, Miraidon (Moved from Paradox ban)
]);

// Combined Season 2 completely banned list (Mythical + Ultra Beasts + Paradox)
const SEASON2_BANNED_IDS = new Set([
    ...MYTHICAL_IDS,
    ...ULTRA_BEAST_IDS,
    ...PARADOX_IDS,
    ...RESTRICTED_IDS
]);

// Check if Pokemon is banned for the current season
const isBannedForSeason = (id: number, seasonFormat: string): boolean => {
    if (seasonFormat.includes('Duos')) {
        // Season 2 rules
        return SEASON2_BANNED_IDS.has(id);
    }
    // Season 1 rules
    return SEASON1_BANNED_IDS.has(id);
};

// Check if Pokemon is a legendary (for the 1-per-team limit)
const isLegendary = (id: number): boolean => LEGENDARY_IDS.has(id);

// Legacy function for backwards compatibility
const isBanned = (id: number) => SEASON1_BANNED_IDS.has(id);

// --- CACHE & HELPERS ---
const clientImageCache = new Map<string, boolean>();

const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .replace(/[.']/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
};

// --- COMPONENTS ---

const PokemonTeamImage: React.FC<{ pokemon: Pokemon; className?: string }> = ({ pokemon, className = "" }) => {
    const [imgSrc, setImgSrc] = useState<string>("");

    useEffect(() => {
        let isMounted = true;

        const verifyImage = async () => {
            const cobbleName = getFormattedName(pokemon.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;

            if (clientImageCache.has(primaryUrl)) {
                if (isMounted) {
                    const isValid = clientImageCache.get(primaryUrl);
                    setImgSrc(isValid ? primaryUrl : fallback3d);
                }
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();

                clientImageCache.set(primaryUrl, data.valid);

                if (isMounted) {
                    setImgSrc(data.valid ? primaryUrl : fallback3d);
                }
            } catch (error) {
                if (isMounted) setImgSrc(fallback3d);
            }
        };

        verifyImage();

        return () => { isMounted = false; };
    }, [pokemon]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(pokemon.name)}`);
        }
    };

    return (
        <OptimizedImage
            src={imgSrc}
            alt={pokemon.name}
            className={`w-full h-full object-contain ${className}`}
            contain
            onError={handleImageError}
            loading="lazy"
        />
    );
};

const PokemonDetailCard: React.FC<{ pokemon: Pokemon | null; revealed: boolean }> = ({ pokemon, revealed }) => {
    const [types, setTypes] = useState<string[]>([]);

    useEffect(() => {
        if (revealed && pokemon) {
            fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
                .then(res => res.json())
                .then(data => {
                    setTypes(data.types.map((t: any) => t.type.name));
                })
                .catch(() => setTypes([]));
        } else {
            setTypes([]);
        }
    }, [pokemon, revealed]);

    if (!revealed || !pokemon) {
        return (
            <div className="aspect-square bg-black/40 rounded-[2rem] border-2 border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-lg">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-4xl font-black text-gray-700 select-none">?</span>
                </div>
                <div className="h-2 w-16 bg-white/5 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="aspect-square bg-[#120507] rounded-[2rem] border-2 border-white/10 relative overflow-hidden group shadow-2xl hover:border-brand-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-3 right-3 z-30">
                <span className="text-[9px] font-black text-white/40 bg-black/60 px-2 py-0.5 rounded-lg border border-white/5 font-mono tracking-wider backdrop-blur-sm">
                    #{pokemon.id.toString().padStart(3, '0')}
                </span>
            </div>
            <div className="absolute inset-0 z-10 p-4 pb-14 flex items-center justify-center">
                <div className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] filter group-hover:scale-110 transition-transform duration-500 ease-out">
                    <PokemonTeamImage pokemon={pokemon} />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md border-t border-white/10 z-20 flex flex-col items-center justify-center py-2 px-1">
                <h4 className="text-white font-black uppercase text-sm tracking-wider truncate drop-shadow-md mb-1.5 w-full text-center">
                    {pokemon.name}
                </h4>
                <div className="flex justify-center flex-wrap gap-1.5 w-full">
                    {types.length > 0 ? types.map(t => (
                        <span key={t} className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md border border-white/10 ${TYPE_COLORS[t] || 'bg-gray-600 text-white'}`}>
                            {t}
                        </span>
                    )) : (
                        <div className="flex gap-1"><div className="h-4 w-10 bg-white/10 rounded-full animate-pulse"></div><div className="h-4 w-10 bg-white/10 rounded-full animate-pulse"></div></div>
                    )}
                </div>
            </div>
        </div>
    );
};

const RuleCard: React.FC<{ title: string; icon: string; children: React.ReactNode; color?: string }> = ({ title, icon, children, color = "border-white/10" }) => (
    <div className={`bg-black/40 backdrop-blur-xl rounded-2xl border-2 ${color} p-6 shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 h-full flex flex-col justify-start`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
        <div className="absolute -top-2 -right-2 p-4 opacity-10 text-7xl pointer-events-none group-hover:scale-110 transition-transform">{icon}</div>
        <div className="flex items-center gap-3 mb-4 relative z-10 w-full justify-start">
            <span className="text-3xl filter drop-shadow-lg grayscale-0">{icon}</span>
            <h3 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm text-left">{title}</h3>
        </div>
        <div className="text-gray-300 text-xs md:text-sm space-y-2 relative z-10 leading-relaxed font-medium text-left w-full">
            {children}
        </div>
    </div>
);

const Tournament: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState<'rules' | 'brackets' | 'signup' | 'players' | 'duos'>('rules');
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [loadingPokemon, setLoadingPokemon] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Team Management State
    const [selectedTeam, setSelectedTeam] = useState<(Pokemon | null)[]>(new Array(6).fill(null));
    const [isLocked, setIsLocked] = useState(false);
    const [hasStartedRegistration, setHasStartedRegistration] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Tournament Config & State
    const [tournamentStatus, setTournamentStatus] = useState<TournamentStatus>('DRAFTING');
    const [bracketView, setBracketView] = useState<'winners' | 'bracket'>('winners');

    // Season State
    const [allSeasons, setAllSeasons] = useState<{ seasonId: number; name: string; format: string; status: string; challongeUrl?: string; isArchived?: boolean }[]>([]);
    const [activeSeason, setActiveSeason] = useState<{ seasonId: number; name: string; format: string; status: string; challongeUrl?: string }>({ seasonId: 1, name: 'Loading...', format: '', status: 'DRAFTING', challongeUrl: '' });

    // Players List State
    const [playersList, setPlayersList] = useState<TournamentEntry[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<TournamentEntry | null>(null);

    // Duos State
    const [duos, setDuos] = useState<Duo[]>([]);
    const [myDuo, setMyDuo] = useState<Duo | null>(null);
    const [viewMode, setViewMode] = useState<'players' | 'duos'>('players');
    const [selectedDuo, setSelectedDuo] = useState<Duo | null>(null);
    const [teamName, setTeamName] = useState('');

    // Bracket & Winners State
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [apiWinners, setApiWinners] = useState<{
        rank: number;
        username?: string;
        teamName?: string;
        player1?: string;
        player2?: string;
        score: string
    }[]>([]);


    const getPlayerStats = (username: string) => {
        // Prefer API Score
        const apiWinner = apiWinners.find(w => w.username === username);
        if (apiWinner) return apiWinner.score;

        let wins = 0;
        let losses = 0;
        matches.forEach(m => {
            if (m.status === 'COMPLETED') {
                if (m.winner === username) wins++;
                else if (m.player1 === username || m.player2 === username) losses++;
            }
        });
        return `${wins} - ${losses}`;
    };

    const winners = useMemo(() => {
        if (apiWinners.length > 0) {
            const sorted = [...apiWinners].sort((a, b) => a.rank - b.rank);
            const w = [null, null, null] as (string | null)[];
            // Handle both Singles (username) and fallback for display
            if (sorted[0]) w[0] = sorted[0].username || sorted[0].player1 || null;
            if (sorted[1]) w[1] = sorted[1].username || sorted[1].player1 || null;
            if (sorted[2]) w[2] = sorted[2].username || sorted[2].player1 || null;
            return w;
        }

        const finalists = matches.filter(m => m.bracketGroup === 'finals' && m.status === 'COMPLETED');
        const lastFinal = finalists.sort((a, b) => b.round - a.round)[0];

        if (!lastFinal) return [null, null, null];

        const w1 = lastFinal.winner;
        const w2 = lastFinal.winner === lastFinal.player1 ? lastFinal.player2 : lastFinal.player1;

        // Try to find 3rd place from losers final
        const losersMatches = matches.filter(m => m.bracketGroup === 'losers');
        const losersFinal = losersMatches.sort((a, b) => b.round - a.round || b.matchIndex - a.matchIndex)[0];
        const w3 = losersFinal ? losersFinal.winner : null;

        return [w1, w2, w3];
    }, [matches, apiWinners]);

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
                const data = await response.json();
                const formatted = data.results.map((p: any, idx: number) => ({
                    id: idx + 1,
                    name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ')
                }));
                setPokemonList(formatted);
            } catch (e) {
                console.error("Failed to fetch pokemon list", e);
            } finally {
                setLoadingPokemon(false);
            }
        };
        fetchPokemon();
    }, []);

    useEffect(() => {
        // Fetch all seasons
        fetch(`${API_BASE_URL}/api/tournament/seasons`)
            .then(res => res.json())
            .then(seasons => {
                if (Array.isArray(seasons) && seasons.length > 0) {
                    setAllSeasons(seasons);
                    // Find active (non-archived) season, or fall back to latest
                    const active = seasons.find((s: any) => !s.isArchived) || seasons[0];
                    setActiveSeason(active);
                    setTournamentStatus(active.status || 'DRAFTING');
                }
            })
            .catch(e => console.error("Seasons fetch error", e));

        // Initial player fetch deferred until season is known
    }, []);

    // Refetch data when season changes
    useEffect(() => {
        if (activeSeason.seasonId) {
            setTournamentStatus(activeSeason.status as TournamentStatus);
            fetchPlayersForSeason(activeSeason.seasonId);

            // Clear previous data first
            setMatches([]);
            setApiWinners([]);

            // If ended, fetch winners
            if (activeSeason.status === 'ENDED') {
                fetch(`${API_BASE_URL}/api/tournament/winners?seasonId=${activeSeason.seasonId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setApiWinners(data);
                    })
                    .catch(err => console.error("Failed to fetch winners", err));
            } else {
                setBracketView('winners'); // Default view
            }

            // Fetch bracket for this season
            fetch(`${API_BASE_URL}/api/tournament/bracket?seasonId=${activeSeason.seasonId}`)
                .then(res => res.json())
                .then(data => setMatches(data.matches || []))
                .catch(console.error);
        }
    }, [activeSeason.seasonId]);

    useEffect(() => {
        if (user?.id) {
            fetchMyTeam();
            fetchMyDuo();
        }
    }, [user, activeSeason.seasonId]);

    useEffect(() => {
        if (activeTab === 'brackets') {
            fetch(`${API_BASE_URL}/api/tournament/bracket?seasonId=${activeSeason.seasonId}`)
                .then(res => res.json())
                .then(data => setMatches(data.matches || []))
                .catch(console.error);
            // Fetch winners data
            fetch(`${API_BASE_URL}/api/tournament/winners?seasonId=${activeSeason.seasonId}`)
                .then(res => res.json())
                .then(data => setApiWinners(Array.isArray(data) ? data : []))
                .catch(console.error);
        } else if (activeTab === 'players') {
            fetchPlayersForSeason(activeSeason.seasonId);
            if (activeSeason.format.includes('Duos')) fetchDuosForSeason(activeSeason.seasonId);
        } else if (activeTab === 'duos') {
            fetchDuosForSeason(activeSeason.seasonId);
        }
    }, [activeTab, activeSeason.seasonId]);

    // Auto-refresh polling for real-time updates (every 15 seconds)
    useEffect(() => {
        const pollInterval = setInterval(() => {
            // Always refresh players and duos when on Players tab
            if (activeTab === 'players' && activeSeason.seasonId) {
                fetchPlayersForSeason(activeSeason.seasonId);
                if (activeSeason.format.includes('Duos')) {
                    fetchDuosForSeason(activeSeason.seasonId);
                }
            }
            // Refresh myDuo for captains waiting for pairing or drafting
            if (user?.id && activeSeason.format.includes('Duos')) {
                fetchMyDuo();
            }
        }, 15000); // 15 seconds

        return () => clearInterval(pollInterval);
    }, [activeTab, activeSeason.seasonId, activeSeason.format, user?.id]);

    const fetchMyTeam = async () => {
        if (!user?.id) return;
        setLoadingTeam(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/my-team?discordId=${user.id}&seasonId=${activeSeason.seasonId}`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.registered) {
                    const filledTeam = [...(data.team || [])];
                    while (filledTeam.length < 6) filledTeam.push(null);
                    setSelectedTeam(filledTeam);
                    setIsLocked(data.isLocked || false);
                    setHasStartedRegistration(true);
                } else {
                    // Reset for new season
                    setSelectedTeam(new Array(6).fill(null));
                    setIsLocked(false);
                    setHasStartedRegistration(false);
                }
            }
        } catch (e) {
            console.error("Failed to fetch team", e);
        } finally {
            setLoadingTeam(false);
        }
    };

    const fetchPlayers = async () => {
        fetchPlayersForSeason(activeSeason.seasonId);
    };

    const fetchPlayersForSeason = async (seasonId: number) => {
        if (playersList.length === 0) setLoadingPlayers(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/players?dev=true&seasonId=${seasonId}`);
            if (res.ok) {
                setPlayersList(await res.json());
            }
        } catch (e) { console.error(e); }
        finally { setLoadingPlayers(false); }
    };

    const fetchDuosForSeason = async (seasonId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/duos?seasonId=${seasonId}`);
            if (res.ok) {
                setDuos(await res.json());
            }
        } catch (e) { console.error(e); }
    };

    const fetchMyDuo = async () => {
        if (!user?.id) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/my-duo?discordId=${user.id}&seasonId=${activeSeason.seasonId}`);
            if (res.ok) {
                const data = await res.json();
                setMyDuo(data);

                // If user is captain and duo has a team, populate selectedTeam
                if (data && data.captainDiscordId === user.id && data.team) {
                    const filledTeam = [...(data.team || [])];
                    while (filledTeam.length < 6) filledTeam.push(null);
                    setSelectedTeam(filledTeam);
                    setIsLocked(data.isLocked || false);
                    setHasStartedRegistration(true);
                    setTeamName(data.teamName || '');
                }
            }
        } catch (e) { console.error(e); }
    };

    const filteredPokemon = useMemo(() => {
        if (!searchQuery) return pokemonList.slice(0, 50);
        return pokemonList.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 100);
    }, [pokemonList, searchQuery]);

    const handleSelectPokemon = (pokemon: Pokemon) => {
        if (isLocked || tournamentStatus === 'ONGOING') return;
        const emptySlot = selectedTeam.indexOf(null);
        if (emptySlot !== -1) {
            const newTeam = [...selectedTeam];
            newTeam[emptySlot] = pokemon;
            setSelectedTeam(newTeam);
        }
    };

    const handleRemovePokemon = (index: number) => {
        if (isLocked || tournamentStatus === 'ONGOING') return;
        const newTeam = [...selectedTeam];
        newTeam[index] = null;
        setSelectedTeam(newTeam);
    };

    // Check if team has any banned Pokemon (season-specific)
    const hasBannedPokemon = useMemo(() => {
        return selectedTeam.some(p => p !== null && isBannedForSeason(p.id, activeSeason?.format || ''));
    }, [selectedTeam, activeSeason]);

    // Count legendaries in team (for Season 2 limit)
    const legendaryCount = useMemo(() => {
        return selectedTeam.filter(p => p !== null && isLegendary(p.id)).length;
    }, [selectedTeam]);

    // Season 2: Check if team exceeds legendary limit
    const exceedsLegendaryLimit = useMemo(() => {
        if (!activeSeason?.format.includes('Duos')) return false; // Only Season 2 has this rule
        return legendaryCount > 1;
    }, [legendaryCount, activeSeason]);

    const handleInitialRegister = async () => {
        if (!user || tournamentStatus === 'ONGOING') return;
        setLoadingTeam(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    minecraftUsername: user.minecraftUsername,
                    team: new Array(6).fill(null),
                    seasonId: activeSeason.seasonId
                })
            });

            if (res.ok) {
                setHasStartedRegistration(true);
            } else {
                const err = await res.json();
                alert(err.error || "Registration failed. Please refresh and try again.");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setLoadingTeam(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!user || hasBannedPokemon || exceedsLegendaryLimit || tournamentStatus === 'ONGOING') return;

        // For Duos: Check if user is captain and duo exists
        if (activeSeason.format.includes('Duos') && myDuo) {
            if (myDuo.captainDiscordId !== user.id && user.minecraftUsername !== 'GreatRimu') return; // Only captain can save (unless admin)
            if (myDuo.isLocked) return; // Can't edit locked team

            setSaving(true);
            setSaveStatus('idle');
            try {
                const res = await fetch(`${API_BASE_URL}/api/tournament/duo/save-team`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        discordId: user.id,
                        duoId: myDuo.duoId,
                        team: selectedTeam,
                        teamName: teamName
                    })
                });

                if (res.ok) {
                    setSaveStatus('success');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                } else {
                    setSaveStatus('error');
                    const err = await res.json();
                    alert(err.error || "Failed to save team");
                }
            } catch (e) {
                setSaveStatus('error');
            } finally {
                setSaving(false);
            }
            return;
        }

        // Singles mode (original logic)
        if (isLocked) return;
        setSaving(true);
        setSaveStatus('idle');
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    minecraftUsername: user.minecraftUsername,
                    team: selectedTeam,
                    seasonId: activeSeason.seasonId
                })
            });

            if (res.ok) {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
            }
        } catch (e) {
            setSaveStatus('error');
        } finally {
            setSaving(false);
        }
    };

    const handleLockIn = async () => {
        if (tournamentStatus !== 'LOCK_IN') return;

        // For Duos mode
        if (activeSeason.format.includes('Duos') && myDuo) {
            if (myDuo.captainDiscordId !== user?.id) return; // Only captain
            if (selectedTeam.filter(p => p !== null).length < 6) {
                alert("Team must have 6 Pokemon to lock!");
                return;
            }
            if (!window.confirm("Are you sure you want to LOCK IN your team? You will NOT be able to edit it afterwards.")) return;

            await handleSaveDraft(); // Save first

            setSaving(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/tournament/duo/lock`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ discordId: user?.id, duoId: myDuo.duoId })
                });
                if (res.ok) {
                    setIsLocked(true);
                    setMyDuo({ ...myDuo, isLocked: true }); // Update local state
                    setSaveStatus('success');
                } else {
                    const err = await res.json();
                    alert(err.error || "Lock failed.");
                }
            } catch (e) { alert("Lock failed."); }
            finally { setSaving(false); }
            return;
        }

        // Singles mode (original logic)
        if (selectedTeam.filter(p => p !== null).length < 1) {
            alert("You cannot lock an empty team!");
            return;
        }
        if (!window.confirm("Are you sure you want to LOCK IN your team? You will NOT be able to edit it afterwards.")) return;

        await handleSaveDraft();

        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/lock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user?.id, seasonId: activeSeason.seasonId })
            });
            if (res.ok) {
                setIsLocked(true);
                setSaveStatus('success');
            } else {
                const err = await res.json();
                alert(err.error || "Lock failed.");
            }
        } catch (e) { alert("Lock failed."); }
        finally { setSaving(false); }
    };

    return (
        <div className="py-4 pb-8 font-sans text-white relative">
            <style>{`
        .dev-stripe {
            background: repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px);
        }
        .pokemon-grid::-webkit-scrollbar { width: 6px; }
        .pokemon-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .pokemon-grid::-webkit-scrollbar-thumb { background: #e5383b; border-radius: 10px; }
        
        .banned-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 50;
            pointer-events: none;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .banned-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: #ef4444 transparent transparent transparent;
        }
        .group:hover .banned-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(-4px);
        }

        .dock-pill {
            background: rgba(18, 5, 7, 0.65);
            backdrop-filter: blur(25px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
            height: 40px;
        }
        
        .nav-link-active {
            position: relative;
            color: #e5383b !important;
            background: rgba(229, 56, 59, 0.1);
        }

        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #1f090c; border-radius: 10px; margin: 4px; }
        ::-webkit-scrollbar-thumb { background: #e5383b; border-radius: 10px; border: 2px solid #1f090c; }
        ::-webkit-scrollbar-thumb:hover { background: #ff4d4d; }
      `}</style>

            <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

            <div className="relative z-20 container mx-auto px-4 pt-12">
                {/* Top Utility Bar */}
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-start items-center mb-6 gap-4">
                    <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md h-10 shrink-0">
                        <span>←</span> Back to Dashboard
                    </Link>
                    {/* TABS */}
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
                        {[
                            { id: 'rules', label: 'Rules' },
                            { id: 'brackets', label: 'Bracket' },
                            { id: 'players', label: `Players (${playersList?.length || 0})` },
                            { id: 'signup', label: hasStartedRegistration ? 'My Team' : 'Sign Up' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                        px-6 h-10 rounded-full font-black uppercase tracking-widest text-[10px] md:text-xs transition-all whitespace-nowrap flex items-center justify-center
                        ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-lg shadow-white/10'
                                        : 'bg-black/40 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}
                    `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header Dashboard */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/10 rounded-[2.5rem] p-6 md:p-8 gap-6 backdrop-blur-md">

                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner border border-brand-primary/30 p-1">
                                <img src="https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif" alt="Tournament Logo" className="w-full h-full object-cover rounded-2xl" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1 text-white">
                                    NISAMON <span className="text-brand-primary">TOURNAMENT</span>
                                </h1>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {/* Season Selector Dropdown */}
                                    <select
                                        value={activeSeason.seasonId}
                                        onChange={(e) => {
                                            const selected = allSeasons.find(s => s.seasonId === parseInt(e.target.value));
                                            if (selected) setActiveSeason(selected);
                                        }}
                                        className="bg-brand-primary/20 text-brand-primary border border-brand-primary/40 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-brand-primary/30 transition-all outline-none"
                                    >
                                        {allSeasons.map(s => (
                                            <option key={s.seasonId} value={s.seasonId} className="bg-[#120507] text-white">
                                                {s.name} {s.isArchived ? '(Archived)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-gray-400 tracking-widest">{activeSeason.format}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-center">
                            <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px] h-14">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Players</span>
                                <span className="text-xl font-black text-white">{playersList.length}</span>
                            </div>
                            <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px] h-14">
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Phase</span>
                                <span className={`text-xl font-black uppercase ${tournamentStatus === 'DRAFTING' ? 'text-red-500' :
                                    tournamentStatus === 'LOCK_IN' ? 'text-orange-500' :
                                        tournamentStatus === 'ONGOING' ? 'text-green-500' :
                                            'text-yellow-400'
                                    }`}>
                                    {tournamentStatus === 'DRAFTING' ? 'SIGNUPS' : tournamentStatus.replace('_', '-')}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    if (tournamentStatus === 'ONGOING' || tournamentStatus === 'ENDED') {
                                        setActiveTab('brackets');
                                    } else {
                                        setActiveTab('signup');
                                    }
                                }}
                                className={`
                        text-white font-black px-8 h-14 rounded-2xl shadow-lg transition-all uppercase tracking-widest text-sm border-b-4 flex items-center justify-center flex-1 md:flex-none min-w-[140px]
                        ${tournamentStatus === 'DRAFTING'
                                        ? 'bg-red-600 hover:bg-red-500 border-red-800 hover:scale-105'
                                        : tournamentStatus === 'LOCK_IN'
                                            ? 'bg-orange-600 hover:bg-orange-500 border-orange-800'
                                            : 'bg-green-600 hover:bg-green-500 border-green-800'}
                    `}
                            >
                                {tournamentStatus === 'ONGOING' ? 'Play' : tournamentStatus === 'ENDED' ? 'View Winners' : tournamentStatus === 'LOCK_IN' ? 'Lock-In' : 'Sign Up'}
                            </button>
                        </div>
                    </div>

                    {/* Content Viewport */}
                    <div className="min-h-[40vh] pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {activeTab === 'rules' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="md:col-span-2 lg:col-span-3">
                                    <div className="bg-gradient-to-br from-brand-primary/20 to-black border-2 border-brand-primary/40 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl pointer-events-none text-brand-primary">🏆</div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Official Format</h2>
                                        <p className="text-lg text-gray-200 leading-relaxed max-w-4xl">
                                            {activeSeason.format.includes('Duos') || activeSeason.name.includes('Season 2') ? (
                                                <>Double-elimination bracket of a <span className="text-brand-primary font-black">Duos 2v2</span> showdown where you get picked a DUO with someone else and each pick 3 Pokemon to form a full team of 6 Pokemon with a <span className="text-brand-accent font-black">level 50 cap</span>!</>
                                            ) : (
                                                <>Double-elimination bracket of a <span className="text-brand-primary font-black">Singles 4v4</span> showdown where you pick a roster of 6 Pokemon but pick 4 each battle with a <span className="text-brand-accent font-black">level 50 cap</span>!</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <RuleCard title="Restrictions" icon="🚫" color="border-red-500/40 bg-red-900/10">
                                    <div className="space-y-4">
                                        <div><strong className="text-red-300 block mb-1 uppercase text-xs tracking-wider">Banned Gimmicks</strong><ul className="space-y-1 list-disc list-inside text-gray-300 font-bold"><li>Tera</li><li>Z-Move</li><li>Dynamax</li><li>Mega-Evolution</li></ul></div>
                                        <div><strong className="text-orange-300 block mb-1 uppercase text-xs tracking-wider">Pokémon Bans</strong><ul className="space-y-1 font-bold text-orange-200"><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Mythical Pokémon</li><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Paradox Pokémon</li><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Ultra Beasts</li><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Eternatus</li><li className="flex items-center gap-2"><span className="text-yellow-500">⭐</span> Only 1 Legendary per team</li></ul></div>
                                    </div>
                                </RuleCard>
                                <RuleCard title="Clauses" icon="📜" color="border-blue-500/40 bg-blue-900/10">
                                    <ul className="space-y-2">
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Species Clause</strong><span className="text-gray-400 text-xs">A team cannot have two Pokémon of the same National Pokédex number.</span></li>
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Item Clause</strong><span className="text-gray-400 text-xs">No two Pokémon may hold the same item on the same team.</span></li>
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Sleep Clause</strong><span className="text-gray-400 text-xs">A team cannot put more than one of the opponent's Pokémon to sleep at the same time.</span></li>
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Endless Battle Clause</strong><span className="text-gray-400 text-xs">Players cannot intentionally create a situation where the battle cannot end.</span></li>
                                    </ul>
                                </RuleCard>
                                <RuleCard title="Move Bans" icon="⛔" color="border-purple-500/40 bg-purple-900/10">
                                    <div className="space-y-3">
                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Evasion Clause</strong><span className="text-gray-400 text-xs">Moves that specifically raise evasion (like Double Team or Minimize) are banned.</span></div>
                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">OHKO Clause</strong><span className="text-gray-400 text-xs">Moves that cause a "One-Hit Knockout" regardless of HP (Guillotine, Horn Drill, Sheer Cold, Fissure) are banned.</span></div>
                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Moody Ability</strong><span className="text-gray-400 text-xs">This ability is banned. Its random stat boosts are too RNG-dependent.</span></div>
                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Other Restrictions</strong><span className="text-gray-400 text-xs font-mono text-purple-200">Revival Blessing, Arena Trap, Power Construct, Shadow Tag, Baton Pass, Assist, Last Respects, Shed Tail</span></div>
                                    </div>
                                </RuleCard>
                                <RuleCard title="Item Bans" icon="🎒" color="border-pink-500/40 bg-pink-900/10">
                                    <ul className="space-y-1 list-disc list-inside font-bold text-pink-200"><li>Bright Powder</li><li>Lax Incense</li><li>King's Rock</li><li>Razor Fang</li><li>Quick Claw</li></ul>
                                </RuleCard>
                                <RuleCard title="General Rules" icon="⚖️">
                                    <ul className="space-y-3">
                                        <li className="flex gap-3"><span className="text-red-500 font-bold text-lg leading-none">•</span><span>Break any rule = <span className="text-red-400 font-bold">Instant Disqualification</span>.</span></li>
                                        <li className="flex gap-3"><span className="text-brand-primary font-bold text-lg leading-none">•</span><span>No intentional stalling or disconnect abuse.</span></li>
                                        <li className="flex gap-3"><span className="text-brand-primary font-bold text-lg leading-none">•</span><span>Valid disconnect? Restart match <strong className="text-white">WITH SAME TEAM</strong>.</span></li>
                                        <li className="flex gap-3"><span className="text-brand-primary font-bold text-lg leading-none">•</span><span>Report matches within <strong className="text-white">10 minutes</strong>.</span></li>
                                        <li className="flex gap-3"><span className="text-brand-primary font-bold text-lg leading-none">•</span><span className="italic opacity-80">Admin decisions are final.</span></li>
                                    </ul>
                                </RuleCard>
                                <RuleCard title="Spectator Rules" icon="👀" color="border-green-500/40 bg-green-900/10">
                                    <ul className="space-y-2">
                                        <li className="flex gap-2"><span className="text-green-400">•</span> When the matches start mute your mic/ use push to talk.</li>
                                        <li className="flex gap-2"><span className="text-green-400">•</span> Cheering is allowed but do not distract/disrupt the contestants and matches.</li>
                                        <li className="flex gap-2"><span className="text-green-400">•</span> Keep your pokemon on your shoulders or in your balls.</li>
                                    </ul>
                                </RuleCard>
                            </div>
                        )}

                        {activeTab === 'duos' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {duos.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-black/40 rounded-2xl border border-white/5">
                                        <span className="text-4xl mb-4">👥</span>
                                        <h3 className="text-xl font-bold text-white mb-2">No Duos Yet</h3>
                                        <p className="text-gray-400">Admins will pair signed-up players into duos soon!</p>
                                    </div>
                                ) : duos.map(duo => (
                                    <div key={duo.duoId} className="bg-gradient-to-br from-purple-900/30 to-black/80 border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl pointer-events-none group-hover:scale-110 transition-transform">👥</div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex -space-x-3">
                                                <img src={`https://mc-heads.net/avatar/${duo.player1Username}/48`} className={`w-12 h-12 rounded-xl border-2 ${duo.captainDiscordId === duo.player1DiscordId ? 'border-yellow-500 z-10' : 'border-white/10'}`} />
                                                <img src={`https://mc-heads.net/avatar/${duo.player2Username}/48`} className={`w-12 h-12 rounded-xl border-2 ${duo.captainDiscordId === duo.player2DiscordId ? 'border-yellow-500 z-10' : 'border-white/10'}`} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold flex items-center gap-2 text-sm">
                                                    {duo.player1Username} & {duo.player2Username}
                                                </div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest ${duo.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {duo.isLocked ? 'Ready for Battle' : 'Drafting Team'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Team Grid */}
                                        <div className="grid grid-cols-6 gap-2">
                                            {duo.team.map((poke, i) => (
                                                <div key={i} className="aspect-square bg-black/40 rounded-lg flex items-center justify-center border border-white/5 relative group/poke">
                                                    {poke ? (
                                                        <>
                                                            <img
                                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`}
                                                                alt={poke.name}
                                                                className="w-10 h-10 object-contain pixelated rendering-pixelated"
                                                            />
                                                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/poke:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none border border-white/10">
                                                                {poke.name}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <span className="text-white/10 text-lg font-bold">?</span>
                                                    )}
                                                </div>
                                            ))}
                                            {/* Fill remaining slots */}
                                            {Array.from({ length: 6 - duo.team.length }).map((_, i) => (
                                                <div key={`empty-${i}`} className="aspect-square bg-black/20 rounded-lg border border-white/5"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'brackets' && (
                            <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 min-h-[850px] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Tournament Results</h2>
                                        <div className="flex bg-black/40 rounded-full p-1 border border-white/10">
                                            <button onClick={() => setBracketView('winners')} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${bracketView === 'winners' ? 'bg-yellow-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Winners</button>
                                            <button onClick={() => setBracketView('bracket')} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${bracketView === 'bracket' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Bracket</button>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${tournamentStatus === 'ENDED' ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{tournamentStatus === 'ENDED' ? 'Season Concluded' : 'Live Updates'}</span>
                                    </div>
                                </div>

                                {bracketView === 'bracket' ? (
                                    // Show "Not Generated" only for DRAFTING/LOCK_IN phases IF no URL is set
                                    ((tournamentStatus === 'DRAFTING' || tournamentStatus === 'LOCK_IN') && !activeSeason.challongeUrl) ? (
                                        <div className="flex-1 flex flex-col items-center justify-center min-h-[600px] text-center space-y-6">
                                            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-6xl animate-pulse">🗓️</div>
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Brackets Not Generated</h3>
                                                <p className="text-gray-400 max-w-md mx-auto">The tournament has not started yet. Brackets will be generated once the drafting phase is complete!</p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show Challonge iframe for ONGOING/ENDED seasons
                                        <div className="flex-1 w-full bg-white rounded-3xl overflow-hidden shadow-inner border-[6px] border-[#120507] min-h-[800px]">
                                            <iframe
                                                src={activeSeason.challongeUrl ? `${activeSeason.challongeUrl}/module` : "https://challonge.com/nisamon1/module"}
                                                width="100%"
                                                height="100%"
                                                frameBorder="0"
                                                scrolling="auto"
                                                allowTransparency={true}
                                                className="w-full h-full min-h-[800px]"
                                            ></iframe>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 relative">
                                        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none rounded-3xl"></div>

                                        {apiWinners.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 z-10">
                                                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center text-6xl opacity-50">🏆</div>
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">No Winners Yet</h3>
                                                    <p className="text-gray-400 max-w-md mx-auto">The tournament has not ended yet. Check back later to see who takes the crown!</p>
                                                </div>
                                            </div>
                                        ) : activeSeason.format.includes('Duos') ? (
                                            /* DUOS WINNERS DISPLAY */
                                            <div className="flex flex-col md:flex-row items-end gap-4 md:gap-8 w-full max-w-6xl mx-auto px-4 justify-center">
                                                {/* 2ND PLACE - DUOS */}
                                                {apiWinners.find(w => w.rank === 2) && (() => {
                                                    const winner = apiWinners.find(w => w.rank === 2)!;
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
                                                                <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-40 md:h-56 object-contain filter drop-shadow-2xl grayscale-[0.3]" alt={winner.player2} />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* 1ST PLACE - DUOS */}
                                                {apiWinners.find(w => w.rank === 1) && (() => {
                                                    const winner = apiWinners.find(w => w.rank === 1)!;
                                                    return (
                                                        <div className="order-1 md:order-2 flex flex-col w-full md:w-1/3 -mt-12 z-10">
                                                            <div className="relative flex justify-center mb-6">
                                                                <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                                                <div className="flex gap-2 relative">
                                                                    <img src={`https://mc-heads.net/body/${winner.player1}/right`} className="h-56 md:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]" alt={winner.player1} />
                                                                    <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-56 md:h-72 object-contain filter drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" alt={winner.player2} />
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
                                                                        <span className="text-yellow-400">{winner.player1}</span> <span className="text-white/50">&</span> <span className="text-purple-400">{winner.player2}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full h-3 bg-yellow-900/50 rounded-full overflow-hidden mt-4"><div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-200 animate-pulse"></div></div>
                                                            </div>
                                                            <div className="h-6 bg-[#1a1a1a] mx-4 rounded-b-xl opacity-50 border-t border-white/5"></div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* 3RD PLACE - DUOS */}
                                                {apiWinners.find(w => w.rank === 3) && (() => {
                                                    const winner = apiWinners.find(w => w.rank === 3)!;
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
                                                                        <span className="text-yellow-400">{winner.player1}</span> & <span className="text-purple-400">{winner.player2}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="w-full h-2 bg-orange-900/30 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-orange-600"></div></div>
                                                            </div>
                                                            <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                            <div className="mt-4 flex justify-center gap-2">
                                                                <img src={`https://mc-heads.net/body/${winner.player1}/right`} className="h-36 md:h-48 object-contain filter drop-shadow-2xl grayscale-[0.5]" alt={winner.player1} />
                                                                <img src={`https://mc-heads.net/body/${winner.player2}/left`} className="h-36 md:h-48 object-contain filter drop-shadow-2xl grayscale-[0.5]" alt={winner.player2} />
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            /* SINGLES WINNERS DISPLAY (Original) */
                                            <div className="flex flex-col md:flex-row items-end gap-4 md:gap-8 w-full max-w-5xl mx-auto px-4 justify-center">

                                                {/* 2ND PLACE */}
                                                {winners[1] && (
                                                    <div className="order-2 md:order-1 flex flex-col w-full md:w-1/3">
                                                        <div className="bg-[#2a2a2a] border-t-4 border-slate-300 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-8">
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-slate-300">2</div>
                                                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                                                <div className="relative">
                                                                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.3)]">
                                                                        <span className="font-black text-slate-300 text-xl">2ND</span>
                                                                    </div>
                                                                    <div className="absolute -bottom-2 -right-2 text-2xl">🥈</div>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="text-2xl font-black text-white italic tracking-tighter truncate">{winners[1]}</h3>
                                                                    <p className="text-slate-400 font-mono font-bold">{getPlayerStats(winners[1])}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden"><div className="w-3/4 h-full bg-slate-400"></div></div>
                                                        </div>
                                                        <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>

                                                        <div className="mt-4 flex justify-center">
                                                            <img src={`https://mc-heads.net/body/${winners[1]}/right`} className="h-48 md:h-64 object-contain filter drop-shadow-2xl grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500" alt={winners[1]} />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* 1ST PLACE */}
                                                {winners[0] && (
                                                    <div className="order-1 md:order-2 flex flex-col w-full md:w-1/3 -mt-12 z-10">
                                                        <div className="relative flex justify-center mb-6">
                                                            <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full"></div>
                                                            <img src={`https://mc-heads.net/body/${winners[0]}`} className="h-64 md:h-80 object-contain filter drop-shadow-[0_0_30px_rgba(234,179,8,0.4)] scale-110" alt={winners[0]} />
                                                            <div className="absolute -top-16 animate-bounce">
                                                                <span className="text-6xl filter drop-shadow-lg">👑</span>
                                                            </div>
                                                        </div>

                                                        <div className="bg-[#2a2a2a] border-t-4 border-yellow-400 rounded-t-2xl p-8 relative group overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500/30">
                                                            <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent opacity-50"></div>
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 text-8xl font-black text-yellow-400">1</div>

                                                            <div className="flex items-center gap-5 mb-2 relative z-10">
                                                                <div className="w-20 h-20 rounded-full bg-yellow-900/50 flex items-center justify-center border-2 border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] shrink-0">
                                                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center">
                                                                        <span className="font-black text-yellow-900 text-3xl">1ST</span>
                                                                    </div>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter truncate leading-none mb-1">{winners[0]}</h3>
                                                                    <p className="text-yellow-400 font-mono font-bold text-xl">{getPlayerStats(winners[0])}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-3 bg-yellow-900/50 rounded-full overflow-hidden mt-4"><div className="w-full h-full bg-gradient-to-r from-yellow-500 to-yellow-200 animate-pulse"></div></div>
                                                        </div>
                                                        <div className="h-6 bg-[#1a1a1a] mx-4 rounded-b-xl opacity-50 border-t border-white/5"></div>
                                                    </div>
                                                )}

                                                {/* 3RD PLACE */}
                                                {winners[2] && (
                                                    <div className="order-3 flex flex-col w-full md:w-1/3">
                                                        <div className="bg-[#2a2a2a] border-t-4 border-orange-700/80 rounded-t-2xl p-6 relative group overflow-hidden shadow-2xl mt-16">
                                                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl font-black text-orange-700">3</div>
                                                            <div className="flex items-center gap-4 mb-4 relative z-10">
                                                                <div className="relative">
                                                                    <div className="w-16 h-16 rounded-full bg-orange-900/30 flex items-center justify-center border-2 border-orange-700 shadow-[0_0_15px_rgba(194,65,12,0.3)]">
                                                                        <span className="font-black text-orange-500 text-xl">3RD</span>
                                                                    </div>
                                                                    <div className="absolute -bottom-2 -right-2 text-2xl">🥉</div>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <h3 className="text-2xl font-black text-white italic tracking-tighter truncate">{winners[2]}</h3>

                                                                    <p className="text-orange-500 font-mono font-bold">{getPlayerStats(winners[2])}</p>
                                                                </div>
                                                            </div>
                                                            <div className="w-full h-2 bg-orange-900/30 rounded-full overflow-hidden"><div className="w-1/2 h-full bg-orange-600"></div></div>
                                                        </div>
                                                        <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>

                                                        <div className="mt-4 flex justify-center">
                                                            <img src={`https://mc-heads.net/body/${winners[2]}/left`} className="h-40 md:h-56 object-contain filter drop-shadow-2xl grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500" alt={winners[2]} />
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'players' && (
                            <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Players List</h2>
                                    <div className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">{playersList.length} Registered</div>
                                </div>
                                {loadingPlayers ? (<div className="text-center py-20 animate-spin">⌛</div>) : playersList.length === 0 ? (<div className="text-center py-24 text-gray-600 font-bold italic">No players yet!</div>) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {playersList.map((entry, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => !activeSeason.format.includes('Duos') && setSelectedPlayer(entry)}
                                                className={`bg-white/5 border border-white/10 rounded-3xl p-6 group flex flex-col gap-5 text-left transition-all shadow-md ${!activeSeason.format.includes('Duos') ? 'hover:bg-white/10 hover:border-white/20 cursor-pointer hover:shadow-xl hover:scale-[1.02]' : 'cursor-default opacity-80'}`}
                                            >
                                                <div className={`flex items-center gap-4 ${!activeSeason.format.includes('Duos') ? 'border-b border-white/5 pb-4' : ''} w-full`}>
                                                    <img src={`https://mc-heads.net/avatar/${entry.minecraftUsername}/48`} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt={entry.minecraftUsername} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-black text-white text-xl truncate">{entry.minecraftUsername}</div>
                                                        {activeSeason.format.includes('Duos') ? (() => {
                                                            const userDuo = duos.find(d => d.player1DiscordId === entry.discordId || d.player2DiscordId === entry.discordId);
                                                            let statusLabel = 'Signed Up';
                                                            let statusColor = 'text-blue-400';
                                                            let dotColor = 'bg-blue-500';

                                                            if (userDuo) {
                                                                if (userDuo.isLocked) {
                                                                    statusLabel = 'Locked';
                                                                    statusColor = 'text-green-400';
                                                                    dotColor = 'bg-green-500';
                                                                } else {
                                                                    statusLabel = 'In Duo';
                                                                    statusColor = 'text-amber-400';
                                                                    dotColor = 'bg-amber-500';
                                                                }
                                                            }
                                                            return (
                                                                <div className={`text-[10px] font-black uppercase flex items-center gap-2 ${statusColor}`}>
                                                                    <span className={`w-2 h-2 rounded-full ${dotColor} ${statusLabel === 'In Duo' ? 'animate-pulse' : ''}`}></span>{statusLabel}
                                                                </div>
                                                            );
                                                        })() : (
                                                            <div className={`text-[10px] font-black uppercase flex items-center gap-2 ${entry.isLocked ? 'text-green-400' : 'text-amber-400'}`}><span className={`w-2 h-2 rounded-full ${entry.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>{entry.isLocked ? 'Ready' : 'Drafting'}</div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Only show team placeholders for Singles */}
                                                {!activeSeason.format.includes('Duos') && (
                                                    <div className="grid grid-cols-6 gap-2 w-full">
                                                        {(tournamentStatus === 'ONGOING' || tournamentStatus === 'ENDED') && entry.isLocked ? entry.team.map((p, pIdx) => (<div key={pIdx} className="aspect-square bg-black/40 rounded-2xl border border-white/5 p-1"><PokemonTeamImage pokemon={p!} /></div>)) : Array(6).fill(null).map((_, i) => (<div key={i} className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl opacity-40">?</div>))}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Duos Section - Only for Duos format */}
                                {activeSeason.format.includes('Duos') && duos.length > 0 && (
                                    <div className="mt-12 space-y-6">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                            <h3 className="text-2xl font-black text-purple-400 uppercase tracking-tighter">👥 Duos Teams</h3>
                                            <div className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">{duos.length} Teams</div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {duos.map(duo => (
                                                <button
                                                    key={duo.duoId}
                                                    onClick={() => setSelectedDuo(duo)}
                                                    className="bg-gradient-to-br from-purple-900/20 to-black border border-purple-500/30 rounded-2xl p-5 text-left hover:border-purple-400/50 hover:scale-[1.02] transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="flex -space-x-3">
                                                            {/* Captain avatar first */}
                                                            <img src={`https://mc-heads.net/avatar/${duo.captainDiscordId === duo.player1DiscordId ? duo.player1Username : duo.player2Username}/40`} className="w-10 h-10 rounded-xl border-2 border-yellow-500" />
                                                            <img src={`https://mc-heads.net/avatar/${duo.captainDiscordId === duo.player1DiscordId ? duo.player2Username : duo.player1Username}/40`} className="w-10 h-10 rounded-xl border-2 border-purple-500/50" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            {/* Team Name (if set) */}
                                                            {duo.teamName ? (
                                                                <>
                                                                    <div className="font-black text-purple-400 text-sm truncate">{duo.teamName}</div>
                                                                    <div className="text-[10px] text-gray-400 truncate">
                                                                        {duo.captainDiscordId === duo.player1DiscordId
                                                                            ? `${duo.player1Username} & ${duo.player2Username}`
                                                                            : `${duo.player2Username} & ${duo.player1Username}`}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="font-bold text-white text-sm truncate">
                                                                    {duo.captainDiscordId === duo.player1DiscordId
                                                                        ? `${duo.player1Username} & ${duo.player2Username}`
                                                                        : `${duo.player2Username} & ${duo.player1Username}`}
                                                                </div>
                                                            )}
                                                            <div className={`text-[10px] font-black uppercase ${duo.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                                                {duo.isLocked ? '✓ Locked' : '⏳ Drafting'}
                                                            </div>
                                                        </div>
                                                        <div className="text-white/30 group-hover:text-purple-400 transition-colors text-xl">→</div>
                                                    </div>
                                                    {/* Mini Team Preview - Only show actual Pokemon when locked */}
                                                    <div className="flex gap-1">
                                                        {Array(6).fill(null).map((_, idx) => (
                                                            <div key={idx} className={`w-8 h-8 rounded-lg border ${idx < 3 ? 'border-yellow-500/30' : 'border-purple-500/30'} bg-black/40 flex items-center justify-center`}>
                                                                {duo.isLocked && duo.team && duo.team[idx] ? (
                                                                    <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${duo.team[idx]!.id}.png`} className="w-6 h-6 pixelated" />
                                                                ) : (
                                                                    <span className="text-gray-600 text-xs font-black">?</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'signup' && (
                            <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {!user ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
                                        <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center text-5xl opacity-40">🔒</div>
                                        <div className="space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tighter">Login Required</h2><p className="text-gray-400 max-w-sm mx-auto text-sm">Discord identification required.</p></div>
                                        <UserProfile className="scale-110" />
                                    </div>
                                ) : loadingTeam ? (<div className="text-center py-20">Retrieving...</div>) : !hasStartedRegistration && !isLocked ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center space-y-8">
                                        {tournamentStatus === 'ONGOING' || tournamentStatus === 'ENDED' ? (
                                            <div className="bg-red-900/20 border-2 border-red-500/30 p-12 rounded-[2.5rem] flex flex-col items-center gap-4">
                                                <span className="text-6xl">⛔</span>
                                                <h2 className="text-4xl font-black text-white uppercase italic">Registration Closed</h2>
                                                <p className="text-gray-400">
                                                    {tournamentStatus === 'ENDED'
                                                        ? "The tournament has concluded. Signups are closed for this season."
                                                        : "The tournament has already begun. Signups are no longer available for this season."}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/128`} alt="MC" className="relative w-36 h-36 rounded-[2.5rem] border-4 border-brand-primary bg-black shadow-2xl" />
                                                <div className="space-y-3"><h2 className="text-4xl font-black text-white uppercase tracking-tighter">Hello, <span className="text-brand-primary">{user.minecraftUsername}</span>!</h2><p className="text-gray-400 max-w-lg mx-auto text-base">{activeSeason.format.includes('Duos') ? "Click below to register and wait for your duo to be picked!" : "Click below to register and begin drafting your team!"}</p></div>
                                                <button onClick={handleInitialRegister} className="bg-brand-primary hover:bg-red-600 text-white font-black text-xl py-5 px-12 rounded-[2rem] shadow-xl transition-all transform hover:scale-105 uppercase tracking-widest border-b-4 border-red-800">JOIN TOURNAMENT</button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {/* Duos Logic Check */}
                                        {activeSeason.format.includes('Duos') && (!myDuo || (myDuo.captainDiscordId !== user?.id)) && user?.minecraftUsername !== 'GreatRimu' ? (
                                            <div className="bg-black/40 p-12 rounded-[2.5rem] border border-white/5 mb-8 text-center flex flex-col items-center justify-center min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
                                                {myDuo ? (
                                                    <div className="space-y-6">
                                                        <div className="w-24 h-24 bg-purple-900/30 rounded-full flex items-center justify-center border-2 border-purple-500/30 mx-auto animate-pulse shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                                            <span className="text-5xl">👑</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Team Captain Only</h3>
                                                            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                                                                Your partner <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">{myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player1Username : myDuo.player2Username}</span> is the Team Captain.
                                                                <br />They are responsible for selecting and locking in the team.
                                                            </p>
                                                        </div>

                                                        <div className="mt-12 p-6 bg-black/60 rounded-3xl border border-white/10">
                                                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Current Selection</h4>
                                                            <div className="flex gap-3 justify-center flex-wrap">
                                                                {selectedTeam?.map((poke, i) => (
                                                                    <div key={i} className="w-14 h-14 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative">
                                                                        {poke ? (
                                                                            <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`} className="w-10 h-10 pixelated scale-125" />
                                                                        ) : <div className="w-2 h-2 bg-white/10 rounded-full" />}
                                                                        <div className="absolute -bottom-2 text-[8px] font-mono text-gray-600">{i + 1}</div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <div className="w-24 h-24 bg-yellow-900/20 rounded-full flex items-center justify-center border-2 border-yellow-500/20 mx-auto shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                                                            <span className="text-5xl">⏳</span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Awaiting Duo Pairing</h3>
                                                            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                                                                You are signed up! Admins will pair you with a partner soon.
                                                                <br />Once paired, the Captain will select the team.
                                                            </p>
                                                        </div>
                                                        <div className="pt-8">
                                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 rounded-full border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest">
                                                                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                                                In Queue
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {(isLocked || tournamentStatus === 'ONGOING') && (
                                                    <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2.5rem] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                                        <h3 className="font-black text-green-400 uppercase tracking-widest text-lg">{tournamentStatus === 'ONGOING' ? '⚔️ TOURNAMENT ONGOING' : '🔒 TEAM ROSTER LOCKED'}</h3>
                                                    </div>
                                                )}
                                                {/* Player/Duo Header */}
                                                {activeSeason.format.includes('Duos') && myDuo ? (
                                                    /* Duos Mode: Show both players with captain indicator */
                                                    <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 w-fit mx-auto md:mx-0 shadow-xl">
                                                        <div className="flex -space-x-4">
                                                            {/* Captain avatar first */}
                                                            <img
                                                                src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player1Username : myDuo.player2Username}/64`}
                                                                className="w-16 h-16 rounded-2xl border-4 border-yellow-500 bg-black shadow-lg z-10"
                                                            />
                                                            <img
                                                                src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player2Username : myDuo.player1Username}/64`}
                                                                className="w-16 h-16 rounded-2xl border-4 border-purple-500 bg-black shadow-lg"
                                                            />
                                                        </div>
                                                        <div className="text-left">
                                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                                                {myDuo.captainDiscordId === myDuo.player1DiscordId
                                                                    ? <><span className="text-yellow-400">{myDuo.player1Username}</span> <span className="text-purple-400">&</span> <span className="text-purple-300">{myDuo.player2Username}</span></>
                                                                    : <><span className="text-yellow-400">{myDuo.player2Username}</span> <span className="text-purple-400">&</span> <span className="text-purple-300">{myDuo.player1Username}</span></>
                                                                }
                                                            </h3>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] font-black uppercase text-gray-500">Captain:</span>
                                                                <span className="text-xs font-bold text-yellow-400">
                                                                    {myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player1Username : myDuo.player2Username}
                                                                </span>
                                                            </div>
                                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${myDuo.isLocked || tournamentStatus === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                                                {myDuo.isLocked || tournamentStatus === 'ONGOING' ? 'Ready' : 'Drafting'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Singles Mode: Show single player */
                                                    <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 w-fit mx-auto md:mx-0 shadow-xl">
                                                        <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/64`} alt="Head" className="w-16 h-16 rounded-2xl border-2 border-brand-primary bg-black shadow-lg" />
                                                        <div className="text-left"><h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.minecraftUsername}</h3><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isLocked || tournamentStatus === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{isLocked || tournamentStatus === 'ONGOING' ? 'Ready' : 'Drafting'}</span></div>
                                                    </div>
                                                )}
                                                <div className="space-y-6">
                                                    <h3 className="text-2xl font-black uppercase tracking-tighter px-4">Team Selection</h3>

                                                    {/* Team Name Input for Duos */}
                                                    {activeSeason.format.includes('Duos') && myDuo && myDuo.captainDiscordId === user?.id && !myDuo.isLocked && (
                                                        <div className="px-4">
                                                            <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Team Name</label>
                                                            <input
                                                                type="text"
                                                                value={teamName}
                                                                onChange={(e) => setTeamName(e.target.value)}
                                                                placeholder="Enter your team name..."
                                                                maxLength={30}
                                                                className="w-full bg-black/60 border border-white/10 rounded-2xl py-3 px-6 text-sm font-bold text-white focus:border-brand-primary outline-none"
                                                            />
                                                        </div>
                                                    )}
                                                    {/* Display locked team name */}
                                                    {activeSeason.format.includes('Duos') && myDuo && myDuo.teamName && (
                                                        <div className="px-4 text-center">
                                                            <span className="text-xs font-black uppercase tracking-widest text-gray-500">Team:</span>
                                                            <span className="ml-2 text-lg font-black text-purple-400">{myDuo.teamName}</span>
                                                        </div>
                                                    )}

                                                    {/* Season 2: Legendary Limit Warning */}
                                                    {activeSeason.format.includes('Duos') && legendaryCount > 0 && (
                                                        <div className={`px-4 py-3 rounded-2xl border ${exceedsLegendaryLimit ? 'bg-red-900/30 border-red-500/50' : 'bg-yellow-900/20 border-yellow-500/30'}`}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{exceedsLegendaryLimit ? '⚠️' : '⭐'}</span>
                                                                <div>
                                                                    <div className={`text-sm font-black uppercase ${exceedsLegendaryLimit ? 'text-red-400' : 'text-yellow-400'}`}>
                                                                        {exceedsLegendaryLimit ? 'TOO MANY LEGENDARIES!' : 'Legendary Slot Used'}
                                                                    </div>
                                                                    <div className="text-xs text-gray-400">
                                                                        {exceedsLegendaryLimit
                                                                            ? `You have ${legendaryCount} legendaries. Only 1 is allowed per team.`
                                                                            : `${legendaryCount}/1 legendary selected. No Mythical, Paradox, or Ultra Beasts allowed.`
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Duos Mode: 3+3 Split with Owner Labels */}
                                                    {activeSeason.format.includes('Duos') && myDuo ? (
                                                        <div className="space-y-8">
                                                            {/* Captain's Pokemon (Slots 0-2) */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 px-2">
                                                                    <img src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player1Username : myDuo.player2Username}/32`} className="w-8 h-8 rounded-lg border-2 border-yellow-500" />
                                                                    <span className="text-sm font-black uppercase tracking-widest text-yellow-400">Captain's Pokemon</span>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 px-2">
                                                                    {selectedTeam.slice(0, 3).map((p, idx) => {
                                                                        const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '');
                                                                        const legendary = p !== null && isLegendary(p.id);
                                                                        return (
                                                                            <div key={idx} className={`aspect-square rounded-[2rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 ${p ? (banned ? 'bg-red-900/20 border-red-500' : 'bg-gradient-to-br from-yellow-900/20 to-black/80 border-yellow-500 shadow-2xl scale-[1.03]') : 'bg-black/40 border-yellow-500/30 border-dashed opacity-50'}`}>
                                                                                {p ? (<><div className="w-4/5 h-4/5 relative z-10"><PokemonTeamImage pokemon={p} />{banned && (<div className="absolute inset-0 bg-red-600/30 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-black drop-shadow-lg">✕</span></div>)}</div><div className="absolute bottom-3 left-0 right-0 px-2 z-20"><div className={`text-[8px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white' : 'bg-black/60 text-white border-white/10'}`}>{p.name}</div></div>{banned && <div className="banned-tooltip">RESTRICTED</div>}{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (<button onClick={() => handleRemovePokemon(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white">✕</button>)}</>) : (<span className="text-3xl text-yellow-900 font-black">+</span>)}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Partner's Pokemon (Slots 3-5) */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 px-2">
                                                                    <img src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player2Username : myDuo.player1Username}/32`} className="w-8 h-8 rounded-lg border-2 border-purple-500" />
                                                                    <span className="text-sm font-black uppercase tracking-widest text-purple-400">Partner's Pokemon</span>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-4 px-2">
                                                                    {selectedTeam.slice(3, 6).map((p, idx) => {
                                                                        const actualIdx = idx + 3;
                                                                        const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '');
                                                                        const legendary = p !== null && isLegendary(p.id);
                                                                        return (
                                                                            <div key={actualIdx} className={`aspect-square rounded-[2rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 ${p ? (banned ? 'bg-red-900/20 border-red-500' : 'bg-gradient-to-br from-purple-900/20 to-black/80 border-purple-500 shadow-2xl scale-[1.03]') : 'bg-black/40 border-purple-500/30 border-dashed opacity-50'}`}>
                                                                                {p ? (<><div className="w-4/5 h-4/5 relative z-10"><PokemonTeamImage pokemon={p} />{banned && (<div className="absolute inset-0 bg-red-600/30 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-black drop-shadow-lg">✕</span></div>)}</div><div className="absolute bottom-3 left-0 right-0 px-2 z-20"><div className={`text-[8px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white' : 'bg-black/60 text-white border-white/10'}`}>{p.name}</div></div>{banned && <div className="banned-tooltip">RESTRICTED</div>}{!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (<button onClick={() => handleRemovePokemon(actualIdx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white">✕</button>)}</>) : (<span className="text-3xl text-purple-900 font-black">+</span>)}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Singles Mode: Original 6-slot grid */
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-2">
                                                            {selectedTeam.map((p, idx) => {
                                                                const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '');
                                                                return (
                                                                    <div key={idx} className={`aspect-square rounded-[2rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 ${p ? (banned ? 'bg-red-900/20 border-red-500' : 'bg-gradient-to-br from-brand-primary/10 to-black/80 border-brand-primary shadow-2xl scale-[1.03]') : 'bg-black/40 border-white/5 border-dashed opacity-50'}`}>
                                                                        {p ? (<><div className="w-4/5 h-4/5 relative z-10"><PokemonTeamImage pokemon={p} />{banned && (<div className="absolute inset-0 bg-red-600/30 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-black drop-shadow-lg">✕</span></div>)}</div><div className="absolute bottom-3 left-0 right-0 px-2 z-20"><div className={`text-[8px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white' : 'bg-black/60 text-white border-white/10'}`}>{p.name}</div></div>{banned && <div className="banned-tooltip">RESTRICTED</div>}{!isLocked && tournamentStatus !== 'ONGOING' && (<button onClick={() => handleRemovePokemon(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white">✕</button>)}</>) : (<span className="text-3xl text-gray-800 font-black">+</span>)}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                                {!isLocked && !(activeSeason.format.includes('Duos') && myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                    <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-6 space-y-6 shadow-2xl">
                                                        <div className="flex flex-col md:flex-row gap-6 justify-between items-center"><h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Pokemon Database</h4><input type="text" placeholder="SEARCH..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-80 bg-black/60 border border-white/10 rounded-2xl py-3 px-6 text-sm font-bold text-white focus:border-brand-primary outline-none" /></div>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pokemon-grid pr-2 py-2">
                                                            {loadingPokemon ? (<div>...</div>) : filteredPokemon.map(p => {
                                                                const isSelected = selectedTeam.some(sp => sp?.id === p.id);
                                                                const isFull = !selectedTeam.includes(null);
                                                                const banned = isBannedForSeason(p.id, activeSeason?.format || '');
                                                                return (<button key={p.id} disabled={isSelected || isFull || banned} onClick={() => handleSelectPokemon(p)} className={`aspect-square rounded-2xl flex items-center justify-center p-2 transition-all relative group ${isSelected ? 'bg-brand-primary/20 border-brand-primary border-2 opacity-50' : (isFull || banned) ? 'bg-gray-900 opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:border-brand-primary/50'}`} title={p.name}><div className="w-full h-full relative"><PokemonTeamImage pokemon={p} />{banned && <div className="absolute top-0 right-0 bg-red-600 rounded-full w-3 h-3 border border-black shadow-md flex items-center justify-center text-[8px] font-black">!</div>}</div>{banned && <div className="banned-tooltip">BANNED</div>}</button>);
                                                            })
                                                            }
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Save/Lock Buttons - Check both solo isLocked and duo isLocked */}
                                                {!(activeSeason.format.includes('Duos') ? myDuo?.isLocked : isLocked) && tournamentStatus !== 'ONGOING' && (
                                                    <div className="pt-6 flex flex-col md:flex-row justify-center items-center gap-6">
                                                        <button onClick={handleSaveDraft} disabled={saving || hasBannedPokemon} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 text-white border-b-4 border-white/20 flex-1">{saveStatus === 'success' ? 'SYNCED ✓' : saving ? 'SYNCING...' : 'SAVE DRAFT'}</button>
                                                        {tournamentStatus === 'LOCK_IN' && (
                                                            <button onClick={handleLockIn} disabled={saving || selectedTeam.includes(null) || hasBannedPokemon} className="px-12 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl flex-[2] bg-green-600 hover:bg-green-500 text-white border-green-800 border-b-4">🔒 FINALIZE & LOCK TEAM</button>
                                                        )}
                                                    </div>
                                                )}
                                                {tournamentStatus === 'ONGOING' && !isLocked && hasStartedRegistration && (
                                                    <div className="bg-amber-900/20 border-2 border-amber-500/30 p-8 rounded-[2.5rem] text-center">
                                                        <span className="text-4xl mb-4 block">⌛</span>
                                                        <h3 className="text-2xl font-black text-white uppercase italic mb-2">Phase Expired</h3>
                                                        <p className="text-gray-400">The tournament has already begun. Drafting is closed, and unfinalized teams have been disqualified.</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* PLAYER DETAILS MODAL */}
            {
                selectedPlayer && (
                    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                        <div className="bg-[#120507] w-full max-w-5xl max-h-[90vh] rounded-[3rem] border-2 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">

                            {/* Decorative Header Background */}
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-primary/10 to-transparent pointer-events-none"></div>

                            {/* Modal Header */}
                            <div className="p-8 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 bg-black/20 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full"></div>
                                        <img src={`https://mc-heads.net/avatar/${selectedPlayer.minecraftUsername}/128`} className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] border-4 border-brand-primary shadow-2xl relative z-10" alt={selectedPlayer.minecraftUsername} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 drop-shadow-lg">{selectedPlayer.minecraftUsername}</h2>
                                        <div className={`
                                flex items-center gap-2 px-4 py-1.5 rounded-full w-fit border shadow-lg
                                ${selectedPlayer.isLocked
                                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}
                              `}>
                                            <span className={`w-2 h-2 rounded-full ${selectedPlayer.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                            <span className="text-xs font-black uppercase tracking-widest">{selectedPlayer.isLocked ? 'Ready for Battle' : 'Drafting Phase'}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPlayer(null)}
                                    className="group p-4 rounded-full bg-white/5 hover:bg-red-600 hover:text-white text-gray-400 transition-all duration-300 border border-white/10 hover:border-red-500 hover:rotate-90 hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                                >
                                    <span className="text-2xl leading-none font-bold">✕</span>
                                </button>
                            </div>

                            {/* Modal Content - Team Grid */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar bg-gradient-to-b from-[#0a0a0a] to-[#120507]">
                                <div className="flex items-center gap-4 mb-8">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Active Roster</h3>
                                    <div className="h-px bg-white/10 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                                    {((tournamentStatus === 'ONGOING' || tournamentStatus === 'ENDED') && selectedPlayer.isLocked ? selectedPlayer.team : new Array(6).fill(null)).map((pokemon, idx) => (
                                        <PokemonDetailCard
                                            key={idx}
                                            pokemon={pokemon}
                                            revealed={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* DUO DETAILS MODAL */}
            {selectedDuo && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setSelectedDuo(null)}>
                    <div className="bg-[#120507] w-full max-w-4xl max-h-[90vh] rounded-[3rem] border-2 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.3)] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500" onClick={e => e.stopPropagation()}>

                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-900/30 to-transparent pointer-events-none"></div>

                        {/* Modal Header */}
                        <div className="p-8 border-b border-white/5 relative z-10">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                {/* Player Avatars - Captain first */}
                                <div className="flex -space-x-4">
                                    <img
                                        src={`https://mc-heads.net/avatar/${selectedDuo.captainDiscordId === selectedDuo.player1DiscordId ? selectedDuo.player1Username : selectedDuo.player2Username}/80`}
                                        className="w-20 h-20 rounded-2xl border-4 border-yellow-500 shadow-xl"
                                    />
                                    <img
                                        src={`https://mc-heads.net/avatar/${selectedDuo.captainDiscordId === selectedDuo.player1DiscordId ? selectedDuo.player2Username : selectedDuo.player1Username}/80`}
                                        className="w-20 h-20 rounded-2xl border-4 border-purple-500 shadow-xl"
                                    />
                                </div>
                                <div>
                                    {selectedDuo.teamName && (
                                        <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase tracking-tighter mb-1">{selectedDuo.teamName}</h2>
                                    )}
                                    <div className={`${selectedDuo.teamName ? 'text-lg text-gray-400' : 'text-3xl md:text-4xl text-white'} font-black uppercase tracking-tighter`}>
                                        {selectedDuo.captainDiscordId === selectedDuo.player1DiscordId
                                            ? <>{selectedDuo.player1Username}<span className="text-purple-400"> & </span>{selectedDuo.player2Username}</>
                                            : <>{selectedDuo.player2Username}<span className="text-purple-400"> & </span>{selectedDuo.player1Username}</>
                                        }
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mt-2 ${selectedDuo.isLocked ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                                        <span className={`w-2 h-2 rounded-full ${selectedDuo.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                        <span className="text-xs font-black uppercase tracking-widest">{selectedDuo.isLocked ? 'Roster Finalized' : 'Drafting Phase'}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDuo(null)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-black transition-all">✕</button>
                        </div>

                        {/* Team Display */}
                        <div className="p-8 overflow-y-auto flex-1 space-y-8">
                            {/* Captain's Pokemon */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <img src={`https://mc-heads.net/avatar/${selectedDuo.captainDiscordId === selectedDuo.player1DiscordId ? selectedDuo.player1Username : selectedDuo.player2Username}/32`} className="w-8 h-8 rounded-lg border-2 border-yellow-500" />
                                    <h3 className="text-lg font-black uppercase tracking-widest text-yellow-400">Captain's Pokemon</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {(selectedDuo.team?.slice(0, 3) || [null, null, null]).map((pokemon, idx) => (
                                        <PokemonDetailCard key={idx} pokemon={pokemon} revealed={selectedDuo.isLocked} />
                                    ))}
                                </div>
                            </div>

                            {/* Partner's Pokemon */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <img src={`https://mc-heads.net/avatar/${selectedDuo.captainDiscordId === selectedDuo.player1DiscordId ? selectedDuo.player2Username : selectedDuo.player1Username}/32`} className="w-8 h-8 rounded-lg border-2 border-purple-500" />
                                    <h3 className="text-lg font-black uppercase tracking-widest text-purple-400">Partner's Pokemon</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {(selectedDuo.team?.slice(3, 6) || [null, null, null]).map((pokemon, idx) => (
                                        <PokemonDetailCard key={idx + 3} pokemon={pokemon} revealed={selectedDuo.isLocked} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Tournament;
