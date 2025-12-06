
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

const LOGO_URL = "https://res.cloudinary.com/dsencimjn/image/upload/v1765016320/cobblebingo_mhbavw.png";

// Cache for image validity
const clientImageCache = new Map<string, boolean>();

// Shared Helper
const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .replace(/[.']/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
};

// Helper Component for Cell Image
const BingoCardImage: React.FC<{ item: BingoCell }> = ({ item }) => {
    const [imgSrc, setImgSrc] = useState<string>("");

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
            className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
            contain
            onError={handleImageError}
        />
    );
};

const Bingo: React.FC = () => {
    const [gridData, setGridData] = useState<BingoCell[]>([]);
    const [marked, setMarked] = useState<boolean[]>(new Array(25).fill(false));
    const [isGenerating, setIsGenerating] = useState(false);

    const generateNewCard = useCallback(async () => {
        setIsGenerating(true);
        
        try {
            // 1. Generate 25 Unique Random IDs (1-1025)
            // This covers Gen 1 through Gen 9
            const ids = new Set<number>();
            while(ids.size < 25) {
                ids.add(Math.floor(Math.random() * 1025) + 1);
            }

            // 2. Fetch Data from PokeAPI
            const promises = Array.from(ids).map(async (id) => {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
                if (!response.ok) throw new Error(`Failed to fetch ${id}`);
                const data = await response.json();

                // Determine Rarity based on Species Data
                let rarity: BingoCell['rarity'] = 'Common';
                
                if (data.is_mythical) {
                    rarity = 'Mythical';
                } else if (data.is_legendary) {
                    rarity = 'Legendary';
                } else if (data.capture_rate !== undefined) {
                    // Logic: Lower capture rate = Higher Rarity
                    // Capture rates typically range 3 (hardest) to 255 (easiest)
                    const cr = data.capture_rate;
                    if (cr <= 45) rarity = 'Ultra-Rare';      // e.g. Pseudo-legends, Snorlax, Starters
                    else if (cr <= 90) rarity = 'Rare';       // e.g. Eevee evolutions, Onix
                    else if (cr <= 150) rarity = 'Uncommon';  // e.g. Gloom, Machoke
                    else rarity = 'Common';                   // e.g. Pidgey, Rattata
                }

                // Get English Name
                // PokeAPI returns names in multiple languages, find 'en'
                const englishName = data.names.find((n: any) => n.language.name === 'en')?.name || data.name;

                return {
                    id: data.id,
                    name: englishName,
                    rarity: rarity
                } as BingoCell;
            });

            // 3. Resolve all promises
            const newGrid = await Promise.all(promises);
            
            setGridData(newGrid);
            setMarked(new Array(25).fill(false));

        } catch (e) {
            console.error("Bingo Generation Failed:", e);
            // Fallback could be implemented here, but retry is usually sufficient
        } finally {
            setIsGenerating(false);
        }
    }, []);

    // Initial Generation on Mount
    useEffect(() => {
        // Use a flag to prevent double-firing in StrictMode development
        let mounted = true;
        if (mounted && gridData.length === 0) {
            generateNewCard();
        }
        return () => { mounted = false; };
    }, [generateNewCard]);

    const toggleMark = (index: number) => {
        const newMarked = [...marked];
        newMarked[index] = !newMarked[index];
        setMarked(newMarked);
    };

    const getRarityBadgeStyle = (rarity: string) => {
        switch(rarity) {
            case 'Common': return 'bg-gray-600 text-gray-200';
            case 'Uncommon': return 'bg-green-700/80 text-green-100';
            case 'Rare': return 'bg-blue-600/80 text-blue-100';
            case 'Ultra-Rare': return 'bg-purple-600/80 text-purple-100';
            case 'Legendary': return 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50';
            case 'Mythical': return 'bg-pink-500 text-white shadow-lg shadow-pink-500/50';
            default: return 'bg-gray-500';
        }
    };

    const getCellContainerStyle = (rarity: string) => {
        const base = "relative group cursor-pointer aspect-[4/5] rounded-xl border-2 overflow-hidden transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-xl";
        
        switch (rarity) {
            case 'Mythical':
                return `${base} border-pink-500/50 bg-gradient-to-br from-pink-900/30 to-black/80 hover:border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]`;
            case 'Legendary':
                return `${base} border-yellow-500/50 bg-gradient-to-br from-yellow-900/30 to-black/80 hover:border-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.1)] hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]`;
            case 'Ultra-Rare':
                return `${base} border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-black/80 hover:border-purple-400`;
            case 'Rare':
                return `${base} border-blue-500/30 bg-gradient-to-br from-blue-900/10 to-black/80 hover:border-blue-400`;
            default:
                return `${base} border-white/10 bg-black/60 hover:border-white/30 hover:bg-black/70`;
        }
    };

    const getNamePlateStyle = (rarity: string) => {
        switch (rarity) {
            case 'Mythical':
                return "bg-gradient-to-t from-pink-900/90 to-pink-900/60 border-t border-pink-500/60 shadow-[0_-5px_15px_rgba(236,72,153,0.4)] backdrop-blur-md";
            case 'Legendary':
                return "bg-gradient-to-t from-yellow-900/90 to-yellow-900/60 border-t border-yellow-500/60 shadow-[0_-5px_15px_rgba(234,179,8,0.4)] backdrop-blur-md";
            default:
                return "bg-black/80 border-t border-white/5 backdrop-blur-md";
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
                                ${isGenerating ? 'opacity-70 cursor-wait animate-pulse' : ''}
                            `}
                        >
                            {isGenerating ? 'Scouting...' : 'Generate New Card'}
                        </button>
                    </div>
                    
                    {/* The Grid - Scrollable on mobile, Centered on Desktop */}
                    <div className="overflow-x-auto pb-4 md:pb-0 custom-scrollbar flex justify-center w-full relative z-10 min-h-[500px]">
                        {gridData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-gray-500 animate-pulse mt-10">
                                <div className="text-4xl mb-4">🔮</div>
                                <div className="font-bold">Scouting Pokémon...</div>
                            </div>
                        ) : (
                            <div className={`grid grid-cols-5 gap-2 md:gap-3 min-w-[600px] md:min-w-0 transition-opacity duration-300 ${isGenerating ? 'opacity-50 blur-sm pointer-events-none' : 'opacity-100'}`}>
                                {gridData.map((item, index) => {
                                    const formattedName = getFormattedName(item.name);
                                    const wikiUrl = `https://cobblemon.tools/pokedex/pokemon/${formattedName}`;
                                    
                                    return (
                                        <div 
                                            key={`${item.id}-${index}`} 
                                            onClick={() => toggleMark(index)}
                                            className={`
                                                ${getCellContainerStyle(item.rarity)}
                                                ${marked[index] ? 'grayscale-[0.8] brightness-75 border-red-900/50' : ''}
                                            `}
                                        >
                                            {/* Background Decor for High Rarity */}
                                            {(item.rarity === 'Legendary' || item.rarity === 'Mythical') && (
                                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
                                            )}

                                            {/* Rarity Badge - Top Right */}
                                            <div className={`
                                                absolute top-2 right-2 z-20
                                                text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm
                                                ${getRarityBadgeStyle(item.rarity)}
                                            `}>
                                                {item.rarity === 'Ultra-Rare' ? 'UR' : item.rarity}
                                            </div>

                                            {/* Image Container */}
                                            <div className="flex-1 flex items-center justify-center p-3 pb-8 relative z-10">
                                                <BingoCardImage item={item} />
                                            </div>

                                            {/* Name Bar - Fixed Height at Bottom */}
                                            <div 
                                                className={`absolute bottom-0 left-0 right-0 py-1.5 z-20 flex justify-center ${getNamePlateStyle(item.rarity)}`}
                                                onClick={(e) => e.stopPropagation()} // Prevent toggling mark when clicking the bar area
                                            >
                                                <a 
                                                    href={wikiUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[10px] md:text-xs font-bold text-center text-white truncate px-2 hover:text-brand-primary hover:underline transition-colors flex items-center gap-1 group/link drop-shadow-md"
                                                >
                                                    {item.name}
                                                    <svg className="w-2.5 h-2.5 opacity-50 group-hover/link:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>

                                            {/* Cross Out Overlay */}
                                            {marked[index] && (
                                                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/20 backdrop-blur-[1px]">
                                                    <svg className="w-3/4 h-3/4 text-red-600/90 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round">
                                                        <line x1="20" y1="20" x2="80" y2="80" />
                                                        <line x1="80" y1="20" x2="20" y2="80" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
