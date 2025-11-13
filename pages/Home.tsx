
import React from 'react';
import TwitchEmbed from '../components/TwitchEmbed';
import { TWITCH_CHANNEL_NAME } from '../constants';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2">
                Welcome to the <span className="text-brand-primary">STEAK</span> House!
            </h1>
            <p className="text-gray-300 mb-8 max-w-2xl">
                The hub for everything related to nisa. Check out the streams and enjoy your meat!
            </p>

            <div className="w-full max-w-5xl">
                <div className="w-full bg-black/30 backdrop-blur-lg rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/40">
                    <TwitchEmbed channel={TWITCH_CHANNEL_NAME} />
                </div>
            </div>
        </div>
    );
};

export default Home;