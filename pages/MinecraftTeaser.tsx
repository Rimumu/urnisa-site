import React from 'react';

const MinecraftTeaser: React.FC = () => {
    return (
        <div className="w-full flex items-center justify-center py-20 px-4 mt-10">
            {/* Main Container - transparent/glassmorphism modern look */}
            <div 
                className="relative w-full max-w-4xl p-8 md:p-16 rounded-[2rem] overflow-hidden bg-black/20 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-1000"
            >
                {/* Decorative floating elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-accent/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10 text-center">
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8 drop-shadow-2xl">
                        Next <span className="text-brand-primary">Nisamon</span>
                        <br />
                        <span className="text-white mt-4 block text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            COMING SOON
                        </span>
                    </h1>

                    <div className="flex flex-col items-center justify-center gap-6 mt-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 fill-mode-both">
                        <div className="flex justify-center text-gray-300 font-extrabold tracking-[0.3em] text-sm md:text-base cursor-default select-none hover:text-brand-primary transition-colors duration-300">
                            {"GREMLINS WORKING...".split("").map((char, index) => (
                                <span 
                                    key={index} 
                                    className="inline-block animate-wave" 
                                    style={{ 
                                        animationDelay: `${index * 0.05}s` 
                                    }}
                                >
                                    {char === " " ? "\u00A0" : char}
                                </span>
                            ))}
                        </div>
                        
                        {/* Endless Gif Loop */}
                        <div className="w-full max-w-[200px] sm:max-w-xs mt-2 transform hover:scale-105 transition-transform duration-500">
                            <img 
                                src="https://s13.gifyu.com/images/bdEGa.gif" 
                                alt="Loading..." 
                                className="w-full h-auto object-contain opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MinecraftTeaser;

