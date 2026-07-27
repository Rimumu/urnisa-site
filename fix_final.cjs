const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

const containerStart = content.indexOf('<div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh] py-4 md:py-8">');
const containerEnd = content.indexOf('{/* RENDER FULLSCREEN ANIMATIONS OUTSIDE OF THE CONSTRAINED CONTAINER */}');

const newContainer = `<div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-start min-h-[80vh] py-4 md:py-8">
                <div className="w-full max-w-6xl bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[600px]">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                    {stage === 'selection' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8 relative z-10 p-8">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                                <>GACHA <span className="text-brand-primary">CRATES</span></>
                            </h1>
                            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto text-sm md:text-base leading-relaxed h-6">
                                Use your keys to unlock crates and discover rare Pokemon!
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 px-2 md:px-12 max-w-5xl mx-auto">
                                {/* LAMB CRATE */}
                                <div 
                                    className={\`flex flex-col items-center p-8 bg-gradient-to-b from-amber-900/20 to-black border border-amber-900/40 rounded-3xl shadow-xl transition-all duration-300 \${keys.lambKeys > 0 ? 'hover:border-amber-700/60 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(146,64,14,0.4)]' : 'cursor-not-allowed opacity-80'}\`}
                                    onClick={() => stage === 'selection' && handleSelectCrate('lamb')}
                                >
                                    <div className="w-48 h-32 mb-6 text-amber-800 drop-shadow-[0_0_15px_rgba(146,64,14,0.5)] relative crate-float">
                                        <LambCrateSVG stage={stage} selectedCrate={selectedCrate} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Lamb Crate</h2>
                                    <p className="text-amber-200/80 text-sm text-center mb-8 h-10">Contains Legendary Beasts and other rare Pokemon</p>
                                    
                                    <div className={\`mt-4 font-bold tracking-widest uppercase flex items-center gap-2 \${keys.lambKeys > 0 ? 'text-amber-500' : 'text-gray-500'}\`}>
                                        {keys.lambKeys > 0 ? (
                                            <>Click to Unlock <span className="text-xs">({keys.lambKeys} Keys)</span></>
                                        ) : (
                                            'Requires Lamb Key'
                                        )}
                                    </div>
                                </div>

                                {/* STEAK CRATE */}
                                <div 
                                    className={\`flex flex-col items-center p-8 bg-gradient-to-b from-[#7a2034]/20 to-black border border-[#d7485c]/20 rounded-3xl shadow-xl transition-all duration-300 \${keys.steakKeys > 0 ? 'hover:border-[#fbbf24]/50 cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(215,72,92,0.4)]' : 'cursor-not-allowed opacity-80'}\`}
                                    onClick={() => stage === 'selection' && handleSelectCrate('steak')}
                                >
                                    <div className="w-48 h-32 mb-6 text-[#fbbf24] drop-shadow-[0_0_15px_rgba(251,113,133,0.5)] relative crate-float">
                                        <SteakCrateSVG stage={stage} selectedCrate={selectedCrate} />
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Steak Crate</h2>
                                    <p className="text-[#fbbf24]/80 text-sm text-center mb-8 h-10">Contains Mythical Celebi and other premium drops</p>
                                    
                                    <div className={\`mt-4 font-bold tracking-widest uppercase flex items-center gap-2 \${keys.steakKeys > 0 ? 'text-[#fbbf24]' : 'text-gray-500'}\`}>
                                        {keys.steakKeys > 0 ? (
                                            <>Click to Unlock <span className="text-xs">({keys.steakKeys} Keys)</span></>
                                        ) : (
                                            'Requires Steak Key'
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {(stage === 'focus_crate' || stage === 'pre_opening') && (
                        <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-12 tracking-tighter drop-shadow-2xl">
                                {stage === 'pre_opening' ? <span className="animate-pulse text-amber-500">UNLOCKING...</span> : <span className="text-white uppercase tracking-widest">{selectedCrate} CRATE</span>}
                            </h1>
                            
                            <div className={\`relative w-64 h-48 md:w-96 md:h-64 mb-16 animate-in zoom-in duration-300 \${stage === 'pre_opening' ? 'animate-shake-violent scale-125' : ''}\`}>
                                {stage === 'pre_opening' && (
                                    <div className="absolute inset-0 bg-white rounded-full blur-[60px] opacity-0 crate-glow-burst" style={{ zIndex: 0 }}></div>
                                )}
                                <div className={\`w-full h-full \${stage === 'pre_opening' ? '' : 'crate-float'}\`}>
                                    {selectedCrate === 'lamb' ? <LambCrateSVG stage={stage} selectedCrate={selectedCrate} /> : <SteakCrateSVG stage={stage} selectedCrate={selectedCrate} />}
                                </div>
                                
                                {/* The Drop Target for Keyhole */}
                                {stage === 'focus_crate' && (
                                    <div 
                                        className="absolute w-32 h-32 rounded-full z-20"
                                        style={{ left: '50%', top: '67%', transform: 'translate(-50%, -50%)' }}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.getData('keyType') === selectedCrate) {
                                                handleOpenCrate(selectedCrate);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                            
                            {/* Render the Key to Drag */}
                            {stage === 'focus_crate' && (
                                <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500 delay-300 fill-mode-both">
                                    <p className="text-gray-400 mb-6 font-bold tracking-widest uppercase">Drag key to unlock</p>
                                    <img 
                                        src={selectedCrate === 'lamb' ? '/lambc.png' : '/steak.png'} 
                                        className="w-32 h-44 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]" 
                                        draggable="true"
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('keyType', selectedCrate);
                                        }}
                                        alt="Key"
                                    />
                                </div>
                            )}
                            
                            {/* Cancel button */}
                            {stage === 'focus_crate' && (
                                <button 
                                    className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
                                    onClick={() => {
                                        setStage('selection');
                                        setSelectedCrate(null);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            `;

content = content.substring(0, containerStart) + newContainer + content.substring(containerEnd);

fs.writeFileSync('pages/GachaDev.tsx', content);
