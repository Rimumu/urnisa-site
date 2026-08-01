
import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';
import { Link } from 'react-router-dom';
import {
    Trophy,
    Save,
    Users,
    Crown,
    ClipboardList,
    Eye,
    CornerDownLeft,
    Trash2,
    Archive,
    Gamepad2,
    Lock,
    Unlock,
    Hourglass,
    AlertCircle,
    X,
    Search,
    Plus,
    ChevronRight,
    Bold,
    Underline,
    Italic,
    Palette,
    Eraser,
    Sparkles,
    Activity,
    Skull,
    Star,
    Flame,
    Ban,
    Target,
    Scroll,
    CircleSlash,
    Briefcase,
    Scale,
    Gem,
    RefreshCw,
    Zap
} from 'lucide-react';

// --- TYPES ---
interface TournamentPlayer {
    _id: string;
    discordId: string;
    minecraftUsername: string;
    seasonId: number;
    team: ({ id: number; name: string } | null)[];
    isLocked: boolean;
    isDev?: boolean;
    updatedAt: string;
    gimmickType?: 'tera' | 'dynamax' | 'mega' | 'zmove' | null;
    gimmickPokemonId?: number | null;
}

interface Season {
    seasonId: number;
    name: string;
    format: string;
    status: string;
    isArchived?: boolean;
    challongeUrl?: string;
    description?: string;
    bannedPokemonIds?: number[];
    rules?: {
        title: string;
        icon: string;
        color: string;
        content: string;
    }[];
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

interface DuoPartyData {
    duoId: string;
    player1Username: string;
    player2Username: string;
    player1Picks: { name: string; level: number }[];
    player2Picks: { name: string; level: number }[];
    lastUpdated: string;
}

// --- CATEGORY CONSTANTS & SVG ICONS ---
const LEGENDARY_IDS = new Set([
    144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
]);
const MYTHICAL_IDS = new Set([
    151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 1025
]);
const PARADOX_IDS = new Set([
    984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010, 1020, 1021, 1022, 1023
]);
const ULTRA_BEAST_IDS = new Set([
    793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806
]);

const getLimitTokenCategory = (id: number): 'Legendary' | 'Mythical' | 'Paradox' | 'Ultra Beast' | null => {
    if (LEGENDARY_IDS.has(id)) return 'Legendary';
    if (MYTHICAL_IDS.has(id)) return 'Mythical';
    if (PARADOX_IDS.has(id)) return 'Paradox';
    if (ULTRA_BEAST_IDS.has(id)) return 'Ultra Beast';
    return null;
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
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
    </svg>
);

// --- POKEMON IMAGE COMPONENT ---
const PokemonImage: React.FC<{ pokemon: { id: number; name: string } | null }> = ({ pokemon }) => {
    if (!pokemon) return (
        <div className="aspect-square bg-black/40 rounded-xl border border-white/10 flex items-center justify-center text-gray-600 font-black text-xl">?</div>
    );
    const category = getLimitTokenCategory(pokemon.id);
    return (
        <div className="aspect-square bg-black/40 rounded-xl border border-white/10 overflow-hidden p-1 relative group">
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
                    </span>
                </div>
            )}
            <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`}
                alt={pokemon.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
                }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] font-bold text-white text-center py-0.5 truncate px-1">
                {pokemon.name}
            </div>
        </div>
    );
};

// --- GIMMICK BADGE ---
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
            return <RefreshCw className={`${className} text-pink-400`} style={{ animation: 'spin 8s linear infinite' }} />;
        default:
            return <Zap className={`${className} text-yellow-400`} />;
    }
};

// --- RICH TEXT EDITOR ---
interface RichTextEditorProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync content changes from external prop to editor
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, arg: string = '') => {
        document.execCommand(command, false, arg);
        handleInput();
    };

    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
            {/* Toolbar */}
            <div className="bg-black/60 border-b border-white/10 p-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-1.5 items-center">
                    <button
                        type="button"
                        onClick={() => execCommand('bold')}
                        className="bg-white/5 hover:bg-white/15 text-white p-2 rounded-xl transition-colors border border-white/5 flex items-center justify-center cursor-pointer"
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('underline')}
                        className="bg-white/5 hover:bg-white/15 text-white p-2 rounded-xl transition-colors border border-white/5 flex items-center justify-center cursor-pointer"
                        title="Underline"
                    >
                        <Underline className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('italic')}
                        className="bg-white/5 hover:bg-white/15 text-white p-2 rounded-xl transition-colors border border-white/5 flex items-center justify-center cursor-pointer"
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => execCommand('removeFormat')}
                        className="bg-white/5 hover:bg-white/15 text-white p-2 rounded-xl transition-colors border border-white/5 flex items-center justify-center cursor-pointer"
                        title="Clear Formatting"
                    >
                        <Eraser className="w-4 h-4" />
                    </button>

                    <div className="h-5 w-[1px] bg-white/10 mx-2" />

                    <span className="text-[10px] text-gray-400 font-bold uppercase mr-1 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5" /> Colors:
                    </span>
                    {[
                        { label: 'Pink', hex: '#ff007f' },
                        { label: 'Gold', hex: '#fbbf24' },
                        { label: 'Red', hex: '#ef4444' },
                        { label: 'Blue', hex: '#3b82f6' },
                        { label: 'Green', hex: '#22c55e' },
                        { label: 'Purple', hex: '#a855f7' },
                        { label: 'Orange', hex: '#f97316' },
                        { label: 'White', hex: '#ffffff' },
                    ].map(color => (
                        <button
                            key={color.label}
                            type="button"
                            onClick={() => execCommand('foreColor', color.hex)}
                            className="w-6 h-6 rounded-full border border-white/20 hover:scale-125 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer shadow-md"
                            style={{ backgroundColor: color.hex }}
                            title={`Color: ${color.label}`}
                        >
                            <span className="sr-only">{color.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm("Are you sure you want to clear the description text?")) {
                                onChange('');
                                if (editorRef.current) editorRef.current.innerHTML = '';
                            }
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-xl text-[10px] transition-colors border border-red-500/20 cursor-pointer flex items-center gap-1"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Clear Text
                    </button>
                </div>
            </div>

            {/* Editable Area */}
            <div className="relative">
                <div
                    ref={editorRef}
                    contentEditable={true}
                    onInput={handleInput}
                    className="w-full bg-black/40 p-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-h-[200px] max-h-[400px] overflow-y-auto leading-relaxed outline-none"
                    style={{ minHeight: '200px' }}
                />
                {!value && (
                    <div className="absolute top-4 left-4 text-gray-500 text-sm pointer-events-none select-none">
                        {placeholder || "Enter format description..."}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const AdminTournament: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Season State
    const [allSeasons, setAllSeasons] = useState<Season[]>([]);
    const [activeSeason, setActiveSeason] = useState<Season | null>(null);
    const [newSeasonName, setNewSeasonName] = useState('');
    const [newSeasonFormat, setNewSeasonFormat] = useState('Singles 4v4');
    const [newSeasonChallongeUrl, setNewSeasonChallongeUrl] = useState('');
    const [editingChallongeUrl, setEditingChallongeUrl] = useState('');

    // Player State
    const [players, setPlayers] = useState<TournamentPlayer[]>([]);
    const [playerSearch, setPlayerSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState<TournamentPlayer | null>(null);

    // Duo State (Season 2)
    const [duos, setDuos] = useState<Duo[]>([]);
    const [playerListTab, setPlayerListTab] = useState<'solo' | 'duos' | 'parties' | 'rules'>('solo');
    const [showPairModal, setShowPairModal] = useState(false);
    const [pairPlayer1, setPairPlayer1] = useState<TournamentPlayer | null>(null);
    const [pairPlayer2, setPairPlayer2] = useState<TournamentPlayer | null>(null);
    const [pairCaptain, setPairCaptain] = useState<'player1' | 'player2'>('player1');

    // Rules Editor Overhaul States
    const [ruleGeneralName, setRuleGeneralName] = useState('');
    const [ruleGeneralFormat, setRuleGeneralFormat] = useState('');
    const [ruleGeneralDesc, setRuleGeneralDesc] = useState('');
    const [ruleCards, setRuleCards] = useState<{ title: string; icon: string; color: string; content: string }[]>([]);
    const [ruleBannedIds, setRuleBannedIds] = useState<number[]>([]);

    // Live Party Data State
    const [duoParties, setDuoParties] = useState<DuoPartyData[]>([]);
    const [showLogModal, setShowLogModal] = useState(false);
    const [logText, setLogText] = useState('');
    const [selectedDuoForParty, setSelectedDuoForParty] = useState<Duo | null>(null);

    // UI State
    const [statusMsg, setStatusMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // End Tournament Modal
    const [showEndModal, setShowEndModal] = useState(false);
    const [finalWinners, setFinalWinners] = useState({
        rank1: { teamName: '', player1: '', player2: '', score: '' },
        rank2: { teamName: '', player1: '', player2: '', score: '' },
        rank3: { teamName: '', player1: '', player2: '', score: '' }
    });

    // --- AUTH ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setIsAuthenticated(true);
                fetchSeasons();
            } else {
                setStatusMsg('Invalid password');
                setTimeout(() => setStatusMsg(''), 3000);
            }
        } catch (e) {
            setStatusMsg('Auth failed');
            setTimeout(() => setStatusMsg(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    // --- DATA FETCHING ---
    const fetchSeasons = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/seasons`);
            const seasons = await res.json();
            if (Array.isArray(seasons) && seasons.length > 0) {
                setAllSeasons(seasons);
                const active = seasons.find((s: Season) => !s.isArchived) || seasons[0];
                setActiveSeason(active);
                setEditingChallongeUrl(active.challongeUrl || '');
            }
        } catch (e) {
            console.error('Failed to fetch seasons', e);
        }
    };

    const fetchPlayers = async (seasonId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/players?dev=true&seasonId=${seasonId}`);
            const data = await res.json();
            setPlayers(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch players', e);
        }
    };

    const fetchDuos = async (seasonId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/duos?seasonId=${seasonId}`);
            const data = await res.json();
            setDuos(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch duos', e);
        }
    };

    const fetchDuoParties = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/duo-parties`);
            const data = await res.json();
            setDuoParties(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch duo parties', e);
        }
    };

    useEffect(() => {
        if (activeSeason?.seasonId) {
            fetchPlayers(activeSeason.seasonId);
            fetchDuos(activeSeason.seasonId);
            fetchDuoParties();
            setEditingChallongeUrl(activeSeason.challongeUrl || '');
            setRuleGeneralName(activeSeason.name || '');
            setRuleGeneralFormat(activeSeason.format || '');
            setRuleGeneralDesc(activeSeason.description || '');
            setRuleCards(activeSeason.rules || []);
            setRuleBannedIds(activeSeason.bannedPokemonIds || []);
        }
    }, [activeSeason?.seasonId]);



    // Auto-refresh polling for real-time updates (every 15 seconds)
    useEffect(() => {
        const pollInterval = setInterval(() => {
            if (activeSeason?.seasonId) {
                fetchPlayers(activeSeason.seasonId);
                fetchDuos(activeSeason.seasonId);
                fetchDuoParties();
            }
        }, 15000); // 15 seconds

        return () => clearInterval(pollInterval);
    }, [activeSeason?.seasonId]);

    // --- API HELPER ---
    const apiCall = async (endpoint: string, body: any) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Request failed');
            return data;
        } finally {
            setLoading(false);
        }
    };

    // --- SEASON HANDLERS ---
    const handleCreateSeason = async () => {
        if (!newSeasonName.trim()) {
            setStatusMsg('Please enter a season name');
            return;
        }
        try {
            await apiCall('/api/admin/tournament/season/create', {
                name: newSeasonName,
                format: newSeasonFormat || 'Singles 4v4',
                challongeUrl: newSeasonChallongeUrl
            });
            setStatusMsg('Season created!');
            setNewSeasonName('');
            setNewSeasonFormat('Singles 4v4');
            setNewSeasonChallongeUrl('');
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleUpdateSeason = async () => {
        if (!activeSeason) return;
        try {
            await apiCall(`/api/admin/tournament/season/${activeSeason.seasonId}/update`, {
                name: activeSeason.name,
                format: activeSeason.format,
                challongeUrl: editingChallongeUrl,
                status: activeSeason.status
            });
            setStatusMsg('Season updated!');
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleSaveRulesOverhaul = async () => {
        if (!activeSeason) return;
        try {
            const data = await apiCall(`/api/admin/tournament/season/${activeSeason.seasonId}/update`, {
                name: ruleGeneralName,
                format: ruleGeneralFormat,
                description: ruleGeneralDesc,
                rules: ruleCards,
                bannedPokemonIds: ruleBannedIds
            });
            if (data && data.success) {
                setStatusMsg('Rules & bans updated!');
                // Update local activeSeason properties
                setActiveSeason(prev => prev ? {
                    ...prev,
                    name: ruleGeneralName,
                    format: ruleGeneralFormat,
                    description: ruleGeneralDesc,
                    rules: ruleCards,
                    bannedPokemonIds: ruleBannedIds
                } : null);
                fetchSeasons();
            }
        } catch (e: any) {
            setStatusMsg(e.message || 'Error saving rules');
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleInitializeDefaultRules = () => {
        const defaultRules = [
            { title: "Party Limits", icon: "⚡", color: "border-yellow-500/40 bg-yellow-900/10", content: "• 1 Legendary allowed per party\n• 1 Mythical allowed per party\n• 1 Paradox allowed per party\n• 1 Ultra Beast allowed per party" },
            { title: "Gimmick Rules", icon: "💥", color: "border-orange-500/40 bg-orange-900/10", content: "• One Gimmick Per Roster: You can only use ONE type of gimmick in your entire party (Mega, Z-Move, Dynamax, or Tera).\n• Dynamax Restriction: Only standard Pokémon can Dynamax (Legendaries, Mythicals, Paradox, Ultra Beasts are banned from Dynamax).\n• Shedinja Tera Ban: Shedinja is banned from using Tera." },
            { title: "Clauses", icon: "📜", color: "border-blue-500/40 bg-blue-900/10", content: "• Species Clause: No two Pokémon of the same National Dex number.\n• Item Clause: No two Pokémon may hold the same item.\n• Sleep Clause: Cannot put more than one opponent Pokémon to sleep simultaneously.\n• Endless Battle Clause: No infinite battle situations." },
            { title: "Move & Ability Bans", icon: "⛔", color: "border-purple-500/40 bg-purple-900/10", content: "• Evasion Clause: Double Team, Minimize are banned.\n• OHKO Clause: Fissure, Sheer Cold, Horn Drill, Guillotine are banned.\n• Moody Ability is banned.\n• Other banned moves/abilities: Revival Blessing, Arena Trap, Power Construct, Shadow Tag, Baton Pass, Assist, Last Respects, Shed Tail." },
            { title: "Item Bans", icon: "🎒", color: "border-pink-500/40 bg-pink-900/10", content: "The following items are completely banned from tournament use:\n• Bright Powder\n• Lax Incense\n• King's Rock\n• Razor Fang\n• Quick Claw" },
            { title: "General Rules", icon: "⚖️", color: "border-white/10", content: "• Breaking any rule results in instant disqualification.\n• No intentional stalling or disconnect abuse.\n• Report matches within 10 minutes of completion.\n• Admin decisions are final." }
        ];
        setRuleCards(defaultRules);
        setStatusMsg('Loaded default rules template! Don\'t forget to click Save below.');
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleArchiveSeason = async () => {
        if (!activeSeason || !window.confirm(`Archive ${activeSeason.name}? This will end the tournament.`)) return;
        try {
            await apiCall(`/api/admin/tournament/season/${activeSeason.seasonId}/archive`, {});
            setStatusMsg('Season archived!');
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleSetStatus = async (status: string) => {
        if (!activeSeason) return;
        try {
            await apiCall(`/api/admin/tournament/season/${activeSeason.seasonId}/update`, {
                ...activeSeason,
                status
            });
            setStatusMsg(`Status set to ${status}`);
            setActiveSeason({ ...activeSeason, status });
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // --- PLAYER HANDLERS ---
    const handleUnlockTeam = async (player: TournamentPlayer) => {
        if (!window.confirm(`Unlock and reset team for ${player.minecraftUsername}?`)) return;
        try {
            await apiCall('/api/admin/tournament/unlock-team', { discordId: player.discordId });
            setStatusMsg('Team unlocked!');
            fetchPlayers(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleRevokeRegistration = async (player: TournamentPlayer) => {
        if (!window.confirm(`Revoke registration for ${player.minecraftUsername}? This removes them entirely.`)) return;
        try {
            await apiCall('/api/admin/tournament/revoke-registration', { discordId: player.discordId });
            setStatusMsg('Registration revoked!');
            fetchPlayers(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // --- DUO HANDLERS ---
    const handleCreateDuo = async () => {
        if (!pairPlayer1 || !pairPlayer2) {
            setStatusMsg('Please select two players');
            return;
        }
        if (pairPlayer1.discordId === pairPlayer2.discordId) {
            setStatusMsg('Cannot pair a player with themselves');
            return;
        }
        try {
            await apiCall('/api/admin/tournament/duo/create', {
                seasonId: activeSeason!.seasonId,
                player1: { discordId: pairPlayer1.discordId, username: pairPlayer1.minecraftUsername },
                player2: { discordId: pairPlayer2.discordId, username: pairPlayer2.minecraftUsername },
                captain: pairCaptain
            });
            setStatusMsg('Duo created!');
            setShowPairModal(false);
            setPairPlayer1(null);
            setPairPlayer2(null);
            fetchDuos(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleDeleteDuo = async (duo: Duo) => {
        if (!window.confirm(`Remove duo: ${duo.player1Username} & ${duo.player2Username}?`)) return;
        try {
            await apiCall('/api/admin/tournament/duo/delete', { duoId: duo.duoId });
            setStatusMsg('Duo removed!');
            fetchDuos(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleChangeCaptain = async (duo: Duo) => {
        const newCaptainDiscordId = duo.captainDiscordId === duo.player1DiscordId ? duo.player2DiscordId : duo.player1DiscordId;
        const newCaptainName = duo.captainDiscordId === duo.player1DiscordId ? duo.player2Username : duo.player1Username;

        if (!window.confirm(`Make ${newCaptainName} the new captain?`)) return;

        try {
            await apiCall('/api/admin/tournament/duo/update-captain', {
                duoId: duo.duoId,
                newCaptainDiscordId
            });
            setStatusMsg(`Captain changed to ${newCaptainName}!`);
            fetchDuos(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleUnlockDuo = async (duo: Duo) => {
        if (!window.confirm(`Unlock team for ${duo.player1Username} & ${duo.player2Username}? They will be able to edit again.`)) return;
        try {
            await apiCall('/api/admin/tournament/duo/unlock', { duoId: duo.duoId });
            setStatusMsg('Duo team unlocked!');
            fetchDuos(activeSeason!.seasonId);
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // --- PARSE LOG HANDLERS ---
    const handleParseLog = async () => {
        if (!logText.trim()) {
            setStatusMsg('Please paste log text first');
            return;
        }
        try {
            await apiCall('/api/admin/tournament/parse-duo-logs', {
                logText,
                duoId: selectedDuoForParty?.duoId,
                player1Username: selectedDuoForParty?.player1Username,
                player2Username: selectedDuoForParty?.player2Username
            });
            setStatusMsg('Log parsed successfully!');
            setShowLogModal(false);
            setLogText('');
            setSelectedDuoForParty(null);
            fetchDuoParties();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleClearParty = async (duoId: string) => {
        if (!window.confirm('Clear party data for this duo?')) return;
        try {
            await apiCall('/api/admin/tournament/duo-party/clear', { duoId });
            setStatusMsg('Party data cleared!');
            fetchDuoParties();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // Helper function to get party data for a duo
    const getPartyForDuo = (duoId: string) => {
        return duoParties.find(p => p.duoId === duoId);
    };


    // Helper to check if player is already in a duo
    const isPlayerInDuo = (discordId: string) => {
        return duos.some(d => d.player1DiscordId === discordId || d.player2DiscordId === discordId);
    };

    // Get unpaired players for the pair modal
    const unpairedPlayers = players.filter(p => !isPlayerInDuo(p.discordId));

    // --- END TOURNAMENT ---
    const handleClearWinners = async () => {
        if (!window.confirm(`Are you sure you want to CLEAR winners for ${activeSeason?.name}? This cannot be undone.`)) return;

        try {
            await apiCall('/api/admin/tournament/clear-winners', {
                seasonId: activeSeason?.seasonId
            });
            setStatusMsg('Winners cleared successfully!');
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleEndTournament = async () => {
        const isDuos = activeSeason?.format.includes('Duos');
        const winners = isDuos
            ? [
                { rank: 1, teamName: finalWinners.rank1.teamName, player1: finalWinners.rank1.player1, player2: finalWinners.rank1.player2, score: finalWinners.rank1.score },
                { rank: 2, teamName: finalWinners.rank2.teamName, player1: finalWinners.rank2.player1, player2: finalWinners.rank2.player2, score: finalWinners.rank2.score },
                { rank: 3, teamName: finalWinners.rank3.teamName, player1: finalWinners.rank3.player1, player2: finalWinners.rank3.player2, score: finalWinners.rank3.score }
            ].filter(w => w.player1 || w.teamName)
            : [
                { rank: 1, username: finalWinners.rank1.player1, score: finalWinners.rank1.score },
                { rank: 2, username: finalWinners.rank2.player1, score: finalWinners.rank2.score },
                { rank: 3, username: finalWinners.rank3.player1, score: finalWinners.rank3.score }
            ].filter(w => w.username);

        console.log('Ending tournament with:', {
            seasonId: activeSeason?.seasonId,
            format: activeSeason?.format,
            isDuos,
            winners
        });

        try {
            await apiCall('/api/admin/tournament/end', {
                seasonId: activeSeason?.seasonId,
                winners,
                isDuos
            });
            setStatusMsg('Tournament ended!');
            setShowEndModal(false);
            fetchSeasons();
        } catch (e: any) {
            setStatusMsg(e.message);
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    // --- FILTERED PLAYERS ---
    const filteredPlayers = players.filter(p =>
        p.minecraftUsername.toLowerCase().includes(playerSearch.toLowerCase())
    );

    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#0a0505] via-[#120507] to-[#1a0a0e] flex items-center justify-center p-4">
                <form onSubmit={handleLogin} className="bg-black/60 p-8 rounded-2xl border border-white/10 w-full max-w-sm space-y-4">
                    <h1 className="text-2xl font-black text-white text-center uppercase tracking-wider">Tournament Admin</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter admin password"
                        className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-white placeholder-gray-500"
                    />
                    <button type="submit" className="w-full bg-brand-primary hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">
                        LOGIN
                    </button>
                    {statusMsg && <div className="text-red-400 text-center text-sm">{statusMsg}</div>}
                </form>
            </div>
        );
    }

    // --- MAIN ADMIN UI ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0505] via-[#120507] to-[#1a0a0e] p-4 md:p-8 text-white">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Tournament Admin</h1>
                    <p className="text-gray-500 text-sm">Manage seasons, players, and tournament progress</p>
                </div>
                <Link to="/minecraft" className="text-gray-400 hover:text-white transition-colors text-sm">
                    ← Back to Dashboard
                </Link>
            </div>

            {statusMsg && (
                <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 animate-bounce">
                    {statusMsg}
                </div>
            )}

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* SIDEBAR: Season & Status Management */}
                <div className="space-y-6">
                    {/* Season Selector */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4">Season</h3>
                        <select
                            value={activeSeason?.seasonId || ''}
                            onChange={e => {
                                const s = allSeasons.find(s => s.seasonId === parseInt(e.target.value));
                                if (s) setActiveSeason(s);
                            }}
                            className="w-full bg-black/40 border border-white/10 p-2 rounded text-white mb-4"
                        >
                            {allSeasons.map(s => (
                                <option key={s.seasonId} value={s.seasonId}>
                                    {s.name} {s.isArchived ? '(Archived)' : ''}
                                </option>
                            ))}
                        </select>

                        {activeSeason && (
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Format:</span>
                                    <span className="font-bold">{activeSeason.format}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status:</span>
                                    <span className={`font-bold ${activeSeason.status === 'ENDED' ? 'text-yellow-400' :
                                        activeSeason.status === 'ONGOING' ? 'text-green-400' :
                                            activeSeason.status === 'LOCK_IN' ? 'text-orange-400' : 'text-red-400'
                                        }`}>{activeSeason.status}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Controls */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4">Tournament Phase</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['DRAFTING', 'LOCK_IN', 'ONGOING', 'ENDED'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleSetStatus(status)}
                                    disabled={loading || activeSeason?.status === status}
                                    className={`py-2 px-3 rounded text-xs font-bold uppercase transition-all ${activeSeason?.status === status
                                        ? 'bg-white/20 text-white border-2 border-white/40'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Challonge URL Editor */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4">Challonge Bracket</h3>
                        <input
                            type="text"
                            value={editingChallongeUrl}
                            onChange={e => setEditingChallongeUrl(e.target.value)}
                            placeholder="https://challonge.com/your-bracket"
                            className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm mb-3"
                        />
                        <button
                            onClick={handleUpdateSeason}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-sm"
                        >
                            Save Challonge URL
                        </button>
                    </div>

                    {/* Create New Season */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4">New Season</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={newSeasonName}
                                onChange={e => setNewSeasonName(e.target.value)}
                                placeholder="Season Name"
                                className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm"
                            />
                            <select
                                value={newSeasonFormat}
                                onChange={e => setNewSeasonFormat(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm"
                            >
                                <option value="Singles 4v4">Singles 4v4</option>
                                <option value="Duos 2v2">Duos 2v2</option>
                            </select>
                            <input
                                type="text"
                                value={newSeasonChallongeUrl}
                                onChange={e => setNewSeasonChallongeUrl(e.target.value)}
                                placeholder="Challonge URL (optional)"
                                className="w-full bg-black/40 border border-white/10 p-2 rounded text-white text-sm"
                            />
                            <button
                                onClick={handleCreateSeason}
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded text-sm"
                            >
                                + Create Season
                            </button>
                        </div>
                    </div>

                    {/* Archive / End Season */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-red-500/20">
                        <h3 className="font-bold text-lg text-red-400 border-b border-red-500/20 pb-2 mb-4">Danger Zone</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    // Reset form data when opening modal
                                    setFinalWinners({
                                        rank1: { teamName: '', player1: '', player2: '', score: '' },
                                        rank2: { teamName: '', player1: '', player2: '', score: '' },
                                        rank3: { teamName: '', player1: '', player2: '', score: '' }
                                    });
                                    setShowEndModal(true);
                                }}
                                className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-1.5"
                            >
                                <Trophy className="w-4 h-4" /> End Tournament
                            </button>
                            <button
                                onClick={handleArchiveSeason}
                                disabled={loading || activeSeason?.isArchived}
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded text-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
                            >
                                <Archive className="w-4 h-4" /> Archive Season
                            </button>
                            <button
                                onClick={handleClearWinners}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded text-sm flex items-center justify-center gap-1.5"
                            >
                                <Trash2 className="w-4 h-4" /> Clear Winners (Reset)
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN: Player List with Tabs */}
                <div className="lg:col-span-3 bg-black/40 p-6 rounded-2xl border border-white/10">
                    {/* Tab Switcher */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPlayerListTab('solo')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${playerListTab === 'solo'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                Solo Players ({unpairedPlayers.length})
                            </button>
                            <button
                                onClick={() => setPlayerListTab('duos')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${playerListTab === 'duos'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                Duos ({duos.length})
                            </button>
                            <button
                                onClick={() => setPlayerListTab('parties')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${playerListTab === 'parties'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <Gamepad2 className="w-4 h-4 inline mr-2" /> Live Parties ({duoParties.length})
                            </button>
                            <button
                                onClick={() => setPlayerListTab('rules')}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${playerListTab === 'rules'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <ClipboardList className="w-4 h-4 inline mr-2" /> Format Desc
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={playerSearch}
                                onChange={e => setPlayerSearch(e.target.value)}
                                placeholder="Search..."
                                className="bg-black/40 border border-white/10 px-4 py-2 rounded-xl text-sm text-white w-48"
                            />
                            {activeSeason?.format.includes('Duos') && (
                                <button
                                    onClick={() => setShowPairModal(true)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-sm"
                                >
                                    + Pair Players
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Solo Players Tab */}
                    {playerListTab === 'solo' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {filteredPlayers.filter(p => !isPlayerInDuo(p.discordId)).map(player => (
                                <div
                                    key={player._id}
                                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img
                                            src={`https://mc-heads.net/avatar/${player.minecraftUsername}/40`}
                                            alt={player.minecraftUsername}
                                            className="w-10 h-10 rounded-lg"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white truncate">{player.minecraftUsername}</div>
                                            <div className="text-[10px] font-bold uppercase">
                                                {activeSeason?.format.includes('Duos') ? (
                                                    <span className="text-blue-400 flex items-center gap-1">
                                                        {isPlayerInDuo(player.discordId) ? (
                                                            <>
                                                                <Lock className="w-3 h-3 text-blue-400" />
                                                                <span>In Duo</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Hourglass className="w-3 h-3 text-blue-400 animate-pulse" />
                                                                <span>Awaiting Partner</span>
                                                            </>
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className={`flex items-center gap-1 ${player.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                                        {player.isLocked ? (
                                                            <>
                                                                <Lock className="w-3 h-3 text-green-400" />
                                                                <span>Team Locked</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Hourglass className="w-3 h-3 text-amber-400 animate-pulse" />
                                                                <span>Drafting</span>
                                                            </>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Show Pokemon grid only for Singles format */}
                                    {!activeSeason?.format.includes('Duos') && (
                                        <div className="grid grid-cols-6 gap-1 mb-3">
                                            {player.team.map((poke, idx) => (
                                                <PokemonImage key={idx} pokemon={poke} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {activeSeason?.format.includes('Duos') ? (
                                            <button
                                                onClick={() => {
                                                    if (!pairPlayer1) setPairPlayer1(player);
                                                    else if (!pairPlayer2) {
                                                        setPairPlayer2(player);
                                                        setShowPairModal(true);
                                                    }
                                                }}
                                                disabled={loading || isPlayerInDuo(player.discordId)}
                                                className="flex-1 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs font-bold py-1.5 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                            >
                                                {pairPlayer1?.discordId === player.discordId ? (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5" /> Selected
                                                    </>
                                                ) : 'Select for Duo'}
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setSelectedPlayer(player)}
                                                    className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleUnlockTeam(player)}
                                                    disabled={loading}
                                                    className="flex-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    Unlock
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleRevokeRegistration(player)}
                                            disabled={loading}
                                            className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Duos Tab */}
                    {playerListTab === 'duos' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                            {duos.length === 0 ? (
                                <div className="col-span-full text-center py-12 text-gray-500">
                                    <Users className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                                    No duos created yet. Select two players and pair them!
                                </div>
                            ) : duos.map(duo => (
                                <div
                                    key={duo.duoId}
                                    className="bg-gradient-to-br from-purple-900/30 to-black border border-purple-500/30 rounded-xl p-4"
                                >
                                    {/* Duo Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex -space-x-3">
                                            {/* Captain avatar first */}
                                            <img
                                                src={`https://mc-heads.net/avatar/${duo.captainDiscordId === duo.player1DiscordId ? duo.player1Username : duo.player2Username}/36`}
                                                className="w-9 h-9 rounded-lg border-2 border-yellow-500 z-10"
                                            />
                                            <img
                                                src={`https://mc-heads.net/avatar/${duo.captainDiscordId === duo.player1DiscordId ? duo.player2Username : duo.player1Username}/36`}
                                                className="w-9 h-9 rounded-lg border-2 border-purple-500/50"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            {/* Team Name (if set) */}
                                            {duo.teamName ? (
                                                <>
                                                    <div className="font-black text-purple-400 text-sm">{duo.teamName}</div>
                                                    <div className="text-[10px] text-gray-400">
                                                        {duo.captainDiscordId === duo.player1DiscordId
                                                            ? `${duo.player1Username} & ${duo.player2Username}`
                                                            : `${duo.player2Username} & ${duo.player1Username}`}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="font-bold text-white text-sm">
                                                    {duo.captainDiscordId === duo.player1DiscordId
                                                        ? `${duo.player1Username} & ${duo.player2Username}`
                                                        : `${duo.player2Username} & ${duo.player1Username}`}
                                                </div>
                                            )}
                                            <div className="text-[10px] font-bold uppercase flex items-center gap-1">
                                                {duo.isLocked ? (
                                                    <>
                                                        <Lock className="w-3.5 h-3.5 text-green-400" />
                                                        <span className="text-green-400">Team Locked</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                                                        <span className="text-amber-400">Drafting Pokemon</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Preview with Owner Colors */}
                                    {duo.team && duo.team.length > 0 && (
                                        <div className="space-y-2 mb-3">
                                            {/* Captain's Pokemon (first 3) */}
                                            <div className="flex items-center gap-2">
                                                <div className="text-[9px] font-black uppercase text-yellow-400 w-12">Captain</div>
                                                <div className="grid grid-cols-3 gap-1 flex-1">
                                                    {duo.team.slice(0, 3).map((poke, idx) => (
                                                        <div key={idx} className="border-2 border-yellow-500/30 rounded-lg">
                                                            <PokemonImage pokemon={poke} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            {/* Partner's Pokemon (last 3) */}
                                            <div className="flex items-center gap-2">
                                                <div className="text-[9px] font-black uppercase text-purple-400 w-12">Partner</div>
                                                <div className="grid grid-cols-3 gap-1 flex-1">
                                                    {duo.team.slice(3, 6).map((poke, idx) => (
                                                        <div key={idx + 3} className="border-2 border-purple-500/30 rounded-lg">
                                                            <PokemonImage pokemon={poke} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {duo.isLocked && (
                                            <button
                                                onClick={() => handleUnlockDuo(duo)}
                                                disabled={loading}
                                                className="flex-1 bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 text-xs font-bold py-1.5 rounded transition-colors"
                                            >
                                                Unlock
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleChangeCaptain(duo)}
                                            disabled={loading}
                                            className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-400 text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            Swap Captain
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDuo(duo)}
                                            disabled={loading}
                                            className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold py-1.5 rounded transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Live Parties Tab */}
                    {playerListTab === 'parties' && (
                        <div className="space-y-4">
                            {/* Parse Logs Button */}
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-400">
                                    Paste server logs to parse Pokemon picks from in-game duo party building.
                                </div>
                                <button
                                    onClick={() => setShowLogModal(true)}
                                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5"
                                >
                                    <ClipboardList className="w-4 h-4" /> Parse from Logs
                                </button>
                            </div>

                            {/* Party Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
                                {duos.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                                        No duos to show party data for yet.
                                    </div>
                                ) : duos.map(duo => {
                                    const party = getPartyForDuo(duo.duoId);
                                    return (
                                        <div
                                            key={duo.duoId}
                                            className="bg-gradient-to-br from-green-900/30 to-black border border-green-500/30 rounded-xl p-4"
                                        >
                                            {/* Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex -space-x-3">
                                                    <img
                                                        src={`https://mc-heads.net/avatar/${duo.player1Username}/36`}
                                                        className="w-9 h-9 rounded-lg border-2 border-green-500/50"
                                                    />
                                                    <img
                                                        src={`https://mc-heads.net/avatar/${duo.player2Username}/36`}
                                                        className="w-9 h-9 rounded-lg border-2 border-green-500/30"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-white text-sm">
                                                        {duo.player1Username} & {duo.player2Username}
                                                    </div>
                                                    <div className={`text-[10px] font-bold uppercase ${party ? 'text-green-400' : 'text-gray-500'}`}>
                                                        {party ? `Updated ${new Date(party.lastUpdated).toLocaleString()}` : 'No party data yet'}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Party Display */}
                                            {party ? (
                                                <div className="space-y-3 mb-3">
                                                    {/* Player 1 Picks */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[9px] font-black uppercase text-green-400 w-16 truncate">
                                                            {duo.player1Username}
                                                        </div>
                                                        <div className="flex gap-1 flex-1">
                                                            {party.player1Picks.map((poke, idx) => (
                                                                <div key={idx} className="bg-black/40 border border-green-500/30 rounded px-2 py-1 text-[10px] font-bold text-white">
                                                                    {poke.name} <span className="text-green-400">Lv{poke.level}</span>
                                                                </div>
                                                            ))}
                                                            {party.player1Picks.length === 0 && (
                                                                <span className="text-gray-500 text-[10px]">No picks</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {/* Player 2 Picks */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="text-[9px] font-black uppercase text-green-400 w-16 truncate">
                                                            {duo.player2Username}
                                                        </div>
                                                        <div className="flex gap-1 flex-1">
                                                            {party.player2Picks.map((poke, idx) => (
                                                                <div key={idx} className="bg-black/40 border border-green-500/30 rounded px-2 py-1 text-[10px] font-bold text-white">
                                                                    {poke.name} <span className="text-green-400">Lv{poke.level}</span>
                                                                </div>
                                                            ))}
                                                            {party.player2Picks.length === 0 && (
                                                                <span className="text-gray-500 text-[10px]">No picks</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-gray-500 text-sm">
                                                    No party data. Parse logs to add.
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedDuoForParty(duo);
                                                        setShowLogModal(true);
                                                    }}
                                                    className="flex-1 bg-green-600/20 hover:bg-green-600/40 text-green-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                >
                                                    {party ? 'Update Picks' : 'Add Picks'}
                                                </button>
                                                {party && (
                                                    <button
                                                        onClick={() => handleClearParty(duo.duoId)}
                                                        disabled={loading}
                                                        className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold py-1.5 rounded transition-colors"
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {playerListTab === 'rules' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="border-b border-white/10 pb-4">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-400" /> Edit Format Description
                                </h3>
                                <p className="text-gray-400 text-xs mt-1">
                                    Update the official format description shown at the top of the Rules tab on the tournament page.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide">
                                            Official Format Description
                                        </label>
                                    </div>

                                    <RichTextEditor
                                        value={ruleGeneralDesc}
                                        onChange={setRuleGeneralDesc}
                                        placeholder="Enter high level description of the tournament format..."
                                    />
                                    <p className="text-xs text-gray-500 italic">
                                        Use the toolbar to bold, underline, italicize, or apply vibrant colors to selected text.
                                    </p>
                                </div>

                                {/* Live Preview Section */}
                                <div className="space-y-2 pt-4 border-t border-white/5">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                        <Eye className="w-4 h-4 text-gray-400" /> Real-time Live Preview (As seen on site)
                                    </label>
                                    <div className="bg-gradient-to-br from-[#ff007f]/15 to-black border border-[#ff007f]/30 p-6 rounded-2xl relative overflow-hidden shadow-inner">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-[#ff007f]">
                                            <Trophy className="w-24 h-24" />
                                        </div>
                                        <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Official Format</h4>
                                        <div className="text-base text-gray-200 leading-relaxed min-h-[3rem] break-words">
                                            {ruleGeneralDesc ? (
                                                <div dangerouslySetInnerHTML={{ __html: ruleGeneralDesc.includes('<') ? ruleGeneralDesc : ruleGeneralDesc.replace(/\n/g, '<br />') }} />
                                            ) : (
                                                <span className="text-gray-500 italic text-sm">No description entered yet. The default template description will be shown on the main page.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={handleSaveRulesOverhaul}
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Format Description
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PAIR PLAYERS MODAL */}
            {showPairModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a0b0e] p-8 rounded-2xl border border-purple-500/30 w-full max-w-lg space-y-6">
                        <h3 className="text-2xl font-black text-purple-400 text-center uppercase flex items-center justify-center gap-2">
                            <Users className="w-6 h-6" /> Create Duo
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Player 1</label>
                                <select
                                    value={pairPlayer1?.discordId || ''}
                                    onChange={e => setPairPlayer1(unpairedPlayers.find(p => p.discordId === e.target.value) || null)}
                                    className="w-full bg-black/40 border border-white/10 p-2 rounded text-white"
                                >
                                    <option value="">Select player...</option>
                                    {unpairedPlayers.map(p => (
                                        <option key={p.discordId} value={p.discordId}>{p.minecraftUsername}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Player 2</label>
                                <select
                                    value={pairPlayer2?.discordId || ''}
                                    onChange={e => setPairPlayer2(unpairedPlayers.find(p => p.discordId === e.target.value) || null)}
                                    className="w-full bg-black/40 border border-white/10 p-2 rounded text-white"
                                >
                                    <option value="">Select player...</option>
                                    {unpairedPlayers.filter(p => p.discordId !== pairPlayer1?.discordId).map(p => (
                                        <option key={p.discordId} value={p.discordId}>{p.minecraftUsername}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Team Captain</label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPairCaptain('player1')}
                                    className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center justify-center ${pairCaptain === 'player1'
                                        ? 'bg-yellow-600 border-yellow-400 text-white'
                                        : 'bg-black/40 border-white/10 text-gray-400'
                                        }`}
                                >
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                    <div className="font-bold text-sm mt-1">{pairPlayer1?.minecraftUsername || 'Player 1'}</div>
                                </button>
                                <button
                                    onClick={() => setPairCaptain('player2')}
                                    className={`flex-1 p-3 rounded-xl border transition-all flex flex-col items-center justify-center ${pairCaptain === 'player2'
                                        ? 'bg-yellow-600 border-yellow-400 text-white'
                                        : 'bg-black/40 border-white/10 text-gray-400'
                                        }`}
                                >
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                    <div className="font-bold text-sm mt-1">{pairPlayer2?.minecraftUsername || 'Player 2'}</div>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPairModal(false);
                                    setPairPlayer1(null);
                                    setPairPlayer2(null);
                                }}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateDuo}
                                disabled={loading || !pairPlayer1 || !pairPlayer2}
                                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded disabled:opacity-50"
                            >
                                Create Duo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* END TOURNAMENT MODAL */}
            {showEndModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a0b0e] p-8 rounded-2xl border border-white/10 w-full max-w-md space-y-6">
                        <h3 className="text-2xl font-black text-yellow-400 text-center uppercase flex items-center justify-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" /> End Tournament
                        </h3>
                        <p className="text-gray-400 text-center text-sm">Enter the final placements to end {activeSeason?.name}</p>

                        <div className="space-y-4">
                            {[1, 2, 3].map(rank => {
                                const key = `rank${rank}` as keyof typeof finalWinners;
                                const isDuos = activeSeason?.format.includes('Duos');
                                return (
                                    <div key={rank} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-black shrink-0 ${rank === 1 ? 'bg-yellow-500 text-yellow-900' :
                                                rank === 2 ? 'bg-gray-400 text-gray-900' :
                                                    'bg-orange-700 text-orange-200'
                                                }`}>{rank}</span>
                                            <span className="text-white font-bold text-sm flex items-center gap-1.5">
                                                {rank === 1 && <Crown className="w-4 h-4 text-yellow-400" />}
                                                {rank === 1 ? '1st Place' : rank === 2 ? '2nd Place' : '3rd Place'}
                                            </span>
                                        </div>
                                        {isDuos ? (
                                            <div className="pl-10 space-y-2">
                                                <input
                                                    type="text"
                                                    value={finalWinners[key].teamName}
                                                    onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], teamName: e.target.value } }))}
                                                    placeholder="Team Name"
                                                    className="w-full bg-black/40 border border-purple-500/30 p-2 rounded text-white text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={finalWinners[key].player1}
                                                        onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], player1: e.target.value } }))}
                                                        placeholder="Player 1"
                                                        className="flex-1 bg-black/40 border border-yellow-500/30 p-2 rounded text-white text-sm"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={finalWinners[key].player2}
                                                        onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], player2: e.target.value } }))}
                                                        placeholder="Player 2"
                                                        className="flex-1 bg-black/40 border border-purple-500/30 p-2 rounded text-white text-sm"
                                                    />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={finalWinners[key].score}
                                                    onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], score: e.target.value } }))}
                                                    placeholder="Score (e.g. 3-1)"
                                                    className="w-24 bg-black/40 border border-white/10 p-2 rounded text-white text-sm text-center"
                                                />
                                            </div>
                                        ) : (
                                            <div className="pl-10 flex gap-2">
                                                <input
                                                    type="text"
                                                    value={finalWinners[key].player1}
                                                    onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], player1: e.target.value } }))}
                                                    placeholder="Username"
                                                    className="flex-1 bg-black/40 border border-white/10 p-2 rounded text-white"
                                                />
                                                <input
                                                    type="text"
                                                    value={finalWinners[key].score}
                                                    onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], score: e.target.value } }))}
                                                    placeholder="W-L"
                                                    className="w-20 bg-black/40 border border-white/10 p-2 rounded text-white text-center"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEndModal(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEndTournament}
                                disabled={loading}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded"
                            >
                                Confirm & End
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PLAYER DETAIL MODAL */}
            {selectedPlayer && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a0b0e] p-8 rounded-2xl border border-white/10 w-full max-w-2xl space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://mc-heads.net/avatar/${selectedPlayer.minecraftUsername}/64`}
                                    alt={selectedPlayer.minecraftUsername}
                                    className="w-16 h-16 rounded-xl"
                                />
                                <div>
                                    <h3 className="text-2xl font-black text-white">{selectedPlayer.minecraftUsername}</h3>
                                    <div className="text-sm font-bold uppercase">
                                        {selectedPlayer.isLocked ? (
                                            <span className="text-green-400 flex items-center gap-1">
                                                <Lock className="w-4 h-4 text-green-400" />
                                                <span>Team Locked</span>
                                            </span>
                                        ) : (
                                            <span className="text-amber-400 flex items-center gap-1">
                                                <Hourglass className="w-4 h-4 text-amber-400 animate-pulse" />
                                                <span>Still Drafting</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPlayer(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {selectedPlayer.team.map((poke, idx) => (
                                <div key={idx} className="aspect-square bg-black/40 rounded-xl border border-white/10 overflow-hidden p-2 flex items-center justify-center">
                                    {poke ? (
                                        <div className="text-center">
                                            <img
                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${poke.id}.png`}
                                                alt={poke.name}
                                                className="w-20 h-20 object-contain mx-auto"
                                            />
                                            <div className="text-white font-bold text-sm mt-1">{poke.name}</div>
                                            <div className="text-gray-500 text-xs">#{poke.id}</div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 text-4xl font-black">?</span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { handleUnlockTeam(selectedPlayer); setSelectedPlayer(null); }}
                                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded"
                            >
                                Unlock Team
                            </button>
                            <button
                                onClick={() => { handleRevokeRegistration(selectedPlayer); setSelectedPlayer(null); }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded"
                            >
                                Revoke Registration
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* LOG PARSE MODAL */}
            {showLogModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#0a1a0f] p-8 rounded-2xl border border-green-500/30 w-full max-w-2xl space-y-6">
                        <h3 className="text-2xl font-black text-green-400 text-center uppercase flex items-center justify-center gap-2">
                            <ClipboardList className="w-6 h-6" /> Parse Server Logs
                        </h3>

                        {selectedDuoForParty && (
                            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    <img
                                        src={`https://mc-heads.net/avatar/${selectedDuoForParty.player1Username}/32`}
                                        className="w-8 h-8 rounded-lg border border-green-500/50"
                                    />
                                    <img
                                        src={`https://mc-heads.net/avatar/${selectedDuoForParty.player2Username}/32`}
                                        className="w-8 h-8 rounded-lg border border-green-500/30"
                                    />
                                </div>
                                <div className="text-white font-bold">
                                    {selectedDuoForParty.player1Username} & {selectedDuoForParty.player2Username}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase block mb-2">
                                Paste Log Text
                            </label>
                            <textarea
                                value={logText}
                                onChange={e => setLogText(e.target.value)}
                                placeholder={'Paste server log lines here...\n\nExpected format:\nPikachu (Lv.50)\nCharizard (Lv.50)\netc.'}
                                rows={8}
                                className="w-full bg-black/50 border border-green-500/30 p-4 rounded-xl text-white text-sm font-mono resize-none"
                            />
                            <div className="text-[10px] text-gray-500 mt-2">
                                The parser will extract Pokemon names and levels. First 3 go to Player 1, next 3 go to Player 2.
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowLogModal(false);
                                    setLogText('');
                                    setSelectedDuoForParty(null);
                                }}
                                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleParseLog}
                                disabled={loading || !logText.trim()}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded disabled:opacity-50"
                            >
                                Parse & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTournament;
