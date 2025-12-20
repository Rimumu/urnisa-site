
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../constants';

interface TournamentMatch {
    id: string;
    round: number;
    matchIndex: number;
    player1: string | null;
    player2: string | null;
    winner: string | null;
    score: string;
    status: string;
    nextMatchId: string | null;
}

interface TournamentPlayer {
    discordId: string;
    minecraftUsername: string;
    isLocked: boolean;
    isDev: boolean;
}

const BracketMatchCard: React.FC<{ 
    match: TournamentMatch; 
    onEdit: (m: TournamentMatch) => void; 
    onResult: (id: string, p: string, s: string) => void 
}> = ({ match, onEdit, onResult }) => {
    // Parse Score
    const scoreObj = useMemo(() => {
        if (!match.score) return { p1: '', p2: '', raw: '' };
        const parts = match.score.match(/^(\d+)\s*[-:,\s]\s*(\d+)$/);
        if (parts) return { p1: parts[1], p2: parts[2], raw: '' };
        return { p1: '', p2: '', raw: match.score };
    }, [match.score]);

    const isP1Winner = match.winner === match.player1 && match.winner;
    const isP2Winner = match.winner === match.player2 && match.winner;

    return (
        <div className="relative group w-64 z-10">
            <div className={`
                bg-[#120507] border-2 rounded-xl overflow-hidden shadow-xl transition-all duration-300
                ${match.status === 'COMPLETED' ? 'border-brand-primary/60 shadow-brand-primary/10' : 'border-white/10'}
                hover:border-white/30
            `}>
                {/* Header */}
                <div className="bg-black/40 px-3 py-1.5 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <span>{match.id}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${match.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-500'}`}>
                        {match.status === 'COMPLETED' ? 'Finished' : match.status}
                    </span>
                </div>

                {/* Content */}
                <div className="flex flex-col">
                    {/* Player 1 */}
                    <div 
                        className={`px-3 py-2.5 flex items-center justify-between border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${isP1Winner ? 'bg-brand-primary/10' : ''}`}
                        onClick={() => match.player1 && onResult(match.id, match.player1, match.score || "1-0")}
                        title="Click to set as winner"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-sm font-bold truncate ${isP1Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                                {match.player1 || <span className="text-gray-600 italic">TBD</span>}
                            </span>
                            {scoreObj.p1 && (
                                <span className={`
                                    flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/10 
                                    text-xs font-bold font-mono shrink-0 shadow-inner
                                    ${isP1Winner ? 'text-brand-primary border-brand-primary/30' : 'text-gray-400'}
                                `}>
                                    {scoreObj.p1}
                                </span>
                            )}
                        </div>
                        {isP1Winner && <span className="text-sm shrink-0 ml-2">👑</span>}
                    </div>

                    {/* Player 2 */}
                    <div 
                        className={`px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isP2Winner ? 'bg-brand-primary/10' : ''}`}
                        onClick={() => match.player2 && onResult(match.id, match.player2, match.score || "0-1")}
                        title="Click to set as winner"
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`text-sm font-bold truncate ${isP2Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                                {match.player2 || <span className="text-gray-600 italic">TBD</span>}
                            </span>
                            {scoreObj.p2 && (
                                <span className={`
                                    flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/10 
                                    text-xs font-bold font-mono shrink-0 shadow-inner
                                    ${isP2Winner ? 'text-brand-primary border-brand-primary/30' : 'text-gray-400'}
                                `}>
                                    {scoreObj.p2}
                                </span>
                            )}
                        </div>
                        {isP2Winner && <span className="text-sm shrink-0 ml-2">👑</span>}
                    </div>
                </div>

                {/* Raw Score Fallback */}
                {scoreObj.raw && (
                    <div className="bg-black/60 py-1 text-center border-t border-white/5">
                        <span className="text-[10px] font-mono font-bold text-gray-400">{scoreObj.raw}</span>
                    </div>
                )}
            </div>

            {/* Edit Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(match); }}
                className="absolute -top-2 -right-2 bg-gray-700 hover:bg-white text-white hover:text-black p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 scale-75 hover:scale-100"
                title="Edit Match Details"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </button>
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
    
    const [bracketType, setBracketType] = useState('SINGLE');
    const [dummyCount, setDummyCount] = useState(1);
    const [statusMsg, setStatusMsg] = useState('');
    
    // Edit Mode State for Matchups
    const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
    const [editP1, setEditP1] = useState('');
    const [editP2, setEditP2] = useState('');
    const [editScore, setEditScore] = useState('');

    // --- ZOOM & PAN STATE ---
    const [zoomScale, setZoomScale] = useState(1);
    const [panPos, setPanPos] = useState({ x: 50, y: 50 }); // Initial padding
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

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
                setBracketType(data.type || 'SINGLE');
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

    // Pool Management Helpers
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

    // --- ZOOM & PAN HANDLERS ---
    const handleWheel = (e: React.WheelEvent) => {
        // e.preventDefault(); 
        const zoomSensitivity = 0.001;
        const delta = -e.deltaY * zoomSensitivity; 
        const newScale = Math.min(Math.max(0.2, zoomScale + delta), 3);

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom towards mouse pointer
        const newX = mouseX - (mouseX - panPos.x) * (newScale / zoomScale);
        const newY = mouseY - (mouseY - panPos.y) * (newScale / zoomScale);

        setZoomScale(newScale);
        setPanPos({ x: newX, y: newY });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if(matches.length === 0) return;
        // Only start dragging if left click (button 0)
        if(e.button !== 0) return;
        
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
        e.preventDefault(); 
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        setPanPos(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // --- BRACKET RENDERING LOGIC ---
    const rounds = useMemo(() => {
        const grouped: Record<number, TournamentMatch[]> = {};
        if (!matches || matches.length === 0) return grouped;
        
        matches.forEach(m => {
            if (!grouped[m.round]) grouped[m.round] = [];
            grouped[m.round].push(m);
        });
        
        // Sort within rounds
        Object.keys(grouped).forEach(r => {
            grouped[Number(r)].sort((a,b) => a.matchIndex - b.matchIndex);
        });
        return grouped;
    }, [matches]);

    const roundKeys = Object.keys(rounds).map(Number).sort((a,b) => a-b);

    // Calculate layout metrics
    // Increased Height to accommodate new layout comfortably
    const CARD_HEIGHT = 120; 
    const VERTICAL_GAP = 20;
    const CARD_TOTAL_H = CARD_HEIGHT + VERTICAL_GAP;

    const getMatchOffset = (round: number, index: number): number => {
        if (round === 1) {
            return index * CARD_TOTAL_H;
        }
        // Recursive center alignment logic
        const prevRound = round - 1;
        const src1 = getMatchOffset(prevRound, index * 2);
        const src2 = getMatchOffset(prevRound, index * 2 + 1);
        
        return (src1 + src2) / 2;
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
                            <label className="text-xs text-gray-500 uppercase font-bold">Score (e.g. 3-1)</label>
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
                
                {/* 1. PLAYER POOL SELECTION (Left Sidebar) */}
                <div className="lg:col-span-1 bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col h-[800px]">
                    <h3 className="font-bold text-xl border-b border-white/10 pb-2 mb-4">Player Selection</h3>
                    
                    {/* Available Players */}
                    <div className="flex-1 overflow-hidden flex flex-col mb-4 min-h-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase">Available Players ({allPlayers.length})</h4>
                            <button onClick={fetchPlayers} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Refresh</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-2 space-y-1">
                            {allPlayers.map(p => {
                                const isSelected = selectedParticipants.includes(p.minecraftUsername);
                                return (
                                    <div key={p.discordId} className={`flex justify-between items-center p-2 rounded ${isSelected ? 'bg-green-900/30 opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-bold text-sm truncate">{p.minecraftUsername}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {p.isDev ? 'DEV' : 'USER'} • {p.isLocked ? 'LOCKED' : 'DRAFT'}
                                            </span>
                                        </div>
                                        {!isSelected && (
                                            <button onClick={() => addToPool(p.minecraftUsername)} className="text-green-400 hover:text-green-300 font-bold px-2 text-lg">+</button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Injector */}
                    <div className="border-t border-white/10 pt-4 flex gap-2 items-center mb-4">
                        <input type="number" value={dummyCount} onChange={e => setDummyCount(parseInt(e.target.value))} className="bg-black/40 border border-white/10 p-1 rounded text-white w-16 text-sm" min="1" />
                        <button onClick={handleInject} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-1 px-3 rounded text-xs">Inject Dummies</button>
                    </div>

                    {/* Selected Participants */}
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
                                    <button onClick={() => removeFromPool(name)} className="text-red-400 hover:text-red-300 font-bold px-2 opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                </div>
                            ))}
                            {selectedParticipants.length === 0 && <div className="text-center text-gray-500 text-xs py-4">No participants selected</div>}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10">
                        <button onClick={handleGenerate} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-sm shadow-lg">
                            GENERATE BRACKET
                        </button>
                    </div>
                </div>

                {/* 2. BRACKET VIEW (Main Area) */}
                <div className="lg:col-span-3 bg-black/40 p-6 rounded-2xl border border-white/10 h-[800px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 z-20 relative bg-[#1a0b0e]/80 backdrop-blur-sm px-4 rounded-xl">
                        <h3 className="font-bold text-xl text-white">Live Bracket View</h3>
                        <div className="flex gap-4">
                            <select value={bracketType} onChange={e => setBracketType(e.target.value)} className="bg-black/40 border border-white/10 p-2 rounded text-white text-sm">
                                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                            </select>
                            <button onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors">CLEAR ALL</button>
                        </div>
                    </div>

                    <div 
                        className="flex-1 overflow-hidden relative cursor-move bg-[#1a0b0e]/50 select-none rounded-xl border border-white/5"
                        ref={containerRef}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Control Indicator */}
                        <div className="absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs text-gray-300 flex items-center gap-3 pointer-events-none shadow-xl">
                            <span className="text-xl">🔍</span>
                            <div className="flex flex-col gap-0.5">
                                <div className="font-bold text-white">Interactive Map</div>
                                <div className="text-[10px] text-gray-400">Scroll to Zoom • Drag to Pan</div>
                            </div>
                        </div>

                        {matches.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500 italic pointer-events-none">
                                No bracket generated yet. Select players and click Generate.
                            </div>
                        ) : (
                            <div 
                                style={{ 
                                    transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`, 
                                    transformOrigin: '0 0',
                                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                                }}
                                className="w-full h-full origin-top-left"
                            >
                                <div className="flex p-10 min-w-max relative h-full">
                                    {roundKeys.map((round) => {
                                        const roundMatches = rounds[round];
                                        return (
                                            <div key={round} className="flex flex-col relative mr-16" style={{ width: '280px' }}>
                                                <div className="text-center font-black text-brand-primary uppercase tracking-widest mb-6 text-xs sticky top-0 bg-black/50 backdrop-blur-sm py-1 rounded z-30">
                                                    Round {round}
                                                </div>
                                                
                                                {/* Render Matches for this Round */}
                                                <div className="relative h-full">
                                                    {roundMatches.map((m) => {
                                                        const top = getMatchOffset(round, m.matchIndex);
                                                        return (
                                                            <div 
                                                                key={m.id} 
                                                                className="absolute left-0 w-full"
                                                                style={{ top: `${top}px` }}
                                                            >
                                                                <BracketMatchCard 
                                                                    match={m} 
                                                                    onEdit={openEditModal}
                                                                    onResult={handleUpdateMatchResult}
                                                                />
                                                                
                                                                {/* SVG Connector to Next Round */}
                                                                {/* Only draw if not the final round */}
                                                                {round < roundKeys.length && (
                                                                    <svg 
                                                                        className="absolute top-0 left-full overflow-visible pointer-events-none z-0" 
                                                                        width="64" 
                                                                        height="1" // Height doesn't matter as we draw relative
                                                                        style={{ top: '50%' }}
                                                                    >
                                                                        {m.matchIndex % 2 === 0 ? (
                                                                            // Top of pair: Curve down
                                                                            <path 
                                                                                d={`M 0 0 H 20 V ${getMatchOffset(round+1, Math.floor(m.matchIndex/2)) - top} H 40`}
                                                                                fill="none" 
                                                                                stroke="rgba(255,255,255,0.1)" 
                                                                                strokeWidth="2"
                                                                            />
                                                                        ) : (
                                                                            // Bottom of pair: Curve up
                                                                            <path 
                                                                                d={`M 0 0 H 20 V ${getMatchOffset(round+1, Math.floor(m.matchIndex/2)) - top} H 40`}
                                                                                fill="none" 
                                                                                stroke="rgba(255,255,255,0.1)" 
                                                                                strokeWidth="2"
                                                                            />
                                                                        )}
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTournamentDev;
