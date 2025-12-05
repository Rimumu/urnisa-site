
import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL, DISCORD_API_URL, DISCORD_CLIENT_ID, DISCORD_REDIRECT_URI } from '../constants';
import InventoryModal from '../components/InventoryModal';

// --- ICONS ---
const DiscordLogo = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.2 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08 0-.1c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09 0 .1c-.52.31-1.08.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.48-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12z"/></svg>
);
const PowerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
);
const BackpackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 11a7 7 0 0 1-7 7m0 0a7 7 0 0 1-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 0 1-3-3V5a3 3 0 1 1 6 0v6a3 3 0 0 1-3 3z"></path></svg>
);

// --- TYPES ---
type PackType = 'lamb' | 'wagyu' | null;
type GameStage = 'selection' | 'cutting' | 'dispensing' | 'finished';

interface CardData {
    id: number;
    name: string;
    type: 'Pokemon' | 'Item';
    subType: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical';
    image?: string; 
    description?: string;
    hp?: number; 
    weight?: number; 
}

interface UserData {
    id: string;
    username: string;
    global_name?: string;
    avatar: string;
    minecraftUsername?: string | null;
}

// --- DATA POOLS ---
const LAMB_POOL: CardData[] = [
    { id: 150, name: "Mewtwo", type: 'Pokemon', subType: "Artificial", rarity: 'Legendary', hp: 180, description: "A clone created by science.", weight: 1 },
    { id: 142, name: "Aerodactyl", type: 'Pokemon', subType: "Fossil", rarity: 'Rare', hp: 120, description: "Resurrected from amber.", weight: 10 },
    { id: 65, name: "Alakazam", type: 'Pokemon', subType: "Psi", rarity: 'Rare', hp: 55, description: "Brain power.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    { id: 88, name: "Grimer", type: 'Pokemon', subType: "Sludge", rarity: 'Uncommon', hp: 80, description: "Bio-waste.", weight: 25 },
    { id: 93, name: "Haunter", type: 'Pokemon', subType: "Gas", rarity: 'Uncommon', hp: 45, description: "Licks you.", weight: 25 },
    { id: 64, name: "Kadabra", type: 'Pokemon', subType: "Psi", rarity: 'Uncommon', hp: 40, description: "Emit alpha waves.", weight: 25 },
    { id: 101, name: "Electrode", type: 'Pokemon', subType: "Ball", rarity: 'Uncommon', hp: 60, description: "Explodes.", weight: 25 },
    { id: 137, name: "Porygon", type: 'Pokemon', subType: "Virtual", rarity: 'Uncommon', hp: 65, description: "Man-made code.", weight: 25 },
    { id: 30001, name: "Exp. Candy M", type: 'Item', subType: "Consumable", rarity: 'Uncommon', description: "A medium sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stardust.png", weight: 25 },
    { id: 30002, name: "Super Potion", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Heals 60 HP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png", weight: 25 },
    { id: 30003, name: "Awakening", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Wakes up Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/awakening.png", weight: 25 },
    { id: 30004, name: "Antidote", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Cures poison.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/antidote.png", weight: 25 },
    { id: 30005, name: "Ether", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Restores 10 PP.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ether.png", weight: 25 },
    { id: 30006, name: "Elixir", type: 'Item', subType: "Medicine", rarity: 'Uncommon', description: "Restores 10 PP to all.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/elixir.png", weight: 25 },
    { id: 30007, name: "3x Great Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Better catch rate.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png", weight: 25 },
    { id: 30008, name: "3x Safari Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Special camouflage ball.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/safari-ball.png", weight: 25 },
    { id: 30009, name: "2x Level Ball", type: 'Item', subType: "Balls", rarity: 'Uncommon', description: "Effective on lower levels.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/level-ball.png", weight: 25 },
    { id: 109, name: "Koffing", type: 'Pokemon', subType: "Gas", rarity: 'Common', hp: 40, description: "Toxic fumes.", weight: 15 },
    { id: 81, name: "Magnemite", type: 'Pokemon', subType: "Magnet", rarity: 'Common', hp: 25, description: "Anti-gravity.", weight: 15 },
    { id: 63, name: "Abra", type: 'Pokemon', subType: "Psi", rarity: 'Common', hp: 25, description: "Sleeps 18 hours.", weight: 15 },
    { id: 41, name: "Zubat", type: 'Pokemon', subType: "Bat", rarity: 'Common', hp: 40, description: "Cave dweller.", weight: 15 },
    { id: 100, name: "Voltorb", type: 'Pokemon', subType: "Ball", rarity: 'Common', hp: 40, description: "Looks like a ball.", weight: 15 },
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

const WAGYU_POOL: CardData[] = [
    { id: 151, name: "Mew", type: 'Pokemon', subType: "Originator", rarity: 'Mythical', hp: 100, description: "The ancestor of all.", weight: 1 },
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },
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
    { id: 30018, name: "5x Ultra Ball", type: 'Item', subType: "Balls", rarity: 'Ultra-Rare', description: "High performance ball.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png", weight: 12 },
    { id: 30019, name: "Exp. Candy XL", type: 'Item', subType: "Consumable", rarity: 'Ultra-Rare', description: "A huge sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/comet-shard.png", weight: 12 },
    { id: 30020, name: "HP IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes HP IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hp-up.png", weight: 12 },
    { id: 30021, name: "Atk IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Attack IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protein.png", weight: 12 },
    { id: 30022, name: "Def IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Defense IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/iron.png", weight: 12 },
    { id: 30023, name: "Sp. Atk IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Sp. Atk IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/calcium.png", weight: 12 },
    { id: 30024, name: "Sp. Def IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Sp. Def IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/zinc.png", weight: 12 },
    { id: 30025, name: "Speed IV Cap", type: 'Item', subType: "IV Cap", rarity: 'Ultra-Rare', description: "Maxes Speed IV.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/carbos.png", weight: 12 },
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
        holoEffect = "mythic-holo";
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
        <div className={`relative w-48 h-72 rounded-xl bg-black transition-all duration-500 select-none border-[4px] ${borderClass} ${glowClass} ${className} group overflow-hidden`}>
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
            <div className="absolute top-2 right-2 z-30 text-[8px] font-mono text-white/50 bg-black/50 px-1.5 rounded">
                #{card.id.toString().padStart(3, '0')}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

const Gacha: React.FC = () => {
    // Auth State
    const [user, setUser] = useState<UserData | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showInventory, setShowInventory] = useState(false);
    const [searchParams] = useSearchParams();

    // Game State
    const [stage, setStage] = useState<GameStage>('selection');
    const [selectedPack, setSelectedPack] = useState<PackType>(null);
    const [currentPool, setCurrentPool] = useState<CardData[]>([]);
    
    // Cutting Logic
    const [isCut, setIsCut] = useState(false);
    const [cutCoords, setCutCoords] = useState<{ start: {x:number, y:number}, end: {x:number, y:number} } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [trail, setTrail] = useState<{x: number, y: number, id: number}[]>([]);
    
    // Dispensing Logic
    const [revealedCards, setRevealedCards] = useState<CardData[]>([]);
    const [dispensingCard, setDispensingCard] = useState<CardData | null>(null);
    const [shakePack, setShakePack] = useState(false);
    
    const svgRef = useRef<SVGSVGElement>(null);

    // --- AUTH EFFECTS ---
    useEffect(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) setUser(JSON.parse(stored));
    }, []);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code && !user) {
            const handleDiscordLogin = async () => {
                try {
                    const response = await fetch(`${DISCORD_API_URL}/api/auth/discord`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code, redirectUri: window.location.origin + '/minecraft/gacha' })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUser(data);
                        localStorage.setItem('urnisa_mc_user', JSON.stringify(data));
                        window.history.replaceState({}, document.title, "/minecraft/gacha");
                    }
                } catch (e) {}
            };
            handleDiscordLogin();
        }
    }, [searchParams]);

    const loginRedirect = () => {
        const uri = DISCORD_REDIRECT_URI; 
        const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(uri)}&response_type=code&scope=identify`;
        window.location.href = url;
    };

    const logout = () => {
        localStorage.removeItem('urnisa_mc_user');
        setUser(null);
        setMenuOpen(false);
    };

    // --- EFFECT: TRAIL FADING ---
    useEffect(() => {
        if (trail.length === 0) return;
        const interval = setInterval(() => {
            setTrail(prev => prev.filter(p => Date.now() - p.id < 150)); 
        }, 16);
        return () => clearInterval(interval);
    }, [trail]);

    // --- HANDLERS ---

    const selectPack = (type: PackType) => {
        if (!user) {
            alert("Please login with Discord (top right) to open packs!");
            return;
        }
        setSelectedPack(type);
        setCurrentPool(type === 'lamb' ? LAMB_POOL : WAGYU_POOL);
        setStage('cutting');
        setIsCut(false);
        setRevealedCards([]);
        setTrail([]);
        setCutCoords(null);
    };

    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return null;
        const rect = svgRef.current.getBoundingClientRect();
        let clientX = 0, clientY = 0;
        
        if ('touches' in e && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if ('changedTouches' in e && e.changedTouches.length > 0) {
             clientX = e.changedTouches[0].clientX;
             clientY = e.changedTouches[0].clientY;
        } else if ('clientX' in e) {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        } else {
            return null;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (isCut) return;
        setIsDragging(true);
        const pt = getPoint(e);
        if (pt) { setCutCoords({ start: pt, end: pt }); setTrail([{ ...pt, id: Date.now() }]); }
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging) return;
        const pt = getPoint(e);
        if (pt) {
            setTrail(prev => [...prev, { ...pt, id: Date.now() }]);
            if (cutCoords) setCutCoords(prev => prev ? { ...prev, end: pt } : null);
        }
    };

    const checkCut = () => {
        if (!cutCoords) return;
        const dx = cutCoords.end.x - cutCoords.start.x;
        const dy = cutCoords.end.y - cutCoords.start.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length > 100) {
            triggerCut();
        } else {
            setCutCoords(null);
            setTrail([]);
        }
    };

    const handleMouseUp = () => { 
        if (isDragging) checkCut(); 
        setIsDragging(false); 
    };

    const triggerCut = () => {
        setIsCut(true);
        setTimeout(() => {
            setStage('dispensing');
            runDispenseSequence();
        }, 800);
    };

    const runDispenseSequence = async () => {
        if (!currentPool.length) return;

        const picked: CardData[] = [];
        const totalWeight = currentPool.reduce((sum, item) => sum + (item.weight || 0), 0);
        
        for(let i=0; i<5; i++) {
            let r = Math.random() * totalWeight;
            for(const card of currentPool) {
                r -= (card.weight || 0);
                if (r < 0) {
                    picked.push(card);
                    break;
                }
            }
            if (picked.length <= i) picked.push(currentPool[0]); 
        }

        // SAVE TO DB
        if (user) {
            fetch(`${API_BASE_URL}/api/gacha/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id, cards: picked })
            }).catch(console.error);
        }

        for (const card of picked) {
            setShakePack(true);
            await new Promise(r => setTimeout(r, 600));
            setShakePack(false);
            setDispensingCard(card);
            await new Promise(r => setTimeout(r, 1200)); 
            setRevealedCards(prev => [...prev, card]);
            setDispensingCard(null);
        }
        
        setStage('finished');
    };

    return (
        <div className="min-h-screen py-8 font-sans text-white relative flex flex-col items-center">
            {/* User Bar */}
            <div className="absolute top-0 right-0 p-4 z-50 flex justify-end w-full">
                {user ? (
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3 bg-black/60 border border-white/10 px-4 py-2 rounded-full">
                            <span className="font-bold text-sm">{user.username}</span>
                            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#1e1f22] rounded-xl shadow-xl border border-white/10 overflow-hidden z-50">
                                <button onClick={() => { setShowInventory(true); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex gap-2">
                                    <BackpackIcon /> Inventory
                                </button>
                                <button onClick={logout} className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 flex gap-2 border-t border-white/5">
                                    <PowerIcon /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={loginRedirect} className="flex items-center gap-2 bg-[#5865F2] px-6 py-2 rounded-full font-bold shadow-lg">
                        <DiscordLogo /> Login
                    </button>
                )}
            </div>

            {showInventory && user && <InventoryModal discordId={user.id} onClose={() => setShowInventory(false)} />}

            {/* Stage: Selection */}
            {stage === 'selection' && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-in fade-in zoom-in duration-500">
                    <h1 className="text-4xl font-black text-white drop-shadow-lg">Select A Pack</h1>
                    <div className="flex flex-wrap justify-center gap-12">
                        <button onClick={() => selectPack('lamb')} className="group relative w-64 h-96 bg-gradient-to-b from-[#2a0f13] to-black rounded-xl border border-white/10 shadow-2xl transition-transform hover:scale-105">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className="text-6xl mb-4">🍖</div>
                                <h2 className="text-2xl font-black text-white mb-2">LAMB CHOPS</h2>
                                <p className="text-gray-400 text-sm">Common items and essential materials.</p>
                            </div>
                        </button>
                        <button onClick={() => selectPack('wagyu')} className="group relative w-64 h-96 bg-gradient-to-b from-[#3a1017] to-black rounded-xl border-2 border-brand-accent/50 shadow-2xl transition-transform hover:scale-105 shadow-[0_0_30px_rgba(247,197,72,0.1)]">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                                <div className="text-6xl mb-4">🥩</div>
                                <h2 className="text-2xl font-black text-brand-accent mb-2">WAGYU A5</h2>
                                <p className="text-brand-accent/70 text-sm">Premium rare cards and legendary drops.</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Stage: Cutting */}
            {stage === 'cutting' && (
                <div className="flex flex-col items-center justify-center min-h-[80vh] relative w-full overflow-hidden">
                    <h2 className="text-2xl font-bold mb-8 animate-pulse text-gray-300">Slice the Pack to Open!</h2>
                    
                    <div className="relative w-72 h-96 select-none cursor-crosshair touch-none"
                         onMouseDown={handleMouseDown}
                         onMouseMove={handleMouseMove}
                         onMouseUp={handleMouseUp}
                         onTouchStart={handleMouseDown}
                         onTouchMove={handleMouseMove}
                         onTouchEnd={handleMouseUp}
                    >
                        {/* Pack Top (Falls off) */}
                        <div 
                            className={`absolute top-0 left-0 w-full h-[15%] bg-gradient-to-b ${selectedPack === 'wagyu' ? 'from-brand-accent/80 to-brand-accent/60' : 'from-gray-700 to-gray-600'} rounded-t-xl z-20 transition-all duration-700 ease-in`}
                            style={isCut ? { transform: `translate(-50px, 100px) rotate(-20deg)`, opacity: 0 } : {}}
                        >
                            <div className="absolute bottom-0 w-full h-1 bg-black/20"></div>
                        </div>

                        {/* Pack Body */}
                        <div className={`absolute top-[15%] left-0 w-full h-[85%] rounded-b-xl shadow-2xl p-6 flex flex-col items-center justify-center text-center border-x-2 border-b-2 border-white/10 ${selectedPack === 'wagyu' ? 'bg-gradient-to-b from-[#3a1017] to-black' : 'bg-gradient-to-b from-[#2a0f13] to-black'}`}>
                            <div className="text-6xl mb-4">{selectedPack === 'wagyu' ? '🥩' : '🍖'}</div>
                            <h2 className={`text-3xl font-black ${selectedPack === 'wagyu' ? 'text-brand-accent' : 'text-white'}`}>{selectedPack === 'wagyu' ? 'WAGYU A5' : 'LAMB CHOPS'}</h2>
                        </div>

                        {/* SVG Overlay for drawing the cut line */}
                        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-30">
                            {trail.length > 1 && (
                                <polyline 
                                    points={trail.map(p => `${p.x},${p.y}`).join(' ')} 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    className="drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                />
                            )}
                        </svg>
                    </div>
                </div>
            )}

            {/* Stage: Dispensing & Finished */}
            {(stage === 'dispensing' || stage === 'finished') && (
                <div className="flex flex-col items-center w-full min-h-[80vh] pt-10">
                    {/* Pack Shaking Animation */}
                    {stage === 'dispensing' && (
                        <div className={`relative w-48 h-64 mb-12 ${shakePack ? 'animate-bounce' : ''}`}>
                             <div className={`w-full h-full rounded-xl shadow-2xl flex items-center justify-center text-4xl border-2 border-white/20 ${selectedPack === 'wagyu' ? 'bg-[#3a1017]' : 'bg-[#2a0f13]'}`}>
                                {selectedPack === 'wagyu' ? '🥩' : '🍖'}
                             </div>
                             {dispensingCard && (
                                <div className="absolute top-0 left-0 w-full h-full animate-ping opacity-50 bg-white rounded-xl"></div>
                             )}
                        </div>
                    )}

                    {/* Flying Card Overlay */}
                    {dispensingCard && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                            <TradingCard card={dispensingCard} className="scale-150 shadow-2xl" />
                        </div>
                    )}

                    {/* Revealed Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-4">
                        {revealedCards.map((card, idx) => (
                            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                <TradingCard card={card} />
                            </div>
                        ))}
                    </div>

                    {stage === 'finished' && (
                        <div className="mt-12 flex gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <button onClick={() => setStage('selection')} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                                Open Another
                            </button>
                            <button onClick={() => setShowInventory(true)} className="px-8 py-3 bg-brand-primary hover:bg-red-600 rounded-xl font-bold transition-all shadow-lg">
                                View Inventory
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Gacha;
