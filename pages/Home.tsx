
import React from 'react';
import TwitchEmbed from '../components/TwitchEmbed';
import { TWITCH_CHANNEL_NAME, DISCORD_SERVER_ID } from '../constants';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import DiscordWidget from '../components/DiscordWidget';

const Home: React.FC = () => {
    const [scheduleRef, isScheduleVisible] = useScrollAnimation<HTMLDivElement>();
    const [discordRef, isDiscordVisible] = useScrollAnimation<HTMLDivElement>();

    const handleScrollToSchedule = () => {
        // The `scrollMarginTop` style on the scheduleRef element ensures that
        // the sticky navbar does not overlap the section title after scrolling.
        scheduleRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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

            {/* Scroll Down Arrow */}
            <div className="mt-12 text-center">
                <button
                    onClick={handleScrollToSchedule}
                    className="text-brand-primary animate-bounce transition-transform duration-200 hover:scale-110 focus:outline-none"
                    aria-label="Scroll to schedule"
                    title="Scroll to schedule"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Schedule Section */}
            <div 
                ref={scheduleRef}
                className={`mt-8 w-full max-w-5xl transition-all duration-1000 ease-out ${isScheduleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
                style={{ scrollMarginTop: '5rem' }} // Offset for the sticky navbar
            >
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Stream <span className="text-brand-primary">Schedule</span>
                </h2>
                <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-2 border border-white/10 shadow-2xl shadow-black/40">
                    <img
                        loading="lazy"
                        src="https://i.ibb.co/hZ2vVfS/schedule-480w.png"
                        srcSet="https://i.ibb.co/hZ2vVfS/schedule-480w.png 480w, https://i.ibb.co/FWSV5v1/schedule-800w.png 800w, https://i.ibb.co/gbWdRKst/3-am-15.png 1080w"
                        sizes="(min-width: 1024px) 1024px, 100vw"
                        alt="Urnisa's weekly stream schedule"
                        className="rounded-lg w-full"
                    />
                </div>
            </div>

            {/* Discord Section */}
            <div 
                ref={discordRef}
                className={`mt-16 w-full max-w-5xl transition-all duration-1000 ease-out ${isDiscordVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}
            >
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
                    Join our <span className="text-brand-primary">Discord</span>
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    Become a part of the STEAK House community! Join our Discord server to chat with others, get live notifications, and stay updated on all events.
                </p>
                {/* The DiscordWidget is only rendered when it becomes visible,
                    which triggers the data fetch. This is lazy loading. */}
                {isDiscordVisible && <DiscordWidget serverId={DISCORD_SERVER_ID} />}
            </div>
        </div>
    );
};

export default Home;