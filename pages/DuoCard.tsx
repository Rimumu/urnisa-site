
import React, { FC, SyntheticEvent, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '../constants';

interface Duo {
    duoId: string;
    teamName: string;
    player1Username: string;
    player2Username: string;
    player1DiscordId: string;
    player2DiscordId: string;
    captainDiscordId: string;
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
    // Determine who is captain based on captainDiscordId
    const isPlayer1Captain = duo.captainDiscordId === duo.player1DiscordId;

    const captainName = isPlayer1Captain ? duo.player1Username : duo.player2Username;
    const partnerName = isPlayer1Captain ? duo.player2Username : duo.player1Username;
    const teamName = duo.teamName || 'Unknown Team';

    const captainAvatar = `https://minotar.net/helm/${captainName}/300.png`;
    const partnerAvatar = `https://minotar.net/helm/${partnerName}/300.png`;

    return (
        <div
            id={`card-${duo.duoId}`}
            style={{
                position: 'relative',
                width: '700px',
                height: '180px',
                borderRadius: '20px',
                backgroundColor: '#312e81',
                border: '3px solid #6366f1',
            }}
        >
            {/* Overlapping Avatars - centered horizontally */}
            <div style={{
                position: 'absolute',
                left: '120px',
                top: '35px',
                width: '160px',
                height: '110px',
            }}>
                {/* Captain (purple border, left, in front) */}
                <img
                    src={captainAvatar}
                    alt={captainName}
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
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${captainName}&background=random&size=300`}
                />
                {/* Partner (blue border, right, behind) */}
                <img
                    src={partnerAvatar}
                    alt={partnerName}
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
                    onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${partnerName}&background=random&size=300`}
                />
            </div>

            {/* Team Info - absolute positioned */}
            <div style={{
                position: 'absolute',
                left: '304px',
                top: '35px',
                right: '24px',
            }}>
                {/* Team Name */}
                <div style={{
                    fontSize: '32px',
                    fontWeight: 900,
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    fontFamily: 'Arial, sans-serif',
                    marginBottom: '4px',
                    lineHeight: '1.0',
                    letterSpacing: '0.02em',
                    wordWrap: 'break-word',
                }}>
                    {teamName}
                </div>
                {/* Player Names - Captain first */}
                <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#c4b5fd',
                    fontFamily: 'Arial, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.03em',
                }}>
                    {captainName} & {partnerName}
                </div>
            </div>
        </div>
    );
};

export default DuoCard;
