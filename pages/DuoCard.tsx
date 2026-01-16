
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
                window.open(data.url, '_blank');
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
            className="relative w-[1200px] h-[600px] bg-[#1a1c23] border-[6px] border-[#7289da] rounded-3xl flex flex-col items-center justify-center shadow-2xl overflow-hidden scale-[0.4] origin-top md:scale-[0.5] lg:scale-[0.6] xl:scale-[0.65] 2xl:scale-[0.75] origin-center -mb-[200px] md:-mb-[150px] lg:-mb-[100px]"
            // Scaling to fit in grid view, but html2canvas captures full size of element if configured right, 
            // actually html2canvas captures rendered size. We might need a hidden container for full res? 
            // Wait, scaling via CSS transform usually affects html2canvas capture size unless we trick it.
            // Better strategy: We render it full size, but use `zoom` or `transform` on a container for PREVIEW, 
            // but for html2canvas we might need to clone it or ensure it sees full size.
            // HTML2Canvas `scale` option helps upscaling, but if the element is rendered small, it captures small.
            // Let's try rendering it full size but putting it in a container that scales it down visually using styling that html2canvas ignores?
            // Actually, simplest is: Render full size, but use CSS zoom/scale that html2canvas reads?

            // Correction: For this 'dashboard' view, we want to see them. 
            // If I scale them down with CSS `transform: scale(0.5)`, html2canvas will likely capture the scaled version if I screenshot that element.
            // HOWEVER, I can use `onclone` in html2canvas to reset transform, OR I can just supply a higher scale factor to html2canvas to compensate?
            // Let's try a transform-free approach for the "source" if possible, or accept that we need to handle the scaling.

            // Alternative: The element we screenshot is `w-[1200px] h-[600px]`. 
            // To make it fit the screen, we wrap it in a `div` that has `transform: scale(x)` and `overflow: hidden`.
            // When we pass the element to html2canvas, we pass the INNER element (the 1200x600 one).
            // Html2Canvas usually respects the computed styles. If it's scaled 0.5 onscreen, it might be 600x300.
            // Check `ignoreElements` or clone.

            // Safe bet: Render it normally. The user can scroll. 1200px is wide but manageable on desktop.
            // OR use the transform strategy.
            style={{
                // Force full size for layout, scale for display
                // We will rely on html2canvas `scale` option and capturing the element. 
                // If we use CSS transform, we might need `window.devicePixelRatio` logic.
                backgroundImage: 'linear-gradient(135deg, #1a1c23 0%, #2b2e3b 100%)',
                boxShadow: '0 0 60px rgba(114, 137, 218, 0.3)',
                // We'll keep the scale in the className above for visual fit.
            }}
        >
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #7289da 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
            </div>

            {/* Team Name Header */}
            <div className="z-10 w-full text-center px-12 mb-12">
                <h1 className="text-8xl font-black text-white uppercase tracking-wider drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                    style={{ textShadow: '0 0 20px rgba(114, 137, 218, 0.5)' }}>
                    {teamName}
                </h1>
            </div>

            {/* Players Section */}
            <div className="z-10 w-full flex items-center justify-center gap-24 px-12">

                {/* Player 1 */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                        <img
                            src={p1Avatar}
                            alt={p1Name}
                            /* CrossOrigin needed for canvas contamination */
                            crossOrigin="anonymous"
                            className="relative w-64 h-64 rounded-2xl border-4 border-[#2f3136] shadow-xl object-contain bg-[#202225]"
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p1Name}&background=random&size=300`}
                        />
                    </div>
                    <span className="text-4xl font-bold text-white tracking-wide bg-[#202225] px-6 py-2 rounded-full border border-gray-700 shadow-lg">
                        {p1Name}
                    </span>
                </div>

                {/* VS / Ampersand Graphic */}
                <div className="flex flex-col items-center justify-center">
                    <span className="text-[#7289da] text-7xl font-black italic opacity-80"
                        style={{ textShadow: '0 0 15px rgba(114, 137, 218, 0.8)' }}>
                        &
                    </span>
                </div>

                {/* Player 2 */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75"></div>
                        <img
                            src={p2Avatar}
                            alt={p2Name}
                            crossOrigin="anonymous"
                            className="relative w-64 h-64 rounded-2xl border-4 border-[#2f3136] shadow-xl object-contain bg-[#202225]"
                            onError={(e: SyntheticEvent<HTMLImageElement, Event>) => e.currentTarget.src = `https://ui-avatars.com/api/?name=${p2Name}&background=random&size=300`}
                        />
                    </div>
                    <span className="text-4xl font-bold text-white tracking-wide bg-[#202225] px-6 py-2 rounded-full border border-gray-700 shadow-lg">
                        {p2Name}
                    </span>
                </div>

            </div>

            {/* Footer / Branding */}
            <div className="absolute bottom-6 right-8 opacity-40">
                <span className="text-xl font-bold text-gray-400">URNISA TOURNAMENT</span>
            </div>
        </div>
    );
};

export default DuoCard;
