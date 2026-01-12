
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { API_BASE_URL } from '../constants';
import { Link } from 'react-router-dom';

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
                            {match.player1 && (
                                <img
                                    src={`https://mc-heads.net/avatar/${match.player1}/24`}
                                    alt=""
                                    className="w-5 h-5 rounded-sm shadow-sm"
                                />
                            )}
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
                            {match.player2 && (
                                <img
                                    src={`https://mc-heads.net/avatar/${match.player2}/24`}
                                    alt=""
                                    className="w-5 h-5 rounded-sm shadow-sm"
                                />
                            )}
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

const AdminTournament: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Data State
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [allPlayers, setAllPlayers] = useState<TournamentPlayer[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

    const [bracketType, setBracketType] = useState('SINGLE');
    const [statusMsg, setStatusMsg] = useState('');

    // Edit Mode State for Matchups
    const [editingMatch, setEditingMatch] = useState<TournamentMatch | null>(null);
    const [editP1, setEditP1] = useState('');
    const [editP2, setEditP2] = useState('');
    const [editScore, setEditScore] = useState('');

    // End Tournament State
    const [showEndModal, setShowEndModal] = useState(false);
    const [finalWinners, setFinalWinners] = useState({
        rank1: { user: '', score: 'W-L' },
        rank2: { user: '', score: 'W-L' },
        rank3: { user: '', score: 'W-L' }
    });

    // Season State
    const [allSeasons, setAllSeasons] = useState<{ seasonId: number; name: string; format: string; status: string; isArchived?: boolean; challongeUrl?: string }[]>([]);
    const [activeSeason, setActiveSeason] = useState<{ seasonId: number; name: string; format: string; status: string; challongeUrl?: string }>({ seasonId: 1, name: 'Season 1', format: 'Singles 4v4', status: 'DRAFTING' });
    const [newSeasonName, setNewSeasonName] = useState('');
    const [newSeasonFormat, setNewSeasonFormat] = useState('');
    const [newSeasonChallongeUrl, setNewSeasonChallongeUrl] = useState('');

    // --- ZOOM & PAN STATE ---
    const [zoomScale, setZoomScale] = useState(1);
    const [panPos, setPanPos] = useState({ x: 50, y: 50 }); // Initial padding
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [hasInteracted, setHasInteracted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep track of current state in ref for event listener
    const stateRef = useRef({ zoomScale, panPos });
    useEffect(() => {
        stateRef.current = { zoomScale, panPos };
    }, [zoomScale, panPos]);

    // Attach native wheel listener to prevent default scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            if (matches.length === 0) return;
            e.preventDefault();
            setHasInteracted(true);

            const { zoomScale: currentZoom, panPos: currentPan } = stateRef.current;
            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            const newScale = Math.min(Math.max(0.2, currentZoom + delta), 3);

            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const newX = mouseX - (mouseX - currentPan.x) * (newScale / currentZoom);
            const newY = mouseY - (mouseY - currentPan.y) * (newScale / currentZoom);

            setZoomScale(newScale);
            setPanPos({ x: newX, y: newY });
        };

        // { passive: false } is required to use preventDefault()
        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [matches.length]);

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
                fetchSeasons();
                fetchPlayers();
            }
            else alert("Invalid password");
        } catch (e) { alert("Error connecting"); }
    };

    const fetchSeasons = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/seasons`);
            if (res.ok) {
                const seasons = await res.json();
                setAllSeasons(seasons);
                // Set active season to first non-archived or latest
                const active = seasons.find((s: any) => !s.isArchived) || seasons[0];
                if (active) setActiveSeason(active);
            }
        } catch (e) { console.error(e); }
    };

    const fetchBracket = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/tournament/bracket?seasonId=${activeSeason.seasonId}`);
            if (res.ok) {
                const data = await res.json();
                setMatches(data.matches || []);
                setBracketType(data.type || 'SINGLE');
            }
        } catch (e) { }
    };

    const fetchPlayers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/tournament/all-players`, {
                headers: { Authorization: password }
            });
            if (res.ok) {
                setAllPlayers(await res.json());
            }
        } catch (e) { }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchBracket();
            const interval = setInterval(fetchBracket, 5000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, activeSeason.seasonId]);

    const apiCall = async (endpoint: string, body: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/tournament/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ ...body, seasonId: activeSeason.seasonId })
            });
            const data = await res.json();
            if (res.ok) {
                setStatusMsg(data.message || "Success");
                fetchBracket();
                fetchSeasons();
            } else {
                setStatusMsg("Error: " + data.error);
            }
        } catch (e) {
            setStatusMsg("Network Error");
        }
        setTimeout(() => setStatusMsg(''), 3000);
    };

    const handleCreateSeason = async () => {
        if (!newSeasonName.trim()) {
            alert("Please enter a season name");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/tournament/season/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({
                    name: newSeasonName,
                    format: newSeasonFormat || 'Singles 4v4',
                    challongeUrl: newSeasonChallongeUrl
                })
            });
            if (res.ok) {
                const data = await res.json();
                setStatusMsg(`Created ${data.season.name}`);
                setNewSeasonName('');
                setNewSeasonFormat('');
                setNewSeasonChallongeUrl('');
                fetchSeasons();
                if (data.season) setActiveSeason(data.season);
            }
        } catch (e) { setStatusMsg("Failed to create season"); }
    };

    const handleArchiveSeason = async () => {
        if (!window.confirm(`Archive ${activeSeason.name}? This will set it as ENDED.`)) return;
        try {
            await fetch(`${API_BASE_URL}/api/admin/tournament/season/${activeSeason.seasonId}/archive`, {
                method: 'POST',
                headers: { Authorization: password }
            });
            setStatusMsg(`Archived ${activeSeason.name}`);
            fetchSeasons();
        } catch (e) { setStatusMsg("Archive failed"); }
    };

    const handleGenerate = () => {
        if (selectedParticipants.length < 2) {
            alert("Please select at least 2 participants!");
            return;
        }
        apiCall('generate', { type: bracketType, participants: selectedParticipants });
    };

    const handleClear = () => apiCall('clear', {});

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

    // --- WINNER CALCULATION & END TOURNAMENT ---
    const getPlayerStats = (username: string) => {
        if (!username) return '0-0';
        let wins = 0;
        let losses = 0;
        matches.forEach(m => {
            if (m.winner === username) wins++;
            else if ((m.player1 === username || m.player2 === username) && m.status === 'COMPLETED') losses++;
        });
        return `${wins}-${losses}`;
    };

    const handleEndTournamentClick = () => {
        console.log("End Tournament Clicked");
        try {
            // Auto-detect winners
            let r1 = '', r2 = '', r3 = '';

            if (matches.length > 0) {
                // Priority: Finals Bracket
                const finals = matches.filter(m => m.bracketGroup === 'finals');
                if (finals.length > 0) {
                    // Last finals match determines 1st/2nd
                    const lastFinal = finals[finals.length - 1]; // Usually single match, or reset
                    if (lastFinal.status === 'COMPLETED' && lastFinal.winner) {
                        r1 = lastFinal.winner;
                        r2 = lastFinal.player1 === lastFinal.winner ? (lastFinal.player2 || '') : (lastFinal.player1 || '');
                    }
                } else {
                    // If Single Elim and no 'finals' group labeled, find last match
                    const completed = matches.filter(m => m.status === 'COMPLETED');
                    if (completed.length > 0) {
                        // Start from max round
                        const maxRound = Math.max(...completed.map(m => m.round));
                        const final = completed.find(m => m.round === maxRound);
                        if (final && final.winner) {
                            r1 = final.winner;
                            r2 = final.player1 === final.winner ? (final.player2 || '') : (final.player1 || '');
                        }
                    }
                }

                // 3rd Place
                if (bracketType === 'DOUBLE_ELIMINATION') {
                    // Loser of Losers Finals
                    const losersMatches = matches.filter(m => m.bracketGroup === 'losers');
                    if (losersMatches.length > 0) {
                        const maxLRound = Math.max(...losersMatches.map(m => m.round));
                        const losersFinal = losersMatches.find(m => m.round === maxLRound);
                        if (losersFinal && losersFinal.status === 'COMPLETED' && losersFinal.winner) {
                            r3 = losersFinal.player1 === losersFinal.winner ? (losersFinal.player2 || '') : (losersFinal.player1 || '');
                        }
                    }
                } else {
                    // Single Elim: Semi-Final Losers share 3rd/4th usually. Pick one or leave empty
                }
            }

            setFinalWinners({
                rank1: { user: r1, score: getPlayerStats(r1) },
                rank2: { user: r2, score: getPlayerStats(r2) },
                rank3: { user: r3, score: getPlayerStats(r3) }
            });
        } catch (e) {
            console.error("Error auto-detecting winners:", e);
        }
        // ALWAYS open modal
        setShowEndModal(true);
    };

    const submitEndTournament = async () => {
        const winnersPayload = [
            { rank: 1, username: finalWinners.rank1.user, score: finalWinners.rank1.score },
            { rank: 2, username: finalWinners.rank2.user, score: finalWinners.rank2.score },
            { rank: 3, username: finalWinners.rank3.user, score: finalWinners.rank3.score }
        ].filter(w => w.username); // Filter empty

        await apiCall('end', { winners: winnersPayload });
        await apiCall('publish', {}); // Push bracket changes to production so public sees "Finished"
        setShowEndModal(false);
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

    // Drag Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if (matches.length === 0) return;
        if (e.button !== 0) return;

        setIsDragging(true);
        setHasInteracted(true);
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

    // --- BRACKET LAYOUT HELPERS ---
    const CARD_HEIGHT = 120;
    const VERTICAL_GAP = 20;
    const CARD_TOTAL_H = CARD_HEIGHT + VERTICAL_GAP;
    const COLUMN_WIDTH = 280;
    const COLUMN_GAP = 60;

    const getMatchOffsetBinary = (round: number, index: number): number => {
        if (round === 1) {
            return index * CARD_TOTAL_H;
        }
        const prevRound = round - 1;
        const src1 = getMatchOffsetBinary(prevRound, index * 2);
        const src2 = getMatchOffsetBinary(prevRound, index * 2 + 1);
        return (src1 + src2) / 2;
    };

    const organizeByRound = (matchList: TournamentMatch[]) => {
        const grouped: Record<number, TournamentMatch[]> = {};
        matchList.forEach(m => {
            if (!grouped[m.round]) grouped[m.round] = [];
            grouped[m.round].push(m);
        });
        Object.keys(grouped).forEach(r => {
            grouped[Number(r)].sort((a, b) => a.matchIndex - b.matchIndex);
        });
        return grouped;
    };

    // Derived State for Layout
    const winners = useMemo(() => matches.filter(m => m.bracketGroup === 'winners'), [matches]);
    const losers = useMemo(() => matches.filter(m => m.bracketGroup === 'losers'), [matches]);
    const finals = useMemo(() => matches.filter(m => m.bracketGroup === 'finals'), [matches]);

    const winnerRounds = useMemo(() => organizeByRound(winners), [winners]);
    const loserRounds = useMemo(() => organizeByRound(losers), [losers]);

    const wRoundKeys = Object.keys(winnerRounds).map(Number).sort((a, b) => a - b);
    const lRoundKeys = Object.keys(loserRounds).map(Number).sort((a, b) => a - b);

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
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-brand-primary">Tournament Admin Panel</h1>
                <Link to="/admin" className="text-gray-400 hover:text-white font-bold bg-white/10 px-4 py-2 rounded-xl transition-colors">
                    ← Back to Dashboard
                </Link>
            </div>

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

            {/* END TOURNAMENT MODAL */}
            {showEndModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-[#1a0b0e] p-8 rounded-3xl border border-brand-primary/30 w-full max-w-lg space-y-6 shadow-2xl relative">
                        <h3 className="font-black text-3xl text-brand-primary uppercase tracking-tighter text-center">🏆 Declare Winners</h3>
                        <p className="text-gray-400 text-center text-sm">Review and confirm the top 3 winners to officially end the tournament.</p>

                        <div className="space-y-4">
                            {[1, 2, 3].map((rank) => {
                                const key = `rank${rank}` as keyof typeof finalWinners;
                                return (
                                    <div key={rank} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/10">
                                        <div className={`
                                            w-10 h-10 flex items-center justify-center rounded-full font-black text-lg border-2
                                            ${rank === 1 ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' :
                                                rank === 2 ? 'border-gray-300 text-gray-300 bg-gray-300/10' :
                                                    'border-amber-600 text-amber-600 bg-amber-600/10'}
                                        `}>
                                            {rank}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Username</label>
                                            <input
                                                type="text"
                                                value={finalWinners[key].user}
                                                onChange={e => setFinalWinners({ ...finalWinners, [key]: { ...finalWinners[key], user: e.target.value } })}
                                                className="w-full bg-transparent font-bold text-white outline-none placeholder-gray-700"
                                                placeholder={`Winner #${rank}`}
                                            />
                                        </div>
                                        <div className="w-24 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Score</label>
                                            <input
                                                type="text"
                                                value={finalWinners[key].score}
                                                onChange={e => setFinalWinners({ ...finalWinners, [key]: { ...finalWinners[key], score: e.target.value } })}
                                                className="w-full bg-transparent font-mono font-bold text-right text-brand-primary outline-none placeholder-gray-700"
                                                placeholder="W-L"
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-white/10">
                            <button onClick={() => setShowEndModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl transition-colors">Cancel</button>
                            <button onClick={submitEndTournament} className="flex-[2] bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-black py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] uppercase tracking-widest">
                                CONFIRM & END SEASON
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* 1. LEFT SIDEBAR - SEASON MANAGEMENT & PLAYER POOL */}
                <div className="lg:col-span-1 space-y-6">
                    {/* SEASON MANAGEMENT PANEL */}
                    <div className="bg-gradient-to-b from-brand-primary/10 to-black/40 p-6 rounded-2xl border border-brand-primary/30">
                        <h3 className="font-bold text-lg border-b border-white/10 pb-2 mb-4 text-brand-primary uppercase tracking-wide">🗓️ Season Management</h3>

                        {/* Season Selector */}
                        <div className="mb-4">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Active Season</label>
                            <select
                                value={activeSeason.seasonId}
                                onChange={(e) => {
                                    const s = allSeasons.find(s => s.seasonId === parseInt(e.target.value));
                                    if (s) setActiveSeason(s);
                                }}
                                className="w-full bg-black/60 border border-white/10 rounded-lg p-2 text-white text-sm font-bold"
                            >
                                {allSeasons.map(s => (
                                    <option key={s.seasonId} value={s.seasonId}>
                                        {s.name} ({s.format}) {s.isArchived ? '📦' : '🟢'}
                                    </option>
                                ))}
                            </select>
                            <div className="text-xs text-gray-500 mt-1">Status: <span className={`font-bold ${activeSeason.status === 'ENDED' ? 'text-yellow-400' : 'text-green-400'}`}>{activeSeason.status}</span></div>
                        </div>

                        {/* Archive Button */}
                        {!activeSeason.isArchived && (
                            <button
                                onClick={handleArchiveSeason}
                                className="w-full bg-amber-600/20 border border-amber-600/50 text-amber-400 font-bold py-2 rounded-lg text-sm hover:bg-amber-600/30 mb-4"
                            >
                                📦 Archive This Season
                            </button>
                        )}

                        <hr className="border-white/10 my-4" />

                        {/* Create New Season */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase">Create New Season</h4>
                            <input
                                type="text"
                                placeholder="Season Name (e.g. Season 2)"
                                value={newSeasonName}
                                onChange={(e) => setNewSeasonName(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Format (e.g. Duos 2v2)"
                                value={newSeasonFormat}
                                onChange={(e) => setNewSeasonFormat(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Challonge URL (optional)"
                                value={newSeasonChallongeUrl}
                                onChange={(e) => setNewSeasonChallongeUrl(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm"
                            />
                            <button
                                onClick={handleCreateSeason}
                                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm"
                            >
                                + Create Season
                            </button>

                            {/* DB MIGRATION TOOL (HIDDEN/ADVANCED) */}
                            <button
                                onClick={async () => {
                                    if (confirm("Fix legacy Season 1 player data?")) {
                                        try {
                                            const res = await fetch(`${API_BASE_URL}/api/admin/fix-legacy-players`, {
                                                method: 'POST',
                                                headers: { Authorization: password }
                                            });
                                            const data = await res.json();
                                            alert(`Fixed ${data.modified} records.`);
                                        } catch (e) { alert("Fix failed"); }
                                    }
                                }}
                                className="w-full bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 font-bold py-2 rounded-lg text-[10px] uppercase tracking-widest mt-4"
                            >
                                🔧 Fix Legacy Data
                            </button>
                        </div>
                    </div>

                    {/* PLAYER POOL SELECTION */}
                    <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col h-[500px]">
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

                        {/* Selected Participants */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold text-brand-primary uppercase">Participants ({selectedParticipants.length})</h4>
                                <button onClick={shufflePool} className="text-xs bg-brand-primary/20 text-brand-primary px-2 py-1 rounded hover:bg-brand-primary/40 font-bold">Shuffle</button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar border border-brand-primary/30 rounded bg-black/20 p-2 space-y-1">
                                {selectedParticipants.map((name, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 rounded bg-brand-primary/10 border border-brand-primary/20 group">
                                        <span className="font-mono text-xs text-gray-400 mr-2 w-4">{idx + 1}.</span>
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

                        {/* MANUAL WINNER FALLBACK */}
                        <div className="mt-8 pt-8 border-t-2 border-white/10 flex flex-col gap-4">
                            <h3 className="font-bold text-lg text-yellow-500 uppercase">🏆 Manual End Season</h3>
                            <div className="space-y-2">
                                {[1, 2, 3].map((rank) => {
                                    const key = `rank${rank}` as keyof typeof finalWinners;
                                    return (
                                        <div key={rank} className="flex gap-2">
                                            <div className="w-6 h-8 flex items-center justify-center font-bold text-gray-500">#{rank}</div>
                                            <input
                                                type="text"
                                                value={finalWinners[key].user}
                                                onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], user: e.target.value } }))}
                                                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                                placeholder="Username"
                                            />
                                            <input
                                                type="text"
                                                value={finalWinners[key].score}
                                                onChange={e => setFinalWinners(prev => ({ ...prev, [key]: { ...prev[key], score: e.target.value } }))}
                                                className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-right text-gray-400"
                                                placeholder="Score"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <button onClick={submitEndTournament} className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded transition-colors uppercase tracking-widest text-sm shadow-lg">
                                CONFIRM WINNERS
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. BRACKET VIEW (Main Area) */}
                <div className="lg:col-span-3 bg-black/40 p-6 rounded-2xl border border-white/10 h-[800px] flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 z-20 relative bg-[#1a0b0e]/80 backdrop-blur-sm px-4 rounded-xl">
                        <h3 className="font-bold text-xl text-white">Live Bracket View</h3>
                        <div className="flex gap-4">
                            <button onClick={handleEndTournamentClick} className="bg-yellow-600 hover:bg-yellow-500 text-white font-black py-2 px-4 rounded text-sm transition-colors border border-yellow-400/30 shadow-lg shadow-yellow-900/20 uppercase tracking-widest flex items-center gap-2">
                                <span>🏆</span> END SEASON
                            </button>
                            <select value={bracketType} onChange={e => setBracketType(e.target.value)} className="bg-black/40 border border-white/10 p-2 rounded text-white text-sm">
                                <option value="SINGLE_ELIMINATION">Single Elimination</option>
                                <option value="DOUBLE_ELIMINATION">Double Elimination</option>
                            </select>
                            <button onClick={handleClear} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded text-sm transition-colors">CLEAR ALL</button>
                        </div>
                    </div>

                    <div
                        className="flex-1 overflow-hidden relative cursor-move bg-[#1a0b0e]/50 select-none rounded-xl border border-white/5"
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {/* Control Indicator */}
                        <div className={`absolute top-4 right-4 z-50 bg-black/60 backdrop-blur-md p-2 rounded-lg border border-white/10 text-xs text-gray-300 flex items-center gap-3 pointer-events-none shadow-xl transition-opacity duration-500 ${hasInteracted ? 'opacity-0' : 'opacity-100'}`}>
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
                                <div className="flex flex-col gap-20 p-10 min-w-max relative h-full">

                                    {/* WINNERS BRACKET */}
                                    <div className="relative">
                                        {bracketType === 'DOUBLE_ELIMINATION' && (
                                            <div className="absolute -top-8 left-0 font-black text-brand-primary uppercase tracking-widest text-lg opacity-80">Upper Bracket</div>
                                        )}
                                        <div className="flex">
                                            {wRoundKeys.map((round) => {
                                                const roundMatches = winnerRounds[round];
                                                return (
                                                    <div key={round} className="flex flex-col relative" style={{ width: `${COLUMN_WIDTH}px`, marginRight: `${COLUMN_GAP}px` }}>
                                                        <div className="text-center font-black text-brand-primary uppercase tracking-widest mb-6 text-xs sticky top-0 bg-black/50 backdrop-blur-sm py-1 rounded z-30 border border-white/5">
                                                            Round {round}
                                                        </div>
                                                        <div className="relative h-full">
                                                            {roundMatches.map((m) => {
                                                                const top = getMatchOffsetBinary(round, m.matchIndex);
                                                                return (
                                                                    <div key={m.id} className="absolute left-0 w-full" style={{ top: `${top}px` }}>
                                                                        <BracketMatchCard
                                                                            match={m}
                                                                            onEdit={openEditModal}
                                                                            onResult={handleUpdateMatchResult}
                                                                        />
                                                                        {/* Binary SVG Lines */}
                                                                        {round < wRoundKeys.length && m.matchIndex % 2 === 0 && (
                                                                            <svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={COLUMN_GAP} height="1" style={{ top: '50%' }}>
                                                                                <path
                                                                                    d={`M 0 0 H ${COLUMN_GAP / 2} V ${getMatchOffsetBinary(round + 1, Math.floor(m.matchIndex / 2)) - top} H ${COLUMN_GAP}`}
                                                                                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"
                                                                                />
                                                                            </svg>
                                                                        )}
                                                                        {round < wRoundKeys.length && m.matchIndex % 2 !== 0 && (
                                                                            <svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={COLUMN_GAP} height="1" style={{ top: '50%' }}>
                                                                                <path
                                                                                    d={`M 0 0 H ${COLUMN_GAP / 2} V ${getMatchOffsetBinary(round + 1, Math.floor(m.matchIndex / 2)) - top} H ${COLUMN_GAP}`}
                                                                                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2"
                                                                                />
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

                                    {/* LOSERS BRACKET */}
                                    {bracketType === 'DOUBLE_ELIMINATION' && losers.length > 0 && (
                                        <div className="relative mt-12 pt-12 border-t border-white/5">
                                            <div className="absolute -top-8 left-0 font-black text-red-500 uppercase tracking-widest text-lg opacity-80">Losers Bracket</div>
                                            <div className="flex">
                                                {lRoundKeys.map((round) => {
                                                    const roundMatches = loserRounds[round];
                                                    return (
                                                        <div key={`L-${round}`} className="flex flex-col relative" style={{ width: `${COLUMN_WIDTH}px`, marginRight: `${COLUMN_GAP}px` }}>
                                                            <div className="text-center font-black text-red-500 uppercase tracking-widest mb-6 text-xs sticky top-0 bg-black/50 backdrop-blur-sm py-1 rounded z-30 border border-white/5">
                                                                L-Round {round}
                                                            </div>
                                                            <div className="relative h-full">
                                                                {roundMatches.map((m, idx) => {
                                                                    // Linear stacking for Losers
                                                                    const top = idx * CARD_TOTAL_H;

                                                                    // Explicit Line Calculation to Next Match
                                                                    let lineSvg = null;
                                                                    if (m.nextMatchId) {
                                                                        const targetMatch = losers.find(lm => lm.id === m.nextMatchId);
                                                                        if (targetMatch) {
                                                                            // Calculate relative Y distance to target
                                                                            const targetIdx = loserRounds[targetMatch.round].findIndex(tm => tm.id === targetMatch.id);
                                                                            const targetTop = targetIdx * CARD_TOTAL_H;
                                                                            const diffY = targetTop - top;

                                                                            // Check if target is in immediate next round column
                                                                            const roundDiff = targetMatch.round - round;
                                                                            const width = (roundDiff * (COLUMN_WIDTH + COLUMN_GAP)) - COLUMN_WIDTH;

                                                                            lineSvg = (
                                                                                <svg className="absolute top-0 left-full overflow-visible pointer-events-none z-0" width={width} height="1" style={{ top: '50%' }}>
                                                                                    <path
                                                                                        d={`M 0 0 C ${width / 2} 0, ${width / 2} ${diffY}, ${width} ${diffY}`}
                                                                                        fill="none" stroke="rgba(239,68,68,0.3)" strokeWidth="2"
                                                                                    />
                                                                                </svg>
                                                                            );
                                                                        }
                                                                    }

                                                                    return (
                                                                        <div key={m.id} className="absolute left-0 w-full" style={{ top: `${top}px` }}>
                                                                            <BracketMatchCard
                                                                                match={m}
                                                                                onEdit={openEditModal}
                                                                                onResult={handleUpdateMatchResult}
                                                                            />
                                                                            {lineSvg}
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

                                    {/* FINALS (Standalone Block positioned relative to end of brackets) */}
                                    {finals.length > 0 && (
                                        <div className="absolute top-0 right-0 flex flex-col justify-center h-full pl-20 border-l border-white/5" style={{ left: `${(wRoundKeys.length) * (COLUMN_WIDTH + COLUMN_GAP)}px` }}>
                                            <div className="font-black text-yellow-400 uppercase tracking-widest mb-6 text-xl text-center">Grand Finals</div>
                                            {finals.map(m => (
                                                <div key={m.id} className="mb-4">
                                                    <BracketMatchCard
                                                        match={m}
                                                        onEdit={openEditModal}
                                                        onResult={handleUpdateMatchResult}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTournament;
