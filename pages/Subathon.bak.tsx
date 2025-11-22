
import React from 'react';

const SubGoalProgressBar: React.FC<{ goal: number; current: number; label: string }> = ({ goal, current, label }) => {
    const percentage = Math.min((current / goal) * 100, 100);
    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1 text-gray-300">
                <span className="font-bold">{label}</span>
                <span className="text-sm font-semibold">{current} / {goal}</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-4 shadow-inner">
                <div 
                    className="bg-brand-primary h-4 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

const EventItem: React.FC<{ event: string; detail: string }> = ({ event, detail }) => (
    <li className="flex items-center space-x-4 p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="bg-brand-primary p-2 rounded-full text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
        </div>
        <div>
            <p className="font-semibold text-white">{event}</p>
            <p className="text-sm text-gray-400">{detail}</p>
        </div>
    </li>
);

const Nisathon: React.FC = () => {
    const mockEvents = [
        { event: "Anonymous gifted 5 subs!", detail: "2 minutes ago" },
        { event: "CoolUser123 subscribed (Tier 1)!", detail: "5 minutes ago" },
        { event: "GenerousDonator cheered 1000 bits!", detail: "10 minutes ago" },
        { event: "$50.00 donation via PayPal!", detail: "12 minutes ago" },
        { event: "AnotherGamer subscribed!", detail: "18 minutes ago" },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-white">Urnisa's Grand <span className="text-brand-primary">Nisathon</span></h1>
                <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
                    Join the epic event! Every subscription, cheer, and donation extends the stream and unlocks awesome new goals. Your support makes it all happen!
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Goals and Main Info */}
                <div className="lg:col-span-2 bg-black/30 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-6 text-brand-primary border-b-2 border-brand-primary/30 pb-2">Live Goals</h2>
                    <SubGoalProgressBar goal={100} current={73} label="Daily Sub Goal" />
                    <SubGoalProgressBar goal={50000} current={32500} label="Bits Goal" />
                    <SubGoalProgressBar goal={1000} current={450} label="Donation Goal ($)" />
                    
                    <div className="mt-8 text-center p-6 bg-black/30 rounded-lg">
                        <h3 className="text-3xl font-bold text-brand-accent">Stream Timer</h3>
                        <p className="text-5xl font-mono font-extrabold my-2 text-white">10:25:42</p>
                        <p className="text-gray-400">Time remaining in the Nisathon!</p>
                    </div>
                </div>

                {/* Latest Events */}
                <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl shadow-2xl border border-white/10">
                    <h2 className="text-2xl font-bold mb-6 text-brand-primary border-b-2 border-brand-primary/30 pb-2">Latest Events</h2>
                    <ul className="space-y-4">
                        {mockEvents.map((item, index) => (
                             <EventItem key={index} event={item.event} detail={item.detail} />
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-12 bg-black/30 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/10">
                 <h2 className="text-3xl font-bold text-center mb-6 text-brand-primary">Support the Stream</h2>
                 <p className="text-center text-gray-300 mb-8">Choose your way to contribute. A payment gateway system will be here soon!</p>
                 <div className="flex justify-center items-center space-x-6">
                    <button className="bg-purple-600 text-white font-bold py-3 px-8 rounded-md hover:bg-purple-700 transition-transform transform hover:scale-105">Twitch Subs & Bits</button>
                    <button className="bg-blue-500 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-600 transition-transform transform hover:scale-105">PayPal</button>
                    <button className="bg-indigo-500 text-white font-bold py-3 px-8 rounded-md hover:bg-indigo-600 transition-transform transform hover:scale-105">Stripe</button>
                 </div>
            </div>
        </div>
    );
};

export default Nisathon;