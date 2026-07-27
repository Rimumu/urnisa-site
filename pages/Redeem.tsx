import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserProfile from '../components/UserProfile';
import { DISCORD_API_URL } from '../constants';

const GiftSVG: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-brand-accent" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
);

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
    const [successData, setSuccessData] = useState<{ type: string; amount: number; wallet: any } | null>(null);

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
                <Link to="/minecraft" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5 hover:border-white/20 text-sm backdrop-blur-md mb-8 self-start group">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Back to Dashboard
                </Link>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl w-full relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-brand-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-accent/30 shadow-[0_0_15px_rgba(247,197,72,0.2)]">
                            <GiftSVG className="w-8 h-8 text-brand-accent" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Redeem Code</h1>
                        <p className="text-gray-400 mt-2">Enter your code to claim your rewards!</p>
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
                                <p className="font-bold text-lg mb-1">Success!</p>
                                {successData.type === 'nisaball' ? (
                                    <p className="text-sm">
                                        You received <strong>{successData.amount} Nisaball{successData.amount > 1 ? 's' : ''}</strong> credited directly to your Twitch account!
                                    </p>
                                ) : (
                                    <p className="text-sm">
                                        You received <strong>{successData.amount} {successData.type === 'lamb' ? 'Lamb Chop' : 'Wagyu A5'} Pack{successData.amount > 1 ? 's' : ''}</strong>!
                                    </p>
                                )}
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
