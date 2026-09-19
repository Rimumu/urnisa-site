import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, Dices, Disc, ShoppingBag, Box, Trophy, Grid, Layers, Gift } from 'lucide-react';

interface HiddenArchiveItem {
    id: string;
    title: string;
    category: string;
    description: string;
    path: string;
    icon: React.ReactNode;
    badgeColor: string;
}

const HIDDEN_ARCHIVE_ITEMS: HiddenArchiveItem[] = [
    {
        id: 'wheels',
        title: 'Spin The Wheel',
        category: 'Nisathon Mini-game',
        description: 'Interactive customizable wheel spin game with Nisaballs & custom probability weights.',
        path: '/arch/wheels',
        icon: <Disc className="w-6 h-6 text-brand-primary" />,
        badgeColor: 'bg-brand-primary/20 text-brand-primary border-brand-primary/30'
    },
    {
        id: 'snakesladder',
        title: 'Snakes & Ladders',
        category: 'Interactive Game',
        description: 'Snakes and Ladders community board game with custom player tokens.',
        path: '/arch/snakesladder',
        icon: <Dices className="w-6 h-6 text-emerald-400" />,
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    {
        id: 'minecraft',
        title: 'Nisamon Dashboard',
        category: 'Minecraft Server',
        description: 'Minecraft profile hub, Discord authentication, and Nisamon overview.',
        path: '/arch/minecraft',
        icon: <Layers className="w-6 h-6 text-brand-accent" />,
        badgeColor: 'bg-brand-accent/20 text-brand-accent border-brand-accent/30'
    },
    {
        id: 'shop',
        title: 'Nisamon Shop',
        category: 'Minecraft Economy',
        description: 'Store for Nisamon crate keys, exclusive cosmetics, and card packs.',
        path: '/arch/minecraft/shop',
        icon: <ShoppingBag className="w-6 h-6 text-amber-400" />,
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    },
    {
        id: 'gacha',
        title: 'Gacha Crates',
        category: 'Minecraft Gacha',
        description: 'Lamb and Wagyu crate unboxing simulator and reward unlocker.',
        path: '/arch/minecraft/gacha',
        icon: <Box className="w-6 h-6 text-orange-400" />,
        badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
        id: 'tournament',
        title: 'Tournament Hub',
        category: 'PvP Tournament',
        description: 'Tournament brackets, player lineups, rule sets, and team registrations.',
        path: '/arch/minecraft/tournament',
        icon: <Trophy className="w-6 h-6 text-red-400" />,
        badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30'
    },
    {
        id: 'bingo',
        title: 'Community Bingo',
        category: 'Minecraft Challenge',
        description: 'Interactive Bingo boards, custom card generators, and event tasks.',
        path: '/arch/minecraft/bingo',
        icon: <Grid className="w-6 h-6 text-sky-400" />,
        badgeColor: 'bg-sky-500/20 text-sky-400 border-sky-500/30'
    },
    {
        id: 'inventory',
        title: 'Card Inventory',
        category: 'TCG Cards',
        description: 'Nisamon TCG card binder, collection statistics, and duplicate manager.',
        path: '/arch/inventory',
        icon: <Layers className="w-6 h-6 text-purple-400" />,
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
        id: 'redeem',
        title: 'Item Redemption',
        category: 'Claim System',
        description: 'Redeem promotional event codes for in-game items and cards.',
        path: '/arch/redeem',
        icon: <Gift className="w-6 h-6 text-pink-400" />,
        badgeColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30'
    }
];

export const HiddenArchive: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    return (
        <div className="min-h-screen py-10 relative font-sans text-white">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-950/20 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-10 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/50 border border-red-800/40 text-red-400 text-xs font-black uppercase tracking-widest">
                        <Lock className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Hidden Archive Directory</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                        SECRET <span className="text-brand-primary">VAULT</span>
                    </h1>
                    <p className="text-gray-400 max-w-xl text-sm sm:text-base">
                        Direct access portal for unlisted mini-games, retired event features, and Minecraft Nisamon tools.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {HIDDEN_ARCHIVE_ITEMS.map((item) => {
                        const isHovered = hoveredCard === item.id;
                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onMouseEnter={() => setHoveredCard(item.id)}
                                onMouseLeave={() => setHoveredCard(null)}
                                className={`
                                    bg-black/50 backdrop-blur-xl border rounded-3xl p-6 relative overflow-hidden transition-all duration-300 flex flex-col justify-between group
                                    ${isHovered ? 'border-brand-primary/60 scale-[1.02] shadow-[0_0_25px_rgba(220,38,38,0.2)]' : 'border-white/10 hover:border-white/20'}
                                `}
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${item.badgeColor}`}>
                                            {item.category}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-white group-hover:text-brand-primary transition-colors tracking-wide">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-500 group-hover:text-gray-300">
                                    <span className="truncate">{item.path}</span>
                                    <span className="text-brand-primary font-bold group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HiddenArchive;
