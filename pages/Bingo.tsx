
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
    const [gridData, setGridData] = useState<BingoCell[]>([]);
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
    const [isGenerating, setIsGenerating] = useState(false);
    
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

                // Iterate rows
                // Column Mapping based on request:
                // A [0] = ID
                // B [1] = Name
                // C [2] = Entry # (Ignored/Implicit via grouping)
                // D [3] = Bucket (Rarity)
                // H [7] = Biome
                rows.forEach((cols, index) => {
                    if (index === 0) return; // Skip Header
                    
                    // Name is critical (Column B / Index 1)
                    const name = cols[1];
                    if (!name || !name.trim()) return;

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
                    // Check if column exists first
                    const biomeRaw = cols[7];
                    if (biomeRaw && biomeRaw !== '#N/A' && biomeRaw.toLowerCase() !== 'none' && biomeRaw.trim() !== '') {
                        // Clean biome name (e.g., "minecraft:plains" -> "Plains")
                        const cleanBiome = biomeRaw.split(':').pop()?.replace(/_/g, ' ') || biomeRaw;
                        const formattedBiome = cleanBiome.replace(/\b\w/g, c => c.toUpperCase());
                        entry.spawns.add(formattedBiome);
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

    const generateNewCard = useCallback(async () => {
        if (!cobblemonPool || cobblemonPool.length === 0) return;
        setIsGenerating(true);
        
        try {
            // Pick 25 Unique Pokemon directly from our sheet data
            const available = [...cobblemonPool];
            const selected: BingoCell[] = [];
            const selectedIndices = new Set<number>();

            // Basic safety check
            if (available.length < 25) {
                let i = 0;
                while (selected.length < 25) {
                    const entry = available[i % available.length];
                    selected.push({
                        id: entry.id,
                        name: entry.name,
                        rarity: entry.rarity,
                        spawns: Array.from(entry.spawns).length > 0 ? Array.from(entry.spawns) : ["Unknown Location"]
                    });
                    i++;
                }
            } else {
                // Random Selection without duplicates
                while (selected.length < 25) {
                    const idx = Math.floor(Math.random() * available.length);
                    if (!selectedIndices.has(idx)) {
                        selectedIndices.add(idx);
                        const entry = available[idx];
                        selected.push({
                            id: entry.id,
                            name: entry.name,
                            rarity: entry.rarity,
                            spawns: Array.from(entry.spawns).length > 0 ? Array.from(entry.spawns) : ["Unknown Location"]
                        });
                    }
                }
            }
            
            // Simulate a short delay for effect if needed, but strictly data is ready immediately
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setGridData(selected);
            setMarked(new Array(25).fill(false));

        } catch (e) {
            console.error("Bingo Generation Failed:", e);
        } finally {
            setIsGenerating(false);
        }
    }, [cobblemonPool]);

    // Initial Generation once pool is loaded
    useEffect(() => {
        let mounted = true;
        if (mounted && !loadingSheet && cobblemonPool && gridData.length === 0) {
            generateNewCard();
        }
        return () => { mounted = false; };
    }, [loadingSheet, cobblemonPool, generateNewCard]);

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

    // Modified to return only visual styles (color, border, shadow), removed layout/overflow props
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

    // Helper for Tooltip Styles
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
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link to="/minecraft" className="inline-block text-gray-400 hover:text-white mb-4 text-sm font-bold transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Bingo Board Container */}
                <div className="bg-black/30 backdrop-blur-xl border-[10px] border-[#1f090c] rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden max-w-6xl w-full flex flex-col items-center">
                    {/* Decorative Background inside board */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    
                    {/* Logo */}
                    <div className="mb-6 w-full flex justify-center relative z-10">
                        <img 
                            src={LOGO_URL} 
                            alt="Cobble Bingo" 
                            className="h-20 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                        />
                    </div>

                    {/* Controls */}
                    <div className="mb-6 flex gap-4 relative z-10">
                        <button 
                            onClick={generateNewCard}
                            disabled={isGenerating || loadingSheet}
                            className={`
                                bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 uppercase text-xs tracking-widest
                                ${isGenerating || loadingSheet ? 'opacity-70 cursor-wait animate-pulse' : ''}
                            `}
                        >
                            {loadingSheet ? 'Loading Sheet...' : isGenerating ? 'Scouting...' : 'Generate New Card'}
                        </button>
                    </div>
                    
                    {/* The Grid - Added py-16 to container to allow tooltips to spill out */}
                    <div className="overflow-visible py-16 md:pb-4 custom-scrollbar flex justify-center w-full relative z-10 min-h-[500px]">
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
                            <div className={`grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 w-full transition-opacity duration-300 ${isGenerating ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
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
                                                    absolute top-2 right-2 z-20
                                                    text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm
                                                    ${getRarityBadgeStyle(item.rarity)}
                                                `}>
                                                    {item.rarity === 'Ultra-Rare' ? 'UR' : item.rarity}
                                                </div>

                                                {/* Image Container */}
                                                <div className="flex-1 flex items-center justify-center p-3 pb-8 relative z-10">
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
                                                className={`absolute bottom-0 left-0 right-0 py-1.5 z-40 flex justify-center group/nameplate rounded-b-xl ${getNamePlateStyle(item.rarity)}`}
                                                onClick={(e) => e.stopPropagation()} 
                                            >
                                                {/* Tooltip on Hover */}
                                                <div className={`
                                                    absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] p-3 rounded-lg border shadow-2xl
                                                    opacity-0 invisible group-hover/nameplate:opacity-100 group-hover/nameplate:visible 
                                                    transition-all duration-200 z-[100] backdrop-blur-md pointer-events-none
                                                    ${getTooltipStyle(item.rarity)}
                                                `}>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest border-b border-white/20 pb-1 mb-1 opacity-70">Biome</div>
                                                    <div className="text-xs font-medium leading-relaxed">
                                                        {item.spawns.join(', ')}
                                                    </div>
                                                    {/* Arrow */}
                                                    <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${getTooltipStyle(item.rarity)}`}></div>
                                                </div>

                                                <a 
                                                    href={wikiUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] md:text-xs font-bold text-center text-white truncate px-2 hover:text-brand-primary hover:underline transition-colors flex items-center gap-1 group/link drop-shadow-md"
                                                >
                                                    {item.name}
                                                    <svg className="w-2.5 h-2.5 opacity-50 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setMarked(new Array(25).fill(false))}
                            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Clear Marks Only
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bingo;
