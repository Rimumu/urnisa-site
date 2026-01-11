import React, { useMemo } from 'react';
import { SnakesPlayer, SnakesBoard as SnakesBoardType } from '../hooks/useSnakesGame';

interface Props {
    board: SnakesBoardType;
    players: SnakesPlayer[];
    highlightTile?: number;
    animatingPlayer?: string;
}

// Convert tile number (1-100) to grid coordinates (0-9 for row and col)
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

// Convert tile to percentage position for SVG overlay
const tileToPercent = (tile: number): { x: number; y: number } => {
    const { row, col } = tileToCoords(tile);
    // Center of each tile (each tile is 10% of the board)
    return {
        x: col * 10 + 5,
        y: row * 10 + 5
    };
};

const SnakesBoard: React.FC<Props> = ({ board, players, highlightTile, animatingPlayer }) => {
    // Create 10x10 grid with tile numbers
    const grid = useMemo(() => {
        const cells: number[][] = [];
        for (let row = 0; row < 10; row++) {
            const rowCells: number[] = [];
            for (let col = 0; col < 10; col++) {
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

        // Winner tile
        if (tile === 100) return 'bg-yellow-500/50 border-yellow-400/70';
        // Start tile
        if (tile === 1) return 'bg-sky-400/40 border-sky-300/50';

        // Alternating rose pink and cream/gold colors
        return isEven
            ? 'bg-rose-900/40 border-rose-700/30'
            : 'bg-amber-100/10 border-amber-200/20';
    };

    // Generate ladder paths
    const ladderPaths = useMemo(() => {
        return Object.entries(board.ladders).map(([from, to]) => {
            const start = tileToPercent(parseInt(from));
            const end = tileToPercent(to as number);
            return { from: parseInt(from), to: to as number, start, end };
        });
    }, [board.ladders]);

    // Generate snake paths
    const snakePaths = useMemo(() => {
        return Object.entries(board.snakes).map(([from, to]) => {
            const start = tileToPercent(parseInt(from));
            const end = tileToPercent(to as number);
            return { from: parseInt(from), to: to as number, start, end };
        });
    }, [board.snakes]);

    return (
        <div className="relative w-full max-w-[600px] aspect-square">
            {/* Grid Container */}
            <div className="grid grid-cols-10 gap-0 w-full h-full bg-rose-950/60 p-0 rounded-2xl border border-rose-800/30 overflow-hidden">
                {grid.map((row, rowIdx) => (
                    row.map((tile, colIdx) => {
                        const isHighlight = tile === highlightTile;

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                className={`
                                    relative aspect-square
                                    border-[0.5px] transition-all duration-300
                                    ${getTileColor(tile)}
                                    ${isHighlight ? 'ring-2 ring-brand-accent z-20' : ''}
                                `}
                            >
                                {/* Winner icon for tile 100 */}
                                {tile === 100 && (
                                    <span className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none z-10">🏆</span>
                                )}
                            </div>
                        );
                    })
                ))}
            </div>

            {/* SVG Overlay for Snakes and Ladders */}
            <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Ladder gradient */}
                    <linearGradient id="ladderGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Snake gradient */}
                    <linearGradient id="snakeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                        <stop offset="50%" stopColor="#dc2626" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.9" />
                    </linearGradient>
                    {/* Snake head marker */}
                    <marker id="snakeHead" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
                        <circle cx="2" cy="2" r="1.5" fill="#ef4444" />
                    </marker>
                </defs>

                {/* Ladders */}
                {ladderPaths.map(({ from, to, start, end }) => {
                    // Draw ladder with two rails and rungs
                    const dx = end.x - start.x;
                    const dy = end.y - start.y;
                    const len = Math.sqrt(dx * dx + dy * dy);

                    // Width between the two rails (wider = more visible rungs)
                    const railWidth = 2.0;
                    let perpX: number, perpY: number;

                    if (len < 0.001) {
                        // Essentially same point, use default horizontal offset
                        perpX = railWidth;
                        perpY = 0;
                    } else {
                        // Perpendicular vector (rotated 90 degrees from the ladder direction)
                        perpX = (-dy / len) * railWidth;
                        perpY = (dx / len) * railWidth;
                    }

                    // Number of rungs based on distance
                    const numRungs = Math.max(4, Math.floor(len / 5));
                    const rungs = [];
                    for (let i = 0; i <= numRungs; i++) {
                        const t = i / numRungs;
                        const rx = start.x + dx * t;
                        const ry = start.y + dy * t;
                        rungs.push(
                            <line
                                key={`rung-${from}-${i}`}
                                x1={rx - perpX}
                                y1={ry - perpY}
                                x2={rx + perpX}
                                y2={ry + perpY}
                                stroke="#a7f3d0"
                                strokeWidth="0.8"
                                strokeLinecap="round"
                            />
                        );
                    }

                    return (
                        <g key={`ladder-${from}`}>
                            {/* Left rail */}
                            <line
                                x1={start.x - perpX}
                                y1={start.y - perpY}
                                x2={end.x - perpX}
                                y2={end.y - perpY}
                                stroke="#10b981"
                                strokeWidth="1.0"
                                strokeLinecap="round"
                            />
                            {/* Right rail */}
                            <line
                                x1={start.x + perpX}
                                y1={start.y + perpY}
                                x2={end.x + perpX}
                                y2={end.y + perpY}
                                stroke="#10b981"
                                strokeWidth="1.0"
                                strokeLinecap="round"
                            />
                            {/* Rungs */}
                            {rungs}
                        </g>
                    );
                })}

                {/* Snakes */}
                {snakePaths.map(({ from, to, start, end }) => {
                    // Create a curved snake path
                    const midX = (start.x + end.x) / 2;
                    const midY = (start.y + end.y) / 2;
                    // Add some curve
                    const dx = end.x - start.x;
                    const offset = dx > 0 ? 8 : -8;
                    const ctrl1X = start.x + dx * 0.25 + offset;
                    const ctrl1Y = start.y + (end.y - start.y) * 0.25 - 5;
                    const ctrl2X = start.x + dx * 0.75 - offset;
                    const ctrl2Y = start.y + (end.y - start.y) * 0.75 + 5;

                    return (
                        <g key={`snake-${from}`}>
                            {/* Snake body - main curve */}
                            <path
                                d={`M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`}
                                fill="none"
                                stroke="url(#snakeGradient)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                            {/* Snake body - thinner highlight */}
                            <path
                                d={`M ${start.x} ${start.y} C ${ctrl1X} ${ctrl1Y}, ${ctrl2X} ${ctrl2Y}, ${end.x} ${end.y}`}
                                fill="none"
                                stroke="#fca5a5"
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                strokeDasharray="0.5 1"
                            />
                            {/* Snake head */}
                            <circle cx={start.x} cy={start.y} r="1.8" fill="#ef4444" stroke="#fca5a5" strokeWidth="0.3" />
                            {/* Snake eyes */}
                            <circle cx={start.x - 0.5} cy={start.y - 0.3} r="0.4" fill="#fff" />
                            <circle cx={start.x + 0.5} cy={start.y - 0.3} r="0.4" fill="#fff" />
                            <circle cx={start.x - 0.5} cy={start.y - 0.3} r="0.2" fill="#000" />
                            <circle cx={start.x + 0.5} cy={start.y - 0.3} r="0.2" fill="#000" />
                            {/* Snake tail */}
                            <circle cx={end.x} cy={end.y} r="0.8" fill="#b91c1c" />
                        </g>
                    );
                })}
            </svg>

            {/* Tile Numbers Overlay - Above snakes/ladders */}
            <div className="absolute inset-0 pointer-events-none z-20">
                {grid.map((row, rowIdx) => (
                    row.map((tile, colIdx) => {
                        const { row: r, col: c } = tileToCoords(tile);
                        return (
                            <div
                                key={`num-${tile}`}
                                className="absolute"
                                style={{
                                    left: `${c * 10}%`,
                                    top: `${r * 10}%`,
                                    width: '10%',
                                    height: '10%',
                                }}
                            >
                                <span className={`
                                    absolute top-0.5 left-1 text-[8px] font-bold pointer-events-none select-none
                                    ${tile === 100 ? 'text-yellow-400' : 'text-white'}
                                `}>
                                    {tile}
                                </span>
                            </div>
                        );
                    })
                ))}
            </div>

            {/* Players Overlay - Positioned absolutely over tiles */}
            <div className="absolute inset-0 pointer-events-none z-30">
                {Object.entries(playersByTile).map(([tileStr, tilePlayers]) => {
                    const tile = parseInt(tileStr);
                    const { row, col } = tileToCoords(tile);
                    const players = tilePlayers as SnakesPlayer[];

                    return (
                        <div
                            key={`players-${tile}`}
                            className="absolute flex flex-wrap items-center justify-center gap-0.5 pointer-events-auto"
                            style={{
                                left: `${col * 10}%`,
                                top: `${row * 10}%`,
                                width: '10%',
                                height: '10%',
                            }}
                        >
                            {players.slice(0, 4).map((player, idx) => (
                                <div
                                    key={player._id}
                                    className={`
                                        relative group
                                        ${animatingPlayer === player.user ? 'animate-bounce' : ''}
                                    `}
                                    style={{ zIndex: 30 + idx }}
                                >
                                    <img
                                        src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.user)}&background=random`}
                                        alt={player.user}
                                        className="w-5 h-5 rounded-full border-2 border-white shadow-lg"
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/90 text-white text-[10px] font-bold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                        {player.user}
                                    </div>
                                </div>
                            ))}
                            {players.length > 4 && (
                                <span className="text-[8px] text-white font-bold bg-black/60 px-1 rounded">+{players.length - 4}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                    <svg width="20" height="12" viewBox="0 0 20 12">
                        <line x1="2" y1="10" x2="18" y2="2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                        <line x1="4" y1="10" x2="20" y2="2" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-white/60">Ladder (Up)</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg width="20" height="12" viewBox="0 0 20 12">
                        <path d="M2 2 Q 10 6 18 10" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="2" cy="2" r="2" fill="#ef4444" />
                    </svg>
                    <span className="text-white/60">Snake (Down)</span>
                </div>
            </div>
        </div>
    );
};

export default SnakesBoard;
