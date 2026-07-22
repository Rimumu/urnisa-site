
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL, DISCORD_API_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';
import { useProfileContent, AboutItem, CreditItem, ArtistItem } from '../hooks/useProfileContent';
import { useNisathonGoals, NisathonGoal } from '../hooks/useNisathonGoals';
import { useWheelSettings, WheelItem } from '../hooks/useWheelSettings';
import ImageUploader from '../components/ImageUploader';
import OptimizedImage from '../components/OptimizedImage';
import { useNisathonStats, ContributorEvent } from '../hooks/useNisathonStats';
import { useCountdown } from '../hooks/useCountdown';
import { Link } from 'react-router-dom';

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
            <div className="text-red-400 text-xs mt-1 flex items-start gap-1.5 font-bold">
                <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Discord links expire after 24h. Please use the upload feature or use Imgur or Google Drive!</span>
            </div>
        );
    }
    return null;
};

// --- ADMIN PANEL SVG ICONS ---
const AdminIcons = {
    // Sidebar Navigation Icons
    Nisathon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    Countdown: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 22h14" />
            <path d="M5 2h14" />
            <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
            <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
    ),
    Schedule: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
    Target: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    Wheel: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="2" x2="12" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
        </svg>
    ),
    Settings: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    Profile: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    ),
    Gallery: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    Minecraft: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 4l.5 .5a2.12 2.12 0 0 1 0 3l-7 7a2.12 2.12 0 0 1 -3 0l-.5 -.5" />
            <path d="M10 6l-2 2" />
            <path d="M12 21v-6l-2 -2l-2 2v6" />
            <path d="M20 15l-4 -4l-2 2l4 4v3h3v-3z" />
        </svg>
    ),
    Tournament: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
    Snakes: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    Codes: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
    ),
    Users: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Merger: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="12" y1="2" x2="12" y2="22" />
        </svg>
    ),
    Panel: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    // Event Type Icons
    EventSub: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    EventGift: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
    ),
    EventBits: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M12 2.25c-.297 0-.58.14-.757.377L2.25 14.25l9 7.5a1.125 1.125 0 0 0 1.5 0l9-7.5-8.993-11.623a1.125 1.125 0 0 0-.757-.377ZM3.536 13.5l7.714-9.971v9.971H3.536Zm8.464-9.971 7.714 9.971H12V3.529Z" clipRule="evenodd" />
        </svg>
    ),
    EventDono: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    // Section Icons
    EventLog: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    DoubleFire: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
        </svg>
    ),
    Game: ({ className = "w-5 h-5" }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="6" width="20" height="12" rx="3" />
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="8" y1="10" x2="8" y2="14" />
            <circle cx="17" cy="10" r="1" />
            <circle cx="15" cy="13" r="1" />
        </svg>
    ),
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

// --- POKEMON IMAGE UTILS & COMPONENT ---
const clientImageCache = new Map<string, boolean>();

const getFormattedName = (name: string) => {
    return name.toLowerCase()
        .replace(/[.']/g, '')
        .replace(/♀/g, '-f')
        .replace(/♂/g, '-m')
        .replace(/\s+/g, '-');
};

const PokemonAdminImage: React.FC<{ pokemon: { id: number; name: string } }> = ({ pokemon }) => {
    const [imgSrc, setImgSrc] = useState<string>("");

    useEffect(() => {
        let isMounted = true;

        const verifyImage = async () => {
            const cobbleName = getFormattedName(pokemon.name);
            const primaryUrl = `https://cobblemon.tools/pokedex/pokemon/${cobbleName}/sprite.png`;
            const fallback3d = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;

            if (clientImageCache.has(primaryUrl)) {
                if (isMounted) {
                    const isValid = clientImageCache.get(primaryUrl);
                    setImgSrc(isValid ? primaryUrl : fallback3d);
                }
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/utils/check-image?url=${encodeURIComponent(primaryUrl)}`);
                const data = await response.json();

                clientImageCache.set(primaryUrl, data.valid);

                if (isMounted) {
                    setImgSrc(data.valid ? primaryUrl : fallback3d);
                }
            } catch (error) {
                if (isMounted) setImgSrc(fallback3d);
            }
        };

        verifyImage();

        return () => { isMounted = false; };
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
            className={`w-full h-full object-contain`}
            contain
            onError={handleImageError}
            loading="lazy"
        />
    );
};

// Interface for Code List
interface Code {
    _id: string;
    code: string;
    type: 'lamb' | 'steak';
    keyAmount: number;
    usageType: string;
    usageCount: number;
    expiresAt?: string;
    createdAt: string;
}

// TournamentPlayer interface removed - now in AdminTournament.tsx


interface BingoWinner {
    _id: string;
    discordId: string;
    minecraftUsername: string;
    cardId: string;
    linesCompleted: number;
    completedAt: string;
    discordAvatar?: string;
}

const Admin: React.FC = () => {
    // --- AUTH STATE ---
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // --- NAVIGATION STATE ---
    const [activeTab, setActiveTab] = useState<'nisathon_mgr' | 'countdown' | 'schedule' | 'goals_editor' | 'wheel_editor' | 'profile' | 'gallery' | 'minecraft' | 'codes' | 'users' | 'merger' | 'tournament' | 'snakes'>('nisathon_mgr');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- DATA STATE ---
    const { scheduleUrl: currentScheduleUrl } = useSchedule();
    const [newScheduleUrl, setNewScheduleUrl] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const { aboutContent, creditsContent, artworksContent, avatar, refetch: refetchProfile } = useProfileContent();
    const [localAbout, setLocalAbout] = useState<AboutItem[]>([]);
    const [localCredits, setLocalCredits] = useState<CreditItem[]>([]);
    const [localArtworks, setLocalArtworks] = useState<ArtistItem[]>([]);
    const [localAvatar, setLocalAvatar] = useState<string>('');
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [draggedArtwork, setDraggedArtwork] = useState<{ artistIndex: number; imgIndex: number } | null>(null);
    const [dragOverArtwork, setDragOverArtwork] = useState<{ artistIndex: number; imgIndex: number } | null>(null);

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
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, revert: boolean } | null>(null);
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
    const [approvedSearch, setApprovedSearch] = useState('');

    // --- MINECRAFT WIPE MAINTENANCE STATE ---
    const [isWiping, setIsWiping] = useState(false);
    const [wipeStatus, setWipeStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [wipeConfirmText, setWipeConfirmText] = useState('');

    // --- BINGO CONFIG STATE ---
    const [bingoCardId, setBingoCardId] = useState('');
    const [bingoWinCondition, setBingoWinCondition] = useState('');
    const [bingoStatus, setBingoStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [bingoWinners, setBingoWinners] = useState<BingoWinner[]>([]);

    // Bingo Winners Form State
    const [winDiscordId, setWinDiscordId] = useState('');
    const [winUsername, setWinUsername] = useState('');
    const [winCardId, setWinCardId] = useState('');
    const [winLines, setWinLines] = useState(1);
    const [winDate, setWinDate] = useState(new Date().toISOString().split('T')[0]);
    const [winAvatar, setWinAvatar] = useState('');

    // --- CODE GENERATION STATE ---
    const [genType, setGenType] = useState('lamb');
    const [genAmount, setGenAmount] = useState(1);
    const [genKeyAmount, setGenKeyAmount] = useState(1);
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

    // TOURNAMENT STATE REMOVED - Now managed in /admin/tournament


    // --- CONFIRMATION STATES ---
    const [confirmReset, setConfirmReset] = useState(false);
    const [confirmSync, setConfirmSync] = useState(false);
    const [confirmRebuild, setConfirmRebuild] = useState(false);
    const [confirmEnd, setConfirmEnd] = useState(false); // For Ending Nisathon

    // --- SNAKES & LADDERS SPECIAL TILES STATE ---
    const [snakesTiles, setSnakesTiles] = useState<{ _id: string; tile: number; text: string }[]>([]);
    const [newSnakeTile, setNewSnakeTile] = useState('');
    const [newSnakeText, setNewSnakeText] = useState('');
    const [snakesStatus, setSnakesStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [snakesSubsActive, setSnakesSubsActive] = useState(false);
    const [snakesDonosActive, setSnakesDonosActive] = useState(false);
    const [snakesSimUser, setSnakesSimUser] = useState('');
    const [snakesSimAmount, setSnakesSimAmount] = useState(1);
    const [snakesSimDonoAmount, setSnakesSimDonoAmount] = useState(5);
    const [snakesQueue, setSnakesQueue] = useState<{ _id: string; user: string; avatarUrl?: string; type: string; createdAt: string }[]>([]);
    const [snakesQueueFilter, setSnakesQueueFilter] = useState('');

    const [currencySettings, setCurrencySettings] = useState({
        subsRate: 2,
        bitsRate: 500,
        donationRate: 5,
        timePerNb: 10
    });

    useEffect(() => {
        if (stats) {
            setCurrencySettings({
                subsRate: stats.subsRate || 2,
                bitsRate: stats.bitsRate || 500,
                donationRate: stats.donationRate || 5,
                timePerNb: stats.timePerNb || 10
            });
        }
    }, [stats.subsRate, stats.bitsRate, stats.donationRate, stats.timePerNb]);

    const handleSaveCurrencySettings = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/nisathon/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password || ''
                },
                body: JSON.stringify(currencySettings)
            });
            if (response.ok) {
                setManagerStatus({ type: 'success', message: 'Settings saved successfully!' });
                setTimeout(() => setManagerStatus(null), 3000);
                refetchStats();
            } else {
                setManagerStatus({ type: 'error', message: 'Failed to save settings: Unauthorized or invalid password.' });
                setTimeout(() => setManagerStatus(null), 3000);
            }
        } catch (e) {
            setManagerStatus({ type: 'error', message: 'Failed to save settings due to a network error.' });
            setTimeout(() => setManagerStatus(null), 3000);
        }
    };


    // --- EFFECTS ---
    useEffect(() => { setNewScheduleUrl(currentScheduleUrl); }, [currentScheduleUrl]);
    useEffect(() => {
        setLocalAbout(aboutContent);
        setLocalCredits(creditsContent);
        setLocalArtworks(artworksContent);
        setLocalAvatar(avatar || '');
    }, [aboutContent, creditsContent, artworksContent, avatar]);
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
            // Fetch 5000 most recent events from backend
            const res = await fetch(`${API_BASE_URL}/api/nisathon/recent?limit=5000`);
            if (res.ok) setRecentEvents(await res.json());
        } catch (e) { }
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
        } catch (e) { }
    }, [password]);

    const fetchCodes = useCallback(async () => {
        try {
            const res = await fetch(`${DISCORD_API_URL}/api/admin/codes/list`, {
                headers: { Authorization: password }
            });
            if (res.ok) {
                setExistingCodes(await res.json());
            }
        } catch (e) { }
    }, [password]);

    const fetchBingoConfig = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/config`);
            if (res.ok) {
                const data = await res.json();
                setBingoCardId(data.cardId || '');
                setBingoWinCondition(data.winCondition || '');
            }
        } catch (e) { }
    }, []);

    const fetchBingoWinners = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bingo/winners`);
            if (res.ok) {
                setBingoWinners(await res.json());
            }
        } catch (e) { }
    }, []);

    // Tournament data fetching removed - now in /admin/tournament

    const fetchSnakesTiles = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/snakes/special-tiles`);
            if (res.ok) {
                setSnakesTiles(await res.json());
            }
            const settingsRes = await fetch(`${API_BASE_URL}/api/snakes/settings`);
            if (settingsRes.ok) {
                const data = await settingsRes.json();
                setSnakesSubsActive(data.subsActive);
                setSnakesDonosActive(data.donationsActive);
            }
            // Fetch queue for event log
            const stateRes = await fetch(`${API_BASE_URL}/api/snakes/state`);
            if (stateRes.ok) {
                const stateData = await stateRes.json();
                setSnakesQueue(stateData.queue || []);
            }
        } catch (error) { console.error(error); }
    }, []);

    // Tab Data Fetching
    useEffect(() => {
        let interval: number;
        if (isAuthenticated) {
            if (activeTab === 'minecraft') {
                fetchWhitelistData();
                fetchBingoConfig();
                fetchBingoWinners();
                interval = window.setInterval(() => {
                    fetchWhitelistData();
                    fetchBingoWinners();
                }, 10000);
            } else if (activeTab === 'codes') {
                fetchCodes();
            } else if (activeTab === 'snakes') {
                fetchSnakesTiles();
            }
        }
        return () => { if (interval) clearInterval(interval); };
    }, [isAuthenticated, activeTab, fetchWhitelistData, fetchCodes, fetchBingoConfig, fetchBingoWinners, fetchSnakesTiles]);

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

    const handleUpdateSchedule = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
                setTimeout(() => setScheduleStatus(null), 3000);
            } else {
                setScheduleStatus({ type: 'error', message: 'Failed to update.' });
                setTimeout(() => setScheduleStatus(null), 3000);
            }
        } catch (error) {
            setScheduleStatus({ type: 'error', message: 'Network error.' });
            setTimeout(() => setScheduleStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (type?: 'about' | 'credits' | 'artworks' | 'avatar' | 'main') => {
        setLoading(true);
        setProfileStatus(null);

        try {
            if (type === 'artworks') {
                const response = await fetch(`${API_BASE_URL}/api/profile`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': password },
                    body: JSON.stringify({ type: 'artworks', data: localArtworks })
                });
                if (response.ok) {
                    setProfileStatus({ type: 'success', message: 'Gallery saved!' });
                    refetchProfile();
                    setTimeout(() => setProfileStatus(null), 3000);
                } else {
                    setProfileStatus({ type: 'error', message: 'Failed to save gallery.' });
                    setTimeout(() => setProfileStatus(null), 3000);
                }
            } else {
                const [resAbout, resCredits, resAvatar] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': password },
                        body: JSON.stringify({ type: 'about', data: localAbout })
                    }),
                    fetch(`${API_BASE_URL}/api/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': password },
                        body: JSON.stringify({ type: 'credits', data: localCredits })
                    }),
                    fetch(`${API_BASE_URL}/api/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': password },
                        body: JSON.stringify({ type: 'avatar', data: localAvatar })
                    })
                ]);

                if (resAbout.ok && resCredits.ok && resAvatar.ok) {
                    setProfileStatus({ type: 'success', message: 'Profile saved!' });
                    refetchProfile();
                    setTimeout(() => setProfileStatus(null), 3000);
                } else {
                    setProfileStatus({ type: 'error', message: 'Failed to save some profile sections.' });
                    setTimeout(() => setProfileStatus(null), 3000);
                }
            }
        } catch (error) {
            setProfileStatus({ type: 'error', message: 'Network error.' });
            setTimeout(() => setProfileStatus(null), 3000);
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
                setTimeout(() => setGoalsStatus(null), 3000);
            } else {
                setGoalsStatus({ type: 'error', message: 'Failed to save goals.' });
                setTimeout(() => setGoalsStatus(null), 3000);
            }
        } catch (error) {
            setGoalsStatus({ type: 'error', message: 'Network error.' });
            setTimeout(() => setGoalsStatus(null), 3000);
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
                setTimeout(() => setWheelStatus(null), 3000);
            } else {
                setWheelStatus({ type: 'error', message: 'Failed to save wheel.' });
                setTimeout(() => setWheelStatus(null), 3000);
            }
        } catch (error) {
            setWheelStatus({ type: 'error', message: 'Network error.' });
            setTimeout(() => setWheelStatus(null), 3000);
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
                setTimeout(() => setManagerStatus(null), 3000);
            }
        } catch (error) {
            setManagerStatus({ type: 'error', message: 'Failed to update status.' });
            setTimeout(() => setManagerStatus(null), 3000);
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
                    keyAmount: genKeyAmount,
                    usageType: genUsageType,
                    hours: genHours
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setGeneratedCodes(data.codes);
                fetchCodes(); // Refresh list
            }
        } catch (e) { } finally { setLoading(false); }
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
        } catch (e) { }
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
                setTimeout(() => setUserActionStatus(null), 3000);
            } else {
                setUserActionStatus({ type: 'error', message: data.error || "Failed" });
                setTimeout(() => setUserActionStatus(null), 3000);
            }
        } catch (e) {
            setUserActionStatus({ type: 'error', message: "Network Error" });
            setTimeout(() => setUserActionStatus(null), 3000);
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
                setTimeout(() => setUserActionStatus(null), 3000);
            } else {
                setUserActionStatus({ type: 'error', message: data.error || "Failed" });
                setTimeout(() => setUserActionStatus(null), 3000);
            }
        } catch (e) {
            setUserActionStatus({ type: 'error', message: "Network Error" });
            setTimeout(() => setUserActionStatus(null), 3000);
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
                setTimeout(() => setBingoStatus(null), 3000);
            } else {
                setBingoStatus({ type: 'error', message: "Failed to update config" });
                setTimeout(() => setBingoStatus(null), 3000);
            }
        } catch (e) {
            setBingoStatus({ type: 'error', message: "Network Error" });
            setTimeout(() => setBingoStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWinner = async () => {
        if (!winDiscordId || !winUsername || !winCardId) {
            alert("Please fill all required fields");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/bingo/winner`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({
                    discordId: winDiscordId,
                    minecraftUsername: winUsername,
                    cardId: winCardId,
                    linesCompleted: winLines,
                    completedAt: winDate
                })
            });
            if (res.ok) {
                fetchBingoWinners();
                setWinUsername('');
                setWinDiscordId('');
                setWinLines(1);
            } else {
                alert("Failed to add winner");
            }
        } catch (e) {
            alert("Network Error");
        } finally { setLoading(false); }
    };

    const handleDeleteWinner = async (id: string) => {
        if (!confirm("Remove this winner?")) return;
        setLoading(true);
        try {
            await fetch(`${API_BASE_URL}/api/admin/bingo/winner/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: password },
                body: JSON.stringify({ id })
            });
            fetchBingoWinners();
        } catch (e) {
            alert("Network Error");
        } finally { setLoading(false); }
    };

    const handleWipeMinecraftData = async (scope: 'all' | 'inventory' | 'currency' | 'approved_users' | 'bingo' | 'tournament') => {
        if (scope === 'all' && wipeConfirmText !== 'WIPE') {
            alert("Please type 'WIPE' exactly to confirm the full database reset.");
            return;
        }

        if (!window.confirm(`Are you absolutely sure you want to wipe ${scope === 'all' ? 'ALL previous Minecraft and Tournament data' : scope}? This action cannot be undone.`)) {
            return;
        }

        setIsWiping(true);
        setWipeStatus(null);

        try {
            let botSuccess = true;
            let mainSuccess = true;
            let botResults: any = null;
            let mainResults: any = null;

            // 1. Wipe Bot Server data (inventories, currencies, approved users)
            if (scope === 'all' || scope === 'inventory' || scope === 'currency' || scope === 'approved_users') {
                const res = await fetch(`${DISCORD_API_URL}/api/admin/maintenance/wipe-minecraft-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': password
                    },
                    body: JSON.stringify({ scope: scope === 'all' ? 'all' : scope })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    botResults = data.results;
                    console.log("Bot server wipe results:", botResults);
                } else {
                    botSuccess = false;
                }
            }

            // 2. Wipe Main Server data (bingo, tournament data)
            if (scope === 'all' || scope === 'bingo' || scope === 'tournament') {
                const res = await fetch(`${API_BASE_URL}/api/admin/maintenance/wipe-minecraft-data`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': password
                    },
                    body: JSON.stringify({ scope: scope === 'all' ? 'all' : scope })
                });

                if (res.ok) {
                    const data = await res.json();
                    mainResults = data.results;
                    console.log("Main server wipe results:", mainResults);
                } else {
                    mainSuccess = false;
                }
            }

            if (botSuccess && mainSuccess) {
                setWipeStatus({
                    type: 'success',
                    message: `Successfully wiped ${scope === 'all' ? 'all previous Minecraft data' : scope}!`
                });
                setWipeConfirmText('');
                // Refetch whitelist and winners to update UI
                fetchWhitelistData();
                fetchBingoWinners();
            } else {
                setWipeStatus({
                    type: 'error',
                    message: `Wipe failed on one or more services. Please check backend logs.`
                });
            }
        } catch (e: any) {
            console.error("Wipe error", e);
            setWipeStatus({
                type: 'error',
                message: `Failed to complete wipe: ${e.message}`
            });
        } finally {
            setIsWiping(false);
        }
    };

    // TOURNAMENT HANDLERS REMOVED - Now in /admin/tournament

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
const formatName = (str: string): string => {
    if (!str) return "";
    let clean = str.replace(/^.*:/, '');
    if (clean.startsWith('#')) clean = clean.substring(1);
    if (clean.startsWith('is_')) clean = clean.substring(3);
    clean = clean.replace(/_/g, ' ');
    return clean.replace(/\\b\\w/g, (char) => char.toUpperCase());
};

export const getSpawnInfo = (pokemonName: string): string | null => {
    const target = pokemonName.toLowerCase().trim();
    const entries = RAW_SPAWN_DATA.spawns.filter(s => s.pokemon.toLowerCase() === target);
    if (entries.length === 0) return null;
    const biomes = new Set<string>();
    const keyItems = new Set<string>();
    entries.forEach(entry => {
        if (entry.condition && entry.condition.biomes) {
            entry.condition.biomes.forEach(b => { biomes.add(formatName(b)); });
        }
        if (entry.condition && entry.condition.key_item) {
            const item = entry.condition.key_item;
            if (Array.isArray(item)) {
                item.forEach(i => keyItems.add(formatName(i)));
            } else if (typeof item === 'string') {
                keyItems.add(formatName(item));
            }
        }
    });
    const biomeList = Array.from(biomes).sort().join(', ');
    const itemList = Array.from(keyItems).join(' or ');
    let result = "";
    if (itemList) { result += \`Requires: \${itemList}. \`; }
    if (biomeList) { result += \`Biomes: \${biomeList}.\`; }
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
                setTimeout(() => setManagerStatus(null), 3000);
                if (endpoint.includes('nisathon')) refetchStats();
                if (endpoint.includes('delete-event') || endpoint.includes('test-event') || endpoint.includes('rebuild')) fetchEventLog();
            } else {
                setManagerStatus({ type: 'error', message: 'Action failed.' });
                setTimeout(() => setManagerStatus(null), 3000);
            }
        } catch (error) {
            setManagerStatus({ type: 'error', message: 'Network error.' });
            setTimeout(() => setManagerStatus(null), 3000);
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

    // NEW: End Nisathon Handler
    const handleEndNisathon = () => {
        if (confirmEnd) {
            apiCall('nisathon/end', {});
            setConfirmEnd(false);
        } else {
            setConfirmEnd(true);
            setTimeout(() => setConfirmEnd(false), 3000);
        }
    };

    // NEW: Start Nisathon Handler
    const handleStartNisathon = () => apiCall('nisathon/start', {});

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
    const handleCountdownRemove = () => apiCall('countdown/add', { minutes: -Math.abs(cdAddM) });
    const handleCountdownPause = () => apiCall('countdown/pause', {});
    const handleCountdownReset = () => apiCall('countdown/reset', {});

    // MINECRAFT HANDLERS
    const handleApproveApp = async (id: string) => {
        setLoading(true);
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/whitelist/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ id })
            });
            fetchWhitelistData();
        } catch (e) { } finally { setLoading(false); }
    };

    const handleRejectApp = async (id: string) => {
        const confirmed = window.confirm("Reject this application?");
        if (!confirmed) return;

        setLoading(true);
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/whitelist/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ id })
            });
            fetchWhitelistData();
        } catch (e) { } finally { setLoading(false); }
    };

    const handleRevokeApp = async (id: string, username: string) => {
        const confirmed = window.confirm(`Remove ${username} from the whitelist? (Simulates RCON command)`);
        if (!confirmed) return;

        setLoading(true);
        try {
            await fetch(`${DISCORD_API_URL}/api/admin/whitelist/revoke`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ id })
            });
            fetchWhitelistData();
        } catch (e) { } finally { setLoading(false); }
    };

    // --- HELPERS ---
    const updateAboutItem = (i: number, f: keyof AboutItem, v: string) => { const u = [...localAbout]; u[i] = { ...u[i], [f]: v }; setLocalAbout(u); };
    const addAboutItem = () => setLocalAbout([...localAbout, { id: Date.now().toString(), title: 'New Section', text: '' }]);
    const removeAboutItem = (i: number) => setLocalAbout(localAbout.filter((_, idx) => idx !== i));

    const updateCreditItem = (i: number, f: keyof CreditItem, v: string) => { const u = [...localCredits]; let val = v; if (f === 'image') val = processImageUrl(v); u[i] = { ...u[i], [f]: val } as any; setLocalCredits(u); };
    const addCreditItem = () => setLocalCredits([...localCredits, { id: Date.now().toString(), name: 'Name', role: 'Role', color: '#e5383b', initial: '?', link: '' }]);
    const removeCreditItem = (i: number) => setLocalCredits(localCredits.filter((_, idx) => idx !== i));

    const addArtist = () => {
        const newId = Date.now().toString();
        setLocalArtworks([...localArtworks, { id: newId, artistName: 'New Artist', artistLink: '', images: [] }]);
        setTimeout(() => {
            const el = document.getElementById(`artist-collection-${newId}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 120);
    };
    const removeArtist = (i: number) => setLocalArtworks(localArtworks.filter((_, idx) => idx !== i));
    const updateArtistName = (i: number, v: string) => { const u = [...localArtworks]; u[i].artistName = v; setLocalArtworks(u); };
    const updateArtistLink = (i: number, v: string) => { const u = [...localArtworks]; u[i].artistLink = v; setLocalArtworks(u); };
    const addImageToArtist = (i: number, v: string) => { 
        if (!v) return; 
        setLocalArtworks((prev) => {
            const u = [...prev];
            if (u[i]) {
                u[i] = {
                    ...u[i],
                    images: [...u[i].images, processImageUrl(v)]
                };
            }
            return u;
        });
    };
    const removeImageFromArtist = (ai: number, ii: number) => { 
        setLocalArtworks((prev) => {
            const u = [...prev];
            if (u[ai]) {
                u[ai] = {
                    ...u[ai],
                    images: u[ai].images.filter((_, idx) => idx !== ii)
                };
            }
            return u;
        });
    };
    const moveArtist = (index: number, direction: 'up' | 'down') => {
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= localArtworks.length) return;
        setLocalArtworks((prev) => {
            const u = [...prev];
            const temp = u[index];
            u[index] = u[nextIndex];
            u[nextIndex] = temp;
            return u;
        });
    };
    const moveArtwork = (artistIndex: number, imgIndex: number, direction: 'left' | 'right') => {
        setLocalArtworks((prev) => {
            const u = [...prev];
            const artist = u[artistIndex];
            if (!artist) return prev;
            const nextIdx = direction === 'left' ? imgIndex - 1 : imgIndex + 1;
            if (nextIdx < 0 || nextIdx >= artist.images.length) return prev;
            const temp = artist.images[imgIndex];
            const newImages = [...artist.images];
            newImages[imgIndex] = newImages[nextIdx];
            newImages[nextIdx] = temp;
            u[artistIndex] = {
                ...artist,
                images: newImages
            };
            return u;
        });
    };

    const handleArtworkDragStart = (e: React.DragEvent, artistIndex: number, imgIndex: number) => {
        setDraggedArtwork({ artistIndex, imgIndex });
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleArtworkDragOver = (e: React.DragEvent, artistIndex: number, imgIndex: number) => {
        e.preventDefault();
        if (draggedArtwork) {
            setDragOverArtwork({ artistIndex, imgIndex });
        }
    };

    const handleArtworkDragEnd = () => {
        setDraggedArtwork(null);
        setDragOverArtwork(null);
    };

    const handleArtworkDrop = (e: React.DragEvent, targetArtistIndex: number, targetImgIndex: number) => {
        e.preventDefault();
        if (!draggedArtwork) return;

        const sourceArtistIdx = draggedArtwork.artistIndex;
        const sourceImgIdx = draggedArtwork.imgIndex;

        setLocalArtworks((prev) => {
            const updated = [...prev];
            
            if (sourceArtistIdx === targetArtistIndex) {
                // Reordering within the same artist
                const artist = updated[sourceArtistIdx];
                if (!artist) return prev;
                
                const newImages = [...artist.images];
                const [movedImage] = newImages.splice(sourceImgIdx, 1);
                newImages.splice(targetImgIndex, 0, movedImage);
                
                updated[sourceArtistIdx] = {
                    ...artist,
                    images: newImages
                };
            } else {
                // Moving from one artist to another
                const sourceArtist = updated[sourceArtistIdx];
                const targetArtist = updated[targetArtistIndex];
                if (!sourceArtist || !targetArtist) return prev;
                
                const sourceImages = [...sourceArtist.images];
                const targetImages = [...targetArtist.images];
                
                const [movedImage] = sourceImages.splice(sourceImgIdx, 1);
                targetImages.splice(targetImgIndex, 0, movedImage);
                
                updated[sourceArtistIdx] = {
                    ...sourceArtist,
                    images: sourceImages
                };
                updated[targetArtistIndex] = {
                    ...targetArtist,
                    images: targetImages
                };
            }
            return updated;
        });

        setDraggedArtwork(null);
        setDragOverArtwork(null);
    };

    const addGoal = () => { const max = localGoals.length > 0 ? Math.max(...localGoals.map(g => g.count)) : 0; setLocalGoals([...localGoals, { count: max + 50, reward: "New Goal", secret: false }]); };
    const removeGoal = (i: number) => setLocalGoals(localGoals.filter((_, idx) => idx !== i));
    const updateGoal = (i: number, f: keyof NisathonGoal, v: any) => { const u = [...localGoals]; (u[i] as any)[f] = v; setLocalGoals(u); };

    const addWheelItem = () => setLocalWheel([...localWheel, { label: "New Reward", weight: 10 }]);
    const removeWheelItem = (i: number) => setLocalWheel(localWheel.filter((_, idx) => idx !== i));
    const updateWheelItem = (i: number, f: keyof WheelItem, v: any) => { const u = [...localWheel]; (u[i] as any)[f] = v; setLocalWheel(u); };
    const totalWheelWeight = localWheel.reduce((acc, item) => acc + item.weight, 0);

    // FILTER LOGIC
    const filteredEvents = recentEvents.filter(evt => {
        const typeMatch = (filterType === 'all')
            || (filterType === 'sub' && (evt.type === 'sub' || evt.type === 'subscriber'))
            || (filterType === 'gift' && evt.type === 'gift')
            || (filterType === 'bits' && (evt.type === 'bits' || evt.type === 'cheer'))
            || (filterType === 'dono' && (evt.type === 'donation' || evt.type === 'tip'))
            || (filterType === 'follow' && (evt.type === 'follower' || evt.type === 'follow'));
        const userMatch = filterUser.trim() === '' || evt.user.toLowerCase().includes(filterUser.toLowerCase().trim());
        return typeMatch && userMatch;
    });

    const filteredApprovedApps = approvedApps.filter(app => {
        const term = approvedSearch.toLowerCase();
        return (
            (app.discordUsername && app.discordUsername.toLowerCase().includes(term)) ||
            (app.minecraftUsername && app.minecraftUsername.toLowerCase().includes(term))
        );
    });

    const isDoubleTimer = stats.activeEvent === 'DOUBLE_TIMER';
    const latestActivity = recentEvents.length > 0 ? recentEvents[0] : null;

    // --- RENDER ---
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-brand-surface relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)]"></div>
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                </div>

                <div className="relative z-10 bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md animate-in zoom-in duration-500">
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
        <div className="flex flex-col md:flex-row h-screen bg-brand-surface relative overflow-hidden font-sans">
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5383b; border-radius: 3px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
            `}</style>
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.02)_0%,transparent_60%)]"></div>
                <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
            </div>

            {/* --- MOBILE HEADER & MENU TOGGLE --- */}
            <div className="md:hidden relative z-40 flex items-center justify-between p-4 bg-black/60 backdrop-blur-xl border-b border-white/5">
                <div className="flex items-center gap-3">
                    <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                        <AdminIcons.Panel />
                    </span>
                    <h1 className="text-xl font-black text-white tracking-tight">Admin <span className="text-brand-primary">Panel</span></h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-all" title="Exit Admin">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-brand-primary hover:bg-red-600 text-white rounded-lg transition-all">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <div className={`fixed md:relative z-50 w-[280px] bg-black/95 md:bg-black/40 backdrop-blur-3xl border-r border-white/5 flex-shrink-0 h-screen md:sticky md:top-0 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} top-0 left-0`}>
                <div className="hidden md:flex p-6 md:p-8 items-center justify-between md:justify-start gap-4 bg-gradient-to-b from-white/5 to-transparent shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                            <AdminIcons.Panel />
                        </span>
                        <h1 className="text-2xl font-black text-white tracking-tight">Admin <span className="text-brand-primary">Panel</span></h1>
                    </div>
                </div>
                
                <nav className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar mt-[72px] md:mt-0">
                    {[
                        {
                            title: "Nisathon",
                            items: [
                                { id: 'nisathon_mgr', label: 'Nisathon Dashboard', icon: AdminIcons.Nisathon },
                                { id: 'goals_editor', label: 'Goals Editor', icon: AdminIcons.Target },
                                { id: 'wheel_editor', label: 'Wheel Editor', icon: AdminIcons.Wheel },
                            ]
                        },
                        {
                            title: "Website Content",
                            items: [
                                { id: 'schedule', label: 'Stream Schedule', icon: AdminIcons.Schedule },
                                { id: 'profile', label: 'Profile Editor', icon: AdminIcons.Profile },
                                { id: 'gallery', label: 'Gallery Uploads', icon: AdminIcons.Gallery },
                            ]
                        },
                        {
                            title: "Widgets & Events",
                            items: [
                                { id: 'countdown', label: 'Countdown', icon: AdminIcons.Countdown },
                                { id: 'snakes', label: 'Snakes & Ladders', icon: AdminIcons.Snakes, special: true },
                            ]
                        },
                        {
                            title: "Minecraft",
                            items: [
                                { id: 'minecraft', label: 'Minecraft Dashboard', icon: AdminIcons.Game },
                                { id: 'tournament', label: 'Tournament', icon: AdminIcons.Tournament },
                                { id: 'codes', label: 'Gacha Codes', icon: AdminIcons.Codes },
                            ]
                        },
                        {
                            title: "Developer Tools",
                            items: [
                                { id: 'users', label: 'Users Management', icon: AdminIcons.Users },
                                { id: 'merger', label: 'JSON Merger', icon: AdminIcons.Merger },
                            ]
                        }
                    ].map((category, idx) => (
                        <div key={idx} className="flex flex-col gap-1 shrink-0">
                            <div className="text-[10px] uppercase font-extrabold text-gray-500 tracking-[0.2em] px-3 pt-2 pb-1">
                                {category.title}
                            </div>
                            {category.items.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} 
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm whitespace-nowrap 
                                    ${activeTab === item.id 
                                        ? (item.special 
                                            ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]' 
                                            : 'bg-brand-primary text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]') 
                                        : 'text-gray-400 bg-transparent hover:bg-white/10 hover:text-white'}`}
                                >
                                    <item.icon /> <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>
                
                <div className="p-4 md:p-6 border-t border-white/5 shrink-0 hidden md:block">
                    <Link to="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-2xl transition-all font-bold text-sm">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Exit Admin
                    </Link>
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="relative z-10 flex-1 p-6 md:p-10 overflow-y-auto h-full custom-scrollbar">
                <div className="max-w-6xl mx-auto space-y-8 pb-20">

                    {/* --- STATUS TOASTS (STACKED & POINTER-EVENTS CONTROLLED) --- */}
                    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
                        {[profileStatus, goalsStatus, wheelStatus, scheduleStatus, managerStatus, userActionStatus, bingoStatus, snakesStatus].map((status, i) => status && (
                            <div key={i} className={`pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
                                status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                            } animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-8 duration-300 ease-out fill-mode-both group relative overflow-hidden`}>
                                {/* Animated background glow */}
                                <div className={`absolute inset-0 opacity-20 blur-xl ${status.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                
                                {/* Icon */}
                                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border bg-black/40 ${
                                    status.type === 'success' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-400'
                                }`}>
                                    {status.type === 'success' ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>

                                {/* Message */}
                                <div className="flex flex-col relative z-10 w-full pr-2">
                                    <span className="font-bold text-sm tracking-wide text-white drop-shadow-md">{status.type === 'success' ? 'Success' : 'Error'}</span>
                                    <span className={`text-xs font-medium drop-shadow-md ${status.type === 'success' ? 'text-emerald-200/90' : 'text-red-200/90'}`}>
                                        {status.message}
                                    </span>
                                </div>
                                
                                {/* Progress Bar Animation (approx 3 seconds) */}
                                <style dangerouslySetInnerHTML={{__html: `
                                    @keyframes shrinkX { from { width: 100%; } to { width: 0%; } }
                                `}} />
                                <div className={`absolute bottom-0 left-0 h-1 ${status.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ animation: 'shrinkX 3s linear forwards' }}></div>
                            </div>
                        ))}
                    </div>

                    {activeTab === 'nisathon_mgr' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* LIVE HEADER STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${isDoubleTimer ? 'bg-gradient-to-br from-yellow-900/40 to-black border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)]' : 'bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl'}`}>
                                    <div className="text-xs text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2 flex justify-between items-center">
                                        Time Remaining
                                    </div>
                                    <div className={`text-4xl md:text-5xl font-black font-mono tracking-tighter flex flex-col justify-center h-full -mt-2 ${timeBump ? 'text-green-400 scale-105' : 'text-white'} transition-all duration-300 drop-shadow-lg`}>
                                        <div>{timeLeftString}</div>
                                        {(stats.isPaused || stats.isEnded) && (
                                            <div className="flex flex-wrap items-center gap-2 mt-2 font-sans tracking-normal">
                                                {stats.isPaused && <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1 shadow-lg shadow-amber-500/10 animate-pulse"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Paused</span>}
                                                {stats.isEnded && <span className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-black flex items-center gap-1 shadow-lg shadow-red-500/10"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg> Ended</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                                    <div className="text-xs text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">Total Nisaballs</div>
                                    <div className="text-5xl md:text-6xl font-black text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)] flex items-center h-full -mt-2">{Math.floor(stats.totalNisaballs)}</div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group flex flex-col justify-between">
                                    <div className="text-xs text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-3">Recent Activity</div>
                                    {latestActivity ? (
                                        <div className="flex flex-col justify-center h-full -mt-2">
                                            <div className="font-extrabold text-white text-2xl truncate tracking-tight">{latestActivity.user}</div>
                                            <div className="text-lg font-mono font-bold text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{latestActivity.amountDisplay}</div>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic flex items-center h-full -mt-2">Waiting for events...</div>
                                    )}
                                </div>
                                <div className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between">
                                    <div className="text-xs text-gray-400 font-extrabold uppercase tracking-[0.2em] mb-2">Stream Status</div>
                                    <div className="flex justify-between items-center h-full -mt-2">
                                        <div className={`text-4xl md:text-5xl font-black uppercase tracking-tight ${streamStatusOverride === 'live' ? 'text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]' : streamStatusOverride === 'offline' ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]'}`}>
                                            {streamStatusOverride === 'offline' ? 'OFF' : streamStatusOverride}
                                        </div>
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button onClick={() => handleSetStreamStatus('auto')} className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${streamStatusOverride === 'auto' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'}`}>AUTO</button>
                                            <button onClick={() => handleSetStreamStatus('live')} className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${streamStatusOverride === 'live' ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'}`}>LIVE</button>
                                            <button onClick={() => handleSetStreamStatus('offline')} className={`px-2.5 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider transition-all duration-300 ${streamStatusOverride === 'offline' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-black/40 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'}`}>OFFLINE</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Controls */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                        <h3 className="font-black text-white text-2xl tracking-tight">Timer Management</h3>
                                        <button onClick={handleToggleDoubleTimer} className={`text-xs px-5 py-2.5 rounded-xl font-bold border transition-all duration-300 flex items-center gap-2 ${stats.activeEvent === 'DOUBLE_TIMER' ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)] hover:scale-105' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:scale-105'}`}>{stats.activeEvent === 'DOUBLE_TIMER' ? <><AdminIcons.DoubleFire /> 2x Active</> : 'Enable 2x Event'}</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                                            <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-[0.2em]">Set Absolute Time</label>
                                            <div className="flex gap-3">
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest text-center">HRS</span>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <button onClick={() => setTimerH(timerH + 1)} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                        </button>
                                                        <input type="number" placeholder="00" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-white text-xl font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" value={timerH} onChange={e => setTimerH(parseInt(e.target.value) || 0)} />
                                                        <button onClick={() => setTimerH(Math.max(0, timerH - 1))} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest text-center">MINS</span>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <button onClick={() => setTimerM(timerM + 1)} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                        </button>
                                                        <input type="number" placeholder="00" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-white text-xl font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" value={timerM} onChange={e => setTimerM(parseInt(e.target.value) || 0)} />
                                                        <button onClick={() => setTimerM(Math.max(0, timerM - 1))} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 w-full">
                                                    <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest text-center">SECS</span>
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <button onClick={() => setTimerS(timerS + 1)} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                        </button>
                                                        <input type="number" placeholder="00" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-white text-xl font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" value={timerS} onChange={e => setTimerS(parseInt(e.target.value) || 0)} />
                                                        <button onClick={() => setTimerS(Math.max(0, timerS - 1))} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={handleSetTimer} className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-extrabold tracking-wide transition-all hover:scale-[1.02]">Set Time</button>
                                        </div>
                                        <div className="space-y-4 bg-black/20 p-5 rounded-2xl border border-white/5 flex flex-col justify-between">
                                            <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-[0.2em]">Quick Adjust</label>
                                            <div className="flex flex-col gap-2 w-full">
                                                <span className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest text-center">MINS</span>
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <button onClick={() => setAddM(addM + 1)} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                                    </button>
                                                    <input type="number" placeholder="0" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 text-center text-white text-xl font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" value={addM} onChange={e => setAddM(parseInt(e.target.value) || 0)} />
                                                    <button onClick={() => setAddM(Math.max(0, addM - 1))} className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1.5 rounded-lg transition-all flex justify-center hover:scale-[1.02]">
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3 mt-2">
                                                <button onClick={handleAddTimer} className="flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white py-3.5 rounded-xl transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                </button>
                                                <button onClick={handleRemoveTimer} className="flex items-center justify-center bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white py-3.5 rounded-xl transition-all hover:scale-[1.05] shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                                </button>
                                                <button onClick={handlePauseTimer} className={`py-3.5 rounded-xl flex items-center justify-center font-extrabold text-white transition-all hover:scale-[1.05] shadow-lg ${stats.isPaused ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30' : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'}`}>
                                                    {stats.isPaused ? (
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                    ) : (
                                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col">
                                    <h3 className="font-black text-white text-2xl tracking-tight mb-6">Manual Trigger</h3>
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="space-y-4">
                                            <input type="text" placeholder="Username" className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white font-medium focus:border-brand-primary outline-none transition-colors" value={testUser} onChange={e => setTestUser(e.target.value)} />
                                            <div className="flex gap-3">
                                                <select className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-white font-medium flex-1 focus:border-brand-primary outline-none transition-colors appearance-none" value={testType} onChange={e => setTestType(e.target.value)}>
                                                    <option value="sub">Subscriber</option><option value="gift">Gift Sub</option><option value="bits">Bits</option><option value="donation">Donation</option>
                                                </select>
                                                <input type="number" placeholder="Amt" className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-white font-mono w-24 text-center focus:border-brand-primary outline-none transition-colors" value={testAmount} onChange={e => setTestAmount(e.target.value)} />
                                            </div>
                                        </div>
                                        <button onClick={handleSimulateEvent} className="w-full mt-6 bg-brand-primary hover:bg-red-600 text-white font-extrabold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(220,38,38,0.3)]">Trigger Event</button>
                                    </div>
                                </div>
                            </div>
                            
                            
                            {/* Nisaball Currency Settings */}
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl mb-8 flex flex-col">
                                <h3 className="font-black text-white text-2xl tracking-tight mb-6 flex items-center gap-3">
                                    <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="12" y1="1" x2="12" y2="23"></line>
                                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                        </svg>
                                    </span>
                                    Currency Settings
                                </h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {/* Subs per NB */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-widest text-center">Subs per NB</label>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, subsRate: (currencySettings.subsRate || 0) + 1 })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 text-center text-white text-lg font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" 
                                                value={currencySettings.subsRate} 
                                                onChange={(e) => setCurrencySettings({ ...currencySettings, subsRate: Math.max(1, Number(e.target.value) || 0) })} 
                                            />
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, subsRate: Math.max(1, (currencySettings.subsRate || 0) - 1) })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bits per NB */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-widest text-center">Bits per NB</label>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, bitsRate: (currencySettings.bitsRate || 0) + 50 })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 text-center text-white text-lg font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" 
                                                value={currencySettings.bitsRate} 
                                                onChange={(e) => setCurrencySettings({ ...currencySettings, bitsRate: Math.max(1, Number(e.target.value) || 0) })} 
                                            />
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, bitsRate: Math.max(1, (currencySettings.bitsRate || 0) - 50) })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Donation ($) per NB */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-widest text-center">Dono ($) per NB</label>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, donationRate: (currencySettings.donationRate || 0) + 1 })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 text-center text-white text-lg font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" 
                                                value={currencySettings.donationRate} 
                                                onChange={(e) => setCurrencySettings({ ...currencySettings, donationRate: Math.max(1, Number(e.target.value) || 0) })} 
                                            />
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, donationRate: Math.max(1, (currencySettings.donationRate || 0) - 1) })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Minutes per NB */}
                                    <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-between gap-3">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-widest text-center">Mins per NB</label>
                                        <div className="flex flex-col items-center gap-1.5">
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, timePerNb: (currencySettings.timePerNb || 0) + 1 })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                            </button>
                                            <input 
                                                type="number" 
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 text-center text-white text-lg font-mono focus:border-brand-primary outline-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] transition-colors" 
                                                value={currencySettings.timePerNb} 
                                                onChange={(e) => setCurrencySettings({ ...currencySettings, timePerNb: Math.max(1, Number(e.target.value) || 0) })} 
                                            />
                                            <button 
                                                onClick={() => setCurrencySettings({ ...currencySettings, timePerNb: Math.max(1, (currencySettings.timePerNb || 0) - 1) })} 
                                                className="w-full bg-white/5 hover:bg-brand-primary/20 border border-white/10 hover:border-brand-primary/50 text-gray-400 hover:text-brand-primary py-1 rounded-lg transition-all flex justify-center hover:scale-[1.02]"
                                            >
                                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={handleSaveCurrencySettings} className="mt-6 bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-6 rounded-xl transition-all self-start shadow-lg">Save Settings</button>
                            </div>

                            {/* Revamped Event Log */}
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl h-[600px] flex flex-col">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                    <h3 className="font-black text-white text-2xl tracking-tight flex items-center gap-3"><span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"><AdminIcons.EventLog /></span> Event Log ({filteredEvents.length})</h3>

                                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                        <input
                                            type="text"
                                            placeholder="Search User..."
                                            value={filterUser}
                                            onChange={(e) => setFilterUser(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-brand-primary outline-none min-w-[150px] flex-1 md:flex-none transition-colors"
                                        />
                                        <div className="flex bg-black/40 rounded-xl p-1.5 border border-white/10 overflow-x-auto custom-scrollbar">
                                            {[
                                                { id: 'all', label: 'ALL' },
                                                { id: 'sub', label: 'SUB' },
                                                { id: 'gift', label: 'GIFT' },
                                                { id: 'bits', label: 'BITS' },
                                                { id: 'dono', label: 'DONO' }
                                            ].map(f => (
                                                <button
                                                    key={f.id}
                                                    onClick={() => setFilterType(f.id)}
                                                    className={`shrink-0 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${filterType === f.id ? 'bg-brand-primary text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                    {filteredEvents.map(evt => {
                                        let IconComponent = AdminIcons.EventSub;
                                        let colorClass = 'text-gray-400 bg-gray-500/10 border-gray-500/20';

                                        if (evt.type === 'sub' || evt.type === 'subscriber') { IconComponent = AdminIcons.EventSub; colorClass = 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]'; }
                                        else if (evt.type === 'gift') { IconComponent = AdminIcons.EventGift; colorClass = 'text-pink-400 bg-pink-500/10 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]'; }
                                        else if (evt.type === 'bits' || evt.type === 'cheer') { IconComponent = AdminIcons.EventBits; colorClass = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]'; }
                                        else if (evt.type === 'donation' || evt.type === 'tip') { IconComponent = AdminIcons.EventDono; colorClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]'; }

                                        return (
                                            <div key={evt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all gap-4 group shadow-sm">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center border ${colorClass}`}>
                                                        <IconComponent />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <div className="font-bold text-white text-sm truncate">{evt.user}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase font-extrabold tracking-widest mt-0.5 whitespace-normal sm:whitespace-nowrap">
                                                            {evt.type} • {new Date(evt.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                                                    <div className="font-mono font-bold text-brand-accent text-sm whitespace-nowrap bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 drop-shadow-md">
                                                        {evt.amountDisplay}
                                                    </div>
                                                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
                                                        <button onClick={() => setConfirmDelete({ id: evt._id, revert: true })} className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">REV</button>
                                                        <button onClick={() => setConfirmDelete({ id: evt._id, revert: false })} className="bg-white/5 border border-white/10 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm">DEL</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {confirmDelete && (
                                <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="bg-[#1a0b0e] p-8 rounded-3xl border border-red-900/50 text-center max-w-sm shadow-[0_0_50px_rgba(220,38,38,0.15)]">
                                        <h3 className="text-2xl font-black text-white tracking-tight mb-6">Confirm Delete</h3>
                                        <div className="flex flex-col gap-3">
                                            <button onClick={() => handleDeleteEvent(confirmDelete.id, true)} className="bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.4)]">REVERT NB & DELETE</button>
                                            <button onClick={() => handleDeleteEvent(confirmDelete.id, false)} className="bg-white/10 hover:bg-white/20 text-white py-3.5 rounded-xl font-bold transition-all hover:scale-[1.02]">DELETE LOG ONLY</button>
                                            <button onClick={() => setConfirmDelete(null)} className="text-gray-500 hover:text-white font-medium mt-4 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Danger Zone */}
                            <div className="bg-red-900/10 border border-red-900/30 p-8 rounded-3xl flex flex-wrap gap-4 shadow-[inset_0_0_30px_rgba(220,38,38,0.05)]">
                                <button onClick={handleResetData} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all duration-300 ${confirmReset ? 'bg-red-600 w-full shadow-[0_0_20px_rgba(220,38,38,0.5)] scale-[1.01]' : 'bg-red-900/40 hover:bg-red-900/60 border border-red-900/50 hover:border-red-500/50'}`}>{confirmReset ? "CONFIRM RESET ALL DATA?" : "Reset Nisathon Data"}</button>
                                <button onClick={handleForceSync} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all duration-300 ${confirmSync ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-[1.01]' : 'bg-blue-900/40 hover:bg-blue-900/60 border border-blue-900/50 hover:border-blue-500/50'}`}>{confirmSync ? "Confirm Force Sync?" : "Force Sync (StreamElements)"}</button>
                                <button onClick={handleRebuild} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all duration-300 ${confirmRebuild ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.5)] scale-[1.01]' : 'bg-orange-900/40 hover:bg-orange-900/60 border border-orange-900/50 hover:border-orange-500/50'}`}>{confirmRebuild ? "Confirm Rebuild?" : "Rebuild from History"}</button>
                                {/* NEW: END BUTTON */}
                                <button onClick={handleEndNisathon} className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all duration-300 w-full ${confirmEnd ? 'bg-red-700 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.8)] scale-[1.02] border border-red-500' : 'bg-red-900/60 hover:bg-red-700 border border-red-900/50 hover:border-red-500/50'}`}>
                                    {confirmEnd ? "ARE YOU SURE? CLICK TO END NISATHON" : "END NISATHON"}
                                </button>
                                <button onClick={handleStartNisathon} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-white bg-green-600 hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300 w-full border border-green-500/30">
                                    START / RESUME NISATHON
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'countdown' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-white tracking-tight">Standalone Countdown</h2>
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-5 bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <label className="text-brand-primary text-[10px] uppercase font-extrabold tracking-[0.2em]">Set Time</label>
                                        <div className="flex gap-3">
                                            <input type="number" placeholder="H" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white text-2xl font-mono focus:border-brand-primary outline-none transition-colors" value={cdH} onChange={e => setCdH(parseInt(e.target.value) || 0)} />
                                            <input type="number" placeholder="M" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white text-2xl font-mono focus:border-brand-primary outline-none transition-colors" value={cdM} onChange={e => setCdM(parseInt(e.target.value) || 0)} />
                                            <input type="number" placeholder="S" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white text-2xl font-mono focus:border-brand-primary outline-none transition-colors" value={cdS} onChange={e => setCdS(parseInt(e.target.value) || 0)} />
                                        </div>
                                        <button onClick={handleCountdownSet} className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-extrabold transition-all hover:scale-[1.02]">Set Countdown</button>
                                    </div>
                                    <div className="space-y-5 bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <label className="text-brand-primary text-[10px] uppercase font-extrabold tracking-[0.2em]">Quick Actions</label>
                                        <input type="number" placeholder="Minutes" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center text-white text-2xl font-mono focus:border-brand-primary outline-none transition-colors" value={cdAddM} onChange={e => setCdAddM(parseInt(e.target.value) || 0)} />
                                        <div className="flex gap-3">
                                            <button onClick={handleCountdownRemove} className="flex-1 bg-red-500/20 border border-red-500/30 hover:bg-red-500 text-white py-4 rounded-xl font-black text-2xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.1)]">−</button>
                                            <button onClick={handleCountdownAdd} className="flex-1 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500 text-white py-4 rounded-xl font-black text-2xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(16,185,129,0.1)]">+</button>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={handleCountdownPause} className="flex-1 bg-amber-500/20 border border-amber-500/30 hover:bg-amber-600 text-white py-4 rounded-xl font-extrabold transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.1)]">Pause/Resume</button>
                                            <button onClick={handleCountdownReset} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-extrabold transition-all hover:scale-[1.02]">Reset</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                     {activeTab === 'schedule' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            {/* Sticky Header with Frosted Glass Background and Actions */}
                            <div className="sticky -top-6 md:-top-10 z-30 bg-brand-surface/90 backdrop-blur-md pt-6 md:pt-10 pb-4 mb-6 border-b border-white/5 -mx-6 px-6 sm:-mx-10 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                        <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Schedule Manager</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">Upload and manage your stream schedule poster image.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={() => handleUpdateSchedule()} 
                                        disabled={loading}
                                        className="flex-1 sm:flex-initial bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Schedule'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="bg-black/20 p-6 rounded-3xl border border-white/5">
                                        <ImageUploader 
                                            onUploadSuccess={setNewScheduleUrl} 
                                            initialUrl={newScheduleUrl}
                                            dropzoneClassName="min-h-[450px] md:min-h-[600px] w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'goals_editor' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            {/* Goals */}
                            <div>
                                {/* Sticky Header with Frosted Glass Background and Actions */}
                                <div className="sticky -top-6 md:-top-10 z-30 bg-brand-surface/90 backdrop-blur-md pt-6 md:pt-10 pb-4 mb-6 border-b border-white/5 -mx-6 px-6 sm:-mx-10 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                            <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Goals Roadmap</span>
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1">Manage subathon and stream-milestone goals, visibility, and rewards.</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <button 
                                            onClick={addGoal} 
                                            className="flex-1 sm:flex-initial bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span>Add New Goal</span>
                                        </button>
                                        <button 
                                            onClick={handleSaveGoals} 
                                            className="flex-1 sm:flex-initial bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-sm"
                                        >
                                            Save Goals
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Header labels for Desktop View */}
                                    {localGoals.length > 0 && (
                                        <div className="hidden sm:flex items-center gap-4 px-4 py-3.5 bg-black/80 rounded-xl border border-white/10 text-[11px] uppercase font-extrabold text-white tracking-widest mb-1 shadow-md">
                                            <div className="w-8 shrink-0 text-center text-gray-400 font-black">#</div>
                                            <div className="w-28 shrink-0 text-center text-brand-primary font-black">NB Count</div>
                                            <div className="flex-1 font-black">Reward Description</div>
                                            <div className="w-28 shrink-0 text-center font-black">Visibility</div>
                                            <div className="w-12 shrink-0 text-center font-black">Delete</div>
                                        </div>
                                    )}

                                    {localGoals.length === 0 ? (
                                        <div className="text-center py-16 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                            <p className="text-gray-400 font-bold">No goals added yet.</p>
                                            <button onClick={addGoal} className="mt-4 bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all">
                                                Create First Goal
                                            </button>
                                        </div>
                                    ) : (
                                        localGoals.map((goal, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row gap-3 sm:items-center bg-white/5 backdrop-blur-xl p-3.5 sm:p-3 rounded-xl border border-white/5 group hover:bg-white/10 hover:border-white/10 transition-all duration-200 shadow-sm">
                                                {/* Index Badge */}
                                                <div className="hidden sm:flex w-8 shrink-0 items-center justify-center font-mono text-xs text-gray-500 font-bold bg-black/40 rounded-lg h-8 border border-white/5">
                                                    {i + 1}
                                                </div>
                                                
                                                {/* Goal count */}
                                                <div className="w-full sm:w-28 shrink-0 flex items-center gap-2">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold w-16">NB Count:</span>
                                                    <input 
                                                        type="number" 
                                                        value={goal.count} 
                                                        onChange={(e) => updateGoal(i, 'count', parseInt(e.target.value))} 
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-center font-mono text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                    />
                                                </div>

                                                {/* Goal reward description */}
                                                <div className="flex-1 w-full flex items-center gap-2">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold w-16">Reward:</span>
                                                    <input 
                                                        type="text" 
                                                        value={goal.reward} 
                                                        onChange={(e) => updateGoal(i, 'reward', e.target.value)} 
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" 
                                                        placeholder="Enter reward description..."
                                                    />
                                                </div>

                                                {/* Redesigned Secret Toggler (eye/eye-off) */}
                                                <div className="w-full sm:w-28 shrink-0 flex items-center justify-between sm:justify-center gap-2">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold">Secret?</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateGoal(i, 'secret', !goal.secret)}
                                                        className={`w-full sm:w-auto px-3.5 py-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 text-xs font-bold tracking-wide ${
                                                            goal.secret 
                                                                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/40' 
                                                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40'
                                                        }`}
                                                    >
                                                        {goal.secret ? (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                                </svg>
                                                                <span>Secret</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                </svg>
                                                                <span>Public</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Redesigned Crimson Delete Button */}
                                                <div className="w-full sm:w-12 shrink-0 flex items-center justify-between sm:justify-center">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold">Actions</span>
                                                    <button 
                                                        onClick={() => removeGoal(i)} 
                                                        className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center shrink-0 w-full sm:w-10 h-10"
                                                        title="Delete Goal"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'wheel_editor' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            {/* Wheel Settings */}
                            <div>
                                {/* Sticky Header with Frosted Glass Background and Actions */}
                                <div className="sticky -top-6 md:-top-10 z-30 bg-brand-surface/90 backdrop-blur-md pt-6 md:pt-10 pb-4 mb-6 border-b border-white/5 -mx-6 px-6 sm:-mx-10 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                            <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Wheel Items</span>
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1">Configure rewards and their respective weights on the wheel spin dashboard.</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="hidden md:flex items-center gap-2 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-gray-400 font-extrabold tracking-wider">
                                            <span>TOTAL WEIGHT:</span>
                                            <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-sm">{totalWheelWeight}</span>
                                        </div>
                                        <button 
                                            onClick={addWheelItem} 
                                            className="flex-1 sm:flex-initial bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                            </svg>
                                            <span>Add Item</span>
                                        </button>
                                        <button 
                                            onClick={handleSaveWheel} 
                                            className="flex-1 sm:flex-initial bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-sm"
                                        >
                                            Save Wheel
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {/* Header labels for Desktop View */}
                                    {localWheel.length > 0 && (
                                        <div className="hidden sm:flex items-center gap-4 px-4 py-3.5 bg-black/80 rounded-xl border border-white/10 text-[11px] uppercase font-extrabold text-white tracking-widest mb-1 shadow-md">
                                            <div className="w-8 shrink-0 text-center text-gray-400 font-black">#</div>
                                            <div className="flex-1 font-black">Reward / Label</div>
                                            <div className="w-28 shrink-0 text-center text-brand-primary font-black">Weight</div>
                                            <div className="w-12 shrink-0 text-center font-black">Delete</div>
                                        </div>
                                    )}

                                    {localWheel.length === 0 ? (
                                        <div className="text-center py-16 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                                            <p className="text-gray-400 font-bold">No wheel items configured yet.</p>
                                            <button onClick={addWheelItem} className="mt-4 bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all">
                                                Add First Item
                                            </button>
                                        </div>
                                    ) : (
                                        localWheel.map((item, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row gap-3 sm:items-center bg-white/5 backdrop-blur-xl p-3.5 sm:p-3 rounded-xl border border-white/5 group hover:bg-white/10 hover:border-white/10 transition-all duration-200 shadow-sm">
                                                {/* Index Badge */}
                                                <div className="hidden sm:flex w-8 shrink-0 items-center justify-center font-mono text-xs text-gray-500 font-bold bg-black/40 rounded-lg h-8 border border-white/5">
                                                    {i + 1}
                                                </div>
                                                
                                                {/* Reward description / Label */}
                                                <div className="flex-1 w-full flex items-center gap-2">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold w-16">Label:</span>
                                                    <input 
                                                        type="text" 
                                                        value={item.label} 
                                                        onChange={(e) => updateWheelItem(i, 'label', e.target.value)} 
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all" 
                                                        placeholder="Enter item description..."
                                                    />
                                                </div>

                                                {/* Weight count */}
                                                <div className="w-full sm:w-28 shrink-0 flex items-center gap-2">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold w-16">Weight:</span>
                                                    <input 
                                                        type="number" 
                                                        value={item.weight} 
                                                        onChange={(e) => updateWheelItem(i, 'weight', parseInt(e.target.value))} 
                                                        className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white text-center font-mono text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                                        placeholder="0"
                                                    />
                                                </div>

                                                {/* Redesigned Crimson Delete Button */}
                                                <div className="w-full sm:w-12 shrink-0 flex items-center justify-between sm:justify-center">
                                                    <span className="sm:hidden text-xs text-gray-400 font-bold">Actions</span>
                                                    <button 
                                                        onClick={() => removeWheelItem(i)} 
                                                        className="p-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] flex items-center justify-center shrink-0 w-full sm:w-10 h-10"
                                                        title="Delete Item"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {localWheel.length > 0 && (
                                        <div className="md:hidden flex justify-end items-center gap-2 px-4 py-3 bg-black/40 rounded-xl border border-white/5 text-xs text-gray-400 font-extrabold tracking-wider mt-4">
                                            <span>TOTAL WEIGHT:</span>
                                            <span className="text-white font-mono bg-white/10 px-2 py-0.5 rounded text-sm">{totalWheelWeight}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            {/* Sticky Header with Frosted Glass Background and Actions */}
                            <div className="sticky -top-6 md:-top-10 z-30 bg-brand-surface/90 backdrop-blur-md pt-6 md:pt-10 pb-4 mb-6 border-b border-white/5 -mx-6 px-6 sm:-mx-10 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                        <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Profile Editor</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">Edit your about me card and credits!</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {profileStatus && (
                                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${profileStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                            {profileStatus.message}
                                        </span>
                                    )}
                                    <button 
                                        onClick={() => handleSaveProfile()} 
                                        disabled={loading}
                                        className="flex-1 sm:flex-initial bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>

                            {/* Section 1: Dynamic Profile Avatar */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                                <div className="border-b border-white/5 pb-4">
                                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                        <span className="text-brand-primary">●</span> Profile Display Picture
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">Upload your profile picture.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                                    {/* Preview container */}
                                    <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl border border-white/5 relative group">
                                        <div className="relative w-36 h-36 rounded-full p-1 bg-brand-surface border-2 border-brand-primary/50 group-hover:border-brand-primary transition-all duration-300 shadow-xl overflow-hidden">
                                            {localAvatar ? (
                                                <img src={localAvatar} alt="Profile Preview" className="w-full h-full object-cover rounded-full" />
                                            ) : (
                                                <div className="w-full h-full bg-white/5 rounded-full flex items-center justify-center text-xs text-gray-500">No Image</div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 rounded-2xl bg-brand-primary/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                                        <span className="text-[10px] text-brand-primary font-mono uppercase tracking-wider mt-4">Live Preview</span>
                                    </div>

                                    {/* Uploader container */}
                                    <div className="md:col-span-8">
                                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                                            <label className="block text-brand-primary text-[10px] uppercase font-extrabold tracking-[0.2em] mb-4">Upload New Image</label>
                                            <ImageUploader 
                                                onUploadSuccess={setLocalAvatar} 
                                                initialUrl={localAvatar}
                                                dropzoneClassName="min-h-[140px] w-full"
                                                hidePreview={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: About Section */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                                <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                            <span className="text-brand-primary">●</span> About Bio Cards
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">Edit your bio cards.</p>
                                    </div>
                                    <button 
                                        onClick={addAboutItem} 
                                        className="bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 hover:border-brand-primary text-brand-primary font-extrabold py-2 px-4 rounded-xl transition-all hover:scale-105 text-xs flex items-center gap-2"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                        <span>Add Section</span>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {localAbout.length === 0 ? (
                                        <div className="text-center py-12 bg-black/25 rounded-2xl border border-white/5 text-gray-500 text-sm">
                                            No About sections added yet. Click the button above to add one.
                                        </div>
                                    ) : (
                                        localAbout.map((item, i) => (
                                            <div key={item.id} className="bg-black/35 p-6 rounded-2xl border border-white/5 relative group transition-all duration-300 hover:border-white/15">
                                                <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-4">
                                                    <input 
                                                        type="text" 
                                                        value={item.title} 
                                                        onChange={(e) => updateAboutItem(i, 'title', e.target.value)} 
                                                        className="w-full bg-transparent font-black text-xl text-white border-b border-transparent focus:border-brand-primary outline-none transition-colors pb-1" 
                                                        placeholder="e.g. Lore, Stream Rules, Gear" 
                                                    />
                                                    <button 
                                                        onClick={() => removeAboutItem(i)} 
                                                        className="text-red-500/40 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-all flex items-center justify-center shrink-0"
                                                        title="Delete Section"
                                                    >
                                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                                    </button>
                                                </div>
                                                <div className="bg-black/40 rounded-xl p-2 border border-white/5">
                                                    <RichTextEditor value={item.text} onChange={(val) => updateAboutItem(i, 'text', val)} />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Section 3: Credits Section */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
                                <div className="border-b border-white/5 pb-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                                            <span className="text-brand-primary">●</span> Credits & Roles
                                        </h3>
                                        <p className="text-xs text-gray-400 mt-1">Edit credits section.</p>
                                    </div>
                                    <button 
                                        onClick={addCreditItem} 
                                        className="bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 hover:border-brand-primary text-brand-primary font-extrabold py-2 px-4 rounded-xl transition-all hover:scale-105 text-xs flex items-center gap-2"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                                        <span>Add Credit</span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {localCredits.length === 0 ? (
                                        <div className="col-span-full text-center py-12 bg-black/25 rounded-2xl border border-white/5 text-gray-500 text-sm">
                                            No credits added yet. Click the button above to start crediting.
                                        </div>
                                    ) : (
                                        localCredits.map((credit, i) => (
                                            <div key={credit.id} className="bg-black/25 hover:bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all relative group/card">
                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => removeCreditItem(i)} 
                                                    className="absolute -top-2.5 -right-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white rounded-full p-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 shadow-lg scale-90 hover:scale-100 flex items-center justify-center z-10"
                                                    title="Delete Credit"
                                                >
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                                </button>
 
                                                {/* Credit Meta Details */}
                                                <div className="flex gap-4 items-start">
                                                    {/* Avatar preview and uploader on the left */}
                                                    <div className="flex flex-col items-center gap-2 shrink-0">
                                                        <div className="w-16 h-16 bg-black/40 rounded-full overflow-hidden border-2 border-white/10 shadow-inner flex items-center justify-center relative">
                                                            {credit.image ? (
                                                                <img src={credit.image} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: credit.color || '#e5383b' }}>
                                                                    {credit.name ? credit.name[0].toUpperCase() : '?'}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ImageUploader 
                                                            onUploadSuccess={(url) => updateCreditItem(i, 'image', url)} 
                                                            compact={true}
                                                            alwaysShowIcon={true}
                                                            className="shrink-0"
                                                            initialUrl={credit.image}
                                                        />
                                                    </div>
 
                                                    {/* Inputs on the right */}
                                                    <div className="flex-1 min-w-0 space-y-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Name</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={credit.name} 
                                                                    onChange={(e) => updateCreditItem(i, 'name', e.target.value)} 
                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-brand-primary outline-none transition-colors" 
                                                                    placeholder="e.g. Rimu" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Role / Contribution</label>
                                                                <input 
                                                                    type="text" 
                                                                    value={credit.role} 
                                                                    onChange={(e) => updateCreditItem(i, 'role', e.target.value)} 
                                                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-brand-primary text-sm font-semibold focus:border-brand-primary outline-none transition-colors" 
                                                                    placeholder="e.g. Live2D Artist" 
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">Social Link</label>
                                                            <input 
                                                                type="text" 
                                                                value={credit.link || ''} 
                                                                onChange={(e) => updateCreditItem(i, 'link', e.target.value)} 
                                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-primary outline-none transition-colors font-mono" 
                                                                placeholder="https://twitter.com/..." 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gallery' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
                            {/* Sticky Header with Frosted Glass Background and Actions */}
                            <div className="sticky -top-6 md:-top-10 z-30 bg-brand-surface/90 backdrop-blur-md pt-6 md:pt-10 pb-4 mb-6 border-b border-white/5 -mx-6 px-6 sm:-mx-10 sm:px-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                                        <span className="text-brand-primary drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Art Gallery</span>
                                    </h2>
                                    <p className="text-xs text-gray-400 mt-1">Manage artist collections, upload artworks, and reorder artwork grids.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <button 
                                        onClick={addArtist} 
                                        className="flex-1 sm:flex-initial bg-white/5 hover:bg-white/10 border border-white/10 text-white font-extrabold py-3 px-6 rounded-xl transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        <span>Add New Artist Collection</span>
                                    </button>
                                    <button 
                                        onClick={() => handleSaveProfile('artworks')} 
                                        className="flex-1 sm:flex-initial bg-brand-primary hover:bg-red-600 text-white font-extrabold py-3 px-8 rounded-xl transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.3)] text-sm"
                                    >
                                        Save Gallery
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {localArtworks.length === 0 ? (
                                    <div className="text-center py-24 bg-white/5 border border-dashed border-white/10 rounded-3xl">
                                        <p className="text-gray-400 font-bold text-lg">No artist collections added yet.</p>
                                        <button onClick={addArtist} className="mt-4 bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-105">
                                            Create First Collection
                                        </button>
                                    </div>
                                ) : (
                                    localArtworks.map((artist, i) => (
                                            <div key={artist.id} id={`artist-collection-${artist.id}`} className="bg-brand-surface/60 backdrop-blur-xl p-6 rounded-3xl border border-white/5 relative group hover:bg-white/5 transition-all duration-300 shadow-xl space-y-6">
                                            {/* Card Header */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
                                                    <div>
                                                        <label className="block text-brand-primary text-[9px] uppercase font-extrabold tracking-wider mb-1.5">Artist Name</label>
                                                        <input 
                                                            type="text" 
                                                            value={artist.artistName} 
                                                            onChange={(e) => updateArtistName(i, e.target.value)} 
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white font-black text-base focus:border-brand-primary outline-none transition-colors" 
                                                            placeholder="Artist Name" 
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-brand-primary text-[9px] uppercase font-extrabold tracking-wider mb-1.5">Social Link</label>
                                                        <input 
                                                            type="text" 
                                                            value={artist.artistLink || ''} 
                                                            onChange={(e) => updateArtistLink(i, e.target.value)} 
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-gray-300 font-medium text-sm focus:border-brand-primary outline-none transition-colors" 
                                                            placeholder="Artist Social Link" 
                                                        />
                                                    </div>
                                                </div>
                                                
                                                {/* Reordering & Actions */}
                                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                                    <button 
                                                        onClick={() => moveArtist(i, 'up')} 
                                                        disabled={i === 0}
                                                        className="bg-white/5 hover:bg-white/10 text-white rounded-xl p-2.5 transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                                                        title="Move Artist Up"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="m18 15-6-6-6 6"/>
                                                        </svg>
                                                    </button>
                                                    <button 
                                                        onClick={() => moveArtist(i, 'down')} 
                                                        disabled={i === localArtworks.length - 1}
                                                        className="bg-white/5 hover:bg-white/10 text-white rounded-xl p-2.5 transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
                                                        title="Move Artist Down"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="m6 9 6 6 6-6"/>
                                                        </svg>
                                                    </button>
                                                    <div className="w-px h-6 bg-white/10 mx-1"></div>
                                                    <button 
                                                        onClick={() => removeArtist(i)} 
                                                        className="bg-red-600/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white rounded-xl p-2.5 transition-all hover:scale-105"
                                                        title="Delete Artist Collection"
                                                    >
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
 
                                            {/* Artwork Images section */}
                                            <div>
                                                <label className="block text-brand-primary text-[10px] uppercase font-extrabold tracking-[0.2em] mb-3">Masterpieces / Artworks ({artist.images.length})</label>
                                                
                                                {artist.images.length === 0 ? (
                                                    <div className="text-center py-8 bg-black/20 rounded-2xl border border-dashed border-white/5 mb-4 text-gray-500 text-xs font-bold">
                                                        No artworks in this collection yet. Use the uploader below to add images!
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-4">
                                                        {artist.images.map((img, imgIdx) => (
                                                            <div 
                                                                key={imgIdx} 
                                                                draggable
                                                                onDragStart={(e) => handleArtworkDragStart(e, i, imgIdx)}
                                                                onDragOver={(e) => handleArtworkDragOver(e, i, imgIdx)}
                                                                onDragEnd={handleArtworkDragEnd}
                                                                onDrop={(e) => handleArtworkDrop(e, i, imgIdx)}
                                                                className={`relative group/img aspect-square rounded-2xl overflow-hidden border transition-all shadow-md bg-black/40 cursor-grab active:cursor-grabbing
                                                                    ${draggedArtwork?.artistIndex === i && draggedArtwork?.imgIndex === imgIdx ? 'opacity-30 border-dashed border-brand-primary scale-95' : 'border-white/10 hover:border-brand-primary/50'}
                                                                    ${dragOverArtwork?.artistIndex === i && dragOverArtwork?.imgIndex === imgIdx && !(draggedArtwork?.artistIndex === i && draggedArtwork?.imgIndex === imgIdx) ? 'border-brand-primary scale-105 ring-2 ring-brand-primary/50' : ''}
                                                                `}
                                                            >
                                                                <img src={img} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 pointer-events-none" />
                                                                
                                                                {/* Overlay Actions */}
                                                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col justify-between p-2 backdrop-blur-[2px]">
                                                                    {/* Top row: Delete */}
                                                                    <div className="flex justify-end">
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => removeImageFromArtist(i, imgIdx)} 
                                                                            className="bg-red-600 hover:bg-red-500 text-white rounded-lg p-1.5 transition-all shadow-md hover:scale-110"
                                                                            title="Remove Artwork"
                                                                        >
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                    
                                                                    {/* Bottom row: Rearrange Left/Right */}
                                                                    <div className="flex justify-between gap-1 mt-auto">
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => moveArtwork(i, imgIdx, 'left')} 
                                                                            disabled={imgIdx === 0}
                                                                            className="bg-white/15 hover:bg-white/30 text-white rounded-lg p-1.5 disabled:opacity-20 disabled:hover:bg-white/15 transition-all hover:scale-110 flex-1 flex items-center justify-center"
                                                                            title="Move Left"
                                                                        >
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="m15 18-6-6 6-6"/>
                                                                            </svg>
                                                                        </button>
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => moveArtwork(i, imgIdx, 'right')} 
                                                                            disabled={imgIdx === artist.images.length - 1}
                                                                            className="bg-white/15 hover:bg-white/30 text-white rounded-lg p-1.5 disabled:opacity-20 disabled:hover:bg-white/15 transition-all hover:scale-110 flex-1 flex items-center justify-center"
                                                                            title="Move Right"
                                                                        >
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                                <path d="m9 18 6-6-6-6"/>
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Upload & Add */}
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                                                {/* Direct URL Box */}
                                                <div className="lg:col-span-4 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                    <label className="block text-brand-primary text-[9px] uppercase font-extrabold tracking-wider mb-2">Direct Image URL</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Paste link & press Enter..." 
                                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all font-mono" 
                                                        onKeyDown={(e) => { 
                                                            if (e.key === 'Enter') { 
                                                                addImageToArtist(i, e.currentTarget.value); 
                                                                e.currentTarget.value = ''; 
                                                            } 
                                                        }} 
                                                    />
                                                </div>

                                                {/* Upload Files Box */}
                                                <div className="lg:col-span-8 bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                                    <label className="block text-brand-primary text-[9px] uppercase font-extrabold tracking-wider mb-2">Upload Files (Supports Multiple Files)</label>
                                                    <ImageUploader 
                                                        onUploadSuccess={(url) => addImageToArtist(i, url)} 
                                                        hidePreview={true}
                                                        multiple={true}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'minecraft' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-center bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl">
                                <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                                    <span className="text-brand-primary"><AdminIcons.Game /></span> Minecraft Dashboard
                                </h2>
                                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Sync</span>
                                </div>
                            </div>

                            {/* PENDING */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="font-black text-white text-2xl mb-8 flex items-center gap-3 tracking-tight">
                                    <span className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.5)]"></span>
                                    Pending Applications ({whitelistApps.length})
                                </h3>

                                {whitelistApps.length === 0 ? (
                                    <div className="text-center py-16 bg-black/20 rounded-3xl border border-white/5 border-dashed">
                                        <div className="text-gray-500 font-bold text-lg">No pending applications at the moment.</div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {whitelistApps.map((app) => (
                                            <div key={app._id} className="bg-black/20 border border-white/5 rounded-3xl p-6 flex flex-col gap-5 group hover:bg-white/5 transition-colors shadow-lg relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                                                <div className="flex items-center gap-4">
                                                    <img src={app.discordAvatar} alt="Disc" className="w-14 h-14 rounded-full border-2 border-white/10 shadow-inner" />
                                                    <div className="min-w-0">
                                                        <div className="text-lg font-black text-white truncate">{app.discordUsername}</div>
                                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">Applied {new Date(app.appliedAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>

                                                {/* Accounts Grid */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 min-w-0">
                                                        <img src={`https://mc-heads.net/avatar/${app.minecraftUsername}/32`} alt="MC" className="w-6 h-6 rounded shadow-sm shrink-0" />
                                                        <div className="min-w-0 flex flex-col">
                                                            <span className="text-[9px] text-brand-primary font-extrabold uppercase tracking-wider leading-none">Minecraft</span>
                                                            <span className="font-mono text-sm text-white font-bold truncate leading-snug mt-0.5" title={app.minecraftUsername}>{app.minecraftUsername}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-xl border border-white/5 min-w-0">
                                                        {app.twitchAvatar ? (
                                                            <img src={app.twitchAvatar} alt="Twitch" className="w-6 h-6 rounded-full shrink-0" referrerPolicy="no-referrer" />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                                                                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div className="min-w-0 flex flex-col">
                                                            <span className="text-[9px] text-purple-400 font-extrabold uppercase tracking-wider leading-none">Twitch</span>
                                                            <span className="font-sans text-sm text-white font-bold truncate leading-snug mt-0.5" title={app.twitchUsername || 'Linked'}>{app.twitchUsername || 'Linked'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                                                    <button onClick={() => handleApproveApp(app._id)} className="bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600 text-emerald-400 hover:text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]">APPROVE</button>
                                                    <button onClick={() => handleRejectApp(app._id)} className="bg-red-600/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">REJECT</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* APPROVED */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                                    <h3 className="font-black text-white text-2xl tracking-tight">Approved Users ({approvedApps.length})</h3>
                                    <input
                                        type="text"
                                        placeholder="Search User..."
                                        className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-sm font-medium text-white focus:border-brand-primary outline-none w-full md:w-80 transition-colors shadow-inner"
                                        value={approvedSearch}
                                        onChange={(e) => setApprovedSearch(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                                    <div className="max-h-[400px] overflow-y-auto overflow-x-auto custom-scrollbar">
                                        <table className="w-full min-w-[600px] text-left text-sm text-gray-400 relative">
                                            <thead className="text-xs uppercase bg-black/60 text-gray-300 sticky top-0 z-10 backdrop-blur-md">
                                                <tr>
                                                    <th className="px-6 py-4 font-black tracking-widest">User Details</th>
                                                    <th className="px-6 py-4 font-black tracking-widest">Approved Date</th>
                                                    <th className="px-6 py-4 font-black tracking-widest text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredApprovedApps.map((app) => (
                                                    <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="relative w-12 h-12 shrink-0">
                                                                    <img src={app.discordAvatar} className="w-12 h-12 rounded-full border-2 border-white/10 object-cover shadow-sm group-hover:border-brand-primary/50 transition-colors" />
                                                                    <div className="absolute -bottom-1 -right-1 bg-[#1a0b0e] rounded-md p-1 border border-white/10 shadow-lg">
                                                                        <img src={`https://mc-heads.net/avatar/${app.minecraftUsername}/20`} className="w-5 h-5 object-contain rounded-sm" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-bold text-white text-base truncate">{app.discordUsername}</span>
                                                                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                        <span className="font-mono text-[10px] text-brand-primary font-bold truncate bg-brand-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                            <span className="text-[8px] uppercase font-sans tracking-wider font-extrabold text-brand-primary/60">MC:</span> {app.minecraftUsername}
                                                                        </span>
                                                                        {app.twitchUsername && (
                                                                            <span className="font-sans text-[10px] text-purple-400 font-bold truncate bg-purple-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                                <span className="text-[8px] uppercase tracking-wider font-extrabold text-purple-400/60">Twitch:</span> {app.twitchUsername}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-400">{app.approvedAt ? new Date(app.approvedAt).toLocaleDateString() : '-'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => handleRevokeApp(app._id, app.minecraftUsername)} className="text-red-500 bg-red-500/10 border border-red-500/20 hover:text-white hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all opacity-50 group-hover:opacity-100 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">REVOKE</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredApprovedApps.length === 0 && (
                                                    <tr><td colSpan={3} className="text-center py-16 font-bold text-gray-500">No users found matching "{approvedSearch}".</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* BINGO CONFIGURATION */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="font-black text-white text-2xl mb-8 tracking-tight">Bingo Configuration</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end bg-black/20 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-[0.2em] block">Active Card ID</label>
                                        <input type="text" value={bingoCardId} onChange={e => setBingoCardId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-mono text-xl focus:border-brand-primary outline-none transition-colors" placeholder="WEEK1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-brand-primary font-extrabold uppercase tracking-[0.2em] block">Win Condition Text</label>
                                        <input type="text" value={bingoWinCondition} onChange={e => setBingoWinCondition(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white text-xl focus:border-brand-primary outline-none transition-colors" placeholder="1 Line" />
                                    </div>
                                    <button onClick={handleSaveBingoConfig} className="bg-brand-primary hover:bg-red-600 text-white font-extrabold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.3)] md:col-span-2 mt-4">Update Config</button>
                                </div>
                            </div>

                            {/* BINGO WINNERS MANAGEMENT (NEW) */}
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="font-black text-white text-2xl mb-8 tracking-tight">Bingo Winners Management</h3>

                                {/* Add Winner Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8 bg-black/20 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Discord ID</label>
                                        <input type="text" value={winDiscordId} onChange={e => setWinDiscordId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors" placeholder="12345..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Minecraft Name</label>
                                        <input type="text" value={winUsername} onChange={e => setWinUsername(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors" placeholder="Steve" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Card ID</label>
                                        <input type="text" value={winCardId} onChange={e => setWinCardId(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm font-mono focus:border-brand-primary outline-none transition-colors" placeholder="WEEK1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Lines</label>
                                        <input type="number" value={winLines} onChange={e => setWinLines(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm focus:border-brand-primary outline-none transition-colors" min="1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Date</label>
                                        <input type="date" value={winDate} onChange={e => setWinDate(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm [color-scheme:dark] focus:border-brand-primary outline-none transition-colors" />
                                    </div>
                                    <div className="flex items-end">
                                        <button onClick={handleAddWinner} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-lg text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02]">ADD WINNER</button>
                                    </div>
                                </div>

                                {/* Winners List */}
                                <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                    {bingoWinners.map((winner) => (
                                        <div key={winner._id} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <span className="font-mono text-sm text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg font-bold border border-brand-primary/20">#{winner.cardId}</span>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-base">{winner.minecraftUsername}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-wider">{winner.discordId}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-sm font-black text-white">{winner.linesCompleted} Lines</span>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(winner.completedAt).toLocaleDateString()}</span>
                                                </div>
                                                <button onClick={() => handleDeleteWinner(winner._id)} className="text-red-500 bg-red-500/10 border border-red-500/20 hover:text-white font-bold text-xs px-3 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-sm opacity-50 group-hover:opacity-100">DEL</button>
                                            </div>
                                        </div>
                                    ))}
                                    {bingoWinners.length === 0 && <div className="text-center bg-black/20 rounded-2xl border border-white/5 border-dashed text-gray-500 py-12 font-bold">No winners recorded yet.</div>}
                                </div>
                            </div>

                            {/* DANGER ZONE: MINECRAFT DATABASE MAINTENANCE */}
                            <div className="bg-red-950/20 backdrop-blur-3xl p-8 rounded-3xl border border-red-500/20 shadow-2xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-red-500 text-3xl">⚠️</span>
                                    <div>
                                        <h3 className="font-black text-white text-2xl tracking-tight">Danger Zone: Minecraft & Tournament Data Wipe</h3>
                                        <p className="text-sm text-gray-400 mt-1">Permanently reset and wipe legacy season data, player inventories, and wallets.</p>
                                    </div>
                                </div>

                                {wipeStatus && (
                                    <div className={`p-4 rounded-xl border mb-6 font-semibold text-sm ${
                                        wipeStatus.type === 'success' 
                                            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400' 
                                            : 'bg-red-950/40 border-red-500/30 text-red-400'
                                    }`}>
                                        {wipeStatus.message}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {/* Clear Inventories */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Player Inventories</h4>
                                            <p className="text-xs text-gray-500 mt-1">Clears out all users' collected items, Pokémons, and rewards in their Minecraft web inventory.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('inventory')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE INVENTORIES
                                        </button>
                                    </div>

                                    {/* Clear Currencies */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Key Wallets (Currency)</h4>
                                            <p className="text-xs text-gray-500 mt-1">Resets lamb and steak key balances for all users to 0, resetting currency state completely.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('currency')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE CURRENCY
                                        </button>
                                    </div>

                                    {/* Clear Approved Users */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Approved Whitelists</h4>
                                            <p className="text-xs text-gray-500 mt-1">Clears out all APPROVED users in the whitelist database. Pending applications will not be affected.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('approved_users')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE APPROVED USERS
                                        </button>
                                    </div>

                                    {/* Clear Bingo Boards */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Bingo Boards</h4>
                                            <p className="text-xs text-gray-500 mt-1">Clears all user-created active bingo board configurations, cell states, grids, and bingo winners.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('bingo')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE BINGO BOARDS
                                        </button>
                                    </div>

                                    {/* Clear Tournament Data */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Wipe Active Tournaments</h4>
                                            <p className="text-xs text-gray-500 mt-1">Removes team registrations, brackets, and active duos of non-archived seasons. Does not affect archived seasons.</p>
                                        </div>
                                        <button 
                                            onClick={() => handleWipeMinecraftData('tournament')} 
                                            disabled={isWiping}
                                            className="bg-red-600/10 border border-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm disabled:opacity-50"
                                        >
                                            WIPE ACTIVE TOURNAMENTS
                                        </button>
                                    </div>

                                    {/* Global Purge */}
                                    <div className="bg-red-950/10 border border-red-500/10 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-red-400 text-lg">Wipe All Previous Data</h4>
                                            <p className="text-xs text-gray-500 mt-1">Simultaneously purges inventories, key wallets, approved whitelists, bingo, and active tournament registrations.</p>
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            <input 
                                                type="text" 
                                                value={wipeConfirmText} 
                                                onChange={e => setWipeConfirmText(e.target.value)} 
                                                placeholder="Type 'WIPE' to confirm" 
                                                className="w-full bg-black/40 border border-red-500/20 focus:border-red-500 outline-none rounded-xl py-2 px-3 text-white text-center text-xs font-bold tracking-widest uppercase transition-colors"
                                            />
                                            <button 
                                                onClick={() => handleWipeMinecraftData('all')} 
                                                disabled={isWiping || wipeConfirmText !== 'WIPE'}
                                                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-950/20 disabled:text-red-500/40 text-white font-black py-3 rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)] disabled:shadow-none"
                                            >
                                                {isWiping ? 'WIPING DATABASES...' : 'EXECUTE COMPLETE PURGE'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tournament' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-white tracking-tight">Tournament Management</h2>
                            <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center min-h-[500px] text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-900/10 pointer-events-none"></div>
                                <div className="w-32 h-32 bg-purple-500/20 rounded-full flex items-center justify-center mb-8 text-purple-400 border-4 border-purple-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                                    <AdminIcons.Game className="w-16 h-16" />
                                </div>
                                <h3 className="text-4xl font-black text-white mb-4 tracking-tight">Tournament Admin Moved</h3>
                                <p className="text-gray-400 mb-10 max-w-lg text-lg">All tournament management features have been consolidated to a dedicated page for a focused workflow.</p>
                                <Link to="/admin/tournament" className="bg-purple-600 hover:bg-purple-500 text-white font-black py-5 px-10 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all hover:scale-105 border border-purple-400/50 text-xl group z-10">
                                    <span>Launch Tournament Admin</span>
                                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    )}

                    {activeTab === 'codes' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-white tracking-tight">Gacha Code Generator</h2>
                            
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="font-black text-white text-2xl mb-8 tracking-tight flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary">
                                        <AdminIcons.Game />
                                    </span>
                                    Generate New Codes
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-end bg-black/20 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Type</label>
                                        <select value={genType} onChange={e => setGenType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-primary outline-none transition-colors appearance-none">
                                            <option value="lamb">Lamb Crate Key</option>
                                            <option value="wagyu">Steak Crate Key</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Keys per Code</label>
                                        <input type="number" value={genKeyAmount} onChange={e => setGenKeyAmount(parseInt(e.target.value) || 1)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-primary outline-none transition-colors" min="1" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Qty of Codes</label>
                                        <input type="number" value={genAmount} onChange={e => setGenAmount(parseInt(e.target.value) || 1)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-primary outline-none transition-colors" min="1" max="50" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Usage Type</label>
                                        <select value={genUsageType} onChange={e => setGenUsageType(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-primary outline-none transition-colors appearance-none">
                                            <option value="once_global">One Use (Global)</option>
                                            <option value="once_per_user">Once Per User (Global)</option>
                                            <option value="time_limited">Time Limited (Unlimited)</option>
                                        </select>
                                    </div>
                                    {genUsageType === 'time_limited' && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Hours Valid</label>
                                            <input type="number" value={genHours} onChange={e => setGenHours(parseInt(e.target.value) || 1)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-primary outline-none transition-colors" min="1" />
                                        </div>
                                    )}
                                    <button onClick={handleGenerateCodes} className="bg-brand-primary hover:bg-red-600 text-white font-extrabold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(220,38,38,0.3)] lg:col-span-1">GENERATE</button>
                                </div>
                                {generatedCodes.length > 0 && (
                                    <div className="mt-8 bg-emerald-900/20 p-6 rounded-3xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
                                        <h4 className="text-emerald-400 font-black mb-4 tracking-tight flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                            New Codes Generated:
                                        </h4>
                                        <div className="flex flex-wrap gap-3">
                                            {generatedCodes.map(c => <code key={c} className="bg-black/40 px-4 py-2 rounded-xl text-emerald-300 font-mono font-bold border border-emerald-500/20 shadow-sm">{c}</code>)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="font-black text-white text-2xl mb-8 tracking-tight">Existing Codes (Recent 100)</h3>
                                <div className="rounded-3xl border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                                    <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
                                        <table className="w-full min-w-[800px] text-sm text-left text-gray-300 relative">
                                            <thead className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                                                <tr>
                                                    <th className="px-6 py-4">Code</th>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Key Qty</th>
                                                    <th className="px-6 py-4">Usage</th>
                                                    <th className="px-6 py-4">Redeemed</th>
                                                    <th className="px-6 py-4">Expires</th>
                                                    <th className="px-6 py-4 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {existingCodes.map(c => (
                                                    <tr key={c._id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-6 py-4 font-mono font-bold text-white text-base">{c.code}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm border ${c.type === 'lamb' ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'bg-pink-900/30 text-pink-300 border-pink-500/30'}`}>
                                                                {c.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-bold">{c.keyAmount}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{c.usageType.replace(/_/g, ' ')}</td>
                                                        <td className="px-6 py-4 font-bold">
                                                            <span className="bg-white/10 px-3 py-1 rounded-lg">{c.usageCount}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : 'NEVER'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => handleDeleteCode(c._id)} className="text-red-500 bg-red-500/10 border border-red-500/20 hover:text-white hover:bg-red-600 px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all opacity-50 group-hover:opacity-100 shadow-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]">DEL</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {existingCodes.length === 0 && (
                                                    <tr><td colSpan={7} className="text-center py-16 font-bold text-gray-500">No codes generated yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-white tracking-tight">User Management</h2>
                            
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <h3 className="font-black text-white text-2xl mb-6 tracking-tight flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                                    </span>
                                    Reset Daily Check-In
                                </h3>
                                <div className="flex flex-col md:flex-row gap-4 bg-black/20 p-6 rounded-3xl border border-white/5">
                                    <input type="text" placeholder="Discord ID or Minecraft Username" value={userQuery} onChange={e => setUserQuery(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-red-500 outline-none transition-colors shadow-inner" />
                                    <button onClick={handleResetDaily} className="bg-red-600/20 border border-red-500/30 hover:bg-red-600 text-red-400 hover:text-white font-extrabold py-4 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] whitespace-nowrap">RESET TIMER</button>
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                <h3 className="font-black text-white text-2xl mb-6 tracking-tight flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m8 6 4-4 4 4"/><path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22"/><path d="m20 22-5-5"/></svg>
                                    </span>
                                    User Merge Tool
                                </h3>
                                <p className="text-gray-400 font-medium mb-6">Merge data from a source user account into a target user account.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 bg-black/20 p-6 rounded-3xl border border-white/5">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Source Username</label>
                                        <input type="text" value={mergeSource} onChange={e => setMergeSource(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-orange-500 outline-none transition-colors shadow-inner" placeholder="OldUsername" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-gray-500 font-extrabold uppercase tracking-widest block">Target Username</label>
                                        <input type="text" value={mergeTarget} onChange={e => setMergeTarget(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-medium focus:border-orange-500 outline-none transition-colors shadow-inner" placeholder="NewUsername" />
                                    </div>
                                </div>
                                <button onClick={handleMergeUsers} className="w-full md:w-auto bg-orange-600/20 border border-orange-500/30 hover:bg-orange-600 text-orange-400 hover:text-white font-extrabold py-4 px-10 rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">MERGE DATA</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'merger' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-4xl font-black text-white tracking-tight">JSON Merger Tool</h2>
                            <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                <div className="bg-black/20 p-6 rounded-3xl border border-white/5 mb-8 border-dashed flex flex-col items-center justify-center min-h-[150px]">
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept=".json" 
                                        onChange={handleJsonUpload} 
                                        className="block w-full text-sm text-gray-400 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-black file:bg-brand-primary file:text-white hover:file:bg-red-600 file:transition-all file:cursor-pointer file:shadow-[0_0_15px_rgba(220,38,38,0.3)] mx-auto max-w-md" 
                                    />
                                    <p className="text-gray-500 text-sm mt-4 font-medium">Select multiple JSON files to merge them into a single object.</p>
                                </div>
                                <div className="relative group">
                                    <textarea 
                                        readOnly 
                                        value={mergedOutput} 
                                        className="w-full h-[500px] bg-black/60 border border-white/10 rounded-3xl p-6 font-mono text-sm text-brand-primary focus:outline-none focus:border-brand-primary transition-colors shadow-inner custom-scrollbar resize-none" 
                                        placeholder="// Merged output will appear here..." 
                                    />
                                    <button 
                                        onClick={() => navigator.clipboard.writeText(mergedOutput)} 
                                        className="absolute top-4 right-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-extrabold py-2 px-6 rounded-lg transition-all shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 disabled:hidden md:disabled:opacity-0" 
                                        disabled={!mergedOutput}
                                    >
                                        COPY JSON
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'snakes' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 bg-purple-500/20 border border-purple-500/30 rounded-2xl flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                    <AdminIcons.Snakes />
                                </div>
                                <div>
                                    <h2 className="text-4xl font-black text-white tracking-tight">Snakes & Ladders</h2>
                                    <p className="text-gray-400 font-medium">Manage events, simulate rolls, and configure special tiles.</p>
                                </div>
                            </div>

                            {/* Listener Control & Simulation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Listener Control */}
                                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <div className="mb-8">
                                        <h3 className="font-black text-white text-2xl tracking-tight mb-2">Listener Status</h3>
                                        <p className="font-medium text-gray-400">Controls whether new Subs/Gifts/Donations are accepted into the queue.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/toggle-listener`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ target: 'subs' })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setSnakesSubsActive(data.settings.subsActive);
                                                        setSnakesStatus({ type: 'success', message: `Subs/Gifts ${data.settings.subsActive ? 'ENABLED' : 'DISABLED'}` });
                                                        setTimeout(() => setSnakesStatus(null), 3000);
                                                    }
                                                } catch (e) { }
                                            }}
                                            className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 border ${snakesSubsActive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
                                        >
                                            <span className="text-xl">SUBS</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${snakesSubsActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                <span className="text-[10px] opacity-75">{snakesSubsActive ? 'ACTIVE' : 'STOPPED'}</span>
                                            </div>
                                        </button>

                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/toggle-listener`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ target: 'donations' })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        setSnakesDonosActive(data.settings.donationsActive);
                                                        setSnakesStatus({ type: 'success', message: `Donations ${data.settings.donationsActive ? 'ENABLED' : 'DISABLED'}` });
                                                        setTimeout(() => setSnakesStatus(null), 3000);
                                                    }
                                                } catch (e) { }
                                            }}
                                            className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-2 border ${snakesDonosActive ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]'}`}
                                        >
                                            <span className="text-xl">DONATIONS</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${snakesDonosActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                                <span className="text-[10px] opacity-75">{snakesDonosActive ? 'ACTIVE' : 'STOPPED'}</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Simulation Controls */}
                                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                    <h3 className="font-black text-white text-2xl tracking-tight mb-2">Simulate Events</h3>
                                    <p className="font-medium text-gray-400 mb-6">Test queue behavior safely.</p>

                                    <div className="flex gap-3 mb-6 bg-black/20 p-2 rounded-xl border border-white/5">
                                        <input
                                            type="text"
                                            placeholder="Target User (Optional)"
                                            value={snakesSimUser}
                                            onChange={(e) => setSnakesSimUser(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary font-medium text-sm transition-colors"
                                        />
                                        <input
                                            type="number"
                                            placeholder="#"
                                            value={snakesSimAmount}
                                            onChange={(e) => setSnakesSimAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-24 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary text-sm font-bold text-center transition-colors"
                                        />
                                        <input
                                            type="number"
                                            placeholder="$"
                                            value={snakesSimDonoAmount}
                                            onChange={(e) => setSnakesSimDonoAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                            className="w-24 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-emerald-400 focus:outline-none focus:border-emerald-500 text-sm font-bold text-center transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/simulate-event`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ type: 'subscriber', user: snakesSimUser || 'TestSub', amount: 1, tier: '1000' })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) setSnakesStatus({ type: 'success', message: 'Simulated Sub T1' });
                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                } catch (e) { }
                                            }}
                                            className="py-3 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl text-xs font-black tracking-widest hover:bg-purple-500/20 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                                        >
                                            SUB T1 (1)
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/simulate-event`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ type: 'subscriber', user: snakesSimUser || 'TestTier2', amount: 1, tier: '2000' })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) setSnakesStatus({ type: 'success', message: 'Simulated Sub T2' });
                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                } catch (e) { }
                                            }}
                                            className="py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-black tracking-widest hover:bg-blue-500/20 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                        >
                                            SUB T2 (2)
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/simulate-event`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ type: 'subscriber', user: snakesSimUser || 'TestTier3', amount: 1, tier: '3000' })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) setSnakesStatus({ type: 'success', message: 'Simulated Sub T3' });
                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                } catch (e) { }
                                            }}
                                            className="py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-xs font-black tracking-widest hover:bg-orange-500/20 transition-all hover:shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                        >
                                            SUB T3 (3)
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/simulate-event`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ type: 'gift', user: snakesSimUser || 'TestGifter', amount: snakesSimAmount })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) setSnakesStatus({ type: 'success', message: `Simulated Gift x${snakesSimAmount}` });
                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                } catch (e) { }
                                            }}
                                            className="py-3 bg-pink-500/10 border border-pink-500/30 text-pink-400 rounded-xl text-xs font-black tracking-widest hover:bg-pink-500/20 transition-all hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                        >
                                            GIFT ({snakesSimAmount})
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`${API_BASE_URL}/api/snakes/simulate-event`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json', Authorization: password },
                                                        body: JSON.stringify({ type: 'donation', user: snakesSimUser || 'TestDonation', amount: snakesSimDonoAmount })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) setSnakesStatus({ type: 'success', message: `Simulated Dono $${snakesSimDonoAmount}` });
                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                } catch (e) { }
                                            }}
                                            className="col-span-2 py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-black tracking-widest hover:bg-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                                        >
                                            <AdminIcons.EventDono />
                                            DONATE (${snakesSimDonoAmount})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Event Queue Log */}
                                <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl h-[500px] flex flex-col">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/5 pb-4">
                                        <h3 className="font-black text-white text-2xl tracking-tight flex items-center gap-3">
                                            <span className="text-purple-400 bg-purple-500/20 p-2 rounded-xl"><AdminIcons.EventLog /></span>
                                            Roll Queue ({snakesQueue.length})
                                        </h3>
                                        <input
                                            type="text"
                                            placeholder="Search User..."
                                            value={snakesQueueFilter}
                                            onChange={(e) => setSnakesQueueFilter(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white font-medium focus:border-purple-500 outline-none w-full md:w-48 transition-colors shadow-inner"
                                        />
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                        {snakesQueue
                                            .filter(q => snakesQueueFilter.trim() === '' || q.user.toLowerCase().includes(snakesQueueFilter.toLowerCase().trim()))
                                            .map((queueItem, idx) => (
                                                <div key={queueItem._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-white/5 transition-all gap-4 group shadow-sm">
                                                    <div className="flex items-center gap-4 overflow-hidden w-full sm:w-auto">
                                                        <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black text-sm shadow-inner">
                                                            {idx + 1}
                                                        </div>
                                                        <img
                                                            src={queueItem.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(queueItem.user)}&background=random`}
                                                            alt=""
                                                            className="shrink-0 w-10 h-10 rounded-full object-cover border-2 border-white/10"
                                                        />
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <div className="font-bold text-white text-base truncate">{queueItem.user}</div>
                                                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5 whitespace-normal sm:whitespace-nowrap">
                                                                <span className="text-purple-400">{queueItem.type}</span> • {new Date(queueItem.createdAt).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`${API_BASE_URL}/api/snakes/queue/${queueItem._id}`, {
                                                                    method: 'DELETE',
                                                                    headers: { Authorization: password }
                                                                });
                                                                fetchSnakesTiles();
                                                                setSnakesStatus({ type: 'success', message: `Removed roll from ${queueItem.user}` });
                                                                setTimeout(() => setSnakesStatus(null), 3000);
                                                            } catch (e) {
                                                                setSnakesStatus({ type: 'error', message: 'Failed to remove' });
                                                                setTimeout(() => setSnakesStatus(null), 3000);
                                                            }
                                                        }}
                                                        className="w-full sm:w-auto bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white border border-red-500/20 px-4 py-2 rounded-lg text-xs font-black tracking-wider transition-all opacity-100 sm:opacity-50 sm:group-hover:opacity-100 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] mt-2 sm:mt-0"
                                                    >
                                                        DEL
                                                    </button>
                                                </div>
                                            ))}
                                        {snakesQueue.length === 0 && (
                                            <div className="text-center text-gray-500 py-16 font-bold bg-black/20 rounded-2xl border border-white/5 border-dashed">No rolls in queue</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Add New Tile */}
                                    <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                                        <h3 className="font-black text-white text-xl mb-6 flex items-center gap-3 tracking-tight">
                                            <span className="w-8 h-8 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary font-black shadow-[0_0_15px_rgba(220,38,38,0.2)]">+</span>
                                            Add Special Tile
                                        </h3>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    placeholder="Tile #"
                                                    value={newSnakeTile}
                                                    onChange={(e) => setNewSnakeTile(e.target.value)}
                                                    className="w-24 bg-black/40 border border-white/10 rounded-xl p-3 text-white font-black text-center focus:outline-none focus:border-brand-primary transition-colors shadow-inner"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Event text (e.g., 'Do 10 pushups!')"
                                                    value={newSnakeText}
                                                    onChange={(e) => setNewSnakeText(e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white font-medium focus:outline-none focus:border-brand-primary transition-colors shadow-inner"
                                                />
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    if (!newSnakeTile || !newSnakeText) return;
                                                    try {
                                                        const res = await fetch(`${API_BASE_URL}/api/snakes/special-tiles`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json', Authorization: password },
                                                            body: JSON.stringify({ tile: parseInt(newSnakeTile), text: newSnakeText })
                                                        });
                                                        if (res.ok) {
                                                            setSnakesStatus({ type: 'success', message: 'Special tile added!' });
                                                            setNewSnakeTile('');
                                                            setNewSnakeText('');
                                                            fetchSnakesTiles();
                                                            setTimeout(() => setSnakesStatus(null), 3000);
                                                        } else {
                                                            setSnakesStatus({ type: 'error', message: 'Failed to add tile' });
                                                            setTimeout(() => setSnakesStatus(null), 3000);
                                                        }
                                                    } catch (e) {
                                                        setSnakesStatus({ type: 'error', message: 'Network error' });
                                                        setTimeout(() => setSnakesStatus(null), 3000);
                                                    }
                                                }}
                                                className="w-full bg-brand-primary/20 hover:bg-brand-primary border border-brand-primary/30 text-brand-primary hover:text-white font-black py-4 rounded-xl transition-all tracking-widest shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)]"
                                            >
                                                ADD TILE
                                            </button>
                                        </div>
                                    </div>

                                    {/* Existing Tiles */}
                                    <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[300px]">
                                        <h3 className="font-black text-white text-xl mb-6 tracking-tight">Current Tiles ({snakesTiles.length})</h3>
                                        {snakesTiles.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8 font-bold bg-black/20 rounded-2xl border border-white/5 border-dashed">No special tiles configured</p>
                                        ) : (
                                            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                                                {snakesTiles.map((tile) => (
                                                    <div key={tile._id} className="flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 shadow-sm hover:bg-white/5 transition-colors group">
                                                        <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                                            <span className="text-purple-400 font-black text-lg">#{tile.tile}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white text-sm font-medium truncate">{tile.text}</p>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                if (!confirm(`Delete special event for tile #${tile.tile}?`)) return;
                                                                try {
                                                                    await fetch(`${API_BASE_URL}/api/snakes/special-tiles/${tile.tile}`, {
                                                                        method: 'DELETE',
                                                                        headers: { Authorization: password }
                                                                    });
                                                                    fetchSnakesTiles();
                                                                    setSnakesStatus({ type: 'success', message: 'Tile removed!' });
                                                                    setTimeout(() => setSnakesStatus(null), 3000);
                                                                } catch (e) { }
                                                            }}
                                                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 hover:text-white rounded-lg text-xs font-black tracking-wider hover:bg-red-600 transition-all flex-shrink-0 opacity-50 group-hover:opacity-100 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                                                        >
                                                            DEL
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Link */}
                            <div className="text-center pt-8">
                                <Link to="/snakes" className="inline-flex items-center justify-center gap-3 bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-600 font-black py-4 px-10 rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] group text-lg tracking-wide">
                                    OPEN SNAKES & LADDERS BOARD
                                    <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default Admin;
