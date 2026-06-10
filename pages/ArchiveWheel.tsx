import React, { useState, useEffect } from 'react';
import SpinWheel from '../components/SpinWheel';
import { API_BASE_URL } from '../constants';

// Types for archived wheel data
interface ArchivedSpin {
    _id: string;
    user: string;
    reward: string;
    timestamp: string;
}

const ArchiveWheel: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<ArchivedSpin[]>([]);
    const [archiveInfo, setArchiveInfo] = useState<{
        eventName: string;
        archivedAt: string;
        totalSpins: number;
    } | null>(null);

    useEffect(() => {
        // Load archived wheel history - no polling, just once
        fetch(`${API_BASE_URL}/api/archive/wheel/history`)
            .then(res => {
                if (res.ok) return res.json();
                return null;
            })
            .then(data => {
                if (data) {
                    setHistory(data.spins || []);
                    setArchiveInfo(data.info || null);
                }
            })
            .catch(() => {
                setError('Failed to load archived wheel data');
            })
            .finally(() => setLoading(false));
    }, []);

    const totalSpins = history.length;
    const archiveDate = archiveInfo?.archivedAt ? new Date(archiveInfo.archivedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : 'Unknown Date';

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
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                        SPIN THE <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-red-400">WHEEL</span>
                    </h1>
                    <div className="inline-block bg-black/40 px-4 py-2 rounded-full border border-white/10">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            Archived {archiveDate}
                        </span>
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
                            <SpinWheel disabled={true} />
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
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 min-h-[300px] flex flex-col">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center border-b border-white/5 pb-4">
                                Spin History
                            </h3>
                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px]">
                                {loading ? (
                                    <div className="text-center text-gray-500 text-sm py-8">Loading...</div>
                                ) : error ? (
                                    <div className="text-center text-red-400 text-sm py-8">Failed to load history</div>
                                ) : history.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-8 italic">No archived spins found</div>
                                ) : (
                                    history.map((h) => (
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchiveWheel;