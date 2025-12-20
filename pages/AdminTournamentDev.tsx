
import React, { useState, useEffect } from 'react';
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
}

interface TournamentPlayer {
    discordId: string;
    minecraftUsername: string;
    isLocked: boolean;
    isDev: boolean;
}

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
    const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
    const [editP1, setEditP1] = useState('');
    const [editP2, setEditP2] = useState('');

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

    const handleUpdateMatchPlayers = (matchId: string) => {
        apiCall('match/update', { matchId, player1: editP1, player2: editP2 });
        setEditingMatchId(null);
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

    // Group matches by round
    const rounds: Record<number, TournamentMatch[]> = {};
    matches.forEach(m => {
        if (!rounds[m.round]) rounds[m.round] = [];
        rounds[m.round].push(m);
    });

    return (
        <div className="min-h-screen p-8 text-white font-sans space-y-8">
            <h1 className="text-4xl font-black text-brand-primary">Tournament Admin Panel</h1>
            
            {statusMsg && <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-xl shadow-lg z-50 animate-bounce">{statusMsg}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. PLAYER POOL SELECTION */}
                <div className="lg:col-span-1 bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col h-[700px]">
                    <h3 className="font-bold text-xl border-b border-white/10 pb-2 mb-4">Player Selection</h3>
                    
                    {/* Available Players */}
                    <div className="flex-1 overflow-hidden flex flex-col mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase">Available Players ({allPlayers.length})</h4>
                            <button onClick={fetchPlayers} className="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">Refresh</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded bg-black/20 p-2 space-y-1">
                            {allPlayers.map(p => {
                                const isSelected = selectedParticipants.includes(p.minecraftUsername);
                                return (
                                    <div key={p.discordId} className={`flex justify-between items-center p-2 rounded ${isSelected ? 'bg-green-900/30 opacity-50' : 'bg-white/5 hover:bg-white/10'}`}>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{p.minecraftUsername}</span>
                                            <span className="text-[10px] text-gray-500">
                                                {p.isDev ? 'DEV' : 'USER'} • {p.isLocked ? 'LOCKED' : 'DRAFT'}
                                            </span>
                                        </div>
                                        {!isSelected && (
                                            <button onClick={() => addToPool(p.minecraftUsername)} className="text-green-400 hover:text-green-300 font-bold px-2">+</button>
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
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-bold text-brand-primary uppercase">Bracket Participants ({selectedParticipants.length})</h4>
                            <button onClick={shufflePool} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded hover:bg-brand-primary/40 font-bold">Shuffle</button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-brand-primary/30 rounded bg-black/20 p-2 space-y-1">
                            {selectedParticipants.map((name, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 rounded bg-brand-primary/10 border border-brand-primary/20">
                                    <span className="font-mono text-xs text-gray-400 mr-2">{idx+1}.</span>
                                    <span className="font-bold text-sm flex-1">{name}</span>
                                    <button onClick={() => removeFromPool(name)} className="text-red-400 hover:text-red-300 font-bold px-2">✕</button>
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

                {/* 2. MATCH LIST & EDITING */}
                <div className="lg:col-span-2 bg-black/40 p-6 rounded-2xl border border-white/10 h-[700px] flex flex-col">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                        <h3 className="font-bold text-xl">Active Matches</h3>
                        <div className="flex gap-4">
                            <select value={bracketType} onChange={e => setBracketType(e.target.value)} className="bg-black/40 border border-white/10 p-2 rounded text-white text-sm">
                                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                            </select>
                            <button onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors">CLEAR ALL</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        {Object.keys(rounds).sort((a,b) => parseInt(a)-parseInt(b)).map(rKey => {
                            const r = parseInt(rKey);
                            return (
                                <div key={r} className="mb-6">
                                    <h4 className="font-black text-brand-accent uppercase tracking-widest text-sm mb-2 sticky top-0 bg-[#1a0b0e] py-2 z-10 border-b border-white/5">Round {r}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {rounds[r].sort((a,b) => a.matchIndex - b.matchIndex).map(m => (
                                            <div key={m.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col gap-2 relative group">
                                                <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase font-bold">
                                                    <span>{m.id}</span>
                                                    <span className={m.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}>{m.status}</span>
                                                </div>

                                                {editingMatchId === m.id ? (
                                                    <div className="space-y-2 bg-black/40 p-2 rounded border border-brand-primary/30">
                                                        <input 
                                                            type="text" 
                                                            value={editP1} 
                                                            onChange={e => setEditP1(e.target.value)} 
                                                            className="w-full bg-black border border-white/20 rounded px-2 py-1 text-sm text-white" 
                                                            placeholder="Player 1"
                                                        />
                                                        <div className="text-center text-xs font-bold text-brand-primary">VS</div>
                                                        <input 
                                                            type="text" 
                                                            value={editP2} 
                                                            onChange={e => setEditP2(e.target.value)} 
                                                            className="w-full bg-black border border-white/20 rounded px-2 py-1 text-sm text-white" 
                                                            placeholder="Player 2"
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <button onClick={() => handleUpdateMatchPlayers(m.id)} className="flex-1 bg-green-600 text-white text-xs font-bold py-1 rounded">Save</button>
                                                            <button onClick={() => setEditingMatchId(null)} className="flex-1 bg-gray-600 text-white text-xs font-bold py-1 rounded">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className={`flex-1 p-2 rounded cursor-pointer transition-colors text-center text-sm font-bold ${m.winner === m.player1 && m.winner ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-black/20 hover:bg-white/10'}`} onClick={() => m.player1 && handleUpdateMatchResult(m.id, m.player1, m.score || "1-0")}>
                                                                {m.player1 || <span className="text-gray-600 italic">TBD</span>}
                                                            </div>
                                                            <div className="font-bold text-gray-500 text-xs">VS</div>
                                                            <div className={`flex-1 p-2 rounded cursor-pointer transition-colors text-center text-sm font-bold ${m.winner === m.player2 && m.winner ? 'bg-green-500/20 border border-green-500 text-green-400' : 'bg-black/20 hover:bg-white/10'}`} onClick={() => m.player2 && handleUpdateMatchResult(m.id, m.player2, m.score || "0-1")}>
                                                                {m.player2 || <span className="text-gray-600 italic">TBD</span>}
                                                            </div>
                                                        </div>
                                                        
                                                        <button 
                                                            onClick={() => {
                                                                setEditingMatchId(m.id);
                                                                setEditP1(m.player1 || '');
                                                                setEditP2(m.player2 || '');
                                                            }}
                                                            className="absolute top-2 right-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Edit Matchup"
                                                        >
                                                            ✎
                                                        </button>
                                                    </>
                                                )}

                                                {!editingMatchId && (
                                                    <input 
                                                        type="text" 
                                                        placeholder="Score" 
                                                        className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full text-center text-gray-300"
                                                        defaultValue={m.score}
                                                        onBlur={(e) => m.winner && handleUpdateMatchResult(m.id, m.winner, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTournamentDev;