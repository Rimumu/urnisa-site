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

// THEME: CREATION TRIO (Dialga / Palkia / Giratina)
export const LAMB_POOL: CardData[] = [
    // The Chase - Dialga as main focus
    { id: 483, name: "Dialga", type: 'Pokemon', subType: "Temporal", rarity: 'Legendary', hp: 220, description: "A legendary Pokemon that can control time.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766066036/dialgaSTILL_d5h5oc.png" },
    
    // Top Tier Creation Gods
    { id: 484, name: "Palkia", type: 'Pokemon', subType: "Spatial", rarity: 'Legendary', hp: 210, description: "It has the ability to distort space.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766065601/palkiaSTILL_ype3sr.png" },
    { id: 487, name: "Giratina", type: 'Pokemon', subType: "Renegade", rarity: 'Legendary', hp: 250, description: "Lives in the Distortion World.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766066274/giratinaSTILL2_f2spbc.png" },

    // Rares (Weight: 10) - Sinnoh Themed
    { id: 445, name: "Garchomp", type: 'Pokemon', subType: "Mach", rarity: 'Rare', hp: 170, description: "Flies at sonic speed.", weight: 10 },
    { id: 466, name: "Electivire", type: 'Pokemon', subType: "Thunder", rarity: 'Rare', hp: 160, description: "Powers of electricity.", weight: 10 },
    { id: 467, name: "Magmortar", type: 'Pokemon', subType: "Blast", rarity: 'Rare', hp: 160, description: "Shoots fireballs.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    
    // Uncommon Pokemon (Sinnoh Themed)
    { id: 405, name: "Luxray", type: 'Pokemon', subType: "Gleam Eyes", rarity: 'Uncommon', hp: 110, description: "Can see through walls.", weight: 25 },
    { id: 429, name: "Mismagius", type: 'Pokemon', subType: "Magical", rarity: 'Uncommon', hp: 90, description: "Mutters incantations.", weight: 25 },
    { id: 430, name: "Honchkrow", type: 'Pokemon', subType: "Big Boss", rarity: 'Uncommon', hp: 100, description: "Active at night.", weight: 25 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Uncommon', hp: 120, description: "Reads auras.", weight: 25 },
    { id: 475, name: "Gallade", type: 'Pokemon', subType: "Blade", rarity: 'Uncommon', hp: 110, description: "A master of courtesy.", weight: 25 },

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
    
    // Common Pokemon
    { id: 399, name: "Bidoof", type: 'Pokemon', subType: "Plump Mouse", rarity: 'Common', hp: 59, description: "God among mons.", weight: 20 },
    { id: 403, name: "Shinx", type: 'Pokemon', subType: "Flash", rarity: 'Common', hp: 45, description: "Glows when in danger.", weight: 15 },
    { id: 418, name: "Buizel", type: 'Pokemon', subType: "Sea Weasel", rarity: 'Common', hp: 55, description: "Inflation collar.", weight: 15 },
    { id: 427, name: "Buneary", type: 'Pokemon', subType: "Rabbit", rarity: 'Common', hp: 50, description: "Curled ears.", weight: 15 },
    { id: 443, name: "Gible", type: 'Pokemon', subType: "Land Shark", rarity: 'Common', hp: 58, description: "Loves big bites.", weight: 15 },

    // Common Items 
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

// THEME: ARCEUS (The Creator / Alpha)
export const WAGYU_POOL: CardData[] = [
    // The Chase
    { id: 493, name: "Arceus", type: 'Pokemon', subType: "Alpha", rarity: 'Mythical', hp: 300, description: "The creator of the universe.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1766065704/arceus_sjunwo.gif" },
    
    // Legendary Items (Weight: 3)
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },

    // Ultra-Rare Pokemon (Celestial/Godly Theme)
    { id: 488, name: "Cresselia", type: 'Pokemon', subType: "Lunar", rarity: 'Ultra-Rare', hp: 120, description: "Crescent moon sign.", weight: 12 },
    { id: 491, name: "Darkrai", type: 'Pokemon', subType: "Pitch-Black", rarity: 'Ultra-Rare', hp: 110, description: "Lurks in nightmares.", weight: 12 },
    { id: 492, name: "Shaymin", type: 'Pokemon', subType: "Gratitude", rarity: 'Ultra-Rare', hp: 100, description: "Blooms in fields.", weight: 12 },
    { id: 480, name: "Uxie", type: 'Pokemon', subType: "Knowledge", rarity: 'Ultra-Rare', hp: 120, description: "Giver of knowledge.", weight: 12 },
    { id: 481, name: "Mesprit", type: 'Pokemon', subType: "Emotion", rarity: 'Ultra-Rare', hp: 120, description: "Giver of emotion.", weight: 12 },
    { id: 482, name: "Azelf", type: 'Pokemon', subType: "Willpower", rarity: 'Ultra-Rare', hp: 120, description: "Giver of willpower.", weight: 12 },
    { id: 485, name: "Heatran", type: 'Pokemon', subType: "Lava Dome", rarity: 'Ultra-Rare', hp: 140, description: "Boiling blood like magma.", weight: 12 },
    { id: 486, name: "Regigigas", type: 'Pokemon', subType: "Colossal", rarity: 'Ultra-Rare', hp: 200, description: "Towed continents.", weight: 12 },
    { id: 490, name: "Manaphy", type: 'Pokemon', subType: "Seafaring", rarity: 'Ultra-Rare', hp: 100, description: "Born on the seafloor.", weight: 12 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Ultra-Rare', hp: 140, description: "Reads minds.", weight: 12 },

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
