
import React, { FC, SyntheticEvent, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '../constants';

interface Duo {
    duoId: string;
    teamName: string;
    player1Username: string;
    player2Username: string;
}

const DuoCard: FC = () => {
    const [duos, setDuos] = useState<Duo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDuos = async () => {
            try {
                // Try to fetch Season 2 first, fallback to all if needed logic could be added
                const res = await fetch(`${API_BASE_URL}/api/tournament/duos?seasonId=2`);
                if (res.ok) {
                    const data = await res.json();
                    setDuos(data);
                } else {
                    console.error('Failed to fetch duos');
                }
            } catch (error) {
                console.error('Error fetching duos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDuos();
    }, []);

    const downloadCard = async (duo: Duo) => {
        const element = document.getElementById(`card-${duo.duoId}`);
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                useCORS: true, // Needed for Minotar images
                scale: 2, // Higher quality
                backgroundColor: null, // Attempt transparent if needed, or stick to card bg
                logging: false,
            });

            const link = document.createElement('a');
            const filename = (duo.teamName || `Team_${duo.player1Username}_${duo.player2Username}`)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to download card:', err);
            alert('Failed to generate image. Check console.');
        }
    };

    const hostCard = async (duo: Duo) => {
        const element = document.getElementById(`card-${duo.duoId}`);
        if (!element) return;

        // Visual feedback
        const originalText = document.getElementById(`btn-host-${duo.duoId}`)?.innerText;
        const btn = document.getElementById(`btn-host-${duo.duoId}`);
        if (btn) btn.innerText = "Uploading...";

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 2,
                backgroundColor: null,
                logging: false,
            });

            const base64 = canvas.toDataURL('image/png');
            const filename = (duo.teamName || `Team_${duo.player1Username}_${duo.player2Username}`)
                .replace(/[^a-z0-9]/gi, '_')
                .toLowerCase();

            // Upload
            const res = await fetch(`${API_BASE_URL}/api/public/upload-card`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, filename })
            });

            const data = await res.json();
            if (data.success && data.url) {
                // Append timestamp to force browser to fetch fresh image (bypass cache)
                window.open(`${data.url}?t=${Date.now()}`, '_blank');
            } else {
                alert('Upload failed.');
            }
        } catch (err) {
            console.error('Failed to host card:', err);
            alert('Failed to upload image.');
        } finally {
            if (btn) btn.innerText = "Open Link";
        }
    };

    const downloadAll = async () => {
        if (!confirm(`This will download ${duos.length} images. Continue?`)) return;

        for (const duo of duos) {
            await downloadCard(duo);
            // Small delay to prevent browser throttling
            await new Promise(r => setTimeout(r, 500));
        }
    };

    if (loading) return <div className="text-white text-center p-20">Loading Duos...</div>;

    return (
        <div className="min-h-screen bg-gray-900 p-8 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Duo Cards Generator ({duos.length})</h1>
                    <button
                        onClick={downloadAll}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-colors"
                    >
                        Download All
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-8 justify-items-center">
                    {duos.map((duo) => (
                        <div key={duo.duoId} className="flex flex-col items-center gap-4">
                            {/* Wrapper to control capture area precisely */}
                            <div className="relative group">
                                <SingleCard duo={duo} />
                                {/* Overlay for hover effect / easy download */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl pointer-events-none">
                                    <span className="text-white font-bold text-xl">Preview</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => downloadCard(duo)}
                                    className="text-gray-400 hover:text-white underline text-sm"
                                >
                                    Download
                                </button>
                                <button
                                    id={`btn-host-${duo.duoId}`}
                                    onClick={() => hostCard(duo)}
                                    className="text-brand-primary hover:text-pink-300 font-bold underline text-sm"
                                >
                                    Get Link
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SingleCard: FC<{ duo: Duo }> = ({ duo }) => {
    const p1Name = duo.player1Username;
    const p2Name = duo.player2Username;
    const teamName = duo.teamName || 'Unknown Team';

    const p1Avatar = `https://minotar.net/helm/${p1Name}/300.png`;
    const p2Avatar = `https://minotar.net/helm/${p2Name}/300.png`;

    // Common text styles that html2canvas can render properly
    const teamNameStyle: React.CSSProperties = {
        fontSize: '72px',
        fontWeight: 900,
        color: '#ffffff',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textShadow: '0 5px 10px rgba(0,0,0,0.8), 0 0 20px rgba(114, 137, 218, 0.5)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    };

    const playerNameStyle: React.CSSProperties = {
        fontSize: '28px',
        fontWeight: 700,
        color: '#ffffff',
        letterSpacing: '0.025em',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    };

    const ampersandStyle: React.CSSProperties = {
        fontSize: '56px',
        fontWeight: 900,
        fontStyle: 'italic',
        color: '#7289da',
        opacity: 0.8,
        textShadow: '0 0 15px rgba(114, 137, 218, 0.8)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    };

    return (
        <div
            id={`card-${duo.duoId}`}
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1200px',
                height: '600px',
                overflow: 'hidden',
                borderRadius: '24px',
                border: '6px solid #7289da',
                backgroundColor: '#1a1c23',
                backgroundImage: 'linear-gradient(135deg, #1a1c23 0%, #2b2e3b 100%)',
                boxShadow: '0 0 60px rgba(114, 137, 218, 0.3)',
            }}
        >
            {/* Decorative dots */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                backgroundImage: 'radial-gradient(circle at 50% 50%, #7289da 1px, transparent 1px)',
                backgroundSize: '30px 30px',
            }} />

            {/* Team Name Header */}
            <div style={{ width: '100%', textAlign: 'center', padding: '0 48px', marginBottom: '32px', zIndex: 10 }}>
                <h1 style={teamNameStyle}>
                    {teamName}
                </h1>
            </div>

            {/* Players Section */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '64px', zIndex: 10 }}>

                {/* Player 1 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-8px',
                            background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                            borderRadius: '16px',
                            filter: 'blur(12px)',
                            opacity: 0.75,
                        }} />
                        <img
                            src={p1Avatar}
                            alt={p1Name}
                            crossOrigin="anonymous"
                            style={{
                                position: 'relative',
                                width: '200px',
                                height: '200px',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                border: '4px solid #2f3136',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                                backgroundColor: '#202225',
                            }}
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p1Name}&background=random&size=300`}
                        />
                    </div>
                    <div style={{
                        backgroundColor: '#202225',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        borderRadius: '9999px',
                        border: '1px solid #374151',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                        textAlign: 'center',
                    }}>
                        <span style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            lineHeight: '48px',
                        }}>
                            {p1Name}
                        </span>
                    </div>
                </div>

                {/* Ampersand */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={ampersandStyle}>
                        &amp;
                    </span>
                </div>

                {/* Player 2 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', marginBottom: '16px' }}>
                        <div style={{
                            position: 'absolute',
                            inset: '-8px',
                            background: 'linear-gradient(to right, #4f46e5, #9333ea)',
                            borderRadius: '16px',
                            filter: 'blur(12px)',
                            opacity: 0.75,
                        }} />
                        <img
                            src={p2Avatar}
                            alt={p2Name}
                            crossOrigin="anonymous"
                            style={{
                                position: 'relative',
                                width: '200px',
                                height: '200px',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                border: '4px solid #2f3136',
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                                backgroundColor: '#202225',
                            }}
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p2Name}&background=random&size=300`}
                        />
                    </div>
                    <div style={{
                        backgroundColor: '#202225',
                        height: '48px',
                        paddingLeft: '24px',
                        paddingRight: '24px',
                        borderRadius: '9999px',
                        border: '1px solid #374151',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                        textAlign: 'center',
                    }}>
                        <span style={{
                            fontSize: '28px',
                            fontWeight: 700,
                            color: '#ffffff',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            lineHeight: '48px',
                        }}>
                            {p2Name}
                        </span>
                    </div>
                </div>

            </div>

            {/* Footer / Branding */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '24px',
                opacity: 0.4,
            }}>
                <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#9ca3af',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                }}>
                    URNISA TOURNAMENT
                </span>
            </div>
        </div>
    );
};

export default DuoCard;
