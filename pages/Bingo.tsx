
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import { getSpawnInfo } from '../data/legendaryConfig';
import { LAMB_POOL, WAGYU_POOL } from '../data/gachaPools';

// --- TYPES ---
interface BingoCell {
    id: number;
    name: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical' | 'Free';
    spawns: string[];
}

interface CobblemonEntry {
    id: number;
    name: string;
    rarity: BingoCell['rarity'];
    spawns: Set<string>;
}

// --- CONSTANTS ---
const SHEET_ID = '16JrrEp919HVn8YE0AtmeAu6_tPkMkKqEmRzMlKW442A';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

const PREFIX_TO_DIFF: Record<string, string> = {
    'D': 'Default',
    'E': 'Easy',
    'N': 'Normal',
    'H': 'Hard',
    'I': 'Insane',
    'X': 'Nightmare'
};

const MANUAL_POOL_DATA: { id: number, name: string, rarity: BingoCell['rarity'] }[] = [
    { id: 382, name: 'Kyogre', rarity: 'Legendary' }, { id: 383, name: 'Groudon', rarity: 'Legendary' },
    { id: 483, name: 'Dialga', rarity: 'Legendary' }, { id: 487, name: 'Giratina', rarity: 'Legendary' },
    { id: 381, name: 'Latios', rarity: 'Legendary' }, { id: 380, name: 'Latias', rarity: 'Legendary' },
    { id: 384, name: 'Rayquaza', rarity: 'Legendary' }, { id: 1017, name: 'Ogerpon', rarity: 'Legendary' },
    { id: 644, name: 'Zekrom', rarity: 'Legendary' }, { id: 643, name: 'Reshiram', rarity: 'Legendary' },
    { id: 717, name: 'Yveltal', rarity: 'Legendary' }, { id: 1008, name: 'Miraidon', rarity: 'Legendary' },
    { id: 1007, name: 'Koraidon', rarity: 'Legendary' }, { id: 788, name: 'Tapu Fini', rarity: 'Legendary' },
    { id: 787, name: 'Tapu Bulu', rarity: 'Legendary' }, { id: 786, name: 'Tapu Lele', rarity: 'Legendary' },
    { id: 785, name: 'Tapu Koko', rarity: 'Legendary' }, { id: 480, name: 'Uxie', rarity: 'Legendary' },
    { id: 891, name: 'Kubfu', rarity: 'Legendary' }, { id: 772, name: 'Type: Null', rarity: 'Legendary' },
    { id: 800, name: 'Necrozma', rarity: 'Legendary' }, { id: 484, name: 'Palkia', rarity: 'Legendary' },
    { id: 896, name: 'Glastrier', rarity: 'Legendary' }, { id: 889, name: 'Zamazenta', rarity: 'Legendary' },
    { id: 897, name: 'Spectrier', rarity: 'Legendary' }, { id: 1001, name: 'Wo-Chien', rarity: 'Legendary' },
    { id: 1003, name: 'Ting-Lu', rarity: 'Legendary' }, { id: 1002, name: 'Chien-Pao', rarity: 'Legendary' },
    { id: 1004, name: 'Chi-Yu', rarity: 'Legendary' }, { id: 895, name: 'Regidrago', rarity: 'Legendary' },
    { id: 894, name: 'Regieleki', rarity: 'Legendary' }, { id: 377, name: 'Regirock', rarity: 'Legendary' },
    { id: 378, name: 'Regice', rarity: 'Legendary' }, { id: 379, name: 'Registeel', rarity: 'Legendary' },
    { id: 485, name: 'Heatran', rarity: 'Legendary' }, { id: 890, name: 'Eternatus', rarity: 'Legendary' },
    { id: 488, name: 'Cresselia', rarity: 'Legendary' }, { id: 481, name: 'Mesprit', rarity: 'Legendary' },
    { id: 638, name: 'Cobalion', rarity: 'Legendary' }, { id: 640, name: 'Virizion', rarity: 'Legendary' },
    { id: 646, name: 'Kyurem', rarity: 'Legendary' }, { id: 898, name: 'Calyrex', rarity: 'Legendary' },
    { id: 482, name: 'Azelf', rarity: 'Legendary' }, { id: 1024, name: 'Terapagos', rarity: 'Legendary' },
    { id: 789, name: 'Cosmog', rarity: 'Legendary' }, { id: 249, name: 'Lugia', rarity: 'Legendary' },
    { id: 716, name: 'Xerneas', rarity: 'Legendary' }, { id: 645, name: 'Landorus', rarity: 'Legendary' },
    { id: 642, name: 'Thundurus', rarity: 'Legendary' }, { id: 641, name: 'Tornadus', rarity: 'Legendary' },
    { id: 905, name: 'Enamorus', rarity: 'Legendary' }, { id: 888, name: 'Zacian', rarity: 'Legendary' },
    { id: 250, name: 'Ho-Oh', rarity: 'Legendary' }, { id: 150, name: 'Mewtwo', rarity: 'Legendary' },
    { id: 243, name: 'Raikou', rarity: 'Legendary' }, { id: 244, name: 'Entei', rarity: 'Legendary' },
    { id: 792, name: 'Lunala', rarity: 'Legendary' }, { id: 146, name: 'Moltres', rarity: 'Legendary' },
    { id: 639, name: 'Terrakion', rarity: 'Legendary' }, { id: 245, name: 'Suicune', rarity: 'Legendary' },
    { id: 791, name: 'Solgaleo', rarity: 'Legendary' }, { id: 144, name: 'Articuno', rarity: 'Legendary' },
    { id: 145, name: 'Zapdos', rarity: 'Legendary' }, { id: 151, name: 'Mew', rarity: 'Mythical' }
];

const FREE_SPACE_CELL: BingoCell = {
    id: -1,
    name: "FREE SPACE",
    rarity: "Free",
    spawns: ["Enjoy!"]
};

// --- UTILS ---
const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
};

const mulberry32 = (a: number) => {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
};

const mapRarity = (val: string | undefined): BingoCell['rarity'] => {
    if (!val) return 'Common';
    const v = val.toLowerCase();
    if (v.includes('mythic')) return 'Mythical';
    if (v.includes('legend')) return 'Legendary';
    if (v.includes('ultra')) return 'Ultra-Rare';
    if (v.includes('rare')) return 'Rare';
    if (v.includes('uncommon')) return 'Uncommon';
    return 'Common';
};

const getFormattedName = (name: string) => {
    return name.toLowerCase().trim()
        .replace(/[.':]/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
};

const Bingo: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Auth
    const [user, setUser] = useState<any>(null);

    // State
    const [loading, setLoading] = useState(false);
    const [grid, setGrid] = useState<BingoCell[]>([]);
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
    
    // Card ID Management
    const [currentCardId, setCurrentCardId] = useState<string>('');
    const [inputCardId, setInputCardId] = useState('');
    const [copiedId, setCopiedId] = useState(false);
    const [difficulty, setDifficulty] = useState('Default');

    // Saving/Loading
    const [saving, setSaving] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [savedCards, setSavedCards] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'play' | 'saved'>('play');

    useEffect(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) setUser(JSON.parse(stored));
        
        const view = searchParams.get('view');
        if (view === 'saved') {
            setViewMode('saved');
        } else {
            const id = searchParams.get('id');
            if (id) {
                setCurrentCardId(id.toUpperCase());
                setInputCardId(id.toUpperCase());
                generateGrid(id.toUpperCase());
            } else {
                // Generate a random daily seed if none provided
                const randomId = `D-${new Date().toISOString().split('T')[0].replace(/-/g,'')}`;
                setCurrentCardId(randomId);
                generateGrid(randomId);
            }
        }
    }, [searchParams]);

    useEffect(() => {
        if (viewMode === 'saved' && user) {
            fetchSavedCards();
        }
    }, [viewMode, user]);

    const fetchSavedCards = async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/list?discordId=${user.id}`);
            if (res.ok) setSavedCards(await res.json());
        } catch (e) { console.error(e); }
    };

    const generateGrid = async (seedString: string) => {
        setLoading(true);
        try {
            // Determine Difficulty
            let diff = 'Default';
            const parts = seedString.split('-');
            if (parts.length >= 2 && PREFIX_TO_DIFF[parts[0]]) {
                diff = PREFIX_TO_DIFF[parts[0]];
            }
            setDifficulty(diff);

            const res = await fetch(CSV_EXPORT_URL);
            const text = await res.text();
            
            // Parse CSV
            const rows = text.split('\n').map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, '').trim()));
            const poolMap = new Map<string, CobblemonEntry>();

            rows.forEach((cols, index) => {
                if (index === 0) return;
                let rawName = cols[1];
                if (!rawName || !rawName.trim()) return;
                const name = rawName.replace(/\[.*?\]/g, '').trim();
                const key = name.toLowerCase();
                
                let entry = poolMap.get(key);
                if (!entry) {
                    const id = parseInt(cols[0]) || 0;
                    const rarity = mapRarity(cols[3]);
                    entry = { id, name, rarity, spawns: new Set() };
                }
                poolMap.set(key, entry);
            });

            // Merge Manual Data
            MANUAL_POOL_DATA.forEach(m => {
                const key = m.name.toLowerCase();
                const ex = poolMap.get(key);
                
                const parsedInfo = getSpawnInfo(m.name);
                const spawns = new Set<string>();
                if (parsedInfo) spawns.add(parsedInfo);
                else {
                    if (m.rarity === 'Legendary') spawns.add("Check Quest Book");
                    else if (m.rarity === 'Mythical') spawns.add("Mythic");
                }

                if (ex) { 
                    ex.id = m.id; 
                    ex.rarity = m.rarity; 
                    ex.spawns = spawns;
                    poolMap.set(key, ex); 
                } else {
                    poolMap.set(key, { id: m.id, name: m.name, rarity: m.rarity, spawns: spawns });
                }
            });

            // Filter
            const excludedIds = new Set<number>();
            [...LAMB_POOL, ...WAGYU_POOL].forEach(item => { if (item.type === 'Pokemon') excludedIds.add(item.id); });

            let cobblemonPool = Array.from(poolMap.values()).filter(entry => {
                if (entry.rarity === 'Legendary' || entry.rarity === 'Mythical') return true;
                return !excludedIds.has(entry.id);
            });

            cobblemonPool.sort((a, b) => {
                if (a.id !== b.id) return a.id - b.id;
                return a.name.localeCompare(b.name);
            });

            // RNG
            const seed = cyrb128(seedString);
            const rng = mulberry32(seed[0]);

            const getRandomItems = (rarities: BingoCell['rarity'][], count: number) => {
                let pool = cobblemonPool.filter(p => rarities.includes(p.rarity));
                if (pool.length === 0) pool = cobblemonPool;
                pool = [...pool];
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
                return pool.slice(0, count).map(entry => ({
                    id: entry.id, name: entry.name, rarity: entry.rarity, spawns: Array.from(entry.spawns)
                }));
            };

            let selected: BingoCell[] = [];
            if (diff === 'Easy') {
                selected = [...getRandomItems(['Common'], 12), ...getRandomItems(['Uncommon'], 12)];
            } else if (diff === 'Normal') {
                selected = [
                    ...getRandomItems(['Common'], 6), ...getRandomItems(['Uncommon'], 6),
                    ...getRandomItems(['Rare'], 6), ...getRandomItems(['Ultra-Rare'], 6)
                ];
            } else if (diff === 'Hard') {
                selected = [...getRandomItems(['Rare'], 12), ...getRandomItems(['Ultra-Rare'], 12)];
            } else if (diff === 'Insane') {
                selected = getRandomItems(['Ultra-Rare'], 24);
            } else if (diff === 'Nightmare') {
                selected = getRandomItems(['Ultra-Rare'], 20);
            } else {
                const tempPool = [...cobblemonPool];
                for (let i = tempPool.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [tempPool[i], tempPool[j]] = [tempPool[j], tempPool[i]];
                }
                selected = tempPool.slice(0, 24).map(e => ({ id: e.id, name: e.name, rarity: e.rarity, spawns: Array.from(e.spawns) }));
            }

            for (let i = selected.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [selected[i], selected[j]] = [selected[j], selected[i]];
            }

            const finalGrid: BingoCell[] = new Array(25).fill(null);
            const fillGrid = (source: BingoCell[], skipIndices: number[]) => {
                let sourceIdx = 0;
                for (let i = 0; i < 25; i++) {
                    if (skipIndices.includes(i)) continue;
                    finalGrid[i] = sourceIdx < source.length ? source[sourceIdx++] : getRandomItems(['Common'], 1)[0];
                }
            };

            if (diff === 'Insane') {
                fillGrid(selected, [12]);
                finalGrid[12] = getRandomItems(['Legendary'], 1)[0];
            } else if (diff === 'Nightmare') {
                const corners = [0, 4, 20, 24];
                fillGrid(selected, [12, ...corners]);
                finalGrid[12] = getRandomItems(['Mythical'], 1)[0];
                const legends = getRandomItems(['Legendary'], 4);
                corners.forEach((idx, i) => finalGrid[idx] = legends[i]);
            } else {
                fillGrid(selected, [12]);
                finalGrid[12] = FREE_SPACE_CELL;
            }

            setGrid(finalGrid);
            setMarked(new Array(25).fill(false)); // Reset marks on new generation
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(currentCardId);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    };

    const handleManualLoad = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCardId.trim()) {
            navigate(`/minecraft/bingo/card?id=${inputCardId.trim().toUpperCase()}`);
        }
    };

    const toggleMark = (index: number) => {
        setMarked(prev => {
            const next = [...prev];
            next[index] = !next[index];
            return next;
        });
    };

    const handleSave = async () => {
        if (!user || !saveName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    name: saveName.trim(),
                    cardId: currentCardId,
                    gridData: grid,
                    marked: marked
                })
            });
            if (res.ok) {
                alert("Card saved!");
                setSaveName('');
            }
        } catch (e) { alert("Save failed"); } finally { setSaving(false); }
    };

    const handleLoadSaved = (card: any) => {
        setCurrentCardId(card.cardId);
        setInputCardId(card.cardId);
        setGrid(card.gridData);
        setMarked(card.marked || new Array(25).fill(false));
        // Parse diff for UI
        const parts = card.cardId.split('-');
        if (parts.length >= 2 && PREFIX_TO_DIFF[parts[0]]) {
            setDifficulty(PREFIX_TO_DIFF[parts[0]]);
        } else {
            setDifficulty('Default');
        }
        setViewMode('play');
        navigate(`/minecraft/bingo/card?id=${card.cardId}`, { replace: true });
    };

    const handleDeleteSaved = async (name: string) => {
        if (!window.confirm("Delete this saved card?")) return;
        try {
            await fetch(`${API_BASE_URL}/api/bingo/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id, name })
            });
            fetchSavedCards();
        } catch(e) {}
    };

    const getCellImage = (item: BingoCell) => {
        if (item.id === -1) return "https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif";
        return `https://cobblemon.tools/pokedex/pokemon/${getFormattedName(item.name)}/sprite.png`;
    };

    if (viewMode === 'saved') {
        return (
            <div className="min-h-screen py-8 font-sans text-white relative">
                <UserProfile className="!absolute top-4 right-4" />
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link to="/minecraft/bingo" className="text-gray-400 hover:text-white mb-6 inline-block">← Back to Dashboard</Link>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-black">Saved Cards</h1>
                        <Link to="/minecraft/bingo/card" className="bg-brand-primary px-4 py-2 rounded-lg font-bold text-sm">Create New</Link>
                    </div>
                    
                    {!user ? (
                        <div className="text-center py-20 bg-black/30 rounded-2xl">Please login to view saved cards.</div>
                    ) : savedCards.length === 0 ? (
                        <div className="text-center py-20 bg-black/30 rounded-2xl">No saved cards found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {savedCards.map((card) => (
                                <div key={card._id} className="bg-black/30 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-xl">{card.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {card.cardId}</div>
                                        <div className="text-xs text-gray-400 mt-1">Last updated: {new Date(card.updatedAt).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleLoadSaved(card)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Load</button>
                                        <button onClick={() => handleDeleteSaved(card.name)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-4 font-sans text-white relative">
            <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />
            
            <div className="container mx-auto px-4 pt-4 pb-2">
                <Link to="/minecraft/bingo" className="text-gray-400 hover:text-white mb-4 inline-block text-sm">← Back to Dashboard</Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 justify-center items-start px-4 max-w-7xl mx-auto">
                
                {/* Control Panel */}
                <div className="w-full lg:w-80 flex flex-col gap-6 order-2 lg:order-1">
                    <div className="bg-black/30 border border-white/10 p-6 rounded-2xl space-y-6">
                        
                        {/* Title */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Control Deck</div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        {/* Current Card ID Display */}
                        <div className="bg-black/40 border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between group">
                            <div className="flex flex-col min-w-0">
                                <span className="text-[8px] uppercase font-bold text-gray-500 tracking-wider">Current Card ID</span>
                                <span className="font-mono font-bold text-brand-primary tracking-widest text-sm truncate pr-2 select-all">
                                    {currentCardId || "----"}
                                </span>
                            </div>
                            <button 
                                onClick={handleCopyId}
                                disabled={!currentCardId}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Copy ID"
                            >
                                {copiedId ? (
                                    <span className="text-green-500 text-xs font-bold">✓</span>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleManualLoad} className="flex gap-2">
                            <input 
                                type="text" 
                                value={inputCardId}
                                onChange={(e) => setInputCardId(e.target.value.toUpperCase())}
                                placeholder="Enter Card ID..."
                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:border-brand-primary outline-none"
                            />
                            <button type="submit" className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors">
                                Load
                            </button>
                        </form>

                        <div className="border-t border-white/10 pt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">Difficulty</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                    difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                                    difficulty === 'Normal' ? 'bg-blue-500/20 text-blue-400' :
                                    difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400' :
                                    difficulty === 'Insane' ? 'bg-red-500/20 text-red-400' :
                                    difficulty === 'Nightmare' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-gray-500/20 text-gray-400'
                                }`}>
                                    {difficulty}
                                </span>
                            </div>
                        </div>

                        {/* Save Section */}
                        {user && (
                            <div className="border-t border-white/10 pt-4">
                                <div className="text-xs font-bold text-gray-400 uppercase mb-2">Save Progress</div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={saveName} 
                                        onChange={(e) => setSaveName(e.target.value)} 
                                        placeholder="Name this card..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-brand-primary outline-none"
                                    />
                                    <button 
                                        onClick={handleSave} 
                                        disabled={saving || !saveName.trim()}
                                        className="bg-brand-primary hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                                    >
                                        {saving ? '...' : 'Save'}
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="text-[10px] text-gray-500 text-center">
                            Don't forget to save your progress if logged in!
                        </div>
                    </div>
                </div>

                {/* Grid Area */}
                <div className="flex-1 order-1 lg:order-2 flex justify-center w-full">
                    {loading ? (
                        <div className="h-[600px] flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-brand-primary font-bold animate-pulse">Generating Card...</div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full max-w-[600px] aspect-square bg-[#1a0b0e] rounded-3xl border-[8px] border-[#3a1017] shadow-2xl p-4 overflow-hidden relative">
                            <div className="grid grid-cols-5 gap-1 w-full h-full">
                                {grid.map((cell, idx) => {
                                    const isMarked = marked[idx];
                                    let borderColor = "border-gray-700";
                                    let bgColor = "bg-gray-800/50";
                                    
                                    if (cell.rarity === 'Mythical') { borderColor = "border-pink-500"; bgColor = "bg-pink-900/30"; }
                                    else if (cell.rarity === 'Legendary') { borderColor = "border-yellow-500"; bgColor = "bg-yellow-900/30"; }
                                    else if (cell.rarity === 'Ultra-Rare') { borderColor = "border-purple-500"; bgColor = "bg-purple-900/30"; }
                                    else if (cell.rarity === 'Rare') { borderColor = "border-blue-500"; bgColor = "bg-blue-900/30"; }
                                    else if (cell.rarity === 'Uncommon') { borderColor = "border-green-600"; bgColor = "bg-green-900/30"; }
                                    if (cell.id === -1) { borderColor = "border-white"; bgColor = "bg-white/10"; }

                                    return (
                                        <div 
                                            key={idx}
                                            onClick={() => toggleMark(idx)}
                                            className={`
                                                relative border-2 rounded-lg flex flex-col items-center justify-center p-1 cursor-pointer transition-all duration-200 group
                                                ${borderColor} ${bgColor}
                                                ${isMarked ? 'bg-green-500/20 border-green-400 grayscale-0' : 'grayscale-[0.3] hover:grayscale-0 hover:bg-white/5'}
                                            `}
                                        >
                                            {/* Poke Image */}
                                            <div className="flex-1 w-full flex items-center justify-center relative">
                                                <OptimizedImage 
                                                    src={getCellImage(cell)}
                                                    alt={cell.name}
                                                    className={`w-full h-full object-contain drop-shadow-md transition-transform ${isMarked ? 'scale-90 opacity-50' : 'group-hover:scale-110'}`}
                                                    contain
                                                />
                                                {isMarked && (
                                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                                        <span className="text-4xl text-green-400 drop-shadow-lg font-black">✓</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Name Label */}
                                            <div className="w-full text-center mt-1">
                                                <span className={`text-[9px] md:text-[10px] font-bold leading-tight block truncate ${isMarked ? 'text-green-400' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {cell.name}
                                                </span>
                                            </div>

                                            {/* Tooltip for Spawns */}
                                            {cell.spawns && cell.spawns.length > 0 && (
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/90 border border-white/20 rounded-lg p-2 text-[10px] text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-xl">
                                                    <div className="font-bold text-brand-primary border-b border-white/10 pb-1 mb-1">{cell.rarity}</div>
                                                    {cell.spawns.join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Bingo;
