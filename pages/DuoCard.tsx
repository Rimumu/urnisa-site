
import React, { FC, SyntheticEvent, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const DuoCard: FC = () => {
    const [searchParams] = useSearchParams();

    const teamName = searchParams.get('teamName') || 'Unknown Team';
    const p1Name = searchParams.get('p1Name') || 'Player 1';
    const p2Name = searchParams.get('p2Name') || 'Player 2';

    // High-res Minotar busts
    const p1Avatar = `https://minotar.net/helm/${p1Name}/300.png`;
    const p2Avatar = `https://minotar.net/helm/${p2Name}/300.png`;

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-0 m-0 overflow-hidden">
            {/* 
                Card Container 
                Fixed size for consistent screenshots: 1200x600 px 
            */}
            <div
                id="duo-card"
                className="relative w-[1200px] h-[600px] bg-[#1a1c23] border-[6px] border-[#7289da] rounded-3xl flex flex-col items-center justify-center shadow-2xl overflow-hidden"
                style={{
                    backgroundImage: 'linear-gradient(135deg, #1a1c23 0%, #2b2e3b 100%)',
                    boxShadow: '0 0 60px rgba(114, 137, 218, 0.3)'
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
                    <div className="flex flex-col items-center gap-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-75"></div>
                            <img
                                src={p1Avatar}
                                alt={p1Name}
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
                    <div className="flex flex-col items-center gap-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-75"></div>
                            <img
                                src={p2Avatar}
                                alt={p2Name}
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
        </div>
    );
};

export default DuoCard;
