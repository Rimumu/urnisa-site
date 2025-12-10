
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
    const [timeLeftString, setTimeLeftString] = useState("00:00:00");
    const [timeBump, setTimeBump] = useState(false);

    // --- NEW STATE FOR EVENT LOGS ---
    const [recentEvents, setRecentEvents] = useState<ContributorEvent[]>([]);
    const [confirmDelete, setConfirmDelete] = useState<{id: string, revert: boolean} | null>(null);
    const [filterType, setFilterType] = useState<string>('all'); // New Filter State
    const [filterUser, setFilterUser] = useState<string>(''); // New User Filter

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
    
    // --- USER MERGE STATE ---
    const [mergeSource, setMergeSource] = useState('');
    const [mergeTarget, setMergeTarget] = useState('');

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

    // Timer Animation Logic
    const timerRef = useRef<number>(0);
    const prevTimeRef = useRef<number>(0);

    useEffect(() => {
        const updateTimer = () => {
            let ms = 0;
            if (stats.isPaused) {
                ms = stats.remainingTimeMs || 0;
            } else {
                const now = Date.now();
                const end = new Date(stats.timerEndTime).getTime();
                ms = Math.max(0, end - now);
            }

            // Detect Added Time Bump
            if (ms > prevTimeRef.current + 1000 && prevTimeRef.current > 0) {
                setTimeBump(true);
                setTimeout(() => setTimeBump(false), 300);
            }
            prevTimeRef.current = ms;

            const hours = Math.floor((ms / (1000 * 60 * 60)));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((ms % (1000 * 60)) / 1000);

            const hStr = hours >= 100 ? hours.toString() : (hours < 10 ? "0" + hours : hours);
            const mStr = minutes < 10 ? "0" + minutes : minutes;
            const sStr = seconds < 10 ? "0" + seconds : seconds;

            setTimeLeftString(`${hStr}:${mStr}:${sStr}`);
            
            if (!stats.isPaused) {
                timerRef.current = requestAnimationFrame(updateTimer);
            }
        };

        if (stats.isPaused) {
            updateTimer(); // Update once for paused state
        } else {
            timerRef.current = requestAnimationFrame(updateTimer);
        }

        return () => cancelAnimationFrame(timerRef.current);
    }, [stats.timerEndTime, stats.isPaused, stats.remainingTimeMs]);


    // Fetch Logs when on manager tab - Increased Limit
    const fetchEventLog = async () => {
        try {
            // Fetch 500 most recent events from backend
            const res = await fetch(`${API_BASE_URL}/api/nisathon/recent?limit=500`);
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
    
    const handleMergeUsers = async () => {
        if (!mergeSource || !mergeTarget) return;
        const confirmMsg = mergeSource.trim().toLowerCase() === mergeTarget.trim().toLowerCase() 
            ? `Confirm cleaning up all name variations into "${mergeTarget}"? This will sum their totals.`
            : `Are you sure you want to merge ALL data from "${mergeSource}" into "${mergeTarget}"? This will combine their event totals.`;

        if (!window.confirm(confirmMsg)) return;

        setLoading(true);
        setUserActionStatus(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/nisathon/merge-users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ sourceUser: mergeSource, targetUser: mergeTarget })
            });
            const data = await response.json();
            if (response.ok) {
                setUserActionStatus({ type: 'success', message: data.message });
                setMergeSource('');
                setMergeTarget('');
                // FORCE REFRESH DATA
                fetchEventLog();
                refetchStats();
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
    const handleRemoveTimer = () => apiCall('nisathon/timer/add', { minutes: -Math.abs(addM) });
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
        // Filter By Type
        const typeMatch = (filterType === 'all') 
            || (filterType === 'sub' && (evt.type === 'sub' || evt.type === 'subscriber'))
            || (filterType === 'gift' && evt.type === 'gift')
            || (filterType === 'bits' && (evt.type === 'bits' || evt.type === 'cheer'))
            || (filterType === 'dono' && (evt.type === 'donation' || evt.type === 'tip'))
            || (filterType === 'follow' && (evt.type === 'follower' || evt.type === 'follow'));

        // Filter By User
        const userMatch = filterUser.trim() === '' || evt.user.toLowerCase().includes(filterUser.toLowerCase().trim());

        return typeMatch && userMatch;
    });

    const isDoubleTimer = stats.activeEvent === 'DOUBLE_TIMER';
    const latestActivity = recentEvents.length > 0 ? recentEvents[0] : null;

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
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* --- STATUS TOASTS --- */}
                    {[profileStatus, goalsStatus, wheelStatus, scheduleStatus, managerStatus, userActionStatus, bingoStatus].map((status, i) => status && (
                         <div key={i} className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl border border-white/10 ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white animate-in fade-in slide-in-from-right`}>
                            {status.message}
                        </div>
                    ))}

                    {/* ... (Existing tabs: nisathon_mgr, countdown, schedule, event, profile, gallery, minecraft, codes) ... */}
                    {activeTab === 'nisathon_mgr' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* LIVE HEADER STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Live Timer */}
                                <div className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 ${isDoubleTimer ? 'bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'bg-black/40 border-white/10'}`}>
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 flex justify-between items-center">
                                        Time Remaining
                                        {stats.isPaused && <span className="bg-amber-500 text-black px-2 rounded text-[10px] animate-pulse">PAUSED</span>}
                                        {isDoubleTimer && <span className="text-yellow-400 animate-pulse">🔥 2x</span>}
                                    </div>
                                    <div className={`text-3xl font-black font-mono tracking-tight ${timeBump ? 'text-green-400 scale-105' : 'text-white'} transition-all duration-300`}>
                                        {timeLeftString}
                                    </div>
                                    {timeBump && <div className="absolute right-4 bottom-4 text-green-500 font-bold text-xs animate-ping">+ TIME</div>}
                                </div>

                                {/* Total Nisaballs */}
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Nisaballs</div>
                                    <div className="text-3xl font-black text-brand-primary">{Math.floor(stats.totalNisaballs)}</div>
                                    <div className="absolute -right-4 -bottom-4 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">🏐</div>
                                </div>

                                {/* Recent Activity (Replaced Subs Counter) */}
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Recent Activity</div>
                                    {latestActivity ? (
                                        <div>
                                            <div className="font-bold text-white text-lg truncate">{latestActivity.user}</div>
                                            <div className="text-xs font-mono text-green-400">{latestActivity.amountDisplay}</div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">Waiting for events...</div>
                                    )}
                                </div>

                                {/* Stream Status */}
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
                                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Stream Status</div>
                                    <div className={`text-xl font-black uppercase tracking-wide ${streamStatusOverride === 'live' ? 'text-green-500' : streamStatusOverride === 'offline' ? 'text-red-500' : 'text-blue-400'}`}>
                                        {streamStatusOverride}
                                    </div>
                                </div>
                            </div>

                            {/* Timer Controls & Event Trigger */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-white text-lg">Timer Management</h3>
                                        <button 
                                            onClick={handleToggleDoubleTimer}
                                            className={`text-xs px-4 py-2 rounded-full font-bold border transition-all ${stats.activeEvent === 'DOUBLE_TIMER' ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'}`}
                                        >
                                            {stats.activeEvent === 'DOUBLE_TIMER' ? '🔥 2x Active' : 'Enable 2x Event'}
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-xs text-gray-500 font-bold uppercase">Set Absolute Time</label>
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="H" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white text-lg font-mono" value={timerH} onChange={e => setTimerH(parseInt(e.target.value)||0)} />
                                                <input type="number" placeholder="M" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white text-lg font-mono" value={timerM} onChange={e => setTimerM(parseInt(e.target.value)||0)} />
                                                <input type="number" placeholder="S" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white text-lg font-mono" value={timerS} onChange={e => setTimerS(parseInt(e.target.value)||0)} />
                                            </div>
                                            <button onClick={handleSetTimer} className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors">Set Time</button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <label className="text-xs text-gray-500 font-bold uppercase">Quick Adjust</label>
                                            <div className="flex gap-2">
                                                <input type="number" placeholder="Minutes" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-center text-white text-lg font-mono" value={addM} onChange={e => setAddM(parseInt(e.target.value)||0)} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <button onClick={handleAddTimer} className="bg-green-600/80 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors">+</button>
                                                <button onClick={handleRemoveTimer} className="bg-red-600/80 hover:bg-red-600 text-white py-3 rounded-xl font-bold transition-colors">-</button>
                                                <button onClick={handlePauseTimer} className={`py-3 rounded-xl font-bold text-white transition-colors ${stats.isPaused ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-600 hover:bg-yellow-500'}`}>
                                                    {stats.isPaused ? 'RESUME' : 'PAUSE'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-white mb-4">Manual Event Trigger</h3>
                                        <div className="space-y-3">
                                            <input type="text" placeholder="Username" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white" value={testUser} onChange={e => setTestUser(e.target.value)} />
                                            <div className="flex gap-2">
                                                <select className="bg-black/40 border border-white/10 rounded-xl p-3 text-white flex-1" value={testType} onChange={e => setTestType(e.target.value)}>
                                                    <option value="sub">Sub</option>
                                                    <option value="gift">Gift</option>
                                                    <option value="bits">Bits</option>
                                                    <option value="donation">Dono</option>
                                                </select>
                                                <input type="number" placeholder="Amt" className="bg-black/40 border border-white/10 rounded-xl p-3 text-white w-20 text-center" value={testAmount} onChange={e => setTestAmount(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={handleSimulateEvent} className="w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Trigger Event</button>
                                </div>
                            </div>

                            {/* Stream Status Override */}
                            <div className="bg-black/30 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between gap-4">
                                <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider ml-2">Stream Status Override</h3>
                                <div className="flex gap-2 bg-black/40 p-1 rounded-xl">
                                    <button onClick={() => handleSetStreamStatus('auto')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${streamStatusOverride === 'auto' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>AUTO</button>
                                    <button onClick={() => handleSetStreamStatus('live')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${streamStatusOverride === 'live' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>LIVE</button>
                                    <button onClick={() => handleSetStreamStatus('offline')} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${streamStatusOverride === 'offline' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>OFFLINE</button>
                                </div>
                            </div>

                            {/* REVAMPED EVENT LOGS */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl h-[600px] flex flex-col">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                                        <span>📜</span> Event Log ({filteredEvents.length})
                                    </h3>
                                    
                                    <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                                        <div className="relative flex-1 md:w-64">
                                            <input 
                                                type="text" 
                                                placeholder="Search username..." 
                                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-10 py-2 text-sm text-white focus:border-brand-primary outline-none"
                                                value={filterUser}
                                                onChange={(e) => setFilterUser(e.target.value)}
                                            />
                                            {filterUser && (
                                                <button onClick={() => setFilterUser('')} className="absolute right-3 top-2 text-gray-500 hover:text-white">✕</button>
                                            )}
                                        </div>
                                        <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                                            {['all', 'sub', 'gift', 'bits', 'dono', 'follow'].map(f => (
                                                <button 
                                                    key={f}
                                                    onClick={() => setFilterType(f)} 
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${filterType === f ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                                >
                                                    {f === 'dono' ? '$' : f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {filteredEvents.map(evt => (
                                        <div key={evt._id} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0 ${
                                                evt.type === 'sub' || evt.type === 'subscriber' ? 'bg-purple-500/20 text-purple-400' :
                                                evt.type === 'gift' ? 'bg-pink-500/20 text-pink-400' :
                                                evt.type === 'bits' || evt.type === 'cheer' ? 'bg-cyan-500/20 text-cyan-400' :
                                                evt.type === 'donation' || evt.type === 'tip' ? 'bg-green-500/20 text-green-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {evt.type === 'gift' ? '🎁' : evt.type.includes('sub') ? '⭐' : evt.type.includes('bit') ? '💎' : evt.type.includes('don') || evt.type.includes('tip') ? '💸' : '👤'}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                <div className="truncate">
                                                    <div className="font-bold text-white text-sm">{evt.user}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-bold">{evt.type}</div>
                                                </div>
                                                <div className="text-sm font-mono text-gray-300 truncate">
                                                    {evt.amountDisplay}
                                                </div>
                                                <div className="text-xs text-gray-500 text-right md:text-left">
                                                    {new Date(evt.createdAt).toLocaleString()}
                                                </div>
                                            </div>

                                            {confirmDelete?.id === evt._id ? (
                                                <div className="flex gap-2 animate-in fade-in slide-in-from-right shrink-0">
                                                    <button onClick={() => handleDeleteEvent(evt._id, true)} className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-red-700">Revert & Delete</button>
                                                    <button onClick={() => handleDeleteEvent(evt._id, false)} className="bg-gray-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700">Del Only</button>
                                                    <button onClick={() => setConfirmDelete(null)} className="text-gray-400 hover:text-white px-2">✕</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setConfirmDelete({ id: evt._id, revert: true })} className="text-gray-600 hover:text-red-500 px-2 py-1 transition-colors opacity-0 group-hover:opacity-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {filteredEvents.length === 0 && (
                                        <div className="text-center py-20 text-gray-500">No events found matching filters.</div>
                                    )}
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
                                    <button onClick={addGoal} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-brand-primary/50 transition-colors flex items-center justify-center gap-2">
                                        <span>+</span> Add Goal
                                    </button>
                                </div>
                            </div>

                            {/* Wheel Settings */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-white">Wheel Items</h3>
                                    <button onClick={handleSaveWheel} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Wheel</button>
                                </div>
                                <div className="space-y-4">
                                    {localWheel.map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Label</label>
                                                <input type="text" value={item.label} onChange={(e) => updateWheelItem(i, 'label', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white" />
                                            </div>
                                            <div className="w-24 shrink-0">
                                                <label className="text-[10px] uppercase font-bold text-gray-500">Weight</label>
                                                <input type="number" value={item.weight} onChange={(e) => updateWheelItem(i, 'weight', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-center font-mono" />
                                            </div>
                                            <button onClick={() => removeWheelItem(i)} className="text-red-500 hover:text-red-400 mt-6 px-2">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={addWheelItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-brand-primary/50 transition-colors flex items-center justify-center gap-2">
                                        <span>+</span> Add Item
                                    </button>
                                    <div className="text-right text-xs text-gray-500">Total Weight: {totalWheelWeight}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* About Section */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-white">About Section</h2>
                                    <button onClick={() => handleSaveProfile('about')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save About</button>
                                </div>
                                <div className="space-y-8">
                                    {localAbout.map((item, i) => (
                                        <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex justify-between mb-2">
                                                <input type="text" value={item.title} onChange={(e) => updateAboutItem(i, 'title', e.target.value)} className="bg-transparent font-bold text-lg text-white border-b border-transparent focus:border-brand-primary outline-none" placeholder="Section Title" />
                                                <button onClick={() => removeAboutItem(i)} className="text-red-500 hover:text-red-300">✕</button>
                                            </div>
                                            <RichTextEditor value={item.text} onChange={(val) => updateAboutItem(i, 'text', val)} />
                                        </div>
                                    ))}
                                    <button onClick={addAboutItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-brand-primary/50 transition-colors">
                                        + Add Section
                                    </button>
                                </div>
                            </div>

                            {/* Credits Section */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-white">Credits</h2>
                                    <button onClick={() => handleSaveProfile('credits')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Credits</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {localCredits.map((credit, i) => (
                                        <div key={credit.id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 shrink-0 bg-black/40 rounded-full overflow-hidden border border-white/10">
                                                    {credit.image ? <img src={credit.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{backgroundColor: credit.color}}>{credit.initial}</div>}
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-2">
                                                    <input type="text" value={credit.name} onChange={(e) => updateCreditItem(i, 'name', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" placeholder="Name" />
                                                    <input type="text" value={credit.role} onChange={(e) => updateCreditItem(i, 'role', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm" placeholder="Role" />
                                                    <input type="text" value={credit.link} onChange={(e) => updateCreditItem(i, 'link', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm col-span-2" placeholder="Link (Optional)" />
                                                    <input type="text" value={credit.image || ''} onChange={(e) => updateCreditItem(i, 'image', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm col-span-2" placeholder="Image URL" />
                                                </div>
                                                <button onClick={() => removeCreditItem(i)} className="text-red-500 hover:text-red-300 self-start">✕</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addCreditItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-brand-primary/50 transition-colors">
                                        + Add Credit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-black text-white">Art Gallery</h2>
                                    <button onClick={() => handleSaveProfile('artworks')} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">Save Gallery</button>
                                </div>
                                <div className="space-y-8">
                                    {localArtworks.map((artist, i) => (
                                        <div key={artist.id} className="bg-white/5 p-6 rounded-xl border border-white/5">
                                            <div className="flex gap-4 mb-4">
                                                <div className="flex-1 space-y-2">
                                                    <input type="text" value={artist.artistName} onChange={(e) => updateArtistName(i, e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white font-bold" placeholder="Artist Name" />
                                                    <input type="text" value={artist.artistLink || ''} onChange={(e) => updateArtistLink(i, e.target.value)} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm" placeholder="Artist Social Link" />
                                                </div>
                                                <button onClick={() => removeArtist(i)} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 p-2 rounded-lg h-fit">Delete Artist</button>
                                            </div>
                                            
                                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-4">
                                                {artist.images.map((img, imgIdx) => (
                                                    <div key={imgIdx} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button onClick={() => removeImageFromArtist(i, imgIdx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                <input type="text" placeholder="Add Image URL" className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm" onKeyDown={(e) => { if(e.key === 'Enter') { addImageToArtist(i, e.currentTarget.value); e.currentTarget.value = ''; }}} />
                                                <ImageUploader onUploadSuccess={(url) => addImageToArtist(i, url)} className="shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={addArtist} className="w-full py-4 border border-dashed border-white/20 rounded-xl text-brand-primary font-bold hover:bg-brand-primary/10 transition-colors">
                                        + Add New Artist Collection
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'minecraft' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Whitelist Management */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Pending Applications */}
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col h-[500px]">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                                        Pending Applications
                                    </h3>
                                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        {whitelistApps.length === 0 ? <div className="text-gray-500 italic text-sm text-center py-10">No pending applications</div> : whitelistApps.map(app => (
                                            <div key={app._id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                {/* Avatars */}
                                                <div className="relative shrink-0">
                                                    <img 
                                                        src={app.discordAvatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                                        className="w-12 h-12 rounded-full border-2 border-black bg-gray-800" 
                                                        alt="Discord"
                                                    />
                                                    <img 
                                                        src={`https://mc-heads.net/avatar/${app.minecraftUsername}/50`} 
                                                        className="w-8 h-8 absolute -bottom-1 -right-1 rounded-md border-2 border-black bg-gray-800"
                                                        alt="MC"
                                                    />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="flex justify-between items-baseline">
                                                        <div className="text-sm font-bold text-white truncate">{app.discordUsername}</div>
                                                        <div className="text-[10px] text-gray-500 font-mono">
                                                            {new Date(app.appliedAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="text-xs font-mono text-brand-primary truncate mt-0.5">
                                                        MC: <span className="text-green-400">{app.minecraftUsername}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-600 mt-1">
                                                        Applied: {new Date(app.appliedAt).toLocaleTimeString()}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                                    <button onClick={() => handleApproveApp(app._id)} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors">Approve</button>
                                                    <button onClick={() => handleRejectApp(app._id)} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors">Reject</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Approved List */}
                                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col h-[500px]">
                                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                        Approved History
                                    </h3>
                                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                        {approvedApps.map(app => (
                                            <div key={app._id} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                {/* Avatars */}
                                                <div className="relative shrink-0">
                                                    <img 
                                                        src={app.discordAvatar || "https://cdn.discordapp.com/embed/avatars/0.png"} 
                                                        className="w-12 h-12 rounded-full border-2 border-black bg-gray-800 grayscale opacity-70" 
                                                        alt="Discord"
                                                    />
                                                    <img 
                                                        src={`https://mc-heads.net/avatar/${app.minecraftUsername}/50`} 
                                                        className="w-8 h-8 absolute -bottom-1 -right-1 rounded-md border-2 border-black bg-gray-800 grayscale"
                                                        alt="MC"
                                                    />
                                                    <div className="absolute top-0 left-0 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center border border-black">
                                                        <span className="text-[8px] text-black font-bold">✓</span>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0 w-full">
                                                    <div className="text-sm font-bold text-white truncate opacity-80">{app.discordUsername}</div>
                                                    <div className="text-xs font-mono text-gray-400 truncate mt-0.5">
                                                        MC: {app.minecraftUsername}
                                                    </div>
                                                    <div className="text-[10px] text-green-500/70 mt-1 font-bold">
                                                        Approved: {app.approvedAt ? new Date(app.approvedAt).toLocaleString() : 'Unknown'}
                                                    </div>
                                                </div>

                                                <button onClick={() => handleRevokeApp(app._id, app.minecraftUsername)} className="text-red-500 hover:text-white text-xs font-bold px-3 py-1.5 bg-red-900/10 rounded hover:bg-red-600 transition-colors shrink-0 self-start sm:self-center">
                                                    Revoke
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Bingo Config */}
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Bingo Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Active Seed ID</label>
                                        <input type="text" value={bingoCardId} onChange={e => setBingoCardId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white font-mono" placeholder="WEEK1" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Win Condition</label>
                                        <input type="text" value={bingoWinCondition} onChange={e => setBingoWinCondition(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" placeholder="1 Line / Blackout" />
                                    </div>
                                    <button onClick={handleSaveBingoConfig} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all h-[42px]">
                                        Update Config
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'codes' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">Gacha Code Generator</h2>
                            
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
                                    <div className="lg:col-span-1">
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Type</label>
                                        <select value={genType} onChange={e => setGenType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white">
                                            <option value="lamb">Lamb Chop</option>
                                            <option value="wagyu">Wagyu A5</option>
                                        </select>
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Packs per Code</label>
                                        <input type="number" value={genPackAmount} onChange={e => setGenPackAmount(parseInt(e.target.value)||1)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" min="1" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Qty of Codes</label>
                                        <input type="number" value={genAmount} onChange={e => setGenAmount(parseInt(e.target.value)||1)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" min="1" max="50" />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Usage Type</label>
                                        <select value={genUsageType} onChange={e => setGenUsageType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm">
                                            <option value="once_global">One Use (Global)</option>
                                            <option value="once_per_user">Once Per User (Global)</option>
                                            <option value="time_limited">Time Limited (Unlimited)</option>
                                        </select>
                                    </div>
                                    {genUsageType === 'time_limited' && (
                                        <div className="lg:col-span-1">
                                            <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Hours Valid</label>
                                            <input type="number" value={genHours} onChange={e => setGenHours(parseInt(e.target.value)||1)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white" min="1" />
                                        </div>
                                    )}
                                    <button onClick={handleGenerateCodes} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all h-[40px] lg:col-span-1">
                                        Generate
                                    </button>
                                </div>

                                {generatedCodes.length > 0 && (
                                    <div className="mt-6 bg-green-900/20 p-4 rounded-xl border border-green-500/30">
                                        <h4 className="text-green-400 font-bold mb-2">New Codes:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedCodes.map(c => (
                                                <code key={c} className="bg-black/40 px-3 py-1 rounded text-white font-mono border border-white/10">{c}</code>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Existing Codes (Recent 100)</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-300">
                                        <thead className="text-xs text-gray-500 uppercase bg-black/20">
                                            <tr>
                                                <th className="px-4 py-3">Code</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3">Pack Qty</th>
                                                <th className="px-4 py-3">Usage</th>
                                                <th className="px-4 py-3">Redeemed</th>
                                                <th className="px-4 py-3">Expires</th>
                                                <th className="px-4 py-3">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {existingCodes.map(c => (
                                                <tr key={c._id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="px-4 py-3 font-mono font-bold text-white">{c.code}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${c.type === 'lamb' ? 'bg-purple-900 text-purple-200' : 'bg-pink-900 text-pink-200'}`}>
                                                            {c.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">{c.packAmount}</td>
                                                    <td className="px-4 py-3 text-xs">{c.usageType}</td>
                                                    <td className="px-4 py-3">{c.usageCount}</td>
                                                    <td className="px-4 py-3 text-xs text-gray-500">
                                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => handleDeleteCode(c._id)} className="text-red-500 hover:text-white hover:bg-red-600 px-2 py-1 rounded transition-colors text-xs font-bold">Del</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">User Management</h2>
                            
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">Reset Daily Check-In</h3>
                                <div className="flex gap-4">
                                    <input 
                                        type="text" 
                                        placeholder="Discord ID or Minecraft Username" 
                                        value={userQuery} 
                                        onChange={e => setUserQuery(e.target.value)} 
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white" 
                                    />
                                    <button onClick={handleResetDaily} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition-all">
                                        Reset Timer
                                    </button>
                                </div>
                                <p className="text-gray-500 text-xs mt-2">Allows the user to claim their daily reward again immediately.</p>
                            </div>

                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <h3 className="font-bold text-white mb-4">User Merge Tool</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Source User (To be removed/merged)</label>
                                        <input type="text" value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" placeholder="Username (Exact)" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase block mb-1">Target User (Receiver)</label>
                                        <input type="text" value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white" placeholder="Username (Exact)" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={handleMergeUsers} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-lg transition-all">
                                        Merge Data
                                    </button>
                                </div>
                                <p className="text-orange-400 text-xs mt-2 font-bold">⚠️ Warning: This transfers all event history, wheel spins, and totals. Cannot be undone easily.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'merger' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-3xl font-black text-white">JSON Merger Tool</h2>
                            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                                <p className="text-gray-400 mb-4">Upload multiple JSON spawn config files to merge them into a single `rawSpawnData.ts` format.</p>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept=".json" 
                                    onChange={handleJsonUpload} 
                                    className="block w-full text-sm text-gray-400
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-brand-primary file:text-white
                                    hover:file:bg-brand-primary/80
                                    mb-6"
                                />
                                {mergerStats.files > 0 && (
                                    <div className="mb-4 text-green-400 text-sm font-bold">
                                        Processed {mergerStats.files} files containing {mergerStats.spawns} spawn entries.
                                    </div>
                                )}
                                <textarea 
                                    readOnly 
                                    value={mergedOutput} 
                                    className="w-full h-96 bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 focus:outline-none"
                                    placeholder="Merged output will appear here..."
                                />
                                <button 
                                    onClick={() => navigator.clipboard.writeText(mergedOutput)}
                                    className="mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-lg transition-all w-full"
                                    disabled={!mergedOutput}
                                >
                                    Copy Code
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Admin;
