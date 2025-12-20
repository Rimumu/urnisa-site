
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

const AdminTournamentDev: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    // Data State
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [bracketType, setBracketType] = useState('SINGLE');
    const [dummyCount, setDummyCount] = useState(1);
    const [statusMsg, setStatusMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok && (await res.json()).success) setIsAuthenticated(true);
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
            } else {
                setStatusMsg("Error: " + data.error);
            }
        } catch(e) {
            setStatusMsg("Network Error");
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleGenerate = () => apiCall('generate', { type: bracketType });
    const handleClear = () => apiCall('clear', {});
    const handleInject = () => apiCall('inject-players', { count: dummyCount });
    
    const handleUpdateMatch = (matchId: string, winner: string, score: string) => {
        apiCall('match/update', { matchId, winner, score });
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 space-y-6">
                    <h3 className="font-bold text-xl border-b border-white/10 pb-2">Generation Controls</h3>
                    
                    <div className="flex gap-4 items-center">
                        <select value={bracketType} onChange={e => setBracketType(e.target.value)} className="bg-black/40 border border-white/10 p-2 rounded text-white">
                            <option value="SINGLE_ELIMINATION">Single Elimination</option>
                            <option value="DOUBLE_ELIMINATION">Double Elimination (Coming Soon)</option>
                        </select>
                        <button onClick={handleGenerate} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded transition-colors">GENERATE BRACKET</button>
                        <button onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded transition-colors">CLEAR</button>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <h4 className="font-bold text-sm text-gray-400 mb-2">Inject Dummy Players</h4>
                        <div className="flex gap-4">
                            <input type="number" value={dummyCount} onChange={e => setDummyCount(parseInt(e.target.value))} className="bg-black/40 border border-white/10 p-2 rounded text-white w-20" min="1" />
                            <button onClick={handleInject} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded transition-colors">ADD PLAYERS</button>
                        </div>
                    </div>
                </div>

                {/* Match List */}
                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 h-[600px] overflow-y-auto custom-scrollbar">
                    <h3 className="font-bold text-xl border-b border-white/10 pb-2 mb-4">Active Matches</h3>
                    {Object.keys(rounds).sort().map(rKey => {
                        const r = parseInt(rKey);
                        return (
                            <div key={r} className="mb-6">
                                <h4 className="font-black text-brand-accent uppercase tracking-widest text-sm mb-2">Round {r}</h4>
                                <div className="space-y-2">
                                    {rounds[r].sort((a,b) => a.matchIndex - b.matchIndex).map(m => (
                                        <div key={m.id} className="bg-white/5 p-3 rounded border border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-xs text-gray-400">
                                                <span>{m.id}</span>
                                                <span className={m.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-400'}>{m.status}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <div className={`flex-1 p-2 rounded cursor-pointer transition-colors ${m.winner === m.player1 && m.winner ? 'bg-green-500/20 border border-green-500' : 'bg-black/20 hover:bg-white/10'}`} onClick={() => m.player1 && handleUpdateMatch(m.id, m.player1, m.score || "1-0")}>
                                                    {m.player1 || "Waiting..."}
                                                </div>
                                                <div className="font-bold text-gray-500">VS</div>
                                                <div className={`flex-1 p-2 rounded cursor-pointer transition-colors ${m.winner === m.player2 && m.winner ? 'bg-green-500/20 border border-green-500' : 'bg-black/20 hover:bg-white/10'}`} onClick={() => m.player2 && handleUpdateMatch(m.id, m.player2, m.score || "0-1")}>
                                                    {m.player2 || "Waiting..."}
                                                </div>
                                            </div>
                                            <input 
                                                type="text" 
                                                placeholder="Score (e.g. 2-1)" 
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs w-full text-center"
                                                defaultValue={m.score}
                                                onBlur={(e) => m.winner && handleUpdateMatch(m.id, m.winner, e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminTournamentDev;