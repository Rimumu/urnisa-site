
import React from 'react';

interface WIPProps {
    pageName: string;
}

const WIP: React.FC<WIPProps> = ({ pageName }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="bg-black/30 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/10 max-w-lg transform hover:scale-105 transition-transform duration-300">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
                    <span className="text-brand-primary">{pageName}</span>
                </h1>
                <p className="text-8xl mb-6" role="img" aria-label="Gears icon">⚙️</p>
                <h2 className="text-4xl font-bold text-brand-accent mb-4 animate-pulse">
                    Work in Progress
                </h2>
                <p className="text-gray-300 max-w-xl mx-auto">
                    This section is currently under construction!
                </p>
            </div>
        </div>
    );
};

export default WIP;
