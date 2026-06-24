import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Archive data structure - can be expanded later
interface ArchiveItem {
    id: string;
    title: string;
    description: string;
    path: string;
    date: string;
    status: 'available' | 'coming-soon';
}

// Archive pages - links to archived versions of past events
const ARCHIVE_PAGES: ArchiveItem[] = [
    {
        id: '1',
        title: 'Nisathon Dashboard',
        description: 'Archived uncapped birthday Nisathon dashboard with final stats, goals achieved, and contribution history.',
        path: '/archive/nisathon',
        date: 'Past Event',
        status: 'available'
    },
    {
        id: '2',
        title: 'Spin The Wheel',
        description: 'Archived wheel spin page with all historical spin results and reward history.',
        path: '/archive/wheel',
        date: 'Past Event',
        status: 'available'
    },
    {
        id: '3',
        title: 'Tournament Hub',
        description: 'Archived Nisamon tournament hub with brackets and past winners.',
        path: '/archive/tournament',
        date: 'Past Tournament',
        status: 'available'
    }
];

const Archive: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const getCardStyles = (itemId: string, status: 'available' | 'coming-soon') => {
        const isHovered = hoveredCard === itemId;
        return `
            block bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8
            shadow-2xl relative overflow-hidden group transition-all duration-300
            ${status === 'available'
                ? 'hover:border-brand-primary/50 hover:scale-[1.02] cursor-pointer'
                : 'opacity-60 cursor-not-allowed'}
            ${isHovered && status === 'available' ? 'shadow-brand-primary/20' : ''}
        `;
    };

    return (
        <div className="min-h-screen py-12 relative font-sans text-white">
            {/* Background Decorations - matching other pages */}
            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Background Pattern Style */}
            <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}</style>

            <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-12 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center space-y-6 mb-12">
                    <div className="text-center space-y-3">
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                            <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-red-400">ARCHIVE</span> DUNGEON
                        </h1>
                        <div className="inline-block bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                            <h2 className="text-xl md:text-2xl font-bold text-brand-accent tracking-widest uppercase">Archived Content</h2>
                        </div>
                    </div>
                    <p className="text-gray-300 max-w-2xl text-center text-lg">
                        View past events such as Nisathon and Nisamon!
                    </p>
                </div>

                {/* Archive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {ARCHIVE_PAGES.map((item) => (
                        <Link
                            key={item.id}
                            to={item.status === 'available' ? item.path : '/archive'}
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={getCardStyles(item.id, item.status).replace(/\s+/g, ' ').trim()}
                        >
                            {/* Decorative glow effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-primary/10 transition-colors"></div>

                            <div className="flex items-center gap-4 mb-4">
                                <div>
                                    <h3 className={`text-2xl font-black text-white uppercase tracking-wide group-hover:text-brand-primary transition-colors ${item.status !== 'available' ? 'text-gray-400' : ''}`}>
                                        {item.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                                        {item.date}
                                    </span>
                                </div>
                            </div>

                            <p className="text-gray-400 font-medium leading-relaxed mb-6">
                                {item.description}
                            </p>

                            {item.status === 'available' ? (
                                <div className="flex items-center text-brand-primary font-bold text-sm uppercase tracking-wider">
                                    View Archive <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            ) : (
                                <div className="flex items-center text-gray-500 font-bold text-sm uppercase tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                                    Coming Soon
                                </div>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Back to Home Section */}
                <div className="flex justify-center mt-12">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider transition-colors"
                    >
                        <span className="transform transition-transform hover:-translate-x-1">←</span>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Archive;