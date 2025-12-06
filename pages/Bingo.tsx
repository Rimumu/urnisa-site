
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

// --- TYPES ---
interface BingoCell {
    id: number;
    name: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical';
    spawns: string[];
}

interface CobblemonEntry {
    id: number;
    name: string;
    rarity: BingoCell['rarity'];
    spawns: Set<string>;
}

const LOGO_URL = "https://res.cloudinary.com/dsencimjn/image/upload/v1765016320/cobblebingo_mhbavw.png";
const SHEET_ID = '16JrrEp919HVn8YE0AtmeAu6_tPkMkKqEmRzMlKW442A';
const CSV_EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

// Winning Combinations Indices (5x5 Grid)
const WINNING_COMBINATIONS = [
    // Rows
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // Columns
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    // Diagonals
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]
];

// --- SEEDED RNG UTILS ---
// Hashing function to turn a string ID into a numeric seed
const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
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

// Simple PRNG (Mulberry32)
const mulberry32 = (a: number) => {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
};

// Generate a random ID like SHCN74CDF
const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Helper to determine line coords for SVG
const getLineCoords = (combo: number[]) => {
    const start = combo[0];
    const end = combo[4];
    
    // Row: Consecutive numbers in same row block
    if (end === start + 4 && Math.floor(start / 5) === Math.floor(end / 5)) {
        const row = Math.floor(start / 5);
        const y = 10 + row * 20;
        return { x1: '2%', y1: `${y}%`, x2: '98%', y2: `${y}%` }; 
    }
    // Col: Start + 20
    if (end === start + 20) {
        const col = start % 5;
        const x = 10 + col * 20;
        return { x1: `${x}%`, y1: '2%', x2: `${x}%`, y2: '98%' };
    }
    // Diag TL-BR
    if (start === 0 && end === 24) {
        return { x1: '2%', y1: '2%', x2: '98%', y2: '98%' };
    }
    // Diag TR-BL
    if (start === 4 && end === 20) {
        return { x1: '98%', y1: '2%', x2: '2%', y2: '98%' };
    }
    return null;
};

// Cache for image validity
const clientImageCache = new Map<string, boolean>();

// Shared Helper
const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .trim()
        .replace(/[.']/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
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

// Helper Component for Cell Image
const BingoCardImage: React.FC<{ item: BingoCell }> = ({ item }) => {
    const [imgSrc, setImgSrc] = useState<string>("");

    useEffect(() => {
        const verifyImage = async () => {
            const cobbleName = getFormattedName(item.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            // Fallback relies on ID. 
            const fallback3d = item.id > 0 
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.id}.png`
                : primaryUrl;

            if (clientImageCache.has(primaryUrl)) {
                const isValid = clientImageCache.get(primaryUrl);
                setImgSrc(isValid ? primaryUrl : fallback3d);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();
                clientImageCache.set(primaryUrl, data.valid);

                if (data.valid) {
                    setImgSrc(primaryUrl);
                } else {
                    setImgSrc(fallback3d);
                }
            } catch (error) {
                setImgSrc(primaryUrl);
            }
        };

        verifyImage();
    }, [item]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools') && item.id > 0) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.id}.png`);
        } else if (imgSrc.includes('other/home') && item.id > 0) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(item.name)}`);
        }
    };

    return (
        <OptimizedImage 
            src={imgSrc} 
            alt={item.name} 
            className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            contain
            onError={handleImageError}
        />
    );
};

const Bingo: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [gridData, setGridData] = useState<BingoCell[]>([]);
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentCardId, setCurrentCardId] = useState<string>("");
    const [inputCode, setInputCode] = useState("");
    
    // Bingo Win State
    const [winningLines, setWinningLines] = useState<number[][]>([]);
    const [bingoCount, setBingoCount] = useState(0);
    const [showBingoPopup, setShowBingoPopup] = useState(false);
    
    // Refs for logic
    const prevBingoCountRef = useRef(0);
    const popupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Data from Google Sheet
    const [cobblemonPool, setCobblemonPool] = useState<CobblemonEntry[] | null>(null);
    const [loadingSheet, setLoadingSheet] = useState(true);
    const [sheetError, setSheetError] = useState(false);

    // 1. Fetch and Parse Google Sheet CSV on Mount
    useEffect(() => {
        const fetchSheetData = async () => {
            try {
                const response = await fetch(CSV_EXPORT_URL);
                if (!response.ok) throw new Error("Failed to fetch sheet");
                const text = await response.text();
                
                // Parse CSV respecting quoted fields
                const rows = text.split('\n').map(row => {
                    // Regex split to handle commas inside quotes
                    return row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.trim().replace(/^"|"$/g, '').trim());
                });

                const poolMap = new Map<string, CobblemonEntry>();

                rows.forEach((cols, index) => {
                    if (index === 0) return; // Skip Header
                    
                    // Name is critical (Column B / Index 1)
                    let rawName = cols[1];
                    if (!rawName || !rawName.trim()) return;

                    // Clean Name: Remove [Variant] tags (e.g. "Gastrodon [West Sea]" -> "Gastrodon")
                    const name = rawName.replace(/\[.*?\]/g, '').trim();

                    // Normalize key for grouping
                    const key = name.toLowerCase();
                    
                    // Get existing or create new entry
                    let entry = poolMap.get(key);
                    if (!entry) {
                        const id = parseInt(cols[0]) || 0; // Column A
                        const rarity = mapRarity(cols[3]); // Column D
                        entry = {
                            id,
                            name,
                            rarity,
                            spawns: new Set<string>()
                        };
                    }

                    // Add Biome from Column H (Index 7)
                    const biomeRaw = cols[7];
                    if (biomeRaw && biomeRaw !== '#N/A' && biomeRaw.toLowerCase() !== 'none' && biomeRaw.trim() !== '') {
                        const parts = biomeRaw.split(/[,/&]/);
                        
                        parts.forEach(part => {
                            let clean = part.trim();
                            if (clean.toLowerCase().startsWith('minecraft:')) {
                                clean = clean.substring(10);
                            }
                            if (clean.startsWith('#')) {
                                clean = clean.substring(1);
                            }
                            clean = clean.replace(/_/g, ' ');
                            clean = clean.replace(/\b\w/g, c => c.toUpperCase());
                            
                            if (clean && clean.length > 2) {
                                entry.spawns.add(clean.trim());
                            }
                        });
                    }

                    poolMap.set(key, entry);
                });

                if (poolMap.size === 0) throw new Error("No data found in sheet");
                
                setCobblemonPool(Array.from(poolMap.values()));
            } catch (e) {
                console.error("Sheet Error:", e);
                setSheetError(true);
            } finally {
                setLoadingSheet(false);
            }
        };

        fetchSheetData();
    }, []);

    // Win Logic
    useEffect(() => {
        const lines = WINNING_COMBINATIONS.filter(combo => 
            combo.every(index => marked[index])
        );
        
        setWinningLines(lines);
        
        const currentCount = lines.length;
        const prevCount = prevBingoCountRef.current;

        // If we have more lines than before, it's a new win (or 2X/3X)
        if (currentCount > prevCount) {
            setBingoCount(currentCount);
            setShowBingoPopup(true);
            
            // Clear any existing timer to prevent premature hiding
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
            
            // Hide after 3 seconds
            popupTimerRef.current = setTimeout(() => {
                setShowBingoPopup(false);
            }, 3000);
        } else if (currentCount < prevCount) {
            // If lines decreased (user unchecked), just update count, maybe hide popup
            setBingoCount(currentCount);
            if (currentCount === 0) setShowBingoPopup(false);
        }
        
        prevBingoCountRef.current = currentCount;
    }, [marked]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        };
    }, []);

    // --- SEEDED GENERATION LOGIC ---
    const generateCard = useCallback(async (customId?: string) => {
        if (!cobblemonPool || cobblemonPool.length === 0) return;
        setIsGenerating(true);
        
        try {
            // 1. Determine ID
            let idToUse = customId;
            if (!idToUse) {
                idToUse = generateRandomId();
            }
            
            // 2. Set URL & State
            setCurrentCardId(idToUse);
            setSearchParams({ id: idToUse });
            setInputCode(""); // Clear input

            // 3. Initialize PRNG
            const seed = cyrb128(idToUse);
            const rng = mulberry32(seed[0]);

            // 4. Shuffle & Select
            const available = [...cobblemonPool];
            // Fisher-Yates Shuffle with seeded RNG
            for (let i = available.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [available[i], available[j]] = [available[j], available[i]];
            }

            // Take first 25 unique items
            const selected: BingoCell[] = available.slice(0, 25).map(entry => ({
                id: entry.id,
                name: entry.name,
                rarity: entry.rarity,
                spawns: Array.from(entry.spawns).sort().length > 0 ? Array.from(entry.spawns).sort() : ["Unknown Location"]
            }));

            // Fill if pool < 25 (rare but safe)
            while (selected.length < 25) {
                const entry = available[Math.floor(rng() * available.length)];
                selected.push({
                    id: entry.id,
                    name: entry.name,
                    rarity: entry.rarity,
                    spawns: ["Special"]
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 300)); // Slight visual delay
            
            setGridData(selected);
            
            // Only reset marks if generating a brand new random card, 
            // if loading a specific ID, we might ideally want to save state, but for now we reset.
            // (Assuming stateless sharing)
            setMarked(new Array(25).fill(false));
            setWinningLines([]);
            setBingoCount(0);
            prevBingoCountRef.current = 0;
            setShowBingoPopup(false);
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);

        } catch (e) {
            console.error("Bingo Generation Failed:", e);
        } finally {
            setIsGenerating(false);
        }
    }, [cobblemonPool, setSearchParams]);

    // Initial Load
    useEffect(() => {
        let mounted = true;
        if (mounted && !loadingSheet && cobblemonPool && gridData.length === 0) {
            // Check URL for ID
            const urlId = searchParams.get('id');
            if (urlId) {
                generateCard(urlId);
            } else {
                generateCard();
            }
        }
        return () => { mounted = false; };
    }, [loadingSheet, cobblemonPool, generateCard, searchParams, gridData.length]);

    const handleManualLoad = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode.trim().length > 0) {
            generateCard(inputCode.trim().toUpperCase());
        }
    };

    const toggleMark = (index: number) => {
        const newMarked = [...marked];
        newMarked[index] = !newMarked[index];
        setMarked(newMarked);
    };

    const getRarityBadgeStyle = (rarity: string) => {
        switch(rarity) {
            case 'Common': return 'bg-gray-600 text-gray-200';
            case 'Uncommon': return 'bg-green-700/80 text-green-100';
            case 'Rare': return 'bg-blue-600/80 text-blue-100';
            case 'Ultra-Rare': return 'bg-purple-600/80 text-purple-100';
            case 'Legendary': return 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50';
            case 'Mythical': return 'bg-pink-500 text-white shadow-lg shadow-pink-500/50';
            default: return 'bg-gray-500';
        }
    };

    const getCardVisuals = (rarity: string) => {
        const base = "border-2";
        switch (rarity) {
            case 'Mythical':
                return `${base} border-pink-500/50 bg-gradient-to-br from-pink-900/30 to-black/80 shadow-[0_0_10px_rgba(236,72,153,0.1)] group-hover:border-pink-400 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]`;
            case 'Legendary':
                return `${base} border-yellow-500/50 bg-gradient-to-br from-yellow-900/30 to-black/80 shadow-[0_0_10px_rgba(234,179,8,0.1)] group-hover:border-yellow-400 group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]`;
            case 'Ultra-Rare':
                return `${base} border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-black/80 group-hover:border-purple-400`;
            case 'Rare':
                return `${base} border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-black/80 group-hover:border-blue-400`;
            default:
                return `${base} border-white/10 bg-black/60 group-hover:border-white/30 group-hover:bg-black/70`;
        }
    };

    const getNamePlateStyle = (rarity: string) => {
        switch (rarity) {
            case 'Mythical':
                return "bg-gradient-to-t from-pink-900/90 to-pink-900/60 border-t border-pink-500/60 shadow-[0_-5px_15px_rgba(236,72,153,0.4)] backdrop-blur-md";
            case 'Legendary':
                return "bg-gradient-to-t from-yellow-900/90 to-yellow-900/60 border-t border-yellow-500/60 shadow-[0_-5px_15px_rgba(234,179,8,0.4)] backdrop-blur-md";
            default:
                return "bg-black/80 border-t border-white/5 backdrop-blur-md";
        }
    };

    const getTooltipStyle = (rarity: string) => {
        switch(rarity) {
            case 'Mythical': return "border-pink-500 bg-pink-900/95 text-white";
            case 'Legendary': return "border-yellow-500 bg-yellow-900/95 text-white";
            case 'Ultra-Rare': return "border-purple-500 bg-purple-900/95 text-white";
            case 'Rare': return "border-blue-500 bg-blue-900/95 text-white";
            default: return "border-gray-500 bg-gray-900/95 text-gray-200";
        }
    };

    return (
        <div className="min-h-screen py-8 font-sans text-white relative">
            <style>{`
                @keyframes pulse-gold {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255, 215, 0, 0.6); }
                    50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(255, 215, 0, 0.9); }
                }
                .animate-pulse-gold {
                    animation: pulse-gold 2s infinite ease-in-out;
                }
                .glass-panel {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
            `}</style>
            
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <div className="text-center mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link to="/minecraft" className="inline-block text-gray-400 hover:text-white mb-2 text-sm font-bold transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Bingo Board Container */}
                <div className="relative max-w-6xl w-full flex flex-col items-center">
                    
                    {/* Visual Board Background */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-xl border-[10px] border-[#1f090c] rounded-[2rem] shadow-2xl overflow-hidden z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    </div>

                    {/* Content Wrapper */}
                    <div className="relative z-10 w-full p-4 md:p-8 flex flex-col items-center">
                        
                        {/* Logo */}
                        <div className="mb-2 w-full flex justify-center relative z-10">
                            <img 
                                src={LOGO_URL} 
                                alt="Cobble Bingo" 
                                className="h-20 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                            />
                        </div>

                        {/* ID Display */}
                        <div className="mb-4 flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Card ID:</span>
                            <span className="text-brand-primary font-mono font-black tracking-widest text-lg">{currentCardId || "LOADING..."}</span>
                        </div>
                        
                        {/* The Grid */}
                        <div className="overflow-visible py-4 md:pb-4 custom-scrollbar flex justify-center w-full relative z-10 min-h-[500px]">
                            {/* POPUP OVERLAY */}
                            {showBingoPopup && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-in zoom-in fade-in duration-300">
                                    <div className="bg-[#FFD700] border-4 border-white text-black font-black text-6xl md:text-8xl px-12 py-6 rounded-full shadow-[0_0_60px_rgba(255,215,0,0.8)] flex flex-col items-center drop-shadow-md animate-pulse-gold transform -rotate-12">
                                        <span className="drop-shadow-sm tracking-widest text-white/90 stroke-black" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.2)' }}>BINGO!</span>
                                        {bingoCount > 1 && <span className="text-3xl md:text-5xl text-white mt-2 drop-shadow-md">{bingoCount}X COMBO</span>}
                                    </div>
                                </div>
                            )}

                            {loadingSheet ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse mt-10">
                                    <div className="text-4xl mb-4">📄</div>
                                    <div className="font-bold">Fetching Live Data from Google Sheets...</div>
                                </div>
                            ) : sheetError ? (
                                <div className="flex flex-col items-center justify-center text-red-400 mt-10">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <div className="font-bold">Failed to load Pokemon data.</div>
                                    <div className="text-sm opacity-70">Please check the Google Sheet permissions.</div>
                                </div>
                            ) : gridData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse mt-10">
                                    <div className="text-4xl mb-4">🔮</div>
                                    <div className="font-bold">Scouting Pokémon...</div>
                                </div>
                            ) : (
                                <div className={`grid grid-cols-5 gap-1 md:gap-3 w-full transition-opacity duration-300 ${isGenerating ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'} relative`}>
                                    
                                    {/* SVG Overlay for Winning Lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-50 overflow-visible">
                                        <defs>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        {winningLines.map((combo, i) => {
                                            const coords = getLineCoords(combo);
                                            if (!coords) return null;
                                            return (
                                                <line 
                                                    key={i} 
                                                    x1={coords.x1} y1={coords.y1} 
                                                    x2={coords.x2} y2={coords.y2} 
                                                    stroke="#ef4444" 
                                                    strokeWidth="8" 
                                                    strokeLinecap="round" 
                                                    filter="url(#glow)"
                                                    className="opacity-90 drop-shadow-md"
                                                />
                                            );
                                        })}
                                    </svg>

                                    {gridData.map((item, index) => {
                                        const formattedName = getFormattedName(item.name);
                                        const wikiUrl = `https://cobblemon.tools/pokedex/pokemon/${formattedName}`;
                                        
                                        return (
                                            <div 
                                                key={`${item.id}-${index}`} 
                                                onClick={() => toggleMark(index)}
                                                className="relative aspect-[4/5] group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                                            >
                                                {/* 1. CLIPPED CONTENT (Inner Card) */}
                                                <div className={`
                                                    absolute inset-0 rounded-xl overflow-hidden flex flex-col z-0
                                                    ${getCardVisuals(item.rarity)}
                                                    ${marked[index] ? 'grayscale-[0.8] brightness-75 border-red-900/50' : ''}
                                                `}>
                                                    {/* Background Decor for High Rarity */}
                                                    {(item.rarity === 'Legendary' || item.rarity === 'Mythical') && (
                                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
                                                    )}

                                                    {/* Rarity Badge - Top Right */}
                                                    <div className={`
                                                        absolute top-1 right-1 md:top-2 md:right-2 z-20
                                                        text-[6px] md:text-[8px] font-bold uppercase tracking-wider px-1 md:px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm
                                                        ${getRarityBadgeStyle(item.rarity)}
                                                    `}>
                                                        {item.rarity === 'Ultra-Rare' ? 'UR' : item.rarity}
                                                    </div>

                                                    {/* Image Container */}
                                                    <div className="flex-1 flex items-center justify-center p-1 md:p-3 pb-6 md:pb-8 relative z-10">
                                                        <BingoCardImage item={item} />
                                                    </div>

                                                    {/* Cross Out Overlay - inside clipped area */}
                                                    {marked[index] && (
                                                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
                                                            <svg className="w-3/4 h-3/4 text-red-600/90 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round">
                                                                <line x1="20" y1="20" x2="80" y2="80" />
                                                                <line x1="80" y1="20" x2="20" y2="80" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 2. FLOATING NAMEPLATE & TOOLTIP (Outside Clipped Area) */}
                                                <div 
                                                    className={`absolute bottom-0 left-0 right-0 py-1 md:py-1.5 z-40 flex justify-center group/nameplate rounded-b-xl ${getNamePlateStyle(item.rarity)}`}
                                                    onClick={(e) => e.stopPropagation()} 
                                                >
                                                    {/* Tooltip on Hover */}
                                                    <div className={`
                                                        absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[150px] md:max-w-[200px] p-3 rounded-lg border shadow-2xl
                                                        opacity-0 invisible group-hover/nameplate:opacity-100 group-hover/nameplate:visible 
                                                        transition-all duration-200 z-[100] backdrop-blur-md pointer-events-none
                                                        ${getTooltipStyle(item.rarity)}
                                                    `}>
                                                        <div className="text-[10px] font-bold uppercase tracking-widest border-b border-white/20 pb-1 mb-1 opacity-70">Biome</div>
                                                        <div className="text-xs font-medium leading-relaxed whitespace-normal">
                                                            {item.spawns.join(', ')}
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${getTooltipStyle(item.rarity)}`}></div>
                                                    </div>

                                                    <a 
                                                        href={wikiUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[8px] md:text-xs font-bold text-center text-white truncate px-1 md:px-2 hover:text-brand-primary hover:underline transition-colors flex items-center gap-1 group/link drop-shadow-md"
                                                    >
                                                        {item.name}
                                                        <svg className="w-2 md:w-2.5 h-2 md:h-2.5 opacity-50 group-hover/link:opacity-100 transition-opacity hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CONTROL DOCK (Bottom Right) --- */}
                <div className="fixed bottom-0 right-0 p-4 z-[100] w-full md:w-auto">
                    <div className="glass-panel p-4 rounded-3xl flex flex-col gap-4 w-full md:w-80 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-500">
                        {/* Title */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-2">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400">Control Deck</div>
                            <div className="flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleManualLoad} className="flex gap-2">
                            <input 
                                type="text" 
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0,9))}
                                placeholder="Enter Card ID"
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm placeholder:text-gray-600 focus:border-brand-primary outline-none tracking-widest uppercase"
                            />
                            <button 
                                type="submit" 
                                disabled={inputCode.length === 0}
                                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors"
                            >
                                Load
                            </button>
                        </form>

                        {/* Main Actions */}
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => generateCard()}
                                disabled={isGenerating || loadingSheet}
                                className={`
                                    bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-2 rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1
                                    ${isGenerating || loadingSheet ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                <span>🎲</span>
                                <span>Random Card</span>
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setMarked(new Array(25).fill(false));
                                    setWinningLines([]);
                                    setBingoCount(0);
                                    prevBingoCountRef.current = 0;
                                    setShowBingoPopup(false);
                                    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
                                }}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-2 rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1"
                            >
                                <span>🧹</span>
                                <span>Clear Marks</span>
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bingo;
