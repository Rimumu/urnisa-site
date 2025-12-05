
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';
import { useProfileContent, AboutItem, CreditItem, ArtistItem } from '../hooks/useProfileContent';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';
import ImageUploader from '../components/ImageUploader';
import { useNisathonStats, ContributorEvent } from '../hooks/useNisathonStats';
import { useCountdown } from '../hooks/useCountdown';
import { DISCORD_API_URL } from '../constants';

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

// ... (Existing Helpers for Editor and Links remain unchanged) ...
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
// ... (Keeping existing RichTextEditor logic unchanged) ...
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

// Interface for Code List
interface Code {
    _id: string;
    code: string;
    type: 'lamb' | 'wagyu';
    packAmount: number;
    usageType: string;
    usageCount: number;
    expiresAt?: string;
    createdAt: string;
}

const Admin: React.FC = () => {
    // --- AUTH STATE ---
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    // --- NAVIGATION STATE ---
    const [activeTab, setActiveTab] = useState<'nisathon_mgr' | 'countdown' | 'schedule' | 'event' | 'profile' | 'gallery' | 'minecraft' | 'codes'>('nisathon_mgr');

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

    // --- NEW STATE FOR EVENT LOGS ---
    const [recentEvents, setRecentEvents] = useState<ContributorEvent[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{id: string, revert: boolean} | null>(null);
    const [filterType, setFilterType] = useState<string>('all'); // New Filter State

    // --- COUNTDOWN STATE ---
    const [cdH, setCdH] = useState(0);
    const [cdM, setCdM] = useState(0);
    const [cdS, setCdS] = useState(0);
    const [cdAddM, setCdAddM] = useState(0);

    // --- STREAM STATUS STATE ---
    const [streamStatusOverride, setStreamStatusOverride] = useState<'auto' | 'live' | 'offline'>('auto');

    // --- MINECRAFT WHITELIST STATE ---
    const [whitelistApps, setWhitelistApps] = useState<any[]>([]);
    const [approvedApps, setApprovedApps] = useState<any[]>([]);

    // --- CODE GENERATION STATE ---
    const [genType, setGenType] = useState('lamb');
    const [genAmount, setGenAmount] = useState(1);
    const [genPackAmount, setGenPackAmount] = useState(1);
    const [genUsageType, setGenUsageType] = useState('once_global');
    const [genHours, setGenHours] = useState(12);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
    const [existingCodes, setExistingCodes] = useState<Code[]>([]);

    // --- CONFIRMATION STATES ---
    const [confirmReset, setConfirmReset] = useState(false);
    const [confirmSync, setConfirmSync] = useState(false);
    const [confirmRebuild, setConfirmRebuild] = useState(false);

    // --- EFFECTS ---
    useEffect(() => { setNewScheduleUrl(currentScheduleUrl); }, [currentScheduleUrl]);
    useEffect(() => {
        setLocalAbout(aboutContent);
        setLocalCredits(creditsContent);
        setLocalArtworks(artworksContent);
    }, [aboutContent, creditsContent, artworksContent]);
    useEffect(() => { setLocalGoals(currentGoals); }, [currentGoals]);
    useEffect(() => { setLocalWheel(wheelItems); }, [wheelItems]);

    // Fetch Logs when on manager tab
    const fetchEventLog = async () => {
        try {
            // Fetch 50 most recent events from backend
            const res = await fetch(`${API_BASE_URL}/api/nisathon/recent`);
            if(res.ok) setRecentEvents(await res.json());
        } catch(e) {}
    };

    useEffect(() => {
        if (isAuthenticated && activeTab === 'nisathon_mgr') {
            fetchEventLog();
            const interval = setInterval(fetchEventLog, 5000); // Refresh logs often
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, activeTab]);

    const fetchWhitelistData = useCallback(async () => {
        try {
            // Pending
            const resPending = await fetch(`${DISCORD_API_URL}/api/admin/whitelist`, {
                headers: { Authorization: password } 
            });
            if (resPending.ok) {
                setWhitelistApps(await resPending.json());
            }

            // Approved
            const resApproved = await fetch(`${DISCORD_API_URL}/api/admin/whitelist/approved`, {
                headers: { Authorization: password }
            });
            if (resApproved.ok) {
                setApprovedApps(await resApproved.json());
            }
        } catch (e) {}
    }, [password]);

    const fetchCodes = useCallback(async () => {
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/admin/codes/list`, {
                headers: { Authorization: password }
            });
            if (res.ok) {
                setExistingCodes(await res.json());
            }
        } catch(e) {}
    }, [password]);

    // Fetch Whitelist Apps
    useEffect(() => {
        let interval: number;
        if (isAuthenticated && activeTab === 'minecraft') {
            fetchWhitelistData();
            interval = window.setInterval(fetchWhitelistData, 10000);
        }
        if (isAuthenticated && activeTab === 'codes') {
            fetchCodes();
        }
        return () => { if(interval) clearInterval(interval); };
    }, [isAuthenticated, activeTab, fetchWhitelistData, fetchCodes]);

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

    // ... (Keep existing update handlers) ...
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

    const handleGenerateCodes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${DISCORD_API_URL}/api/admin/codes/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ 
                    type: genType, 
                    amount: genAmount,
                    packAmount: genPackAmount,
                    usageType: genUsageType,
                    hours: genHours
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setGeneratedCodes(data.codes);
                fetchCodes(); // Refresh list
            }
        } catch(e) {} finally { setLoading(false); }
    };

    const handleDeleteCode = async (id: string) => {
        if (!window.confirm("Delete this code permanently?")) return;
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/codes/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ id })
            });
            fetchCodes();
        } catch(e) {}
    };

    // --- GENERIC API CALL HANDLER ---
    // ... (Keep generic handler)
    const apiCall = async (endpoint: string, body: any) => {
        setLoading(true);
        setManagerStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/${endpoint}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': password },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setManagerStatus({ type: 'success', message: 'Action executed successfully!' });
                if (endpoint.includes('nisathon')) refetchStats();
                if (endpoint.includes('delete-event') || endpoint.includes('test-event') || endpoint.includes('rebuild')) fetchEventLog();
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
    
    const handleDeleteEvent = (id: string, revert: boolean) => {
        apiCall('nisathon/delete-event', { id, revert });
        setConfirmDelete(null);
    };

    // CONFIRMATION LOGIC
    const handleResetData = () => { if (confirmReset) { apiCall('nisathon/reset', {}); setConfirmReset(false); } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); } };
    const handleForceSync = () => { if (confirmSync) { apiCall('nisathon/sync', {}); setConfirmSync(false); } else { setConfirmSync(true); setTimeout(() => setConfirmSync(false), 3000); } };
    const handleRebuild = () => { if (confirmRebuild) { apiCall('nisathon/rebuild', {}); setConfirmRebuild(false); } else { setConfirmRebuild(true); setTimeout(() => setConfirmRebuild(false), 3000); } };

    // COUNTDOWN HANDLERS
    const handleCountdownSet = () => apiCall('countdown/set', { hours: cdH, minutes: cdM, seconds: cdS });
    const handleCountdownAdd = () => apiCall('countdown/add', { minutes: cdAddM });
    const handleCountdownPause = () => apiCall('countdown/pause', {});
    const handleCountdownReset = () => apiCall('countdown/reset', {});
    
    // MINECRAFT HANDLERS
    const handleApproveApp = async (id: string) => {
        setLoading(true);
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/whitelist/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ id })
            });
            fetchWhitelistData();
        } catch(e){} finally { setLoading(false); }
    };

    const handleRejectApp = async (id: string) => {
         const confirmed = window.confirm("Reject this application?");
         if(!confirmed) return;
         
         setLoading(true);
         try {
             await fetch(`${DISCORD_API_URL}/api/admin/whitelist/reject`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json', Authorization: password },
                 body: JSON.stringify({ id })
             });
             fetchWhitelistData();
         } catch(e){} finally { setLoading(false); }
    };

    const handleRevokeApp = async (id: string, username: string) => {
        const confirmed = window.confirm(`Remove ${username} from the whitelist? (Simulates RCON command)`);
        if(!confirmed) return;

        setLoading(true);
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/whitelist/revoke`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ id })
            });
            fetchWhitelistData();
        } catch(e){} finally { setLoading(false); }
    };

    // --- HELPERS ---
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

    // FILTER LOGIC
    const filteredEvents = recentEvents.filter(evt => {
        if (filterType === 'all') return true;
        if (filterType === 'sub') return evt.type === 'sub' || evt.type === 'subscriber';
        if (filterType === 'gift') return evt.type === 'gift';
        if (filterType === 'bits') return evt.type === 'bits' || evt.type === 'cheer';
        if (filterType === 'dono') return evt.type === 'donation' || evt.type === 'tip';
        if (filterType === 'follow') return evt.type === 'follower' || evt.type === 'follow';
        return true;
    });

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
                    <button onClick={() => setActiveTab('minecraft')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'minecraft' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>⛏️</span> Minecraft
                    </button>
                    <button onClick={() => setActiveTab('codes')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'codes' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>🎁</span> Gacha Codes
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
                            {/* ... existing content ... */}
                            <h2 className="text-3xl font-black text-white">Nisathon Manager</h2>
                            {/* ... existing timer controls ... */}
                            {/* ... existing logs ... */}
                        </div>
                    )}

                    {/* ... (Other tabs kept same) ... */}

                    {/* --- CODES TAB --- */}
                    {activeTab === 'codes' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Gacha Code Manager</h2>
                            
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Generate Codes</h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Pack Type</label>
                                            <select 
                                                value={genType} 
                                                onChange={(e) => setGenType(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mt-1"
                                            >
                                                <option value="lamb">Lamb Chop (Genetic)</option>
                                                <option value="wagyu">Wagyu A5 (Mythic)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Packs per Code</label>
                                            <input 
                                                type="number" 
                                                value={genPackAmount} 
                                                onChange={(e) => setGenPackAmount(Math.max(1, parseInt(e.target.value)))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mt-1"
                                                min="1" max="100"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Usage Limit</label>
                                            <select 
                                                value={genUsageType} 
                                                onChange={(e) => setGenUsageType(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mt-1"
                                            >
                                                <option value="once_global">Single Use (Global)</option>
                                                <option value="once_per_user">Once Per User</option>
                                                <option value="infinite">Infinite Use</option>
                                                <option value="time_limited">Limited Time</option>
                                            </select>
                                        </div>
                                        {genUsageType === 'time_limited' && (
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase">Duration (Hours)</label>
                                                <input 
                                                    type="number" 
                                                    value={genHours} 
                                                    onChange={(e) => setGenHours(Math.max(1, parseInt(e.target.value)))}
                                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mt-1"
                                                    min="1"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase">Quantity to Generate</label>
                                            <input 
                                                type="number" 
                                                value={genAmount} 
                                                onChange={(e) => setGenAmount(Math.max(1, parseInt(e.target.value)))}
                                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white mt-1"
                                                min="1" max="50"
                                            />
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={handleGenerateCodes}
                                        disabled={loading}
                                        className="w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                                    >
                                        {loading ? 'Generating...' : 'Generate Codes'}
                                    </button>
                                </div>

                                {generatedCodes.length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <h3 className="font-bold text-white mb-4">New Codes</h3>
                                        <div className="bg-black/40 p-4 rounded-xl font-mono text-sm space-y-2 max-h-40 overflow-y-auto custom-scrollbar select-all">
                                            {generatedCodes.map((code, i) => (
                                                <div key={i} className="text-brand-accent">{code}</div>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(generatedCodes.join('\n'))}
                                            className="mt-4 text-xs text-gray-400 hover:text-white"
                                        >
                                            Copy All to Clipboard
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Active Codes List */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white">Active Codes</h3>
                                    <button onClick={fetchCodes} className="text-xs text-brand-primary hover:underline">Refresh</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="bg-white/5 uppercase text-xs font-bold text-gray-500">
                                            <tr>
                                                <th className="p-3 rounded-tl-lg">Code</th>
                                                <th className="p-3">Reward</th>
                                                <th className="p-3">Limit</th>
                                                <th className="p-3">Uses</th>
                                                <th className="p-3 rounded-tr-lg text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {existingCodes.map((c) => (
                                                <tr key={c._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-3 font-mono text-white select-all">{c.code}</td>
                                                    <td className="p-3">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.type === 'lamb' ? 'bg-purple-500/20 text-purple-300' : 'bg-pink-500/20 text-pink-300'}`}>
                                                            {c.type}
                                                        </span>
                                                        <span className="ml-2 font-bold text-xs">x{c.packAmount || 1}</span>
                                                    </td>
                                                    <td className="p-3">
                                                        {c.usageType === 'once_global' ? <span className="text-red-400">Single</span> :
                                                         c.usageType === 'once_per_user' ? <span className="text-blue-400">1/User</span> :
                                                         c.usageType === 'time_limited' ? <span className="text-orange-400">Timed</span> :
                                                         <span className="text-green-400">Infinite</span>}
                                                    </td>
                                                    <td className="p-3 font-mono">{c.usageCount}</td>
                                                    <td className="p-3 text-right">
                                                        <button 
                                                            onClick={() => handleDeleteCode(c._id)}
                                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {existingCodes.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-gray-500 italic">No codes found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
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
