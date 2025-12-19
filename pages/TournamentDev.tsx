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
    <div className={`bg-black/40 backdrop-blur-md rounded-2xl border ${color} p-6 shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl pointer-events-none group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider flex items-center gap-3 relative z-10">
            <span className="text-2xl">{icon}</span> {title}
        </h3>
        <div className="text-gray-300 text-sm space-y-2 relative z-10 leading-relaxed">
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
                  // Ensure team is always 6 slots even if backend sends fewer
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
          // Register with empty team
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

      // Ensure save first
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
    <div className="min-h-screen py-8 font-sans text-white relative">
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
      `}</style>

      {/* Dev Header */}
      <div className="fixed top-0 left-0 w-full h-2 dev-stripe z-[100] opacity-80"></div>
      <div className="fixed top-2 right-1/2 transform translate-x-1/2 bg-amber-500 text-black px-4 py-1 rounded-b-xl font-black text-xs uppercase tracking-widest z-[100] shadow-lg border border-white/20">
          DEV ENVIRONMENT
      </div>

      <UserProfile onUserChange={setUser} className="!absolute top-4 right-4" />

      <div className="relative z-20 container mx-auto px-4 pt-12">
        <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md mb-8">
            <span>←</span> Back to Dashboard
        </Link>

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter drop-shadow-2xl">
              COBBLEMON <span className="text-brand-primary">TOURNAMENT</span>
            </h1>
            
            {/* Main Navigation Buttons */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <button 
                    onClick={() => setActiveTab('rules')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl ${activeTab === 'rules' ? 'bg-white text-black border-2 border-white' : 'bg-black/60 text-gray-400 border-2 border-white/10 hover:text-white hover:border-white/30'}`}
                >
                    <span className="text-2xl">📜</span> Rules
                </button>
                <button 
                    onClick={() => setActiveTab('signup')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl ${activeTab === 'signup' ? 'bg-brand-primary text-white border-2 border-brand-primary' : 'bg-black/60 text-gray-400 border-2 border-white/10 hover:text-white hover:border-brand-primary/50'}`}
                >
                    <span className="text-2xl">📝</span> Sign Up
                </button>
                <button 
                    onClick={() => setActiveTab('brackets')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl ${activeTab === 'brackets' ? 'bg-brand-accent text-black border-2 border-brand-accent' : 'bg-black/60 text-gray-400 border-2 border-white/10 hover:text-white hover:border-brand-accent/50'}`}
                >
                    <span className="text-2xl">📊</span> Bracket
                </button>
                <button 
                    onClick={() => setActiveTab('players')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all transform hover:scale-105 shadow-xl ${activeTab === 'players' ? 'bg-purple-600 text-white border-2 border-purple-600' : 'bg-black/60 text-gray-400 border-2 border-white/10 hover:text-white hover:border-purple-600/50'}`}
                >
                    <span className="text-2xl">👥</span> Players
                </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[500px] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none fixed"></div>

            {/* --- RULES SECTION --- */}
            {activeTab === 'rules' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Hero Format Card */}
                <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-brand-primary/20 to-black/60 backdrop-blur-xl rounded-[2.5rem] border border-brand-primary/50 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-6xl md:text-8xl">⚔️</div>
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Singles 4v4 Showdown</h2>
                            <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                Single-elimination bracket. Bring a roster of <span className="text-brand-primary font-bold">6 Pokémon</span>, 
                                but select only <span className="text-brand-primary font-bold">4 for each battle</span>. 
                                Level cap is set to <span className="text-brand-accent font-bold">50</span>!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Banned Gimmicks */}
                <RuleCard title="Banned Gimmicks" icon="🚫" color="border-red-500/30">
                    <ul className="list-disc list-inside space-y-2 font-bold text-red-200">
                        <li>Tera</li>
                        <li>Z-Move</li>
                        <li>Dynamax</li>
                        <li>Mega-Evolution</li>
                    </ul>
                </RuleCard>

                {/* Pokémon Restrictions */}
                <RuleCard title="Restricted Mons" icon="🔒" color="border-orange-500/30">
                    <ul className="list-disc list-inside space-y-2 font-bold text-orange-200">
                        <li>No Legendary Pokémon</li>
                        <li>No Mythical Pokémon</li>
                        <li>No Ultra Beasts</li>
                    </ul>
                </RuleCard>

                {/* Battle Clauses */}
                <RuleCard title="Clauses" icon="⚖️" color="border-blue-500/30">
                    <ul className="space-y-3">
                        <li><strong className="text-blue-300">Species Clause:</strong> No duplicate Pokémon species.</li>
                        <li><strong className="text-blue-300">Item Clause:</strong> No duplicate held items.</li>
                        <li><strong className="text-blue-300">Sleep Clause:</strong> Cannot put more than 1 opponent to sleep.</li>
                        <li><strong className="text-blue-300">Endless Battle:</strong> No intentional infinite loops (e.g. Leppa + Recycle).</li>
                    </ul>
                </RuleCard>

                {/* Move Bans */}
                <div className="md:col-span-2 lg:col-span-2">
                    <RuleCard title="Move & Ability Bans" icon="🛑" color="border-purple-500/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-purple-300 mb-2 border-b border-purple-500/30 pb-1">Clauses</h4>
                                <ul className="list-disc list-inside space-y-1 text-gray-300">
                                    <li><strong className="text-white">Evasion:</strong> No Double Team/Minimize.</li>
                                    <li><strong className="text-white">OHKO:</strong> No Fissure, Guillotine, etc.</li>
                                    <li><strong className="text-white">Moody:</strong> Ability Banned (RNG).</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-purple-300 mb-2 border-b border-purple-500/30 pb-1">Specific Moves</h4>
                                <div className="flex flex-wrap gap-2">
                                    {['Revival Blessing', 'Arena Trap', 'Power Construct', 'Shadow Tag', 'Baton Pass', 'Assist', 'Last Respects', 'Shed Tail'].map(m => (
                                        <span key={m} className="bg-purple-500/20 text-purple-200 px-2 py-1 rounded text-xs font-bold border border-purple-500/30">{m}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </RuleCard>
                </div>

                {/* Item Bans */}
                <RuleCard title="Item Bans" icon="🎒" color="border-yellow-500/30">
                    <div className="flex flex-wrap gap-2">
                        {['Bright Powder', 'Lax Incense', "King's Rock", 'Razor Fang', 'Quick Claw'].map(m => (
                            <span key={m} className="bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">{m}</span>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-gray-400 italic">RNG-based items are generally removed to ensure skill-based competition.</p>
                </RuleCard>

                {/* General & Spectator */}
                <div className="md:col-span-2 lg:col-span-3">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 p-8 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">🚨 General Rules</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex gap-2"><span className="text-red-500 font-bold">!</span> Break rules = Instant Disqualification.</li>
                                <li className="flex gap-2"><span className="text-red-500 font-bold">!</span> No stalling or disconnect abuse.</li>
                                <li className="flex gap-2"><span className="text-green-500 font-bold">✓</span> Valid disconnects allow restart with SAME team.</li>
                                <li className="flex gap-2"><span className="text-brand-primary font-bold">⌚</span> Report matches within 10 mins.</li>
                                <li className="flex gap-2"><span className="text-white font-bold">⚖️</span> Admin decisions are final.</li>
                            </ul>
                        </div>
                        <div className="w-px bg-white/10 hidden md:block"></div>
                        <div className="flex-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2">👀 Spectator Etiquette</h3>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex gap-2"><span>🔇</span> Mute mic / Push-to-talk during matches.</li>
                                <li className="flex gap-2"><span>🎉</span> Cheering is allowed, distraction is not.</li>
                                <li className="flex gap-2"><span>🐾</span> Keep Pokémon in balls or on shoulders.</li>
                            </ul>
                        </div>
                    </div>
                </div>

              </div>
            )}

            {activeTab === 'brackets' && (
              <div className="relative z-10 text-center flex flex-col items-center justify-center py-20 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="text-8xl mb-6 opacity-20">📊</div>
                <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-2">Brackets coming soon</h2>
                <p className="text-gray-400 text-lg">The bracket will be generated once sign-ups close.</p>
              </div>
            )}

            {activeTab === 'players' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl">
                  <h2 className="text-3xl font-black text-white mb-8 text-center uppercase tracking-tighter">Registered Players</h2>
                  {loadingPlayers ? (
                      <div className="text-center py-20 text-gray-500 animate-pulse font-bold">Loading participants...</div>
                  ) : playersList.length === 0 ? (
                      <div className="text-center py-20 text-gray-600">No players registered yet.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {playersList.map((entry, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
                                  <div className="flex items-center gap-4 border-b border-white/5 pb-3">
                                      <img src={`https://mc-heads.net/avatar/${entry.minecraftUsername}/48`} className="w-12 h-12 rounded-xl border border-white/20" alt={entry.minecraftUsername} />
                                      <div>
                                          <div className="font-bold text-white text-lg">{entry.minecraftUsername}</div>
                                          <div className={`text-xs font-mono font-bold uppercase tracking-wider ${entry.isLocked ? 'text-green-500' : 'text-gray-500'}`}>
                                              {entry.isLocked ? 'LOCKED IN' : 'DRAFTING'}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="grid grid-cols-6 gap-2">
                                      {entry.isLocked ? (
                                          entry.team.map((p, pIdx) => (
                                              <div key={pIdx} className="aspect-square bg-black/20 rounded-lg border border-white/5 p-1 relative" title={p?.name || "Empty"}>
                                                  {p ? (
                                                      <PokemonTeamImage pokemon={p} />
                                                  ) : (
                                                      <div className="w-full h-full flex items-center justify-center text-white/10 text-xs">•</div>
                                                  )}
                                              </div>
                                          ))
                                      ) : (
                                          // Masked Team for Drafting Players
                                          Array(6).fill(null).map((_, i) => (
                                              <div key={i} className="aspect-square bg-black/20 rounded-lg border border-white/5 flex items-center justify-center text-gray-600 font-black text-xl select-none">?</div>
                                          ))
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            )}

            {activeTab === 'signup' && (
              <div className="relative z-10 bg-black/40 backdrop-blur-xl rounded-[3rem] border border-white/10 p-8 shadow-2xl">
                {!user ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="text-6xl grayscale opacity-30">🔒</div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Registration Locked</h2>
                    <p className="text-gray-400">Please log in with Discord and Minecraft in the top right to register for the tournament.</p>
                  </div>
                ) : loadingTeam ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="font-bold text-gray-500">Loading your team...</p>
                    </div>
                ) : !hasStartedRegistration && !isLocked ? (
                  /* STEP 1: INITIAL REGISTRATION CALL TO ACTION */
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-brand-primary/20 blur-2xl rounded-full scale-110 group-hover:bg-brand-primary/30 transition-all"></div>
                        <img 
                            src={`https://mc-heads.net/avatar/${user.minecraftUsername}/128`} 
                            alt="MC Head Large" 
                            className="relative w-32 h-32 rounded-3xl border-4 border-brand-primary bg-black shadow-2xl transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-xs font-black p-2 rounded-full border-2 border-white shadow-lg">✓</div>
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Welcome, <span className="text-brand-primary">{user.minecraftUsername}</span>!</h2>
                        <p className="text-gray-400 max-w-md mx-auto">Ready to compete? Click the button below to start drafting your team of 6 for the tournament.</p>
                    </div>

                    <button
                        onClick={handleInitialRegister}
                        className="bg-brand-primary hover:bg-red-600 text-white font-black text-xl py-5 px-12 rounded-2xl shadow-[0_0_40px_rgba(229,56,59,0.3)] transition-all transform hover:scale-110 active:scale-95 uppercase tracking-widest border-2 border-white/20"
                    >
                        Register for Tournament
                    </button>
                  </div>
                ) : (
                  /* STEP 2: DRAFTING INTERFACE */
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Locked Banner */}
                    {isLocked && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <span className="text-2xl">🔒</span>
                            <div>
                                <h3 className="font-black text-green-400 uppercase tracking-widest text-sm">Team Locked In</h3>
                                <p className="text-green-200/60 text-xs">Your team is registered and visible on the Players tab. Good luck!</p>
                            </div>
                        </div>
                    )}

                    {/* User Info Sticky Header (Small) */}
                    <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/10 w-fit mx-auto md:mx-0">
                      <div className="relative">
                        <img src={`https://mc-heads.net/avatar/${user.minecraftUsername}/64`} alt="MC Head" className="w-16 h-16 rounded-xl border-2 border-brand-primary bg-black shadow-lg" />
                        <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] font-black p-1 rounded-full border border-white">✓</div>
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-xl font-black text-white leading-none mb-1 uppercase tracking-tight">{user.minecraftUsername}</h3>
                        <p className="text-xs text-gray-500 font-mono">Status: Connected & {isLocked ? 'Locked In' : 'Drafting'}</p>
                      </div>
                    </div>

                    {/* Team Preview */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end px-2 gap-2">
                        <h3 className="text-2xl font-black uppercase tracking-tight">Your Team <span className="text-brand-primary">(6 Slots)</span></h3>
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{selectedTeam.filter(p => p !== null).length}/6 Selected</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {selectedTeam.map((p, idx) => {
                          const banned = p !== null && isBanned(p.id);
                          return (
                            <div 
                              key={idx} 
                              className={`aspect-square rounded-[2rem] border-2 flex flex-col items-center justify-center relative group transition-all duration-300 ${p ? (banned ? 'bg-red-900/20 border-red-500 shadow-lg shadow-red-500/20' : 'bg-white/10 border-brand-primary shadow-xl scale-[1.02]') : 'bg-black/40 border-white/5 border-dashed opacity-50'}`}
                            >
                              {p ? (
                                <>
                                  <div className="w-4/5 h-4/5 relative">
                                      <PokemonTeamImage pokemon={p} />
                                      {banned && (
                                          <div className="absolute inset-0 bg-red-600/30 backdrop-blur-[1px] rounded-full flex items-center justify-center">
                                              <span className="text-white text-2xl font-black drop-shadow-md">✕</span>
                                          </div>
                                      )}
                                  </div>
                                  <span className={`text-[10px] font-black uppercase text-center truncate w-full px-2 mb-1 ${banned ? 'text-red-400' : 'text-white'}`}>{p.name}</span>
                                  
                                  {/* Tooltip for Banned Pokemon */}
                                  {banned && (
                                      <div className="banned-tooltip">
                                          This Pokémon is not allowed!
                                      </div>
                                  )}

                                  {!isLocked && (
                                      <button 
                                        onClick={() => handleRemovePokemon(idx)}
                                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50 hover:scale-110"
                                      >
                                        ✕
                                      </button>
                                  )}
                                </>
                              ) : (
                                <span className="text-3xl text-gray-700">+</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pokemon Selector - Hide if Locked */}
                    {!isLocked && (
                        <div className="bg-black/40 rounded-[2.5rem] border border-white/10 p-6 space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="flex flex-col md:flex-row items-center gap-4">
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Pokemon Database</h4>
                                <span className="text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    Legendaries/UBs Banned
                                </span>
                            </div>
                            <div className="relative w-full md:w-80">
                            <input 
                                type="text" 
                                placeholder="Search pokemon..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/60 border border-white/10 rounded-full py-3 px-6 text-sm text-white focus:border-brand-primary outline-none transition-all placeholder:text-gray-700"
                            />
                            <span className="absolute right-5 top-3.5 opacity-30 pointer-events-none">🔍</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-3 max-h-[400px] overflow-y-auto pokemon-grid pr-2">
                            {loadingPokemon ? (
                            <div className="col-span-full py-10 text-center animate-pulse text-gray-600 font-bold uppercase tracking-widest">Updating Pokedex...</div>
                            ) : filteredPokemon.length === 0 ? (
                            <div className="col-span-full py-10 text-center text-gray-700 italic">No matches found.</div>
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
                                    className={`aspect-square rounded-2xl flex items-center justify-center p-1 transition-all relative group ${isSelected ? 'bg-brand-primary/20 border-brand-primary border opacity-50 cursor-not-allowed' : (isFull || banned) ? 'bg-gray-800 opacity-20 cursor-not-allowed' : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20'}`}
                                    title={p.name}
                                >
                                    <div className="w-full h-full relative">
                                        <PokemonTeamImage pokemon={p} />
                                        {banned && (
                                            <div className="absolute top-0 right-0 bg-red-600 rounded-full w-3 h-3 border border-black shadow-sm"></div>
                                        )}
                                    </div>
                                    {banned && (
                                        <div className="banned-tooltip">Banned</div>
                                    )}
                                </button>
                                );
                            })
                            )}
                        </div>
                        </div>
                    )}

                    {/* Final Actions */}
                    {!isLocked && (
                        <div className="pt-4 flex flex-col md:flex-row justify-center items-center gap-4">
                        {hasBannedPokemon && (
                            <p className="text-red-500 font-black uppercase text-sm tracking-widest animate-pulse w-full text-center">
                                Please remove banned Pokémon to register!
                            </p>
                        )}
                        <button
                            onClick={handleSaveDraft}
                            disabled={saving || hasBannedPokemon}
                            className={`
                            px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest shadow-lg transition-all transform flex-1
                            ${saving ? 'bg-gray-700 text-gray-500' : 'bg-white/10 hover:bg-white/20 text-white'}
                            `}
                        >
                            {saveStatus === 'success' ? 'Saved ✓' : saving ? 'Saving...' : 'Save Draft'}
                        </button>

                        <button
                            onClick={handleLockIn}
                            disabled={saving || selectedTeam.includes(null) || hasBannedPokemon || !lockEnabled}
                            className={`
                            px-12 py-4 rounded-xl text-lg font-black uppercase tracking-widest shadow-2xl transition-all transform flex-[2]
                            ${selectedTeam.includes(null) || hasBannedPokemon || !lockEnabled
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-500 hover:scale-105 active:scale-95 text-white shadow-green-900/20'}
                            `}
                        >
                            {!lockEnabled ? "Lock-ins unavailable right now!" : "🔒 LOCK IN TEAM"}
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
    </div>
  );
};

export default TournamentDev;