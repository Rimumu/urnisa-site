
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import OptimizedImage from './OptimizedImage';

interface InventoryItem {
    _id: string;
    name: string;
    rarity: string;
    image: string;
    type: string;
    subType: string;
    claimed: boolean;
    cardId: number;
}

interface InventoryModalProps {
    discordId: string;
    onClose: () => void;
}

const RarityColors: Record<string, string> = {
    'Common': 'border-gray-500 bg-gray-500/10 text-gray-400',
    'Uncommon': 'border-green-500 bg-green-500/10 text-green-400',
    'Rare': 'border-blue-500 bg-blue-500/10 text-blue-400',
    'Ultra-Rare': 'border-purple-500 bg-purple-500/10 text-purple-400',
    'Legendary': 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
    'Mythical': 'border-pink-500 bg-pink-500/10 text-pink-400',
};

const InventoryModal: React.FC<InventoryModalProps> = ({ discordId, onClose }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchInventory();
    }, [discordId]);

    const fetchInventory = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/${discordId}`);
            if (res.ok) {
                setItems(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (itemId: string) => {
        setClaimingId(itemId);
        setStatusMsg(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/inventory/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId, itemId })
            });
            const data = await res.json();
            
            if (res.ok) {
                setStatusMsg({ type: 'success', text: data.message });
                // Update local state
                setItems(prev => prev.map(i => i._id === itemId ? { ...i, claimed: true } : i));
            } else {
                setStatusMsg({ type: 'error', text: data.error || "Failed to claim" });
            }
        } catch (e) {
            setStatusMsg({ type: 'error', text: "Network error" });
        } finally {
            setClaimingId(null);
        }
    };

    // Helper for image fallback (using same logic as Gacha.tsx roughly)
    const getImage = (item: InventoryItem) => {
        if (item.image) return item.image;
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.cardId}.png`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#1a0b0e] w-full max-w-4xl h-[80vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">
                
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            🎒 Your Inventory
                        </h2>
                        <p className="text-sm text-gray-400">Click on items to send them to the server!</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:text-brand-primary transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Status Bar */}
                {statusMsg && (
                    <div className={`px-6 py-2 text-center text-sm font-bold ${statusMsg.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {statusMsg.text}
                    </div>
                )}

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <span className="text-4xl mb-2">🕸️</span>
                            <p>Your inventory is empty.</p>
                            <p className="text-xs">Play the Gacha to win items!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {items.map((item) => (
                                <div 
                                    key={item._id} 
                                    className={`
                                        group relative aspect-[3/4] rounded-xl border-2 overflow-hidden transition-all duration-300
                                        ${item.claimed ? 'opacity-50 grayscale border-gray-700 bg-gray-900' : `${RarityColors[item.rarity] || 'border-gray-500'} bg-black/40 hover:scale-105 hover:shadow-xl`}
                                    `}
                                >
                                    {/* Image */}
                                    <div className="absolute inset-0 p-4 pb-12 flex items-center justify-center">
                                        <OptimizedImage 
                                            src={getImage(item)} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain drop-shadow-lg"
                                        />
                                    </div>

                                    {/* Info Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-center opacity-70 mb-0.5">{item.rarity}</div>
                                        <div className="text-sm font-bold text-center text-white leading-tight truncate">{item.name}</div>
                                    </div>

                                    {/* Claim Overlay / Button */}
                                    {item.claimed ? (
                                        <div className="absolute top-2 right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            Claimed
                                        </div>
                                    ) : (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                            <button 
                                                onClick={() => handleClaim(item._id)}
                                                disabled={claimingId !== null}
                                                className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-transform hover:scale-105"
                                            >
                                                {claimingId === item._id ? '...' : 'CLAIM'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryModal;
