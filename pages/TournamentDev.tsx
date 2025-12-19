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

type TournamentStatus = 'DRAFTING' | 'LOCK_IN' | 'ONGOING';

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
    // Gen 9
    1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1024, 1025
]);

const isBanned = (id: number) => BANNED_IDS.has(id);

// --- CACHE & HELPERS ---
const clientImageCache = new Map<string, boolean>();

const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .replace(/[.']/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
};

// --- COMPONENTS ---

const PokemonTeamImage: React.FC<{ pokemon: Pokemon; className?: string }> = ({ pokemon, className = "" }) => {
    const [imgSrc, setImgSrc] = useState<string>("");

    useEffect(() => {
        const verifyImage = async () => {
            const cobbleName = getFormattedName(pokemon.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;

            if (clientImageCache.has(primaryUrl)) {
                const isValid = clientImageCache.get(primaryUrl);
                setImgSrc(isValid ? primaryUrl : fallback3d);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();
                clientImageCache.set(primaryUrl, data.valid);

                if (data.valid) {
                    setImgSrc(primaryUrl);
                } else {
                    setImgSrc(fallback3d);
                }
            } catch (error) {
                setImgSrc(fallback3d);
            }
        };

        verifyImage();
    }, [pokemon]);

    const handleImageError = () => {
        if (imgSrc.includes('cobblemon.tools')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`);
        } else if (imgSrc.includes('other/home')) {
            setImgSrc(`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`);
        } else {
            setImgSrc(`https://via.placeholder.com/300x400/000000/FFFFFF?text=${encodeURIComponent(pokemon.name)}`);
        }
    };

    return (
        <OptimizedImage 
            src={imgSrc} 
            alt={pokemon.name} 
            className={`w-full h-full object-contain ${className}`}
            contain
            onError={handleImageError}
        />
    );
};

const RuleCard: React.FC<{ title: string; icon: string; children: React.ReactNode; color?: string }> = ({ title, icon, children, color = "border-white/10" }) => (
    <div className={`bg-black/40 backdrop-blur-md rounded-2xl border ${color} p-6 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300 h-full`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider flex items-center gap-3 relative z-10">
            <span className="text-2xl">{icon}</span> {title}
        </h3>
        <div className="text-gray-300 text-xs md:text-sm space-y-3 relative z-10 leading-relaxed">
            {children}
        </div>
    </div>
);

const TournamentDev: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'brackets' | 'signup' | 'players'>('rules');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Team Management State
  const [selectedTeam, setSelectedTeam] = useState<(Pokemon | null)[]>(new Array(6).fill(null));
  const [isLocked, setIsLocked] = useState(false);
  const [hasStartedRegistration, setHasStartedRegistration] = useState(false); 
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Tournament Config State
  const [tournamentStatus, setTournamentStatus] = useState<TournamentStatus>('DRAFTING');

  // Players List State
  const [playersList, setPlayersList] = useState<TournamentEntry[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch all Pokemon
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();
        const formatted = data.results.map((p: any, idx: number) => ({
          id: idx + 1,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/-/g, ' ')
        }));
        setPokemonList(formatted);
      } catch (e) {
        console.error("Failed to fetch pokemon list", e);
      } finally {
        setLoadingPokemon(false);
      }
    };
    fetchPokemon();
  }, []);

  // Fetch Tournament Config
  useEffect(() => {
      fetch(`${API_BASE_URL}/api/tournament/config`)
          .then(res => res.json())
          .then(data => {
              setTournamentStatus(data.status || 'DRAFTING');
          })
          .catch(e => console.error("Config fetch error", e));
  }, []);

  // Fetch User Team Logic
  useEffect(() => {
      if (user?.id) {
          fetchMyTeam();
      }
  }, [user]);

  // Fetch Players Logic
  useEffect(() => {
      if (activeTab === 'players') {
          fetchPlayers();
      }
  }, [activeTab]);

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
      } catch (e) {
          console.error("Failed to fetch team", e);
      } finally {
          setLoadingTeam(false);
      }
  };

  const fetchPlayers = async () => {
      setLoadingPlayers(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/players`);
          if (res.ok) {
              setPlayersList(await res.json());
          }
      } catch (e) { console.error(e); } 
      finally { setLoadingPlayers(false); }
  };

  const filteredPokemon = useMemo(() => {
    if (!searchQuery) return pokemonList.slice(0, 50);
    return pokemonList.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 100);
  }, [pokemonList, searchQuery]);

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

  const hasBannedPokemon = useMemo(() => {
      return selectedTeam.some(p => p !== null && isBanned(p.id));
  }, [selectedTeam]);

  const handleInitialRegister = async () => {
      if (!user || tournamentStatus === 'ONGOING') return;
      setLoadingTeam(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  discordId: user.id,
                  minecraftUsername: user.minecraftUsername,
                  team: new Array(6).fill(null)
              })
          });
          
          if (res.ok) {
              setHasStartedRegistration(true);
          } else {
              alert("Registration failed. Please try again.");
          }
      } catch (e) {
          alert("Network error.");
      } finally {
          setLoadingTeam(false);
      }
  };

  const handleSaveDraft = async () => {
    if (!user || hasBannedPokemon || tournamentStatus === 'ONGOING' || isLocked) return;
    setSaving(true);
    setSaveStatus('idle');
    try {
        const res = await fetch(`${API_BASE_URL}/api/tournament/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                discordId: user.id,
                minecraftUsername: user.minecraftUsername,
                team: selectedTeam
            })
        });
        
        if (res.ok) {
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
            setSaveStatus('error');
        }
    } catch (e) {
        setSaveStatus('error');
    } finally {
        setSaving(false);
    }
  };

  const handleLockIn = async () => {
      if (tournamentStatus !== 'LOCK_IN') return;
      if (selectedTeam.filter(p => p !== null).length < 1) {
          alert("You cannot lock an empty team!");
          return;
      }
      if (!window.confirm("Are you sure you want to LOCK IN your team? You will NOT be able to edit it afterwards.")) return;

      await handleSaveDraft();

      setSaving(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/tournament/lock`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discordId: user?.id })
          });
          if (res.ok) {
              setIsLocked(true);
              setSaveStatus('success');
          } else {
              const err = await res.json();
              alert(err.error || "Lock failed.");
          }
      } catch(e) { alert("Lock failed."); }
      finally { setSaving(false); }
  };

  return (
    <div className="py-4 pb-8 font-sans text-white relative">
      <style>{`
        .dev-stripe {
            background: repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px);
        }
        .pokemon-grid::-webkit-scrollbar { width: 6px; }
        .pokemon-grid::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .pokemon-grid::-webkit-scrollbar-thumb { background: #e5383b; border-radius: 10px; }
        
        .banned-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #ef4444;
            color: white;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: all 0.2s ease;
            z-index: 50;
            pointer-events: none;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .banned-tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border-width: 5px;
            border-style: solid;
            border-color: #ef4444 transparent transparent transparent;
        }
        .group:hover .banned-tooltip {
            opacity: 1;
            visibility: visible;
            transform: translateX(-50%) translateY(-4px);
        }

        .dock-pill {
            background: rgba(18, 5, 7, 0.65);
            backdrop-filter: blur(25px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
            height: 40px;
        }
        
        .nav-link-active {
            position: relative;
            color: #e5383b !important;
            background: rgba(229, 56, 59, 0.1);
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-2 dev-stripe z-[100] opacity-80"></div>
      <div className="fixed top-2 right-1/2 transform translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-b-xl font-black text-xs uppercase tracking-widest z-[100] shadow-lg border border-white/20">
          DEV ENVIRONMENT
      </div>

      <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

      <div className="relative z-20 container mx-auto px-4 pt-12">
        {/* Top Utility Bar */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-start items-center mb-6 gap-4">
            <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md h-10 shrink-0">
                <span>←</span> Back to Dashboard
            </Link>

            <div className="dock-pill rounded-full p-1 flex items-center gap-1 shadow-xl">
                {[
                  { id: 'rules', label: 'RULES', icon: '📜' },
                  { id: 'signup', label: 'JOIN', icon: '📝', notify: hasStartedRegistration && !isLocked && tournamentStatus !== 'ONGOING' },
                  { id: 'brackets', label: 'BRACKET', icon: '📊' },
                  { id: 'players', label: 'PLAYERS', icon: '👥' }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      relative flex items-center gap-2 px-3 h-full transition-all duration-300 rounded-full
                      ${activeTab === tab.id 
                          ? 'nav-link-active' 
                          : 'text-gray-500 hover:text-white group'}
                    `}
                  >
                      <span className="text-sm md:text-base transition-transform group-hover:scale-110">{tab.icon}</span>
                      <span className="text-[9px] font-black uppercase tracking-[0.05em]">{tab.label}</span>
                      {tab.notify && <div className="absolute top-1 right-1 w-1 h-1 bg-brand-primary rounded-full animate-pulse shadow-[0_0_8px_#e5383b]"></div>}
                  </button>
                ))}
            </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/10 rounded-[2.5rem] p-6 md:p-8 gap-6 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner border border-brand-primary/30 p-1">
                    <img src="https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif" alt="Tournament Logo" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1 text-white">
                        NISAMON <span className="text-brand-primary">TOURNAMENT</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-gray-400 tracking-widest">Season 1</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-center">
                <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px] h-14">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Players</span>
                    <span className="text-xl font-black text-white">{playersList.length}</span>
                </div>
                <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px] h-14">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Phase</span>
                    <span className={`text-xl font-black uppercase ${tournamentStatus === 'ONGOING' ? 'text-red-500' : tournamentStatus === 'LOCK_IN' ? 'text-green-500' : 'text-amber-500'}`}>
                        {tournamentStatus.replace('_', '-')}
                    </span>
                </div>
                <button 
                    onClick={() => setActiveTab('signup')}
                    disabled={tournamentStatus === 'ONGOING' && !hasStartedRegistration}
                    className={`
                        text-white font-black px-8 h-14 rounded-2xl shadow-lg transition-all uppercase tracking-widest text-sm border-b-4 flex items-center justify-center flex-1 md:flex-none min-w-[140px]
                        ${tournamentStatus === 'ONGOING' && !hasStartedRegistration 
                            ? 'bg-gray-800 border-gray-900 cursor-not-allowed text-gray-500' 
                            : 'bg-brand-primary hover:bg-red-600 hover:scale-105 border-red-800'}
                    `}
                >
                    {tournamentStatus === 'ONGOING' && !hasStartedRegistration ? 'Closed' : 'Sign Up'}
                </button>
            </div>
          </div>

          {/* Content Viewport */}
          <div className="min-h-[40vh] pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {activeTab === 'rules' && (
                <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="max-w-4xl mx-auto space-y-12 text-gray-300">
                        
                        {/* Header */}
                        <div className="text-center border-b border-white/10 pb-8">
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Official Rulebook</h2>
                            <p className="text-lg text-gray-400">
                                Format: <span className="text-white font-bold">Singles 4v4</span> • Level Cap: <span className="text-white font-bold">50</span> • Bracket: <span className="text-white font-bold">Single Elimination</span>
                            </p>
                            <p className="text-sm mt-2 text-gray-500 italic">Rules are subject to change by administrators at any time.</p>
                        </div>

                        {/* Section 1: General */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-brand-primary">01.</span> General Guidelines
                            </h3>
                            <ul className="list-disc list-inside space-y-2 pl-4">
                                <li>Matches are played as a <strong>4v4 Singles Battle</strong> using the standard Cobblemon battle interface.</li>
                                <li>All Pokémon will be automatically set to <strong>Level 50</strong> during the battle.</li>
                                <li>Players must register a team of <strong>6 Pokémon</strong> but will select 4 to bring into each battle.</li>
                                <li>Disconnections during a match will be reviewed by admins; intentional disconnects result in disqualification.</li>
                                <li>Match reporting must be done within 10 minutes of match completion via the Referee or Discord.</li>
                            </ul>
                        </div>

                        {/* Section 2: Restrictions */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-brand-primary">02.</span> Pokémon Restrictions
                            </h3>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                <p className="mb-4 font-bold text-white">The following Pokémon categories are <span className="text-red-500">BANNED</span>:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2"><span className="text-red-500">✕</span> Legendary Pokémon</div>
                                    <div className="flex items-center gap-2"><span className="text-red-500">✕</span> Mythical Pokémon</div>
                                    <div className="flex items-center gap-2"><span className="text-red-500">✕</span> Ultra Beasts</div>
                                    <div className="flex items-center gap-2"><span className="text-red-500">✕</span> Paradox Pokémon</div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Clauses */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-brand-primary">03.</span> Competitive Clauses
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">Species Clause</h4>
                                    <p className="text-sm">A player cannot have two Pokémon with the same National Pokédex number on their team.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">Item Clause</h4>
                                    <p className="text-sm">No two Pokémon on a team can hold the same item.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">Sleep Clause</h4>
                                    <p className="text-sm">If a player has already put a Pokémon on the opponent's side to sleep and it is still asleep, they cannot put another to sleep.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">Evasion Clause</h4>
                                    <p className="text-sm">Moves that minimize or increase evasion (e.g., Minimize, Double Team) are banned.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">OHKO Clause</h4>
                                    <p className="text-sm">One-Hit KO moves (Fissure, Guillotine, Horn Drill, Sheer Cold) are banned.</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-white">Endless Battle Clause</h4>
                                    <p className="text-sm">Players cannot intentionally prevent a match from ending (e.g., using Leppa Berry recycle loops indefinitely).</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Specific Bans */}
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <span className="text-brand-primary">04.</span> Move, Ability & Item Bans
                            </h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-red-400 mb-2 uppercase tracking-wider text-xs">Banned Abilities</h4>
                                    <p className="text-sm">Moody, Arena Trap, Shadow Tag, Power Construct.</p>
                                </div>
                                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-red-400 mb-2 uppercase tracking-wider text-xs">Banned Moves</h4>
                                    <p className="text-sm">Baton Pass, Revival Blessing, Last Respects, Shed Tail, Assist.</p>
                                </div>
                                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-red-400 mb-2 uppercase tracking-wider text-xs">Banned Items</h4>
                                    <p className="text-sm">King's Rock, Razor Fang, Bright Powder, Lax Incense.</p>
                                </div>
                                <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <h4 className="font-bold text-red-400 mb-2 uppercase tracking-wider text-xs">Banned Gimmicks</h4>
                                    <p className="text-sm">Terastallization (Tera), Dynamax/Gigantamax, Z-Moves, Mega Evolution.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {activeTab === 'brackets' && (
              <div className="relative z-10 text-center flex flex-col items-center justify-center py-20 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-9xl mb-8 opacity-20">📊</div>
                <h2 className="text-5xl font-black text-white uppercase tracking-widest mb-4">Bracket Pending</h2>
                <p className="text-gray-400 text-xl max-w-lg mx-auto leading-relaxed">Generated after Phase 2 ends.</p>
              </div>
            )}

            {activeTab === 'players' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Combatant Roster</h2>
                    <div className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">{playersList.length} Registered</div>
                  </div>
                  {loadingPlayers ? (<div className="text-center py-20 animate-spin">⌛</div>) : playersList.length === 0 ? (<div className="text-center py-24 text-gray-600 font-bold italic">No combatants reported.</div>) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {playersList.map((entry, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 group flex flex-col gap-5">
                                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                      <img src={`https://mc-heads.net/avatar/${entry.minecraftUsername}/48`} className="w-14 h-14 rounded-2xl border-2 border-white/10" alt={entry.minecraftUsername} />
                                      <div className="flex-1 min-w-0">
                                          <div className="font-black text-white text-xl truncate">{entry.minecraftUsername}</div>
                                          <div className={`text-[10px] font-black uppercase flex items-center gap-2 ${entry.isLocked ? 'text-green-400' : 'text-amber-400'}`}><span className={`w-2 h-2 rounded-full ${entry.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>{entry.isLocked ? 'Ready' : 'Drafting'}</div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                      {entry.isLocked ? entry.team.map((p, pIdx) => (<div key={pIdx} className="aspect-square bg-black/40 rounded-xl border border-white/5 p-1"><PokemonTeamImage pokemon={p!} /></div>)) : Array(6).fill(null).map((_, i) => (<div key={i} className="aspect-square bg-black/40 rounded-xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl opacity-40">?</div>))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            )}

            {activeTab === 'signup' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-8">
                    <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center text-5xl opacity-40">🔒</div>
                    <div className="space-y-2"><h2 className="text-3xl font-black text-white uppercase tracking-tighter">Login Required</h2><p className="text-gray-400 max-w-sm mx-auto text-sm">Discord identification required.</p></div>
                    <UserProfile className="scale-110" />
                  </div>
                ) : loadingTeam ? (<div className="text-center py-20">Retrieving...</div>) : !hasStartedRegistration && !isLocked ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-8">
                    {tournamentStatus === 'ONGOING' ? (
                        <div className="bg-red-900/20 border-2 border-red-500/30 p-12 rounded-[2.5rem] flex flex-col items-center gap-4">
                            <span className="text-6xl">⛔</span>
                            <h2 className="text-4xl font-black text-white uppercase italic">Registration Closed</h2>
                            <p className="text-gray-400">The tournament has already begun. Signups are no longer available for this season.</p>
                        </div>
                    ) : (
                        <>
                            <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/128`} alt="MC" className="relative w-36 h-36 rounded-[2.5rem] border-4 border-brand-primary bg-black shadow-2xl" />
                            <div className="space-y-3"><h2 className="text-4xl font-black text-white uppercase tracking-tighter">Greetings, <span className="text-brand-primary">{user.minecraftUsername}</span>!</h2><p className="text-gray-400 max-w-lg mx-auto text-base">Verified. Click below to begin drafting.</p></div>
                            <button onClick={handleInitialRegister} className="bg-brand-primary hover:bg-red-600 text-white font-black text-xl py-5 px-12 rounded-[2rem] shadow-xl transition-all transform hover:scale-105 uppercase tracking-widest border-b-4 border-red-800">JOIN TOURNAMENT</button>
                        </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-10">
                    {(isLocked || tournamentStatus === 'ONGOING') && (
                        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2.5rem] p-6 text-center shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                            <h3 className="font-black text-green-400 uppercase tracking-widest text-lg">{tournamentStatus === 'ONGOING' ? '⚔️ TOURNAMENT ONGOING' : '🛡️ ROSTER SECURED'}</h3>
                            <p className="text-green-200/60 text-xs">Selection locked and synced with database.</p>
                        </div>
                    )}
                    <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[2.5rem] border border-white/10 w-fit mx-auto md:mx-0 shadow-xl">
                      <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/64`} alt="Head" className="w-16 h-16 rounded-2xl border-2 border-brand-primary bg-black shadow-lg" />
                      <div className="text-left"><h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.minecraftUsername}</h3><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isLocked || tournamentStatus === 'ONGOING' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>{isLocked || tournamentStatus === 'ONGOING' ? 'Ready' : 'Drafting'}</span></div>
                    </div>
                    <div className="space-y-6">
                      <h3 className="text-2xl font-black uppercase tracking-tighter px-4">Combat Team <span className="text-brand-primary">(Roster)</span></h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-2">
                        {selectedTeam.map((p, idx) => {
                          const banned = p !== null && isBanned(p.id);
                          return (
                            <div key={idx} className={`aspect-square rounded-[2rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 ${p ? (banned ? 'bg-red-900/20 border-red-500' : 'bg-gradient-to-br from-brand-primary/10 to-black/80 border-brand-primary shadow-2xl scale-[1.03]') : 'bg-black/40 border-white/5 border-dashed opacity-50'}`}>
                              {p ? (<><div className="w-4/5 h-4/5 relative z-10"><PokemonTeamImage pokemon={p} />{banned && (<div className="absolute inset-0 bg-red-600/30 rounded-full flex items-center justify-center"><span className="text-white text-3xl font-black drop-shadow-lg">✕</span></div>)}</div><div className="absolute bottom-3 left-0 right-0 px-2 z-20"><div className={`text-[8px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white' : 'bg-black/60 text-white border-white/10'}`}>{p.name}</div></div>{banned && <div className="banned-tooltip">RESTRICTED</div>}{!isLocked && tournamentStatus !== 'ONGOING' && (<button onClick={() => handleRemovePokemon(idx)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-[10px] font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 border-2 border-white">✕</button>)}</>) : (<span className="text-3xl text-gray-800 font-black">+</span>)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {!isLocked && tournamentStatus !== 'ONGOING' && (
                        <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-6 space-y-6 shadow-2xl">
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-center"><h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Tactical Database</h4><input type="text" placeholder="SEARCH..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full md:w-80 bg-black/60 border border-white/10 rounded-2xl py-3 px-6 text-sm font-bold text-white focus:border-brand-primary outline-none" /></div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pokemon-grid pr-2 py-2">
                                {loadingPokemon ? (<div>...</div>) : filteredPokemon.map(p => {
                                        const isSelected = selectedTeam.some(sp => sp?.id === p.id);
                                        const isFull = !selectedTeam.includes(null);
                                        const banned = isBanned(p.id);
                                        return (<button key={p.id} disabled={isSelected || isFull || banned} onClick={() => handleSelectPokemon(p)} className={`aspect-square rounded-2xl flex items-center justify-center p-2 transition-all relative group ${isSelected ? 'bg-brand-primary/20 border-brand-primary border-2 opacity-50' : (isFull || banned) ? 'bg-gray-900 opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:border-brand-primary/50'}`} title={p.name}><div className="w-full h-full relative"><PokemonTeamImage pokemon={p} />{banned && <div className="absolute top-0 right-0 bg-red-600 rounded-full w-3 h-3 border border-black shadow-md flex items-center justify-center text-[8px] font-black">!</div>}</div>{banned && <div className="banned-tooltip">BANNED</div>}</button>);
                                    })
                                }
                            </div>
                        </div>
                    )}
                    {!isLocked && tournamentStatus !== 'ONGOING' && (
                        <div className="pt-6 flex flex-col md:flex-row justify-center items-center gap-6">
                            <button onClick={handleSaveDraft} disabled={saving || hasBannedPokemon} className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 hover:bg-white/20 text-white border-b-4 border-white/20 flex-1">{saveStatus === 'success' ? 'SYNCED ✓' : saving ? 'SYNCING...' : 'SAVE DRAFT'}</button>
                            {tournamentStatus === 'LOCK_IN' && (
                                <button onClick={handleLockIn} disabled={saving || selectedTeam.includes(null) || hasBannedPokemon} className="px-12 py-4 rounded-2xl text-lg font-black uppercase tracking-tighter shadow-2xl flex-[2] bg-green-600 hover:bg-green-500 text-white border-green-800 border-b-4">🔒 FINALIZE & LOCK TEAM</button>
                            )}
                        </div>
                    )}
                    {tournamentStatus === 'ONGOING' && !isLocked && hasStartedRegistration && (
                        <div className="bg-amber-900/20 border-2 border-amber-500/30 p-8 rounded-[2.5rem] text-center">
                            <span className="text-4xl mb-4 block">⌛</span>
                            <h3 className="text-2xl font-black text-white uppercase italic mb-2">Phase Expired</h3>
                            <p className="text-gray-400">The tournament has started. Drafting is closed, and unfinalized teams have been disqualified.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDev;