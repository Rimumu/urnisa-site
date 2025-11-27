
import React from 'react';
import SpinWheel from '../components/SpinWheel';

const Wheel: React.FC = () => {
    return (
        <div className="min-h-screen py-12 relative font-sans">
             <style>{`
                .bg-rose-pattern {
                    background-image: radial-gradient(#581c25 1.5px, transparent 1.5px);
                    background-size: 24px 24px;
                }
            `}</style>
            
            {/* Background Decorations */}
            <div className="absolute inset-0 bg-rose-pattern opacity-10 pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center animate-in fade-in duration-700">
                <div className="text-center space-y-3 mb-12">
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
                        SPIN THE <span className="text-brand-primary bg-clip-text text-transparent bg-gradient-to-br from-brand-primary to-red-400">WHEEL</span>
                    </h1>
                    <div className="inline-block bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                            <h2 className="text-xl md:text-2xl font-bold text-brand-accent tracking-widest uppercase">Nisathon Event</h2>
                    </div>
                </div>

                <div className="w-full max-w-4xl bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-rose-pattern opacity-5 pointer-events-none"></div>
                    <h2 className="text-4xl font-black text-center text-white mb-2 relative z-10">SPIN TO <span className="text-brand-accent">WIN</span></h2>
                    <p className="text-center text-gray-400 mb-8 relative z-10">Spin and get some stuff!</p>
                    <SpinWheel />
                </div>
            </div>
        </div>
    );
};

export default Wheel;
