
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
const BANNED_IDS = new Set([
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

const isBanned = (id: number) => BANNED_IDS.has(id);

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
    const [activeTab, setActiveTab] = useState<'rules' | 'brackets' | 'signup' | 'players'>('rules');
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
    const [activeSeason, setActiveSeason] = useState<{ seasonId: number; name: string; format: string; status: string; challongeUrl?: string }>({ seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'ENDED' });

    // Players List State
    const [playersList, setPlayersList] = useState<TournamentEntry[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<TournamentEntry | null>(null);

    // Bracket & Winners State
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [apiWinners, setApiWinners] = useState<{ rank: number, username: string, score: string }[]>([]);



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
        console.log("Calculating Winners. API:", apiWinners, "Matches:", matches.length);
        if (apiWinners.length > 0) {
            const sorted = [...apiWinners].sort((a, b) => a.rank - b.rank);
            const w = [null, null, null] as (string | null)[];
            if (sorted[0]) w[0] = sorted[0].username;
            if (sorted[1]) w[1] = sorted[1].username;
            if (sorted[2]) w[2] = sorted[2].username;
            return w;
        }

        if (matches.length === 0) return [];
        const finals = matches.filter(m => m.bracketGroup === 'finals' && m.status === 'COMPLETED');
        console.log("Finals:", finals);

        if (finals.length === 0) {
            const completed = matches.filter(m => m.status === 'COMPLETED');
            if (completed.length === 0) return [];
            const maxRound = Math.max(...completed.map(m => m.round));
            const final = completed.find(m => m.round === maxRound);
            if (final && final.winner) {
                const second = final.winner === final.player1 ? final.player2 : final.player1;
                return [final.winner, second, null];
            }
            return [];
        }

        const grandFinal = finals[finals.length - 1];
        const first = grandFinal.winner;
        const second = grandFinal.winner === grandFinal.player1 ? grandFinal.player2 : grandFinal.player1;

        const losersMatches = matches.filter(m => m.bracketGroup === 'losers' && m.status === 'COMPLETED');
        let third = null;
        if (losersMatches.length > 0) {
            const maxRound = Math.max(...losersMatches.map(m => m.round));
            const losersFinal = losersMatches.find(m => m.round === maxRound);
            if (losersFinal) {
                third = losersFinal.winner === losersFinal.player1 ? losersFinal.player2 : losersFinal.player1;
            }
        }

        return [first, second, third];
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

        fetchPlayers(); // Load players immediately
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
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'brackets') {
            fetch(`${API_BASE_URL}/api/tournament/bracket?seasonId=${activeSeason.seasonId}`)
                .then(res => res.json())
                .then(data => setMatches(data.matches || []))
                .catch(console.error);
        } else if (activeTab === 'players') {
            fetchPlayersForSeason(activeSeason.seasonId);
        }
    }, [activeTab, activeSeason.seasonId]);

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

    const hasBannedPokemon = useMemo(() => {
        return selectedTeam.some(p => p !== null && isBanned(p.id));
    }, [selectedTeam]);

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
                    team: new Array(6).fill(null)
                })
            });

            if (res.ok) {
                setHasStartedRegistration(true);
            } else {
                alert("Registration failed. Please try again.");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setLoadingTeam(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!user || hasBannedPokemon || tournamentStatus === 'ONGOING' || isLocked) return;
        setSaving(true);
        setSaveStatus('idle');
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    minecraftUsername: user.minecraftUsername,
                    team: selectedTeam
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
                body: JSON.stringify({ discordId: user?.id })
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

                    <div className="dock-pill rounded-full p-1 flex items-center gap-1 shadow-xl">
                        {[
                            { id: 'rules', label: 'RULES', icon: '📜' },
                            { id: 'signup', label: 'JOIN', icon: '📝', notify: hasStartedRegistration && !isLocked && tournamentStatus !== 'ONGOING' },
                            { id: 'brackets', label: 'BRACKET', icon: '📊' },
                            { id: 'players', label: 'PLAYERS', icon: '👥' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`
                      relative flex items-center gap-2 px-3 h-full transition-all duration-300 rounded-full
                      ${activeTab === tab.id
                                        ? 'nav-link-active'
                                        : 'text-gray-500 hover:text-white group'}
                    `}
                            >
                                <span className="text-sm md:text-base transition-transform group-hover:scale-110">{tab.icon}</span>
                                <span className="text-[9px] font-black uppercase tracking-[0.05em]">{tab.label}</span>
                                {tab.notify && <div className="absolute top-1 right-1 w-1 h-1 bg-brand-primary rounded-full animate-pulse shadow-[0_0_8px_#e5383b]"></div>}
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
                                                <>Single-elimination bracket of a <span className="text-brand-primary font-black">Singles 4v4</span> showdown where you pick a roster of 6 Pokemon but pick 4 each battle with a <span className="text-brand-accent font-black">level 50 cap</span>!</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <RuleCard title="Restrictions" icon="🚫" color="border-red-500/40 bg-red-900/10">
                                    <div className="space-y-4">
                                        <div><strong className="text-red-300 block mb-1 uppercase text-xs tracking-wider">Banned Gimmicks</strong><ul className="space-y-1 list-disc list-inside text-gray-300 font-bold"><li>Tera</li><li>Z-Move</li><li>Dynamax</li><li>Mega-Evolution</li></ul></div>
                                        <div><strong className="text-orange-300 block mb-1 uppercase text-xs tracking-wider">Pokémon Bans</strong><ul className="space-y-1 font-bold text-orange-200"><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Legendary Pokémon</li><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Mythical Pokémon</li><li className="flex items-center gap-2"><span className="text-red-500">✕</span> No Ultra Beasts</li></ul></div>
                                    </div>
                                </RuleCard>
                                <RuleCard title="Clauses" icon="📜" color="border-blue-500/40 bg-blue-900/10">
                                    <ul className="space-y-2">
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Species Clause</strong><span className="text-gray-400 text-xs">A player cannot have two Pokémon of the same National Pokédex number.</span></li>
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Item Clause</strong><span className="text-gray-400 text-xs">No two Pokémon may hold the same item.</span></li>
                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Sleep Clause</strong><span className="text-gray-400 text-xs">A player cannot put more than one of the opponent's Pokémon to sleep at the same time.</span></li>
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
                                    <div className="flex-1 w-full bg-white rounded-3xl overflow-hidden shadow-inner border-[6px] border-[#120507] min-h-[800px]">
                                        <iframe
                                            src="https://challonge.com/nisamon1/module"
                                            width="100%"
                                            height="100%"
                                            frameBorder="0"
                                            scrolling="auto"
                                            allowTransparency={true}
                                            className="w-full h-full min-h-[800px]"
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-10 relative">


                                        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none rounded-3xl"></div>

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
                                                onClick={() => setSelectedPlayer(entry)}
                                                className="bg-white/5 border border-white/10 rounded-3xl p-6 group flex flex-col gap-5 text-left hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.02]"
                                            >
                                                <div className="flex items-center gap-4 border-b border-white/5 pb-4 w-full">
                                                    <img src={`https://mc-heads.net/avatar/${entry.minecraftUsername}/48`} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt={entry.minecraftUsername} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-black text-white text-xl truncate">{entry.minecraftUsername}</div>
                                                        <div className={`text-[10px] font-black uppercase flex items-center gap-2 ${entry.isLocked ? 'text-green-400' : 'text-amber-400'}`}><span className={`w-2 h-2 rounded-full ${entry.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>{entry.isLocked ? 'Ready' : 'Drafting'}</div>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-6 gap-2 w-full">
                                                    {(tournamentStatus === 'ONGOING' || tournamentStatus === 'ENDED') && entry.isLocked ? entry.team.map((p, pIdx) => (<div key={pIdx} className="aspect-square bg-black/40 rounded-2xl border border-white/5 p-1"><PokemonTeamImage pokemon={p!} /></div>)) : Array(6).fill(null).map((_, i) => (<div key={i} className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl opacity-40">?</div>))}
                                                </div>
                                            </button>
                                        ))}
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
                                                <div className="space-y-3"><h2 className="text-4xl font-black text-white uppercase tracking-tighter">Hello, <span className="text-brand-primary">{user.minecraftUsername}</span>!</h2><p className="text-gray-400 max-w-lg mx-auto text-base">Click below to register and begin drafting your team!</p></div>
                                                <button onClick={handleInitialRegister} className="bg-brand-primary hover:bg-red-600 text-white font-black text-xl py-5 px-12 rounded-[2rem] shadow-xl transition-all transform hover:scale-105 uppercase tracking-widest border-b-4 border-red-800">JOIN TOURNAMENT</button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {(isLocked || tournamentStatus === 'ONGOING') && (
                                            <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2.5rem] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                                <h3 className="font-black text-green-400 uppercase tracking-widest text-lg">{tournamentStatus === 'ONGOING' ? '⚔️ TOURNAMENT ONGOING' : '🛡️ ROSTER SECURED'}</h3>
                                                <p className="text-green-200/60 text-xs">Selection locked and synced with database.</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 w-fit mx-auto md:mx-0 shadow-xl">
                                            <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/64`} alt="Head" className="w-16 h-16 rounded-2xl border-2 border-brand-primary bg-black shadow-lg" />
                                            <div className="text-left"><h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.minecraftUsername}</h3><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isLocked || tournamentStatus === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{isLocked || tournamentStatus === 'ONGOING' ? 'Ready' : 'Drafting'}</span></div>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-black uppercase tracking-tighter px-4">Team Selection</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-2">
                                                {selectedTeam.map((p, idx) => {
                                                    const banned = p !== null && isBanned(p.id);
                                                    return (
                                                        <div key={idx} className={`aspect-square rounded-[2rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 ${p ? (banned ? 'bg-red-900/20 border-red-500' : 'bg-gradient-to-br from-brand-primary/10 to-black/80 border-brand-primary shadow-2xl scale-[1.03]') : 'bg-black/40 border-white/5 border-dashed opacity-50'}`}>
                                                            {p ? (<><div className="w-4/5 h-4/5 relative z-10"><PokemonTeamImage pokemon={p} />{banned && (<div className="absolute inset-0 bg-red-600/30 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-black drop-shadow-lg">✕</span></div>)}</div><div className="absolute bottom-3 left-0 right-0 px-2 z-20"><div className={`text-[8px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white' : 'bg-black/60 text-white border-white/10'}`}>{p.name}</div></div>{banned && <div className="banned-tooltip">RESTRICTED</div>}{!isLocked && tournamentStatus !== 'ONGOING' && (<button onClick={() => handleRemovePokemon(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white">✕</button>)}</>) : (<span className="text-3xl text-gray-800 font-black">+</span>)}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {!isLocked && tournamentStatus !== 'ONGOING' && (
                                            <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-6 space-y-6 shadow-2xl">
                                                <div className="flex flex-col md:flex-row gap-6 justify-between items-center"><h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Pokemon Database</h4><input type="text" placeholder="SEARCH..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-80 bg-black/60 border border-white/10 rounded-2xl py-3 px-6 text-sm font-bold text-white focus:border-brand-primary outline-none" /></div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pokemon-grid pr-2 py-2">
                                                    {loadingPokemon ? (<div>...</div>) : filteredPokemon.map(p => {
                                                        const isSelected = selectedTeam.some(sp => sp?.id === p.id);
                                                        const isFull = !selectedTeam.includes(null);
                                                        const banned = isBanned(p.id);
                                                        return (<button key={p.id} disabled={isSelected || isFull || banned} onClick={() => handleSelectPokemon(p)} className={`aspect-square rounded-2xl flex items-center justify-center p-2 transition-all relative group ${isSelected ? 'bg-brand-primary/20 border-brand-primary border-2 opacity-50' : (isFull || banned) ? 'bg-gray-900 opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:border-brand-primary/50'}`} title={p.name}><div className="w-full h-full relative"><PokemonTeamImage pokemon={p} />{banned && <div className="absolute top-0 right-0 bg-red-600 rounded-full w-3 h-3 border border-black shadow-md flex items-center justify-center text-[8px] font-black">!</div>}</div>{banned && <div className="banned-tooltip">BANNED</div>}</button>);
                                                    })
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        {!isLocked && tournamentStatus !== 'ONGOING' && (
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
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PLAYER DETAILS MODAL */}
            {selectedPlayer && (
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
            )}
        </div>
    );
};

export default Tournament;
