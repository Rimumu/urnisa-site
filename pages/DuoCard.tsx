
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

    return (
        <div
            id={`card-${duo.duoId}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                width: '600px',
                height: '180px',
                padding: '24px 32px',
                borderRadius: '16px',
                backgroundColor: '#1a1c23',
                backgroundImage: 'linear-gradient(135deg, #1a1c23 0%, #2b2e3b 100%)',
            }}
        >
            {/* Overlapping Avatars - Captain (left, purple) & Partner (right, blue) */}
            <div style={{ position: 'relative', width: '160px', height: '110px', flexShrink: 0 }}>
                {/* Player 1 - Captain (purple border, left) */}
                <img
                    src={p1Avatar}
                    alt={p1Name}
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        top: '5px',
                        left: '0',
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        border: '4px solid #a855f7',
                        backgroundColor: '#202225',
                        zIndex: 2,
                    }}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p1Name}&background=random&size=300`}
                />
                {/* Player 2 - Partner (blue border, right, slightly behind) */}
                <img
                    src={p2Avatar}
                    alt={p2Name}
                    crossOrigin="anonymous"
                    style={{
                        position: 'absolute',
                        top: '5px',
                        left: '60px',
                        width: '100px',
                        height: '100px',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        border: '4px solid #3b82f6',
                        backgroundColor: '#202225',
                        zIndex: 1,
                    }}
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p2Name}&background=random&size=300`}
                />
            </div>

            {/* Team Info */}
            <div style={{ marginLeft: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Team Name */}
                <h1 style={{
                    fontSize: '42px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontFamily: 'Arial, sans-serif',
                    margin: '0 0 8px 0',
                    lineHeight: 1.1,
                }}>
                    {teamName}
                </h1>
                {/* Player Names */}
                <p style={{
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#9ca3af',
                    fontFamily: 'Arial, sans-serif',
                    margin: 0,
                    textTransform: 'uppercase',
                }}>
                    {p1Name} & {p2Name}
                </p>
            </div>
        </div>
    );
};

export default DuoCard;
