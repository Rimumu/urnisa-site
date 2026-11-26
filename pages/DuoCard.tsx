import React, { FC, SyntheticEvent, useEffect, useMemo, useState } from 'react';
import html2canvas from 'html2canvas';
import { 
    Download, 
    RefreshCw, 
    Search, 
    Users, 
    ArrowLeft, 
    Shield, 
    Layers, 
    ExternalLink,
    Copy,
    Check
} from 'lucide-react';
import { API_BASE_URL, IS_ADMIN_SUBDOMAIN, IS_PUBLIC_PROD_DOMAIN, TOURNAMENT_ADMIN_URL } from '../constants';
import { Link, useSearchParams } from 'react-router-dom';

interface Duo {
    duoId: string;
    seasonId?: number;
    teamName: string;
    player1Username: string;
    player2Username: string;
    player1DiscordId: string;
    player2DiscordId: string;
    captainDiscordId: string;
    isLocked?: boolean;
    createdAt?: string;
}

interface Season {
    seasonId: number;
    name: string;
    format: string;
    isArchived?: boolean;
}

const DuoCard: FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<number>(2);
    const [duos, setDuos] = useState<Duo[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cardTheme, setCardTheme] = useState<'midnight' | 'gold' | 'neon'>('midnight');
    const [cardStyle, setCardStyle] = useState<'standard' | 'banner'>('standard');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Load available seasons
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/tournament/seasons`);
                if (res.ok) {
                    const data: Season[] = await res.json();
                    setSeasons(data);
                    
                    const urlSeason = searchParams.get('seasonId');
                    if (urlSeason && !isNaN(parseInt(urlSeason))) {
                        setSelectedSeasonId(parseInt(urlSeason));
                    } else if (data.length > 0) {
                        const duoSeason = data.find(s => s.format?.includes('Duos')) || data[0];
                        setSelectedSeasonId(duoSeason.seasonId);
                    }
                }
            } catch (err) {
                console.error('Error fetching seasons:', err);
            }
        };
        fetchSeasons();
    }, []);

    // Load Duos for selected season
    const fetchDuosForSeason = async (seasonId: number) => {
        try {
            setRefreshing(true);
            const res = await fetch(`${API_BASE_URL}/api/tournament/duos?seasonId=${seasonId}`);
            if (res.ok) {
                const data: Duo[] = await res.json();
                setDuos(data);
            }
        } catch (error) {
            console.error('Error fetching duos:', error);
            showToast('Failed to load duos from server.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (selectedSeasonId) {
            fetchDuosForSeason(selectedSeasonId);
            setSearchParams({ seasonId: selectedSeasonId.toString() });
        }
    }, [selectedSeasonId]);

    const filteredDuos = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return duos;
        return duos.filter(d => 
            (d.teamName && d.teamName.toLowerCase().includes(query)) ||
            (d.player1Username && d.player1Username.toLowerCase().includes(query)) ||
            (d.player2Username && d.player2Username.toLowerCase().includes(query))
        );
    }, [duos, searchQuery]);

    const downloadCard = async (duo: Duo) => {
        const element = document.getElementById(`card-${duo.duoId}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 3,
                backgroundColor: null,
                logging: false,
            });

            const link = document.createElement('a');
            const filename = (duo.teamName || `team_${duo.player1Username}_${duo.player2Username}`)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            link.download = `${filename}_s${selectedSeasonId}_card.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast(`Downloaded ${duo.teamName || duo.player1Username} Card`);
        } catch (err) {
            console.error('Failed to download card:', err);
            alert('Failed to generate image. Check browser console.');
        }
    };

    const downloadAll = async () => {
        if (filteredDuos.length === 0) return;
        if (!confirm(`This will generate and download ${filteredDuos.length} PNG duo cards. Continue?`)) return;

        showToast(`Generating ${filteredDuos.length} cards...`);
        for (const duo of filteredDuos) {
            await downloadCard(duo);
            await new Promise(r => setTimeout(r, 400));
        }
        showToast('All duo cards downloaded successfully');
    };

    const currentSeason = seasons.find(s => s.seasonId === selectedSeasonId);

    return (
        <div className="min-h-screen bg-[#070712] text-white p-4 md:p-8 font-sans selection:bg-purple-500 selection:text-white">
            {/* Top Notification Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
                    {toastMessage}
                </div>
            )}

            <div className="max-w-[1440px] mx-auto space-y-8">
                {/* Header Navigation & Branding */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-4">
                        {IS_PUBLIC_PROD_DOMAIN ? (
                            <a 
                                href={TOURNAMENT_ADMIN_URL}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-gray-300 hover:text-white group"
                                title="Back to Admin Panel"
                            >
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            </a>
                        ) : (
                            <Link 
                                to={IS_ADMIN_SUBDOMAIN ? '/tournament' : '/admin/tournament'}
                                className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-gray-300 hover:text-white group"
                                title="Back to Admin Panel"
                            >
                                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                                    Duo Cards Generator (Admin)
                                </h1>
                                <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black uppercase px-3 py-1 rounded-full">
                                    {filteredDuos.length} {filteredDuos.length === 1 ? 'Team' : 'Teams'}
                                </span>
                            </div>
                            <p className="text-gray-400 text-xs md:text-sm mt-1">
                                Clean high-resolution stream & tournament graphic cards for paired teams.
                            </p>
                        </div>
                    </div>

                    {/* Season Selector & Quick Actions */}
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        {/* Season Dropdown */}
                        <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-4 py-2.5 rounded-2xl">
                            <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                            <span className="text-xs font-bold text-gray-400 uppercase">Season:</span>
                            <select
                                value={selectedSeasonId}
                                onChange={(e) => setSelectedSeasonId(parseInt(e.target.value))}
                                className="bg-transparent text-sm font-black text-white focus:outline-none cursor-pointer"
                            >
                                {seasons.map(s => (
                                    <option key={s.seasonId} value={s.seasonId} className="bg-gray-900 text-white">
                                        {s.name} ({s.format})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Format / Layout Switcher */}
                        <div className="flex bg-black/50 border border-white/10 p-1 rounded-2xl">
                            <button
                                onClick={() => setCardStyle('standard')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                                    cardStyle === 'standard'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" /> Team Card (700x260)
                            </button>
                            <button
                                onClick={() => setCardStyle('banner')}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                                    cardStyle === 'banner'
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Stream Banner (700x180)
                            </button>
                        </div>

                        {/* Live Refresh */}
                        <button
                            onClick={() => fetchDuosForSeason(selectedSeasonId)}
                            disabled={refreshing}
                            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-gray-300 hover:text-white transition-all disabled:opacity-50"
                            title="Refresh Duos"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
                        </button>

                        {/* Download All */}
                        <button
                            onClick={downloadAll}
                            disabled={filteredDuos.length === 0}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black uppercase px-5 py-3 rounded-2xl shadow-xl shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" /> Download All ({filteredDuos.length})
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search team or player name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/60 border border-white/10 pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-500"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Format:</span>
                        <span className="font-bold text-purple-300">{currentSeason?.format || 'Doubles Duos'}</span>
                    </div>
                </div>

                {/* Main Cards Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4 bg-white/5 rounded-3xl border border-white/10">
                        <RefreshCw className="w-12 h-12 text-purple-400 animate-spin" />
                        <p className="text-lg font-bold text-gray-300">Loading duos...</p>
                    </div>
                ) : filteredDuos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-28 space-y-4 bg-white/5 rounded-3xl border border-white/10 text-center p-6">
                        <Users className="w-16 h-16 text-gray-600" />
                        <h2 className="text-2xl font-black uppercase text-gray-400">No Duos Found For Season {selectedSeasonId}</h2>
                        <p className="text-sm text-gray-500 max-w-md">
                            {searchQuery 
                                ? `No teams match "${searchQuery}". Try a different search term.` 
                                : `Admins have not paired any duos for this season yet.`}
                        </p>
                        {IS_PUBLIC_PROD_DOMAIN ? (
                            <a
                                href={TOURNAMENT_ADMIN_URL}
                                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                Open Admin Pairing Panel
                            </a>
                        ) : (
                            <Link
                                to={IS_ADMIN_SUBDOMAIN ? '/tournament' : '/admin/tournament'}
                                className="mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                            >
                                Open Admin Pairing Panel
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 justify-items-center">
                        {filteredDuos.map((duo) => (
                            <div key={duo.duoId} className="flex flex-col items-center gap-4 w-full max-w-[760px] bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:border-purple-500/30 transition-all shadow-xl">
                                {/* Captured Card Area */}
                                <div className="w-full flex justify-center overflow-x-auto py-2">
                                    {cardStyle === 'standard' ? (
                                        <CleanTeamCard duo={duo} seasonName={currentSeason?.name || `Season ${selectedSeasonId}`} />
                                    ) : (
                                        <CleanBannerCard duo={duo} seasonName={currentSeason?.name || `Season ${selectedSeasonId}`} />
                                    )}
                                </div>

                                {/* Card Actions */}
                                <div className="flex flex-wrap items-center justify-between w-full pt-3 border-t border-white/10 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-400">Team:</span>
                                        <span className="font-black text-purple-300">{duo.teamName || `${duo.player1Username} & ${duo.player2Username}`}</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => downloadCard(duo)}
                                            className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-colors cursor-pointer shadow-lg shadow-purple-900/30"
                                        >
                                            <Download className="w-3.5 h-3.5" /> Download PNG
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// =========================================================================
// 1. CLEAN DUO TEAM CARD (700 x 260) - Strictly Team Name & Players (No Emojis, No Team Roster)
// =========================================================================
const CleanTeamCard: FC<{ duo: Duo; seasonName: string }> = ({ duo, seasonName }) => {
    const isPlayer1Captain = duo.captainDiscordId === duo.player1DiscordId || !duo.captainDiscordId;
    const captainName = isPlayer1Captain ? (duo.player1Username || 'Player 1') : (duo.player2Username || 'Player 2');
    const partnerName = isPlayer1Captain ? (duo.player2Username || 'Player 2') : (duo.player1Username || 'Player 1');
    const teamName = duo.teamName || `${captainName} & ${partnerName}`;

    const captainAvatar = `https://mc-heads.net/avatar/${captainName}/128`;
    const partnerAvatar = `https://mc-heads.net/avatar/${partnerName}/128`;

    return (
        <div
            id={`card-${duo.duoId}`}
            style={{
                width: '700px',
                height: '260px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #120e28 0%, #0d091e 50%, #080614 100%)',
                border: '3px solid #6366f1',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(99, 102, 241, 0.12)',
                padding: '24px 30px',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                position: 'relative',
                overflow: 'hidden',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Ambient Background Accents */}
            <div
                style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-40px',
                    left: '-40px',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(0,0,0,0) 70%)',
                    pointerEvents: 'none',
                }}
            />

            {/* Top Bar: Tournament Brand & Season Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }} />
                    <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
                        URNISA DUOS TOURNAMENT
                    </span>
                </div>
                <div
                    style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        color: '#c4b5fd',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.35)',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    {seasonName}
                </div>
            </div>

            {/* Middle: Avatars & Team Information */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px', position: 'relative', zIndex: 2 }}>
                {/* Overlapping Player Avatars */}
                <div style={{ position: 'relative', width: '150px', height: '110px', flexShrink: 0 }}>
                    {/* Captain Avatar (Left, in front) */}
                    <img
                        src={captainAvatar}
                        alt={captainName}
                        crossOrigin="anonymous"
                        style={{
                            position: 'absolute',
                            left: '0px',
                            top: '5px',
                            width: '96px',
                            height: '96px',
                            borderRadius: '20px',
                            border: '3.5px solid #eab308',
                            backgroundColor: '#111827',
                            zIndex: 2,
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(234, 179, 8, 0.25)',
                            objectFit: 'cover',
                        }}
                        onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${captainName}&background=eab308&color=000&size=128`;
                        }}
                    />
                    {/* Partner Avatar (Right, behind) */}
                    <img
                        src={partnerAvatar}
                        alt={partnerName}
                        crossOrigin="anonymous"
                        style={{
                            position: 'absolute',
                            left: '52px',
                            top: '5px',
                            width: '96px',
                            height: '96px',
                            borderRadius: '20px',
                            border: '3.5px solid #a855f7',
                            backgroundColor: '#111827',
                            zIndex: 1,
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.25)',
                            objectFit: 'cover',
                        }}
                        onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${partnerName}&background=a855f7&color=fff&size=128`;
                        }}
                    />
                </div>

                {/* Team Name & Roster Names */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                    <div
                        style={{
                            fontSize: teamName.length > 18 ? '26px' : '32px',
                            fontWeight: 900,
                            color: '#ffffff',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.02em',
                            lineHeight: '1.1',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textShadow: '0 3px 12px rgba(0,0,0,0.6)',
                        }}
                    >
                        {teamName}
                    </div>

                    {/* Player Name Badges (No Emojis) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                        {/* Captain */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(234, 179, 8, 0.12)',
                                border: '1px solid rgba(234, 179, 8, 0.35)',
                                padding: '4px 10px',
                                borderRadius: '10px',
                            }}
                        >
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                CAPTAIN
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                                {captainName}
                            </span>
                        </div>

                        {/* Partner */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                backgroundColor: 'rgba(168, 85, 247, 0.12)',
                                border: '1px solid rgba(168, 85, 247, 0.35)',
                                padding: '4px 10px',
                                borderRadius: '10px',
                            }}
                        >
                            <span style={{ fontSize: '9px', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                PARTNER
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#ffffff' }}>
                                {partnerName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar: Footer Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', position: 'relative', zIndex: 2 }}>
                <span style={{ fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                    OFFICIAL TOURNAMENT ROSTER
                </span>
                <span style={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    ID: {duo.duoId.slice(0, 8)}
                </span>
            </div>
        </div>
    );
};

// =========================================================================
// 2. CLEAN STREAM BANNER (700 x 180) - Banner format with no emojis & no team
// =========================================================================
const CleanBannerCard: FC<{ duo: Duo; seasonName: string }> = ({ duo, seasonName }) => {
    const isPlayer1Captain = duo.captainDiscordId === duo.player1DiscordId || !duo.captainDiscordId;

    const captainName = isPlayer1Captain ? (duo.player1Username || 'Player 1') : (duo.player2Username || 'Player 2');
    const partnerName = isPlayer1Captain ? (duo.player2Username || 'Player 2') : (duo.player1Username || 'Player 1');
    const teamName = duo.teamName || `${captainName} & ${partnerName}`;

    const captainAvatar = `https://mc-heads.net/avatar/${captainName}/128`;
    const partnerAvatar = `https://mc-heads.net/avatar/${partnerName}/128`;

    return (
        <div
            id={`card-${duo.duoId}`}
            style={{
                position: 'relative',
                width: '700px',
                height: '180px',
                borderRadius: '20px',
                backgroundColor: '#130f2b',
                border: '3px solid #6366f1',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), inset 0 0 25px rgba(99, 102, 241, 0.15)',
                overflow: 'hidden',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                display: 'flex',
                alignItems: 'center',
                padding: '0 32px',
                boxSizing: 'border-box',
                gap: '30px',
            }}
        >
            {/* Overlapping Avatars */}
            <div style={{
                position: 'relative',
                width: '144px',
                height: '96px',
                flexShrink: 0,
            }}>
                <img
                    src={captainAvatar}
                    alt={captainName}
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '96px',
                        height: '96px',
                        objectFit: 'cover',
                        borderRadius: '18px',
                        border: '3.5px solid #fbbf24',
                        backgroundColor: '#1e1b4b',
                        zIndex: 2,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    }}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${captainName}&background=fbbf24&color=000&size=128`;
                    }}
                />
                <img
                    src={partnerAvatar}
                    alt={partnerName}
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        top: '0',
                        left: '48px',
                        width: '96px',
                        height: '96px',
                        objectFit: 'cover',
                        borderRadius: '18px',
                        border: '3.5px solid #a855f7',
                        backgroundColor: '#1e1b4b',
                        zIndex: 1,
                        boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                    }}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${partnerName}&background=a855f7&color=fff&size=128`;
                    }}
                />
            </div>

            {/* Team Info */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flex: 1,
                minWidth: 0,
            }}>
                <div style={{
                    fontSize: teamName.length > 16 ? '28px' : '34px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    lineHeight: '1.05',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}>
                    {teamName}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginTop: '8px',
                }}>
                    <span style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#fbbf24',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                    }}>
                        {captainName}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: 900 }}>/</span>
                    <span style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#c084fc',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                    }}>
                        {partnerName}
                    </span>
                </div>
            </div>

            {/* Right Tag */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '20px',
                fontSize: '10px',
                fontWeight: 900,
                color: '#94a3b8',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
            }}>
                {seasonName}
            </div>
        </div>
    );
};

export default DuoCard;
