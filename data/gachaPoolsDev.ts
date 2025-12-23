
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

// THEME: LEGENDARY BEASTS (Raikou / Entei / Suicune)
export const LAMB_POOL: CardData[] = [
    // The Chase - Legendary Beasts
    { id: 243, name: "Raikou", type: 'Pokemon', subType: "Thunder", rarity: 'Legendary', hp: 190, description: "The thunder Pokemon.", weight: 1, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/243.png" },
    { id: 244, name: "Entei", type: 'Pokemon', subType: "Volcano", rarity: 'Legendary', hp: 230, description: "Bark volcanoes.", weight: 3, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/244.png" },
    { id: 245, name: "Suicune", type: 'Pokemon', subType: "Aurora", rarity: 'Legendary', hp: 200, description: "Purifies water.", weight: 3, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/245.png" },

    // Rares (Weight: 10) - Themed Powerful Sinnoh/Distortion Mons
    { id: 445, name: "Garchomp", type: 'Pokemon', subType: "Mach", rarity: 'Rare', hp: 170, description: "Flies at the speed of sound.", weight: 10 },
    { id: 462, name: "Magnezone", type: 'Pokemon', subType: "Magnet Area", rarity: 'Rare', hp: 160, description: "Evolved in a special magnetic field.", weight: 10 },
    { id: 442, name: "Spiritomb", type: 'Pokemon', subType: "Forbidden", rarity: 'Rare', hp: 140, description: "Bound to a keystone for 500 years.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    
    // Uncommon Pokemon (Time/Space/Antimatter flavored - Actually Uncommon Tier)
    { id: 337, name: "Lunatone", type: 'Pokemon', subType: "Meteorite", rarity: 'Uncommon', hp: 90, description: "Came from space in a meteorite.", weight: 25 },
    { id: 338, name: "Solrock", type: 'Pokemon', subType: "Meteorite", rarity: 'Uncommon', hp: 90, description: "A new species that arrived from space.", weight: 25 },
    { id: 93, name: "Haunter", type: 'Pokemon', subType: "Gas", rarity: 'Uncommon', hp: 80, description: "Can pass through solid walls.", weight: 25 },
    { id: 178, name: "Xatu", type: 'Pokemon', subType: "Mystic", rarity: 'Uncommon', hp: 100, description: "Sees the past and future simultaneously.", weight: 25 },
    { id: 605, name: "Elgyem", type: 'Pokemon', subType: "Cerebral", rarity: 'Uncommon', hp: 80, description: "Came from far away in space.", weight: 25 },

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
    { id: 343, name: "Baltoy", type: 'Pokemon', subType: "Clay Doll", rarity: 'Common', hp: 50, description: "Spins like a top.", weight: 20 },
    { id: 774, name: "Minior", type: 'Pokemon', subType: "Meteor", rarity: 'Common', hp: 60, description: "Born from space debris.", weight: 15 },
    { id: 92, name: "Gastly", type: 'Pokemon', subType: "Gas", rarity: 'Common', hp: 45, description: "Mostly composed of gas.", weight: 15 },
    { id: 427, name: "Buneary", type: 'Pokemon', subType: "Rabbit", rarity: 'Common', hp: 50, description: "Curled ears.", weight: 15 },
    { id: 443, name: "Gible", type: 'Pokemon', subType: "Land Shark", rarity: 'Common', hp: 58, description: "Loves big bites.", weight: 15 },

    // Common Items 
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

// THEME: CELEBI (Time Travel) - Forest Guardian
export const WAGYU_POOL: CardData[] = [
    // The Chase
    { id: 251, name: "Celebi", type: 'Pokemon', subType: "Time Travel", rarity: 'Mythical', hp: 100, description: "Guardian of the forest.", weight: 1, image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/251.png" },
    
    // Legendary Items (Weight: 3)
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },

    // Ultra-Rare Pokemon (Non-Legendary/Mythical Powerful Mons - Time/Space/Antimatter)
    { id: 887, name: "Dragapult", type: 'Pokemon', subType: "Stealth", rarity: 'Ultra-Rare', hp: 150, description: "Carries Dreepy in its horns.", weight: 12 },
    { id: 376, name: "Metagross", type: 'Pokemon', subType: "Iron Leg", rarity: 'Ultra-Rare', hp: 160, description: "A supercomputer on legs.", weight: 12 },
    { id: 445, name: "Garchomp", type: 'Pokemon', subType: "Mach", rarity: 'Ultra-Rare', hp: 170, description: "Can fly as fast as a jet plane.", weight: 12 },
    { id: 637, name: "Volcarona", type: 'Pokemon', subType: "Sun", rarity: 'Ultra-Rare', hp: 140, description: "Its scales glow like the sun.", weight: 12 },
    { id: 474, name: "Porygon-Z", type: 'Pokemon', subType: "Virtual", rarity: 'Ultra-Rare', hp: 110, description: "Modified to travel between dimensions.", weight: 12 },
    { id: 462, name: "Magnezone", type: 'Pokemon', subType: "Magnet Area", rarity: 'Ultra-Rare', hp: 160, description: "Connected to space magnetic fields.", weight: 12 },
    { id: 442, name: "Spiritomb", type: 'Pokemon', subType: "Forbidden", rarity: 'Ultra-Rare', hp: 140, description: "Made of 108 spirits.", weight: 12 },
    { id: 437, name: "Bronzong", type: 'Pokemon', subType: "Bronze Bell", rarity: 'Ultra-Rare', hp: 150, description: "Masters of ancient ritual.", weight: 12 },
    { id: 970, name: "Glimmora", type: 'Pokemon', subType: "Multi-Calyx", rarity: 'Ultra-Rare', hp: 130, description: "Resembles a space-born crystal.", weight: 12 },
    { id: 561, name: "Sigilyph", type: 'Pokemon', subType: "Avianoid", rarity: 'Ultra-Rare', hp: 110, description: "Guardian of ancient space-faring cities.", weight: 12 },

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
