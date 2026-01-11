import React, { useMemo } from 'react';
import { SnakesPlayer, SnakesBoard } from '../hooks/useSnakesGame';

interface Props {
    tile: number;
    players: SnakesPlayer[];
    specialEvent?: string;
    board?: SnakesBoard;
    onClose: () => void;
}

const TileDetailPopup: React.FC<Props> = ({ tile, players, specialEvent, board, onClose }) => {

    // Determine tile type
    const tileType = useMemo(() => {
        if (!board) return 'normal';
        if (board.snakes[tile]) return 'snake';
        if (board.ladders[tile]) return 'ladder';
        return 'normal';
    }, [board, tile]);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-[#2a0f13]/95 to-[#120507]/95 border border-brand-accent/30 rounded-3xl p-6 max-w-md w-[90%] shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative background pattern */}
                <div className="absolute top-0 right-0 w-full h-full bg-[url('/rose-pattern.png')] opcode-5 pointer-events-none mix-blend-overlay"></div>

                {/* Content wrapper to ensure z-index above background */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${tile === 100 ? 'bg-yellow-500/30 text-yellow-400' :
                                tile === 1 ? 'bg-sky-500/30 text-sky-400' :
                                    tileType === 'snake' ? 'bg-red-500/30 text-red-400' :
                                        tileType === 'ladder' ? 'bg-emerald-500/30 text-emerald-400' :
                                            specialEvent ? 'bg-purple-500/30 text-purple-400' :
                                                'bg-white/10 text-white'
                                }`}>
                                {tile === 100 ? '🏆' : tileType === 'snake' ? '🐍' : tileType === 'ladder' ? '🪜' : tile}
                            </div>
                            <div>
                                <h3 className="text-white font-black text-lg">Tile #{tile}</h3>
                                <p className="text-gray-500 text-xs">
                                    {tile === 100 ? 'Winner Tile' :
                                        tile === 1 ? 'Start Tile' :
                                            tileType === 'snake' ? 'Snake Tile' :
                                                tileType === 'ladder' ? 'Ladder Tile' :
                                                    specialEvent ? 'Special Tile' :
                                                        'Game Tile'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-colors flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>

                    {/* Special Event Section */}
                    {specialEvent && (
                        <div className={`mb-6 p-4 rounded-2xl border ${tileType === 'snake' ? 'bg-red-500/10 border-red-500/30' :
                            tileType === 'ladder' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                'bg-purple-500/10 border-purple-500/30'
                            }`}>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-black ${tileType === 'snake' ? 'bg-red-500' :
                                    tileType === 'ladder' ? 'bg-emerald-500' :
                                        'bg-purple-500'
                                    }`}>!</span>
                                <h4 className={`font-bold text-sm uppercase tracking-wider ${tileType === 'snake' ? 'text-red-400' :
                                    tileType === 'ladder' ? 'text-emerald-400' :
                                        'text-purple-400'
                                    }`}>
                                    {tileType === 'snake' ? 'SNAKE TILE' :
                                        tileType === 'ladder' ? 'LADDER TILE' :
                                            'SPECIAL TILE'}
                                </h4>
                            </div>
                            <p className="text-white text-sm leading-relaxed">{specialEvent}</p>
                        </div>
                    )}

                    {/* Players Section */}
                    <div>
                        <h4 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-3">
                            Players on this tile ({players.length})
                        </h4>
                        {players.length > 0 ? (
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {players.map((player) => (
                                    <div
                                        key={player._id}
                                        className="flex items-center gap-3 p-2 bg-white/5 rounded-xl"
                                    >
                                        <img
                                            src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.user)}&background=random`}
                                            alt={player.user}
                                            className="w-8 h-8 rounded-full border border-white/20"
                                        />
                                        <span className="text-white font-bold text-sm">{player.user}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4 italic">No players here</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TileDetailPopup;
