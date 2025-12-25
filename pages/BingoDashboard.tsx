
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants';
import UserProfile from '../components/UserProfile';
import { LAMB_POOL, WAGYU_POOL } from '../data/gachaPools';
import { getSpawnInfo } from '../data/legendaryConfig';
import OptimizedImage from '../components/OptimizedImage';

// --- CONSTANTS ---
const SHEET_ID = '16JrrEp919HVn8YE0AtmeAu6_tPkMkKqEmRzMlKW442A';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Types
interface BingoCell {
    id: number;
    name: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical' | 'Ultra-Beast' | 'Free';
    spawns: string[];
}

interface CobblemonEntry {
    id: number;
    name: string;
    rarity: BingoCell['rarity'];
    spawns: Set<string>;
}

// Bingo Winner Type
interface BingoWinner {
    _id: string;
    discordId: string;
    minecraftUsername: string;
    cardId: string;
    linesCompleted: number;
    completedAt: string;
    discordAvatar?: string; // Optional cached avatar
}

// Difficulty Mapping
const PREFIX_TO_DIFF: Record<string, string> = {
    'D': 'Default',
    'E': 'Easy',
    'N': 'Normal',
    'H': 'Hard',
    'I': 'Insane',
    'X': 'Nightmare',
    'Y': 'Nightmare+',
    'Z': 'Impossible'
};

// Manual Data
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
    { id: 145, name: 'Zapdos', rarity: 'Legendary' }, 
    // Mythics
    { id: 151, name: 'Mew', rarity: 'Mythical' },
    { id: 251, name: 'Celebi', rarity: 'Mythical' },
    { id: 385, name: 'Jirachi', rarity: 'Mythical' },
    { id: 386, name: 'Deoxys', rarity: 'Mythical' },
    { id: 491, name: 'Darkrai', rarity: 'Mythical' },
    { id: 492, name: 'Shaymin', rarity: 'Mythical' },
    { id: 493, name: 'Arceus', rarity: 'Mythical' },
    { id: 494, name: 'Victini', rarity: 'Mythical' },
    { id: 647, name: 'Keldeo', rarity: 'Mythical' },
    { id: 648, name: 'Meloetta', rarity: 'Mythical' },
    { id: 649, name: 'Genesect', rarity: 'Mythical' },
    { id: 719, name: 'Diancie', rarity: 'Mythical' },
    { id: 720, name: 'Hoopa', rarity: 'Mythical' },
    { id: 721, name: 'Volcanion', rarity: 'Mythical' },
    { id: 801, name: 'Magearna', rarity: 'Mythical' },
    { id: 802, name: 'Marshadow', rarity: 'Mythical' },
    { id: 807, name: 'Zeraora', rarity: 'Mythical' },
    { id: 808, name: 'Meltan', rarity: 'Mythical' },
    { id: 809, name: 'Melmetal', rarity: 'Mythical' },
    { id: 893, name: 'Zarude', rarity: 'Mythical' },
    { id: 1025, name: 'Pecharunt', rarity: 'Mythical' },
    // Ultra Beasts
    { id: 793, name: 'Nihilego', rarity: 'Ultra-Beast' },
    { id: 794, name: 'Buzzwole', rarity: 'Ultra-Beast' },
    { id: 795, name: 'Pheromosa', rarity: 'Ultra-Beast' },
    { id: 796, name: 'Xurkitree', rarity: 'Ultra-Beast' },
    { id: 797, name: 'Celesteela', rarity: 'Ultra-Beast' },
    { id: 798, name: 'Kartana', rarity: 'Ultra-Beast' },
    { id: 799, name: 'Guzzlord', rarity: 'Ultra-Beast' },
    { id: 803, name: 'Poipole', rarity: 'Ultra-Beast' },
    { id: 804, name: 'Naganadel', rarity: 'Ultra-Beast' },
    { id: 805, name: 'Stakataka', rarity: 'Ultra-Beast' },
    { id: 806, name: 'Blacephalon', rarity: 'Ultra-Beast' }
];

const FREE_SPACE_CELL: BingoCell = {
    id: -1,
    name: "FREE SPACE",
    rarity: "Free",
    spawns: ["Enjoy!"]
};

// Global cache for image validity to avoid repeated backend checks
const clientImageCache = new Map<string, boolean>();

// --- RNG UTILS ---
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
    if (v.includes('beast') || v.includes('ultra beast')) return 'Ultra-Beast';
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

// --- LEADERBOARD CARD COMPONENT ---
const MiniGridPreview: React.FC<{ cardId: string, pool: CobblemonEntry[] }> = ({ cardId, pool }) => {
    const [grid, setGrid] = useState<BingoCell[]>([]);

    useEffect(() => {
        if (!cardId || !pool || pool.length === 0) return;

        // Parse Difficulty
        let diff = 'Default';
        const parts = cardId.split('-');
        if (parts.length === 2 && parts[0].length === 1 && PREFIX_TO_DIFF[parts[0]]) {
            diff = PREFIX_TO_DIFF[parts[0]];
        }

        const seed = cyrb128(cardId);
        const rng = mulberry32(seed[0]);

        const getRandomItems = (rarities: BingoCell['rarity'][], count: number): BingoCell[] => {
            let p = pool.filter(entry => rarities.includes(entry.rarity));
            if (p.length === 0) p = pool;
            p = [...p];
            for (let i = p.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
            return p.slice(0, count).map(e => ({ id: e.id, name: e.name, rarity: e.rarity, spawns: [] }));
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
        } else if (diff === 'Nightmare+') {
            selected = [];
        } else if (diff === 'Impossible') {
            selected = [];
        } else {
            const p = [...pool];
            for (let i = p.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [p[i], p[j]] = [p[j], p[i]];
            }
            selected = p.slice(0, 24).map(e => ({ id: e.id, name: e.name, rarity: e.rarity, spawns: [] }));
        }

        // Shuffle selected (except special fills)
        if (diff !== 'Nightmare+' && diff !== 'Impossible') {
            for (let i = selected.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [selected[i], selected[j]] = [selected[j], selected[i]];
            }
        }

        const finalGrid: BingoCell[] = new Array(25).fill(null);
        const fillGrid = (src: BingoCell[], skip: number[]) => {
            let idx = 0;
            for (let i=0; i<25; i++) {
                if (skip.includes(i)) continue;
                if (idx < src.length) finalGrid[i] = src[idx++];
                else finalGrid[i] = getRandomItems(['Common'], 1)[0];
            }
        };

        if (diff === 'Insane') {
            fillGrid(selected, [12]);
            finalGrid[12] = getRandomItems(['Legendary'], 1)[0];
        } else if (diff === 'Nightmare') {
            const corners = [0, 4, 20, 24];
            fillGrid(selected, [12, ...corners]);
            finalGrid[12] = getRandomItems(['Mythical'], 1)[0];
            const legs = getRandomItems(['Legendary'], 4);
            corners.forEach((idx, i) => finalGrid[idx] = legs[i]);
        } else if (diff === 'Nightmare+') {
            const spec = [0, 4, 12, 20, 24];
            const myth = getRandomItems(['Mythical'], 5);
            const legs = getRandomItems(['Legendary'], 20);
            let lIdx = 0;
            for(let i=0; i<25; i++) {
                if (spec.includes(i)) continue;
                finalGrid[i] = legs[lIdx++] || getRandomItems(['Common'], 1)[0];
            }
            spec.forEach((idx, i) => finalGrid[idx] = myth[i]);
        } else if (diff === 'Impossible') {
             const spec = [0, 4, 12, 20, 24];
             const ub = getRandomItems(['Ultra-Beast'], 1);
             const myth = getRandomItems(['Mythical'], 4);
             const legs = getRandomItems(['Legendary'], 20);
             let lIdx = 0;
             for(let i=0; i<25; i++) {
                 if (spec.includes(i)) continue;
                 finalGrid[i] = legs[lIdx++] || getRandomItems(['Common'], 1)[0];
             }
             const corn = [0, 4, 20, 24];
             corn.forEach((idx, i) => finalGrid[idx] = myth[i]);
             finalGrid[12] = ub[0];
        } else {
            fillGrid(selected, [12]);
            finalGrid[12] = FREE_SPACE_CELL;
        }

        setGrid(finalGrid);

    }, [cardId, pool]);

    const getColor = (r: string) => {
        if(r === 'Ultra-Beast') return 'bg-cyan-500 border-cyan-300 shadow-[0_0_2px_cyan]';
        if(r === 'Mythical') return 'bg-pink-600 border-pink-400 shadow-[0_0_2px_pink]';
        if(r === 'Legendary') return 'bg-yellow-600 border-yellow-400';
        if(r === 'Ultra-Rare') return 'bg-purple-600 border-purple-400';
        if(r === 'Rare') return 'bg-blue-600 border-blue-400';
        if(r === 'Uncommon') return 'bg-green-700 border-green-500';
        if(r === 'Free') return 'bg-white';
        return 'bg-gray-700 border-gray-600';
    };

    return (
        <div className="grid grid-cols-5 gap-[2px] w-full h-full bg-[#120507] p-[2px]">
            {grid.map((cell, i) => (
                <div key={i} className={`w-full h-full rounded-[1px] border-[0.5px] opacity-80 ${cell ? getColor(cell.rarity) : 'bg-transparent'}`}></div>
            ))}
        </div>
    );
};

const LeaderboardCard: React.FC<{ winner: BingoWinner, pool: CobblemonEntry[] }> = ({ winner, pool }) => {
    return (
        <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-2xl p-4 group hover:bg-white/5 transition-all hover:scale-[1.01] shadow-lg">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <img src={`https://mc-heads.net/avatar/${winner.minecraftUsername}/48`} className="w-12 h-12 rounded-xl border border-white/10 shadow-md relative z-10 bg-[#120507]" alt={winner.minecraftUsername} />
                    {winner.discordId && (
                         <img src={`https://cdn.discordapp.com/avatars/${winner.discordId}/${winner.discordAvatar}.png`} className="w-6 h-6 rounded-full absolute -bottom-2 -right-2 z-20 border-2 border-[#1a0b0e]" onError={(e) => e.currentTarget.style.display = 'none'} />
                    )}
                </div>
                <div>
                    <h3 className="font-black text-white text-lg leading-none">{winner.minecraftUsername}</h3>
                    <p className="text-gray-500 text-xs font-mono mt-1">{new Date(winner.completedAt).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="text-center hidden sm:block">
                    <div className="text-2xl font-black text-brand-primary leading-none">{winner.linesCompleted}</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Lines</div>
                </div>

                <Link to={`/minecraft/bingo/card?id=${winner.cardId}`} className="relative w-16 h-20 rounded-lg overflow-hidden border-2 border-white/10 hover:border-brand-primary/50 transition-colors shadow-inner bg-black cursor-pointer group/card" title="View Card">
                    <MiniGridPreview cardId={winner.cardId} pool={pool} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-opacity">
                         <span className="text-xs">👁️</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

const BingoDashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [previewGrid, setPreviewGrid] = useState<BingoCell[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Config from API
    const [config, setConfig] = useState<{ cardId: string, winCondition: string }>({ cardId: '', winCondition: '' });
    
    // Leaderboard State
    const [winners, setWinners] = useState<BingoWinner[]>([]);
    const [poolData, setPoolData] = useState<CobblemonEntry[]>([]); // To pass to MiniPreview

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                // 1. Fetch Data sources in parallel
                const [csvRes, configRes, winnersRes] = await Promise.all([
                    fetch(CSV_EXPORT_URL),
                    fetch(`${API_BASE_URL}/api/bingo/config`),
                    fetch(`${API_BASE_URL}/api/bingo/winners`)
                ]);

                if (!csvRes.ok) throw new Error("Failed to fetch sheet");
                const text = await csvRes.text();
                
                // Set Config & Parse Difficulty
                let activeCardId = "WEEK1"; 
                let difficulty = "Default";

                if (configRes.ok) {
                    const conf = await configRes.json();
                    setConfig(conf);
                    if (conf.cardId) {
                        activeCardId = conf.cardId;
                        // Parse difficulty prefix if exists
                        const parts = conf.cardId.split('-');
                        if (parts.length === 2 && parts[0].length === 1 && PREFIX_TO_DIFF[parts[0]]) {
                            difficulty = PREFIX_TO_DIFF[parts[0]];
                        }
                    }
                }

                if (winnersRes.ok) {
                    setWinners(await winnersRes.json());
                }

                // 2. CHECK IF DEFINITION EXISTS (PERSISTENCE)
                // This ensures the preview matches the real generated card
                try {
                    const checkRes = await fetch(`${API_BASE_URL}/api/bingo/definition?id=${activeCardId}`);
                    if (checkRes.ok) {
                        const def = await checkRes.json();
                        if (def && def.gridData && Array.isArray(def.gridData)) {
                            setPreviewGrid(def.gridData);
                            setLoading(false);
                            // Still parse sheet for Pool Data needed by Leaderboard Previews
                        }
                    }
                } catch (e) { /* Ignore and generate locally */ }

                // 3. PARSE SHEET
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

                MANUAL_POOL_DATA.forEach(m => {
                    const key = m.name.toLowerCase();
                    const ex = poolMap.get(key);
                    
                    // NEW: Check JSON config
                    const parsedInfo = getSpawnInfo(m.name);
                    const spawns = new Set<string>();
                    
                    if (m.name === 'Melmetal') {
                        spawns.add("Meltan Evolution");
                    } else if (m.rarity === 'Ultra-Beast') {
                         spawns.add("Obtained from Ultra Space Wormhole!");
                    } else {
                        if (parsedInfo) {
                            spawns.add(parsedInfo);
                        } else {
                            if (m.rarity === 'Legendary') spawns.add("Check the quest book!");
                            else if (m.rarity === 'Mythical') spawns.add("Mythic");
                        }
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

                // --- FILTERING GACHA POKEMON ---
                const excludedIds = new Set<number>();
                [...LAMB_POOL, ...WAGYU_POOL].forEach(item => {
                    if (item.type === 'Pokemon') {
                        excludedIds.add(item.id);
                    }
                });

                // Convert map to array and filter
                let cobblemonArray = Array.from(poolMap.values());
                
                // Remove excluded IDs, but KEEP Legendaries/Mythicals to fix the Nightmare pool issue
                cobblemonArray = cobblemonArray.filter(entry => {
                    if (entry.name === 'Manaphy') return false; // Explicitly remove Manaphy
                    if (entry.rarity === 'Legendary' || entry.rarity === 'Mythical' || entry.rarity === 'Ultra-Beast') return true;
                    return !excludedIds.has(entry.id);
                });

                // Sort by ID then Name to ensure deterministic RNG across reloads
                cobblemonArray.sort((a, b) => {
                    if (a.id !== b.id) return a.id - b.id;
                    return a.name.localeCompare(b.name);
                });

                if (cobblemonArray.length === 0) throw new Error("No data found in sheet after filtering");
                
                const cobblemonPool = cobblemonArray;
                setPoolData(cobblemonPool); // Save for leaderboard

                // 4. GENERATE PREVIEW GRID (Only if not loaded from definition)
                if (previewGrid.length === 0) {
                    const seed = cyrb128(activeCardId);
                    const rng = mulberry32(seed[0]);

                    // Helper to get random items from filtered pool
                    const getRandomItems = (rarities: BingoCell['rarity'][], count: number): BingoCell[] => {
                        let pool = cobblemonPool.filter(p => rarities.includes(p.rarity));
                        if (pool.length === 0) pool = cobblemonPool; // Fallback
                        
                        // Copy for shuffle to keep main pool sorted
                        pool = [...pool];

                        // Shuffle pool
                        for (let i = pool.length - 1; i > 0; i--) {
                            const j = Math.floor(rng() * (i + 1));
                            [pool[i], pool[j]] = [pool[j], pool[i]];
                        }
                        
                        // Return top N
                        return pool.slice(0, count).map(entry => ({
                            id: entry.id,
                            name: entry.name,
                            rarity: entry.rarity,
                            spawns: Array.from(entry.spawns).sort().length > 0 ? Array.from(entry.spawns).sort() : ["Unknown Location"]
                        }));
                    };

                    let selected: BingoCell[] = [];

                    // GENERATION LOGIC (Mirrors Bingo.tsx)
                    if (difficulty === 'Easy') {
                        const commons = getRandomItems(['Common'], 12);
                        const uncommons = getRandomItems(['Uncommon'], 12);
                        selected = [...commons, ...uncommons];
                    } else if (difficulty === 'Normal') {
                        selected = [
                            ...getRandomItems(['Common'], 6),
                            ...getRandomItems(['Uncommon'], 6),
                            ...getRandomItems(['Rare'], 6),
                            ...getRandomItems(['Ultra-Rare'], 6)
                        ];
                    } else if (difficulty === 'Hard') {
                        selected = [
                            ...getRandomItems(['Rare'], 12),
                            ...getRandomItems(['Ultra-Rare'], 12)
                        ];
                    } else if (difficulty === 'Insane') {
                        selected = getRandomItems(['Ultra-Rare'], 24);
                    } else if (difficulty === 'Nightmare') {
                        selected = getRandomItems(['Ultra-Rare'], 20);
                    } else if (difficulty === 'Nightmare+') {
                        // Custom fill later
                        selected = [];
                    } else if (difficulty === 'Impossible') {
                        // Custom fill later
                        selected = [];
                    } else {
                        // DEFAULT
                        const pool = [...cobblemonPool];
                        const tempPool = [...pool];
                        for (let i = tempPool.length - 1; i > 0; i--) {
                            const j = Math.floor(rng() * (i + 1));
                            [tempPool[i], tempPool[j]] = [tempPool[j], tempPool[i]];
                        }
                        selected = tempPool.slice(0, 24).map(entry => ({
                            id: entry.id, name: entry.name, rarity: entry.rarity, spawns: Array.from(entry.spawns).sort().length > 0 ? Array.from(entry.spawns).sort() : ["Unknown Location"]
                        }));
                    }

                    // Shuffle selected
                    for (let i = selected.length - 1; i > 0; i--) {
                        const j = Math.floor(rng() * (i + 1));
                        [selected[i], selected[j]] = [selected[j], selected[i]];
                    }

                    // Construct Grid
                    const finalGrid: BingoCell[] = new Array(25).fill(null);
                    const fillGrid = (source: BingoCell[], skipIndices: number[]) => {
                        let sourceIdx = 0;
                        for (let i = 0; i < 25; i++) {
                            if (skipIndices.includes(i)) continue;
                            if (sourceIdx < source.length) finalGrid[i] = source[sourceIdx++];
                            else finalGrid[i] = getRandomItems(['Common'], 1)[0];
                        }
                    };

                    if (difficulty === 'Insane') {
                        fillGrid(selected, [12]);
                        finalGrid[12] = getRandomItems(['Legendary'], 1)[0];
                    } else if (difficulty === 'Nightmare') {
                        const corners = [0, 4, 20, 24];
                        fillGrid(selected, [12, ...corners]);
                        finalGrid[12] = getRandomItems(['Mythical'], 1)[0];
                        const legends = getRandomItems(['Legendary'], 4);
                        corners.forEach((idx, i) => finalGrid[idx] = legends[i]);
                    } else if (difficulty === 'Nightmare+') {
                        const specialIndices = [0, 4, 12, 20, 24];
                        const mythics = getRandomItems(['Mythical'], 5);
                        const legends = getRandomItems(['Legendary'], 20);
                        
                        let legIdx = 0;
                        for (let i = 0; i < 25; i++) {
                            if (specialIndices.includes(i)) continue;
                            finalGrid[i] = legends[legIdx++] || getRandomItems(['Common'], 1)[0];
                        }
                        
                        specialIndices.forEach((gridIdx, i) => {
                            finalGrid[gridIdx] = mythics[i] || getRandomItems(['Common'], 1)[0];
                        });
                    } else if (difficulty === 'Impossible') {
                         const spec = [0, 4, 12, 20, 24];
                         const ub = getRandomItems(['Ultra-Beast'], 1);
                         const myth = getRandomItems(['Mythical'], 4);
                         const legs = getRandomItems(['Legendary'], 20);
                         let lIdx = 0;
                         for(let i=0; i<25; i++) {
                             if (spec.includes(i)) continue;
                             finalGrid[i] = legs[lIdx++] || getRandomItems(['Common'], 1)[0];
                         }
                         const corn = [0, 4, 20, 24];
                         corn.forEach((idx, i) => finalGrid[idx] = myth[i]);
                         finalGrid[12] = ub[0] || getRandomItems(['Common'], 1)[0];
                    } else {
                        // Default
                        fillGrid(selected, [12]);
                        finalGrid[12] = FREE_SPACE_CELL;
                    }

                    setPreviewGrid(finalGrid);
                }
            } catch (e) {
                console.error("Dashboard Load Error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAndGenerate();
    }, []);

    return (
        <div className="min-h-screen py-12 font-sans text-white relative">
             <style>{`
                .glass-panel {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
            `}</style>
            
            <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center gap-8">
                
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                        BINGO <span className="text-brand-primary">DASHBOARD</span>
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Track current events, check the leaderboard, and see who's winning the Cobblemon Bingo!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    
                    {/* LEFT: Current Event Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                            
                            <h2 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                                <span>📅</span> Active Card
                            </h2>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Event ID</div>
                                    <div className="text-3xl font-mono font-black text-brand-primary tracking-wide">
                                        {config.cardId || "LOADING..."}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Win Condition</div>
                                    <div className="text-xl font-bold text-white bg-white/5 px-3 py-2 rounded-xl inline-block border border-white/5">
                                        {config.winCondition || "Loading..."}
                                    </div>
                                </div>
                                
                                <div className="pt-4">
                                    <Link to="/minecraft/bingo/card" className="block w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-xl text-center shadow-lg transition-transform hover:scale-[1.02]">
                                        PLAY BINGO
                                    </Link>
                                    <p className="text-center text-[10px] text-gray-500 mt-2">
                                        Use ID <strong>{config.cardId}</strong> to generate this card!
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Preview Grid */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-xl flex flex-col items-center">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Card Preview</h3>
                            {loading ? (
                                <div className="w-48 h-60 flex items-center justify-center animate-pulse text-gray-600 font-bold">Loading...</div>
                            ) : (
                                <div className="w-48 h-60 rounded-lg overflow-hidden border-2 border-white/10 shadow-2xl bg-[#120507]">
                                    <div className="grid grid-cols-5 gap-[1px] w-full h-full bg-[#120507] p-[1px]">
                                        {previewGrid.map((cell, i) => {
                                            // Simple color mapping for preview
                                            let color = 'bg-gray-700';
                                            if (cell.rarity === 'Ultra-Beast') color = 'bg-cyan-500';
                                            else if (cell.rarity === 'Mythical') color = 'bg-pink-600';
                                            else if (cell.rarity === 'Legendary') color = 'bg-yellow-600';
                                            else if (cell.rarity === 'Ultra-Rare') color = 'bg-purple-600';
                                            else if (cell.rarity === 'Rare') color = 'bg-blue-600';
                                            else if (cell.rarity === 'Uncommon') color = 'bg-green-700';
                                            else if (cell.rarity === 'Free') color = 'bg-white';
                                            
                                            return <div key={i} className={`w-full h-full ${color} opacity-80`}></div>
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Leaderboard */}
                    <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-xl flex flex-col h-[600px]">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-black text-white">🏆 Hall of Fame</h2>
                            <div className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                                Top Winners
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {winners.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
                                    <span className="text-6xl mb-4">👑</span>
                                    <span className="font-bold text-xl">No winners yet!</span>
                                    <span className="text-sm">Be the first to complete a line!</span>
                                </div>
                            ) : (
                                winners.map((winner) => (
                                    <LeaderboardCard key={winner._id} winner={winner} pool={poolData} />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BingoDashboard;
