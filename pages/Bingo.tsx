
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';
import UserProfile from '../components/UserProfile';

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

// Saved Card Interface
interface SavedCard {
    _id: string;
    name: string;
    cardId: string;
    gridData: BingoCell[];
    marked: boolean[];
    updatedAt: string;
}

type BingoDifficulty = 'Default' | 'Easy' | 'Normal' | 'Hard' | 'Insane' | 'Nightmare';

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

// Difficulty Mapping
const DIFF_PREFIXES: Record<BingoDifficulty, string> = {
    'Default': 'D',
    'Easy': 'E',
    'Normal': 'N',
    'Hard': 'H',
    'Insane': 'I',
    'Nightmare': 'X'
};

const PREFIX_TO_DIFF: Record<string, BingoDifficulty> = {
    'D': 'Default',
    'E': 'Easy',
    'N': 'Normal',
    'H': 'Hard',
    'I': 'Insane',
    'X': 'Nightmare'
};

const FREE_SPACE_CELL: BingoCell = {
    id: -1,
    name: "FREE SPACE",
    rarity: "Free",
    spawns: ["Enjoy!"]
};

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

// Generate a random ID with difficulty prefix
const generateRandomId = (difficulty: BingoDifficulty) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) { // 8 chars + prefix = 10-ish total
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const prefix = DIFF_PREFIXES[difficulty];
    return `${prefix}-${result}`;
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
        // Free Space handling
        if (item.id === -1) {
            setImgSrc("https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif"); // Use a placeholder or logo
            return;
        }

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
        if (item.id === -1) return;
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
            className={`w-full h-full object-contain drop-shadow-lg transition-transform duration-300 ${item.id === -1 ? 'scale-75' : 'group-hover:scale-110'}`}
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
    const [activeDifficulty, setActiveDifficulty] = useState<BingoDifficulty>('Default');
    
    // Bingo Win State
    const [winningLines, setWinningLines] = useState<number[][]>([]);
    const [bingoCount, setBingoCount] = useState(0);
    const [showBingoPopup, setShowBingoPopup] = useState(false);
    
    // Auth & Modals
    const [user, setUser] = useState<any>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [cardName, setCardName] = useState("");
    const [loadedCardName, setLoadedCardName] = useState<string | null>(null); // To track if we are working on a saved card
    
    // Success Modal State
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedCardName, setSavedCardName] = useState("");

    const [showLoadModal, setShowLoadModal] = useState(false);
    const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
    const [saving, setSaving] = useState(false);
    const [loadingCards, setLoadingCards] = useState(false);

    // Difficulty Modal State
    const [showDiffModal, setShowDiffModal] = useState(false);

    // Copy State
    const [copySuccess, setCopySuccess] = useState(false);

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

                // Convert map to array
                let cobblemonArray = Array.from(poolMap.values());
                
                // Sort by ID then Name to ensure deterministic RNG across reloads
                cobblemonArray.sort((a, b) => {
                    if (a.id !== b.id) return a.id - b.id;
                    return a.name.localeCompare(b.name);
                });

                if (cobblemonArray.length === 0) throw new Error("No data found in sheet after filtering");
                
                setCobblemonPool(cobblemonArray);
            } catch (e) {
                console.error("Sheet Error:", e);
                setSheetError(true);
            } finally {
                setLoadingSheet(false);
            }
        };

        fetchSheetData();
    }, []);

    // 2. Win Logic
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

    // 3. Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        };
    }, []);

    // 4. Check for Query Params (Load Saved)
    useEffect(() => {
        if (searchParams.get('view') === 'saved') {
            setShowLoadModal(true);
            // Fetch list immediately if user exists
            if (user?.id) fetchSavedCards();
        }
    }, [searchParams, user]); // Trigger when URL changes or user logs in

    // --- SAVE / LOAD API LOGIC ---

    const fetchSavedCards = async () => {
        if (!user?.id) return;
        setLoadingCards(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/list?discordId=${user.id}`);
            if (res.ok) {
                setSavedCards(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingCards(false);
        }
    };

    const openSaveModal = () => {
        if (!user) {
            alert("Please login first to save!");
            return;
        }
        // Fetch latest cards to ensure we check collision against up-to-date data
        fetchSavedCards();
        setCardName(loadedCardName || "");
        setShowSaveModal(true);
    };

    const handleSaveCard = async () => {
        if (!user?.id) {
            alert("Please login first!");
            return;
        }
        if (!cardName.trim()) return;

        setSaving(true);
        try {
            const payload = {
                discordId: user.id,
                name: cardName.trim(),
                cardId: currentCardId,
                gridData: gridData,
                marked: marked
            };

            const res = await fetch(`${API_BASE_URL}/api/bingo/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowSaveModal(false);
                setLoadedCardName(cardName.trim());
                setSavedCardName(cardName.trim());
                setShowSuccessModal(true);
                fetchSavedCards(); // Refresh list silently
            } else {
                alert("Failed to save card.");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setSaving(false);
        }
    };

    const loadCard = (card: SavedCard) => {
        setGridData(card.gridData);
        setMarked(card.marked);
        setCurrentCardId(card.cardId);
        setLoadedCardName(card.name);
        
        // Parse Difficulty for display/logic sync (Optional but good for UI consistency)
        const parts = card.cardId.split('-');
        if (parts.length === 2 && parts[0].length === 1 && PREFIX_TO_DIFF[parts[0]]) {
            setActiveDifficulty(PREFIX_TO_DIFF[parts[0]] as BingoDifficulty);
        }

        setShowLoadModal(false);
        // Clean URL param
        setSearchParams({});
    };

    const deleteCard = async (name: string) => {
        if (!confirm(`Delete card "${name}"?`)) return;
        try {
            await fetch(`${API_BASE_URL}/api/bingo/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id, name })
            });
            fetchSavedCards(); // Refresh list
            if (loadedCardName === name) setLoadedCardName(null);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCopyId = () => {
        if (!currentCardId) return;
        navigator.clipboard.writeText(currentCardId);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    // --- SEEDED GENERATION LOGIC ---
    const generateCard = useCallback(async (customId?: string, difficulty: BingoDifficulty = 'Default') => {
        if (!cobblemonPool || cobblemonPool.length === 0) return;
        setIsGenerating(true);
        setShowDiffModal(false);
        setLoadedCardName(null); // Reset loaded state for new random cards
        
        try {
            // 1. Determine ID and Difficulty
            let idToUse = customId;
            let diffToUse = difficulty;

            if (customId) {
                // Check if ID contains encoded difficulty (Format: Prefix-RandomString)
                const parts = customId.split('-');
                if (parts.length === 2 && parts[0].length === 1 && PREFIX_TO_DIFF[parts[0]]) {
                    diffToUse = PREFIX_TO_DIFF[parts[0]] as BingoDifficulty;
                }
                // If legacy ID or manual input without prefix, rely on passed difficulty or default
            } else {
                // Generate new ID with difficulty prefix
                idToUse = generateRandomId(difficulty);
                diffToUse = difficulty;
            }
            
            // 2. Set URL & State
            if (idToUse) setCurrentCardId(idToUse);
            setActiveDifficulty(diffToUse);
            setSearchParams({ id: idToUse });
            setInputCode(""); // Clear input

            // 3. Initialize PRNG with the ID
            const seed = cyrb128(idToUse || "DEFAULT");
            const rng = mulberry32(seed[0]);

            // Helper to get random items from filtered pool
            const getRandomItems = (rarities: BingoCell['rarity'][], count: number) => {
                let pool = cobblemonPool.filter(p => rarities.includes(p.rarity));
                if (pool.length === 0) pool = cobblemonPool; // Fallback
                
                // Create a copy to shuffle (avoid modifying the original sorted pool order in memory)
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

            // 4. GENERATION BASED ON DIFFICULTY (Using Parsed Difficulty)
            if (diffToUse === 'Easy') {
                // 12 Common, 12 Uncommon (Total 24) + Free Space
                const commons = getRandomItems(['Common'], 12);
                const uncommons = getRandomItems(['Uncommon'], 12);
                selected = [...commons, ...uncommons];
            } else if (diffToUse === 'Normal') {
                // 6 Common, 6 Uncommon, 6 Rare, 6 Ultra-Rare (Total 24) + Free Space
                selected = [
                    ...getRandomItems(['Common'], 6),
                    ...getRandomItems(['Uncommon'], 6),
                    ...getRandomItems(['Rare'], 6),
                    ...getRandomItems(['Ultra-Rare'], 6)
                ];
            } else if (diffToUse === 'Hard') {
                // 12 Rare, 12 Ultra-Rare (Total 24) + Free Space
                selected = [
                    ...getRandomItems(['Rare'], 12),
                    ...getRandomItems(['Ultra-Rare'], 12)
                ];
            } else if (diffToUse === 'Insane') {
                // 24 Ultra-Rare + 1 Legendary Middle
                selected = getRandomItems(['Ultra-Rare'], 24);
            } else if (diffToUse === 'Nightmare') {
                // 20 Ultra-Rare + 1 Mythic Middle + 4 Legendary Corners
                selected = getRandomItems(['Ultra-Rare'], 20);
            } else {
                // DEFAULT: Pure Random
                const pool = [...cobblemonPool];
                // Shuffle logic copied to avoid modifying main pool
                const tempPool = [...pool];
                for (let i = tempPool.length - 1; i > 0; i--) {
                    const j = Math.floor(rng() * (i + 1));
                    [tempPool[i], tempPool[j]] = [tempPool[j], tempPool[i]];
                }
                selected = tempPool.slice(0, 24).map(entry => ({
                    id: entry.id,
                    name: entry.name,
                    rarity: entry.rarity,
                    spawns: Array.from(entry.spawns).sort().length > 0 ? Array.from(entry.spawns).sort() : ["Unknown Location"]
                }));
            }

            // Shuffle the selected set before placing into grid
            for (let i = selected.length - 1; i > 0; i--) {
                const j = Math.floor(rng() * (i + 1));
                [selected[i], selected[j]] = [selected[j], selected[i]];
            }

            // 5. CONSTRUCT FINAL GRID (25 Cells)
            const finalGrid: BingoCell[] = new Array(25).fill(null);

            // Helper to fill grid while skipping specific indices
            const fillGrid = (source: BingoCell[], skipIndices: number[]) => {
                let sourceIdx = 0;
                for (let i = 0; i < 25; i++) {
                    if (skipIndices.includes(i)) continue;
                    if (sourceIdx < source.length) {
                        finalGrid[i] = source[sourceIdx++];
                    } else {
                        // Fallback fill if not enough items
                        finalGrid[i] = getRandomItems(['Common'], 1)[0];
                    }
                }
            };

            if (diffToUse === 'Insane') {
                // Center is Legendary
                fillGrid(selected, [12]);
                finalGrid[12] = getRandomItems(['Legendary'], 1)[0];
            } else if (diffToUse === 'Nightmare') {
                // Center Mythic, Corners Legendary
                const corners = [0, 4, 20, 24];
                fillGrid(selected, [12, ...corners]);
                
                finalGrid[12] = getRandomItems(['Mythical'], 1)[0];
                const legends = getRandomItems(['Legendary'], 4);
                corners.forEach((idx, i) => finalGrid[idx] = legends[i]);
            } else {
                // Default, Easy, Normal, Hard -> Center is Free Space
                fillGrid(selected, [12]);
                finalGrid[12] = FREE_SPACE_CELL;
            }
            
            await new Promise(resolve => setTimeout(resolve, 300)); // Slight visual delay
            
            setGridData(finalGrid);
            
            // Reset marks for new generation
            setMarked(new Array(25).fill(false));
            
            // Auto-mark free space if exists
            if (diffToUse !== 'Insane' && diffToUse !== 'Nightmare') {
                const newMarked = new Array(25).fill(false);
                newMarked[12] = true;
                setMarked(newMarked);
            }

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
        // Don't generate automatically if we are in 'view=saved' mode, wait for user to pick
        // But if view is not saved and no ID, gen random.
        const viewMode = searchParams.get('view');
        
        if (mounted && !loadingSheet && cobblemonPool && gridData.length === 0 && viewMode !== 'saved') {
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
            case 'Free': return 'bg-white text-black font-black tracking-widest';
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
            case 'Free':
                return `${base} border-white/80 bg-gradient-to-br from-white/20 to-black/80 shadow-inner group-hover:bg-white/30`;
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
            case 'Free':
                return "bg-white text-black font-black border-t border-white backdrop-blur-md";
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
        <div className="min-h-screen py-2 font-sans text-white relative">
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
                
                {/* Header - Absolute Top Left on Desktop */}
                <div className="absolute top-4 left-4 z-50">
                    <Link to="/minecraft/bingo" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md">
                        <span>←</span> Back to Bingo Dashboard
                    </Link>
                </div>

                {/* USER PROFILE - Absolute Top Right */}
                <UserProfile 
                    onUserChange={setUser} 
                    className="!absolute top-4 right-4"
                />

                {/* Bingo Board Container - Added padding on mobile to clear button */}
                <div className="relative max-w-3xl w-full flex flex-col items-center pt-12 md:pt-0">
                    
                    {/* Visual Board Background */}
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-xl border-[10px] border-[#1f090c] rounded-[2rem] shadow-2xl overflow-hidden z-0">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    </div>

                    {/* Content Wrapper - Reduced Padding */}
                    <div className="relative z-10 w-full p-2 md:p-6 flex flex-col items-center">
                        
                        {/* Logo - Reduced Size */}
                        <div className="mb-2 w-full flex justify-center relative z-10">
                            <img 
                                src={LOGO_URL} 
                                alt="Cobble Bingo" 
                                className="h-16 md:h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                            />
                        </div>

                        {/* ID Display */}
                        <div className="mb-2 flex items-center justify-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10 shadow-inner">
                            <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-[1px]">Card ID:</span>
                            <span className="text-brand-primary font-mono font-black tracking-widest text-sm leading-none">{currentCardId || "LOADING..."}</span>
                            {activeDifficulty !== 'Default' && (
                                <span className={`text-[8px] uppercase font-bold px-1.5 py-0.5 rounded ml-1 bg-white/10 text-gray-300`}>
                                    {activeDifficulty}
                                </span>
                            )}
                        </div>
                        
                        {/* The Grid - Removed min-height to fit content */}
                        <div className="overflow-visible py-2 md:pb-4 custom-scrollbar flex justify-center w-full relative z-10">
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
                                <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse mt-10 min-h-[300px]">
                                    <div className="text-4xl mb-4">📄</div>
                                    <div className="font-bold">Fetching Pokemon Data...</div>
                                </div>
                            ) : sheetError ? (
                                <div className="flex flex-col items-center justify-center text-red-400 mt-10 min-h-[300px]">
                                    <div className="text-4xl mb-4">⚠️</div>
                                    <div className="font-bold">Failed to load Pokemon data.</div>
                                    <div className="text-sm opacity-70">Please check the Google Sheet permissions.</div>
                                </div>
                            ) : gridData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse mt-10 min-h-[300px]">
                                    <div className="text-4xl mb-4">🔮</div>
                                    <div className="font-bold">Preparing Bingo Card...</div>
                                    {searchParams.get('view') === 'saved' && (
                                        <div className="mt-4 text-white">Select a saved card from the menu!</div>
                                    )}
                                </div>
                            ) : (
                                <div className={`grid grid-cols-5 gap-2 w-full transition-opacity duration-300 ${isGenerating ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'} relative`}>
                                    
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

                                                    {/* Rarity Badge - Top Right - INCREASED SIZE */}
                                                    <div className={`
                                                        absolute top-1 right-1 z-20
                                                        text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm
                                                        ${getRarityBadgeStyle(item.rarity)}
                                                    `}>
                                                        {item.rarity === 'Ultra-Rare' ? 'ULTRA RARE' : item.rarity}
                                                    </div>

                                                    {/* Image Container - Adjusted Padding for compact fit */}
                                                    <div className="flex-1 flex items-center justify-center p-1 pb-6 relative z-10">
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
                                                    className={`absolute bottom-0 left-0 right-0 py-1 z-40 flex justify-center group/nameplate rounded-b-xl ${getNamePlateStyle(item.rarity)}`}
                                                    onClick={(e) => e.stopPropagation()} 
                                                >
                                                    {/* Tooltip on Hover */}
                                                    <div className={`
                                                        absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[120px] md:max-w-[200px] p-2 rounded-lg border shadow-2xl
                                                        opacity-0 invisible group-hover/nameplate:opacity-100 group-hover/nameplate:visible 
                                                        transition-all duration-200 z-[100] backdrop-blur-md pointer-events-none
                                                        ${getTooltipStyle(item.rarity)}
                                                    `}>
                                                        <div className="text-[9px] font-bold uppercase tracking-widest border-b border-white/20 pb-1 mb-1 opacity-70">
                                                            {item.rarity === 'Legendary' ? 'Condition' : 'Biome'}
                                                        </div>
                                                        <div className="text-[10px] font-medium leading-relaxed whitespace-normal">
                                                            {item.spawns.join(', ')}
                                                        </div>
                                                        {/* Arrow */}
                                                        <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r ${getTooltipStyle(item.rarity)}`}></div>
                                                    </div>

                                                    <a 
                                                        href={wikiUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`text-[8px] md:text-[10px] text-center truncate px-1 transition-colors flex items-center gap-1 group/link drop-shadow-md ${item.rarity === 'Free' ? 'text-black font-black' : 'text-white font-bold hover:text-brand-primary hover:underline'}`}
                                                    >
                                                        {item.name}
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

                        {/* ID Display & Copy - NEW SECTION */}
                        {currentCardId && (
                            <div className="bg-black/40 rounded-xl p-3 flex justify-between items-center border border-white/5">
                                <div className="flex flex-col min-w-0 pr-2">
                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Seed ID</span>
                                    <span className="font-mono text-brand-primary font-bold truncate text-sm tracking-wide">{currentCardId}</span>
                                </div>
                                <button 
                                    onClick={handleCopyId}
                                    className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                                    title="Copy ID to Clipboard"
                                >
                                    {copySuccess ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <form onSubmit={handleManualLoad} className="flex gap-2">
                            <input 
                                type="text" 
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0,11))}
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
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setShowDiffModal(true)}
                                disabled={isGenerating || loadingSheet}
                                className={`
                                    bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-1 rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1
                                    ${isGenerating || loadingSheet ? 'opacity-70 cursor-wait' : ''}
                                `}
                            >
                                <span>🎲</span>
                                <span>Generate</span>
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
                                className="bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold py-3 px-1 rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1"
                            >
                                <span>🧹</span>
                                <span>Clear</span>
                            </button>

                            <button 
                                onClick={openSaveModal}
                                className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-3 px-1 rounded-xl shadow-lg transition-all transform hover:scale-105 uppercase text-[10px] tracking-widest flex flex-col items-center justify-center gap-1"
                            >
                                <span>💾</span>
                                <span>Save</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* DIFFICULTY MODAL */}
                {showDiffModal && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative">
                            <button onClick={() => setShowDiffModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                            <h3 className="text-xl font-black text-white mb-6 text-center">Select Difficulty</h3>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Default', desc: 'Standard Random', color: 'bg-gray-600 hover:bg-gray-500' },
                                    { label: 'Easy', desc: 'Common/Uncommon', color: 'bg-green-600 hover:bg-green-500' },
                                    { label: 'Normal', desc: 'Balanced Mix', color: 'bg-blue-600 hover:bg-blue-500' },
                                    { label: 'Hard', desc: 'Rare/Ultra-Rare', color: 'bg-purple-600 hover:bg-purple-500' },
                                    { label: 'Insane', desc: 'All UR + 1 Legend', color: 'bg-red-600 hover:bg-red-500' },
                                    { label: 'Nightmare', desc: 'UR + Mythic/Legend', color: 'bg-gradient-to-r from-purple-900 to-black border border-purple-500 hover:brightness-110' },
                                ].map((opt) => (
                                    <button
                                        key={opt.label}
                                        onClick={() => generateCard(undefined, opt.label as BingoDifficulty)}
                                        className={`${opt.color} text-white p-3 rounded-xl shadow-lg transition-transform hover:scale-105 flex flex-col items-center justify-center h-24`}
                                    >
                                        <span className="font-bold uppercase tracking-wider text-sm">{opt.label}</span>
                                        <span className="text-[10px] opacity-80 mt-1 text-center leading-tight">{opt.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SAVE MODAL */}
                {showSaveModal && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl relative">
                            <h3 className="text-xl font-black text-white mb-4">Save Your Bingo Card</h3>
                            
                            <input 
                                type="text" 
                                value={cardName} 
                                onChange={(e) => setCardName(e.target.value)} 
                                placeholder="Name your card (e.g. Weekly Grind)" 
                                className={`
                                    w-full bg-black/40 border rounded-xl px-4 py-3 text-white mb-2 focus:outline-none transition-all font-bold
                                    ${savedCards.some(c => c.name.toLowerCase() === cardName.toLowerCase()) ? 'border-yellow-500 focus:border-yellow-500' : 'border-white/10 focus:border-brand-primary'}
                                `}
                                autoFocus
                            />
                            
                            {/* Warning or Hints */}
                            {savedCards.some(c => c.name.toLowerCase() === cardName.toLowerCase() && cardName.trim() !== "") && (
                                <div className="text-yellow-500 text-xs font-bold mb-4 flex items-center gap-1">
                                    <span>⚠️</span> Warning: This will overwrite your existing save.
                                </div>
                            )}

                            {/* Quick Select List */}
                            {savedCards.length > 0 && (
                                <div className="mb-4">
                                    <div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Or overwrite existing save:</div>
                                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                        {savedCards.map(c => (
                                            <button 
                                                key={c._id}
                                                onClick={() => setCardName(c.name)}
                                                className={`
                                                    text-xs px-2 py-1 rounded-lg border transition-colors
                                                    ${cardName === c.name ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30'}
                                                `}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button 
                                    onClick={() => setShowSaveModal(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-3 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveCard}
                                    disabled={!cardName.trim() || saving}
                                    className={`
                                        flex-1 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50
                                        ${savedCards.some(c => c.name.toLowerCase() === cardName.toLowerCase()) 
                                            ? 'bg-yellow-600 hover:bg-yellow-500' 
                                            : 'bg-brand-primary hover:bg-red-600'}
                                    `}
                                >
                                    {saving ? 'Saving...' : 
                                     savedCards.some(c => c.name.toLowerCase() === cardName.toLowerCase()) ? 'Overwrite' : 'Save New'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SUCCESS MODAL */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-[#1a0b0e] border border-white/10 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">Saved Successfully!</h3>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                Your bingo card has been saved as <br/>
                                <span className="text-brand-primary font-bold text-lg">"{savedCardName}"</span><br/>
                                successfully!
                            </p>
                            <button 
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* MY BINGO (LOAD) MODAL */}
                {showLoadModal && (
                    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-[#1a0b0e] w-full max-w-2xl max-h-[80vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                                    <span>📂</span> My Saved Cards
                                </h2>
                                <button onClick={() => { setShowLoadModal(false); setSearchParams({}); }} className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-brand-primary transition-colors">
                                    ✕
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {loadingCards ? (
                                    <div className="text-center py-10 text-gray-500 animate-pulse">Loading saved cards...</div>
                                ) : savedCards.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <div className="text-4xl mb-2">📭</div>
                                        <div>No saved cards found.</div>
                                    </div>
                                ) : (
                                    savedCards.map((card) => {
                                        const marks = card.marked.filter(Boolean).length;
                                        const percentage = Math.round((marks / 25) * 100);
                                        return (
                                            <div key={card._id} className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-brand-primary/20 flex items-center justify-center text-xl font-bold text-brand-primary border border-brand-primary/30 shadow-inner">
                                                    {card.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <h3 className="font-bold text-white text-lg truncate pr-2">{card.name}</h3>
                                                        <span className="text-xs text-gray-500 font-mono">{new Date(card.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                                        <span className="bg-black/30 px-2 py-0.5 rounded font-mono">{card.cardId}</span>
                                                        <span>{marks}/25 Marked</span>
                                                        <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden">
                                                            <div className="h-full bg-brand-primary rounded-full" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => loadCard(card)}
                                                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-lg transition-transform hover:scale-105"
                                                    >
                                                        LOAD
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteCard(card.name)}
                                                        className="bg-red-900/30 hover:bg-red-600 text-red-200 hover:text-white px-3 py-2 rounded-xl transition-colors"
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Bingo;
