const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

// Remove the key images from the selection view
content = content.replace(/<img src="\/lambc\.png".*?\/>/, '');
content = content.replace(/<img src="\/steak\.png".*?\/>/, '');

// Now we need to append the fullscreen view just after the selection view closes.
// Wait, the selection view closes at </div></div>}
// Let's just find "                    )}", which closes the selection grid.
const splitIndex = content.indexOf('                    )}\n');

const fullScreenView = `
                    {(stage === 'focus_crate' || stage === 'pre_opening') && (
                        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
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
`;

content = content.substring(0, splitIndex + 23) + fullScreenView + content.substring(splitIndex + 23);
fs.writeFileSync('pages/GachaDev.tsx', content);
