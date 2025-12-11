
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

// THEME: WEATHER TRIO (Rayquaza / Kyogre / Groudon)
// Replaces previous Mewtwo pool for Dev testing
export const LAMB_POOL: CardData[] = [
    // The Chase
    { id: 384, name: "Rayquaza", type: 'Pokemon', subType: "Sky High", rarity: 'Legendary', hp: 210, description: "Masters the weather.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1765409570/rayquazaSTILL_dp2prw.png" },
    
    // Top Tier Weather Gods
    { id: 382, name: "Kyogre", type: 'Pokemon', subType: "Sea Basin", rarity: 'Legendary', hp: 200, description: "Expands the oceans.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1765409663/kyogreSTILL_ygpasz.png" },
    { id: 383, name: "Groudon", type: 'Pokemon', subType: "Continent", rarity: 'Legendary', hp: 200, description: "Expands the land.", weight: 3, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1765409624/groudonSTILL_n9gwqt.png" },

    // Rares (Weight: 10)
    { id: 373, name: "Salamence", type: 'Pokemon', subType: "Dragon", rarity: 'Rare', hp: 170, description: "Dreams of flying.", weight: 10 },
    { id: 376, name: "Metagross", type: 'Pokemon', subType: "Iron Leg", rarity: 'Rare', hp: 160, description: "Four brains.", weight: 10 },
    { id: 350, name: "Milotic", type: 'Pokemon', subType: "Tender", rarity: 'Rare', hp: 150, description: "Most beautiful Pokemon.", weight: 10 },
    { id: 30010, name: "2x Quick Ball", type: 'Item', subType: "Balls", rarity: 'Rare', description: "Catches fast.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/quick-ball.png", weight: 10 },
    
    // Uncommon Pokemon (Weather/Hoenn Themed)
    { id: 351, name: "Castform", type: 'Pokemon', subType: "Weather", rarity: 'Uncommon', hp: 70, description: "Changes with weather.", weight: 25 },
    { id: 338, name: "Solrock", type: 'Pokemon', subType: "Meteorite", rarity: 'Uncommon', hp: 90, description: "Solar power.", weight: 25 },
    { id: 337, name: "Lunatone", type: 'Pokemon', subType: "Meteorite", rarity: 'Uncommon', hp: 90, description: "Moon power.", weight: 25 },
    { id: 344, name: "Claydol", type: 'Pokemon', subType: "Clay Doll", rarity: 'Uncommon', hp: 60, description: "Ancient beams.", weight: 25 },
    { id: 359, name: "Absol", type: 'Pokemon', subType: "Disaster", rarity: 'Uncommon', hp: 65, description: "Senses danger.", weight: 25 },

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
    { id: 278, name: "Wingull", type: 'Pokemon', subType: "Seagull", rarity: 'Common', hp: 40, description: "Rides the winds.", weight: 15 },
    { id: 320, name: "Wailmer", type: 'Pokemon', subType: "Ball Whale", rarity: 'Common', hp: 130, description: "Bounces like a ball.", weight: 15 },
    { id: 339, name: "Barboach", type: 'Pokemon', subType: "Whiskers", rarity: 'Common', hp: 50, description: "Slime coated.", weight: 15 },
    { id: 304, name: "Aron", type: 'Pokemon', subType: "Iron Armor", rarity: 'Common', hp: 50, description: "Eats iron ore.", weight: 15 },
    { id: 293, name: "Whismur", type: 'Pokemon', subType: "Whisper", rarity: 'Common', hp: 64, description: "Usually quiet.", weight: 15 },

    // Common Items 
    { id: 20001, name: "5x Bronze Coin", type: 'Item', subType: "Currency", rarity: 'Common', description: "Used for trading.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png", weight: 65 },
    { id: 20002, name: "5x Exp. Candy XS", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A small sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tiny-mushroom.png", weight: 30 },
    { id: 20003, name: "2x Exp. Candy S", type: 'Item', subType: "Consumable", rarity: 'Common', description: "A sweet treat.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-mushroom.png", weight: 30 },
    { id: 20004, name: "5x Pokeball", type: 'Item', subType: "Balls", rarity: 'Common', description: "Catches wild Pokemon.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", weight: 30 },
];

// THEME: JIRACHI (Wishmaker / Stars / Space)
// Replaces previous Mew pool for Dev testing
export const WAGYU_POOL: CardData[] = [
    // The Chase
    { id: 385, name: "Jirachi", type: 'Pokemon', subType: "Wish", rarity: 'Mythical', hp: 100, description: "Grants wishes when it wakes.", weight: 1, image: "https://res.cloudinary.com/dsencimjn/image/upload/v1765409704/jirachiSTILL_ex5vkd.png" },
    
    // Legendary Items (Weight: 3)
    { id: 30030, name: "Gold Coin", type: 'Item', subType: "Currency", rarity: 'Legendary', description: "A fortune.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png", weight: 3 },
    { id: 30031, name: "Shiny Upgrade", type: 'Item', subType: "Special", rarity: 'Legendary', description: "Makes a Pokemon shiny.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/shiny-charm.png", weight: 3 },
    { id: 30032, name: "Master Ball", type: 'Item', subType: "Balls", rarity: 'Legendary', description: "Catches without fail.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png", weight: 3 },
    { id: 30033, name: "1 TM Choice", type: 'Item', subType: "Technical Machine", rarity: 'Legendary', description: "Teach a move.", image: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png", weight: 3 },

    // Ultra-Rare Pokemon (Stars/Space/Psychic Theme)
    // Kept Requested: Cresselia, Clefable, Starmie, Gardevoir, Lucario
    // Replaced: Regigigas, Metagross, Bronzong, Rotom, Magnezone -> Minior, Beheeyem, Gothitelle, Musharna, Togekiss
    { id: 488, name: "Cresselia", type: 'Pokemon', subType: "Lunar", rarity: 'Ultra-Rare', hp: 120, description: "Representation of the crescent moon.", weight: 12 },
    { id: 36, name: "Clefable", type: 'Pokemon', subType: "Fairy", rarity: 'Ultra-Rare', hp: 95, description: "From the moon.", weight: 12 },
    { id: 121, name: "Starmie", type: 'Pokemon', subType: "Mysterious", rarity: 'Ultra-Rare', hp: 60, description: "Core glows with 7 colors.", weight: 12 },
    { id: 282, name: "Gardevoir", type: 'Pokemon', subType: "Embrace", rarity: 'Ultra-Rare', hp: 130, description: "Protects trainer.", weight: 12 },
    { id: 448, name: "Lucario", type: 'Pokemon', subType: "Aura", rarity: 'Ultra-Rare', hp: 140, description: "Reads minds.", weight: 12 },
    
    // New Replacements
    { id: 774, name: "Minior", type: 'Pokemon', subType: "Meteor", rarity: 'Ultra-Rare', hp: 60, description: "Born from mutated nanoparticles.", weight: 12 },
    { id: 606, name: "Beheeyem", type: 'Pokemon', subType: "Cerebral", rarity: 'Ultra-Rare', hp: 75, description: "Controls memories.", weight: 12 },
    { id: 576, name: "Gothitelle", type: 'Pokemon', subType: "Astral Body", rarity: 'Ultra-Rare', hp: 70, description: "Predicts future from stars.", weight: 12 },
    { id: 518, name: "Musharna", type: 'Pokemon', subType: "Drowsing", rarity: 'Ultra-Rare', hp: 116, description: "Mist of dreams.", weight: 12 },
    { id: 468, name: "Togekiss", type: 'Pokemon', subType: "Jubilee", rarity: 'Ultra-Rare', hp: 85, description: "Shares blessings.", weight: 12 },

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
