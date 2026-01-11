import React from 'react';
import { SnakesPlayer } from '../hooks/useSnakesGame';

interface Props {
    tile: number;
    players: SnakesPlayer[];
    specialEvent?: string;
    onClose: () => void;
}

const TileDetailPopup: React.FC<Props> = ({ tile, players, specialEvent, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-gray-900/95 border border-white/10 rounded-3xl p-6 max-w-md w-[90%] shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black ${tile === 100 ? 'bg-yellow-500/30 text-yellow-400' :
                                tile === 1 ? 'bg-sky-500/30 text-sky-400' :
                                    specialEvent ? 'bg-purple-500/30 text-purple-400' :
                                        'bg-white/10 text-white'
                            }`}>
                            {tile === 100 ? '🏆' : tile}
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg">Tile #{tile}</h3>
                            <p className="text-gray-500 text-xs">
                                {tile === 100 ? 'Winner Tile' : tile === 1 ? 'Start Tile' : 'Game Tile'}
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
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-black">!</span>
                            <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider">Special Event</h4>
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
    );
};

export default TileDetailPopup;
