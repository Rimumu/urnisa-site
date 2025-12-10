
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

// THEME: MEWTWO (Genetic / Science / Lab)
export const LAMB_POOL: CardData[] = [
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
export const WAGYU_POOL: CardData[] = [
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
