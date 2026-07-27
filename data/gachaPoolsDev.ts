
import baseSetPackImg from '../src/assets/images/base_set_pack_1784874099886.jpg';
import mew151PackImg from '../src/assets/images/mew_151_pack_1784874131820.jpg';

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
    // --- TCG Packs ---
    { id: 40001, name: "1999 Base Set TCG Pack", type: 'Item', subType: "TCG", rarity: 'Legendary', description: "A classic TCG booster pack.", image: baseSetPackImg, weight: 1 },

    // --- Loot Balls (Cobbleloots) ---
    { id: 40010, name: "Common Loot Ball", type: 'Item', subType: "Loot", rarity: 'Common', description: "Contains common items.", image: "https://wiki.cobblemon.com/images/3/38/Poke_Ball_%28model%29.png", weight: 80 },
    { id: 40011, name: "Uncommon Loot Ball", type: 'Item', subType: "Loot", rarity: 'Uncommon', description: "Contains uncommon items.", image: "https://wiki.cobblemon.com/images/8/80/Great_Ball_%28model%29.png", weight: 40 },

    // --- Hat Bags (SimpleHats) ---
    { id: 40020, name: "Common Hat Bag", type: 'Item', subType: "Cosmetic", rarity: 'Common', description: "A bag containing a common hat.", image: "https://i.imgur.com/HeL0C7Q.png", weight: 80 },
    { id: 40021, name: "Uncommon Hat Bag", type: 'Item', subType: "Cosmetic", rarity: 'Uncommon', description: "A bag containing an uncommon hat.", image: "https://i.imgur.com/Enf4SbD.png", weight: 40 },

    // --- Relic Coins ---
    { id: 40030, name: "5x Relic Coins", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Ancient coins.", image: "https://i.imgur.com/hLqtnpg.png", weight: 60 },
    { id: 40031, name: "10x Relic Coins", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Ancient coins.", image: "https://i.imgur.com/hLqtnpg.png", weight: 25 },
    { id: 40032, name: "25x Relic Coins", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Ancient coins.", image: "https://i.imgur.com/hLqtnpg.png", weight: 5 },

    // --- Cobbledollars ---
    { id: 40040, name: "$50 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Uncommon', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 60 },
    { id: 40041, name: "$100 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Uncommon', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 25 },
    { id: 40042, name: "$200 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Uncommon', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 5 },
];

// THEME: CELEBI (Time Travel) - Forest Guardian
export const WAGYU_POOL: CardData[] = [
    // --- TCG Packs & Cards ---
    { id: 40050, name: "2023 Scarlet & Violet-Mew 151 TCG Pack", type: 'Item', subType: "TCG", rarity: 'Legendary', description: "A premium TCG booster pack.", image: mew151PackImg, weight: 15 },
    { id: 40051, name: "Mew EX TCG Card", type: 'Item', subType: "TCG", rarity: 'Mythical', description: "A highly sought after TCG card.", image: "https://i.imgur.com/6ZZFyIJ.png", weight: 1 },

    // --- Loot Balls (Cobbleloots) ---
    { id: 40060, name: "Rare Loot Ball", type: 'Item', subType: "Loot", rarity: 'Rare', description: "Contains rare items.", image: "https://wiki.cobblemon.com/images/d/d5/Ultra_Ball_%28model%29.png", weight: 60 },
    { id: 40061, name: "Ultra Rare Loot Ball", type: 'Item', subType: "Loot", rarity: 'Ultra-Rare', description: "Contains ultra rare items.", image: "https://wiki.cobblemon.com/images/2/28/Master_Ball_%28model%29.png", weight: 30 },

    // --- Hat Bags (SimpleHats) ---
    { id: 40070, name: "Rare Hat Bag", type: 'Item', subType: "Cosmetic", rarity: 'Rare', description: "A bag containing a rare hat.", image: "https://i.imgur.com/a0Kw1g9.png", weight: 60 },
    { id: 40071, name: "Epic Hat Bag", type: 'Item', subType: "Cosmetic", rarity: 'Ultra-Rare', description: "A bag containing an epic hat.", image: "https://i.imgur.com/2rzEq8W.png", weight: 30 },
    { id: 40072, name: "Summer Hat Bag", type: 'Item', subType: "Cosmetic", rarity: 'Legendary', description: "A special seasonal hat bag.", image: "https://i.imgur.com/APy6HPt.png", weight: 10 },

    // --- Koban Coins ---
    { id: 40080, name: "1x Koban Coins", type: 'Item', subType: "Currency", rarity: 'Ultra-Rare', description: "Valuable currency.", image: "https://i.imgur.com/lBmCKpZ.png", weight: 60 },
    { id: 40081, name: "3x Koban Coins", type: 'Item', subType: "Currency", rarity: 'Ultra-Rare', description: "Valuable currency.", image: "https://i.imgur.com/lBmCKpZ.png", weight: 30 },
    { id: 40082, name: "5x Koban Coins", type: 'Item', subType: "Currency", rarity: 'Ultra-Rare', description: "Valuable currency.", image: "https://i.imgur.com/lBmCKpZ.png", weight: 10 },

    // --- Cobbledollars ---
    { id: 40090, name: "$300 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 60 },
    { id: 40091, name: "$500 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 30 },
    { id: 40092, name: "$1000 Cobbledollars", type: 'Item', subType: "Currency", rarity: 'Rare', description: "Modern currency.", image: "https://i.imgur.com/ks8jKNv.png", weight: 10 },
];
