
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import UserProfile from '../components/UserProfile';

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface CardData {
    id: number;
    name: string;
    type: 'Pokemon' | 'Item';
    subType: string; // e.g. "Genetic", "Mythical", "Normal"
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical';
    image?: string; 
    description?: string;
    hp?: number; 
    weight?: number; // Higher number = more frequent
}

// --- CONSTANTS ---
// Updated to Cobblemon Tools source as requested
const MEWTWO_IMAGE = "https://cobblemon.tools/pokedex/pokemon/mewtwo/sprite.png";
const MEW_IMAGE = "https://cobblemon.tools/pokedex/pokemon/mew/sprite.png";

// --- DATA POOLS ---

// THEME: MEWTWO (Genetic / Science / Lab)
const LAMB_POOL: CardData[] = [
    // The Chase (Now weigh 1, randomly obtainable)
    { id: 150, name: "Mewtwo", type: 'Pokemon', subType: "Artificial", rarity: 'Legendary', hp: 180, description: "A clone created by science.", weight: 1 },
    
    // Rares (Weight: 10)
    { id: 142, name: "Aerodactyl", type: 'Pokemon', subType: "Fossil", rarity: 'Rare', hp: 120, description: "Resurrected from amber.", weight: 10 },
    { id: 65, name: "Alakazam", type: 'Pokemon', subType: "Psi", rarity: 'Rare', hp: 55, description: "Brain power.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    
    // Uncommon Pokemon (Weight: 25)
    { id: 88, name: "Grimer", type: 'Pokemon', subType: "Sludge", rarity: 'Uncommon', hp: 80, description: "Bio-waste.", weight: 25 },
    { id: 93, name: "Haunter", type: 'Pokemon', subType: "Gas", rarity: 'Uncommon', hp: 45, description: "Licks you.", weight: 25 },
    { id: 64, name: "Kadabra", type: 'Pokemon', subType: "Psi", rarity: 'Uncommon', hp: 40, description: "Emit alpha waves.", weight: 25 },
    { id: 101, name: "Electrode", type: 'Pokemon', subType: "Ball", rarity: 'Uncommon', hp: 60, description: "Explodes.", weight: 25 },
    { id: 137, name: "Porygon", type: 'Pokemon', subType: "Virtual", rarity: 'Uncommon', hp: 65, description: "Man-made code.", weight: 25 },

    // Uncommon Items (Weight: 25)
    { id: 30001, name: "Exp. Candy M", type: 'Item', subType: "Consumable", rarity: 'Uncommon', description: "A medium sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stardust.png", weight: 25 },
    { id: 30002, name: "Super Potion", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Heals 60 HP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png", weight: 25 },
    { id: 30003, name: "Awakening", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Wakes up Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/awakening.png", weight: 25 },
    { id: 30004, name: "Antidote", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Cures poison.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/antidote.png", weight: 25 },
    { id: 30005, name: "Ether", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Restores 10 PP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ether.png", weight: 25 },
    { id: 30006, name: "Elixir", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Restores 10 PP to all.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/elixir.png", weight: 25 },
    { id: 30007, name: "3x Great Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Better catch rate.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png", weight: 25 },
    { id: 30008, name: "3x Safari Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Special camouflage ball.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safari-ball.png", weight: 25 },
    { id: 30009, name: "2x Level Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Effective on lower levels.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/level-ball.png", weight: 25 },

    // Common Pokemon (Weight: 15)
    { id: 109, name: "Koffing", type: 'Pokemon', subType: "Gas", rarity: 'Common', hp: 40, description: "Toxic fumes.", weight: 15 },
    { id: 81, name: "Magnemite", type: 'Pokemon', subType: "Magnet", rarity: 'Common', hp: 25, description: "Anti-gravity.", weight: 15 },
    { id: 63, name: "Abra", type: 'Pokemon', subType: "Psi", rarity: 'Common', hp: 25, description: "Sleeps 18 hours.", weight: 15 },
    { id: 41, name: "Zubat", type: 'Pokemon', subType: "Bat", rarity: 'Common', hp: 40, description: "Cave dweller.", weight: 15 },
    { id: 100, name: "Voltorb", type: 'Pokemon', subType: "Ball", rarity: 'Common', hp: 40, description: "Looks like a ball.", weight: 15 },

    // Common Items 
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

// THEME: MEW (Mythic / Rare / Ancestor)
// WAGYU A5: Only Rare, Ultra-Rare, Legendary, Mythic
const WAGYU_POOL: CardData[] = [
    // The Chase (Now weigh 1, randomly obtainable)
    { id: 151, name: "Mew", type: 'Pokemon', subType: "Originator", rarity: 'Mythical', hp: 100, description: "The ancestor of all.", weight: 1 },
    
    // Legendary Items (Weight: 3)
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },

    // Ultra-Rare Pokemon (Weight increased to 12 for higher chance)
    { id: 149, name: "Dragonite", type: 'Pokemon', subType: "Dragon", rarity: 'Ultra-Rare', hp: 150, description: "Marine guardian.", weight: 12 },
    { id: 94, name: "Gengar", type: 'Pokemon', subType: "Shadow", rarity: 'Ultra-Rare', hp: 130, description: "Hides in shadows.", weight: 12 },
    { id: 131, name: "Lapras", type: 'Pokemon', subType: "Transport", rarity: 'Ultra-Rare', hp: 190, description: "Gentle giant.", weight: 12 },
    { id: 143, name: "Snorlax", type: 'Pokemon', subType: "Sleeping", rarity: 'Ultra-Rare', hp: 200, description: "Blocks the road.", weight: 12 },
    { id: 59, name: "Arcanine", type: 'Pokemon', subType: "Legendary", rarity: 'Ultra-Rare', hp: 160, description: "Majestic flame.", weight: 12 },
    { id: 130, name: "Gyarados", type: 'Pokemon', subType: "Atrocious", rarity: 'Ultra-Rare', hp: 170, description: "Destructive rage.", weight: 12 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Ultra-Rare', hp: 140, description: "Reads minds.", weight: 12 },
    { id: 282, name: "Gardevoir", type: 'Pokemon', subType: "Embrace", rarity: 'Ultra-Rare', hp: 130, description: "Protects trainer.", weight: 12 },
    { id: 133, name: "Eevee", type: 'Pokemon', subType: "Evolution", rarity: 'Ultra-Rare', hp: 60, description: "Infinite potential.", weight: 12 },
    { id: 175, name: "Togepi", type: 'Pokemon', subType: "Spike Ball", rarity: 'Ultra-Rare', hp: 50, description: "Full of joy.", weight: 12 },

    // Ultra-Rare Items (Weight increased to 12)
    { id: 30018, name: "5x Ultra Ball", type: 'Item', subType: "Balls", rarity: 'Ultra-Rare', description: "High performance ball.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png", weight: 12 },
    { id: 30019, name: "Exp. Candy XL", type: 'Item', subType: "Consumable", rarity: 'Ultra-Rare', description: "A huge sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/comet-shard.png", weight: 12 },
    // IV Caps
    { id: 30020, name: "HP IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes HP IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hp-up.png", weight: 12 },
    { id: 30021, name: "Atk IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Attack IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protein.png", weight: 12 },
    { id: 30022, name: "Def IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Defense IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron.png", weight: 12 },
    { id: 30023, name: "Sp. Atk IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Sp. Atk IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/calcium.png", weight: 12 },
    { id: 30024, name: "Sp. Def IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Sp. Def IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zinc.png", weight: 12 },
    { id: 30025, name: "Speed IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Speed IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/carbos.png", weight: 12 },

    // Rare Items (Weight: 50)
    { id: 30011, name: "5x Silver Coin", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Valuable currency.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-silver.png", weight: 50 },
    { id: 30012, name: "2x Exp. Candy L", type: 'Item', subType: "Consumable", rarity: 'Rare', description: "A large sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png", weight: 50 },
    { id: 30013, name: "Rare Candy", type: 'Item', subType: "Consumable", rarity: 'Rare', description: "Levels up Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png", weight: 50 },
    { id: 30014, name: "Full Restore", type: 'Item', subType: "Medicine", rarity: 'Rare', description: "Fully heals HP & Status.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-restore.png", weight: 50 },
    { id: 30015, name: "Full Heal", type: 'Item', subType: "Medicine", rarity: 'Rare', description: "Cures all status.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/full-heal.png", weight: 50 },
    { id: 30016, name: "Max Ether", type: 'Item', subType: "Medicine", rarity: 'Rare', description: "Restores PP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-ether.png", weight: 50 },
    { id: 30017, name: "Max Elixir", type: 'Item', subType: "Medicine", rarity: 'Rare', description: "Restores all PP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/max-elixir.png", weight: 50 },
];

// --- CACHE ---
const clientImageCache = new Map<string, boolean>();

// --- COMPONENTS ---

const TradingCard: React.FC<{ card: CardData; className?: string }> = ({ card, className = "" }) => {
    // ... (Keep existing TradingCard implementation)
    // Rarity styles
    let borderClass = "border-gray-600";
    let glowClass = "";
    let holoEffect = "";
    let badgeColor = "bg-gray-700 text-gray-300";
    let bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]";

    if (card.rarity === 'Common') {
        borderClass = "border-stone-500";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]";
    } else if (card.rarity === 'Uncommon') {
        borderClass = "border-slate-300";
        badgeColor = "bg-slate-700 text-white";
    } else if (card.rarity === 'Rare') {
        borderClass = "border-blue-400";
        glowClass = "shadow-[0_0_15px_rgba(96,165,250,0.5)]";
        badgeColor = "bg-blue-900/80 text-blue-200 border border-blue-500/30";
        holoEffect = "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-tr after:from-transparent after:via-white/20 after:to-transparent after:opacity-50 after:pointer-events-none";
    } else if (card.rarity === 'Ultra-Rare') {
        borderClass = "border-purple-500";
        glowClass = "shadow-[0_0_20px_rgba(168,85,247,0.6)]";
        badgeColor = "bg-purple-900/80 text-purple-200 border border-purple-500/30";
        holoEffect = "foil-holo"; 
    } else if (card.rarity === 'Legendary') {
        borderClass = "border-yellow-400";
        glowClass = "shadow-[0_0_30px_rgba(250,204,21,0.8)]";
        badgeColor = "bg-yellow-900/90 text-yellow-100 border border-yellow-400/50 shadow-[0_0_10px_#eab308]";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]";
        holoEffect = "foil-holo after:bg-yellow-500/10"; 
    } else if (card.rarity === 'Mythical') {
        borderClass = "border-pink-400";
        glowClass = "shadow-[0_0_35px_rgba(244,114,182,0.9)] ring-2 ring-white/50";
        badgeColor = "bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-white/50 shadow-[0_0_15px_#ec4899]";
        bgPattern = "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]";
        holoEffect = "mythic-holo"; // Custom class for rainbow effect
    }

    const [imgSrc, setImgSrc] = useState<string>("");

    const getFormattedName = (name: string) => {
        return name.toLowerCase()
            .replace(/[.']/g, '')
            .replace(/♀/g, '-f')
            .replace(/♂/g, '-m')
            .replace(/\s+/g, '-');
    };

    useEffect(() => {
        const verifyImage = async () => {
            if (card.image) {
                setImgSrc(card.image);
                return;
            }

            const cobbleName = getFormattedName(card.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`;

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
    }, [card]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${card.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${card.id}.png`);
        } else if (imgSrc.includes('official-artwork')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${card.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(card.name)}`);
        }
    };

    return (
        <div className={`relative w-48 h-72 rounded-3xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
            {card.rarity !== 'Common' && <div className={`absolute inset-0 z-20 pointer-events-none opacity-40 mix-blend-overlay ${holoEffect}`}></div>}
            
            <div className="absolute inset-0 bg-[#1a1a1a] z-0">
                <div className={`absolute inset-0 ${bgPattern} opacity-20`}></div>
                {(card.rarity === 'Legendary' || card.rarity === 'Mythical') && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                )}
                <div className="absolute inset-0 p-4 pb-20 flex items-center justify-center z-10">
                    <img 
                        src={imgSrc} 
                        alt={card.name}
                        className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        onError={handleImageError}
                        loading="lazy"
                    />
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 z-10 pointer-events-none"></div>

            <div className="absolute bottom-0 left-0 right-0 p-3 z-30 flex flex-col items-center text-center">
                <div className={`mb-2 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest backdrop-blur-md shadow-lg ${badgeColor}`}>
                    {card.rarity}
                </div>
                <h3 className="text-white font-black text-lg leading-none mb-1 drop-shadow-md tracking-wide">
                    {card.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-mono">
                    {card.subType}
                </span>
            </div>

            <div className="absolute top-2 right-2 z-30 text-[8px] font-mono text-white/50 bg-black/50 px-1.5 rounded-md">
                #{card.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
};

const Gacha: React.FC = () => {
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    const [cutYPercentage, setCutYPercentage] = useState(15); 
    const [cutVisuals, setCutVisuals] = useState({ rotate: -30, x: -50, y: -150 });

    // Dispensing Logic
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    const [shakePack, setShakePack] = useState(false);
    
    // Auth & Packs Logic
    const [user, setUser] = useState<any>(null);
    const [packs, setPacks] = useState({ lambPacks: 0, wagyuPacks: 0 });
    const [processing, setProcessing] = useState(false);

    const svgRef = useRef<SVGSVGElement>(null);
    const packRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 150));
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    // Fetch Packs on mount/user change
    useEffect(() => {
        if (user?.id) {
            fetch(`${DISCORD_API_URL}/api/packs?discordId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) setPacks(data);
                })
                .catch(console.error);
        }
    }, [user]);

    // --- AUTO SAVE LOGIC ---
    const saveToInventory = async (cards: CardData[]) => {
        if (!user || !user.id) return;
        try {
            await fetch(`${DISCORD_API_URL}/api/inventory/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    items: cards
                })
            });
        } catch (e) {
            console.error("Auto-save failed", e);
        }
    };

    // --- HANDLERS ---

    const selectPack = async (type: PackType) => {
        if (!user || !type) return;
        
        // Optimistic check
        if ((type === 'lamb' && packs.lambPacks < 1) || (type === 'wagyu' && packs.wagyuPacks < 1)) {
            alert("You don't have enough packs! Redeem a code first.");
            return;
        }

        setProcessing(true);
        // Deduct pack immediately from server
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/packs/use`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id, type })
            });
            const data = await res.json();
            
            if (res.ok && data.success) {
                // Update local state
                if (type === 'lamb') setPacks(p => ({ ...p, lambPacks: data.remaining }));
                else setPacks(p => ({ ...p, wagyuPacks: data.remaining }));

                // Start Game
                setSelectedPack(type);
                setCurrentPool(type === 'lamb' ? LAMB_POOL : WAGYU_POOL);
                setStage('cutting');
                setIsCut(false);
                setRevealedCards([]);
                setTrail([]);
                setCutCoords(null);
                setCutYPercentage(15);
            } else {
                alert(data.error || "Failed to open pack");
            }
        } catch (e) {
            alert("Network error opening pack");
        } finally {
            setProcessing(false);
        }
    };

    // ... (Keeping all existing cutting/drag/mouse logic unchanged) ...
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) {
            setCutCoords({ start: pt, end: pt });
            setTrail([{ ...pt, id: Date.now() }]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const pt = getPoint(e);
        if (pt) {
            setTrail(prev => [...prev, { ...pt, id: Date.now() }]);
            if (cutCoords) setCutCoords(prev => prev ? { ...prev, end: pt } : null);
        }
    };

    const handleMouseUp = () => {
        if (isDragging && cutCoords) checkCut();
        setIsDragging(false);
    };

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const checkCut = () => {
        if (!cutCoords) return;
        const dx = cutCoords.end.x - cutCoords.start.x;
        const dy = cutCoords.end.y - cutCoords.start.y;
        if (Math.abs(dx) < 200) return;

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const isHorizontal = (Math.abs(angle) < 30) || (Math.abs(angle) > 150);
        if (!isHorizontal) return;

        const avgY = (cutCoords.start.y + cutCoords.end.y) / 2;
        const relativeY = avgY - 200;
        const percentage = (relativeY / 420) * 100;

        if (percentage >= 10 && percentage <= 15) {
            triggerCut(percentage);
        } else {
            setCutCoords(null);
        }
    };

    const triggerCut = (exactPercentage: number) => {
        setCutYPercentage(exactPercentage);
        const randomRotate = (Math.random() * 20) - 10;
        const randomX = (Math.random() * 60) - 30;
        const randomY = -80 - (Math.random() * 40);
        setCutVisuals({ rotate: randomRotate, x: randomX, y: randomY });
        setIsCut(true);
        setCutCoords(null);
    };

    const handlePackClick = () => {
        if (!isCut || dispensingCard) return;

        if (revealedCards.length < 5) {
            setShakePack(true);
            setTimeout(() => setShakePack(false), 300);

            let eligiblePool = [...currentPool];
            const hasIVCap = revealedCards.some(c => c.subType === 'IV Cap');
            if (hasIVCap) eligiblePool = eligiblePool.filter(c => c.subType !== 'IV Cap');
            
            const totalWeight = eligiblePool.reduce((sum, item) => sum + (item.weight || 10), 0);
            let randomNum = Math.random() * totalWeight;
            let nextCard: CardData | undefined;
            
            for (const card of eligiblePool) {
                const weight = card.weight || 10;
                if (randomNum < weight) {
                    nextCard = card;
                    break;
                }
                randomNum -= weight;
            }
            if (!nextCard) nextCard = eligiblePool[0] || currentPool[0];
            
            setTimeout(() => {
                setDispensingCard(nextCard!);
                setTimeout(() => {
                    setRevealedCards(prev => {
                        const newCards = [nextCard!, ...prev];
                        if (newCards.length === 5) {
                            saveToInventory(newCards);
                            setTimeout(() => setStage('finished'), 1500);
                        }
                        return newCards;
                    });
                    setDispensingCard(null);
                }, 800); 
            }, 100);
        }
    };

    const resetGame = () => {
        setStage('selection');
        setSelectedPack(null);
        setCurrentPool([]);
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutYPercentage(15);
        // Refresh balance incase
        if(user?.id) {
             fetch(`${DISCORD_API_URL}/api/packs?discordId=${user.id}`)
                .then(res => res.json())
                .then(data => { if (data && !data.error) setPacks(data); });
        }
    };

    return (
        <div className="min-h-screen py-4 font-sans text-white relative overflow-hidden select-none">
            {/* CSS & Backgrounds same as before */}
            <style>{`
                .foil-holo {
                    background: linear-gradient(135deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 70%);
                    background-size: 200% 200%;
                    animation: holoSheen 3s infinite linear;
                }
                .mythic-holo {
                    background: linear-gradient(115deg, transparent 20%, rgba(255,0,255,0.3) 40%, rgba(0,255,255,0.3) 60%, transparent 80%);
                    background-size: 200% 200%;
                    animation: holoSheen 2s infinite linear alternate;
                }
                @keyframes holoSheen {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 200%; }
                }
                @keyframes flyOut {
                    0% { transform: translateY(0) scale(0.1) rotateX(90deg); opacity: 0; }
                    40% { transform: translateY(-300px) scale(1) rotateX(0deg) rotateZ(5deg); opacity: 1; z-index: 50; }
                    100% { transform: translateY(1000px) scale(0.5); opacity: 0; }
                }
                .animate-fly-out {
                    animation: flyOut 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes shake {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(5deg); }
                    75% { transform: rotate(-5deg); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>

            <div className="absolute inset-0 bg-[#0f0f11] z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2a30_0%,_#0f0f11_70%)]"></div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"></div>
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>
            </div>

            <UserProfile 
                onUserChange={setUser} 
                className="!absolute top-4 right-4"
            />

            {/* HEADER: Back Button & Pack Counters */}
            <div className="relative z-20 container mx-auto px-4 pt-4 pb-2 flex flex-col items-start gap-4">
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm">
                    <span>←</span> Back to Dashboard
                </Link>

                {user && (
                    <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        {/* Lamb Counter */}
                        <div className="bg-black/60 backdrop-blur-md border border-purple-500/30 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group overflow-hidden">
                            <div className="bg-purple-500/20 p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden border border-purple-500/10">
                                <img src={MEWTWO_IMAGE} alt="Mewtwo" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest leading-tight">Lamb Chop</div>
                                <div className="text-lg font-black text-white leading-none">{packs.lambPacks}</div>
                            </div>
                        </div>
                        {/* Wagyu Counter */}
                        <div className="bg-black/60 backdrop-blur-md border border-pink-500/30 rounded-full pl-2 pr-5 py-1.5 flex items-center gap-3 shadow-xl hover:scale-105 transition-transform cursor-default group overflow-hidden">
                            <div className="bg-pink-500/20 p-1 rounded-full w-10 h-10 flex items-center justify-center overflow-hidden border border-pink-500/10">
                                <img src={MEW_IMAGE} alt="Mew" className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <div className="text-[9px] font-black text-pink-400 uppercase tracking-widest leading-tight">Wagyu A5</div>
                                <div className="text-lg font-black text-white leading-none">{packs.wagyuPacks}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[70vh]">
                
                {stage === 'selection' && (
                    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-500 mt-2">
                        <h1 className="text-4xl md:text-6xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                            GACHA <span className="text-brand-primary">PACK</span>
                        </h1>
                        <p className="text-center text-gray-400 mb-8 max-w-xl mx-auto">
                            Choose your meat! Will you get the cheap meat Mewtwo or discover the mythical meat Mew!
                        </p>

                        {/* Updated Grid with Disabled States */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-20">
                            {/* LAMB CHOP (MEWTWO) */}
                            <button 
                                onClick={() => selectPack('lamb')}
                                disabled={processing || packs.lambPacks < 1}
                                className={`
                                    group relative aspect-[3/4] rounded-[3rem] transition-all duration-500 overflow-hidden
                                    ${packs.lambPacks > 0 ? 'hover:scale-105 hover:-rotate-1 cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}
                                `}
                            >
                                <div className="absolute inset-0 bg-purple-600 blur-3xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-900 to-black rounded-[3rem] border-[6px] border-purple-500/50 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                                    
                                    <div className="absolute top-0 left-0 right-0 h-6 bg-black/40 border-b border-purple-500/30 flex items-center justify-center space-x-1">
                                        {[...Array(10)].map((_, i) => <div key={i} className="w-1 h-3 bg-purple-500/20 rounded-full"></div>)}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-black/40 border-t border-purple-500/30"></div>

                                    {/* Badge at Top */}
                                    <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                        <div className="bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-sm">
                                            Genetic Pack
                                        </div>
                                    </div>

                                    {/* Image in Center */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <img src={MEWTWO_IMAGE} alt="Mewtwo" className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    {/* Text at Bottom */}
                                    <div className="absolute bottom-12 left-0 right-0 text-center z-30">
                                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase drop-shadow-md transform -rotate-2">Lamb Chop</h2>
                                        <p className="text-purple-300 text-xs font-mono uppercase tracking-[0.2em] mt-1">Mewtwo Edition</p>
                                    </div>

                                    {packs.lambPacks === 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                                            <div className="bg-red-900/80 border border-red-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest rotate-12 shadow-2xl">
                                                Out of Stock
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>

                            {/* WAGYU (MEW) */}
                            <button 
                                onClick={() => selectPack('wagyu')}
                                disabled={processing || packs.wagyuPacks < 1}
                                className={`
                                    group relative aspect-[3/4] rounded-[3rem] transition-all duration-500 overflow-hidden
                                    ${packs.wagyuPacks > 0 ? 'hover:scale-105 hover:rotate-1 cursor-pointer' : 'opacity-50 grayscale cursor-not-allowed'}
                                `}
                            >
                                <div className="absolute inset-0 bg-pink-500 blur-3xl opacity-20 group-hover:opacity-50 transition-opacity"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-rose-400 via-pink-500 to-rose-900 rounded-[3rem] border-[6px] border-pink-300/50 shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
                                    
                                    <div className="absolute top-0 left-0 right-0 h-5 bg-white/10 border-b border-white/20"></div>
                                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-white/10 border-t border-white/20"></div>

                                    {/* Badge at Top */}
                                    <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                        <div className="bg-pink-400 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-white/20 backdrop-blur-sm">
                                            Mythic Pack
                                        </div>
                                    </div>

                                    {/* Image in Center */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <img src={MEW_IMAGE} alt="Mew" className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(244,114,182,0.5)] group-hover:scale-110 transition-transform duration-500" />
                                    </div>

                                    {/* Text at Bottom */}
                                    <div className="absolute bottom-12 left-0 right-0 text-center z-30">
                                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200 italic tracking-tighter uppercase drop-shadow-sm transform -rotate-2">Wagyu A5</h2>
                                        <p className="text-pink-100 text-xs font-mono uppercase tracking-[0.2em] mt-1 text-shadow">Mew Edition</p>
                                    </div>

                                    {packs.wagyuPacks === 0 && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                                            <div className="bg-red-900/80 border border-red-500 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-widest -rotate-12 shadow-2xl">
                                                Out of Stock
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {(stage === 'cutting' || stage === 'dispensing' || stage === 'finished') && (
                    <div className="relative w-full max-w-4xl flex flex-col items-center">
                        {/* (Keep existing Game UI) */}
                        <div className="mb-8 h-12 flex items-center justify-center w-full relative z-30">
                            {!isCut ? (
                                <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 animate-pulse">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white/90">
                                        SWIPE TOP TO OPEN ✂️
                                    </h2>
                                </div>
                            ) : stage !== 'finished' ? (
                                <div className="bg-brand-primary/20 backdrop-blur-md px-6 py-2 rounded-full border border-brand-primary/50 animate-in fade-in zoom-in duration-300">
                                    <h2 className="text-lg font-bold uppercase tracking-widest text-brand-primary">
                                        TAP PACK TO REVEAL ({5 - revealedCards.length} LEFT)
                                    </h2>
                                </div>
                            ) : (
                                <div className="bg-green-500/20 backdrop-blur-md px-6 py-2 rounded-full border border-green-500/50">
                                    <h2 className="text-xl font-black uppercase text-green-400">OPENING COMPLETE!</h2>
                                </div>
                            )}
                        </div>

                        <div className="relative h-[500px] w-full flex justify-center items-center perspective-1000">
                            <div 
                                ref={packRef}
                                className={`relative w-[300px] h-[420px] cursor-pointer ${shakePack ? 'animate-shake' : ''}`}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                                onClick={handlePackClick}
                            >
                                {!isCut && (
                                    <svg 
                                        ref={svgRef}
                                        className="absolute inset-[-200px] w-[calc(100%+400px)] h-[calc(100%+400px)] z-50 pointer-events-auto touch-none"
                                        onMouseMove={handleMouseMove}
                                        onMouseUp={handleMouseUp}
                                        onMouseLeave={handleMouseUp}
                                        onTouchMove={handleMouseMove}
                                        onTouchEnd={handleMouseUp}
                                    >
                                        <defs>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur"/>
                                                    <feMergeNode in="SourceGraphic"/>
                                                </feMerge>
                                            </filter>
                                        </defs>
                                        <polyline 
                                            points={trail.map(p => `${p.x},${p.y}`).join(' ')}
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            filter="url(#glow)"
                                            style={{ opacity: 0.8 }}
                                        />
                                    </svg>
                                )}

                                {!isCut && (
                                    <div className="absolute top-[15%] left-[-20px] right-[-20px] h-0 border-t-2 border-dashed border-white/30 z-40 pointer-events-none flex items-center justify-between px-2 opacity-50">
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2">✂️</span>
                                        <span className="text-xs bg-black/60 rounded-full w-5 h-5 flex items-center justify-center transform -translate-y-1/2 rotate-180">✂️</span>
                                    </div>
                                )}

                                {dispensingCard && (
                                    <div className="absolute inset-0 flex justify-center items-center z-30 pointer-events-none">
                                        <div className="animate-fly-out">
                                            <TradingCard card={dispensingCard} />
                                        </div>
                                    </div>
                                )}

                                {/* --- TOP HALF (CUT) --- */}
                                <div 
                                    className={`
                                        absolute inset-0 z-20 
                                        rounded-[3rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        transition-all duration-500 ease-out origin-bottom-left
                                        ${selectedPack === 'lamb' 
                                            ? 'from-indigo-900 via-purple-900 to-black border-purple-500/50' 
                                            : 'from-rose-400 via-pink-500 to-rose-900 border-pink-300/50'}
                                    `}
                                    style={{
                                        clipPath: `inset(0 0 ${100 - cutYPercentage}% 0)`,
                                        transform: isCut ? `translate(${cutVisuals.x}px, ${cutVisuals.y}px) rotate(${cutVisuals.rotate}deg)` : 'none',
                                        opacity: isCut ? 0 : 1,
                                    }}
                                >
                                    <div className={`absolute inset-0 ${selectedPack === 'lamb' ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"} opacity-20`}></div>
                                    
                                    {/* Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <img 
                                            src={selectedPack === 'lamb' ? MEWTWO_IMAGE : MEW_IMAGE} 
                                            alt="Pack Icon"
                                            className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                        />
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                        <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-sm ${selectedPack === 'lamb' ? 'bg-purple-500' : 'bg-pink-400'}`}>
                                            {selectedPack === 'lamb' ? 'Genetic Pack' : 'Mythic Pack'}
                                        </div>
                                    </div>

                                    {/* Text */}
                                    <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-30">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>
                                    <div className="absolute top-0 left-0 right-0 h-5 bg-black/20 border-b border-white/10"></div>
                                    <div className="absolute left-0 w-full h-1 bg-white/50 blur-[1px]" style={{ bottom: `${100 - cutYPercentage}%` }}></div>
                                </div>

                                {/* --- BOTTOM HALF (BODY) --- */}
                                <div 
                                    className={`
                                        absolute inset-0 z-10
                                        rounded-[3rem] overflow-hidden bg-gradient-to-b border-[6px]
                                        ${selectedPack === 'lamb' 
                                            ? 'from-indigo-900 via-purple-900 to-black border-purple-500/50' 
                                            : 'from-rose-400 via-pink-500 to-rose-900 border-pink-300/50'}
                                    `}
                                    style={{
                                        clipPath: `inset(${cutYPercentage}% 0 0 0)`
                                    }}
                                >
                                    <div className={`absolute inset-0 ${selectedPack === 'lamb' ? "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"} opacity-20`}></div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <img 
                                            src={selectedPack === 'lamb' ? MEWTWO_IMAGE : MEW_IMAGE} 
                                            alt="Pack Icon"
                                            className="w-48 h-48 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                        />
                                    </div>

                                    {/* Badge */}
                                    <div className="absolute top-12 left-0 right-0 flex justify-center z-30">
                                        <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 backdrop-blur-sm ${selectedPack === 'lamb' ? 'bg-purple-500' : 'bg-pink-400'}`}>
                                            {selectedPack === 'lamb' ? 'Genetic Pack' : 'Mythic Pack'}
                                        </div>
                                    </div>

                                    <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-30">
                                        <h2 className={`text-4xl font-black italic tracking-tighter uppercase drop-shadow-md transform -rotate-2 ${selectedPack === 'lamb' ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-white to-pink-200'}`}>
                                            {selectedPack === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'}
                                        </h2>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-5 bg-black/20 border-t border-white/10"></div>
                                    <div className="absolute left-0 w-full h-1 bg-white/30 blur-[1px]" style={{ top: `${cutYPercentage}%` }}></div>
                                    
                                    {isCut && (
                                        <div className="absolute left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" style={{ top: `${cutYPercentage}%` }}></div>
                                    )}
                                </div>

                                {/* INNER GLOW */}
                                <div className={`absolute inset-4 blur-2xl z-0 transition-opacity duration-500 ${selectedPack === 'lamb' ? 'bg-purple-500/40' : 'bg-pink-400/40'}`}
                                     style={{ 
                                         top: `${cutYPercentage}%`, 
                                         height: '20%', 
                                         opacity: isCut ? 1 : 0 
                                     }}>
                                </div>

                            </div>
                        </div>

                        <div className="w-full max-w-5xl mt-2">
                            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4 text-center">Revealed Cards</h3>
                            
                            <div className="flex flex-wrap justify-center gap-4 min-h-[320px]">
                                {revealedCards.map((card, idx) => (
                                    <div 
                                        key={idx} 
                                        className="animate-in zoom-in-50 fade-in duration-500 slide-in-from-top-10"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <TradingCard card={card} className="w-40 h-60 hover:z-50 hover:scale-110 cursor-pointer shadow-xl" />
                                    </div>
                                ))}
                                
                                {revealedCards.length === 0 && stage !== 'finished' && (
                                    <div className="w-full h-60 flex items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-white/5">
                                        <p className="text-gray-600 font-mono text-sm">Cards will appear here...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {stage === 'finished' && (
                            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col md:flex-row gap-4 mb-20 items-center">
                                <button 
                                    onClick={resetGame}
                                    className="bg-brand-primary hover:bg-red-600 text-white font-bold py-4 px-10 rounded-full shadow-lg transition-transform hover:scale-105 uppercase tracking-wider"
                                >
                                    Open Another Pack
                                </button>
                                <Link 
                                    to="/inventory"
                                    className="text-white hover:text-brand-primary underline transition-colors"
                                >
                                    View Inventory
                                </Link>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default Gacha;