
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';
import UserProfile from '../components/UserProfile';

// --- CONSTANTS ---
// Reused from Bingo.tsx logic to ensure consistent preview
const SHEET_ID = '16JrrEp919HVn8YE0AtmeAu6_tPkMkKqEmRzMlKW442A';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;
const OFFICIAL_SEED = "WEEK1";

// Types
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

// Manual Data (Copied for preview accuracy)
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

// Simplified Rarity Mapping for Preview
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

// Mini Cell Component for Preview Grid
const MiniCell: React.FC<{ item: BingoCell }> = ({ item }) => {
    let bgClass = "bg-gray-700 border-gray-600";
    if (item.rarity === 'Mythical') bgClass = "bg-pink-900 border-pink-500";
    if (item.rarity === 'Legendary') bgClass = "bg-yellow-900 border-yellow-500";
    if (item.rarity === 'Ultra-Rare') bgClass = "bg-purple-900 border-purple-500";
    if (item.rarity === 'Rare') bgClass = "bg-blue-900 border-blue-500";
    if (item.rarity === 'Uncommon') bgClass = "bg-green-900 border-green-600";
    if (item.id === -1) bgClass = "bg-white border-white";

    const formattedName = item.name.toLowerCase().trim().replace(/[.']/g, '').replace(/\s+/g, '-');
    const imgSrc = item.id === -1 
        ? "https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif"
        : `https://cobblemon.tools/pokedex/pokemon/${formattedName}/sprite.png`;

    return (
        <div className={`aspect-square rounded-md border ${bgClass} flex items-center justify-center p-1 relative overflow-hidden shadow-sm`}>
            {item.id !== -1 && <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>}
            <img src={imgSrc} alt="" className="w-full h-full object-contain" loading="lazy" />
        </div>
    );
};

const BingoDashboard: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [previewGrid, setPreviewGrid] = useState<BingoCell[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndGenerate = async () => {
            try {
                const response = await fetch(CSV_EXPORT_URL);
                if (!response.ok) throw new Error("Failed");
                const text = await response.text();
                
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
                    if (ex) { ex.id = m.id; ex.rarity = m.rarity; poolMap.set(key, ex); }
                    else poolMap.set(key, { id: m.id, name: m.name, rarity: m.rarity, spawns: new Set() });
                });

                const pool = Array.from(poolMap.values());
                
                // GENERATE PREVIEW GRID (Seed: OFFICIAL_SEED)
                const seed = cyrb128(OFFICIAL_SEED);
                const rng = mulberry32(seed[0]);
                
                // Simple Shuffle for Default Difficulty
                const available = [...pool];
                for (let i = available.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [available[i], available[j]] = [available[j], available[i]];
                }

                const selected: BingoCell[] = available.slice(0, 24).map(e => ({
                    id: e.id, name: e.name, rarity: e.rarity, spawns: []
                }));

                // Construct Grid with Free Space in Center
                const finalGrid: BingoCell[] = new Array(25).fill(null);
                let srcIdx = 0;
                for (let i = 0; i < 25; i++) {
                    if (i === 12) finalGrid[i] = FREE_SPACE_CELL;
                    else finalGrid[i] = selected[srcIdx++];
                }

                setPreviewGrid(finalGrid);
            } catch (e) {
                console.error("Preview Gen Error", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAndGenerate();
    }, []);

    return (
        <div className="min-h-screen py-4 font-sans text-white relative">
            <UserProfile 
                onUserChange={setUser} 
                className="!absolute top-4 right-4"
            />

            <div className="container mx-auto px-4 pt-4 pb-2">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm">
                    <span>←</span> Back to Dashboard
                </Link>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
                <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    
                    {/* Left Side: Info */}
                    <div className="space-y-8 text-center md:text-left order-2 md:order-1">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 drop-shadow-2xl">
                                WEEKLY <span className="text-brand-primary">BINGO</span>
                            </h1>
                            <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
                                Join the community event! Complete this week's official card to earn massive rewards on the server.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Link 
                                to={`/minecraft/bingo/card?id=${OFFICIAL_SEED}`}
                                className="bg-brand-primary hover:bg-red-600 text-white font-bold text-xl py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(229,56,59,0.4)] transition-transform hover:scale-105 flex items-center justify-center gap-3 group"
                            >
                                <span>🚀</span>
                                <span>PLAY WEEKLY CARD</span>
                            </Link>
                            
                            <div className="flex gap-4">
                                <Link 
                                    to="/minecraft/bingo/card"
                                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <span>🎲</span> Random Card
                                </Link>
                                <Link 
                                    to="/minecraft/bingo/card?view=saved"
                                    className="flex-1 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/30 text-white font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    <span>💾</span> Saved Cards
                                </Link>
                            </div>
                        </div>

                        <div className="bg-black/30 p-4 rounded-xl border border-white/10 text-sm text-gray-400">
                            <strong className="text-brand-accent">TIP:</strong> You can save your progress on the card page. Don't forget to mark your catches!
                        </div>
                    </div>

                    {/* Right Side: Card Preview */}
                    <div className="order-1 md:order-2 flex justify-center perspective-1000">
                        <Link 
                            to={`/minecraft/bingo/card?id=${OFFICIAL_SEED}`}
                            className="relative group cursor-pointer transition-transform duration-500 hover:rotate-y-12 hover:scale-105"
                        >
                            {/* Card Container */}
                            <div className="w-[320px] h-[400px] bg-[#1a0b0e] rounded-3xl border-[8px] border-[#3a1017] shadow-2xl overflow-hidden relative flex flex-col items-center p-4">
                                {/* Header */}
                                <div className="text-center mb-3">
                                    <div className="text-2xl font-black tracking-[0.2em] text-white/20 group-hover:text-brand-primary/40 transition-colors">BINGO</div>
                                </div>

                                {/* The Grid */}
                                {loading ? (
                                    <div className="flex-1 flex items-center justify-center text-brand-primary animate-pulse font-bold">Generating Preview...</div>
                                ) : (
                                    <div className="grid grid-cols-5 gap-1 w-full flex-1">
                                        {previewGrid.map((item, idx) => (
                                            <MiniCell key={idx} item={item} />
                                        ))}
                                    </div>
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                    <span className="text-4xl mb-2">👉</span>
                                    <span className="font-bold text-white uppercase tracking-widest border-b-2 border-brand-primary pb-1">Click to Start</span>
                                </div>
                            </div>

                            {/* Glow Effect behind card */}
                            <div className="absolute inset-0 bg-brand-primary/20 blur-[50px] -z-10 group-hover:bg-brand-primary/40 transition-colors duration-500 rounded-full"></div>
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BingoDashboard;
