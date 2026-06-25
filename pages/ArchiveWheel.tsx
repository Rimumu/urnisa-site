import React, { useState, useEffect } from 'react';
import SpinWheel from '../components/SpinWheel';
import archiveData from '../data/wheel-archive.json';

// Types for archived wheel data
interface ArchivedSpin {
    _id: string;
    user: string;
    reward: string;
    timestamp: string;
}

const ArchiveWheel: React.FC = () => {
    const history = archiveData.history as ArchivedSpin[];
    const archiveInfo = archiveData.info;
    const items = archiveData.items as any;
    
    // Pagination and Filter states
    const [filterText, setFilterText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    // Derived state
    const filteredHistory = history.filter(h => h.user.toLowerCase().includes(filterText.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage));
    const currentHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filterText]);

    const totalSpins = history.length;

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

            <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center animate-in fade-in duration-700">
                <div className="text-center space-y-3 mb-12">
                    <div className="inline-block bg-amber-500/20 px-4 py-1 rounded-full border border-amber-500/30 mb-2">
                        <span className="text-amber-400 font-black text-xs uppercase tracking-widest">ARCHIVED CONTENT</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                        SPIN THE <span className="text-brand-primary">WHEEL</span>
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                        <h2 className="text-lg md:text-xl font-bold text-brand-accent tracking-widest uppercase">Nisathon Event</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                    {/* WHEEL SECTION - Disabled for archive, showing final state */}
                    <div className="lg:col-span-2 w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center">
                        <div className="absolute top-0 left-0 w-full h-full bg-rose-pattern opacity-5 pointer-events-none"></div>

                        {/* Archived Badge */}
                        <div className="absolute top-6 text-gray-500 font-bold tracking-widest uppercase text-xs">
                            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">ARCHIVED</span>
                        </div>

                        <div className="mt-8 opacity-60">
                            <SpinWheel disabled={true} overrideItems={items} />
                        </div>
                    </div>

                    {/* SIDEBAR (History & Stats) */}
                    <div className="space-y-6">

                        {/* Stats Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center">Wheel Stats</h3>
                            <div className="text-center">
                                <div className="text-5xl font-black text-white">{totalSpins}</div>
                                <div className="text-gray-500 text-xs font-bold uppercase mt-1">Total Spins</div>
                            </div>
                        </div>

                        {/* History Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 flex flex-col">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center border-b border-white/5 pb-4">
                                Spin History
                            </h3>
                            
                            <input
                                type="text"
                                placeholder="Filter by username..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white mb-4 placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-colors"
                            />
                            
                            <div className="space-y-3 flex-1">
                                {currentHistory.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8 italic">No archived spins found</div>
                                ) : (
                                    currentHistory.map((h) => (
                                        <div key={h._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div>
                                                <div className="font-bold text-white">{h.user}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(h.timestamp).toLocaleDateString()} • {new Date(h.timestamp).toLocaleTimeString()}
                                                </div>
                                            </div>
                                            <div className="font-bold text-brand-accent bg-brand-accent/10 px-3 py-1 rounded-full border border-brand-accent/20">
                                                {h.reward}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors text-sm font-bold"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-xs text-gray-400 font-bold">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 bg-white/5 rounded-lg disabled:opacity-30 hover:bg-white/10 transition-colors text-sm font-bold"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchiveWheel;