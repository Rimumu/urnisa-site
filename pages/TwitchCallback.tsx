import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const TwitchCallback: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [twitchUser, setTwitchUser] = useState<any>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const hash = window.location.hash;
                if (!hash) {
                    setStatus('error');
                    setErrorMessage('No authentication response received from Twitch.');
                    return;
                }

                // Parse parameters from hash
                const params = new URLSearchParams(hash.substring(1));
                const token = params.get('access_token');
                
                if (!token) {
                    setStatus('error');
                    setErrorMessage('Access token was not provided by Twitch.');
                    return;
                }

                // Retrieve Client ID from localStorage (saved before opening popup)
                const clientId = localStorage.getItem('twitch_temp_client_id') || 'gp762nuuoqcoxypju8c569th9wz7q5';

                // Fetch Twitch user profile
                const res = await fetch('https://api.twitch.tv/helix/users', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Client-Id': clientId
                    }
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(errData.message || 'Failed to fetch user info from Twitch.');
                }

                const data = await res.json();
                if (!data.data || data.data.length === 0) {
                    throw new Error('Twitch user profile not found.');
                }

                const user = data.data[0];
                setTwitchUser(user);
                setStatus('success');

                // Notify parent window
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'TWITCH_AUTH_SUCCESS',
                        twitchUser: {
                            id: user.id,
                            login: user.login,
                            display_name: user.display_name,
                            profile_image_url: user.profile_image_url
                        }
                    }, '*');
                    
                    // Close popup after a short delay
                    setTimeout(() => {
                        window.close();
                    }, 1500);
                } else {
                    setStatus('error');
                    setErrorMessage('Opener window not found. Please try opening from the dashboard.');
                }

            } catch (err: any) {
                console.error('Twitch Callback Error:', err);
                setStatus('error');
                setErrorMessage(err.message || 'An unexpected error occurred during Twitch linking.');
            }
        };

        handleCallback();
    }, []);

    return (
        <div className="min-h-screen bg-[#111115] text-white flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-md w-full bg-[#1c1c24] border border-white/5 rounded-3xl p-8 text-center shadow-2xl space-y-6">
                {status === 'loading' && (
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="w-12 h-12 text-[#a970ff] animate-spin" />
                        <h2 className="text-xl font-bold">Connecting to Twitch...</h2>
                        <p className="text-gray-400 text-sm">Please keep this window open while we fetch your profile info.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                        <h2 className="text-2xl font-black tracking-tight text-white">Twitch Connected!</h2>
                        {twitchUser && (
                            <div className="flex items-center gap-2.5 bg-black/40 border border-white/5 px-4 py-2.5 rounded-2xl">
                                <img 
                                    src={twitchUser.profile_image_url} 
                                    alt={twitchUser.display_name} 
                                    className="w-8 h-8 rounded-full border border-[#a970ff]/30" 
                                />
                                <span className="font-mono text-sm text-[#a970ff] font-bold">
                                    {twitchUser.display_name}
                                </span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500">This window will close automatically in a moment.</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-red-400">Linking Failed</h2>
                        <p className="text-gray-300 text-sm max-w-xs">{errorMessage}</p>
                        <button 
                            onClick={() => window.close()}
                            className="mt-2 bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-6 py-2.5 rounded-xl transition-all text-sm border border-white/5"
                        >
                            Close Window
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TwitchCallback;
