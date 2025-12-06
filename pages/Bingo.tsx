
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

// --- TYPES ---
interface BingoCell {
    id: number;
    name: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'Legendary' | 'Mythical';
}

// --- CONSTANTS ---
// Expanded Pool for Random Generation
const MASTER_BINGO_POOL: BingoCell[] = [
    { id: 1, name: "Bulbasaur", rarity: "Rare" },
    { id: 4, name: "Charmander", rarity: "Rare" },
    { id: 7, name: "Squirtle", rarity: "Rare" },
    { id: 16, name: "Pidgey", rarity: "Common" },
    { id: 25, name: "Pikachu", rarity: "Rare" },
    { id: 39, name: "Jigglypuff", rarity: "Common" },
    { id: 41, name: "Zubat", rarity: "Common" },
    { id: 52, name: "Meowth", rarity: "Common" },
    { id: 54, name: "Psyduck", rarity: "Common" },
    { id: 58, name: "Growlithe", rarity: "Uncommon" },
    { id: 63, name: "Abra", rarity: "Uncommon" },
    { id: 66, name: "Machop", rarity: "Common" },
    { id: 74, name: "Geodude", rarity: "Common" },
    { id: 79, name: "Slowpoke", rarity: "Common" },
    { id: 81, name: "Magnemite", rarity: "Common" },
    { id: 92, name: "Gastly", rarity: "Uncommon" },
    { id: 94, name: "Gengar", rarity: "Ultra-Rare" },
    { id: 95, name: "Onix", rarity: "Uncommon" },
    { id: 104, name: "Cubone", rarity: "Uncommon" },
    { id: 123, name: "Scyther", rarity: "Rare" },
    { id: 129, name: "Magikarp", rarity: "Common" },
    { id: 130, name: "Gyarados", rarity: "Ultra-Rare" },
    { id: 131, name: "Lapras", rarity: "Ultra-Rare" },
    { id: 133, name: "Eevee", rarity: "Rare" },
    { id: 134, name: "Vaporeon", rarity: "Rare" },
    { id: 135, name: "Jolteon", rarity: "Rare" },
    { id: 136, name: "Flareon", rarity: "Rare" },
    { id: 143, name: "Snorlax", rarity: "Ultra-Rare" },
    { id: 149, name: "Dragonite", rarity: "Ultra-Rare" },
    { id: 150, name: "Mewtwo", rarity: "Legendary" },
    { id: 151, name: "Mew", rarity: "Mythical" },
    { id: 175, name: "Togepi", rarity: "Uncommon" },
    { id: 248, name: "Tyranitar", rarity: "Ultra-Rare" },
    { id: 282, name: "Gardevoir", rarity: "Ultra-Rare" },
    { id: 376, name: "Metagross", rarity: "Ultra-Rare" },
    { id: 445, name: "Garchomp", rarity: "Ultra-Rare" },
    { id: 448, name: "Lucario", rarity: "Ultra-Rare" },
    { id: 778, name: "Mimikyu", rarity: "Rare" },
];

const LOGO_URL = "https://res.cloudinary.com/dsencimjn/image/upload/v1765016320/cobblebingo_mhbavw.png";

// Cache for image validity
const clientImageCache = new Map<string, boolean>();

// Helper Component for Cell Image
const BingoCardImage: React.FC<{ item: BingoCell }> = ({ item }) => {
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
            const cobbleName = getFormattedName(item.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.id}.png`;

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
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(item.name)}`);
        }
    };

    return (
        <OptimizedImage 
            src={imgSrc} 
            alt={item.name} 
            className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300"
            contain
            onError={handleImageError}
        />
    );
};

const Bingo: React.FC = () => {
    const [gridData, setGridData] = useState<BingoCell[]>([]);
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
    const [isGenerating, setIsGenerating] = useState(false);

    const generateNewCard = useCallback(() => {
        setIsGenerating(true);
        // Shuffle and pick 25
        const shuffled = [...MASTER_BINGO_POOL].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 25);
        setGridData(selected);
        setMarked(new Array(25).fill(false));
        setTimeout(() => setIsGenerating(false), 500);
    }, []);

    // Initial Generation
    useEffect(() => {
        generateNewCard();
    }, [generateNewCard]);

    const toggleMark = (index: number) => {
        const newMarked = [...marked];
        newMarked[index] = !newMarked[index];
        setMarked(newMarked);
    };

    const getRarityColor = (rarity: string) => {
        switch(rarity) {
            case 'Common': return 'bg-gray-500/80 text-white';
            case 'Uncommon': return 'bg-green-600/80 text-white';
            case 'Rare': return 'bg-blue-500/80 text-white';
            case 'Ultra-Rare': return 'bg-purple-600/80 text-white';
            case 'Legendary': return 'bg-yellow-500/90 text-black';
            case 'Mythical': return 'bg-pink-500/90 text-white';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen py-8 font-sans text-white relative">
            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link to="/minecraft" className="inline-block text-gray-400 hover:text-white mb-4 text-sm font-bold transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Bingo Board Container */}
                <div className="bg-black/30 backdrop-blur-xl border-[10px] border-[#1f090c] rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden max-w-5xl w-full flex flex-col items-center">
                    {/* Decorative Background inside board */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    
                    {/* Logo */}
                    <div className="mb-6 w-full flex justify-center relative z-10">
                        <img 
                            src={LOGO_URL} 
                            alt="Cobble Bingo" 
                            className="h-20 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                        />
                    </div>

                    {/* Controls */}
                    <div className="mb-6 flex gap-4 relative z-10">
                        <button 
                            onClick={generateNewCard}
                            disabled={isGenerating}
                            className={`
                                bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all transform hover:scale-105 uppercase text-xs tracking-widest
                                ${isGenerating ? 'opacity-50 cursor-wait' : ''}
                            `}
                        >
                            {isGenerating ? 'Shuffling...' : 'Generate New Card'}
                        </button>
                    </div>
                    
                    {/* The Grid - Scrollable on mobile, Centered on Desktop */}
                    <div className="overflow-x-auto pb-4 md:pb-0 custom-scrollbar flex justify-center w-full relative z-10">
                        <div className={`grid grid-cols-5 gap-2 md:gap-3 min-w-[600px] md:min-w-0 transition-opacity duration-300 ${isGenerating ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                            {gridData.map((item, index) => (
                                <div 
                                    key={`${item.id}-${index}`} // Use index to force unique key if dupes allowed later
                                    onClick={() => toggleMark(index)}
                                    className={`
                                        relative group cursor-pointer aspect-[4/5] rounded-xl border-2 overflow-hidden transition-all duration-200
                                        ${marked[index] 
                                            ? 'bg-black/80 border-red-900/50 grayscale' 
                                            : 'bg-black/40 border-white/10 hover:border-brand-primary/50 hover:bg-black/50 hover:-translate-y-1 hover:shadow-lg'}
                                    `}
                                >
                                    {/* Rarity Badge - Top Right */}
                                    <div className={`
                                        absolute top-1 right-1 z-20
                                        text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm
                                        ${getRarityColor(item.rarity)}
                                    `}>
                                        {item.rarity === 'Ultra-Rare' ? 'UR' : item.rarity}
                                    </div>

                                    {/* Image - Centered and Contained */}
                                    <div className="absolute inset-0 p-3 pb-8 flex items-center justify-center z-10">
                                        <BingoCardImage item={item} />
                                    </div>

                                    {/* Name - Bottom Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm py-1.5 z-20 border-t border-white/5">
                                        <div className="text-[10px] md:text-xs font-bold text-center text-white truncate px-1 text-shadow-sm">
                                            {item.name}
                                        </div>
                                    </div>

                                    {/* Cross Out Overlay */}
                                    {marked[index] && (
                                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                                            <svg className="w-full h-full text-red-600/80 drop-shadow-2xl p-2" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round">
                                                <line x1="20" y1="20" x2="80" y2="80" />
                                                <line x1="80" y1="20" x2="20" y2="80" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <button 
                            onClick={() => setMarked(new Array(25).fill(false))}
                            className="text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Clear Marks Only
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bingo;
