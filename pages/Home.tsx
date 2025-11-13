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

            {/* Schedule Section */}
            <div className="mt-16 w-full max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Stream <span className="text-brand-primary">Schedule</span>
                </h2>
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/40">
                    <img 
                        src="https://i.ibb.co/gbWdRKst/3-am-15.png" 
                        alt="Urnisa's weekly stream schedule" 
                        className="rounded-lg w-full"
                    />
                </div>
            </div>

            {/* Discord Section */}
            <div className="mt-16 w-full max-w-5xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Join our <span className="text-brand-primary">Discord</span>
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    Become a part of the STEAK House community! Join our Discord server to chat with others, get live notifications, and stay updated on all events.
                </p>
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/40">
                    {/* 
                      Using WidgetBot for a more reliable and interactive Discord embed.
                      - Server ID: 1336782145833668729
                      - Channel ID: 1336782147490549869
                      This provides a live view of the channel directly on the site.
                    */}
                    <iframe
                        src="https://e.widgetbot.io/channels/1336782145833668729/1336782147490549869"
                        width="100%"
                        height="500"
                        allowTransparency={true}
                        frameBorder="0"
                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
                        className="rounded-lg"
                        title="Discord server widget"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Home;