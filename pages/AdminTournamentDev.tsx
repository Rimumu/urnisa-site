
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../constants';

interface TournamentMatch {
    id: string;
    bracketGroup: 'winners' | 'losers' | 'finals';
    round: number;
    matchIndex: number;
    player1: string | null;
    player2: string | null;
    winner: string | null;
    score: string;
    status: string;
    nextMatchId: string | null;
    loserNextMatchId?: string | null;
}

interface TournamentPlayer {
    discordId: string;
    minecraftUsername: string;
    isLocked: boolean;
    isDev: boolean;
}

const CARD_WIDTH = 260;
const CARD_HEIGHT = 100;
const X_GAP = 60;
const Y_GAP = 20;
const GROUP_Y_GAP = 100;

// Bracket Card Component
const BracketMatchCard: React.FC<{ 
    match: TournamentMatch; 
    style: React.CSSProperties;
    onEdit?: (m: TournamentMatch) => void; 
    onResult?: (id: string, p: string, s: string) => void 
}> = ({ match, style, onEdit, onResult }) => {
    const scoreObj = useMemo(() => {
        if (!match.score) return { p1: '', p2: '' };
        const parts = match.score.match(/^(\d+)\s*[-:,\s]\s*(\d+)$/);
        if (parts) return { p1: parts[1], p2: parts[2] };
        return { p1: '', p2: '' };
    }, [match.score]);

    const isP1Winner = match.winner === match.player1 && match.winner;
    const isP2Winner = match.winner === match.player2 && match.winner;

    return (
        <div 
            style={{ ...style, width: CARD_WIDTH, height: CARD_HEIGHT }} 
            className={`
                absolute flex flex-col bg-[#120507] border-2 rounded-xl overflow-hidden shadow-xl z-10 transition-colors group
                ${match.status === 'COMPLETED' ? 'border-brand-primary/60' : 'border-white/10'}
            `}
        >
            <div className="bg-black/40 px-3 py-1 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                <span>{match.id}</span>
                <span className={match.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-500'}>{match.status}</span>
            </div>
            
            <div 
                className={`flex-1 flex items-center justify-between px-3 cursor-pointer hover:bg-white/5 transition-colors ${isP1Winner ? 'bg-brand-primary/10' : ''}`}
                onClick={() => onResult && match.player1 && onResult(match.id, match.player1, match.score || "1-0")}
            >
                <span className={`text-sm font-bold truncate ${isP1Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                    {match.player1 || <span className="text-gray-600 italic">TBD</span>}
                </span>
                {scoreObj.p1 && <span className="font-mono font-bold bg-black/40 px-1.5 rounded text-xs">{scoreObj.p1}</span>}
            </div>
            <div className="h-px bg-white/5"></div>
            <div 
                className={`flex-1 flex items-center justify-between px-3 cursor-pointer hover:bg-white/5 transition-colors ${isP2Winner ? 'bg-brand-primary/10' : ''}`}
                onClick={() => onResult && match.player2 && onResult(match.id, match.player2, match.score || "0-1")}
            >
                <span className={`text-sm font-bold truncate ${isP2Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                    {match.player2 || <span className="text-gray-600 italic">TBD</span>}
                </span>
                {scoreObj.p2 && <span className="font-mono font-bold bg-black/40 px-1.5 rounded text-xs">{scoreObj.p2}</span>}
            </div>

            {onEdit && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(match); }}
                    className="absolute top-1 right-1 p-1 bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>
                </button>
            )}
        </div>
    );
};

// Bracket View Engine
const BracketView: React.FC<{ matches: TournamentMatch[], onEdit: any, onResult: any }> = ({ matches, onEdit, onResult }) => {
    const { nodes, connections, totalWidth, totalHeight } = useMemo(() => {
        const _nodes: { match: TournamentMatch, x: number, y: number }[] = [];
        const _connections: { x1: number, y1: number, x2: number, y2: number, type: 'win' | 'lose' }[] = [];
        const positions = new Map<string, {x:number, y:number}>();

        const winners = matches.filter(m => m.bracketGroup === 'winners').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const losers = matches.filter(m => m.bracketGroup === 'losers').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const finals = matches.filter(m => m.bracketGroup === 'finals');

        // 1. Winners Layout
        let maxWinnerY = 0;
        const winnerRounds = Math.max(...winners.map(m => m.round), 0);
        
        for (let r = 1; r <= winnerRounds; r++) {
            const roundMatches = winners.filter(m => m.round === r);
            roundMatches.forEach((m, idx) => {
                const x = (r - 1) * (CARD_WIDTH + X_GAP);
                let y = 0;
                if (r === 1) {
                    y = idx * (CARD_HEIGHT + Y_GAP);
                } else {
                    const feeders = winners.filter(prev => prev.round === r - 1 && prev.nextMatchId === m.id);
                    if (feeders.length > 0) {
                        const ySum = feeders.reduce((acc, f) => acc + (positions.get(f.id)?.y || 0), 0);
                        y = ySum / feeders.length;
                    } else {
                        y = idx * (CARD_HEIGHT + Y_GAP); 
                    }
                }
                positions.set(m.id, { x, y });
                _nodes.push({ match: m, x, y });
                maxWinnerY = Math.max(maxWinnerY, y + CARD_HEIGHT);
            });
        }

        // 2. Losers Layout
        let losersStartY = maxWinnerY + GROUP_Y_GAP;
        const loserRounds = Math.max(...losers.map(m => m.round), 0);

        for (let r = 1; r <= loserRounds; r++) {
            const roundMatches = losers.filter(m => m.round === r);
            roundMatches.forEach((m, idx) => {
                const x = (r - 1) * (CARD_WIDTH + X_GAP);
                let y = 0;
                const feeders = losers.filter(prev => prev.round === r - 1 && prev.nextMatchId === m.id);
                
                if (r === 1 || feeders.length === 0) {
                    y = losersStartY + idx * (CARD_HEIGHT + Y_GAP);
                } else {
                     const ySum = feeders.reduce((acc, f) => acc + (positions.get(f.id)?.y || 0), 0);
                     y = ySum / feeders.length;
                }
                positions.set(m.id, { x, y });
                _nodes.push({ match: m, x, y });
            });
        }

        // 3. Finals Layout
        if (finals.length > 0) {
            const finalX = (winnerRounds) * (CARD_WIDTH + X_GAP);
            const wbFinal = winners.find(m => m.round === winnerRounds);
            const finalY = positions.get(wbFinal?.id || '')?.y || 0;
            
            finals.forEach((m, idx) => {
                const x = finalX + (idx * 50);
                const y = finalY;
                positions.set(m.id, { x, y });
                _nodes.push({ match: m, x, y });
            });
        }

        // 4. Connections
        matches.forEach(m => {
            const start = positions.get(m.id);
            if (!start) return;

            if (m.nextMatchId) {
                const end = positions.get(m.nextMatchId);
                if (end) {
                    _connections.push({ x1: start.x + CARD_WIDTH, y1: start.y + CARD_HEIGHT/2, x2: end.x, y2: end.y + CARD_HEIGHT/2, type: 'win' });
                }
            }
            if (m.loserNextMatchId) {
                const end = positions.get(m.loserNextMatchId);
                if (end) {
                    _connections.push({ x1: start.x + CARD_WIDTH/2, y1: start.y + CARD_HEIGHT, x2: end.x, y2: end.y + CARD_HEIGHT/2, type: 'lose' });
                }
            }
        });

        // Calc Dimensions
        let maxX = 0;
        let maxY = 0;
        _nodes.forEach(n => {
            maxX = Math.max(maxX, n.x + CARD_WIDTH);
            maxY = Math.max(maxY, n.y + CARD_HEIGHT);
        });

        return { nodes: _nodes, connections: _connections, totalWidth: maxX + 100, totalHeight: maxY + 100 };
    }, [matches]);

    return (
        <div className="relative w-full h-full overflow-auto custom-scrollbar bg-black/20 rounded-xl border border-white/5">
            <div style={{ width: totalWidth, height: totalHeight, position: 'relative' }}>
                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    {connections.map((c, i) => {
                        const midX = (c.x1 + c.x2) / 2;
                        // Use S-curve for better look
                        const path = `M ${c.x1} ${c.y1} C ${midX} ${c.y1}, ${midX} ${c.y2}, ${c.x2} ${c.y2}`;
                        return (
                            <path 
                                key={i} 
                                d={path} 
                                stroke={c.type === 'lose' ? '#e5383b' : '#555'} 
                                strokeWidth="2" 
                                fill="none" 
                                strokeDasharray={c.type === 'lose' ? "5,5" : "0"}
                                opacity={c.type === 'lose' ? 0.4 : 0.6}
                            />
                        );
                    })}
                </svg>
                {nodes.map(n => (
                    <BracketMatchCard key={n.match.id} match={n.match} style={{ left: n.x, top: n.y }} onEdit={onEdit} onResult={onResult} />
                ))}
                
                {/* Labels */}
                <div className="absolute top-4 left-4 text-xs font-black uppercase tracking-widest text-brand-primary opacity-50 pointer-events-none">Winners Bracket</div>
                {nodes.some(n => n.match.bracketGroup === 'losers') && (
                    <div 
                        className="absolute left-4 text-xs font-black uppercase tracking-widest text-red-500 opacity-50 pointer-events-none"
                        style={{ top: nodes.find(n => n.match.bracketGroup === 'losers')?.y ? nodes.find(n => n.match.bracketGroup === 'losers')!.y - 40 : 0 }}
                    >
                        Losers Bracket
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminTournamentDev: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Data State
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [allPlayers, setAllPlayers] = useState<TournamentPlayer[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [bracketType, setBracketType] = useState('SINGLE_ELIMINATION');
    const [dummyCount, setDummyCount] = useState(1);
    const [statusMsg, setStatusMsg] = useState('');
    
    // Edit Mode State
    const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
    const [editP1, setEditP1] = useState('');
    const [editP2, setEditP2] = useState('');
    const [editScore, setEditScore] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok && (await res.json()).success) {
                setIsAuthenticated(true);
                fetchPlayers();
            }
            else alert("Invalid password");
        } catch(e) { alert("Error connecting"); }
    };

    const fetchBracket = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dev/tournament/bracket`);
            if (res.ok) {
                const data = await res.json();
                setMatches(data.matches || []);
                setBracketType(data.type || 'SINGLE_ELIMINATION');
            }
        } catch(e) {}
    };

    const fetchPlayers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/tournament/all-players`, {
                headers: { Authorization: password }
            });
            if (res.ok) {
                setAllPlayers(await res.json());
            }
        } catch(e) {}
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBracket();
            const interval = setInterval(fetchBracket, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const apiCall = async (endpoint: string, body: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dev/tournament/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                setStatusMsg(data.message || "Success");
                fetchBracket();
                if (endpoint === 'inject-players') fetchPlayers();
            } else {
                setStatusMsg("Error: " + data.error);
            }
        } catch(e) {
            setStatusMsg("Network Error");
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleGenerate = () => {
        if (selectedParticipants.length < 2) {
            alert("Please select at least 2 participants!");
            return;
        }
        apiCall('generate', { type: bracketType, participants: selectedParticipants });
    };
    
    const handleClear = () => apiCall('clear', {});
    const handleInject = () => apiCall('inject-players', { count: dummyCount });
    
    const handleUpdateMatchResult = (matchId: string, winner: string, score: string) => {
        apiCall('match/update', { matchId, winner, score });
    };

    const handleSaveEdit = () => {
        if (!editingMatch) return;
        apiCall('match/update', { 
            matchId: editingMatch.id, 
            player1: editP1, 
            player2: editP2,
            score: editScore
        });
        setEditingMatch(null);
    };

    const openEditModal = (m: TournamentMatch) => {
        setEditingMatch(m);
        setEditP1(m.player1 || '');
        setEditP2(m.player2 || '');
        setEditScore(m.score || '');
    };

    // Pool Management
    const addToPool = (username: string) => {
        if (!selectedParticipants.includes(username)) {
            setSelectedParticipants([...selectedParticipants, username]);
        }
    };

    const removeFromPool = (username: string) => {
        setSelectedParticipants(selectedParticipants.filter(p => p !== username));
    };

    const shufflePool = () => {
        const shuffled = [...selectedParticipants].sort(() => Math.random() - 0.5);
        setSelectedParticipants(shuffled);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <form onSubmit={handleLogin} className="bg-black/40 p-8 rounded-2xl border border-white/10">
                    <h2 className="text-xl text-white font-bold mb-4">Admin Login</h2>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 text-white rounded mb-4" />
                    <button type="submit" className="w-full bg-brand-primary p-2 rounded font-bold text-white">Login</button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 text-white font-sans space-y-8 relative">
            <h1 className="text-4xl font-black text-brand-primary">Tournament Admin Panel</h1>
            
            {statusMsg && <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 animate-bounce">{statusMsg}</div>}

            {/* EDIT MODAL */}
            {editingMatch && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a0b0e] p-6 rounded-2xl border border-white/10 w-full max-w-sm space-y-4">
                        <h3 className="font-bold text-xl text-white">Edit Match {editingMatch.id}</h3>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Player 1</label>
                            <input type="text" value={editP1} onChange={e => setEditP1(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Player 2</label>
                            <input type="text" value={editP2} onChange={e => setEditP2(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Score</label>
                            <input type="text" value={editScore} onChange={e => setEditScore(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded text-white" />
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button onClick={handleSaveEdit} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded">Save</button>
                            <button onClick={() => setEditingMatch(null)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* 1. PLAYER POOL SELECTION */}
                <div className="lg:col-span-1 bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col h-[800px]">
                    <h3 className="font-bold text-xl border-b border-white/10 pb-2 mb-4">Player Selection</h3>
                    
                    <div className="flex-1 overflow-hidden flex flex-col mb-4 min-h-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase">Available ({allPlayers.length})</h4>
                            <button onClick={fetchPlayers} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Refresh</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-2 space-y-1">
                            {allPlayers.map(p => {
                                const isSelected = selectedParticipants.includes(p.minecraftUsername);
                                return (
                                    <div key={p.discordId} className={`flex justify-between items-center p-2 rounded ${isSelected ? 'bg-green-900/30 opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                                        <span className="font-bold text-sm truncate">{p.minecraftUsername}</span>
                                        {!isSelected && <button onClick={() => addToPool(p.minecraftUsername)} className="text-green-400 font-bold px-2 text-lg">+</button>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-4 flex gap-2 items-center mb-4">
                        <input type="number" value={dummyCount} onChange={e => setDummyCount(parseInt(e.target.value))} className="bg-black/40 border border-white/10 p-1 rounded text-white w-16 text-sm" min="1" />
                        <button onClick={handleInject} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 rounded text-xs">Inject Dummies</button>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-brand-primary uppercase">Participants ({selectedParticipants.length})</h4>
                            <button onClick={shufflePool} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded hover:bg-brand-primary/40 font-bold">Shuffle</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-brand-primary/30 rounded bg-black/20 p-2 space-y-1">
                            {selectedParticipants.map((name, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded bg-brand-primary/10 border border-brand-primary/20 group">
                                    <span className="font-mono text-xs text-gray-400 mr-2 w-4">{idx+1}.</span>
                                    <span className="font-bold text-sm flex-1 truncate">{name}</span>
                                    <button onClick={() => removeFromPool(name)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button onClick={handleGenerate} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-sm shadow-lg">GENERATE</button>
                    </div>
                </div>

                {/* 2. BRACKET VIEW */}
                <div className="lg:col-span-3 bg-black/40 p-6 rounded-2xl border border-white/10 h-[800px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 z-20 relative bg-[#1a0b0e]/80 backdrop-blur-sm px-4 rounded-xl">
                        <h3 className="font-bold text-xl text-white">Live Bracket View</h3>
                        <div className="flex gap-4">
                            <select value={bracketType} onChange={e => setBracketType(e.target.value)} className="bg-black/40 border border-white/10 p-2 rounded text-white text-sm">
                                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                            </select>
                            <button onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-sm">CLEAR ALL</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative rounded-xl border border-white/5">
                        {matches.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 italic">No bracket generated.</div>
                        ) : (
                            <BracketView matches={matches} onEdit={openEditModal} onResult={handleUpdateMatchResult} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTournamentDev;
