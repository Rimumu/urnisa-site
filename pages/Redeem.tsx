
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import { DISCORD_API_URL } from '../constants';

const Redeem: React.FC = () => {
    const [user, setUser] = useState<any>(() => {
        const stored = localStorage.getItem('urnisa_mc_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
        return null;
    });
    const [code, setCode] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [successData, setSuccessData] = useState<{ type: string, wallet: any } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !code) return;

        setStatus('loading');
        setErrorMsg('');
        setSuccessData(null);

        try {
            const response = await fetch(`${DISCORD_API_URL}/api/codes/redeem`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.id, code })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setSuccessData(data);
                setCode(''); // Clear input
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Invalid or used code.');
            }
        } catch (e) {
            setStatus('error');
            setErrorMsg('Network error.');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl text-center max-w-md w-full">
                    <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
                    <p className="text-gray-400 mb-8">You must log in with Discord to redeem codes.</p>
                    <UserProfile className="w-full justify-center" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 font-sans relative">
            <UserProfile className="!absolute top-4 right-4" />
            
            <div className="max-w-xl mx-auto flex flex-col items-center">
                <Link to="/minecraft/gacha" className="text-gray-400 hover:text-white mb-8 self-start flex items-center gap-2">
                    <span>←</span> Back to Gacha
                </Link>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-brand-accent/30 shadow-[0_0_15px_rgba(247,197,72,0.2)]">
                            🎁
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Redeem Code</h1>
                        <p className="text-gray-400 mt-2">Enter your code to claim special packs!</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); }}
                                placeholder="XXXX-XXXX-XXXX"
                                className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-center text-2xl font-mono tracking-widest text-white placeholder:text-gray-700 focus:border-brand-primary focus:outline-none transition-colors uppercase"
                                disabled={status === 'loading'}
                            />
                        </div>

                        {status === 'error' && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2">
                                ❌ {errorMsg}
                            </div>
                        )}

                        {status === 'success' && successData && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-200 px-4 py-4 rounded-xl text-center animate-in fade-in slide-in-from-top-2">
                                <p className="font-bold text-lg mb-1">🎉 Success!</p>
                                <p className="text-sm">
                                    You received <strong>1 {successData.type === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'} Pack</strong>!
                                </p>
                                <div className="mt-4 flex gap-4 justify-center text-xs font-mono opacity-80">
                                    <div className="bg-black/30 px-3 py-1 rounded">Lamb: {successData.wallet.lambPacks}</div>
                                    <div className="bg-black/30 px-3 py-1 rounded">Wagyu: {successData.wallet.wagyuPacks}</div>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'loading' || !code}
                            className={`
                                w-full font-bold py-4 rounded-xl shadow-lg transition-all transform uppercase tracking-wider
                                ${status === 'loading' 
                                    ? 'bg-gray-700 text-gray-400 cursor-wait' 
                                    : 'bg-brand-primary hover:bg-red-600 text-white hover:scale-[1.02]'}
                            `}
                        >
                            {status === 'loading' ? 'Verifying...' : 'CLAIM REWARD'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Redeem;
