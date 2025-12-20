
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

// --- BAN LIST LOGIC ---
const BANNED_IDS = new Set([
    // Gen 1
    144, 145, 146, 150, 151,
    // Gen 2
    243, 244, 245, 249, 250, 251,
    // Gen 3
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    // Gen 4
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
    // Gen 5
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    // Gen 6
    716, 717, 718, 719, 720, 721,
    // Gen 7 (Incl. Ultra Beasts)
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 
    793, 794, 795, 796, 797, 798, 799, // UBs
    800, 801, 802, 803, 804, 805, 806, 807, 808, 809,
    // Gen 8
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 905,
    // Gen 9 (Treasures of Ruin + Box Legends + DLC Legends/Mythics)
    1001, 1002, 1003, 1004, 1007, 1008, 1014, 1015, 1016, 1017, 1024, 1025
]);

const isBanned = (id: number) => BANNED_IDS.has(id);

// --- COMPONENTS ---

const PokemonTeamImage: React.FC<{ pokemon: Pokemon; className?: string }> = ({ pokemon, className = "" }) => {
    // ... (Image logic remains same, truncated for brevity in change block but assumes full code)
     const [imgSrc, setImgSrc] = useState<string>("");
    useEffect(() => {
        setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`);
    }, [pokemon]);

    return (
        <img src={imgSrc} alt={pokemon.name} className={`w-full h-full object-contain ${className}`} loading="lazy" />
    );
};

const PokemonDetailCard: React.FC<{ pokemon: Pokemon | null; revealed: boolean }> = ({ pokemon, revealed }) => {
    if (!revealed || !pokemon) return <div className="aspect-square bg-black/40 rounded-[2rem] border-2 border-white/5 flex items-center justify-center"><span className="text-4xl">?</span></div>;
    return (
        <div className="aspect-square bg-[#120507] rounded-[2rem] border-2 border-white/10 relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 p-4 pb-14 flex items-center justify-center">
                <PokemonTeamImage pokemon={pokemon} />
            </div>
            <div className="absolute bottom-0 w-full bg-black/60 text-center py-2">
                <span className="text-white font-bold uppercase text-xs">{pokemon.name}</span>
            </div>
        </div>
    );
};

const RuleCard: React.FC<{ title: string; icon: string; children: React.ReactNode; color?: string }> = ({ title, icon, children, color = "border-white/10" }) => (
    <div className={`bg-black/40 backdrop-blur-xl rounded-2xl border-2 ${color} p-6 shadow-2xl h-full`}>
        <div className="flex items-center gap-3 mb-4">
             <span className="text-3xl">{icon}</span> 
            <h3 className="text-xl font-black uppercase tracking-wider text-white">{title}</h3>
        </div>
        <div className="text-gray-300 text-sm space-y-2">{children}</div>
    </div>
);

// --- BRACKET VISUALIZER ---

const CARD_WIDTH = 260;
const CARD_HEIGHT = 100;
const X_GAP = 60;
const Y_GAP = 20;
const GROUP_Y_GAP = 100; // Gap between Winners and Losers bracket

const BracketMatchCard: React.FC<{ match: TournamentMatch, style: React.CSSProperties }> = ({ match, style }) => {
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
                absolute flex flex-col bg-[#120507] border-2 rounded-xl overflow-hidden shadow-xl z-10 transition-colors
                ${match.status === 'COMPLETED' ? 'border-brand-primary/60' : 'border-white/10'}
            `}
        >
            <div className="bg-black/40 px-3 py-1 flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                <span>{match.id}</span>
                <span className={match.status === 'COMPLETED' ? 'text-green-400' : 'text-yellow-500'}>{match.status}</span>
            </div>
            
            <div className={`flex-1 flex items-center justify-between px-3 ${isP1Winner ? 'bg-brand-primary/10' : ''}`}>
                <span className={`text-sm font-bold truncate ${isP1Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                    {match.player1 || 'TBD'}
                </span>
                {scoreObj.p1 && <span className="font-mono font-bold bg-black/40 px-1.5 rounded text-xs">{scoreObj.p1}</span>}
            </div>
            <div className="h-px bg-white/5"></div>
            <div className={`flex-1 flex items-center justify-between px-3 ${isP2Winner ? 'bg-brand-primary/10' : ''}`}>
                <span className={`text-sm font-bold truncate ${isP2Winner ? 'text-brand-primary' : 'text-gray-300'}`}>
                    {match.player2 || 'TBD'}
                </span>
                {scoreObj.p2 && <span className="font-mono font-bold bg-black/40 px-1.5 rounded text-xs">{scoreObj.p2}</span>}
            </div>
        </div>
    );
};

const BracketView: React.FC<{ matches: TournamentMatch[] }> = ({ matches }) => {
    // --- LAYOUT ENGINE ---
    const { nodes, connections, totalWidth, totalHeight } = useMemo(() => {
        const _nodes: { match: TournamentMatch, x: number, y: number }[] = [];
        const _connections: { x1: number, y1: number, x2: number, y2: number, type: 'win' | 'lose' }[] = [];
        
        // Split by group
        const winners = matches.filter(m => m.bracketGroup === 'winners').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const losers = matches.filter(m => m.bracketGroup === 'losers').sort((a,b) => a.round - b.round || a.matchIndex - b.matchIndex);
        const finals = matches.filter(m => m.bracketGroup === 'finals');

        // Helper to get round depth map
        const positions = new Map<string, {x:number, y:number}>();

        // 1. Layout Winners Bracket (Standard Tree)
        let maxWinnerY = 0;
        const winnerRounds = Math.max(...winners.map(m => m.round), 0);
        
        for (let r = 1; r <= winnerRounds; r++) {
            const roundMatches = winners.filter(m => m.round === r);
            roundMatches.forEach((m, idx) => {
                const x = (r - 1) * (CARD_WIDTH + X_GAP);
                let y = 0;

                if (r === 1) {
                    // Leaf nodes: sequential placement
                    y = idx * (CARD_HEIGHT + Y_GAP);
                } else {
                    // Parent nodes: Centered between children (feeders)
                    const feeders = winners.filter(prev => prev.round === r - 1 && prev.nextMatchId === m.id);
                    if (feeders.length > 0) {
                        const ySum = feeders.reduce((acc, f) => acc + (positions.get(f.id)?.y || 0), 0);
                        y = ySum / feeders.length;
                    } else {
                        // Fallback if structure is weird
                        y = idx * (CARD_HEIGHT + Y_GAP); 
                    }
                }

                positions.set(m.id, { x, y });
                _nodes.push({ match: m, x, y });
                maxWinnerY = Math.max(maxWinnerY, y + CARD_HEIGHT);
            });
        }

        // 2. Layout Losers Bracket (Offset Y)
        let losersStartY = maxWinnerY + GROUP_Y_GAP;
        const loserRounds = Math.max(...losers.map(m => m.round), 0);

        for (let r = 1; r <= loserRounds; r++) {
            const roundMatches = losers.filter(m => m.round === r);
            roundMatches.forEach((m, idx) => {
                const x = (r - 1) * (CARD_WIDTH + X_GAP); // Align rounds with winners roughly
                let y = 0;
                
                // For losers bracket, Round 1 is flat.
                // Subsequent rounds might feed from previous LB round OR drop from WB.
                // Simplified Logic: Align based on previous round feeders if exist, else stack.
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

        // 3. Layout Finals
        if (finals.length > 0) {
            const wbFinal = winners.find(m => m.round === winnerRounds);
            const finalX = (winnerRounds) * (CARD_WIDTH + X_GAP); // Next col
            // Center vertically between WB final and LB final if double elim, else just WB level
            const finalY = positions.get(wbFinal?.id || '')?.y || 0;
            
            finals.forEach((m, idx) => {
                const x = finalX + (idx * 50); // Offset if bracket reset exists
                const y = finalY;
                positions.set(m.id, { x, y });
                _nodes.push({ match: m, x, y });
            });
        }

        // 4. Generate Connections
        matches.forEach(m => {
            const start = positions.get(m.id);
            if (!start) return;

            // Connection to Winner Next Match
            if (m.nextMatchId) {
                const end = positions.get(m.nextMatchId);
                if (end) {
                    _connections.push({ x1: start.x + CARD_WIDTH, y1: start.y + CARD_HEIGHT/2, x2: end.x, y2: end.y + CARD_HEIGHT/2, type: 'win' });
                }
            }

            // Connection to Loser Bracket (Drop)
            if (m.loserNextMatchId) {
                const end = positions.get(m.loserNextMatchId);
                if (end) {
                    // Draw a dashed line to indicate dropping to losers
                    // We start from bottom center of card
                    _connections.push({ x1: start.x + CARD_WIDTH/2, y1: start.y + CARD_HEIGHT, x2: end.x, y2: end.y + CARD_HEIGHT/2, type: 'lose' });
                }
            }
        });

        // Calculate Canvas Size
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
                {/* Connections Layer */}
                <svg style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#555" />
                        </marker>
                    </defs>
                    {connections.map((c, i) => {
                        // Bezier Curve Logic
                        const midX = (c.x1 + c.x2) / 2;
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

                {/* Nodes Layer */}
                {nodes.map(n => (
                    <BracketMatchCard key={n.match.id} match={n.match} style={{ left: n.x, top: n.y }} />
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

const Tournament: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'brackets' | 'signup' | 'players'>('rules');
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Team Management State
  const [selectedTeam, setSelectedTeam] = useState<(Pokemon | null)[]>(new Array(6).fill(null));
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedRegistration, setHasStartedRegistration] = useState(false); 
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Tournament Config & State
  const [tournamentStatus, setTournamentStatus] = useState<TournamentStatus>('DRAFTING');
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loadingBracket, setLoadingBracket] = useState(false);

  // Players List State
  const [playersList, setPlayersList] = useState<TournamentEntry[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<TournamentEntry | null>(null);

  useEffect(() => {
    // ... (Pokemon Fetch logic same as before)
     const fetchPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();
        const formatted = data.results.map((p: any, idx: number) => ({
          id: idx + 1,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ')
        }));
        setPokemonList(formatted);
      } catch (e) { console.error(e); } finally { setLoadingPokemon(false); }
    };
    fetchPokemon();
  }, []);

  useEffect(() => {
      fetch(`${API_BASE_URL}/api/tournament/config`)
          .then(res => res.json())
          .then(data => setTournamentStatus(data.status || 'DRAFTING'))
          .catch(console.error);
  }, []);

  useEffect(() => { if (user?.id) fetchMyTeam(); }, [user]);
  useEffect(() => { fetchPlayers(); }, [activeTab]);

  useEffect(() => {
      if (activeTab === 'brackets') {
          fetchBracket();
          const interval = setInterval(() => fetchBracket(true), 5000);
          return () => clearInterval(interval);
      }
  }, [activeTab]);

  // ... (API Fetch functions: fetchMyTeam, fetchPlayers, fetchBracket - same as previous)
  const fetchMyTeam = async () => {
      if (!user?.id) return;
      setLoadingTeam(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/my-team?discordId=${user.id}`);
          if (res.ok) {
              const data = await res.json();
              if (data && data.registered) {
                  const filledTeam = [...(data.team || [])];
                  while (filledTeam.length < 6) filledTeam.push(null);
                  setSelectedTeam(filledTeam);
                  setIsLocked(data.isLocked || false);
                  setHasStartedRegistration(true);
              }
          }
      } catch (e) { console.error(e); } finally { setLoadingTeam(false); }
  };

  const fetchPlayers = async () => {
      if (playersList.length === 0) setLoadingPlayers(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/players?dev=true`);
          if (res.ok) setPlayersList(await res.json());
      } catch (e) { console.error(e); } finally { setLoadingPlayers(false); }
  };

  const fetchBracket = async (silent = false) => {
      if (!silent) setLoadingBracket(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/bracket`);
          if (res.ok) {
              const data = await res.json();
              setMatches(data.matches || []);
          }
      } catch(e) {} finally { if (!silent) setLoadingBracket(false); }
  };

  const filteredPokemon = useMemo(() => {
    if (!searchQuery) return pokemonList.slice(0, 50);
    return pokemonList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 100);
  }, [pokemonList, searchQuery]);

  // ... (Handlers: handleSelectPokemon, handleRemovePokemon, handleInitialRegister, handleSaveDraft, handleLockIn - same as previous)
   const handleSelectPokemon = (pokemon: Pokemon) => {
    if (isLocked || tournamentStatus === 'ONGOING') return;
    const emptySlot = selectedTeam.indexOf(null);
    if (emptySlot !== -1) {
      const newTeam = [...selectedTeam];
      newTeam[emptySlot] = pokemon;
      setSelectedTeam(newTeam);
    }
  };

  const handleRemovePokemon = (index: number) => {
    if (isLocked || tournamentStatus === 'ONGOING') return;
    const newTeam = [...selectedTeam];
    newTeam[index] = null;
    setSelectedTeam(newTeam);
  };
  
  const hasBannedPokemon = useMemo(() => selectedTeam.some(p => p !== null && isBanned(p.id)), [selectedTeam]);

  const handleInitialRegister = async () => {
      if (!user || tournamentStatus === 'ONGOING') return;
      setLoadingTeam(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discordId: user.id, minecraftUsername: user.minecraftUsername, team: new Array(6).fill(null) })
          });
          if (res.ok) setHasStartedRegistration(true);
          else alert("Registration failed.");
      } catch (e) { alert("Network error."); } finally { setLoadingTeam(false); }
  };

  const handleSaveDraft = async () => {
    if (!user || hasBannedPokemon || tournamentStatus === 'ONGOING' || isLocked) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
        const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discordId: user.id, minecraftUsername: user.minecraftUsername, team: selectedTeam })
        });
        if (res.ok) { setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 2000); } else setSaveStatus('error');
    } catch (e) { setSaveStatus('error'); } finally { setSaving(false); }
  };

  const handleLockIn = async () => {
      if (tournamentStatus !== 'LOCK_IN') return;
      if (selectedTeam.filter(p => p !== null).length < 1) { alert("Empty team!"); return; }
      if (!window.confirm("Lock in team?")) return;
      await handleSaveDraft();
      setSaving(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/lock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ discordId: user?.id }) });
          if (res.ok) { setIsLocked(true); setSaveStatus('success'); } else alert("Lock failed.");
      } catch(e) { alert("Lock failed."); } finally { setSaving(false); }
  };

  return (
    <div className="py-4 pb-8 font-sans text-white relative">
      <style>{`
        /* ... existing styles ... */
        .pokemon-grid::-webkit-scrollbar { width: 6px; }
        .pokemon-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .pokemon-grid::-webkit-scrollbar-thumb { background: #e5383b; border-radius: 10px; }
        .banned-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: #ef4444; color: white; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: bold; white-space: nowrap; opacity: 0; visibility: hidden; transition: all 0.2s ease; z-index: 50; pointer-events: none; margin-bottom: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        .group:hover .banned-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-4px); }
        .dock-pill { background: rgba(18, 5, 7, 0.65); backdrop-filter: blur(25px) saturate(160%); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5); height: 40px; }
        .nav-link-active { position: relative; color: #e5383b !important; background: rgba(229, 56, 59, 0.1); }
      `}</style>

      <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

      {/* ... (Header and Tabs logic same as before, simplified for brevity in change block but assumes full render) ... */}
       <div className="relative z-20 container mx-auto px-4 pt-12">
          {/* ... Top Bar ... */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-start items-center mb-6 gap-4">
            <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md h-10 shrink-0">
                <span>←</span> Back to Dashboard
            </Link>
            <div className="dock-pill rounded-full p-1 flex items-center gap-1 shadow-xl">
                 {['rules', 'signup', 'brackets', 'players'].map(t => (
                     <button key={t} onClick={() => setActiveTab(t as any)} className={`relative flex items-center gap-2 px-3 h-full transition-all duration-300 rounded-full ${activeTab === t ? 'nav-link-active' : 'text-gray-500 hover:text-white'}`}>
                         <span className="text-[9px] font-black uppercase tracking-[0.05em]">{t}</span>
                     </button>
                 ))}
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto space-y-6">
              {/* ... Header Dashboard ... */}

              <div className="min-h-[40vh] pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                  {/* ... Rules, Players, Signup tabs (omitted for brevity, assume unchanged) ... */}
                   {activeTab === 'rules' && <div className="p-8 bg-black/40 rounded-3xl border border-white/10"><h2 className="text-3xl font-black mb-4">Rules</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><RuleCard title="Format" icon="🏆">Single Elim, 6v6 roster, 4v4 battle, Lvl 50 cap.</RuleCard><RuleCard title="Bans" icon="🚫">No Legendaries/Mythicals/UBs. No Dynamax/Tera/Z-Moves.</RuleCard></div></div>}
                   
                   {activeTab === 'players' && (
                        <div className="bg-black/40 p-6 rounded-3xl border border-white/10">
                            <h2 className="text-2xl font-black mb-6">Registered Players ({playersList.length})</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {playersList.map((p, i) => (
                                    <button key={i} onClick={() => setSelectedPlayer(p)} className="bg-white/5 p-4 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center gap-3">
                                        <img src={`https://mc-heads.net/avatar/${p.minecraftUsername}/32`} className="rounded" />
                                        <div><div className="font-bold">{p.minecraftUsername}</div><div className="text-xs text-gray-500">{p.isLocked ? 'Ready' : 'Drafting'}</div></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                   )}

                   {activeTab === 'signup' && (
                        <div className="bg-black/40 p-8 rounded-3xl border border-white/10 text-center">
                            {!user ? <div>Login required.</div> : 
                                !hasStartedRegistration ? <button onClick={handleInitialRegister} className="bg-brand-primary px-8 py-4 rounded-xl font-bold text-white">JOIN NOW</button> :
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-black">Draft Your Team</h2>
                                        {tournamentStatus === 'LOCK_IN' && <button onClick={handleLockIn} disabled={selectedTeam.includes(null)} className="bg-green-600 px-6 py-2 rounded-lg font-bold">LOCK IN</button>}
                                    </div>
                                    <div className="grid grid-cols-6 gap-2 mb-6">
                                        {selectedTeam.map((p, i) => (
                                            <div key={i} className="aspect-square bg-black/50 rounded-xl border border-white/10 flex items-center justify-center relative group">
                                                {p ? <><PokemonTeamImage pokemon={p} /> <button onClick={() => handleRemovePokemon(i)} className="absolute top-1 right-1 bg-red-600 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100">x</button></> : <span className="text-2xl opacity-20">+</span>}
                                            </div>
                                        ))}
                                    </div>
                                    {!isLocked && <div className="bg-black/30 p-4 rounded-xl"><input type="text" placeholder="Search Pokemon..." className="bg-transparent w-full outline-none text-white font-bold" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} /><div className="grid grid-cols-8 gap-2 mt-4 max-h-60 overflow-y-auto pokemon-grid">{filteredPokemon.map(p => <button key={p.id} onClick={() => handleSelectPokemon(p)} disabled={isBanned(p.id)} className="aspect-square bg-white/5 rounded-lg hover:bg-white/10 disabled:opacity-30"><PokemonTeamImage pokemon={p} /></button>)}</div></div>}
                                </div>
                            }
                        </div>
                   )}

                   {activeTab === 'brackets' && (
                      <div className="relative z-10 h-[600px] flex flex-col">
                        {loadingBracket ? (
                            <div className="flex flex-col items-center justify-center h-full text-center"><div className="animate-spin text-4xl mb-4">⌛</div><div className="font-bold text-white">Loading Bracket...</div></div>
                        ) : matches.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 text-gray-500">Bracket Pending</div>
                        ) : (
                            <BracketView matches={matches} />
                        )}
                      </div>
                   )}
              </div>
          </div>
       </div>

       {/* Player Detail Modal */}
       {selectedPlayer && (
           <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
               <div className="bg-[#1a0b0e] p-8 rounded-3xl max-w-4xl w-full border border-white/10 relative">
                   <button onClick={() => setSelectedPlayer(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
                   <h2 className="text-3xl font-black mb-6">{selectedPlayer.minecraftUsername}</h2>
                   <div className="grid grid-cols-3 gap-4">
                       {selectedPlayer.team.map((p, i) => <PokemonDetailCard key={i} pokemon={p} revealed={true} />)}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
};

export default Tournament;
