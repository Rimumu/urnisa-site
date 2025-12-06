
import React, { useState, useEffect } from 'react';
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
// A mix of 25 confirmed Cobblemon Pokémon
const BINGO_GRID_DATA: BingoCell[] = [
    { id: 1, name: "Bulbasaur", rarity: "Rare" },
    { id: 16, name: "Pidgey", rarity: "Common" },
    { id: 25, name: "Pikachu", rarity: "Rare" },
    { id: 129, name: "Magikarp", rarity: "Common" },
    { id: 133, name: "Eevee", rarity: "Rare" },
    
    { id: 4, name: "Charmander", rarity: "Rare" },
    { id: 41, name: "Zubat", rarity: "Common" },
    { id: 92, name: "Gastly", rarity: "Uncommon" },
    { id: 63, name: "Abra", rarity: "Uncommon" },
    { id: 66, name: "Machop", rarity: "Common" },
    
    { id: 143, name: "Snorlax", rarity: "Ultra-Rare" },
    { id: 95, name: "Onix", rarity: "Uncommon" },
    { id: 150, name: "Mewtwo", rarity: "Legendary" }, // Center Tile Idea?
    { id: 131, name: "Lapras", rarity: "Ultra-Rare" },
    { id: 149, name: "Dragonite", rarity: "Ultra-Rare" },
    
    { id: 7, name: "Squirtle", rarity: "Rare" },
    { id: 52, name: "Meowth", rarity: "Common" },
    { id: 58, name: "Growlithe", rarity: "Uncommon" },
    { id: 74, name: "Geodude", rarity: "Common" },
    { id: 123, name: "Scyther", rarity: "Rare" },
    
    { id: 94, name: "Gengar", rarity: "Ultra-Rare" },
    { id: 151, name: "Mew", rarity: "Mythical" },
    { id: 448, name: "Lucario", rarity: "Ultra-Rare" },
    { id: 282, name: "Gardevoir", rarity: "Ultra-Rare" },
    { id: 39, name: "Jigglypuff", rarity: "Common" },
];

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
    // State to track crossed out cells (array of booleans matching grid index)
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));

    const toggleMark = (index: number) => {
        const newMarked = [...marked];
        newMarked[index] = !newMarked[index];
        setMarked(newMarked);
    };

    const getRarityColor = (rarity: string) => {
        switch(rarity) {
            case 'Common': return 'bg-gray-500 text-white';
            case 'Uncommon': return 'bg-green-600 text-white';
            case 'Rare': return 'bg-blue-500 text-white';
            case 'Ultra-Rare': return 'bg-purple-600 text-white';
            case 'Legendary': return 'bg-yellow-500 text-black';
            case 'Mythical': return 'bg-pink-500 text-white';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen py-8 font-sans text-white relative">
            <style>{`
                .cross-out {
                    background: 
                        linear-gradient(to top left, transparent 45%, rgba(220, 38, 38, 0.8) 48%, rgba(220, 38, 38, 0.8) 52%, transparent 55%),
                        linear-gradient(to top right, transparent 45%, rgba(220, 38, 38, 0.8) 48%, rgba(220, 38, 38, 0.8) 52%, transparent 55%);
                }
            `}</style>

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center">
                
                {/* Header */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link to="/minecraft" className="inline-block text-gray-400 hover:text-white mb-4 text-sm font-bold transition-colors">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl">
                        WELCOME TO <span className="text-brand-primary">URNISA</span> <br className="md:hidden" /> 
                        COBBLEMON <span className="text-[#60a5fa]">BINGO</span>
                    </h1>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                        Track your collection! Catch these Pokémon on the server to complete lines and win prizes.
                    </p>
                </div>

                {/* Bingo Board Container */}
                <div className="bg-black/30 backdrop-blur-xl border-[10px] border-[#1f090c] rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden max-w-5xl w-full">
                    {/* Decorative Background inside board */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    
                    {/* The Grid - Scrollable on mobile, Centered on Desktop */}
                    <div className="overflow-x-auto pb-4 md:pb-0 custom-scrollbar flex justify-center">
                        <div className="grid grid-cols-5 gap-2 md:gap-4 min-w-[600px] md:min-w-0">
                            {BINGO_GRID_DATA.map((item, index) => (
                                <div 
                                    key={index}
                                    onClick={() => toggleMark(index)}
                                    className={`
                                        relative group cursor-pointer aspect-square rounded-xl border-2 overflow-hidden transition-all duration-200
                                        flex flex-col items-center justify-between p-2
                                        ${marked[index] 
                                            ? 'bg-black/60 border-red-900/50 grayscale-[0.8]' 
                                            : 'bg-black/40 border-white/10 hover:border-brand-primary/50 hover:bg-black/50 hover:-translate-y-1 hover:shadow-lg'}
                                    `}
                                >
                                    {/* Rarity Badge */}
                                    <div className={`
                                        text-[8px] md:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full z-10 shadow-sm
                                        ${getRarityColor(item.rarity)}
                                    `}>
                                        {item.rarity}
                                    </div>

                                    {/* Image */}
                                    <div className="flex-1 w-full flex items-center justify-center p-1 relative z-0">
                                        <BingoCardImage item={item} />
                                    </div>

                                    {/* Name */}
                                    <div className="text-xs md:text-sm font-bold text-center w-full truncate z-10 text-shadow-sm">
                                        {item.name}
                                    </div>

                                    {/* Cross Out Overlay */}
                                    {marked[index] && (
                                        <div className="absolute inset-0 cross-out z-20 pointer-events-none opacity-80"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => setMarked(new Array(25).fill(false))}
                            className="text-gray-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Reset Card
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Bingo;