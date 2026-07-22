
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import OptimizedImage from '../components/OptimizedImage';
import { DISCORD_API_URL, API_BASE_URL } from '../constants';

interface InventoryItem {
    _id: string;
    itemId: string;
    name: string;
    type: 'Pokemon' | 'Item';
    rarity: string;
    image?: string;
    claimed: boolean;
    receivedAt: string;
}

// --- CACHE ---
const clientImageCache = new Map<string, boolean>();

// Helper Component for consistent image logic
const InventoryCardImage: React.FC<{ item: InventoryItem }> = ({ item }) => {
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
            if (item.image) {
                setImgSrc(item.image);
                return;
            }

            if (item.type === 'Item') {
                 setImgSrc("https://via.placeholder.com/150?text=Item");
                 return;
            }

            // Pokemon Logic
            const cobbleName = getFormattedName(item.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.itemId}.png`;

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
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${item.itemId}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.itemId}.png`);
        } else if (imgSrc.includes('official-artwork')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.itemId}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(item.name)}`);
        }
    };

    return (
        <OptimizedImage 
            src={imgSrc} 
            alt={item.name} 
            className="w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
            contain
            onError={handleImageError}
        />
    );
};

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
        return null;
    });
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unclaimed' | 'pokemon' | 'item'>('all');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 30;
    
    // Error Modal State
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Fetch user inventory on mount if logged in
    useEffect(() => {
        if (user) {
            fetchInventory(user.id);
        } else {
            setLoading(false);
        }
    }, []);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const fetchInventory = async (discordId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/inventory?discordId=${discordId}`);
            if (res.ok) {
                setItems(await res.json());
            }
        } catch (e) {
            console.error("Failed to load inventory", e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (item: InventoryItem) => {
        if (!user || !user.minecraftUsername) {
            setErrorMessage("Please link your Minecraft account first!");
            setShowErrorModal(true);
            return;
        }
        if (item.claimed) return;

        setClaimingId(item._id);
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/inventory/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: user.id,
                    dbItemId: item._id
                })
            });

            if (res.ok) {
                // Update local state
                setItems(prev => prev.map(i => i._id === item._id ? { ...i, claimed: true } : i));
            } else {
                const err = await res.json();
                const msg = err.error || "Unknown Error";
                // If it's the online check error, clarify it for the user
                if (msg.includes("must be online")) {
                    setErrorMessage("Claim Failed: You must be online in-game to claim items!");
                } else {
                    setErrorMessage(`Claim Failed: ${msg}`);
                }
                setShowErrorModal(true);
            }
        } catch (e) {
            setErrorMessage("Network Error during claim.");
            setShowErrorModal(true);
        } finally {
            setClaimingId(null);
        }
    };

    // Filter Logic
    const filteredItems = items.filter(item => {
        if (filter === 'unclaimed') return !item.claimed;
        if (filter === 'pokemon') return item.type === 'Pokemon';
        if (filter === 'item') return item.type === 'Item';
        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const displayedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const getRarityStyles = (rarity: string) => {
        switch (rarity) {
            case 'Mythical':
                return "border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-pink-900/10";
            case 'Legendary':
                return "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] bg-yellow-900/10";
            case 'Ultra-Rare':
                return "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)] bg-purple-900/10";
            case 'Rare':
                return "border-blue-500/50 shadow-[0_0_5px_rgba(59,130,246,0.2)] bg-blue-900/5";
            default:
                return "border-white/10 hover:border-white/20 bg-black/40";
        }
    };

    const getRarityBadge = (rarity: string) => {
        switch (rarity) {
            case 'Mythical': return "bg-pink-500 text-white";
            case 'Legendary': return "bg-yellow-500 text-black";
            case 'Ultra-Rare': return "bg-purple-500 text-white";
            case 'Rare': return "bg-blue-500 text-white";
            case 'Uncommon': return "bg-green-600 text-white";
            default: return "bg-gray-600 text-gray-200";
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white mb-4">Inventory Locked</h1>
                    <p className="text-gray-400 mb-8">You must log in with Discord to view your inventory.</p>
                    <UserProfile className="w-full justify-center" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 font-sans relative">
            <UserProfile className="!absolute top-4 right-4" />
            
            {/* Custom Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1a0b0e] border border-white/10 p-6 rounded-3xl w-full max-w-sm shadow-2xl text-center relative">
                        <button onClick={() => setShowErrorModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>
                        <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-3xl border border-red-500/20">
                            ⚠️
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">Notice</h3>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{errorMessage}</p>
                        <button onClick={() => setShowErrorModal(false)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                    <div className="flex flex-col items-start gap-4">
                        <Link to="/minecraft/gacha" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md">
                            <span>←</span> Back to Gacha
                        </Link>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                                MY <span className="text-brand-primary">INVENTORY</span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1 font-medium">
                                Showing {displayedItems.length} of {filteredItems.length} items
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-black/40 rounded-xl p-1 border border-white/10 backdrop-blur-sm overflow-x-auto w-full md:w-auto">
                        {(['all', 'unclaimed', 'pokemon', 'item'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap flex-1 md:flex-none ${filter === f ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading items...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5 backdrop-blur-sm">
                        <p className="text-2xl text-gray-600 font-bold mb-4">No items found</p>
                        <Link to="/minecraft/gacha" className="bg-brand-primary/20 text-brand-primary px-6 py-3 rounded-full font-bold hover:bg-brand-primary hover:text-white transition-colors">
                            Go Open Packs!
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
                            {displayedItems.map(item => (
                                <div 
                                    key={item._id} 
                                    className={`
                                        relative border-2 rounded-2xl overflow-hidden group transition-all duration-300 flex flex-col
                                        ${item.claimed ? 'border-gray-800 bg-black/20 opacity-50 grayscale' : getRarityStyles(item.rarity)}
                                        ${!item.claimed && 'hover:-translate-y-1 hover:shadow-xl'}
                                    `}
                                >
                                    {/* Top Badge */}
                                    <div className="absolute top-2 right-2 z-20">
                                        <span className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full shadow-sm backdrop-blur-md ${getRarityBadge(item.rarity)}`}>
                                            {item.rarity}
                                        </span>
                                    </div>

                                    <div className="aspect-square p-4 flex items-center justify-center relative">
                                        {/* Radial Glow for high tiers */}
                                        {(item.rarity === 'Mythical' || item.rarity === 'Legendary') && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-0"></div>
                                        )}
                                        <div className="relative z-10 w-full h-full">
                                            <InventoryCardImage item={item} />
                                        </div>
                                    </div>
                                    
                                    <div className="p-3 bg-black/60 border-t border-white/5 flex flex-col gap-2 mt-auto backdrop-blur-md">
                                        <h3 className="font-bold text-white text-sm truncate w-full text-center" title={item.name}>{item.name}</h3>
                                        
                                        {item.claimed ? (
                                            <div className="w-full bg-green-500/10 border border-green-500/30 text-green-500 text-xs font-bold py-2 rounded-lg text-center uppercase tracking-wider flex items-center justify-center gap-1">
                                                <span>✓</span> Claimed
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleClaim(item)}
                                                disabled={claimingId === item._id}
                                                className={`
                                                    w-full text-white text-xs font-bold py-2 rounded-lg text-center uppercase tracking-wider shadow-lg transition-all
                                                    ${claimingId === item._id 
                                                        ? 'bg-gray-600 cursor-wait' 
                                                        : 'bg-brand-primary hover:bg-red-600 hover:scale-[1.02]'}
                                                `}
                                            >
                                                {claimingId === item._id ? '...' : 'Claim'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 pb-8">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white font-bold"
                                >
                                    ←
                                </button>
                                
                                <div className="flex items-center gap-1">
                                    {/* Simplified Pagination Logic */}
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2))
                                        .map((p, i, arr) => {
                                            const showDots = i > 0 && p !== arr[i-1] + 1;
                                            return (
                                                <React.Fragment key={p}>
                                                    {showDots && <span className="text-gray-500 px-1">...</span>}
                                                    <button
                                                        onClick={() => handlePageChange(p)}
                                                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === p ? 'bg-brand-primary text-white scale-110 shadow-lg' : 'bg-black/40 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'}`}
                                                    >
                                                        {p}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })
                                    }
                                </div>

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-black/40 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white font-bold"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Inventory;
