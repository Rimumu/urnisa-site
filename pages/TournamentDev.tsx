
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

// --- BAN LIST LOGIC ---
// Standard IDs for Legendaries, Mythicals, and Ultra Beasts
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
  const [hasStartedRegistration, setHasStartedRegistration] = useState(false); // Controls Step 1 vs Step 2
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [lockEnabled, setLockEnabled] = useState(false); // Global Lock Status

  // Players List State
  const [playersList, setPlayersList] = useState<TournamentEntry[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  // Fetch all Pokemon from PokeAPI for the database
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

  // Fetch Tournament Config (Lock Status)
  useEffect(() => {
      fetch(`${API_BASE_URL}/api/tournament/config`)
          .then(res => res.json())
          .then(data => setLockEnabled(!!data.lockEnabled))
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
    if (isLocked) return;
    const emptySlot = selectedTeam.indexOf(null);
    if (emptySlot !== -1) {
      const newTeam = [...selectedTeam];
      newTeam[emptySlot] = pokemon;
      setSelectedTeam(newTeam);
    }
  };

  const handleRemovePokemon = (index: number) => {
    if (isLocked) return;
    const newTeam = [...selectedTeam];
    newTeam[index] = null;
    setSelectedTeam(newTeam);
  };

  const hasBannedPokemon = useMemo(() => {
      return selectedTeam.some(p => p !== null && isBanned(p.id));
  }, [selectedTeam]);

  // Initial Registration (Empty Team)
  const handleInitialRegister = async () => {
      if (!user) return;
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
    if (!user || hasBannedPokemon) return;
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
      if (!lockEnabled) return;
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
    <div className="min-h-screen py-4 pb-32 font-sans text-white relative">
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

        .command-dock {
            background: rgba(18, 5, 7, 0.85);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 -10px 40px rgba(0,0,0,0.6);
        }
        
        .nav-btn-active {
            position: relative;
        }
        .nav-btn-active::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 40%;
            height: 3px;
            background: currentColor;
            border-radius: 99px;
            box-shadow: 0 0 10px currentColor;
        }
      `}</style>

      <div className="fixed top-0 left-0 w-full h-2 dev-stripe z-[100] opacity-80"></div>
      <div className="fixed top-2 right-1/2 transform translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-b-xl font-black text-xs uppercase tracking-widest z-[100] shadow-lg border border-white/20">
          DEV ENVIRONMENT
      </div>

      <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

      <div className="relative z-20 container mx-auto px-4 pt-12">
        <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md mb-6">
            <span>←</span> Back to Dashboard
        </Link>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/10 rounded-[2.5rem] p-6 md:p-8 gap-6 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black/40 rounded-3xl flex items-center justify-center overflow-hidden shadow-inner border border-brand-primary/30 p-1">
                    <img src="https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif" alt="Tournament Logo" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none mb-1">
                        NISAMON <span className="text-brand-primary">TOURNAMENT</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded uppercase font-bold text-gray-400 tracking-widest">1st Iteration</span>
                        <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-black uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Live Stats Active
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px]">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Entrants</span>
                    <span className="text-xl font-black text-white">{playersList.length}</span>
                </div>
                <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex flex-col items-center justify-center flex-1 md:flex-none min-w-[100px]">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Status</span>
                    <span className={`text-xl font-black ${lockEnabled ? 'text-green-500' : 'text-amber-500'}`}>
                        {lockEnabled ? 'LOCK-IN' : 'DRAFTING'}
                    </span>
                </div>
            </div>
          </div>

          {/* Content Viewport */}
          <div className="min-h-[60vh] pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none fixed"></div>

            {/* RULES SECTION */}
            {activeTab === 'rules' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-brand-primary/20 to-black/60 backdrop-blur-xl rounded-[2.5rem] border border-brand-primary/50 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-6xl md:text-8xl">⚔️</div>
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Tournament Structure</h2>
                            <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                Single-elimination bracket of a <span className="text-white font-black underline">Singles 4v4</span> showdown. Roster of 6 but pick 4 each battle. Level 50 Cap.
                            </p>
                        </div>
                    </div>
                </div>

                <RuleCard title="Banned Gimmicks" icon="🚫" color="border-red-500/30">
                    <ul className="list-disc list-inside space-y-2 font-bold text-red-200">
                        <li>Tera</li>
                        <li>Z-Move</li>
                        <li>Dynamax</li>
                        <li>Mega-Evolution</li>
                    </ul>
                </RuleCard>

                <RuleCard title="Pokemon Restrictions" icon="🔒" color="border-orange-500/30">
                    <div className="space-y-4">
                        <ul className="list-disc list-inside space-y-1 font-bold text-orange-200">
                            <li>No Legendary Pokémon</li>
                            <li>No Mythical Pokémon</li>
                            <li>No Ultra Beasts</li>
                        </ul>
                        <div className="pt-2 border-t border-white/10">
                            <p className="font-black text-white mb-1">Species Clause:</p>
                            <p>Cannot have two Pokémon of the same Dex number (e.g., no two Charizard).</p>
                        </div>
                    </div>
                </RuleCard>

                <RuleCard title="Competitive Clauses" icon="⚖️" color="border-blue-500/30">
                    <ul className="space-y-3">
                        <li><span className="font-bold text-white">Item Clause:</span> No two Pokémon may hold the same item.</li>
                        <li><span className="font-bold text-white">Sleep Clause:</span> Cannot put more than one opponent to sleep at the same time.</li>
                        <li><span className="font-bold text-white">Endless Battle Clause:</span> No intentional infinite loops (e.g. Leppa + Recycle + Heal Pulse).</li>
                    </ul>
                </RuleCard>

                <RuleCard title="Move & Ability Bans" icon="🪄" color="border-purple-500/30">
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <p className="font-black text-white text-[10px] uppercase mb-1">Move Clauses:</p>
                            <p className="text-xs">Evasion Clause (Double Team, Minimize), OHKO Clause (Guillotine, Horn Drill, Sheer Cold, Fissure).</p>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                            <p className="font-black text-white text-[10px] uppercase mb-1">Specific Move Bans:</p>
                            <p className="text-xs">Baton Pass, Revival Blessing, Arena Trap, Shadow Tag, Last Respects, Shed Tail, Assist.</p>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                            <p className="font-black text-white text-[10px] uppercase mb-1">Ability Ban:</p>
                            <p className="text-xs font-bold text-purple-200">Moody ability is banned.</p>
                        </div>
                    </div>
                </RuleCard>

                <RuleCard title="Item Bans" icon="📦" color="border-amber-500/30">
                    <ul className="grid grid-cols-2 gap-2 font-bold text-amber-200">
                        <li>• Bright Powder</li>
                        <li>• Lax Incense</li>
                        <li>• King's Rock</li>
                        <li>• Razor Fang</li>
                        <li>• Quick Claw</li>
                    </ul>
                </RuleCard>

                <RuleCard title="Conduct & Etiquette" icon="📋" color="border-green-500/30">
                    <div className="space-y-4">
                        <div>
                            <p className="font-black text-white mb-1">General Rules:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                               <li>Instant DQ for rule breaking</li>
                                <li>No intentional stalling/disconnects</li>
                                <li>Report matches within 10 mins</li>
                                <li>Admin decisions are FINAL</li>
                            </ul>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                            <p className="font-black text-white mb-1">Spectator Rules:</p>
                            <ul className="list-disc list-inside text-xs space-y-1">
                                <li>Mute mic / Use Push-to-Talk</li>
                                <li>No distracting contestants</li>
                                <li>Keep Pokemon in balls/on shoulder</li>
                            </ul>
                        </div>
                    </div>
                </RuleCard>
              </div>
            )}

            {/* BRACKET SECTION */}
            {activeTab === 'brackets' && (
              <div className="relative z-10 text-center flex flex-col items-center justify-center py-24 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-9xl mb-8 opacity-20 filter drop-shadow-[0_0_30px_rgba(247,197,72,0.3)]">📊</div>
                <h2 className="text-5xl font-black text-white uppercase tracking-widest mb-4">Bracket Pending</h2>
                <p className="text-gray-400 text-xl max-w-lg mx-auto leading-relaxed">
                    The combat matrix is being generated. <br/>
                    Brackets will go live once <span className="text-brand-accent font-bold">Registration Phase</span> concludes.
                </p>
                <div className="mt-12 flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce delay-100"></div>
                    <div className="w-3 h-3 rounded-full bg-brand-accent animate-bounce delay-200"></div>
                </div>
              </div>
            )}

            {/* PLAYERS SECTION */}
            {activeTab === 'players' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Combatant Roster</h2>
                    <div className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-4 py-1.5 rounded-full font-black uppercase tracking-widest">
                        {playersList.length} Registered
                    </div>
                  </div>

                  {loadingPlayers ? (
                      <div className="text-center py-24 flex flex-col items-center gap-4">
                          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-black uppercase tracking-widest text-xs">Accessing Personnel Files...</p>
                      </div>
                  ) : playersList.length === 0 ? (
                      <div className="text-center py-24 text-gray-600 font-bold italic">No combatants have reported for duty.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {playersList.map((entry, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group flex flex-col gap-5">
                                  <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                      <img src={`https://mc-heads.net/avatar/${entry.minecraftUsername}/48`} className="w-14 h-14 rounded-2xl border-2 border-white/10 shadow-lg" alt={entry.minecraftUsername} />
                                      <div className="flex-1 min-w-0">
                                          <div className="font-black text-white text-xl truncate">{entry.minecraftUsername}</div>
                                          <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${entry.isLocked ? 'text-green-400' : 'text-amber-400'}`}>
                                              <span className={`w-2 h-2 rounded-full ${entry.isLocked ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                                              {entry.isLocked ? 'Ready for Battle' : 'Assembling Team'}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                      {entry.isLocked ? (
                                          entry.team.map((p, pIdx) => (
                                              <div key={pIdx} className="aspect-square bg-black/40 rounded-xl border border-white/5 p-1 hover:border-brand-primary/50 transition-colors" title={p?.name || "Empty"}>
                                                  {p ? <PokemonTeamImage pokemon={p} /> : <div className="w-full h-full flex items-center justify-center text-white/5 text-xs">•</div>}
                                              </div>
                                          ))
                                      ) : (
                                          Array(6).fill(null).map((_, i) => (
                                              <div key={i} className="aspect-square bg-black/40 rounded-xl border border-white/5 flex items-center justify-center text-gray-700 font-black text-xl select-none opacity-40">?</div>
                                          ))
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            )}

            {/* SIGNUP / DRAFTING SECTION */}
            {activeTab === 'signup' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                    <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center text-6xl shadow-inner border border-red-500/20 grayscale opacity-40">🔒</div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Registration Locked</h2>
                        <p className="text-gray-400 max-w-sm mx-auto">Access denied. Identification required via Discord to join the active tournament roster.</p>
                    </div>
                    <UserProfile className="scale-110" />
                  </div>
                ) : loadingTeam ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-black text-gray-500 uppercase tracking-widest text-xs">Retrieving Team Config...</p>
                    </div>
                ) : !hasStartedRegistration && !isLocked ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-10 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full scale-125 group-hover:bg-brand-primary/30 transition-all"></div>
                        <img 
                            src={`https://mc-heads.net/avatar/${user.minecraftUsername}/128`} 
                            alt="MC Head Large" 
                            className="relative w-40 h-40 rounded-[2.5rem] border-4 border-brand-primary bg-black shadow-2xl transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute -bottom-3 -right-3 bg-green-500 text-black text-xs font-black p-3 rounded-full border-4 border-[#1a0b0e] shadow-xl">READY</div>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Greetings, <span className="text-brand-primary">{user.minecraftUsername}</span>!</h2>
                        <p className="text-gray-400 max-w-lg mx-auto text-lg leading-relaxed font-medium">Your account is verified. Deploy your roster below to participate in the upcoming combat season.</p>
                    </div>

                    <button
                        onClick={handleInitialRegister}
                        className="bg-brand-primary hover:bg-red-600 text-white font-black text-2xl py-6 px-16 rounded-[2rem] shadow-[0_20px_50px_rgba(229,56,59,0.4)] transition-all transform hover:scale-110 active:scale-95 uppercase tracking-widest border-b-4 border-red-800"
                    >
                        INITIATE REGISTRATION
                    </button>
                  </div>
                ) : (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {isLocked && (
                        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2rem] p-6 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                            <span className="text-4xl">🛡️</span>
                            <div>
                                <h3 className="font-black text-green-400 uppercase tracking-widest text-lg">Combat Roster Secured</h3>
                                <p className="text-green-200/60 text-sm">Deployment confirmed. Your selection is locked and synced with the tournament database.</p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/10 w-fit mx-auto md:mx-0 shadow-xl">
                      <div className="relative">
                        <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/64`} alt="MC Head" className="w-20 h-20 rounded-2xl border-2 border-brand-primary bg-black shadow-lg" />
                        <div className="absolute -top-3 -right-3 bg-brand-primary text-white text-[10px] font-black p-2 rounded-full border-4 border-[#1a0b0e]">USR</div>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-3xl font-black text-white leading-none mb-2 uppercase tracking-tighter">{user.minecraftUsername}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <span className="text-[10px] font-mono font-bold text-gray-500 border border-white/10 px-2 py-0.5 rounded">ID: {user.id.substring(0,8)}...</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isLocked ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                {isLocked ? 'Deployed' : 'Drafting'}
                            </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end px-4 gap-4">
                        <h3 className="text-3xl font-black uppercase tracking-tighter">Combat Team <span className="text-brand-primary">(Roster)</span></h3>
                        <div className="flex items-center gap-4 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Active Slots</span>
                            <span className="text-lg font-black text-brand-primary font-mono">{selectedTeam.filter(p => p !== null).length}/6</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-2">
                        {selectedTeam.map((p, idx) => {
                          const banned = p !== null && isBanned(p.id);
                          return (
                            <div 
                              key={idx} 
                              className={`aspect-square rounded-[2.5rem] border-[3px] flex flex-col items-center justify-center relative group transition-all duration-500 
                                ${p 
                                    ? (banned ? 'bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20' : 'bg-gradient-to-br from-brand-primary/10 to-black/80 border-brand-primary shadow-2xl scale-[1.03]') 
                                    : 'bg-black/40 border-white/5 border-dashed opacity-50 hover:opacity-100 hover:border-white/20'}`}
                            >
                              {p ? (
                                <>
                                  <div className="w-4/5 h-4/5 relative z-10">
                                      <PokemonTeamImage pokemon={p} />
                                      {banned && (
                                          <div className="absolute inset-0 bg-red-600/30 backdrop-blur-[1px] rounded-full flex items-center justify-center">
                                              <span className="text-white text-3xl font-black drop-shadow-lg">✕</span>
                                          </div>
                                      )}
                                  </div>
                                  <div className="absolute bottom-4 left-0 right-0 px-3 z-20">
                                     <div className={`text-[9px] font-black uppercase text-center truncate py-1 rounded-full backdrop-blur-md border ${banned ? 'bg-red-600 text-white border-white/20' : 'bg-black/60 text-white border-white/10'}`}>
                                        {p.name}
                                     </div>
                                  </div>
                                  
                                  {banned && (
                                      <div className="banned-tooltip">RESTRICTED POKEMON</div>
                                  )}

                                  {!isLocked && (
                                      <button 
                                        onClick={() => handleRemovePokemon(idx)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-black shadow-xl opacity-0 group-hover:opacity-100 transition-all z-30 hover:scale-110 active:scale-90 border-2 border-white"
                                      >
                                        ✕
                                      </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-4xl text-gray-800 font-black">+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {!isLocked && (
                        <div className="bg-black/40 rounded-[3rem] border border-white/10 p-8 space-y-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
                            
                            <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Tactical Database</h4>
                                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider bg-red-950/40 px-3 py-1 rounded-full w-fit">
                                        Legendaries & Paradox Mons Prohibited
                                    </p>
                                </div>
                                <div className="relative w-full md:w-96">
                                    <input 
                                        type="text" 
                                        placeholder="SEARCH POKEMON UNIT..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/60 border border-white/10 rounded-2xl py-4 px-8 text-sm font-bold text-white focus:border-brand-primary outline-none transition-all placeholder:text-gray-700 tracking-wider shadow-inner"
                                    />
                                    <span className="absolute right-6 top-4 opacity-30 pointer-events-none text-xl">🔍</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4 max-h-[450px] overflow-y-auto pokemon-grid pr-4 py-2">
                                {loadingPokemon ? (
                                    <div className="col-span-full py-10 text-center animate-pulse text-gray-600 font-black uppercase tracking-widest text-xs">Accessing Pokedex Core...</div>
                                ) : filteredPokemon.length === 0 ? (
                                    <div className="col-span-full py-10 text-center text-gray-700 font-bold italic">No match found in archive.</div>
                                ) : (
                                    filteredPokemon.map(p => {
                                        const isSelected = selectedTeam.some(sp => sp?.id === p.id);
                                        const isFull = !selectedTeam.includes(null);
                                        const banned = isBanned(p.id);
                                        return (
                                            <button
                                                key={p.id}
                                                disabled={isSelected || isFull || banned}
                                                onClick={() => handleSelectPokemon(p)}
                                                className={`aspect-square rounded-[1.5rem] flex items-center justify-center p-2 transition-all relative group 
                                                    ${isSelected ? 'bg-brand-primary/20 border-brand-primary border-2 opacity-50 cursor-not-allowed' : 
                                                      (isFull || banned) ? 'bg-gray-900 border-white/5 opacity-30 cursor-not-allowed grayscale' : 
                                                      'bg-white/5 border border-white/10 hover:border-brand-primary/50 hover:bg-brand-primary/10 hover:scale-110 active:scale-95 shadow-lg'}`}
                                                title={p.name}
                                            >
                                                <div className="w-full h-full relative">
                                                    <PokemonTeamImage pokemon={p} />
                                                    {banned && (
                                                        <div className="absolute top-0 right-0 bg-red-600 rounded-full w-4 h-4 border-2 border-black shadow-md flex items-center justify-center text-[10px] font-black">!</div>
                                                    )}
                                                </div>
                                                {banned && (
                                                    <div className="banned-tooltip">BANNED</div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {!isLocked && (
                        <div className="pt-8 flex flex-col md:flex-row justify-center items-center gap-6">
                            {hasBannedPokemon && (
                                <p className="text-red-500 font-black uppercase text-xs tracking-[0.2em] animate-pulse w-full text-center mb-2">
                                    CRITICAL ERROR: Restricted Units detected in roster!
                                </p>
                            )}
                            <button
                                onClick={handleSaveDraft}
                                disabled={saving || hasBannedPokemon}
                                className={`
                                    px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all transform flex-1 min-w-[200px] border-b-4
                                    ${saving ? 'bg-gray-700 text-gray-500 border-gray-800' : 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:scale-105 active:scale-95'}
                                `}
                            >
                                {saveStatus === 'success' ? 'DATA SYNCED ✓' : saving ? 'SYNCING...' : 'SAVE TACTICAL DRAFT'}
                            </button>

                            <button
                                onClick={handleLockIn}
                                disabled={saving || selectedTeam.includes(null) || hasBannedPokemon || !lockEnabled}
                                className={`
                                    px-16 py-5 rounded-2xl text-xl font-black uppercase tracking-tighter shadow-2xl transition-all transform flex-[2] min-w-[300px] border-b-4
                                    ${selectedTeam.includes(null) || hasBannedPokemon || !lockEnabled
                                        ? 'bg-gray-800 text-gray-600 border-gray-900 cursor-not-allowed' 
                                        : 'bg-green-600 hover:bg-green-500 hover:scale-105 active:scale-95 text-white border-green-800 shadow-green-900/40'}
                                `}
                            >
                                {!lockEnabled ? "LOCK-INS UNAVAILABLE" : "🔒 FINALIZE & LOCK TEAM"}
                            </button>
                        </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- COMMAND DOCK (Floating Bottom Navigation) --- */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 pointer-events-none">
          <div className="max-w-4xl mx-auto command-dock rounded-[2.5rem] p-2 flex items-center justify-around pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10">
              <button 
                  onClick={() => setActiveTab('rules')}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-all duration-300 gap-1 rounded-2xl ${activeTab === 'rules' ? 'text-white bg-white/5 nav-btn-active scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <span className="text-xl md:text-2xl">📜</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Rules</span>
              </button>
              
              <button 
                  onClick={() => setActiveTab('signup')}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-all duration-300 gap-1 rounded-2xl ${activeTab === 'signup' ? 'text-brand-primary bg-brand-primary/10 nav-btn-active scale-110' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <span className="text-xl md:text-2xl">📝</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Sign Up</span>
                  {hasStartedRegistration && !isLocked && (
                      <div className="absolute top-2 right-4 w-2 h-2 bg-amber-500 rounded-full animate-ping"></div>
                  )}
              </button>

              <button 
                  onClick={() => setActiveTab('brackets')}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-all duration-300 gap-1 rounded-2xl ${activeTab === 'brackets' ? 'text-brand-accent bg-brand-accent/10 nav-btn-active scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <span className="text-xl md:text-2xl">📊</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Bracket</span>
              </button>

              <button 
                  onClick={() => setActiveTab('players')}
                  className={`flex flex-col items-center justify-center flex-1 py-3 px-2 transition-all duration-300 gap-1 rounded-2xl ${activeTab === 'players' ? 'text-purple-400 bg-purple-500/10 nav-btn-active scale-105' : 'text-gray-500 hover:text-gray-300'}`}
              >
                  <span className="text-xl md:text-2xl">👥</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Players</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default TournamentDev;
