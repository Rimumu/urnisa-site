
import React, { useState } from 'react';
import { API_BASE_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';

const Admin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Use current schedule to show preview
    const { scheduleUrl: currentUrl } = useSchedule();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        // Simple check: try to update with the current URL just to verify the token
        // Or we can just store it statefully and let the first update request fail if wrong.
        // For UX, let's just assume logged in locally, real validation happens on API call.
        if (password) {
            setIsAuthenticated(true);
            setNewUrl(currentUrl);
        }
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password // Send password as auth header
                },
                body: JSON.stringify({ url: newUrl })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: 'Schedule updated successfully!' });
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to update.' });
                if (response.status === 401) setIsAuthenticated(false); // Log out if unauthorized
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                    <h1 className="text-3xl font-extrabold text-center mb-6 text-white">
                        Admin <span className="text-brand-primary">Login</span>
                    </h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                                placeholder="Enter admin password"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-white">
                Admin <span className="text-brand-primary">Dashboard</span>
            </h1>

            <div className="grid gap-8">
                {/* Schedule Updater Card */}
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                        <div className="p-3 bg-brand-primary/20 rounded-lg text-2xl">📅</div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Stream Schedule</h2>
                            <p className="text-gray-400 text-sm">Update the schedule image displayed on the home page.</p>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateSchedule} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Image URL</label>
                            <input 
                                type="url" 
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors font-mono text-sm"
                                placeholder="https://..."
                                required
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Note: If the server restarts (common on free hosting), this will revert to default.
                            </p>
                        </div>

                        {newUrl && (
                            <div className="mt-4">
                                <label className="block text-xs uppercase font-bold text-gray-500 mb-2">Preview</label>
                                <div className="rounded-lg overflow-hidden border border-white/10 bg-black/20 max-w-md mx-auto">
                                    <img src={newUrl} alt="Preview" className="w-full h-auto opacity-90" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            </div>
                        )}

                        {status && (
                            <div className={`p-4 rounded-lg text-center font-medium ${status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                {status.message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg flex justify-center items-center ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </form>
                </div>

                {/* Future Modules (Spin Wheel, etc.) */}
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-xl opacity-60 grayscale pointer-events-none relative overflow-hidden">
                     <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded border border-yellow-500/30 uppercase">Coming Soon</div>
                     <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg text-2xl">🎡</div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Nisathon Wheel</h2>
                            <p className="text-gray-400 text-sm">Customize spin wheel segments and probabilities.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
