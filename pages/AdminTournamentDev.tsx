
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import UserProfile, { UserData } from '../components/UserProfile';
import OptimizedImage from '../components/OptimizedImage';
import { API_BASE_URL } from '../constants';

// --- TYPES ---
interface Pokemon {
  id: number;
  name: string;
}

interface TournamentEntry {
    discordId: string;
    minecraftUsername: string;
    team: (Pokemon | null)[];
    isLocked: boolean;
}

interface TournamentPlayer {
    discordId: string;
    minecraftUsername: string;
    isLocked: boolean;
    isDev: boolean;
}

interface TournamentMatch {
    id: string;
    bracketGroup?: string; // 'winners' | 'losers' | 'finals'
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

type TournamentStatus = 'DRAFTING' | 'LOCK_IN' | 'ONGOING';

// --- CONSTANTS ---
const TYPE_COLORS: Record<string, string> = {
    normal: 'bg-stone-400 text-stone-900',
    fire: 'bg-red-500 text-white',
    water: 'bg-blue-500 text-white',
    grass: 'bg-green-500 text-white',
    electric: 'bg-yellow-400 text-black',
    ice: 'bg-cyan-300 text-black',
    fighting: 'bg-red-700 text-white',
    poison: 'bg-purple-500 text-white',
    ground: 'bg-yellow-700 text-white',
    flying: 'bg-indigo-300 text-black',
    psychic: 'bg-pink-500 text-white',
    bug: 'bg-lime-500 text-white',
    rock: 'bg-yellow-800 text-white',
    ghost: 'bg-indigo-800 text-white',
    dragon: 'bg-violet-600 text-white',
    steel: 'bg-slate-400 text-slate-900',
    fairy: 'bg-pink-300 text-black',
    dark: 'bg-neutral-800 text-white',
};

// --- BAN LIST LOGIC (Truncated for brevity, logic remains) ---
const BANNED_IDS = new Set([
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 638, 639, 640, 641, 642, 643, 644, 
    645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 772, 773, 785, 786, 787, 789, 790, 791, 792, 
    793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 888, 889, 890, 
    891, 892, 893, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
]);
const isBanned = (id: number) => BANNED_IDS.has(id);

// --- CACHE & HELPERS ---
const clientImageCache = new Map<string, boolean>();
const getFormattedName = (name: string) => name.toLowerCase().replace(/[.']/g, '').replace(/♀/g, '-f').replace(/♂/g, '-m').replace(/\s+/g, '-');

// --- COMPONENTS ---
// (PokemonTeamImage, PokemonDetailCard, RuleCard are the same, simplified here for focus on Bracket)

const BracketMatchCard: React.FC<{ 
    match: TournamentMatch; 
    onEdit: (m: TournamentMatch) => void; 
    onResult: (id: string, p: string, s: string) => void;
    style?: React.CSSProperties;
}> = ({ match, onEdit, onResult, style }) => {
    const scoreObj = useMemo(() => {
        if (!match.score) return { p1: '', p2: '', raw: '' };
        const parts = match.score.match(/^(\d+)\s*[-:,\s]\s*(\d+)$/);
        if (parts) return { p1: parts[1], p2: parts[2], raw: '' };
        return { p1: '', p2: '', raw: match.score };
    }, [match.score]);

    const isP1Winner = match.winner === match.player1 && match.winner;
    const isP2Winner = match.winner === match.player2 && match.winner;

    return (
        <div 
            className="absolute w-[260px] group z-10" 
            style={style}
        >
            <div className={`
                bg-[#120507] border-2 rounded-xl overflow-hidden shadow-xl transition-all duration-300
                ${match.status === 'COMPLETED' ? 'border-brand-primary/60 shadow-brand-primary/10' : 'border-white/10'}
                hover:border-white/30
            `}>
                <div className="bg-black/40 px-3 py-1 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <span>{match.id}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${match.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-500'}`}>
                        {match.status === 'COMPLETED' ? 'Done' : match.status}
                    </span>
                </div>
                <div className="flex flex-col">
                    <div 
                        className={`px-3 py-2 flex items-center justify-between border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${isP1Winner ? 'bg-brand-primary/10' : ''}`}
                        onClick={() => match.player1 && onResult(match.id, match.player1, match.score || "1-0")}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {match.player1 && <img src={`https://mc-heads.net/avatar/${match.player1}/24`} alt="" className="w-5 h-5 rounded-sm shadow-sm" />}
                            <span className={`text-xs font-bold truncate ${isP1Winner ? 'text-brand-primary' : 'text-gray-300'}`}>{match.player1 || <span className="text-gray-600 italic">TBD</span>}</span>
                            {scoreObj.p1 && <span className="ml-auto text-xs font-mono font-bold">{scoreObj.p1}</span>}
                        </div>
                        {isP1Winner && <span className="text-xs ml-1">👑</span>}
                    </div>
                    <div 
                        className={`px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors ${isP2Winner ? 'bg-brand-primary/10' : ''}`}
                        onClick={() => match.player2 && onResult(match.id, match.player2, match.score || "0-1")}
                    >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {match.player2 && <img src={`https://mc-heads.net/avatar/${match.player2}/24`} alt="" className="w-5 h-5 rounded-sm shadow-sm" />}
                            <span className={`text-xs font-bold truncate ${isP2Winner ? 'text-brand-primary' : 'text-gray-300'}`}>{match.player2 || <span className="text-gray-600 italic">TBD</span>}</span>
                            {scoreObj.p2 && <span className="ml-auto text-xs font-mono font-bold">{scoreObj.p2}</span>}
                        </div>
                        {isP2Winner && <span className="text-xs ml-1">👑</span>}
                    </div>
                </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onEdit(match); }} className="absolute -top-2 -right-2 bg-gray-700 hover:bg-white text-white hover:text-black p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 scale-75 hover:scale-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
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
    
    // Edit Mode
    const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
    const [editP1, setEditP1] = useState('');
    const [editP2, setEditP2] = useState('');
    const [editScore, setEditScore] = useState('');

    // --- ZOOM & PAN ---
    const [zoomScale, setZoomScale] = useState(1);
    const [panPos, setPanPos] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // --- AUTH & FETCHING ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE_URL}/api/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
            if (res.ok && (await res.json()).success) { setIsAuthenticated(true); fetchPlayers(); } else alert("Invalid password");
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
        try { const res = await fetch(`${API_BASE_URL}/api/admin/tournament/all-players`, { headers: { Authorization: password } }); if (res.ok) setAllPlayers(await res.json()); } catch(e) {}
    };

    useEffect(() => { if (isAuthenticated) { fetchBracket(); const i = setInterval(fetchBracket, 5000); return () => clearInterval(i); } }, [isAuthenticated]);

    // --- ACTIONS ---
    const apiCall = async (endpoint: string, body: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/dev/tournament/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: password }, body: JSON.stringify(body) });
            const data = await res.json();
            if (res.ok) { setStatusMsg(data.message || "Success"); fetchBracket(); if (endpoint === 'inject-players') fetchPlayers(); } 
            else { setStatusMsg("Error: " + data.error); }
        } catch(e) { setStatusMsg("Network Error"); }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleGenerate = () => { if (selectedParticipants.length < 2) { alert("Need 2+ players"); return; } apiCall('generate', { type: bracketType, participants: selectedParticipants }); };
    const handleUpdateMatchResult = (matchId: string, winner: string, score: string) => apiCall('match/update', { matchId, winner, score });
    const handleSaveEdit = () => { if (!editingMatch) return; apiCall('match/update', { matchId: editingMatch.id, player1: editP1, player2: editP2, score: editScore }); setEditingMatch(null); };
    
    // Missing functions implemented
    const handleClear = () => apiCall('clear', {});
    const handleInject = () => apiCall('inject-players', { count: dummyCount });

    // --- LAYOUT ENGINE (Absolute Positioning) ---
    const layout = useMemo(() => {
        const CARD_W = 260;
        const CARD_H = 100;
        const GAP_X = 100;
        const GAP_Y = 30;

        const positions = new Map<string, { x: number, y: number }>();
        const connections: { startX: number, startY: number, endX: number, endY: number, type: 'win' | 'loss' }[] = [];

        if (matches.length === 0) return { positions, connections, width: 0, height: 0 };

        // 1. Separate Brackets
        const winners = matches.filter(m => m.bracketGroup === 'winners').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const losers = matches.filter(m => m.bracketGroup === 'losers').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const finals = matches.filter(m => m.bracketGroup === 'finals');

        // 2. Position Winners Bracket (Standard Binary Tree Logic)
        // Store computed Y for parent centering
        const wbRounds: Record<number, TournamentMatch[]> = {};
        winners.forEach(m => { if(!wbRounds[m.round]) wbRounds[m.round] = []; wbRounds[m.round].push(m); });
        
        let maxY = 0;

        // Round 1 (Leafs)
        (wbRounds[1] || []).forEach(m => {
            const x = 0;
            const y = m.matchIndex * (CARD_H + GAP_Y);
            positions.set(m.id, { x, y });
            if (y > maxY) maxY = y;
        });

        // Subsequent Rounds
        Object.keys(wbRounds).map(Number).sort((a,b)=>a-b).forEach(r => {
            if (r === 1) return;
            wbRounds[r].forEach(m => {
                // Find children (matches in prev round that feed into this)
                // Since `nextMatchId` points forward, we scan backward
                const children = (wbRounds[r-1] || []).filter(prev => prev.nextMatchId === m.id);
                
                const x = (r - 1) * (CARD_W + GAP_X);
                let y = 0;
                
                if (children.length > 0) {
                    const avgY = children.reduce((sum, c) => sum + (positions.get(c.id)?.y || 0), 0) / children.length;
                    y = avgY;
                } else {
                    y = m.matchIndex * (CARD_H + GAP_Y); // Fallback
                }
                
                positions.set(m.id, { x, y });
            });
        });

        // 3. Position Losers Bracket (Below Winners)
        const LB_START_Y = maxY + CARD_H + 200; // Force separate area
        
        // Group LB by Round
        const lbRounds: Record<number, TournamentMatch[]> = {};
        losers.forEach(m => { if(!lbRounds[m.round]) lbRounds[m.round] = []; lbRounds[m.round].push(m); });

        // Simple Stacking for Losers (Linear flow per round to avoid complex tree math conflicts)
        Object.keys(lbRounds).map(Number).sort((a,b)=>a-b).forEach(r => {
            lbRounds[r].forEach((m, idx) => {
                const x = (r - 1) * (CARD_W + GAP_X);
                // Simple stack based on index
                const y = LB_START_Y + (idx * (CARD_H + GAP_Y));
                positions.set(m.id, { x, y });
            });
        });

        // 4. Position Finals
        if (finals.length > 0) {
            const lastWBRound = Math.max(...Object.keys(wbRounds).map(Number));
            const x = (lastWBRound) * (CARD_W + GAP_X) + 100;
            // Center roughly vertically between WB and LB top
            const y = (LB_START_Y) / 2;
            finals.forEach((m, i) => {
                positions.set(m.id, { x: x + (i*50), y: y + (i * (CARD_H + GAP_Y)) });
            });
        }

        // 5. Generate Connection Lines
        matches.forEach(m => {
            const start = positions.get(m.id);
            if (!start) return;

            // Progression Line
            if (m.nextMatchId) {
                const end = positions.get(m.nextMatchId);
                if (end) {
                    connections.push({ 
                        startX: start.x + CARD_W, 
                        startY: start.y + CARD_H/2, 
                        endX: end.x, 
                        endY: end.y + CARD_H/2,
                        type: 'win'
                    });
                }
            }

            // Loser Drop Line (If applicable)
            if (m.loserNextMatchId) {
                const end = positions.get(m.loserNextMatchId);
                if (end) {
                    connections.push({ 
                        startX: start.x + CARD_W/2, 
                        startY: start.y + CARD_H, 
                        endX: end.x, 
                        endY: end.y + CARD_H/2,
                        type: 'loss'
                    });
                }
            }
        });

        return { positions, connections };
    }, [matches]);

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => { e.preventDefault(); setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); };
    const handleMouseMove = (e: React.MouseEvent) => { if(!isDragging) return; setPanPos({ x: panPos.x + e.clientX - lastMousePos.x, y: panPos.y + e.clientY - lastMousePos.y }); setLastMousePos({ x: e.clientX, y: e.clientY }); };
    
    // Zoom Logic
    useEffect(() => {
        const h = (e: WheelEvent) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setZoomScale(s => Math.min(Math.max(0.1, s + delta), 3));
        };
        const el = containerRef.current;
        if(el) el.addEventListener('wheel', h, { passive: false });
        return () => el?.removeEventListener('wheel', h);
    }, []);

    if (!isAuthenticated) return (
        <div className="flex flex-col items-center justify-center h-screen">
            <form onSubmit={handleLogin} className="bg-black/40 p-8 rounded-2xl border border-white/10">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 text-white rounded mb-4" placeholder="Password" />
                <button type="submit" className="w-full bg-brand-primary p-2 rounded font-bold text-white">Login</button>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen p-8 text-white font-sans space-y-8 relative overflow-hidden h-screen flex flex-col">
            <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/10 shrink-0 z-50 relative">
                <h1 className="text-2xl font-black text-brand-primary">Tournament Admin (Dev)</h1>
                <div className="flex gap-4">
                    <button onClick={handleGenerate} className="bg-green-600 px-4 py-2 rounded font-bold text-sm">Generate</button>
                    <button onClick={handleClear} className="bg-red-600 px-4 py-2 rounded font-bold text-sm">Clear</button>
                    <button onClick={handleInject} className="bg-purple-600 px-4 py-2 rounded font-bold text-sm">+ Dummy</button>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingMatch && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-[#1a0b0e] p-6 rounded-2xl border border-white/10 w-full max-w-sm space-y-4">
                        <h3 className="font-bold">Edit Match {editingMatch.id}</h3>
                        <input value={editP1} onChange={e => setEditP1(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded" placeholder="P1" />
                        <input value={editP2} onChange={e => setEditP2(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded" placeholder="P2" />
                        <input value={editScore} onChange={e => setEditScore(e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded" placeholder="Score" />
                        <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="flex-1 bg-green-600 py-2 rounded">Save</button>
                            <button onClick={() => setEditingMatch(null)} className="flex-1 bg-gray-600 py-2 rounded">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div 
                ref={containerRef}
                className="flex-1 bg-[#100506] rounded-2xl border border-white/10 relative overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
            >
                <div 
                    style={{ 
                        transform: `translate(${panPos.x}px, ${panPos.y}px) scale(${zoomScale})`, 
                        transformOrigin: '0 0',
                        width: '100%', height: '100%' 
                    }}
                >
                    {/* Render Connections Layer */}
                    <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-0" style={{ overflow: 'visible' }}>
                        {layout.connections.map((conn, i) => {
                            // Bezier Curve Logic
                            const midX = (conn.startX + conn.endX) / 2;
                            let path = '';
                            
                            if (conn.type === 'win') {
                                path = `M ${conn.startX} ${conn.startY} C ${midX} ${conn.startY}, ${midX} ${conn.endY}, ${conn.endX} ${conn.endY}`;
                            } else {
                                // Loss line - Dashed drop
                                path = `M ${conn.startX} ${conn.startY} L ${conn.startX} ${conn.endY} L ${conn.endX} ${conn.endY}`;
                            }

                            return (
                                <path 
                                    key={i} 
                                    d={path} 
                                    stroke={conn.type === 'win' ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.3)"} 
                                    strokeWidth="2" 
                                    fill="none" 
                                    strokeDasharray={conn.type === 'loss' ? "5,5" : "none"}
                                />
                            );
                        })}
                    </svg>

                    {/* Render Match Cards */}
                    {matches.map(m => {
                        const pos = layout.positions.get(m.id);
                        if (!pos) return null;
                        return (
                            <BracketMatchCard 
                                key={m.id} 
                                match={m} 
                                onEdit={setEditingMatch} 
                                onResult={handleUpdateMatchResult}
                                style={{ left: pos.x, top: pos.y }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AdminTournamentDev;
