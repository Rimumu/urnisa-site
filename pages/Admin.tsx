import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';
import { useProfileContent, AboutItem, CreditItem, ArtistItem } from '../hooks/useProfileContent';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';
import ImageUploader from '../components/ImageUploader';
import { useNisathonStats } from '../hooks/useNisathonStats';
import { useCountdown } from '../hooks/useCountdown';

// --- HELPER: URL PROCESSOR (Google Drive & Imgur) ---
const processImageUrl = (url: string): string => {
    if (!url) return '';
    const cleanUrl = url.trim();

    if (cleanUrl.includes('drive.google.com') || cleanUrl.includes('docs.google.com')) {
        const idMatch = cleanUrl.match(/(?:\/file\/d\/|\/d\/|\?id=)([-\w]+)/);
        const id = idMatch ? idMatch[1] : null;
        if (id) {
            return `https://drive.google.com/thumbnail?id=${id}&sz=w4000`;
        }
    }

    if (cleanUrl.includes('imgur.com')) {
        if (cleanUrl.includes('i.imgur.com')) return cleanUrl;
        const parts = cleanUrl.split('/');
        const lastPart = parts[parts.length - 1];
        const id = lastPart.split('.')[0];
        return `https://i.imgur.com/${id}.png`;
    }

    return cleanUrl;
};

const isDiscordLink = (url: string) => {
    return url.includes('cdn.discordapp.com') || url.includes('media.discordapp.net');
};

const LinkWarning: React.FC<{ url: string }> = ({ url }) => {
    if (!url) return null;
    
    if (isDiscordLink(url)) {
        return (
            <div className="text-red-400 text-xs mt-1 flex items-start gap-1 font-bold">
                <span>⛔</span>
                <span>Discord links expire after 24h. Please use the upload feature or use Imgur or Google Drive!</span>
            </div>
        );
    }
    return null;
};

// --- RICH TEXT EDITOR COMPONENT ---
const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });

    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== value) {
             if (document.activeElement !== contentRef.current) {
                 contentRef.current.innerHTML = value;
             }
        }
    }, [value]);

    const exec = (command: string) => {
        document.execCommand(command, false, undefined);
        checkActiveStates();
        if (contentRef.current) onChange(contentRef.current.innerHTML);
        contentRef.current?.focus();
    };

    const checkActiveStates = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            list: document.queryCommandState('insertUnorderedList'),
        });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        if (contentRef.current) onChange(contentRef.current.innerHTML);
    };

    return (
        <div className="w-full bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col h-56 group focus-within:border-brand-primary/50 transition-colors">
             <style>{`
                .editor-content ul {
                    list-style-type: disc !important;
                    padding-left: 1.5em !important;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                .editor-content li {
                    display: list-item !important;
                }
             `}</style>
             <div className="flex gap-1 p-2 bg-white/5 border-b border-white/5 select-none items-center">
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center font-bold ${activeFormats.bold ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Bold"
                >
                    B
                </button>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center italic ${activeFormats.italic ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Italic"
                >
                    I
                </button>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center underline ${activeFormats.underline ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Underline"
                >
                    U
                </button>
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center ${activeFormats.list ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Bullet List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div
                ref={contentRef}
                className="editor-content flex-1 p-3 text-white text-sm outline-none overflow-y-auto"
                contentEditable
                onInput={(e) => {
                    onChange(e.currentTarget.innerHTML);
                    checkActiveStates();
                }}
                onKeyUp={checkActiveStates}
                onMouseUp={checkActiveStates}
                onClick={checkActiveStates}
                onPaste={handlePaste}
                suppressContentEditableWarning
                style={{ minHeight: '100px' }}
            />
        </div>
    );
};

const Admin: React.FC = () => {
    // --- AUTH STATE ---
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    // --- NAVIGATION STATE ---
    const [activeTab, setActiveTab] = useState<'nisathon_mgr' | 'countdown' | 'schedule' | 'event' | 'profile' | 'gallery'>('nisathon_mgr');

    // --- DATA STATE ---
    const { scheduleUrl: currentScheduleUrl } = useSchedule();
    const [newScheduleUrl, setNewScheduleUrl] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { aboutContent, creditsContent, artworksContent, refetch: refetchProfile } = useProfileContent();
    const [localAbout, setLocalAbout] = useState<AboutItem[]>([]);
    const [localCredits, setLocalCredits] = useState<CreditItem[]>([]);
    const [localArtworks, setLocalArtworks] = useState<ArtistItem[]>([]);
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { goals: currentGoals, refetch: refetchGoals } = useNisathonGoals();
    const [localGoals, setLocalGoals] = useState<NisathonGoal[]>([]);
    const [goalsStatus, setGoalsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { items: wheelItems, refetch: refetchWheel } = useWheelSettings();
    const [localWheel, setLocalWheel] = useState<WheelItem[]>([]);
    const [wheelStatus, setWheelStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // --- NISATHON MANAGER STATE ---
    const { stats, refetch: refetchStats } = useNisathonStats();
    const [timerH, setTimerH] = useState(0);
    const [timerM, setTimerM] = useState(0);
    const [timerS, setTimerS] = useState(0);
    const [addM, setAddM] = useState(0);
    const [testUser, setTestUser] = useState("AdminTest");
    const [testType, setTestType] = useState("sub");
    const [testAmount, setTestAmount] = useState("1");
    const [testTier, setTestTier] = useState("1000"); // 1000 = Tier 1, 2000 = Tier 2, 3000 = Tier 3
    const [managerStatus, setManagerStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // --- COUNTDOWN STATE ---
    // We don't need the full hook data here, just endpoints, but let's setup inputs
    const [cdH, setCdH] = useState(0);
    const [cdM, setCdM] = useState(0);
    const [cdS, setCdS] = useState(0);
    const [cdAddM, setCdAddM] = useState(0);

    // --- STREAM STATUS STATE ---
    const [streamStatusOverride, setStreamStatusOverride] = useState<'auto' | 'live' | 'offline'>('auto');

    // --- CONFIRMATION STATES ---
    const [confirmReset, setConfirmReset] = useState(false);
    const [confirmSync, setConfirmSync] = useState(false);
    const [confirmRebuild, setConfirmRebuild] = useState(false); // NEW

    // --- EFFECTS ---
    useEffect(() => { setNewScheduleUrl(currentScheduleUrl); }, [currentScheduleUrl]);
    useEffect(() => {
        setLocalAbout(aboutContent);
        setLocalCredits(creditsContent);
        setLocalArtworks(artworksContent);
    }, [aboutContent, creditsContent, artworksContent]);
    useEffect(() => { setLocalGoals(currentGoals); }, [currentGoals]);
    useEffect(() => { setLocalWheel(wheelItems); }, [wheelItems]);

    // Fetch Stream Status Override on auth
    useEffect(() => {
        if (isAuthenticated) {
            fetch(`${API_BASE_URL}/api/stream-status`).then(r => r.json()).then(d => setStreamStatusOverride(d.override));
        }
    }, [isAuthenticated]);

    // --- HANDLERS ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setLoginError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setIsAuthenticated(true);
            } else {
                setLoginError('Incorrect password.');
            }
        } catch (error) {
            setLoginError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setScheduleStatus(null);
        const processedUrl = processImageUrl(newScheduleUrl);
        try {
            const response = await fetch(`${API_BASE_URL}/api/schedule`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify({ url: processedUrl })
            });
            if (response.ok) {
                setScheduleStatus({ type: 'success', message: 'Schedule updated!' });
                setNewScheduleUrl(processedUrl);
            } else {
                setScheduleStatus({ type: 'error', message: 'Failed to update.' });
            }
        } catch (error) {
            setScheduleStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (type: 'about' | 'credits' | 'artworks') => {
        setLoading(true);
        setProfileStatus(null);
        let data;
        if (type === 'about') data = localAbout;
        else if (type === 'credits') data = localCredits;
        else if (type === 'artworks') data = localArtworks;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify({ type, data })
            });
            if (response.ok) {
                setProfileStatus({ type: 'success', message: `${type === 'artworks' ? 'Gallery' : type} saved!` });
                refetchProfile();
            } else {
                setProfileStatus({ type: 'error', message: 'Failed to save.' });
            }
        } catch (error) {
            setProfileStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGoals = async () => {
        setLoading(true);
        setGoalsStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify({ goals: localGoals })
            });
            if (response.ok) {
                setGoalsStatus({ type: 'success', message: 'Goals saved!' });
                refetchGoals();
            } else {
                setGoalsStatus({ type: 'error', message: 'Failed to save goals.' });
            }
        } catch (error) {
            setGoalsStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveWheel = async () => {
        setLoading(true);
        setWheelStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/wheel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify({ items: localWheel })
            });
            if (response.ok) {
                setWheelStatus({ type: 'success', message: 'Wheel saved!' });
                refetchWheel();
            } else {
                setWheelStatus({ type: 'error', message: 'Failed to save wheel.' });
            }
        } catch (error) {
            setWheelStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSetStreamStatus = async (override: 'auto' | 'live' | 'offline') => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/stream-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify({ override })
            });
            if (response.ok) {
                setStreamStatusOverride(override);
                setManagerStatus({ type: 'success', message: `Stream Status set to ${override.toUpperCase()}` });
            }
        } catch (error) {
            setManagerStatus({ type: 'error', message: 'Failed to update status.' });
        } finally {
            setLoading(false);
        }
    };

    // --- GENERIC API CALL HANDLER ---
    const apiCall = async (endpoint: string, body: any) => {
        setLoading(true);
        setManagerStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, { // Changed to allow countdown endpoint which is not under nisathon/
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setManagerStatus({ type: 'success', message: 'Action executed successfully!' });
                // If nisathon action, refresh stats
                if (endpoint.includes('nisathon')) refetchStats();
            } else {
                setManagerStatus({ type: 'error', message: 'Action failed.' });
            }
        } catch (error) {
            setManagerStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    // NISATHON HANDLERS
    const handleSetTimer = () => apiCall('nisathon/timer/set', { hours: timerH, minutes: timerM, seconds: timerS });
    const handleAddTimer = () => apiCall('nisathon/timer/add', { minutes: addM });
    const handlePauseTimer = () => apiCall('nisathon/timer/pause', {});
    const handleSimulateEvent = () => apiCall('nisathon/test-event', { type: testType, user: testUser, amount: testAmount, tier: testTier });
    const handleToggleDoubleTimer = () => apiCall('nisathon/event', { activeEvent: stats.activeEvent === 'DOUBLE_TIMER' ? null : 'DOUBLE_TIMER' });
    
    // Reset with 2-step confirmation (Double Click Logic)
    const handleResetData = () => {
        if (confirmReset) {
            apiCall('nisathon/reset', {});
            setConfirmReset(false);
        } else {
            setConfirmReset(true);
            setTimeout(() => setConfirmReset(false), 3000); // Reset state after 3s
        }
    };

    // Sync with 2-step confirmation (Double Click Logic)
    const handleForceSync = () => {
        if (confirmSync) {
            apiCall('nisathon/sync', {}); // This calls runSync(true) on backend (Deep Sync)
            setConfirmSync(false);
        } else {
            setConfirmSync(true);
            setTimeout(() => setConfirmSync(false), 3000);
        }
    };
    
    // NEW: REBUILD HANDLER
    const handleRebuild = () => {
        if (confirmRebuild) {
            apiCall('nisathon/rebuild', {});
            setConfirmRebuild(false);
        } else {
            setConfirmRebuild(true);
            setTimeout(() => setConfirmRebuild(false), 3000);
        }
    };

    // COUNTDOWN HANDLERS
    const handleCountdownSet = () => apiCall('countdown/set', { hours: cdH, minutes: cdM, seconds: cdS });
    const handleCountdownAdd = () => apiCall('countdown/add', { minutes: cdAddM });
    const handleCountdownPause = () => apiCall('countdown/pause', {});
    const handleCountdownReset = () => apiCall('countdown/reset', {});

    // --- CONTENT EDITORS HELPERS ---
    const updateAboutItem = (i: number, f: keyof AboutItem, v: string) => { const u = [...localAbout]; u[i] = { ...u[i], [f]: v }; setLocalAbout(u); };
    const addAboutItem = () => setLocalAbout([...localAbout, { id: Date.now().toString(), title: 'New Section', text: '' }]);
    const removeAboutItem = (i: number) => setLocalAbout(localAbout.filter((_, idx) => idx !== i));

    const updateCreditItem = (i: number, f: keyof CreditItem, v: string) => { const u = [...localCredits]; let val = v; if (f === 'image') val = processImageUrl(v); u[i] = { ...u[i], [f]: val } as any; setLocalCredits(u); };
    const addCreditItem = () => setLocalCredits([...localCredits, { id: Date.now().toString(), name: 'Name', role: 'Role', color: '#e5383b', initial: '?', link: '' }]);
    const removeCreditItem = (i: number) => setLocalCredits(localCredits.filter((_, idx) => idx !== i));

    const addArtist = () => setLocalArtworks([...localArtworks, { id: Date.now().toString(), artistName: 'New Artist', artistLink: '', images: [] }]);
    const removeArtist = (i: number) => setLocalArtworks(localArtworks.filter((_, idx) => idx !== i));
    const updateArtistName = (i: number, v: string) => { const u = [...localArtworks]; u[i].artistName = v; setLocalArtworks(u); };
    const updateArtistLink = (i: number, v: string) => { const u = [...localArtworks]; u[i].artistLink = v; setLocalArtworks(u); };
    const addImageToArtist = (i: number, v: string) => { if (!v) return; const u = [...localArtworks]; u[i].images.push(processImageUrl(v)); setLocalArtworks(u); };
    const removeImageFromArtist = (ai: number, ii: number) => { const u = [...localArtworks]; u[ai].images = u[ai].images.filter((_, idx) => idx !== ii); setLocalArtworks(u); };

    const addGoal = () => { const max = localGoals.length > 0 ? Math.max(...localGoals.map(g => g.count)) : 0; setLocalGoals([...localGoals, { count: max + 50, reward: "New Goal", secret: false }]); };
    const removeGoal = (i: number) => setLocalGoals(localGoals.filter((_, idx) => idx !== i));
    const updateGoal = (i: number, f: keyof NisathonGoal, v: any) => { const u = [...localGoals]; (u[i] as any)[f] = v; setLocalGoals(u); };

    const addWheelItem = () => setLocalWheel([...localWheel, { label: "New Reward", weight: 10 }]);
    const removeWheelItem = (i: number) => setLocalWheel(localWheel.filter((_, idx) => idx !== i));
    const updateWheelItem = (i: number, f: keyof WheelItem, v: any) => { const u = [...localWheel]; (u[i] as any)[f] = v; setLocalWheel(u); };
    const totalWheelWeight = localWheel.reduce((acc, item) => acc + item.weight, 0);

    // --- RENDER ---
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                    <h1 className="text-3xl font-extrabold text-center mb-6 text-white">Admin <span className="text-brand-primary">Login</span></h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none" placeholder="Enter password" />
                        {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all">{loading ? 'Verifying...' : 'Access Dashboard'}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-black/20">
            {/* --- SIDEBAR --- */}
            <div className="w-full md:w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex-shrink-0 md:h-screen md:sticky md:top-0">
                <div className="p-6 border-b border-white/10 flex items-center justify-center md:justify-start gap-2">
                    <span className="text-2xl">⚡</span>
                    <h1 className="text-xl font-extrabold text-white">Admin <span className="text-brand-primary">Panel</span></h1>
                </div>
                <nav className="p-4 space-y-2 flex md:block overflow-x-auto md:overflow-visible">
                    <button onClick={() => setActiveTab('nisathon_mgr')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'nisathon_mgr' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>⏲️</span> Nisathon
                    </button>
                    <button onClick={() => setActiveTab('countdown')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'countdown' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>⏳</span> Countdown
                    </button>
                    <button onClick={() => setActiveTab('schedule')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'schedule' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>📅</span> Schedule
                    </button>
                    <button onClick={() => setActiveTab('event')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'event' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>🎉</span> Settings
                    </button>
                    <button onClick={() => setActiveTab('profile')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'profile' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>👤</span> Profile
                    </button>
                    <button onClick={() => setActiveTab('gallery')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'gallery' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>🎨</span> Gallery
                    </button>
                </nav>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto min-h-screen">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* --- STATUS TOASTS --- */}
                    {[profileStatus, goalsStatus, wheelStatus, scheduleStatus, managerStatus].map((status, i) => status && (
                         <div key={i} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border border-white/10 ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white animate-in fade-in slide-in-from-right`}>
                            {status.message}
                        </div>
                    ))}

                    {/* --- NISATHON MANAGER TAB --- */}
                    {activeTab === 'nisathon_mgr' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Nisathon Manager</h2>

                            {/* Stream Status Override Section */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="text-xl font-bold text-brand-primary mb-4">Stream Status Override</h3>
                                <div className="flex gap-3 p-2 bg-black/40 rounded-xl border border-white/5">
                                    <button 
                                        onClick={() => handleSetStreamStatus('auto')}
                                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${streamStatusOverride === 'auto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        AUTO (Default)
                                    </button>
                                    <button 
                                        onClick={() => handleSetStreamStatus('live')}
                                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${streamStatusOverride === 'live' ? 'bg-red-600 text-white shadow-lg animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        FORCE LIVE
                                    </button>
                                    <button 
                                        onClick={() => handleSetStreamStatus('offline')}
                                        className={`flex-1 py-3 rounded-lg font-bold transition-all ${streamStatusOverride === 'offline' ? 'bg-gray-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        FORCE OFFLINE
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    "Auto" uses Twitch API. "Force" overrides the status on the website navbar.
                                </p>
                            </div>
                            
                            {/* Active Event Toggle */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-brand-primary">Active Event</h3>
                                    <p className="text-gray-400 text-sm">Double Timer Mode (2x time added for all subs/bits/donos)</p>
                                </div>
                                <button 
                                    onClick={handleToggleDoubleTimer}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${stats.activeEvent === 'DOUBLE_TIMER' ? 'bg-purple-600 text-white animate-pulse' : 'bg-white/10 text-gray-400 hover:text-white'}`}
                                >
                                    {stats.activeEvent === 'DOUBLE_TIMER' ? 'Event ACTIVE' : 'Start Double Timer'}
                                </button>
                            </div>

                            {/* Data Management Section */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="text-xl font-bold text-brand-primary mb-4">Data Management</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button 
                                        onClick={handleForceSync}
                                        disabled={loading}
                                        className={`w-full font-bold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 text-white ${confirmSync ? 'bg-amber-500 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
                                    >
                                        <span>🔄</span> {confirmSync ? "Confirm Sync?" : "Force Sync"}
                                    </button>
                                    <button 
                                        onClick={handleRebuild}
                                        disabled={loading}
                                        className={`w-full font-bold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 text-white ${confirmRebuild ? 'bg-purple-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'}`}
                                    >
                                        <span>🔥</span> {confirmRebuild ? "REALLY REBUILD?" : "Full Rebuild"}
                                    </button>
                                    <button 
                                        onClick={handleResetData}
                                        disabled={loading}
                                        className={`w-full font-bold py-3 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2 text-white ${confirmReset ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'}`}
                                    >
                                        <span>⚠️</span> {confirmReset ? "WIPE ALL?" : "Reset Data"}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    <strong>Force Sync:</strong> Checks recent history. <strong>Full Rebuild:</strong> Wipes & fetches last 1000 events (fixes timer/wheel). <strong>Reset:</strong> Deletes everything.
                                </p>
                            </div>

                            {/* Timer Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <h3 className="text-xl font-bold text-brand-primary mb-4">Timer Control</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Set Timer (From Now)</label>
                                            <div className="flex gap-2 mt-1">
                                                <input type="number" placeholder="HH" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setTimerH(parseInt(e.target.value)||0)} />
                                                <input type="number" placeholder="MM" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setTimerM(parseInt(e.target.value)||0)} />
                                                <input type="number" placeholder="SS" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setTimerS(parseInt(e.target.value)||0)} />
                                            </div>
                                            <button onClick={handleSetTimer} className="w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2 rounded-lg transition-colors">Set Countdown</button>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Add Time (Minutes)</label>
                                            <div className="flex gap-2 mt-1">
                                                <input type="number" placeholder="Minutes" className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono" onChange={(e) => setAddM(parseInt(e.target.value)||0)} />
                                                <button onClick={handleAddTimer} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg transition-colors">+</button>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/5">
                                            <button onClick={handlePauseTimer} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors">⏯️ Pause / Resume Timer</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Simulation Controls */}
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <h3 className="text-xl font-bold text-brand-primary mb-4">Simulate/Manual Entry</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Event Type</label>
                                            <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white mt-1" onChange={(e) => setTestType(e.target.value)} value={testType}>
                                                <option value="sub">Subscription</option>
                                                <option value="gift">Gift Sub</option>
                                                <option value="bits">Bits (Cheer)</option>
                                                <option value="donation">Donation (Tip)</option>
                                            </select>
                                        </div>
                                        {/* Tier Selector: Only show for Subs/Gifts */}
                                        {(testType === 'sub' || testType === 'gift') && (
                                            <div className="animate-in fade-in zoom-in duration-200">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Sub Tier</label>
                                                <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white mt-1" onChange={(e) => setTestTier(e.target.value)} value={testTier}>
                                                    <option value="1000">Tier 1 (0.5 NB)</option>
                                                    <option value="2000">Tier 2 (1.0 NB)</option>
                                                    <option value="3000">Tier 3 (2.0 NB)</option>
                                                    <option value="prime">Prime (0.5 NB)</option>
                                                </select>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">User Name</label>
                                            <input type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white mt-1" value={testUser} onChange={(e) => setTestUser(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (Count / $)</label>
                                            <input type="number" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white mt-1" value={testAmount} onChange={(e) => setTestAmount(e.target.value)} />
                                        </div>
                                        <button onClick={handleSimulateEvent} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">🚀 Trigger Event</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- COUNTDOWN TAB --- */}
                    {activeTab === 'countdown' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Simple Countdown</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="text-xl font-bold text-brand-primary mb-4">Timer Control</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Set Duration</label>
                                        <div className="flex gap-2 mt-1">
                                            <input type="number" placeholder="HH" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setCdH(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="MM" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setCdM(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="SS" className="w-1/3 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono text-center" onChange={(e) => setCdS(parseInt(e.target.value)||0)} />
                                        </div>
                                        <button onClick={handleCountdownSet} className="w-full mt-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-2 rounded-lg transition-colors">Set Timer</button>
                                    </div>
                                    <div className="pt-4 border-t border-white/5">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Add Time (Minutes)</label>
                                        <div className="flex gap-2 mt-1">
                                            <input type="number" placeholder="Minutes" className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono" onChange={(e) => setCdAddM(parseInt(e.target.value)||0)} />
                                            <button onClick={handleCountdownAdd} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded-lg transition-colors">+</button>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-white/5 flex gap-2">
                                        <button onClick={handleCountdownPause} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors">⏯️ Pause / Resume</button>
                                        <button onClick={handleCountdownReset} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors">⏹️ Reset</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- SCHEDULE TAB --- */}
                    {activeTab === 'schedule' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <h2 className="text-3xl font-black text-white mb-6">Stream Schedule</h2>
                             <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <form onSubmit={handleUpdateSchedule} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-1">Image URL</label>
                                        <div className="flex gap-2">
                                            <input type="url" value={newScheduleUrl} onChange={(e) => setNewScheduleUrl(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none font-mono text-sm" placeholder="Paste link or upload..." required />
                                            <ImageUploader onUploadSuccess={(url) => setNewScheduleUrl(url)} />
                                        </div>
                                        <LinkWarning url={newScheduleUrl} />
                                    </div>
                                    {newScheduleUrl && (
                                        <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex justify-center">
                                            <img src={processImageUrl(newScheduleUrl)} alt="Preview" className="max-h-96 w-full object-contain rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                    <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                         <button type="submit" disabled={loading} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">{loading ? 'Saving...' : 'Update Schedule'}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* --- EVENT TAB (GOALS & WHEEL) --- */}
                    {activeTab === 'event' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-6">Nisathon Goals</h2>
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2">
                                            <div className="col-span-2">Target</div>
                                            <div className="col-span-7">Reward Name</div>
                                            <div className="col-span-2 text-center">Secret?</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {localGoals.map((goal, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2 items-center group">
                                                <div className="w-[15%]">
                                                    <input type="number" value={goal.count} onChange={(e) => updateGoal(idx, 'count', parseInt(e.target.value))} className="w-full bg-black/20 border border-white/10 rounded px-2 py-2 text-white font-mono text-center font-bold" />
                                                </div>
                                                <div className="flex-1">
                                                    <input type="text" value={goal.reward} onChange={(e) => updateGoal(idx, 'reward', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-2 text-white" />
                                                </div>
                                                <div className="w-[10%] flex justify-center">
                                                    <input type="checkbox" checked={goal.secret || false} onChange={(e) => updateGoal(idx, 'secret', e.target.checked)} className="w-5 h-5 rounded cursor-pointer accent-brand-accent" />
                                                </div>
                                                <button onClick={() => removeGoal(idx)} className="text-red-500 hover:text-red-400 p-2 opacity-50 group-hover:opacity-100 transition-opacity">🗑️</button>
                                            </div>
                                        ))}
                                        <button onClick={addGoal} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Goal</button>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                        <button onClick={handleSaveGoals} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save Goals</button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-white mb-6">Spin Wheel Configuration</h2>
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                        <span className="text-gray-400 text-sm">Configure rewards and probabilities.</span>
                                        <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalWheelWeight === 100 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                                            Total Chance: {totalWheelWeight}%
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase px-2">
                                            <div className="col-span-8">Reward Name</div>
                                            <div className="col-span-3 text-center">Chance (%)</div>
                                            <div className="col-span-1"></div>
                                        </div>
                                        {localWheel.map((item, idx) => (
                                            <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-2 items-center group">
                                                <div className="col-span-8 flex-1">
                                                    <input type="text" value={item.label} onChange={(e) => updateWheelItem(idx, 'label', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-2 text-white font-bold" placeholder="Reward Name" />
                                                </div>
                                                <div className="col-span-3 w-24">
                                                    <input type="number" value={item.weight} onChange={(e) => updateWheelItem(idx, 'weight', parseInt(e.target.value) || 0)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-2 text-white font-mono text-center font-bold" />
                                                </div>
                                                <button onClick={() => removeWheelItem(idx)} className="text-red-500 hover:text-red-400 p-2 opacity-50 group-hover:opacity-100 transition-opacity">🗑️</button>
                                            </div>
                                        ))}
                                        <button onClick={addWheelItem} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Reward</button>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                        <button onClick={handleSaveWheel} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save Wheel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- PROFILE TAB (ABOUT & CREDITS) --- */}
                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             <div>
                                <h2 className="text-3xl font-black text-white mb-6">About Me Content</h2>
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <div className="space-y-6">
                                        {localAbout.map((item, idx) => (
                                            <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                                                <button onClick={() => removeAboutItem(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                                <div className="mb-2">
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Title (Optional)</label>
                                                    <input type="text" value={item.title} onChange={(e) => updateAboutItem(idx, 'title', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm font-bold mt-1" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Text Body</label>
                                                    <div className="mt-1"><RichTextEditor value={item.text} onChange={(val) => updateAboutItem(idx, 'text', val)} /></div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={addAboutItem} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Section</button>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                        <button onClick={() => handleSaveProfile('about')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save About</button>
                                    </div>
                                </div>
                             </div>

                             <div>
                                <h2 className="text-3xl font-black text-white mb-6">Credits Content</h2>
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <div className="space-y-4">
                                        {localCredits.map((item, idx) => (
                                            <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group flex flex-col md:flex-row gap-4 items-start">
                                                <button onClick={() => removeCreditItem(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                                                
                                                <div className="space-y-2 flex-shrink-0">
                                                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border border-white/20 overflow-hidden" style={{ backgroundColor: item.color }}>
                                                        {item.image ? <img src={processImageUrl(item.image)} className="w-full h-full object-cover" /> : (item.initial || item.name.charAt(0))}
                                                    </div>
                                                    <input type="color" value={item.color} onChange={(e) => updateCreditItem(idx, 'color', e.target.value)} className="w-12 h-6 bg-transparent cursor-pointer" />
                                                </div>

                                                <div className="flex-1 space-y-2 w-full">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <input type="text" placeholder="Name" value={item.name} onChange={(e) => updateCreditItem(idx, 'name', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm font-bold" />
                                                        <input type="text" placeholder="Role" value={item.role} onChange={(e) => updateCreditItem(idx, 'role', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-300 text-sm" />
                                                    </div>
                                                    <div className="w-full flex gap-2">
                                                        <input type="text" placeholder="Image URL" value={item.image || ''} onChange={(e) => updateCreditItem(idx, 'image', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs font-mono" />
                                                        <ImageUploader onUploadSuccess={(url) => updateCreditItem(idx, 'image', url)} />
                                                    </div>
                                                    <LinkWarning url={item.image || ''} />
                                                    <div className="flex gap-2">
                                                         <input type="text" placeholder="Link (Optional)" value={item.link || ''} onChange={(e) => updateCreditItem(idx, 'link', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs font-mono" />
                                                         <input type="text" placeholder="Initial" value={item.initial || ''} onChange={(e) => updateCreditItem(idx, 'initial', e.target.value)} className="w-20 bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs" maxLength={2} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={addCreditItem} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Credit</button>
                                    </div>
                                    <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                        <button onClick={() => handleSaveProfile('credits')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save Credits</button>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}

                    {/* --- GALLERY TAB --- */}
                    {activeTab === 'gallery' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white mb-6">Art Gallery Manager</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="space-y-8">
                                    {localArtworks.map((artist, artistIdx) => (
                                        <div key={artist.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                                             <button onClick={() => removeArtist(artistIdx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️ Delete Artist</button>
                                             
                                             <div className="mb-4 space-y-2 max-w-lg">
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Artist Name</label>
                                                    <input type="text" value={artist.artistName} onChange={(e) => updateArtistName(artistIdx, e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white font-bold mt-1" placeholder="Artist Name" />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500 uppercase font-bold">Artist Profile Link (Optional)</label>
                                                    <input type="text" value={artist.artistLink || ''} onChange={(e) => updateArtistLink(artistIdx, e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300 text-sm font-mono mt-1" placeholder="https://x.com/artist" />
                                                </div>
                                             </div>

                                             <div className="space-y-2">
                                                <label className="text-xs text-gray-500 uppercase font-bold">Artwork Images</label>
                                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-2">
                                                    {artist.images.map((img, imgIdx) => (
                                                        <div key={imgIdx} className="relative aspect-square bg-black/30 rounded overflow-hidden group/img border border-white/10">
                                                            <img src={processImageUrl(img)} className="w-full h-full object-cover" />
                                                            <button onClick={() => removeImageFromArtist(artistIdx, imgIdx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-red-400 font-bold transition-opacity text-xs uppercase tracking-wider">Remove</button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-lg border border-white/5">
                                                    <div className="flex gap-2">
                                                        <input 
                                                            type="text" 
                                                            id={`new-img-${artist.id}`}
                                                            className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1 text-gray-400 text-xs font-mono"
                                                            placeholder="Paste URL or upload"
                                                            onChange={(e) => {
                                                                const warningEl = document.getElementById(`warning-${artist.id}`);
                                                                if (warningEl) {
                                                                    if (isDiscordLink(e.target.value)) warningEl.style.display = 'flex';
                                                                    else warningEl.style.display = 'none';
                                                                }
                                                            }}
                                                        />
                                                        <ImageUploader onUploadSuccess={(url) => addImageToArtist(artistIdx, url)} />
                                                        <button 
                                                            onClick={() => {
                                                                const input = document.getElementById(`new-img-${artist.id}`) as HTMLInputElement;
                                                                if (input.value) {
                                                                    addImageToArtist(artistIdx, input.value);
                                                                    input.value = '';
                                                                    const warningEl = document.getElementById(`warning-${artist.id}`);
                                                                    if (warningEl) warningEl.style.display = 'none';
                                                                }
                                                            }}
                                                            className="bg-brand-primary/20 text-brand-primary px-4 rounded border border-brand-primary/50 hover:bg-brand-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                    <div id={`warning-${artist.id}`} style={{ display: 'none' }}>
                                                        <div className="text-red-500 text-xs flex items-start gap-1 font-bold">
                                                            <span>⛔</span>
                                                            <span>Discord links expire after 24h!</span>
                                                        </div>
                                                    </div>
                                                </div>
                                             </div>
                                        </div>
                                    ))}
                                    <button onClick={addArtist} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Artist Group</button>
                                </div>
                                <div className="mt-6 flex justify-end pt-4 border-t border-white/5">
                                    <button onClick={() => handleSaveProfile('artworks')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Save Gallery</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;