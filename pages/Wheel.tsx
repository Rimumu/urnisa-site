
import React, { useState, useEffect, useMemo } from 'react';
import SpinWheel from '../components/SpinWheel';
import { useWheelGame, SpinQueueItem } from '../hooks/useWheelGame';
import { API_BASE_URL } from '../constants';

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
    </svg>
);

const HistoryModal: React.FC<{ onClose: () => void; history: any[] }> = ({ onClose, history }) => (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-[#1a0b0e] w-full max-w-lg max-h-[80vh] rounded-[2rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h2 className="text-2xl font-black text-white">Wheel History</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {history.length === 0 ? <div className="text-center text-gray-500 py-10">No history yet.</div> : history.map((h) => (
                    <div key={h._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                        <div>
                            <div className="font-bold text-white">{h.user}</div>
                            <div className="text-xs text-gray-500">{new Date(h.timestamp).toLocaleString()}</div>
                        </div>
                        <div className="font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
                            {h.reward}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Wheel: React.FC = () => {
    const { queue, history, completeSpin } = useWheelGame();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    // Current spinner is head of queue, OR if admin overrides (free spin)
    const currentSpinner = queue.length > 0 ? queue[0] : null;

    // Group sequential spins from the SAME transaction (sourceEventId)
    // We do NOT group different transactions from the same user.
    const groupedQueue = useMemo(() => {
        const grouped: (SpinQueueItem & { count: number; totalNb: number })[] = [];
        
        queue.forEach((item) => {
            const last = grouped[grouped.length - 1];
            // Only group if sourceEventId exists and matches.
            // This implies they came from the same single donation event.
            // Note: 'nisaballs' on the item is the Total amount of the transaction already, so we don't sum it.
            if (last && item.sourceEventId && last.sourceEventId === item.sourceEventId) {
                last.count += 1;
            } else {
                grouped.push({
                    ...item,
                    count: 1,
                    totalNb: item.nisaballs
                });
            }
        });
        
        return grouped;
    }, [queue]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setIsAdmin(true);
                setShowLogin(false);
            } else {
                alert('Invalid password');
            }
        } catch (e) { alert('Connection error'); }
    };

    const handleSpinEnd = (reward: string) => {
        // If spinning from queue, complete queue item. Else generic free spin.
        const user = currentSpinner ? currentSpinner.user : "Admin Spin";
        const queueId = currentSpinner ? currentSpinner._id : undefined;
        completeSpin(user, reward, queueId, password);
    };

    return (
        <div className="min-h-screen py-12 relative font-sans">
             <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}</style>
            
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            {showHistory && <HistoryModal onClose={() => setShowHistory(false)} history={history} />}

            {showLogin && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-black/80 border border-white/10 p-6 rounded-2xl w-full max-w-sm">
                        <h3 className="text-white font-bold mb-4">Admin Access</h3>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-2 text-white" placeholder="Password" />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowLogin(false)} className="flex-1 bg-gray-700 text-white p-2 rounded">Cancel</button>
                                <button type="submit" className="flex-1 bg-brand-primary text-white p-2 rounded">Login</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center animate-in fade-in duration-700">
                <div className="text-center space-y-3 mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                        SPIN THE <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-red-400">WHEEL</span>
                    </h1>
                    <div className="inline-block bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                            <h2 className="text-xl md:text-2xl font-bold text-brand-accent tracking-widest uppercase">Nisathon Event</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    {/* WHEEL SECTION */}
                    <div className="lg:col-span-2 w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-full bg-rose-pattern opacity-5 pointer-events-none"></div>
                        
                        {/* Current Spinner Banner */}
                        {currentSpinner ? (
                            <div className="absolute top-6 left-0 right-0 text-center animate-pulse">
                                <span className="bg-brand-accent text-brand-bg font-black px-4 py-1 rounded-full uppercase tracking-widest text-xs shadow-lg">Spinning For</span>
                                <div className="text-3xl font-black text-white mt-1 drop-shadow-lg">{currentSpinner.user}</div>
                            </div>
                        ) : (
                            <div className="absolute top-6 text-gray-500 font-bold tracking-widest uppercase text-xs">Waiting for spins...</div>
                        )}

                        <div className="mt-8">
                            <SpinWheel 
                                disabled={!isAdmin} 
                                onSpinEnd={handleSpinEnd} 
                            />
                        </div>

                        {/* Admin Toggle */}
                        <button 
                            onClick={() => setShowLogin(true)} 
                            className={`absolute bottom-4 right-4 p-2 rounded-full transition-colors ${isAdmin ? 'text-green-500 bg-green-500/10' : 'text-gray-600 bg-black/20 hover:text-gray-400'}`}
                            title="Admin Controls"
                        >
                            {isAdmin ? '🔓' : <LockIcon />}
                        </button>
                    </div>

                    {/* SIDEBAR (Queue & Stats) */}
                    <div className="space-y-6">
                        
                        {/* Stats Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center">Wheel Stats</h3>
                            <div className="text-center">
                                <div className="text-5xl font-black text-white">{history.length}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase mt-1">Total Spins</div>
                            </div>
                        </div>

                        {/* Queue Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 min-h-[300px] flex flex-col">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center border-b border-white/5 pb-4">
                                Spin Queue ({queue.length})
                            </h3>
                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
                                {groupedQueue.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8 italic">Queue is empty</div>
                                ) : (
                                    groupedQueue.map((item, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors group ${idx === 0 ? 'bg-brand-primary/20 border-brand-primary/50' : 'bg-white/5 border-white/5'}`}
                                            title={`Total Donation: ${item.totalNb ? item.totalNb.toFixed(1) : 'Unknown'} NB`}
                                        >
                                            <div className="font-mono text-xs font-bold text-gray-500 w-4">#{idx + 1}</div>
                                            <div className="font-bold text-white flex-1 truncate">{item.user}</div>
                                            
                                            <div className="text-xs bg-brand-accent text-brand-bg font-black px-2 py-1 rounded shadow-sm">
                                                {item.count}x
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Wins Card */}
                        <div 
                            onClick={() => setShowHistory(true)}
                            className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-brand-primary/30 transition-colors group"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-brand-primary font-bold uppercase tracking-widest text-xs">Recent Wins</h3>
                                <span className="text-xs text-gray-500 group-hover:text-white transition-colors">View All →</span>
                            </div>
                            <div className="space-y-3">
                                {history.slice(0, 3).map((h) => (
                                    <div key={h._id} className="text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                        <span className="font-bold text-white">{h.user}</span> won <span className="text-brand-accent font-bold">{h.reward}</span>
                                    </div>
                                ))}
                                {history.length === 0 && <div className="text-gray-500 text-xs text-center">No wins yet</div>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wheel;
