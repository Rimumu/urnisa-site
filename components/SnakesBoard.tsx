import React, { useMemo } from 'react';
import { SnakesPlayer, SnakesBoard as SnakesBoardType } from '../hooks/useSnakesGame';

interface Props {
    board: SnakesBoardType;
    players: SnakesPlayer[];
    highlightTile?: number;
    animatingPlayer?: string;
}

// Convert tile number (1-100) to grid coordinates
// Board is numbered bottom-left to top-right in a snake pattern
const tileToCoords = (tile: number): { row: number; col: number } => {
    if (tile < 1 || tile > 100) return { row: 9, col: 0 };

    const adjustedTile = tile - 1;
    const row = 9 - Math.floor(adjustedTile / 10); // 0 = top, 9 = bottom
    const colBase = adjustedTile % 10;
    // Alternate direction each row (snake pattern)
    const isRightToLeft = (9 - row) % 2 === 1;
    const col = isRightToLeft ? 9 - colBase : colBase;

    return { row, col };
};

const SnakesBoard: React.FC<Props> = ({ board, players, highlightTile, animatingPlayer }) => {
    // Create 10x10 grid with tile numbers
    const grid = useMemo(() => {
        const cells: number[][] = [];
        for (let row = 0; row < 10; row++) {
            const rowCells: number[] = [];
            for (let col = 0; col < 10; col++) {
                // Calculate tile number based on row and snake pattern
                const rowFromBottom = 9 - row;
                const isRightToLeft = rowFromBottom % 2 === 1;
                const tileInRow = isRightToLeft ? 9 - col : col;
                const tile = rowFromBottom * 10 + tileInRow + 1;
                rowCells.push(tile);
            }
            cells.push(rowCells);
        }
        return cells;
    }, []);

    // Group players by tile for stacking
    const playersByTile = useMemo(() => {
        const map: Record<number, SnakesPlayer[]> = {};
        players.forEach(p => {
            if (p.position > 0) {
                if (!map[p.position]) map[p.position] = [];
                map[p.position].push(p);
            }
        });
        return map;
    }, [players]);

    const getTileColor = (tile: number) => {
        const coords = tileToCoords(tile);
        const isEven = (coords.row + coords.col) % 2 === 0;

        // Special colors for snakes/ladders
        if (board.ladders[tile]) return 'bg-emerald-600/40 border-emerald-400/50';
        if (board.snakes[tile]) return 'bg-red-600/40 border-red-400/50';

        // Winner tile
        if (tile === 100) return 'bg-yellow-500/40 border-yellow-400/60';

        // Start tile
        if (tile === 1) return 'bg-blue-500/30 border-blue-400/40';

        return isEven ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5';
    };

    return (
        <div className="relative w-full max-w-[600px] aspect-square">
            {/* Grid */}
            <div className="grid grid-cols-10 gap-0.5 w-full h-full bg-black/50 p-1 rounded-2xl border border-white/10">
                {grid.map((row, rowIdx) => (
                    row.map((tile, colIdx) => {
                        const tilePlayers = playersByTile[tile] || [];
                        const isHighlight = tile === highlightTile;
                        const isLadderStart = !!board.ladders[tile];
                        const isSnakeStart = !!board.snakes[tile];

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className={`
                                    relative flex items-center justify-center
                                    border rounded-sm transition-all duration-300
                                    ${getTileColor(tile)}
                                    ${isHighlight ? 'ring-2 ring-brand-accent scale-105 z-10' : ''}
                                `}
                            >
                                {/* Tile Number */}
                                <span className={`
                                    absolute top-0.5 left-1 text-[8px] font-bold
                                    ${tile === 100 ? 'text-yellow-400' : 'text-white/40'}
                                `}>
                                    {tile}
                                </span>

                                {/* Ladder/Snake indicator */}
                                {isLadderStart && (
                                    <span className="absolute bottom-0.5 right-0.5 text-[10px]">🪜</span>
                                )}
                                {isSnakeStart && (
                                    <span className="absolute bottom-0.5 right-0.5 text-[10px]">🐍</span>
                                )}

                                {/* Players on this tile */}
                                {tilePlayers.length > 0 && (
                                    <div className="flex flex-wrap gap-0.5 items-center justify-center max-w-full p-0.5">
                                        {tilePlayers.slice(0, 4).map((player, idx) => (
                                            <div
                                                key={player._id}
                                                className={`
                                                    relative group
                                                    ${animatingPlayer === player.user ? 'animate-bounce' : ''}
                                                `}
                                                style={{ zIndex: 10 + idx }}
                                            >
                                                <img
                                                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.user)}&background=random`}
                                                    alt={player.user}
                                                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                                />
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                                    {player.user}
                                                </div>
                                            </div>
                                        ))}
                                        {tilePlayers.length > 4 && (
                                            <span className="text-[8px] text-white/60">+{tilePlayers.length - 4}</span>
                                        )}
                                    </div>
                                )}

                                {/* Winner celebration for tile 100 */}
                                {tile === 100 && (
                                    <span className="absolute text-lg">🏆</span>
                                )}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* Legend */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-emerald-600/40 rounded border border-emerald-400/50"></span>
                    <span className="text-white/60">Ladder</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-3 h-3 bg-red-600/40 rounded border border-red-400/50"></span>
                    <span className="text-white/60">Snake</span>
                </div>
            </div>
        </div>
    );
};

export default SnakesBoard;
