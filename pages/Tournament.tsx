
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
    Trophy, 
    ClipboardList, 
    Users, 
    Crown, 
    Hourglass, 
    Gem, 
    Zap, 
    Sparkles, 
    Check, 
    Lock, 
    Swords, 
    Eye, 
    Save, 
    Trash2, 
    Archive, 
    Package, 
    Ban, 
    Target, 
    Scroll, 
    CircleSlash, 
    Scale, 
    Gamepad2, 
    Skull, 
    Star,
    RefreshCw,
    Activity,
    Flame,
    Briefcase,
    Search,
    AlertTriangle,
    X,
    Plus
} from 'lucide-react';
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
    gimmickType?: 'tera' | 'dynamax' | 'mega' | 'zmove' | null;
    gimmickPokemonId?: number | null;
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
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792,
    793, 794, 795, 796, 797, 798, 799, // UBs
    800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    // Gen 8
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
    // Gen 9 (Treasures of Ruin + Box Legends + DLC Legends/Mythics + Palafin)
    964, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1020, 1021, 1022, 1023, 1024, 1025
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
    1005, // Roaring Moon
    // Future Paradox
    990,  // Iron Treads
    991,  // Iron Bundle
    992,  // Iron Hands
    993,  // Iron Jugulis
    994,  // Iron Moth
    995,  // Iron Thorns
    1006, // Iron Valiant
    // DLC Paradox
    1009, 1010, // Walking Wake, Iron Leaves
    1020, 1021, 1022, 1023 // Gouging Fire, Raging Bolt, Iron Boulder, Iron Crown
]);

// Specific restricted Pokemon (Banned even if their category is allowed)
const RESTRICTED_IDS = new Set([
    964  // Palafin
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
    890,  // Eternatus
    891, 892,  // Kubfu, Urshifu
    894, 895, 896, 897, 898,  // Regieleki, Regidrago, Glastrier, Spectrier, Calyrex
    905,  // Enamorus
    // Gen 9
    1001, 1002, 1003, 1004,  // Treasures of Ruin
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
const isBannedForSeason = (id: number, seasonFormat: string, seasonName?: string, dynamicBannedIds?: number[]): boolean => {
    if (dynamicBannedIds && Array.isArray(dynamicBannedIds) && dynamicBannedIds.includes(id)) {
        return true;
    }
    // Only Palafin is globally banned
    return id === 964;
};

// Check if Pokemon is a legendary (for the 1-per-team limit)
const isLegendary = (id: number): boolean => LEGENDARY_IDS.has(id);

// Season 3 category checks
const isMythical = (id: number): boolean => MYTHICAL_IDS.has(id);
const isParadox = (id: number): boolean => PARADOX_IDS.has(id);
const isUltraBeast = (id: number): boolean => ULTRA_BEAST_IDS.has(id);

// Check if Pokemon requires a Limit Token (Legendary, Mythical, Paradox, or Ultra Beast)
const isLimitTokenPokemon = (id: number): boolean => LEGENDARY_IDS.has(id) || MYTHICAL_IDS.has(id) || PARADOX_IDS.has(id) || ULTRA_BEAST_IDS.has(id);

const getLimitTokenCategory = (id: number): 'Legendary' | 'Mythical' | 'Paradox' | 'Ultra Beast' | null => {
    if (LEGENDARY_IDS.has(id)) return 'Legendary';
    if (MYTHICAL_IDS.has(id)) return 'Mythical';
    if (PARADOX_IDS.has(id)) return 'Paradox';
    if (ULTRA_BEAST_IDS.has(id)) return 'Ultra Beast';
    return null;
};

// Legacy function for backwards compatibility
const isBanned = (id: number) => SEASON1_BANNED_IDS.has(id);

// --- CACHE & HELPERS ---
const clientImageCache = new Map<string, boolean>();

const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .replace(/[.':]/g, '')
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
            if (!pokemon || !pokemon.name) return;
            const cobbleName = getFormattedName(pokemon.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;

            if (clientImageCache.has(primaryUrl)) {
                if (isMounted) {
                    const isValid = clientImageCache.get(primaryUrl)!;
                    setImgSrc(isValid ? primaryUrl : fallback3d);
                }
                return;
            }

            // Test cobblemon image dimension client-side
            const testImg = new Image();
            testImg.onload = () => {
                // Cobblemon placeholder question-mark image is 96x96
                const isValid = testImg.naturalWidth > 96 || testImg.naturalHeight > 96;
                clientImageCache.set(primaryUrl, isValid);
                if (isMounted) {
                    setImgSrc(isValid ? primaryUrl : fallback3d);
                }
            };
            testImg.onerror = () => {
                clientImageCache.set(primaryUrl, false);
                if (isMounted) {
                    setImgSrc(fallback3d);
                }
            };
            testImg.src = primaryUrl;
        };

        verifyImage();

        return () => { isMounted = false; };
    }, [pokemon]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`);
        } else if (imgSrc.includes('official-artwork')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`);
        } else {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`);
        }
    };

    return (
        <OptimizedImage
            src={imgSrc}
            alt={pokemon?.name || 'Pokemon'}
            className={`w-full h-full object-contain ${className}`}
            contain
            onError={handleImageError}
            loading="lazy"
        />
    );
};

interface GimmickBadgeProps {
    type: string;
    className?: string;
}

const GimmickBadge: React.FC<GimmickBadgeProps> = ({ type, className = "w-4 h-4" }) => {
    switch (type?.toLowerCase()) {
        case 'tera':
            return <Gem className={`${className} text-blue-400`} />;
        case 'dynamax':
            return <Activity className={`${className} text-red-500`} />;
        case 'mega':
            return <RefreshCw className={`${className} text-pink-400 animate-spin-slow`} />;
        default:
            return <Zap className={`${className} text-yellow-400`} />;
    }
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

    const category = pokemon ? getLimitTokenCategory(pokemon.id) : null;

    return (
        <div className="aspect-square bg-[#120507] rounded-[2rem] border-2 border-white/10 relative overflow-hidden group shadow-2xl hover:border-brand-primary/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
            
            {/* Restricted Category Tag Top Left */}
            {category && (
                <div className="absolute top-3 left-3 z-30">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 border shadow-sm backdrop-blur-md ${
                        category === 'Legendary' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' :
                        category === 'Mythical' ? 'text-pink-300 bg-pink-500/20 border-pink-500/40' :
                        category === 'Paradox' ? 'text-purple-300 bg-purple-500/20 border-purple-500/40' :
                        'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                    }`}>
                        {category === 'Legendary' && <LegendarySVG className="w-3 h-3 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                        {category === 'Mythical' && <MythicalSVG className="w-3 h-3 text-pink-400 shrink-0" />}
                        {category === 'Paradox' && <ParadoxSVG className="w-3 h-3 text-purple-400 shrink-0" />}
                        {category === 'Ultra Beast' && <UltraBeastSVG className="w-3 h-3 text-cyan-400 shrink-0" />}
                        <span>{category}</span>
                    </span>
                </div>
            )}

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

const LegendarySVG: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-yellow-400 fill-yellow-400/20 shrink-0" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

const MythicalSVG: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-pink-400 shrink-0 animate-pulse" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-.767a.5.5 0 0 1 0-.992l6.135-.767A2 2 0 0 0 9.937 10.1l.767-6.135a.5.5 0 0 1 .992 0l.767 6.135a2 2 0 0 0 1.437 1.437l6.135.767a.5.5 0 0 1 0 .992l-6.135.767a2 2 0 0 0-1.437 1.437l-.767 6.135a.5.5 0 0 1-.992 0z" />
        <path d="M20 3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
        <path d="M4 20a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1z" />
    </svg>
);

const ParadoxSVG: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-purple-400 shrink-0" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.24 3.95A10 10 0 1 0 21.6 13.5" />
        <path d="M14.5 8.5a5 5 0 1 0-5.5 4" />
        <path d="M12.1 11.5a1.5 1.5 0 1 0-.6 1" />
    </svg>
);

const UltraBeastSVG: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-blue-400 shrink-0" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v2a1 1 0 0 0 2 0v-2h6v2a1 1 0 0 0 2 0v-2h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="11" r="1.5" fill="currentColor" />
        <circle cx="15" cy="11" r="1.5" fill="currentColor" />
    </svg>
);

const CoinSVG = () => (
    <svg className="w-5 h-5 text-yellow-500 fill-yellow-500/20 shrink-0 inline align-middle mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="9" y1="12" x2="15" y2="12" />
    </svg>
);

const RosterSVG = () => (
    <svg className="w-5 h-5 text-brand-primary shrink-0 inline align-middle mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const OneSVG = () => (
    <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M12 8v8M10 10h2" />
    </svg>
);

const TwoSVG = () => (
    <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M9 10a2 2 0 0 1 4 0c0 1-1 2-2 3h2v1" />
    </svg>
);

const ThreeSVG = () => (
    <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M9 10h4l-2 2h1a2 2 0 0 1 0 4h-3" />
    </svg>
);

const FourSVG = () => (
    <svg className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <path d="M9 10v2h4V8" />
    </svg>
);

const CheckSVG = () => (
    <svg className="w-4 h-4 text-green-400 inline align-middle shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const BanSVG = () => (
    <svg className="w-4 h-4 text-red-400 inline align-middle shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const RuleCard: React.FC<{ title: string; icon: React.ReactElement; children: React.ReactNode; color?: string; className?: string }> = ({ title, icon, children, color = "border-white/10", className = "" }) => {
    const bgIcon = React.cloneElement(icon, { className: "w-24 h-24 text-inherit opacity-10 pointer-events-none transition-transform duration-300 group-hover:scale-110" });
    const headerIcon = React.cloneElement(icon, { className: "w-6 h-6 text-inherit filter drop-shadow-lg shrink-0" });
    return (
        <div className={`bg-black/40 backdrop-blur-xl rounded-2xl border-2 ${color} p-6 shadow-2xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 h-full flex flex-col justify-start text-gray-400 ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -top-2 -right-2 p-4 pointer-events-none">
                {bgIcon}
            </div>
            <div className="flex items-center gap-3 mb-4 relative z-10 w-full justify-start text-white/90">
                {headerIcon}
                <h3 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm text-left">{title}</h3>
            </div>
            <div className="text-gray-300 text-xs md:text-sm space-y-2 relative z-10 leading-relaxed font-medium text-left w-full">
                {children}
            </div>
        </div>
    );
};

const TournamentBACK: React.FC = () => {
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState<'rules' | 'brackets' | 'signup' | 'players' | 'duos'>('rules');
    const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
    const [loadingPokemon, setLoadingPokemon] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dbCategoryFilter, setDbCategoryFilter] = useState<'ALL' | 'STANDARD' | 'LIMIT_TOKEN' | 'LEGENDARY' | 'MYTHICAL' | 'PARADOX' | 'ULTRA_BEAST'>('ALL');
    const [visibleCount, setVisibleCount] = useState<number>(48);

    // Reset visible count on filter or search query change for lazy loading
    useEffect(() => {
        setVisibleCount(48);
    }, [dbCategoryFilter, searchQuery]);

    // State for Gimmick Selection (Season 3)
    const [selectedGimmick, setSelectedGimmick] = useState<'tera' | 'dynamax' | 'mega' | 'zmove' | null>(null);
    const [gimmickPokemonId, setGimmickPokemonId] = useState<number | null>(null);

    // Team Management State
    const [selectedTeam, setSelectedTeam] = useState<(Pokemon | null)[]>(new Array(6).fill(null));
    const [isLocked, setIsLocked] = useState(false);
    const [hasStartedRegistration, setHasStartedRegistration] = useState(false);
    const [loadingTeam, setLoadingTeam] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showLockConfirmModal, setShowLockConfirmModal] = useState(false);

    // Tournament Config & State
    const [tournamentStatus, setTournamentStatus] = useState<TournamentStatus>('DRAFTING');
    const [bracketView, setBracketView] = useState<'winners' | 'bracket'>('winners');

    // Season State
    const [allSeasons, setAllSeasons] = useState<{
        seasonId: number;
        name: string;
        format: string;
        status: string;
        challongeUrl?: string;
        isArchived?: boolean;
        description?: string;
        rules?: { title: string; icon: string; color: string; content: string }[];
        bannedPokemonIds?: number[];
    }[]>([]);
    const [activeSeason, setActiveSeason] = useState<{
        seasonId: number;
        name: string;
        format: string;
        status: string;
        challongeUrl?: string;
        description?: string;
        rules?: { title: string; icon: string; color: string; content: string }[];
        bannedPokemonIds?: number[];
    }>({ seasonId: 1, name: 'Loading...', format: '', status: 'DRAFTING', challongeUrl: '' });

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


    const myEntry = useMemo(() => {
        return playersList.find(p => p.discordId === user?.id);
    }, [playersList, user?.id]);

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
        return [w1, w2, null] as (string | null)[];
    }, [apiWinners, matches]);

    // Team Validation Counts
    const legendaryCount = selectedTeam.filter(p => p && isLegendary(p.id)).length;
    const mythicalCount = selectedTeam.filter(p => p && isMythical(p.id)).length;
    const paradoxCount = selectedTeam.filter(p => p && isParadox(p.id)).length;
    const ultraBeastCount = selectedTeam.filter(p => p && isUltraBeast(p.id)).length;

    // 1 Limit Token System Counts
    const limitTokenCount = selectedTeam.filter(p => p && isLimitTokenPokemon(p.id)).length;
    const limitTokenPokemon = selectedTeam.find(p => p && isLimitTokenPokemon(p.id));
    const exceedsLimitToken = limitTokenCount > 1;

    const exceedsLegendaryLimit = legendaryCount > 1;
    const exceedsMythicalLimit = mythicalCount > 1;
    const exceedsParadoxLimit = paradoxCount > 1;
    const exceedsUltraBeastLimit = ultraBeastCount > 1;

    // Validation for Season 3 & 1 Limit Token System
    const isSeason3 = activeSeason.name.includes('Season 3');
    const isGimmickValid = !isSeason3 || (selectedGimmick !== null && gimmickPokemonId !== null);
    const hasCategoryViolations = exceedsLimitToken || (isSeason3 && (exceedsLegendaryLimit || exceedsMythicalLimit || exceedsParadoxLimit || exceedsUltraBeastLimit));
    const hasBannedMons = selectedTeam.some(p => p && isBannedForSeason(p.id, activeSeason.format, activeSeason.name, activeSeason.bannedPokemonIds));

    const isEntryLocked = activeSeason.format.includes('Duos') ? myDuo?.isLocked : (myEntry?.isLocked || false);
    const canLockIn = selectedTeam.filter(Boolean).length === 6 && !isEntryLocked && !exceedsLimitToken && !hasCategoryViolations && !hasBannedMons && isGimmickValid;

    useEffect(() => {
        const fetchPokemon = async () => {
            setLoadingPokemon(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/pokemon`);
                if (res.ok) {
                    const data = await res.json();
                    const fixedData = data.map((p: any) => {
                        let name = p.name;
                        if (name.toLowerCase().includes("palafin")) name = "Palafin";
                        if (name.toLowerCase().includes("minior")) name = "Minior";
                        if (name.toLowerCase().includes("aegislash")) name = "Aegislash";
                        if (name.toLowerCase().includes("giratina")) name = "Giratina";
                        if (name.toLowerCase().includes("darmanitan")) name = "Darmanitan";
                        if (name.toLowerCase().includes("basculin")) name = "Basculin";
                        if (name.toLowerCase().includes("keldeo")) name = "Keldeo";
                        if (name.toLowerCase().includes("meloetta")) name = "Meloetta";
                        if (name.toLowerCase().includes("meowstic")) name = "Meowstic";
                        if (name.toLowerCase().includes("pumpkaboo")) name = "Pumpkaboo";
                        if (name.toLowerCase().includes("gourgeist")) name = "Gourgeist";
                        if (name.toLowerCase().includes("oricorio")) name = "Oricorio";
                        if (name.toLowerCase().includes("lycanroc")) name = "Lycanroc";
                        if (name.toLowerCase().includes("wishiwashi")) name = "Wishiwashi";
                        if (name.toLowerCase().includes("mimikyu")) name = "Mimikyu";
                        if (name.toLowerCase().includes("toxtricity")) name = "Toxtricity";
                        if (name.toLowerCase().includes("eiscue")) name = "Eiscue";
                        if (name.toLowerCase().includes("morpeko")) name = "Morpeko";
                        if (name.toLowerCase().includes("urshifu")) name = "Urshifu";
                        if (name.toLowerCase().includes("enamorus")) name = "Enamorus";
                        if (name.toLowerCase().includes("oinkologne")) name = "Oinkologne";
                        if (name.toLowerCase().includes("maushold")) name = "Maushold";
                        if (name.toLowerCase().includes("squawkabilly")) name = "Squawkabilly";
                        if (name.toLowerCase().includes("dudunsparce")) name = "Dudunsparce";
                        if (name.toLowerCase().includes("gimmighoul")) name = "Gimmighoul";
                        if (name.toLowerCase().includes("tatsugiri")) name = "Tatsugiri";
                        if (name.toLowerCase().includes("deoxys")) name = "Deoxys";
                        if (name.toLowerCase().includes("wormadam")) name = "Wormadam";
                        if (name.toLowerCase().includes("shaymin")) name = "Shaymin";
                        if (name.toLowerCase().includes("tornadus")) name = "Tornadus";
                        if (name.toLowerCase().includes("thundurus")) name = "Thundurus";
                        if (name.toLowerCase().includes("landorus")) name = "Landorus";
                        if (name.toLowerCase() === "ho-oh") name = "Ho-Oh";
                        if (name.toLowerCase() === "porygon-z") name = "Porygon-Z";
                        if (name.toLowerCase() === "jangmo-o") name = "Jangmo-o";
                        if (name.toLowerCase() === "hakamo-o") name = "Hakamo-o";
                        if (name.toLowerCase() === "kommo-o") name = "Kommo-o";
                        if (name.toLowerCase() === "type-null") name = "Type: Null";
                        if (name.toLowerCase() === "mr-mime") name = "Mr. Mime";
                        if (name.toLowerCase() === "mr-rime") name = "Mr. Rime";
                        if (name.toLowerCase() === "mime-jr") name = "Mime Jr.";
                        if (name.toLowerCase() === "tapu-koko") name = "Tapu Koko";
                        if (name.toLowerCase() === "tapu-lele") name = "Tapu Lele";
                        if (name.toLowerCase() === "tapu-bulu") name = "Tapu Bulu";
                        if (name.toLowerCase() === "tapu-fini") name = "Tapu Fini";
                        if (name.toLowerCase() === "chi-yu") name = "Chi-Yu";
                        if (name.toLowerCase() === "chien-pao") name = "Chien-Pao";
                        if (name.toLowerCase() === "ting-lu") name = "Ting-Lu";
                        if (name.toLowerCase() === "wo-chien") name = "Wo-Chien";
                        return { ...p, name };
                    });
                    setPokemonList(fixedData);
                }
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
                    // Filter out archived seasons for the main production Tournament page
                    const activeSeasons = seasons.filter((s: any) => !s.isArchived);
                    if (activeSeasons.length > 0) {
                        setAllSeasons(activeSeasons);
                        const active = activeSeasons[0];
                        setActiveSeason(active);
                        setTournamentStatus(active.status || 'DRAFTING');
                    } else {
                        // Fall back to a clean active Season 1
                        const fallbackSeason = { seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING', isArchived: false, challongeUrl: '' };
                        setAllSeasons([fallbackSeason]);
                        setActiveSeason(fallbackSeason);
                        setTournamentStatus('DRAFTING');
                    }
                } else {
                    const fallbackSeason = { seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING', isArchived: false, challongeUrl: '' };
                    setAllSeasons([fallbackSeason]);
                    setActiveSeason(fallbackSeason);
                    setTournamentStatus('DRAFTING');
                }
            })
            .catch(e => {
                console.error("Seasons fetch error", e);
                const fallbackSeason = { seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING', isArchived: false, challongeUrl: '' };
                setAllSeasons([fallbackSeason]);
                setActiveSeason(fallbackSeason);
                setTournamentStatus('DRAFTING');
            });

        // Initial player fetch deferred until season is known
    }, []);

    // Refetch data when season changes
    useEffect(() => {
        if (activeSeason.seasonId) {
            console.log(`🔄 Season changed to ${activeSeason.seasonId}, fetching winners...`);
            setTournamentStatus(activeSeason.status as TournamentStatus);
            fetchPlayersForSeason(activeSeason.seasonId);

            // Clear previous data first
            setMatches([]);
            setApiWinners([]);

            // Always fetch winners for this specific season
            fetch(`${API_BASE_URL}/api/tournament/winners?seasonId=${activeSeason.seasonId}`)
                .then(res => {
                    console.log(`📥 Winners API response for season ${activeSeason.seasonId}:`, res.status);
                    if (!res.ok) return [];
                    return res.json();
                })
                .then(data => {
                    console.log(`📦 Winners data for season ${activeSeason.seasonId}:`, data);
                    if (Array.isArray(data)) setApiWinners(data);
                })
                .catch(err => {
                    console.error("Failed to fetch winners", err);
                    setApiWinners([]);
                });

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
            // Winners are already fetched by the season change useEffect above
            // Only refetch if needed when switching TO brackets tab
            if (apiWinners.length === 0 && activeSeason.seasonId) {
                console.log(`🔁 Brackets tab opened, refetching winners for season ${activeSeason.seasonId}`);
                fetch(`${API_BASE_URL}/api/tournament/winners?seasonId=${activeSeason.seasonId}`)
                    .then(res => res.ok ? res.json() : [])
                    .then(data => setApiWinners(Array.isArray(data) ? data : []))
                    .catch(() => setApiWinners([]));
            }
        } else if (activeTab === 'players') {
            fetchPlayersForSeason(activeSeason.seasonId);
            if (activeSeason.format.includes('Duos')) fetchDuosForSeason(activeSeason.seasonId);
        } else if (activeTab === 'duos') {
            fetchDuosForSeason(activeSeason.seasonId);
        }
    }, [activeTab]);

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

                    // Season 3: Load gimmick choice
                    if (data.gimmickType) setSelectedGimmick(data.gimmickType);
                    if (data.gimmickPokemonId) setGimmickPokemonId(data.gimmickPokemonId);

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

    const allFilteredPokemon = useMemo(() => {
        let list = pokemonList;

        if (dbCategoryFilter === 'STANDARD') {
            list = list.filter(p => !isLimitTokenPokemon(p.id));
        } else if (dbCategoryFilter === 'LIMIT_TOKEN') {
            list = list.filter(p => isLimitTokenPokemon(p.id));
        } else if (dbCategoryFilter === 'LEGENDARY') {
            list = list.filter(p => isLegendary(p.id));
        } else if (dbCategoryFilter === 'MYTHICAL') {
            list = list.filter(p => isMythical(p.id));
        } else if (dbCategoryFilter === 'PARADOX') {
            list = list.filter(p => isParadox(p.id));
        } else if (dbCategoryFilter === 'ULTRA_BEAST') {
            list = list.filter(p => isUltraBeast(p.id));
        }

        if (!searchQuery) return list;

        const q = searchQuery.toLowerCase().trim();
        return list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.id.toString() === q ||
            p.id.toString().padStart(3, '0') === q
        );
    }, [pokemonList, searchQuery, dbCategoryFilter]);

    const displayedPokemon = useMemo(() => {
        return allFilteredPokemon.slice(0, visibleCount);
    }, [allFilteredPokemon, visibleCount]);

    const handleGridScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop - clientHeight < 200) {
            setVisibleCount(prev => Math.min(prev + 48, allFilteredPokemon.length));
        }
    };

    const handleSelectPokemon = (pokemon: Pokemon) => {
        if (isLocked || tournamentStatus === 'ONGOING') return;

        // Check 1 Limit Token rule
        if (isLimitTokenPokemon(pokemon.id) && limitTokenCount >= 1) {
            const currentCat = getLimitTokenCategory(limitTokenPokemon?.id || 0) || 'Restricted';
            alert(`🚫 1 Limit Token Limit Reached!\n\nYou already have ${limitTokenPokemon?.name} (${currentCat}) in your roster. Remove it first to draft another restricted Pokémon.`);
            return;
        }

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
        return selectedTeam.some(p => p !== null && isBannedForSeason(p.id, activeSeason?.format || '', activeSeason?.name, activeSeason?.bannedPokemonIds));
    }, [selectedTeam, activeSeason]);

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
        if (!user || hasBannedPokemon || exceedsLimitToken || tournamentStatus === 'ONGOING') return;

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
                    seasonId: activeSeason.seasonId,
                    gimmickType: activeSeason.name.includes('Season 3') ? selectedGimmick : null,
                    gimmickPokemonId: activeSeason.name.includes('Season 3') ? gimmickPokemonId : null
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

    const handleLockInClick = () => {
        if (tournamentStatus !== 'LOCK_IN') return;

        // Validation pre-checks
        if (activeSeason.format.includes('Duos') && myDuo) {
            if (myDuo.captainDiscordId !== user?.id) return; // Only captain
            if (selectedTeam.filter(p => p !== null).length < 6) {
                alert("Team must have 6 Pokemon to lock!");
                return;
            }
        } else {
            if (selectedTeam.filter(p => p !== null).length < 1) {
                alert("You cannot lock an empty team!");
                return;
            }
        }

        setShowLockConfirmModal(true);
    };

    const handleConfirmLockIn = async () => {
        setShowLockConfirmModal(false);
        if (tournamentStatus !== 'LOCK_IN') return;

        // For Duos mode
        if (activeSeason.format.includes('Duos') && myDuo) {
            if (myDuo.captainDiscordId !== user?.id) return;
            if (selectedTeam.filter(p => p !== null).length < 6) return;

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

        // Singles mode
        if (selectedTeam.filter(p => p !== null).length < 1) return;

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
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none text-brand-primary">
                                            <Trophy className="w-28 h-28" strokeWidth={1} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Official Format</h2>
                                        <p className="text-lg text-gray-200 leading-relaxed max-w-4xl">
                                            {activeSeason.description ? (
                                                <span dangerouslySetInnerHTML={{ __html: activeSeason.description.replace(/\n/g, '<br />') }} />
                                            ) : activeSeason.format.includes('Duos') || activeSeason.name.includes('Season 2') ? (
                                                <>Double-elimination bracket of a <span className="text-brand-primary font-black">Duos 2v2</span> showdown where you get picked a DUO with someone else and each pick 3 Pokemon to form a full team of 6 Pokemon with a <span className="text-brand-accent font-black">level 50 cap</span>!</>
                                            ) : activeSeason.name.includes('Season 3') ? (
                                                <>Double-elimination bracket of a <span className="text-brand-primary font-black">Singles 4v4</span> ALL-OUT showdown! Pick a roster of 6 Pokemon, choose 4 each battle. <span className="text-brand-accent font-black">Level 50 cap</span>. <span className="text-yellow-400 font-black">All Gimmicks Allowed!</span></>
                                            ) : (
                                                <>Double-elimination bracket of a <span className="text-brand-primary font-black">Singles 4v4</span> showdown where you pick a roster of 6 Pokemon but pick 4 each battle with a <span className="text-brand-accent font-black">level 50 cap</span>!</>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                        {/* SEASON 3 SPECIFIC RULES */}
                                        {activeSeason.name.includes('Season 3') ? (
                                            <>
                                                <RuleCard title="Party Limits" icon={<Zap />} color="border-yellow-500/40 bg-yellow-900/10">
                                                    <div className="space-y-3">
                                                        <div className="text-center py-2 bg-yellow-500/20 rounded-xl border border-yellow-500/30 mb-3">
                                                            <span className="text-yellow-400 font-black text-sm uppercase tracking-wider">All-Out Rules</span>
                                                        </div>
                                                        <ul className="space-y-2 font-bold">
                                                            <li className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400 shrink-0" /> <span className="text-yellow-200">1 Legendary</span> allowed per party</li>
                                                            <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-pink-400 fill-pink-400 shrink-0" /> <span className="text-pink-200">1 Mythical</span> allowed per party</li>
                                                            <li className="flex items-center gap-2"><Activity className="w-4 h-4 text-purple-400 shrink-0" /> <span className="text-purple-200">1 Paradox</span> allowed per party</li>
                                                            <li className="flex items-center gap-2"><Skull className="w-4 h-4 text-blue-400 shrink-0" /> <span className="text-blue-200">1 Ultra Beast</span> allowed per party</li>
                                                        </ul>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Gimmick Rules" icon={<Flame />} color="border-orange-500/40 bg-orange-900/10">
                                                    <div className="space-y-3">
                                                        <div className="text-center py-2 bg-green-500/20 rounded-xl border border-green-500/30 mb-3">
                                                            <span className="text-green-400 font-black text-sm uppercase tracking-wider">All Gimmicks Allowed!</span>
                                                        </div>
                                                        <ul className="space-y-2">
                                                            <li><strong className="text-orange-400 block mb-0.5 text-sm uppercase tracking-wide">One Gimmick Per Roster</strong><span className="text-gray-400 text-xs">You can only use ONE type of gimmick in your entire party. Cannot mix Mega + Dynamax, etc.</span></li>
                                                            <li><strong className="text-orange-400 block mb-0.5 text-sm uppercase tracking-wide">Dynamax Restriction</strong><span className="text-gray-400 text-xs">Only <span className="text-white font-bold">Standard Pokémon</span> can Dynamax. Legendaries, Mythicals, Paradox, and Ultra Beasts are <span className="text-red-400 font-bold">BANNED</span> from Dynamaxing.</span></li>
                                                            <li><strong className="text-orange-400 block mb-0.5 text-sm uppercase tracking-wide">Shedinja Tera Ban</strong><span className="text-gray-400 text-xs">Shedinja is <span className="text-red-400 font-bold">BANNED</span> from using Tera.</span></li>
                                                        </ul>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Banned Pokémon" icon={<Ban />} color="border-red-500/40 bg-red-900/10">
                                                    <ul className="space-y-2 font-bold text-red-200">
                                                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Mega Rayquaza</li>
                                                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Zacian Crowned</li>
                                                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Ultra Necrozma</li>
                                                        <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Eternatus</li>
                                                    </ul>
                                                </RuleCard>
                                                <RuleCard title="Match Banning System" icon={<Target />} color="border-cyan-500/40 bg-cyan-900/10">
                                                    <div className="space-y-3">
                                                        <div className="text-center py-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30 mb-2">
                                                            <span className="text-cyan-400 font-black text-xs uppercase tracking-wider">Pre-Match Ban Phase</span>
                                                        </div>
                                                        <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-medium bg-black/30 border border-cyan-500/20 p-3.5 rounded-xl">
                                                            Before the match starts players will have 5 minutes to check out each others team. Then when the match starts during the team preview, they will be able to ban the pokemon and pick the 4 they will send out!
                                                        </p>
                                                        <p className="text-gray-400 text-xs border-t border-white/10 pt-2 flex items-center gap-1.5 font-medium">
                                                            <RosterSVG />
                                                            <span>Rosters visible 5-10 minutes before tournament starts after lock-ins!</span>
                                                        </p>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Clauses" icon={<Scroll />} color="border-blue-500/40 bg-blue-900/10">
                                                    <ul className="space-y-2">
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Species Clause</strong><span className="text-gray-400 text-xs">A team cannot have two Pokémon of the same National Pokédex number.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Item Clause</strong><span className="text-gray-400 text-xs">No two Pokémon may hold the same item on the same team.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Sleep Clause</strong><span className="text-gray-400 text-xs">A team cannot put more than one of the opponent's Pokémon to sleep at the same time.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Endless Battle Clause</strong><span className="text-gray-400 text-xs">Players cannot intentionally create a situation where the battle cannot end.</span></li>
                                                    </ul>
                                                </RuleCard>
                                                <RuleCard title="Move & Ability Bans" icon={<CircleSlash />} color="border-purple-500/40 bg-purple-900/10">
                                                    <div className="space-y-3">
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Evasion Clause</strong><span className="text-gray-400 text-xs">Moves that specifically raise evasion (Double Team, Minimize) are banned.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">OHKO Clause</strong><span className="text-gray-400 text-xs">One-Hit KO moves (Guillotine, Horn Drill, Sheer Cold, Fissure) are banned.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Moody Ability</strong><span className="text-gray-400 text-xs">This ability is banned.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Other Bans</strong><span className="text-gray-400 text-xs font-mono text-purple-200">Revival Blessing, Arena Trap, Power Construct, Shadow Tag, Baton Pass, Assist, Last Respects, Shed Tail</span></div>
                                                    </div>
                                                </RuleCard>
                                            </>
                                        ) : (
                                            /* SEASON 1 & 2 ORIGINAL RULES */
                                            <>
                                                <RuleCard title="Restrictions" icon={<Ban />} color="border-red-500/40 bg-red-900/10">
                                                    <div className="space-y-4">
                                                        <div className="space-y-2">
                                                            <div className="bg-green-500/10 border-2 border-green-500/30 p-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-green-950/20">
                                                                <div className="bg-green-500/20 p-2 rounded-xl border border-green-400/30 shrink-0">
                                                                    <CheckSVG />
                                                                </div>
                                                                <div>
                                                                    <div className="uppercase tracking-widest text-[9px] font-black text-green-400">Allowed Gimmicks</div>
                                                                    <div className="text-sm font-black text-green-100">Mega & Z-Moves</div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-red-500/10 border-2 border-red-500/30 p-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-950/20">
                                                                <div className="bg-red-500/20 p-2 rounded-xl border border-red-400/30 shrink-0">
                                                                    <BanSVG />
                                                                </div>
                                                                <div>
                                                                    <div className="uppercase tracking-widest text-[9px] font-black text-red-400">Banned Gimmicks</div>
                                                                    <div className="text-sm font-black text-red-100">Dynamax & Tera</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <strong className="text-orange-300 block mb-1.5 uppercase text-xs tracking-wider font-extrabold">Banned Pokémon</strong>
                                                            <ul className="space-y-1 font-bold text-orange-200">
                                                                <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Mega Rayquaza</li>
                                                                <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Zacian Crowned</li>
                                                                <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Ultra Necrozma</li>
                                                                <li className="flex items-center gap-2"><span className="text-red-500">✕</span> Palafin</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Party Limits" icon={<Zap className="text-yellow-400" />} color="border-yellow-500/40 bg-yellow-900/10">
                                                    <div className="space-y-3">
                                                        <div className="text-center py-2 bg-yellow-500/15 rounded-xl border border-yellow-500/30 mb-2">
                                                            <span className="text-yellow-400 font-black text-xs uppercase tracking-wider">ONLY 1 ALLOWED IN PARTY FROM:</span>
                                                        </div>
                                                        <ul className="space-y-2 font-bold">
                                                            <li className="flex items-center gap-2"><LegendarySVG /> <span className="text-yellow-200">Legendary</span></li>
                                                            <li className="flex items-center gap-2"><MythicalSVG /> <span className="text-pink-200">Mythical</span></li>
                                                            <li className="flex items-center gap-2"><ParadoxSVG /> <span className="text-purple-200">Paradox</span></li>
                                                            <li className="flex items-center gap-2"><UltraBeastSVG /> <span className="text-blue-200">Ultra Beast</span></li>
                                                        </ul>
                                                        <div className="mt-3 pt-3 border-t border-yellow-500/20 text-xs text-yellow-100 bg-yellow-950/20 p-2.5 rounded-xl border border-yellow-500/10 flex gap-2">
                                                            <svg className="w-5 h-5 text-yellow-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <circle cx="12" cy="12" r="10" />
                                                                <line x1="12" y1="16" x2="12" y2="12" />
                                                                <line x1="12" y1="8" x2="12.01" y2="8" />
                                                            </svg>
                                                            <span>You will get <strong>1 Limit Token</strong> when you sign up your team that will allow you to put in 1 legendary, mythical, paradox or ultra beast pokemon!</span>
                                                        </div>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Match Banning System" icon={<Target />} color="border-cyan-500/40 bg-cyan-900/10">
                                                    <div className="space-y-3">
                                                        <div className="text-center py-2 bg-cyan-500/20 rounded-xl border border-cyan-500/30 mb-2">
                                                            <span className="text-cyan-400 font-black text-xs uppercase tracking-wider">Pre-Match Ban Phase</span>
                                                        </div>
                                                        <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-medium bg-black/30 border border-cyan-500/20 p-3.5 rounded-xl">
                                                            Before the match starts players will have 5 minutes to check out each others team. Then when the match starts during the team preview, they will be able to ban the pokemon and pick the 4 they will send out!
                                                        </p>
                                                        <p className="text-gray-400 text-xs border-t border-white/10 pt-2 flex items-center gap-1.5 font-medium">
                                                            <RosterSVG />
                                                            <span>Rosters visible 5-10 minutes before tournament starts after lock-ins!</span>
                                                        </p>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Clauses" icon={<Scroll />} color="border-blue-500/40 bg-blue-900/10">
                                                    <ul className="space-y-2">
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Species Clause</strong><span className="text-gray-400 text-xs">A team cannot have two Pokémon of the same National Pokédex number.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Item Clause</strong><span className="text-gray-400 text-xs">No two Pokémon may hold the same item on the same team.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Sleep Clause</strong><span className="text-gray-400 text-xs">A team cannot put more than one of the opponent's Pokémon to sleep at the same time.</span></li>
                                                        <li><strong className="text-blue-400 block mb-0.5 text-sm uppercase tracking-wide">Endless Battle Clause</strong><span className="text-gray-400 text-xs">Players cannot intentionally create a situation where the battle cannot end.</span></li>
                                                    </ul>
                                                </RuleCard>
                                                <RuleCard title="Move Bans" icon={<CircleSlash />} color="border-purple-500/40 bg-purple-900/10">
                                                    <div className="space-y-3">
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Evasion Clause</strong><span className="text-gray-400 text-xs">Moves that specifically raise evasion (like Double Team or Minimize) are banned.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">OHKO Clause</strong><span className="text-gray-400 text-xs">Moves that cause a "One-Hit Knockout" regardless of HP (Guillotine, Horn Drill, Sheer Cold, Fissure) are banned.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Moody Ability</strong><span className="text-gray-400 text-xs">This ability is banned. Its random stat boosts are too RNG-dependent.</span></div>
                                                        <div><strong className="text-purple-400 block mb-0.5 text-sm uppercase tracking-wide">Other Restrictions</strong><span className="text-gray-400 text-xs font-mono text-purple-200">Revival Blessing, Arena Trap, Power Construct, Shadow Tag, Baton Pass, Assist, Last Respects, Shed Tail</span></div>
                                                    </div>
                                                </RuleCard>
                                                <RuleCard title="Item Bans" icon={<Briefcase />} color="border-pink-500/40 bg-pink-900/10">
                                                    <div className="space-y-3">
                                                        <p className="text-xs text-pink-300/80 font-medium">Items banned from competitive play:</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {['Bright Powder', 'Lax Incense', "King's Rock", 'Razor Fang', 'Quick Claw'].map((item) => (
                                                                <div key={item} className="bg-pink-950/40 border border-pink-500/20 p-2.5 rounded-xl text-pink-200 text-xs font-bold flex items-center gap-2 shadow-sm">
                                                                    <span className="text-red-400 font-extrabold text-sm">✕</span>
                                                                    <span>{item}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </RuleCard>
                                            </>
                                        )}

                                        {/* COMMON RULES FOR ALL SEASONS */}
                                        {activeSeason.name.includes('Season 3') && (
                                            <RuleCard title="Item Bans" icon={<Briefcase />} color="border-pink-500/40 bg-pink-900/10">
                                                <div className="space-y-3">
                                                    <p className="text-xs text-pink-300/80 font-medium">Items banned from competitive play:</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {['Bright Powder', 'Lax Incense', "King's Rock", 'Razor Fang', 'Quick Claw'].map((item) => (
                                                            <div key={item} className="bg-pink-950/40 border border-pink-500/20 p-2.5 rounded-xl text-pink-200 text-xs font-bold flex items-center gap-2 shadow-sm">
                                                                <span className="text-red-400 font-extrabold text-sm">✕</span>
                                                                <span>{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </RuleCard>
                                        )}
                                        <RuleCard title="General Rules" icon={<Scale />} className={!activeSeason.name.includes('Season 3') ? "lg:col-span-2" : ""}>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                                                <li className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-white/5"><span className="text-red-500 font-bold text-lg leading-none shrink-0">•</span><span>Break any rule = <span className="text-red-400 font-bold">Instant Disqualification</span>.</span></li>
                                                <li className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-white/5"><span className="text-brand-primary font-bold text-lg leading-none shrink-0">•</span><span>No intentional stalling or disconnect abuse.</span></li>
                                                <li className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-white/5"><span className="text-brand-primary font-bold text-lg leading-none shrink-0">•</span><span>Valid disconnect? Restart match <strong className="text-white">WITH SAME TEAM</strong>.</span></li>
                                                <li className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-white/5"><span className="text-brand-primary font-bold text-lg leading-none shrink-0">•</span><span>Report matches within <strong className="text-white">10 minutes</strong>.</span></li>
                                                <li className="flex gap-2.5 items-start bg-black/20 p-2.5 rounded-xl border border-white/5 md:col-span-2"><span className="text-brand-primary font-bold text-lg leading-none shrink-0">•</span><strong className="text-white font-bold uppercase tracking-wider">Admin decisions are final.</strong></li>
                                            </ul>
                                        </RuleCard>
                                        <RuleCard title="Spectator Rules" icon={<Eye />} color="border-green-500/40 bg-green-900/10">
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
                                        <Users className="w-12 h-12 text-[#ff007f] mb-4 opacity-80 animate-pulse" strokeWidth={1.5} />
                                        <h3 className="text-xl font-bold text-white mb-2">No Duos Yet</h3>
                                        <p className="text-gray-400">Admins will pair signed-up players into duos soon!</p>
                                    </div>
                                ) : duos.map(duo => (
                                    <div key={duo.duoId} className="bg-gradient-to-br from-purple-900/30 to-black/80 border border-purple-500/20 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
                                        <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none group-hover:scale-110 transition-transform text-white">
                                            <Users className="w-16 h-16" strokeWidth={1} />
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex -space-x-3">
                                                <img src={`https://mc-heads.net/avatar/${duo.player1Username}/48`} className={`w-12 h-12 rounded-xl border-2 ${duo.captainDiscordId === duo.player1DiscordId ? 'border-yellow-500 z-10' : 'border-white/10'}`} />
                                                <img src={`https://mc-heads.net/avatar/${duo.player2Username}/48`} className={`w-12 h-12 rounded-xl border-2 ${duo.captainDiscordId === duo.player2DiscordId ? 'border-yellow-500 z-10' : 'border-white/10'}`} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold flex items-center gap-2 text-sm">
                                                    {duo.player1Username} & {duo.player2Username}
                                                </div>
                                                <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${duo.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {duo.isLocked ? (
                                                        <><Check className="w-3.5 h-3.5" /> Ready for Battle</>
                                                    ) : (
                                                        <><Hourglass className="w-3.5 h-3.5 animate-spin-slow" /> Drafting Team</>
                                                    )}
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
                                            <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary animate-pulse">
                                                <Hourglass className="w-12 h-12" />
                                            </div>
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
                                                <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center text-yellow-500 opacity-60">
                                                    <Trophy className="w-12 h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">No Winners Yet</h3>
                                                    <p className="text-gray-400 max-w-md mx-auto">The tournament has not ended yet. Check back later to see who takes the crown!</p>
                                                </div>
                                            </div>
                                        ) : apiWinners[0]?.player2 ? (
                                            /* DUOS WINNERS DISPLAY - only if data has player2 field */
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
                                                                            <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] rounded-full p-1 border border-slate-400 shadow-md text-slate-300">
                                                                                <Trophy className="w-4 h-4" />
                                                                            </div>
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
                                                                <div className="h-4 bg-slate-900 mx-4 rounded-b-xl opacity-50"></div>
                                                            </div>
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
                                                                    <Crown className="w-16 h-16 text-yellow-400 filter drop-shadow-lg" strokeWidth={1.5} />
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
                                                                            <div className="absolute -bottom-1 -right-1 bg-[#1a1a1a] rounded-full p-1 border border-orange-700 shadow-md text-orange-500">
                                                                                <Trophy className="w-4 h-4" />
                                                                            </div>
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
                                                                     <div className="absolute -bottom-2 -right-2 bg-[#1a1a1a] rounded-full p-1.5 border border-slate-400 shadow-md text-slate-300">
                                                                         <Trophy className="w-5 h-5" />
                                                                     </div>
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
                                                                <Crown className="w-16 h-16 text-yellow-400 filter drop-shadow-lg" strokeWidth={1.5} />
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
                                                                    <div className="absolute -bottom-2 -right-2 bg-[#1a1a1a] rounded-full p-1.5 border border-orange-700 shadow-md text-orange-500">
                                                                        <Trophy className="w-5 h-5" />
                                                                    </div>
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
                                {loadingPlayers ? (
                                    <div className="text-center py-20 flex justify-center">
                                        <Hourglass className="w-8 h-8 text-purple-500 animate-spin" />
                                    </div>
                                ) : playersList.length === 0 ? (<div className="text-center py-24 text-gray-600 font-bold italic">No players yet!</div>) : (
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
                                                        {entry.isLocked ? entry.team.map((p, pIdx) => {
                                                            if (!p) return <div key={pIdx} className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl opacity-40">?</div>;
                                                            const category = getLimitTokenCategory(p.id);
                                                            return (
                                                                <div key={pIdx} className="aspect-square bg-black/40 rounded-2xl border border-white/5 p-1 relative overflow-hidden group">
                                                                    {category && (
                                                                        <div className="absolute top-1 left-1 z-20">
                                                                            <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded flex items-center gap-0.5 border shadow-sm backdrop-blur-xs ${
                                                                                category === 'Legendary' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' :
                                                                                category === 'Mythical' ? 'text-pink-300 bg-pink-500/20 border-pink-500/40' :
                                                                                category === 'Paradox' ? 'text-purple-300 bg-purple-500/20 border-purple-500/40' :
                                                                                'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                                                                            }`}>
                                                                                {category === 'Legendary' && <LegendarySVG className="w-2 h-2 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                                                                {category === 'Mythical' && <MythicalSVG className="w-2 h-2 text-pink-400 shrink-0" />}
                                                                                {category === 'Paradox' && <ParadoxSVG className="w-2 h-2 text-purple-400 shrink-0" />}
                                                                                {category === 'Ultra Beast' && <UltraBeastSVG className="w-2 h-2 text-cyan-400 shrink-0" />}
                                                                                <span className="hidden xl:inline">{category === 'Ultra Beast' ? 'UB' : category}</span>
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <PokemonTeamImage pokemon={p} />
                                                                </div>
                                                            );
                                                        }) : Array(6).fill(null).map((_, i) => (<div key={i} className="aspect-square bg-black/40 rounded-2xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl opacity-40">?</div>))}
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
                                            <div className="flex items-center gap-3">
                                                <Users className="w-6 h-6 text-purple-400" />
                                                <h3 className="text-2xl font-black text-purple-400 uppercase tracking-tighter">Duos Teams</h3>
                                            </div>
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
                                                            <div className={`text-[10px] font-black uppercase flex items-center gap-1 mt-1 ${duo.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                                                {duo.isLocked ? (
                                                                    <>
                                                                        <Check className="w-3.5 h-3.5 text-green-400" /> Locked
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Drafting
                                                                    </>
                                                                )}
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
                                                    <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2.5rem] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)] flex items-center justify-center gap-3">
                                                        <Lock className="w-5 h-5 text-green-400 shrink-0" />
                                                        <h3 className="font-black text-green-400 uppercase tracking-widest text-lg">
                                                            {tournamentStatus === 'ONGOING' ? 'TOURNAMENT ONGOING' : 'TEAM ROSTER LOCKED'}
                                                        </h3>
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
                                                            <h3 className="text-2xl font-black text-white tracking-tight">
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
                                                        <div className="text-left"><h3 className="text-2xl font-black text-white tracking-tight">{user.minecraftUsername}</h3><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isLocked || tournamentStatus === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{isLocked || tournamentStatus === 'ONGOING' ? 'Ready' : 'Drafting'}</span></div>
                                                    </div>
                                                )}
                                                <div className="space-y-6">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                                                        <div>
                                                            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Team Roster Draft</h3>
                                                            <p className="text-xs text-gray-400">Select 6 Pokémon to build your tournament battle party.</p>
                                                        </div>
                                                    </div>

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

                                                    {/* 1 Limit Token System Tracker Banner */}
                                                    <div className="bg-gradient-to-br from-amber-950/40 via-black to-yellow-950/20 p-6 md:p-8 rounded-[2.5rem] border-2 border-yellow-500/30 shadow-2xl relative overflow-hidden space-y-6">
                                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

                                                        {/* Top Header & Token Status */}
                                                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 pb-5 border-b border-white/10 relative z-10">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 shrink-0 mt-0.5">
                                                                    <Zap className="w-6 h-6 fill-black" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <h4 className="text-lg font-black text-white uppercase tracking-wider">1 Limit Token System</h4>
                                                                        <span className="text-[10px] font-black uppercase px-3 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 tracking-wider">Roster Rule</span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-300 leading-relaxed max-w-2xl">
                                                                        You get <strong className="text-yellow-400 font-bold">1 Limit Token</strong> when signing up to draft <strong className="text-white">1 Legendary, Mythical, Paradox, or Ultra Beast</strong> Pokémon.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Token Status Badge */}
                                                            <div className="w-full lg:w-auto flex items-center justify-between lg:justify-end gap-3 bg-black/60 p-3 px-5 rounded-2xl border border-white/10 shrink-0 shadow-inner">
                                                                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Token Status:</span>
                                                                {limitTokenCount === 0 ? (
                                                                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-black text-xs uppercase tracking-wider">
                                                                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                                                        1/1 Token Available
                                                                    </div>
                                                                ) : limitTokenCount === 1 ? (
                                                                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider">
                                                                        <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />
                                                                        1/1 Token Spent
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-black text-xs uppercase tracking-wider animate-pulse">
                                                                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                                                                        {limitTokenCount}/1 Token Exceeded!
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Restricted Category Breakdown */}
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 relative z-10">
                                                            <div className={`p-4 rounded-2xl border transition-all ${legendaryCount > 0 ? 'bg-yellow-500/15 border-yellow-500/50 shadow-lg shadow-yellow-950/30 scale-[1.02]' : 'bg-black/40 border-white/10'}`}>
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5"><LegendarySVG className="w-4 h-4 text-yellow-400 fill-yellow-400/20 shrink-0" /> Legendary</span>
                                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${legendaryCount > 0 ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/40' : 'bg-white/5 text-gray-500'}`}>{legendaryCount}</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 truncate">Articuno, Rayquaza, Dialga...</div>
                                                            </div>

                                                            <div className={`p-4 rounded-2xl border transition-all ${mythicalCount > 0 ? 'bg-pink-500/15 border-pink-500/50 shadow-lg shadow-pink-950/30 scale-[1.02]' : 'bg-black/40 border-white/10'}`}>
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5"><MythicalSVG className="w-4 h-4 text-pink-400 shrink-0" /> Mythical</span>
                                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${mythicalCount > 0 ? 'bg-pink-500/30 text-pink-300 border border-pink-500/40' : 'bg-white/5 text-gray-500'}`}>{mythicalCount}</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 truncate">Mew, Celebi, Jirachi, Darkrai...</div>
                                                            </div>

                                                            <div className={`p-4 rounded-2xl border transition-all ${paradoxCount > 0 ? 'bg-purple-500/15 border-purple-500/50 shadow-lg shadow-purple-950/30 scale-[1.02]' : 'bg-black/40 border-white/10'}`}>
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5"><ParadoxSVG className="w-4 h-4 text-purple-400 shrink-0" /> Paradox</span>
                                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${paradoxCount > 0 ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-gray-500'}`}>{paradoxCount}</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 truncate">Great Tusk, Roaring Moon...</div>
                                                            </div>

                                                            <div className={`p-4 rounded-2xl border transition-all ${ultraBeastCount > 0 ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-950/30 scale-[1.02]' : 'bg-black/40 border-white/10'}`}>
                                                                <div className="flex items-center justify-between mb-1.5">
                                                                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5"><UltraBeastSVG className="w-4 h-4 text-cyan-400 shrink-0" /> Ultra Beast</span>
                                                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${ultraBeastCount > 0 ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-gray-500'}`}>{ultraBeastCount}</span>
                                                                </div>
                                                                <div className="text-[10px] text-gray-400 truncate">Nihilego, Buzzwole, Kartana...</div>
                                                            </div>
                                                        </div>

                                                        {/* Active Token Selection Bar */}
                                                        {limitTokenPokemon && (
                                                            <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10 bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                                    <span className="text-yellow-400 font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-xs">
                                                                        <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400/20" /> Active Token Selection:
                                                                    </span>
                                                                    <span className="font-extrabold text-white bg-yellow-500/30 px-3 py-1 rounded-xl border border-yellow-500/40 uppercase text-xs tracking-wider shadow-sm flex items-center gap-1.5">
                                                                        {limitTokenPokemon.name}
                                                                        <span className="text-yellow-300 font-mono text-[10px]">({getLimitTokenCategory(limitTokenPokemon.id)})</span>
                                                                    </span>
                                                                </div>
                                                                {limitTokenCount > 1 && (
                                                                    <span className="text-red-400 font-bold text-xs flex items-center gap-1.5 bg-red-500/20 px-3 py-1 rounded-xl border border-red-500/30">
                                                                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                                                                        Limit exceeded! Remove 1 restricted Pokémon.
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Season 3: Gimmick Selection */}
                                                    {activeSeason.name.includes('Season 3') && (
                                                        <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-white/10">
                                                                <div className="flex items-center gap-3 mb-6">
                                                                    <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
                                                                    <div>
                                                                        <h4 className="text-sm font-black uppercase tracking-widest text-white">Gimmick Selection</h4>
                                                                        <p className="text-xs text-gray-400">Choose ONE gimmick and which Pokemon will use it.</p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    {/* 1. Select Gimmick Type */}
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                        {[
                                                                            { id: 'tera', label: 'Tera', color: 'border-blue-500 text-blue-400' },
                                                                            { id: 'dynamax', label: 'Dynamax', color: 'border-red-500 text-red-500' },
                                                                            { id: 'mega', label: 'Mega', color: 'border-pink-500 text-pink-400' },
                                                                            { id: 'zmove', label: 'Z-Move', color: 'border-yellow-400 text-yellow-400' }
                                                                        ].map(g => (
                                                                            <button
                                                                                key={g.id}
                                                                                onClick={() => setSelectedGimmick(g.id as any)}
                                                                                disabled={isLocked || tournamentStatus === 'ONGOING'}
                                                                                className={`py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${selectedGimmick === g.id
                                                                                    ? `${g.color} bg-white/10 shadow-lg scale-105`
                                                                                    : 'border-white/5 text-gray-500 hover:bg-white/5 hover:text-white'
                                                                                    } ${isLocked || tournamentStatus === 'ONGOING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                            >
                                                                                {g.label}
                                                                            </button>
                                                                        ))}
                                                                    </div>

                                                                    {/* 2. Select Pokemon for Gimmick */}
                                                                    {selectedGimmick && (
                                                                        <div className="pt-4 border-t border-white/10">
                                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Who uses {selectedGimmick}?</label>
                                                                            <div className="flex gap-2 justify-center flex-wrap">
                                                                                {selectedTeam.map((p, idx) => p && (
                                                                                    <button
                                                                                        key={idx}
                                                                                        onClick={() => {
                                                                                            // Validation: Dynamax restriction
                                                                                            if (selectedGimmick === 'dynamax' && (isLegendary(p.id) || isMythical(p.id) || isParadox(p.id) || isUltraBeast(p.id))) {
                                                                                                alert("Restricted Pokémon cannot Dynamax!");
                                                                                                return;
                                                                                            }
                                                                                            // Validation: Shedinja Tera
                                                                                            if (selectedGimmick === 'tera' && p.name.includes('Shedinja')) {
                                                                                                alert("Shedinja cannot use Tera!");
                                                                                                return;
                                                                                            }
                                                                                            setGimmickPokemonId(p.id);
                                                                                        }}
                                                                                        disabled={isLocked || tournamentStatus === 'ONGOING'}
                                                                                        className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center relative transition-all ${gimmickPokemonId === p.id
                                                                                            ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-110 z-10'
                                                                                            : 'border-white/10 hover:border-white/30 grayscale hover:grayscale-0'
                                                                                            } ${isLocked || tournamentStatus === 'ONGOING' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                                    >
                                                                                        <div className="w-10 h-10 relative">
                                                                                            <PokemonTeamImage pokemon={p} />
                                                                                        </div>
                                                                                        {gimmickPokemonId === p.id && (
                                                                                            <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-black">
                                                                                                <Check className="w-3 h-3 stroke-[3]" />
                                                                                            </div>
                                                                                        )}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}

                                                    {/* Season 2: Legendary Limit Warning (Legacy) */}
                                                    {!activeSeason.name.includes('Season 3') && activeSeason.format.includes('Duos') && legendaryCount > 0 && (
                                                        <div className={`px-4 py-3 rounded-2xl border ${exceedsLegendaryLimit ? 'bg-red-900/30 border-red-500/50' : 'bg-yellow-900/20 border-yellow-500/30'}`}>
                                                            <div className="flex items-center gap-3">
                                                                {exceedsLegendaryLimit ? <Ban className="w-6 h-6 text-red-500 shrink-0" /> : <Star className="w-6 h-6 text-yellow-500 shrink-0" strokeWidth={2} />}
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
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-3 px-2">
                                                                    <img src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player1Username : myDuo.player2Username}/32`} className="w-8 h-8 rounded-xl border-2 border-yellow-500 shadow-md" />
                                                                    <span className="text-sm font-black uppercase tracking-widest text-yellow-400">Captain's Roster (Slots 1-3)</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                                                                    {selectedTeam.slice(0, 3).map((p, idx) => {
                                                                        const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '', activeSeason?.name, activeSeason?.bannedPokemonIds);
                                                                        const isTokenMon = p !== null && isLimitTokenPokemon(p.id);
                                                                        const category = p !== null ? getLimitTokenCategory(p.id) : null;
                                                                        return (
                                                                            <div key={idx} className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative group transition-all duration-300 p-3 overflow-hidden ${
                                                                                p
                                                                                    ? (banned
                                                                                        ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-950/30'
                                                                                        : isTokenMon
                                                                                        ? 'bg-gradient-to-br from-yellow-950/40 via-black to-yellow-900/20 border-yellow-500 shadow-xl shadow-yellow-950/40 scale-[1.02]'
                                                                                        : 'bg-gradient-to-br from-yellow-900/20 via-black to-black border-yellow-500 shadow-2xl scale-[1.02]')
                                                                                    : 'bg-black/40 border-yellow-500/30 border-dashed hover:border-yellow-400 hover:bg-yellow-500/5'
                                                                            }`}>
                                                                                {/* Slot Label Badge */}
                                                                                <div className="absolute top-2.5 left-2.5 z-20">
                                                                                    <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-black/80 text-yellow-400 border border-yellow-500/30">
                                                                                        SLOT {idx + 1}
                                                                                    </span>
                                                                                </div>

                                                                                {/* Restricted Category Tag */}
                                                                                {category && (
                                                                                    <div className="absolute top-2.5 right-2.5 z-20">
                                                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 border shadow-sm ${
                                                                                            category === 'Legendary' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' :
                                                                                            category === 'Mythical' ? 'text-pink-300 bg-pink-500/20 border-pink-500/40' :
                                                                                            category === 'Paradox' ? 'text-purple-300 bg-purple-500/20 border-purple-500/40' :
                                                                                            'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                                                                                        }`}>
                                                                                            {category === 'Legendary' && <LegendarySVG className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                                                                            {category === 'Mythical' && <MythicalSVG className="w-2.5 h-2.5 text-pink-400 shrink-0" />}
                                                                                            {category === 'Paradox' && <ParadoxSVG className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
                                                                                            {category === 'Ultra Beast' && <UltraBeastSVG className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                                                                            <span>{category}</span>
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {p ? (
                                                                                    <>
                                                                                        <div className="w-full h-full pt-4 pb-6 relative z-10 flex items-center justify-center">
                                                                                            <PokemonTeamImage pokemon={p} />
                                                                                            {banned && (
                                                                                                <div className="absolute inset-0 bg-red-600/40 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-1 z-20">
                                                                                                    <X className="w-7 h-7 text-white font-black drop-shadow-lg stroke-[3]" />
                                                                                                    <span className="text-[8px] font-black text-white uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-full">Banned</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="absolute bottom-2.5 left-2 right-2 z-20">
                                                                                            <div className={`text-[9px] font-black uppercase text-center truncate py-1.5 px-2 rounded-xl backdrop-blur-md border ${banned ? 'bg-red-600 text-white border-red-400' : 'bg-black/80 text-white border-white/15'}`}>{p.name}</div>
                                                                                        </div>
                                                                                        {!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                                                            <button onClick={() => handleRemovePokemon(idx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={`Remove ${p.name}`}>
                                                                                                <X className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="flex flex-col items-center justify-center gap-1 text-yellow-900/80 group-hover:text-yellow-400 transition-colors">
                                                                                        <Plus className="w-8 h-8 stroke-[2.5]" />
                                                                                        <span className="text-[9px] font-black uppercase tracking-wider text-yellow-600/80 group-hover:text-yellow-300">Empty Slot</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Partner's Pokemon (Slots 3-5) */}
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-3 px-2">
                                                                    <img src={`https://mc-heads.net/avatar/${myDuo.captainDiscordId === myDuo.player1DiscordId ? myDuo.player2Username : myDuo.player1Username}/32`} className="w-8 h-8 rounded-xl border-2 border-purple-500 shadow-md" />
                                                                    <span className="text-sm font-black uppercase tracking-widest text-purple-400">Partner's Roster (Slots 4-6)</span>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-2">
                                                                    {selectedTeam.slice(3, 6).map((p, idx) => {
                                                                        const actualIdx = idx + 3;
                                                                        const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '', activeSeason?.name, activeSeason?.bannedPokemonIds);
                                                                        const isTokenMon = p !== null && isLimitTokenPokemon(p.id);
                                                                        const category = p !== null ? getLimitTokenCategory(p.id) : null;
                                                                        return (
                                                                            <div key={actualIdx} className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative group transition-all duration-300 p-3 overflow-hidden ${
                                                                                p
                                                                                    ? (banned
                                                                                        ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-950/30'
                                                                                        : isTokenMon
                                                                                        ? 'bg-gradient-to-br from-purple-950/40 via-black to-purple-900/20 border-purple-500 shadow-xl shadow-purple-950/40 scale-[1.02]'
                                                                                        : 'bg-gradient-to-br from-purple-900/20 via-black to-black border-purple-500 shadow-2xl scale-[1.02]')
                                                                                    : 'bg-black/40 border-purple-500/30 border-dashed hover:border-purple-400 hover:bg-purple-500/5'
                                                                            }`}>
                                                                                {/* Slot Label Badge */}
                                                                                <div className="absolute top-2.5 left-2.5 z-20">
                                                                                    <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-black/80 text-purple-400 border border-purple-500/30">
                                                                                        SLOT {actualIdx + 1}
                                                                                    </span>
                                                                                </div>

                                                                                {/* Restricted Category Tag */}
                                                                                {category && (
                                                                                    <div className="absolute top-2.5 right-2.5 z-20">
                                                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 border shadow-sm ${
                                                                                            category === 'Legendary' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' :
                                                                                            category === 'Mythical' ? 'text-pink-300 bg-pink-500/20 border-pink-500/40' :
                                                                                            category === 'Paradox' ? 'text-purple-300 bg-purple-500/20 border-purple-500/40' :
                                                                                            'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                                                                                        }`}>
                                                                                            {category === 'Legendary' && <LegendarySVG className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                                                                            {category === 'Mythical' && <MythicalSVG className="w-2.5 h-2.5 text-pink-400 shrink-0" />}
                                                                                            {category === 'Paradox' && <ParadoxSVG className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
                                                                                            {category === 'Ultra Beast' && <UltraBeastSVG className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                                                                            <span>{category}</span>
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {p ? (
                                                                                    <>
                                                                                        <div className="w-full h-full pt-4 pb-6 relative z-10 flex items-center justify-center">
                                                                                            <PokemonTeamImage pokemon={p} />
                                                                                            {banned && (
                                                                                                <div className="absolute inset-0 bg-red-600/40 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-1 z-20">
                                                                                                    <X className="w-7 h-7 text-white font-black drop-shadow-lg stroke-[3]" />
                                                                                                    <span className="text-[8px] font-black text-white uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-full">Banned</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="absolute bottom-2.5 left-2 right-2 z-20">
                                                                                            <div className={`text-[9px] font-black uppercase text-center truncate py-1.5 px-2 rounded-xl backdrop-blur-md border ${banned ? 'bg-red-600 text-white border-red-400' : 'bg-black/80 text-white border-white/15'}`}>{p.name}</div>
                                                                                        </div>
                                                                                        {!isLocked && !(myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                                                            <button onClick={() => handleRemovePokemon(actualIdx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={`Remove ${p.name}`}>
                                                                                                <X className="w-3.5 h-3.5" />
                                                                                            </button>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <div className="flex flex-col items-center justify-center gap-1 text-purple-900/80 group-hover:text-purple-400 transition-colors">
                                                                                        <Plus className="w-8 h-8 stroke-[2.5]" />
                                                                                        <span className="text-[9px] font-black uppercase tracking-wider text-purple-600/80 group-hover:text-purple-300">Empty Slot</span>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        /* Singles Mode: Spacious 6-slot grid */
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between px-2">
                                                                <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                                                    <span>Active Party Slots</span>
                                                                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                                                                        {selectedTeam.filter(Boolean).length} / 6
                                                                    </span>
                                                                </h4>
                                                            </div>

                                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 px-2">
                                                                {selectedTeam.map((p, idx) => {
                                                                    const banned = p !== null && isBannedForSeason(p.id, activeSeason?.format || '', activeSeason?.name, activeSeason?.bannedPokemonIds);
                                                                    const isTokenMon = p !== null && isLimitTokenPokemon(p.id);
                                                                    const category = p !== null ? getLimitTokenCategory(p.id) : null;
                                                                    return (
                                                                        <div key={idx} className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative group transition-all duration-300 p-3 overflow-hidden ${
                                                                            p
                                                                                ? (banned
                                                                                    ? 'bg-red-950/30 border-red-500 shadow-xl shadow-red-950/30'
                                                                                    : isTokenMon
                                                                                    ? 'bg-gradient-to-br from-yellow-950/40 via-black to-yellow-900/20 border-yellow-500 shadow-xl shadow-yellow-950/40 scale-[1.02]'
                                                                                    : 'bg-gradient-to-br from-brand-primary/15 via-black/80 to-black border-brand-primary/60 shadow-xl shadow-black/50 hover:border-brand-primary scale-[1.02]')
                                                                                : 'bg-black/40 border-white/10 border-dashed hover:border-brand-primary/50 hover:bg-white/5'
                                                                        }`}>
                                                                            {/* Slot Label Badge */}
                                                                            <div className="absolute top-2.5 left-2.5 z-20">
                                                                                <span className="text-[9px] font-black uppercase font-mono px-2 py-0.5 rounded-md bg-black/80 text-gray-400 border border-white/10">
                                                                                    SLOT {idx + 1}
                                                                                </span>
                                                                            </div>

                                                                            {/* Restricted Category Tag */}
                                                                            {category && (
                                                                                <div className="absolute top-2.5 right-2.5 z-20">
                                                                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 border shadow-sm ${
                                                                                        category === 'Legendary' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/40' :
                                                                                        category === 'Mythical' ? 'text-pink-300 bg-pink-500/20 border-pink-500/40' :
                                                                                        category === 'Paradox' ? 'text-purple-300 bg-purple-500/20 border-purple-500/40' :
                                                                                        'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                                                                                    }`}>
                                                                                        {category === 'Legendary' && <LegendarySVG className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                                                                        {category === 'Mythical' && <MythicalSVG className="w-2.5 h-2.5 text-pink-400 shrink-0" />}
                                                                                        {category === 'Paradox' && <ParadoxSVG className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
                                                                                        {category === 'Ultra Beast' && <UltraBeastSVG className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                                                                        <span>{category}</span>
                                                                                    </span>
                                                                                </div>
                                                                            )}

                                                                            {p ? (
                                                                                <>
                                                                                    <div className="w-full h-full pt-4 pb-6 relative z-10 flex items-center justify-center">
                                                                                        <PokemonTeamImage pokemon={p} />
                                                                                        {banned && (
                                                                                            <div className="absolute inset-0 bg-red-600/40 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center gap-1 z-20">
                                                                                                <X className="w-7 h-7 text-white font-black drop-shadow-lg stroke-[3]" />
                                                                                                <span className="text-[8px] font-black text-white uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded-full">Banned</span>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="absolute bottom-2.5 left-2 right-2 z-20">
                                                                                        <div className={`text-[9px] font-black uppercase text-center truncate py-1.5 px-2 rounded-xl backdrop-blur-md border ${banned ? 'bg-red-600 text-white border-red-400' : 'bg-black/80 text-white border-white/15'}`}>{p.name}</div>
                                                                                    </div>
                                                                                    {!isLocked && tournamentStatus !== 'ONGOING' && (
                                                                                        <button onClick={() => handleRemovePokemon(idx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white scale-90 hover:scale-100" title={`Remove ${p.name}`}>
                                                                                            <X className="w-3.5 h-3.5" />
                                                                                        </button>
                                                                                    )}
                                                                                </>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center justify-center gap-1 text-gray-500 group-hover:text-amber-400 transition-colors">
                                                                                    <Plus className="w-8 h-8 stroke-[2.5]" />
                                                                                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-500 group-hover:text-amber-300">Empty Slot</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                {/* Overhauled Pokémon Database Explorer */}
                                                {!isLocked && !(activeSeason.format.includes('Duos') && myDuo?.isLocked) && tournamentStatus !== 'ONGOING' && (
                                                    <div className="bg-black/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl relative">
                                                        {/* Header & Search Bar */}
                                                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center border-b border-white/10 pb-6">
                                                            <div>
                                                                <div className="flex items-center gap-3">
                                                                    <h4 className="text-lg font-black uppercase tracking-widest text-white">Pokémon Database</h4>
                                                                    <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 text-xs font-bold font-mono">
                                                                        {pokemonList.length} Total
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    Search or filter Pokémon to draft into your roster. Restricted Pokémon use your 1 Limit Token.
                                                                </p>
                                                            </div>

                                                            {/* Search Bar */}
                                                            <div className="relative w-full lg:w-80">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search name or ID..."
                                                                    value={searchQuery}
                                                                    onChange={e => setSearchQuery(e.target.value)}
                                                                    className="w-full bg-black/80 border border-white/15 rounded-2xl py-3 pl-10 pr-10 text-sm font-bold text-white placeholder-gray-500 focus:border-brand-primary outline-none transition-all shadow-inner"
                                                                />
                                                                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                                {searchQuery && (
                                                                    <button
                                                                        onClick={() => setSearchQuery('')}
                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                                                                    >
                                                                        <X className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Category Filter Pills */}
                                                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                                                            {[
                                                                { id: 'ALL', label: 'All' },
                                                                { id: 'STANDARD', label: 'Standard Mons' },
                                                                { id: 'LEGENDARY', label: 'Legendary', icon: <LegendarySVG className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400/20 shrink-0" /> },
                                                                { id: 'MYTHICAL', label: 'Mythical', icon: <MythicalSVG className="w-3.5 h-3.5 text-pink-400 shrink-0" /> },
                                                                { id: 'PARADOX', label: 'Paradox', icon: <ParadoxSVG className="w-3.5 h-3.5 text-purple-400 shrink-0" /> },
                                                                { id: 'ULTRA_BEAST', label: 'Ultra Beast', icon: <UltraBeastSVG className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> },
                                                            ].map(tab => (
                                                                <button
                                                                    key={tab.id}
                                                                    onClick={() => setDbCategoryFilter(tab.id as any)}
                                                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                                                        dbCategoryFilter === tab.id
                                                                            ? 'bg-brand-primary text-black border-brand-primary font-extrabold shadow-lg shadow-brand-primary/20 scale-105'
                                                                            : 'bg-black/40 text-gray-400 border-white/10 hover:border-white/30 hover:text-white'
                                                                    }`}
                                                                >
                                                                    {tab.icon}
                                                                    <span>{tab.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {/* Pokémon Database Grid */}
                                                        <div
                                                            onScroll={handleGridScroll}
                                                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 max-h-[520px] overflow-y-auto pokemon-grid pr-2 py-2"
                                                        >
                                                            {loadingPokemon ? (
                                                                <div className="col-span-full text-center py-12 text-gray-400 font-bold flex items-center justify-center gap-3">
                                                                    <RefreshCw className="w-5 h-5 animate-spin text-brand-primary" /> Loading Pokémon Database...
                                                                </div>
                                                            ) : displayedPokemon.length === 0 ? (
                                                                <div className="col-span-full text-center py-12 text-gray-500 font-bold">
                                                                    No Pokémon match your search or filter criteria.
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {displayedPokemon.map(p => {
                                                                        const isSelected = selectedTeam.some(sp => sp?.id === p.id);
                                                                        const isFull = !selectedTeam.includes(null);
                                                                        const banned = isBannedForSeason(p.id, activeSeason?.format || '', activeSeason?.name, activeSeason?.bannedPokemonIds);
                                                                        const isTokenMon = isLimitTokenPokemon(p.id);
                                                                        const category = getLimitTokenCategory(p.id);
                                                                        const tokenLocked = isTokenMon && limitTokenCount >= 1 && !isSelected;

                                                                        return (
                                                                            <button
                                                                                key={p.id}
                                                                                disabled={isSelected || isFull || banned || tokenLocked}
                                                                                onClick={() => handleSelectPokemon(p)}
                                                                                className={`aspect-square rounded-2xl flex flex-col items-center justify-between p-2.5 transition-all relative group overflow-hidden border-2 text-left ${
                                                                                    isSelected
                                                                                        ? 'bg-green-950/30 border-green-500 shadow-lg shadow-green-950/40 opacity-60'
                                                                                        : banned
                                                                                        ? 'bg-red-950/20 border-red-500/50 opacity-40 grayscale cursor-not-allowed'
                                                                                        : tokenLocked
                                                                                        ? 'bg-amber-950/20 border-amber-500/40 opacity-50 cursor-not-allowed'
                                                                                        : isFull
                                                                                        ? 'bg-gray-900/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                                                                                        : isTokenMon
                                                                                        ? 'bg-gradient-to-b from-yellow-950/20 to-black/60 border-yellow-500/40 hover:border-yellow-400 hover:scale-[1.05] shadow-lg shadow-yellow-950/20'
                                                                                        : 'bg-white/5 border-white/10 hover:border-brand-primary/50 hover:bg-white/10 hover:scale-[1.05]'
                                                                                }`}
                                                                                title={`${p.name} (#${p.id})`}
                                                                            >
                                                                                {/* Dex ID Header */}
                                                                                <div className="w-full flex justify-between items-center text-[9px] font-mono font-bold text-gray-500 z-10">
                                                                                    <span>#{p.id.toString().padStart(3, '0')}</span>
                                                                                    {category && (
                                                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded flex items-center gap-1 border ${
                                                                                            category === 'Legendary' ? 'text-yellow-400 bg-yellow-950/60 border-yellow-500/30' :
                                                                                            category === 'Mythical' ? 'text-pink-400 bg-pink-950/60 border-pink-500/30' :
                                                                                            category === 'Paradox' ? 'text-purple-400 bg-purple-950/60 border-purple-500/30' :
                                                                                            'text-cyan-400 bg-cyan-950/60 border-cyan-500/30'
                                                                                        }`}>
                                                                                            {category === 'Legendary' && <LegendarySVG className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400/20 shrink-0" />}
                                                                                            {category === 'Mythical' && <MythicalSVG className="w-2.5 h-2.5 text-pink-400 shrink-0" />}
                                                                                            {category === 'Paradox' && <ParadoxSVG className="w-2.5 h-2.5 text-purple-400 shrink-0" />}
                                                                                            {category === 'Ultra Beast' && <UltraBeastSVG className="w-2.5 h-2.5 text-cyan-400 shrink-0" />}
                                                                                            <span>{category === 'Ultra Beast' ? 'UB' : category}</span>
                                                                                        </span>
                                                                                    )}
                                                                                </div>

                                                                                {/* Sprite Container */}
                                                                                <div className="w-14 h-14 relative my-auto flex items-center justify-center z-10">
                                                                                    <PokemonTeamImage pokemon={p} />
                                                                                </div>

                                                                                {/* Name Label */}
                                                                                <div className="w-full text-center z-10">
                                                                                    <div className="text-[10px] font-black uppercase tracking-tight text-white truncate w-full">
                                                                                        {p.name}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Badges / Status Overlays */}
                                                                                {isSelected && (
                                                                                    <div className="absolute inset-0 bg-green-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-1 z-20">
                                                                                        <Check className="w-5 h-5 text-green-400 stroke-[3]" />
                                                                                        <span className="text-[8px] font-black text-green-300 uppercase tracking-wider">IN TEAM</span>
                                                                                    </div>
                                                                                )}

                                                                                {tokenLocked && (
                                                                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-1 text-center z-20">
                                                                                        <Lock className="w-4 h-4 text-amber-400 mb-0.5" />
                                                                                        <span className="text-[8px] font-black text-yellow-300 uppercase tracking-tighter leading-tight">TOKEN USED</span>
                                                                                    </div>
                                                                                )}

                                                                                {banned && (
                                                                                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-0.5 z-20">
                                                                                        <X className="w-5 h-5 text-red-400 stroke-[3]" />
                                                                                        <span className="text-[8px] font-black text-red-300 uppercase tracking-wider">BANNED</span>
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    {visibleCount < allFilteredPokemon.length && (
                                                                        <div className="col-span-full py-6 text-center">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setVisibleCount(prev => Math.min(prev + 48, allFilteredPokemon.length))}
                                                                                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-brand-primary hover:text-black text-xs font-black text-white uppercase tracking-wider transition-all border border-white/20 shadow-lg cursor-pointer"
                                                                            >
                                                                                Load More Pokémon ({allFilteredPokemon.length - visibleCount} remaining)
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Save/Lock Buttons - Check both solo isLocked and duo isLocked */}
                                                {!(activeSeason.format.includes('Duos') ? myDuo?.isLocked : isLocked) && tournamentStatus !== 'ONGOING' && (
                                                    <div className="pt-6 flex flex-col md:flex-row justify-center items-center gap-6">
                                                        <button onClick={handleSaveDraft} disabled={saving || hasBannedPokemon} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 text-white border-b-4 border-white/20 flex-1 transition-all">
                                                            {saveStatus === 'success' ? (
                                                                <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-green-400 stroke-[3]" /> SYNCED</span>
                                                            ) : saving ? (
                                                                <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 text-white animate-spin" /> SYNCING...</span>
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-2"><Save className="w-4 h-4 text-white" /> SAVE DRAFT</span>
                                                            )}
                                                        </button>
                                                        {tournamentStatus === 'LOCK_IN' && (
                                                            <button onClick={handleLockInClick} disabled={saving || selectedTeam.includes(null) || hasBannedPokemon} className="px-12 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl flex-[2] bg-green-600 hover:bg-green-500 text-white border-green-800 border-b-4 transition-all cursor-pointer">
                                                                <span className="flex items-center justify-center gap-2"><Lock className="w-5 h-5 text-white" /> FINALIZE & LOCK TEAM</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {tournamentStatus === 'ONGOING' && !isLocked && hasStartedRegistration && (
                                                    <div className="bg-amber-900/20 border-2 border-amber-500/30 p-8 rounded-[2.5rem] text-center">
                                                        <Clock className="w-10 h-10 text-amber-400 mx-auto mb-4" />
                                                        <h3 className="text-2xl font-black text-white uppercase italic mb-2">Phase Expired</h3>
                                                        <p className="text-gray-400">The tournament has already begun. Drafting is closed, and unfinalized teams have been disqualified.</p>
                                                    </div>
                                                )}
                                                </div>
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
                                    {(selectedPlayer.isLocked ? selectedPlayer.team : new Array(6).fill(null)).map((pokemon, idx) => (
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

            {/* LOCK IN CONFIRMATION MODAL */}
            {showLockConfirmModal && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setShowLockConfirmModal(false)}
                >
                    <div
                        className="bg-[#120507] w-full max-w-md rounded-[2.5rem] border-2 border-red-500/40 shadow-[0_0_50px_rgba(220,38,38,0.35)] flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300 p-6 md:p-8 text-center"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative Header Background */}
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-600/25 to-transparent pointer-events-none"></div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setShowLockConfirmModal(false)}
                            className="absolute top-5 right-5 w-9 h-9 bg-white/5 hover:bg-white/15 rounded-full flex items-center justify-center text-gray-400 hover:text-white font-black transition-all border border-white/10 z-20 cursor-pointer"
                        >
                            ✕
                        </button>

                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-4 relative z-10 shadow-lg shadow-red-950/50">
                            <Lock className="w-8 h-8 text-red-400" />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight relative z-10">
                            Lock In Team?
                        </h3>

                        {/* Content Text */}
                        <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed my-4 relative z-10">
                            Are you sure you want to <span className="text-red-400 font-bold">LOCK IN</span> your team? You will <span className="text-white font-bold underline decoration-red-500">NOT</span> be able to edit it afterwards.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-center gap-3 mt-2 relative z-10">
                            <button
                                type="button"
                                onClick={() => setShowLockConfirmModal(false)}
                                className="flex-1 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLockIn}
                                disabled={saving}
                                className="flex-1 px-5 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white border-b-4 border-red-800 shadow-xl shadow-red-950/60 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                                        <span>Locking...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4 text-white" />
                                        <span>Confirm Lock</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default TournamentBACK;
