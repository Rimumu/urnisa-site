
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import OptimizedImage from '../components/OptimizedImage';
import { DISCORD_API_URL } from '../constants';

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

const Inventory: React.FC = () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'unclaimed' | 'pokemon' | 'item'>('all');

    // Load user on mount
    useEffect(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            fetchInventory(u.id);
        } else {
            setLoading(false);
        }
    }, []);

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
            alert("Please link your Minecraft account first!");
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
                alert(`Claim Failed: ${err.error || "Unknown Error"}`);
            }
        } catch (e) {
            alert("Network Error during claim.");
        } finally {
            setClaimingId(null);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'unclaimed') return !item.claimed;
        if (filter === 'pokemon') return item.type === 'Pokemon';
        if (filter === 'item') return item.type === 'Item';
        return true;
    });

    // Helper to get image (reuse logic from Gacha if possible, or simple fallback)
    const getItemImage = (item: InventoryItem) => {
        if (item.image) return item.image;
        if (item.type === 'Pokemon') {
            // Simplified fallback for inventory list
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${item.itemId}.png`;
        }
        return "https://via.placeholder.com/150?text=?";
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white mb-4">Inventory Locked</h1>
                    <p className="text-gray-400 mb-8">You must log in with Discord to view your inventory.</p>
                    <UserProfile className="w-full justify-center" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 font-sans">
            <UserProfile className="absolute top-4 right-4" />
            
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <Link to="/gacha" className="text-gray-400 hover:text-white mb-2 inline-block text-sm">← Back to Gacha</Link>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                            MY <span className="text-brand-primary">INVENTORY</span>
                        </h1>
                        <p className="text-gray-400 mt-2">
                            MC Account: <span className="text-green-400 font-mono font-bold">{user.minecraftUsername || "Not Linked"}</span>
                        </p>
                    </div>

                    <div className="flex bg-black/30 rounded-xl p-1 border border-white/10">
                        {(['all', 'unclaimed', 'pokemon', 'item'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 animate-pulse">Loading items...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/5">
                        <p className="text-2xl text-gray-600 font-bold mb-4">No items found</p>
                        <Link to="/minecraft/gacha" className="bg-brand-primary/20 text-brand-primary px-6 py-3 rounded-full font-bold hover:bg-brand-primary hover:text-white transition-colors">
                            Go Open Packs!
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredItems.map(item => (
                            <div 
                                key={item._id} 
                                className={`
                                    relative bg-black/40 border rounded-xl overflow-hidden group transition-all duration-300
                                    ${item.claimed ? 'border-green-900/30 opacity-60 grayscale-[0.5]' : 'border-white/10 hover:border-brand-primary/50 hover:shadow-lg hover:-translate-y-1'}
                                `}
                            >
                                <div className="aspect-square p-4 flex items-center justify-center bg-gradient-to-b from-transparent to-black/20">
                                    <OptimizedImage 
                                        src={getItemImage(item)} 
                                        alt={item.name} 
                                        className="w-full h-full object-contain drop-shadow-lg"
                                        contain
                                    />
                                </div>
                                
                                <div className="p-3 bg-black/60 border-t border-white/5">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white text-sm truncate w-full" title={item.name}>{item.name}</h3>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                                            item.rarity === 'Legendary' ? 'bg-yellow-500/20 text-yellow-200' :
                                            item.rarity === 'Ultra-Rare' ? 'bg-purple-500/20 text-purple-200' :
                                            item.rarity === 'Rare' ? 'bg-blue-500/20 text-blue-200' :
                                            'bg-gray-500/20 text-gray-400'
                                        }`}>
                                            {item.rarity}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover Overlay for Claim */}
                                <div className={`
                                    absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-200
                                    ${item.claimed ? 'opacity-100 bg-black/40' : 'opacity-0 group-hover:opacity-100'}
                                `}>
                                    {item.claimed ? (
                                        <div className="flex flex-col items-center text-green-500">
                                            <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            <span className="font-bold uppercase text-xs tracking-widest">Claimed</span>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleClaim(item)}
                                            disabled={claimingId === item._id}
                                            className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transform transition-transform hover:scale-105"
                                        >
                                            {claimingId === item._id ? 'Processing...' : 'CLAIM'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Inventory;
