import React, { useState, useMemo } from 'react';
import SnakesBoard from '../components/SnakesBoard';
import { useSnakesGame, SnakesQueueItem, MoveResult, SnakesBoard as SnakesBoardType } from '../hooks/useSnakesGame';
import { API_BASE_URL } from '../constants';

// Default board configuration (used when backend is unavailable)
const DEFAULT_BOARD: SnakesBoardType = {
    ladders: { 2: 38, 7: 14, 8: 31, 15: 26, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 78: 98, 87: 94 },
    snakes: { 16: 6, 46: 25, 49: 11, 62: 19, 64: 60, 74: 53, 89: 68, 92: 88, 95: 75, 99: 80 }
};

const SnakesLadder: React.FC = () => {
    const { state, loading, lastMoveResult, processMove, toggleActive, addTestEvent, resetGame } = useSnakesGame();

    const [isAdmin, setIsAdmin] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [showLogin, setShowLogin] = useState(false);
    const [password, setPassword] = useState('');
    const [loginState, setLoginState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');

    const [isRolling, setIsRolling] = useState(false);
    const [diceAnimation, setDiceAnimation] = useState<number | null>(null);
    const [moveResult, setMoveResult] = useState<MoveResult | null>(null);
    const [showResultPopup, setShowResultPopup] = useState(false);

    // Test event form
    const [testUser, setTestUser] = useState('');
    const [testAmount, setTestAmount] = useState(1);

    // Group queue by user
    const groupedQueue = useMemo(() => {
        if (!state) return [];
        const grouped: (SnakesQueueItem & { count: number })[] = [];

        state.queue.forEach((item) => {
            const last = grouped[grouped.length - 1];
            if (last && last.user === item.user) {
                last.count += 1;
            } else {
                grouped.push({ ...item, count: 1 });
            }
        });

        return grouped;
    }, [state?.queue]);

    const currentRoller = state?.queue?.[0] || null;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginState('verifying');

        try {
            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setLoginState('success');
                setAdminKey(password);
                setTimeout(() => {
                    setIsAdmin(true);
                    setShowLogin(false);
                    setPassword('');
                    setLoginState('idle');
                }, 1000);
            } else {
                setLoginState('error');
                setTimeout(() => setLoginState('idle'), 500);
            }
        } catch (e) {
            setLoginState('error');
            setTimeout(() => setLoginState('idle'), 500);
        }
    };

    const handleRoll = async () => {
        if (isRolling || !currentRoller) return;

        setIsRolling(true);
        setMoveResult(null);

        // Dice animation (show random numbers rapidly)
        const animationDuration = 1500;
        const animationInterval = 100;
        let elapsed = 0;

        const anim = setInterval(() => {
            setDiceAnimation(Math.floor(Math.random() * 6) + 1);
            elapsed += animationInterval;
            if (elapsed >= animationDuration) {
                clearInterval(anim);
            }
        }, animationInterval);

        // Actually process the move
        const result = await processMove(adminKey);

        // Wait for animation to finish
        await new Promise(resolve => setTimeout(resolve, animationDuration - elapsed + 200));

        clearInterval(anim);

        if (result) {
            setDiceAnimation(result.roll);
            setMoveResult(result);
            setShowResultPopup(true);
        }

        setIsRolling(false);
    };

    const handleTestEvent = async () => {
        if (!testUser.trim()) return;
        await addTestEvent(adminKey, testUser.trim(), testAmount);
        setTestUser('');
        setTestAmount(1);
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to reset the entire game? This will clear all players and history.')) {
            await resetGame(adminKey);
            setMoveResult(null);
            setDiceAnimation(null);
        }
    };

    // Note: We render the board even if loading/state is null, using defaults

    return (
        <div className="min-h-screen py-12 relative font-sans">
            <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
                
                /* 3D Dice Cube */
                .dice-scene {
                    width: 80px;
                    height: 80px;
                    perspective: 300px;
                }
                .dice-cube {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transition: transform 0.5s ease-out;
                }
                .dice-cube.rolling {
                    animation: dice-tumble 1.5s ease-in-out infinite;
                }
                @keyframes dice-tumble {
                    0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
                    25% { transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg) translateY(-15px); }
                    50% { transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg); }
                    75% { transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg) translateY(-15px); }
                    100% { transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg); }
                }
                .dice-face {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(145deg, #ffffff, #e6e6e6);
                    border: 3px solid #ccc;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    box-shadow: inset 0 0 15px rgba(0,0,0,0.1);
                }
                .dice-face-1 { transform: rotateY(0deg) translateZ(40px); }
                .dice-face-2 { transform: rotateY(180deg) translateZ(40px); }
                .dice-face-3 { transform: rotateY(-90deg) translateZ(40px); }
                .dice-face-4 { transform: rotateY(90deg) translateZ(40px); }
                .dice-face-5 { transform: rotateX(90deg) translateZ(40px); }
                .dice-face-6 { transform: rotateX(-90deg) translateZ(40px); }
                
                /* Result rotations - show specific face */
                .dice-show-1 { transform: rotateY(0deg) rotateX(0deg); }
                .dice-show-2 { transform: rotateY(180deg) rotateX(0deg); }
                .dice-show-3 { transform: rotateY(90deg) rotateX(0deg); }
                .dice-show-4 { transform: rotateY(-90deg) rotateX(0deg); }
                .dice-show-5 { transform: rotateX(-90deg) rotateY(0deg); }
                .dice-show-6 { transform: rotateX(90deg) rotateY(0deg); }
            `}</style>

            {/* Background Decorations */}
            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Login Modal */}
            {showLogin && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-sm p-8 rounded-[3rem] bg-gradient-to-b from-[#2a0f13] to-[#120507] border-[2px] ${loginState === 'error' ? 'border-red-500 animate-shake' : loginState === 'success' ? 'border-green-500' : 'border-brand-accent/30'} shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center`}>
                        <button onClick={() => setShowLogin(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">✕</button>

                        <div className="text-6xl mb-6">🎲</div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-widest mb-1">
                            {loginState === 'success' ? 'Unlocked!' : 'Admin Login'}
                        </h3>
                        <p className="text-xs text-brand-accent/60 font-bold uppercase tracking-wider mb-6">
                            {loginState === 'verifying' ? 'Verifying...' : 'Enter Password'}
                        </p>

                        <form onSubmit={handleLogin} className="w-full space-y-6">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border-b-2 border-brand-accent/30 focus:border-brand-accent text-center text-white text-2xl font-bold tracking-[0.5em] py-3 outline-none transition-all"
                                placeholder="••••••••"
                                autoFocus
                                disabled={loginState === 'success'}
                            />
                            <button
                                type="submit"
                                disabled={loginState !== 'idle'}
                                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-all ${loginState === 'success' ? 'bg-green-500 text-black' : 'bg-gradient-to-r from-brand-primary to-brand-accent text-black hover:brightness-110'}`}
                            >
                                {loginState === 'success' ? 'Success!' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Result Popup Modal */}
            {showResultPopup && moveResult && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setShowResultPopup(false)}
                >
                    <div
                        className={`relative w-full max-w-md p-8 rounded-[2rem] border-[3px] shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col items-center animate-in zoom-in-95 duration-300 ${moveResult.isWinner
                            ? 'bg-gradient-to-b from-yellow-900/90 to-yellow-950/90 border-yellow-400'
                            : moveResult.specialMove === 'ladder'
                                ? 'bg-gradient-to-b from-emerald-900/90 to-emerald-950/90 border-emerald-400'
                                : moveResult.specialMove === 'snake'
                                    ? 'bg-gradient-to-b from-red-900/90 to-red-950/90 border-red-400'
                                    : 'bg-gradient-to-b from-[#2a0f13]/95 to-[#120507]/95 border-brand-accent/50'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setShowResultPopup(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white text-2xl transition-colors"
                        >
                            ✕
                        </button>

                        {/* User avatar and name */}
                        <img
                            src={currentRoller?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(moveResult.user)}&background=random`}
                            alt={moveResult.user}
                            className="w-20 h-20 rounded-full border-4 border-white shadow-2xl mb-4"
                        />
                        <h3 className="text-2xl font-black text-white mb-2">{moveResult.user}</h3>

                        {/* Dice result */}
                        <div className="text-7xl mb-4">
                            {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][moveResult.roll - 1]}
                        </div>
                        <div className="text-3xl font-black text-brand-accent mb-4">
                            Rolled a {moveResult.roll}!
                        </div>

                        {/* Movement */}
                        <div className="text-lg text-gray-200 mb-4">
                            <span className="text-white/60">{moveResult.fromPosition === 0 ? 'Started' : 'From'}</span>{' '}
                            <span className="font-bold text-white text-xl">{moveResult.fromPosition || 'Start'}</span>
                            <span className="mx-3 text-2xl">→</span>
                            <span className="font-bold text-white text-xl">{moveResult.toPosition}</span>
                        </div>

                        {/* Special effect */}
                        {moveResult.specialMove === 'ladder' && (
                            <div className="text-2xl text-emerald-400 font-bold animate-bounce">
                                🪜 Climbed a Ladder! 🪜
                            </div>
                        )}
                        {moveResult.specialMove === 'snake' && (
                            <div className="text-2xl text-red-400 font-bold animate-bounce">
                                🐍 Bitten by a Snake! 🐍
                            </div>
                        )}
                        {moveResult.isWinner && (
                            <div className="text-3xl text-yellow-400 font-black animate-pulse">
                                🏆 WINNER! 🏆
                            </div>
                        )}

                        {/* Tap to continue */}
                        <div className="mt-6 text-white/40 text-sm">Click anywhere to continue</div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 relative z-10 animate-in fade-in duration-700">
                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                        SNAKES <span className="text-emerald-400">&</span> <span className="text-brand-primary">LADDERS</span>
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                        <span className="text-xl">🎲</span>
                        <h2 className="text-lg md:text-xl font-bold text-brand-accent tracking-widest uppercase">Interactive Chat Game</h2>
                    </div>
                    <p className="text-gray-400 text-sm">1 Sub / 1 Gifted Sub = 1 Dice Roll</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Board Section */}
                    <div className="lg:col-span-2 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-rose-pattern opacity-5 pointer-events-none"></div>

                        {/* Admin Lock Button - Top Right of Board */}
                        {!isAdmin ? (
                            <button
                                onClick={() => setShowLogin(true)}
                                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 flex items-center justify-center text-lg hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
                                title="Admin Login"
                            >
                                🔒
                            </button>
                        ) : (
                            <div
                                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-xl border border-green-500/40 flex items-center justify-center text-lg shadow-lg"
                                title="Admin Mode Active"
                            >
                                🔓
                            </div>
                        )}

                        {/* Current Roller Banner */}
                        {currentRoller ? (
                            <div className="text-center mb-6">
                                <span className="bg-brand-accent text-brand-bg font-black px-4 py-1 rounded-full uppercase tracking-widest text-xs shadow-lg">Next Roll</span>
                                <div className="flex items-center justify-center gap-3 mt-2">
                                    <img
                                        src={currentRoller.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentRoller.user)}&background=random`}
                                        alt={currentRoller.user}
                                        className="w-12 h-12 rounded-full border-2 border-brand-accent"
                                    />
                                    <span className="text-2xl font-black text-white">{currentRoller.user}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center mb-6 text-gray-500 font-bold tracking-widest uppercase text-sm">
                                Waiting for rolls...
                            </div>
                        )}

                        {/* 3D Dice Display - Clickable to roll */}
                        <div className="flex justify-center mb-6">
                            <button
                                onClick={isAdmin ? handleRoll : undefined}
                                disabled={!isAdmin || isRolling || !currentRoller}
                                className={`${isAdmin && !isRolling && currentRoller ? 'hover:scale-110 cursor-pointer' : 'cursor-default'} transition-transform`}
                                title={isAdmin ? (currentRoller ? 'Click to roll!' : 'No one in queue') : 'Login as admin to roll'}
                            >
                                <div className="dice-scene">
                                    <div className={`dice-cube ${isRolling ? 'rolling' : (diceAnimation ? `dice-show-${diceAnimation}` : 'dice-show-1')}`}>
                                        <div className="dice-face dice-face-1">⚀</div>
                                        <div className="dice-face dice-face-2">⚁</div>
                                        <div className="dice-face dice-face-3">⚂</div>
                                        <div className="dice-face dice-face-4">⚃</div>
                                        <div className="dice-face dice-face-5">⚄</div>
                                        <div className="dice-face dice-face-6">⚅</div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Game Board */}
                        <div className="flex justify-center">
                            <SnakesBoard
                                board={state?.board || DEFAULT_BOARD}
                                players={state?.players || []}
                                highlightTile={moveResult?.toPosition}
                                animatingPlayer={isRolling ? currentRoller?.user : undefined}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center">Game Stats</h3>
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-3xl font-black text-white">{state?.players.length || 0}</div>
                                    <div className="text-gray-500 text-xs font-bold uppercase mt-1">Players</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-white">{state?.queue.length || 0}</div>
                                    <div className="text-gray-500 text-xs font-bold uppercase mt-1">In Queue</div>
                                </div>
                            </div>
                        </div>

                        {/* Queue Card */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 min-h-[200px] flex flex-col">
                            <h3 className="text-brand-accent font-bold uppercase tracking-widest text-xs mb-4 text-center border-b border-white/5 pb-4">
                                Roll Queue ({state?.queue.length || 0})
                            </h3>
                            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[250px]">
                                {groupedQueue.length === 0 ? (
                                    <div className="text-center text-gray-500 text-sm py-6 italic">Queue is empty</div>
                                ) : (
                                    groupedQueue.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${idx === 0 ? 'bg-brand-primary/20 border-brand-primary/50' : 'bg-white/5 border-white/5'}`}
                                        >
                                            <img
                                                src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.user)}&background=random`}
                                                alt={item.user}
                                                className="w-8 h-8 rounded-full border border-white/20"
                                            />
                                            <div className="font-bold text-white flex-1 truncate">{item.user}</div>
                                            <div className="text-xs bg-brand-accent text-brand-bg font-black px-2 py-1 rounded shadow-sm">
                                                {item.count}x
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Moves */}
                        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                            <h3 className="text-brand-primary font-bold uppercase tracking-widest text-xs mb-4 text-center">Recent Moves</h3>
                            <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {state?.history.slice(0, 10).map((h) => (
                                    <div key={h._id} className="text-sm border-b border-white/5 pb-2 last:border-0">
                                        <span className="font-bold text-white">{h.user}</span>
                                        <span className="text-gray-400"> rolled </span>
                                        <span className="text-brand-accent font-bold">{h.roll}</span>
                                        <span className="text-gray-400"> → </span>
                                        <span className="text-white">{h.toPosition}</span>
                                        {h.specialMove && (
                                            <span className={h.specialMove === 'ladder' ? 'text-emerald-400' : 'text-red-400'}>
                                                {h.specialMove === 'ladder' ? ' 🪜' : ' 🐍'}
                                            </span>
                                        )}
                                    </div>
                                ))}
                                {(!state?.history || state.history.length === 0) && (
                                    <div className="text-gray-500 text-xs text-center py-4">No moves yet</div>
                                )}
                            </div>
                        </div>

                        {/* Admin Controls */}
                        {isAdmin && (
                            <div className="bg-black/40 backdrop-blur-xl border border-red-500/20 rounded-3xl p-6">
                                <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-4 text-center">Admin Controls</h3>

                                {/* Test Event */}
                                <div className="space-y-3 mb-4">
                                    <input
                                        type="text"
                                        value={testUser}
                                        onChange={(e) => setTestUser(e.target.value)}
                                        placeholder="Username"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            value={testAmount}
                                            onChange={(e) => setTestAmount(parseInt(e.target.value) || 1)}
                                            min={1}
                                            max={50}
                                            className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm text-center"
                                        />
                                        <button
                                            onClick={handleTestEvent}
                                            className="flex-1 bg-brand-accent/20 border border-brand-accent/30 text-brand-accent rounded-lg px-3 py-2 text-sm font-bold hover:bg-brand-accent/30"
                                        >
                                            Add Test Rolls
                                        </button>
                                    </div>
                                </div>

                                {/* Toggle & Reset */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => toggleActive(adminKey)}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${state?.isActive ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-gray-500/20 border border-gray-500/30 text-gray-400'}`}
                                    >
                                        {state?.isActive ? '🟢 Active' : '⚪ Inactive'}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm font-bold hover:bg-red-500/30"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SnakesLadder;
