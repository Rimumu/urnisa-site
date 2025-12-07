
import { RAW_SPAWN_DATA } from './rawSpawnData';

// Helper to format technical names into readable text
// e.g. "minecraft:deep_cold_ocean" -> "Deep Cold Ocean"
// e.g. "myths_and_legends:blue_orb" -> "Blue Orb"
const formatName = (str: string): string => {
    if (!str) return "";
    
    // Remove namespace prefixes (minecraft:, mod_name:, #tag:)
    let clean = str.replace(/^.*:/, '');
    
    // Remove hash if it was a tag but didn't have a colon
    if (clean.startsWith('#')) clean = clean.substring(1);

    // Remove 'is_' prefix common in tags (e.g. is_ocean -> ocean)
    if (clean.startsWith('is_')) clean = clean.substring(3);

    // Replace underscores with spaces
    clean = clean.replace(/_/g, ' ');

    // Title Case
    return clean.replace(/\b\w/g, (char) => char.toUpperCase());
};

const normalizeForMatch = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

export const getSpawnInfo = (pokemonName: string): string | null => {
    const target = normalizeForMatch(pokemonName);
    
    // 1. Filter entries for this pokemon
    const entries = RAW_SPAWN_DATA.spawns.filter(s => normalizeForMatch(s.pokemon) === target);
    
    if (entries.length === 0) return null;

    // 2. Aggregate Data (using Sets to remove duplicates)
    const biomes = new Set<string>();
    const keyItems = new Set<string>();

    entries.forEach(entry => {
        // Add Biomes
        if (entry.condition && entry.condition.biomes) {
            entry.condition.biomes.forEach(b => {
                biomes.add(formatName(b));
            });
        }
        
        // Add Key Item
        if (entry.condition && entry.condition.key_item) {
            // Handle if key_item is an array or string (json usually string, but being safe)
            const item = entry.condition.key_item;
            if (Array.isArray(item)) {
                item.forEach(i => keyItems.add(formatName(i)));
            } else if (typeof item === 'string') {
                keyItems.add(formatName(item));
            }
        }
    });

    // 3. Construct Output String
    const biomeList = Array.from(biomes).sort().join(', ');
    const itemList = Array.from(keyItems).join(' or ');

    let result = "";
    
    if (itemList) {
        result += `Requires: ${itemList}. `;
    }
    
    if (biomeList) {
        result += `Biomes: ${biomeList}.`;
    }

    return result.trim();
};
