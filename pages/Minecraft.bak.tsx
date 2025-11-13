
import React from 'react';

const Minecraft: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16">
            <div className="bg-black/30 backdrop-blur-lg p-10 rounded-2xl shadow-2xl border border-white/10 transform hover:scale-105 transition-transform duration-300">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
                    <span className="text-brand-primary">Urnisa's</span> Minecraft Server
                </h1>
                <p className="text-8xl mb-6">⛏️</p>
                <h2 className="text-4xl font-bold text-brand-accent mb-4 animate-pulse">
                    Coming Soon!
                </h2>
                <p className="text-gray-300 max-w-xl mx-auto">
                    Get ready to build, explore, and survive! We're hard at work creating an amazing Minecraft server for the community. Stay tuned for details on how to join the fun.
                </p>
                 <div className="mt-8 bg-black/30 p-4 rounded-lg">
                    <h3 className="font-bold text-lg text-white">What to expect:</h3>
                    <ul className="text-gray-400 mt-2 list-disc list-inside">
                        <li>Custom Survival Gameplay</li>
                        <li>Community Events & Builds</li>
                        <li>Minigames and more!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Minecraft;
