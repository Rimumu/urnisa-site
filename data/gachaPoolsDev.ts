
export interface CardData {
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

// THEME: LEGENDARY BEASTS (Suicune / Entei / Raikou)
export const LAMB_POOL: CardData[] = [
    // The Chase - Suicune (Weight 1)
    { id: 245, name: "Suicune", type: 'Pokemon', subType: "Aurora", rarity: 'Legendary', hp: 200, description: "Purifies water.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766470677/suicuneSTILL_fwjdny.png" },
    
    // The Support - Entei & Raikou (Weight 3)
    { id: 244, name: "Entei", type: 'Pokemon', subType: "Volcano", rarity: 'Legendary', hp: 230, description: "Bark volcanoes.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766470672/enteiSTILL_zkhf6u.png" },
    { id: 243, name: "Raikou", type: 'Pokemon', subType: "Thunder", rarity: 'Legendary', hp: 190, description: "The thunder Pokemon.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766470673/raikouSTILL_qjadcr.png" },

    // Rares (Weight: 10) - Powerful Johto/Beast Themed Mons
    { id: 181, name: "Ampharos", type: 'Pokemon', subType: "Light", rarity: 'Rare', hp: 160, description: "The light beacon.", weight: 10 },
    { id: 229, name: "Houndoom", type: 'Pokemon', subType: "Dark Fire", rarity: 'Rare', hp: 150, description: "Eerie howls.", weight: 10 },
    { id: 473, name: "Mamoswine", type: 'Pokemon', subType: "Twin Tusk", rarity: 'Rare', hp: 180, description: "Ancient power.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    
    // Uncommon Pokemon (Johto/Nature Themed)
    { id: 234, name: "Stantler", type: 'Pokemon', subType: "Big Horn", rarity: 'Uncommon', hp: 100, description: "Hypnotic antlers.", weight: 25 },
    { id: 203, name: "Girafarig", type: 'Pokemon', subType: "Long Neck", rarity: 'Uncommon', hp: 100, description: "Tail has a brain.", weight: 25 },
    { id: 241, name: "Miltank", type: 'Pokemon', subType: "Milk Cow", rarity: 'Uncommon', hp: 120, description: "Produces milk.", weight: 25 },
    { id: 232, name: "Donphan", type: 'Pokemon', subType: "Armor", rarity: 'Uncommon', hp: 130, description: "Rough skin.", weight: 25 },
    { id: 171, name: "Lanturn", type: 'Pokemon', subType: "Light", rarity: 'Uncommon', hp: 110, description: "Deep sea light.", weight: 25 },

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
    
    // Common Pokemon (Pre-evolutions of the above)
    { id: 179, name: "Mareep", type: 'Pokemon', subType: "Wool", rarity: 'Common', hp: 50, description: "Static wool.", weight: 20 },
    { id: 228, name: "Houndour", type: 'Pokemon', subType: "Dark", rarity: 'Common', hp: 50, description: "Pack hunter.", weight: 15 },
    { id: 220, name: "Swinub", type: 'Pokemon', subType: "Pig", rarity: 'Common', hp: 50, description: "Smells mushrooms.", weight: 15 },
    { id: 231, name: "Phanpy", type: 'Pokemon', subType: "Long Nose", rarity: 'Common', hp: 60, description: "Playful.", weight: 15 },
    { id: 216, name: "Teddiursa", type: 'Pokemon', subType: "Little Bear", rarity: 'Common', hp: 60, description: "Licks honey.", weight: 15 },

    // Common Items 
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

// THEME: CELEBI (Time Travel) - Forest Guardian
export const WAGYU_POOL: CardData[] = [
    // The Chase
    { id: 251, name: "Celebi", type: 'Pokemon', subType: "Time Travel", rarity: 'Mythical', hp: 100, description: "Guardian of the forest.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766470674/celebiSTILL_yylm7p.png" },
    
    // Legendary Items (Weight: 3)
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },

    // Ultra-Rare Pokemon (Forest Guardians / Ancient / Powerful)
    { id: 248, name: "Tyranitar", type: 'Pokemon', subType: "Armor", rarity: 'Ultra-Rare', hp: 180, description: "Johto Pseudo-Legendary.", weight: 12 },
    { id: 149, name: "Dragonite", type: 'Pokemon', subType: "Dragon", rarity: 'Ultra-Rare', hp: 170, description: "Guardian of the sea.", weight: 12 },
    { id: 212, name: "Scizor", type: 'Pokemon', subType: "Pincer", rarity: 'Ultra-Rare', hp: 140, description: "Steel forest warrior.", weight: 12 },
    { id: 214, name: "Heracross", type: 'Pokemon', subType: "Single Horn", rarity: 'Ultra-Rare', hp: 130, description: "Forest fighter.", weight: 12 },
    { id: 901, name: "Ursaluna", type: 'Pokemon', subType: "Peat", rarity: 'Ultra-Rare', hp: 180, description: "Ancient forest bear.", weight: 12 },
    { id: 900, name: "Kleavor", type: 'Pokemon', subType: "Axe", rarity: 'Ultra-Rare', hp: 140, description: "Ancient forest cutter.", weight: 12 },
    { id: 899, name: "Wyrdeer", type: 'Pokemon', subType: "Big Horn", rarity: 'Ultra-Rare', hp: 150, description: "Ancient forest guide.", weight: 12 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Ultra-Rare', hp: 120, description: "Aura guardian.", weight: 12 },
    { id: 571, name: "Zoroark", type: 'Pokemon', subType: "Illusion", rarity: 'Ultra-Rare', hp: 120, description: "Forest illusionist.", weight: 12 },
    { id: 637, name: "Volcarona", type: 'Pokemon', subType: "Sun", rarity: 'Ultra-Rare', hp: 140, description: "Forest sun deity.", weight: 12 },

    // Ultra-Rare Items
    { id: 30018, name: "5x Ultra Ball", type: 'Item', subType: "Balls", rarity: 'Ultra-Rare', description: "High performance ball.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png", weight: 12 },
    { id: 30019, name: "Exp. Candy XL", type: 'Item', subType: "Consumable", rarity: 'Ultra-Rare', description: "A huge sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/comet-shard.png", weight: 12 },
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
