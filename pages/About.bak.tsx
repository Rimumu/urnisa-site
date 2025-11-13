
import React from 'react';

const InfoCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl mb-6 border border-white/10">
        <h3 className="text-xl font-bold text-brand-primary mb-3 border-b border-brand-primary/20 pb-2">{title}</h3>
        <div className="text-gray-300 space-y-2">
            {children}
        </div>
    </div>
);

const About: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-white">About <span className="text-brand-primary">Urnisa</span></h1>
                <p className="text-gray-300 mt-4 max-w-3xl mx-auto">
                    Just a little peek behind the stream.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 flex flex-col items-center">
                    <img
                        src="https://storage.googleapis.com/aai-web-samples/Urnisa.png"
                        alt="Urnisa Profile"
                        className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover border-4 border-brand-primary shadow-lg shadow-brand-primary/30"
                    />
                     <h2 className="text-3xl font-bold mt-4 text-white">urnisa_</h2>
                     <p className="text-brand-accent">Content Creator & Streamer</p>
                </div>

                <div className="md:col-span-2">
                    <InfoCard title="Who Am I?">
                        <p>
                            Hey everyone! I'm Urnisa, a variety streamer with a passion for gaming and creating a fun, welcoming community. I started streaming because I love sharing my experiences and laughing with all of you.
                        </p>
                        <p>
                           When I'm not live, you can find me exploring new games, trying out new recipes, or hanging out with my pets. Thanks for stopping by!
                        </p>
                    </InfoCard>

                    <InfoCard title="My Streaming Setup">
                       <ul className="list-disc list-inside">
                            <li><strong>CPU:</strong> AMD Ryzen 9 5900X</li>
                            <li><strong>GPU:</strong> NVIDIA GeForce RTX 3080</li>
                            <li><strong>RAM:</strong> 32GB DDR4 3600MHz</li>
                            <li><strong>Microphone:</strong> Shure SM7B</li>
                            <li><strong>Camera:</strong> Sony A6000</li>
                       </ul>
                    </InfoCard>

                     <InfoCard title="Frequently Asked Questions">
                       <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-white">What games do you play?</p>
                            <p className="text-sm text-gray-400">I play a wide variety! From cozy games like Stardew Valley to intense shooters and the latest RPGs. I'm always open to suggestions!</p>
                        </div>
                         <div>
                            <p className="font-semibold text-white">What is your stream schedule?</p>
                            <p className="text-sm text-gray-400">My schedule can vary, so the best way to stay updated is by following me on Twitch and Twitter, and joining our Discord server!</p>
                        </div>
                       </div>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default About;
