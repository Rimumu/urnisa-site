
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';
import { useProfileContent, AboutItem, CreditItem, ArtistItem } from '../hooks/useProfileContent';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';
import ImageUploader from '../components/ImageUploader';
import { useNisathonStats, ContributorEvent } from '../hooks/useNisathonStats';
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
    const [activeTab, setActiveTab] = useState<'nisathon_mgr' | 'countdown' | 'schedule' | 'event' | 'profile' | 'gallery' | 'minecraft' | 'codes' | 'users' | 'merger'>('nisathon_mgr');

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

    // --- BINGO CONFIG STATE ---
    const [bingoCardId, setBingoCardId] = useState('');
    const [bingoWinCondition, setBingoWinCondition] = useState('');
    const [bingoStatus, setBingoStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // --- CODE GENERATION STATE ---
    const [genType, setGenType] = useState('lamb');
    const [genAmount, setGenAmount] = useState(1);
    const [genPackAmount, setGenPackAmount] = useState(1);
    const [genUsageType, setGenUsageType] = useState('once_global');
    const [genHours, setGenHours] = useState(12);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
    const [existingCodes, setExistingCodes] = useState<Code[]>([]);

    // --- USER MANAGEMENT STATE ---
    const [userQuery, setUserQuery] = useState('');
    const [userActionStatus, setUserActionStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // --- MERGER TOOL STATE ---
    const [mergedOutput, setMergedOutput] = useState('');
    const [mergerStats, setMergerStats] = useState({ files: 0, spawns: 0 });

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

    const fetchBingoConfig = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/config`);
            if (res.ok) {
                const data = await res.json();
                setBingoCardId(data.cardId || '');
                setBingoWinCondition(data.winCondition || '');
            }
        } catch(e) {}
    }, []);

    // Fetch Whitelist Apps
    useEffect(() => {
        let interval: number;
        if (isAuthenticated && activeTab === 'minecraft') {
            fetchWhitelistData();
            fetchBingoConfig();
            interval = window.setInterval(fetchWhitelistData, 10000);
        }
        if (isAuthenticated && activeTab === 'codes') {
            fetchCodes();
        }
        return () => { if(interval) clearInterval(interval); };
    }, [isAuthenticated, activeTab, fetchWhitelistData, fetchCodes, fetchBingoConfig]);

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

    const handleResetDaily = async () => {
        setLoading(true);
        setUserActionStatus(null);
        try {
            const response = await fetch(`${DISCORD_API_URL}/api/admin/users/reset-daily`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ query: userQuery })
            });
            const data = await response.json();
            if (response.ok) {
                setUserActionStatus({ type: 'success', message: data.message });
            } else {
                setUserActionStatus({ type: 'error', message: data.error || "Failed" });
            }
        } catch (e) {
            setUserActionStatus({ type: 'error', message: "Network Error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBingoConfig = async () => {
        setLoading(true);
        setBingoStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bingo/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ cardId: bingoCardId, winCondition: bingoWinCondition })
            });
            if (response.ok) {
                setBingoStatus({ type: 'success', message: "Bingo config updated!" });
            } else {
                setBingoStatus({ type: 'error', message: "Failed to update config" });
            }
        } catch(e) {
            setBingoStatus({ type: 'error', message: "Network Error" });
        } finally {
            setLoading(false);
        }
    };

    // --- JSON MERGER HANDLER ---
    const handleJsonUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        let allSpawns: any[] = [];
        let processedCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const text = await file.text();
            try {
                const json = JSON.parse(text);
                if (json.spawns && Array.isArray(json.spawns)) {
                    allSpawns = allSpawns.concat(json.spawns);
                }
            } catch (err) {
                console.error(`Error parsing ${file.name}`);
            }
            processedCount++;
        }

        setMergerStats({ files: processedCount, spawns: allSpawns.length });

        // Generate Code
        const code = `
// This file contains the spawn configuration for Legendary Pokemon
// extracted from the Cobblemon/Myths and Legends config files.

const RAW_SPAWN_DATA = {
  "enabled": true,
  "neededInstalledMods": [],
  "neededUninstalledMods": [],
  "spawns": ${JSON.stringify(allSpawns, null, 2)}
};

// Helper to format technical names into readable text
// e.g. "minecraft:deep_cold_ocean" -> "Deep Cold Ocean"
// e.g. "myths_and_legends:blue_orb" -> "Blue Orb"
const formatName = (str: string): string => {
    if (!str) return "";
    
    // Remove namespace prefixes (minecraft:, mod_name:, #tag:)
    let clean = str.replace(/^.*:/, '');
    
    // Remove hash if it was a tag but didn't have a colon
    if (clean.startsWith('#')) clean = clean.substring(1);

    // Remove 'is_' prefix common in tags (e.g. is_ocean -> ocean)
    if (clean.startsWith('is_')) clean = clean.substring(3);

    // Replace underscores with spaces
    clean = clean.replace(/_/g, ' ');

    // Title Case
    return clean.replace(/\\b\\w/g, (char) => char.toUpperCase());
};

export const getSpawnInfo = (pokemonName: string): string | null => {
    const target = pokemonName.toLowerCase().trim();
    
    // 1. Filter entries for this pokemon
    const entries = RAW_SPAWN_DATA.spawns.filter(s => s.pokemon.toLowerCase() === target);
    
    if (entries.length === 0) return null;

    // 2. Aggregate Data (using Sets to remove duplicates)
    const biomes = new Set<string>();
    const keyItems = new Set<string>();

    entries.forEach(entry => {
        // Add Biomes
        if (entry.condition && entry.condition.biomes) {
            entry.condition.biomes.forEach(b => {
                biomes.add(formatName(b));
            });
        }
        
        // Add Key Item
        if (entry.condition && entry.condition.key_item) {
            // Handle if key_item is an array or string (json usually string, but being safe)
            const item = entry.condition.key_item;
            if (Array.isArray(item)) {
                item.forEach(i => keyItems.add(formatName(i)));
            } else if (typeof item === 'string') {
                keyItems.add(formatName(item));
            }
        }
    });

    // 3. Construct Output String
    const biomeList = Array.from(biomes).sort().join(', ');
    const itemList = Array.from(keyItems).join(' or ');

    let result = "";
    
    if (itemList) {
        result += \`Requires: \${itemList}. \`;
    }
    
    if (biomeList) {
        result += \`Biomes: \${biomeList}.\`;
    }

    return result.trim();
};
`;
        setMergedOutput(code.trim());
    };

    // --- GENERIC API CALL HANDLER ---
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
                    <button onClick={() => setActiveTab('users')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'users' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>👥</span> Users
                    </button>
                    <button onClick={() => setActiveTab('merger')} className={`flex-shrink-0 w-auto md:w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm md:text-base ${activeTab === 'merger' ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                        <span>🧩</span> JSON Merger
                    </button>
                </nav>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 p-6 md:p-10 overflow-y-auto min-h-screen">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* --- STATUS TOASTS --- */}
                    {[profileStatus, goalsStatus, wheelStatus, scheduleStatus, managerStatus, userActionStatus, bingoStatus].map((status, i) => status && (
                         <div key={i} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border border-white/10 ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white animate-in fade-in slide-in-from-right`}>
                            {status.message}
                        </div>
                    ))}

                    {/* ... (Existing tabs: nisathon_mgr, countdown, schedule, event, profile, gallery, minecraft, codes) ... */}
                    {activeTab === 'nisathon_mgr' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-gray-500 font-bold uppercase">Timer End</div>
                                    <div className="text-lg font-mono text-white">{stats.isPaused ? "PAUSED" : new Date(stats.timerEndTime).toLocaleTimeString()}</div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-gray-500 font-bold uppercase">Total NB</div>
                                    <div className="text-2xl font-black text-brand-primary">{Math.floor(stats.totalNisaballs)}</div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-gray-500 font-bold uppercase">Subs</div>
                                    <div className="text-xl font-bold text-white">{stats.currentSubs}</div>
                                </div>
                                <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-center">
                                    <div className="text-xs text-gray-500 font-bold uppercase">Status</div>
                                    <div className={`text-sm font-bold uppercase ${streamStatusOverride === 'live' ? 'text-green-500' : streamStatusOverride === 'offline' ? 'text-red-500' : 'text-gray-400'}`}>
                                        {streamStatusOverride}
                                    </div>
                                </div>
                            </div>

                            {/* Timer Controls */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">Timer Control</h3>
                                    <button 
                                        onClick={handleToggleDoubleTimer}
                                        className={`text-xs px-3 py-1 rounded-full font-bold border transition-colors ${stats.activeEvent === 'DOUBLE_TIMER' ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-transparent text-gray-500 border-gray-600'}`}
                                    >
                                        {stats.activeEvent === 'DOUBLE_TIMER' ? '🔥 2x Active' : 'Enable 2x Event'}
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="H" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center" value={timerH} onChange={e => setTimerH(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="M" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center" value={timerM} onChange={e => setTimerM(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="S" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center" value={timerS} onChange={e => setTimerS(parseInt(e.target.value)||0)} />
                                        </div>
                                        <button onClick={handleSetTimer} className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold">Set Absolute Time</button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="Minutes to Add/Sub" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-center" value={addM} onChange={e => setAddM(parseInt(e.target.value)||0)} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={handleAddTimer} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold">Add Time</button>
                                            <button onClick={handlePauseTimer} className={`flex-1 py-2 rounded-lg font-bold text-white ${stats.isPaused ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
                                                {stats.isPaused ? 'RESUME' : 'PAUSE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Event Trigger */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Simulate Event</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input type="text" placeholder="Username" className="bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={testUser} onChange={e => setTestUser(e.target.value)} />
                                    <select className="bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={testType} onChange={e => setTestType(e.target.value)}>
                                        <option value="sub">Sub (Tier 1)</option>
                                        <option value="gift">Gift Sub</option>
                                        <option value="bits">Bits</option>
                                        <option value="donation">Donation ($)</option>
                                    </select>
                                    <input type="number" placeholder="Amount" className="bg-black/40 border border-white/10 rounded-lg p-2 text-white" value={testAmount} onChange={e => setTestAmount(e.target.value)} />
                                    <button onClick={handleSimulateEvent} className="bg-brand-primary hover:bg-red-600 text-white font-bold rounded-lg px-4">Trigger</button>
                                </div>
                            </div>

                            {/* Stream Status Override */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Stream Status Override</h3>
                                <div className="flex gap-4">
                                    <button onClick={() => handleSetStreamStatus('auto')} className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${streamStatusOverride === 'auto' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}>AUTO (DecAPI)</button>
                                    <button onClick={() => handleSetStreamStatus('live')} className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${streamStatusOverride === 'live' ? 'bg-green-600 border-green-400 text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}>FORCE LIVE</button>
                                    <button onClick={() => handleSetStreamStatus('offline')} className={`flex-1 py-3 rounded-xl font-bold border transition-colors ${streamStatusOverride === 'offline' ? 'bg-red-600 border-red-400 text-white' : 'bg-black/40 border-white/10 text-gray-400'}`}>FORCE OFFLINE</button>
                                </div>
                            </div>

                            {/* Event Logs */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-white">Recent Event Log</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setFilterType('all')} className={`px-3 py-1 rounded text-xs font-bold ${filterType === 'all' ? 'bg-white text-black' : 'bg-white/10 text-gray-400'}`}>All</button>
                                        <button onClick={() => setFilterType('sub')} className={`px-3 py-1 rounded text-xs font-bold ${filterType === 'sub' ? 'bg-purple-500 text-white' : 'bg-white/10 text-gray-400'}`}>Subs</button>
                                        <button onClick={() => setFilterType('dono')} className={`px-3 py-1 rounded text-xs font-bold ${filterType === 'dono' ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>$</button>
                                    </div>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                    {filteredEvents.map(evt => (
                                        <div key={evt._id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 hover:bg-white/10">
                                            <div>
                                                <div className="text-sm font-bold text-white">{evt.user} <span className="text-gray-500 font-normal">({evt.type})</span></div>
                                                <div className="text-xs text-gray-400">{evt.amountDisplay} • {new Date(evt.createdAt).toLocaleTimeString()}</div>
                                            </div>
                                            
                                            {confirmDelete?.id === evt._id ? (
                                                <div className="flex gap-2 animate-in fade-in slide-in-from-right">
                                                    <button onClick={() => handleDeleteEvent(evt._id, true)} className="bg-red-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-red-700">Revert Stats & Delete</button>
                                                    <button onClick={() => handleDeleteEvent(evt._id, false)} className="bg-gray-600 text-white text-xs px-3 py-1 rounded font-bold hover:bg-gray-700">Delete Only</button>
                                                    <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-white px-2">✕</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirmDelete({ id: evt._id, revert: true })} className="text-red-500 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-2xl">
                                <h3 className="font-bold text-red-400 mb-4 uppercase tracking-widest text-xs">Danger Zone</h3>
                                <div className="flex flex-wrap gap-4">
                                    <button onClick={handleResetData} className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${confirmReset ? 'bg-red-600 w-full' : 'bg-red-900/40 hover:bg-red-900/60'}`}>
                                        {confirmReset ? "CONFIRM RESET ALL DATA?" : "Reset Nisathon Data"}
                                    </button>
                                    <button onClick={handleForceSync} className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${confirmSync ? 'bg-blue-600' : 'bg-blue-900/40 hover:bg-blue-900/60'}`}>
                                        {confirmSync ? "Confirm Force Sync?" : "Force Sync (StreamElements)"}
                                    </button>
                                    <button onClick={handleRebuild} className={`px-6 py-3 rounded-xl font-bold text-white transition-all ${confirmRebuild ? 'bg-orange-600' : 'bg-orange-900/40 hover:bg-orange-900/60'}`}>
                                        {confirmRebuild ? "Confirm Rebuild?" : "Rebuild from History"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'countdown' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Standalone Countdown</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-gray-400 text-xs uppercase font-bold">Set Time</label>
                                        <div className="flex gap-2">
                                            <input type="number" placeholder="H" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-center text-white" value={cdH} onChange={e => setCdH(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="M" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-center text-white" value={cdM} onChange={e => setCdM(parseInt(e.target.value)||0)} />
                                            <input type="number" placeholder="S" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-center text-white" value={cdS} onChange={e => setCdS(parseInt(e.target.value)||0)} />
                                        </div>
                                        <button onClick={handleCountdownSet} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold">Set Countdown</button>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-gray-400 text-xs uppercase font-bold">Quick Actions</label>
                                        <input type="number" placeholder="Minutes to Add" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-center text-white" value={cdAddM} onChange={e => setCdAddM(parseInt(e.target.value)||0)} />
                                        <div className="flex gap-2">
                                            <button onClick={handleCountdownAdd} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-bold">Add</button>
                                            <button onClick={handleCountdownPause} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-3 rounded-lg font-bold">Pause/Resume</button>
                                            <button onClick={handleCountdownReset} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold">Reset</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Schedule Manager</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <form onSubmit={handleUpdateSchedule} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-400 mb-2">Schedule Image URL</label>
                                        <input 
                                            type="text" 
                                            value={newScheduleUrl} 
                                            onChange={(e) => setNewScheduleUrl(e.target.value)} 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-brand-primary outline-none transition-colors"
                                            placeholder="https://..."
                                        />
                                        <LinkWarning url={newScheduleUrl} />
                                    </div>
                                    <ImageUploader onUploadSuccess={setNewScheduleUrl} />
                                    
                                    {newScheduleUrl && (
                                        <div className="rounded-xl overflow-hidden border border-white/10">
                                            <img src={processImageUrl(newScheduleUrl)} alt="Preview" className="w-full h-auto" />
                                        </div>
                                    )}
                                    <button type="submit" disabled={loading} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all">
                                        Save Changes
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'event' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Goals */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black text-white">Goals Roadmap</h2>
                                    <button onClick={handleSaveGoals} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Goals</button>
                                </div>
                                <div className="space-y-4">
                                    {localGoals.map((goal, i) => (
                                        <div key={i} className="flex gap-4 items-start bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="w-24 shrink-0">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">NB Count</label>
                                                <input type="number" value={goal.count} onChange={(e) => updateGoal(i, 'count', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-center font-mono" />
                                            </div>
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Reward Description</label>
                                                <input type="text" value={goal.reward} onChange={(e) => updateGoal(i, 'reward', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                            </div>
                                            <div className="w-20 shrink-0 flex flex-col items-center">
                                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-2">Secret?</label>
                                                <input type="checkbox" checked={goal.secret} onChange={(e) => updateGoal(i, 'secret', e.target.checked)} className="w-5 h-5 accent-brand-primary" />
                                            </div>
                                            <button onClick={() => removeGoal(i)} className="text-red-500 hover:text-red-400 mt-6 px-2">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={addGoal} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">+ Add Goal</button>
                                </div>
                            </div>

                            {/* Wheel */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black text-white">Wheel Items</h2>
                                    <button onClick={handleSaveWheel} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Wheel</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {localWheel.map((item, i) => (
                                        <div key={i} className="flex gap-3 items-center bg-black/30 p-3 rounded-xl border border-white/5">
                                            <div className="flex-1">
                                                <input type="text" value={item.label} onChange={(e) => updateWheelItem(i, 'label', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm" placeholder="Label" />
                                            </div>
                                            <div className="w-20">
                                                <input type="number" value={item.weight} onChange={(e) => updateWheelItem(i, 'weight', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm text-center" placeholder="Weight" />
                                            </div>
                                            <span className="text-xs text-gray-500 font-mono w-12 text-right">{((item.weight / totalWheelWeight) * 100).toFixed(1)}%</span>
                                            <button onClick={() => removeWheelItem(i)} className="text-red-500 hover:text-red-400 px-2">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={addWheelItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                                        <span>+ Add Item</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* About Me */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black text-white">About Me</h2>
                                    <button onClick={() => handleSaveProfile('about')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save About</button>
                                </div>
                                <div className="space-y-6">
                                    {localAbout.map((item, i) => (
                                        <div key={item.id} className="bg-black/30 p-6 rounded-2xl border border-white/10">
                                            <div className="flex justify-between mb-4">
                                                <input 
                                                    type="text" 
                                                    value={item.title} 
                                                    onChange={(e) => updateAboutItem(i, 'title', e.target.value)} 
                                                    className="bg-transparent border-b border-white/10 text-xl font-bold text-white focus:border-brand-primary outline-none w-1/2" 
                                                    placeholder="Section Title"
                                                />
                                                <button onClick={() => removeAboutItem(i)} className="text-red-500 hover:text-red-400 text-sm">Remove Section</button>
                                            </div>
                                            <RichTextEditor value={item.text} onChange={(val) => updateAboutItem(i, 'text', val)} />
                                        </div>
                                    ))}
                                    <button onClick={addAboutItem} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">+ Add Section</button>
                                </div>
                            </div>

                            {/* Credits */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black text-white">Credits</h2>
                                    <button onClick={() => handleSaveProfile('credits')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Credits</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {localCredits.map((credit, i) => (
                                        <div key={credit.id} className="bg-black/30 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-start">
                                            <div className="flex-1 space-y-2 w-full">
                                                <input type="text" value={credit.name} onChange={(e) => updateCreditItem(i, 'name', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" placeholder="Name" />
                                                <input type="text" value={credit.role} onChange={(e) => updateCreditItem(i, 'role', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" placeholder="Role" />
                                                <input type="text" value={credit.link} onChange={(e) => updateCreditItem(i, 'link', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-gray-400 text-sm" placeholder="Link (Optional)" />
                                            </div>
                                            <div className="flex-1 space-y-2 w-full">
                                                <input type="text" value={credit.image} onChange={(e) => updateCreditItem(i, 'image', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-gray-400 text-sm" placeholder="Image URL (Optional)" />
                                                <LinkWarning url={credit.image || ''} />
                                                <div className="flex gap-2">
                                                    <input type="text" value={credit.initial} onChange={(e) => updateCreditItem(i, 'initial', e.target.value)} className="w-16 bg-black/40 border border-white/10 rounded p-2 text-center text-white" placeholder="Init" maxLength={1} />
                                                    <input type="color" value={credit.color} onChange={(e) => updateCreditItem(i, 'color', e.target.value)} className="h-10 w-full bg-transparent cursor-pointer" />
                                                </div>
                                            </div>
                                            <button onClick={() => removeCreditItem(i)} className="text-red-500 hover:text-red-400 self-center px-2">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={addCreditItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">+ Add Credit</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black text-white">Art Gallery</h2>
                                <button onClick={() => handleSaveProfile('artworks')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Gallery</button>
                            </div>
                            
                            <div className="space-y-8">
                                {localArtworks.map((artist, ai) => (
                                    <div key={artist.id} className="bg-black/30 p-6 rounded-2xl border border-white/10">
                                        <div className="flex gap-4 mb-6">
                                            <input type="text" value={artist.artistName} onChange={(e) => updateArtistName(ai, e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white font-bold" placeholder="Artist Name" />
                                            <input type="text" value={artist.artistLink} onChange={(e) => updateArtistLink(ai, e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-gray-300" placeholder="Social Link" />
                                            <button onClick={() => removeArtist(ai)} className="bg-red-900/30 text-red-400 px-4 rounded-lg font-bold hover:bg-red-900/50">Delete Artist</button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {artist.images.map((img, ii) => (
                                                <div key={ii} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                                    <img src={img} alt="Art" className="w-full h-full object-cover" />
                                                    <button onClick={() => removeImageFromArtist(ai, ii)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">✕</button>
                                                </div>
                                            ))}
                                            <div className="aspect-square rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-colors p-2">
                                                <div className="text-xs mb-2">Add URL</div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Paste Link" 
                                                    className="w-full bg-black/50 border border-white/10 rounded p-1 text-xs text-center mb-2"
                                                    onKeyDown={(e) => { if(e.key === 'Enter') { addImageToArtist(ai, e.currentTarget.value); e.currentTarget.value = ''; } }}
                                                />
                                                <div className="text-xs">or upload</div>
                                                <ImageUploader onUploadSuccess={(url) => addImageToArtist(ai, url)} className="mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={addArtist} className="w-full py-4 border border-dashed border-white/20 rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-lg font-bold">+ Add New Artist Collection</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'minecraft' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Minecraft Manager</h2>
                            
                            {/* Bingo Configuration (NEW) */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Bingo Configuration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Active Card ID</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white font-mono"
                                            value={bingoCardId}
                                            onChange={e => setBingoCardId(e.target.value.toUpperCase())}
                                            placeholder="WEEK1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase">Winning Condition</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white"
                                            value={bingoWinCondition}
                                            onChange={e => setBingoWinCondition(e.target.value)}
                                            placeholder="e.g. 2x Bingo, Blackout, 3 Lines"
                                        />
                                    </div>
                                    <button 
                                        onClick={handleSaveBingoConfig}
                                        disabled={loading}
                                        className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all"
                                    >
                                        Update Bingo Settings
                                    </button>
                                </div>
                            </div>

                            {/* Pending Applications */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Pending Whitelist ({whitelistApps.length})</h3>
                                <div className="space-y-2">
                                    {whitelistApps.length === 0 ? (
                                        <p className="text-gray-500 italic">No pending applications.</p>
                                    ) : (
                                        whitelistApps.map(app => (
                                            <div key={app._id} className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <img src={app.discordAvatar} className="w-10 h-10 rounded-full bg-black" alt="" />
                                                    <div>
                                                        <div className="font-bold text-white">{app.discordUsername}</div>
                                                        <div className="text-sm text-green-400 font-mono">{app.minecraftUsername}</div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveApp(app._id)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Approve</button>
                                                    <button onClick={() => handleRejectApp(app._id)} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">Reject</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Approved List */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Approved Users ({approvedApps.length})</h3>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-2">
                                    {approvedApps.map(app => (
                                        <div key={app._id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-bold text-white">{app.discordUsername}</div>
                                                <div className="text-xs text-gray-500">→</div>
                                                <div className="text-sm font-mono text-gray-300">{app.minecraftUsername}</div>
                                            </div>
                                            <button onClick={() => handleRevokeApp(app._id, app.minecraftUsername)} className="text-red-500 hover:text-red-400 text-xs font-bold px-2 py-1 bg-red-900/10 rounded hover:bg-red-900/30">Revoke</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

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

                    {/* --- USERS TAB --- */}
                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">User Management</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Reset Daily Check-In</h3>
                                <p className="text-gray-400 text-sm mb-4">Reset the daily timer for a user so they can check in again immediately.</p>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Discord ID or Minecraft Username" 
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white" 
                                        value={userQuery} 
                                        onChange={e => setUserQuery(e.target.value)} 
                                    />
                                    <button 
                                        onClick={handleResetDaily} 
                                        disabled={loading}
                                        className="bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {loading ? 'Processing...' : 'Reset Timer'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- JSON MERGER TAB --- */}
                    {activeTab === 'merger' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Config Merger Tool</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Combine JSON Files</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    Select your 81+ individual Pokemon JSON files. This tool will merge them all into the format needed for <code>data/legendaryConfig.ts</code>.
                                </p>
                                
                                <div className="flex flex-col gap-6">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/5 hover:border-brand-primary/50 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                            <p className="mb-2 text-sm text-gray-400"><span className="font-bold text-white">Click to upload</span> multiple JSON files</p>
                                        </div>
                                        <input type="file" className="hidden" multiple accept=".json" onChange={handleJsonUpload} />
                                    </label>

                                    {mergerStats.files > 0 && (
                                        <div className="flex gap-4 text-sm font-mono text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                                            <span>Files: <strong className="text-white">{mergerStats.files}</strong></span>
                                            <span>Spawns Found: <strong className="text-brand-primary">{mergerStats.spawns}</strong></span>
                                        </div>
                                    )}

                                    {mergedOutput && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold uppercase text-gray-500">Generated Code</label>
                                                <button 
                                                    onClick={() => navigator.clipboard.writeText(mergedOutput)}
                                                    className="text-xs bg-brand-primary px-3 py-1 rounded font-bold text-white hover:bg-red-600 transition-colors"
                                                >
                                                    Copy to Clipboard
                                                </button>
                                            </div>
                                            <textarea 
                                                readOnly 
                                                value={mergedOutput} 
                                                className="w-full h-96 bg-[#1e1e1e] text-gray-300 font-mono text-xs p-4 rounded-xl border border-white/10 focus:outline-none resize-none"
                                            />
                                        </div>
                                    )}
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
