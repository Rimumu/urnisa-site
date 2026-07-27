const fs = require('fs');
let content = fs.readFileSync('pages/GachaDev.tsx', 'utf8');

// The original condition
const originalCondition = `{(stage === 'selection' || stage === 'pre_opening') && (
                        <div className=\`w-full animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8 relative z-10 p-8 \${stage === 'pre_opening' ? 'pointer-events-none' : ''}\`>
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                                {stage === 'pre_opening' ? <span className="animate-pulse">UNLOCKING...</span> : <>GACHA <span className="text-brand-primary">CRATES</span></>}
                            </h1>
                            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto text-sm md:text-base leading-relaxed h-6">
                                {stage === 'pre_opening' ? '' : 'Use your keys to unlock crates and discover rare Pokemon!'}
                            </p>`;

const newCondition = `{stage === 'selection' && (
                        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500 mt-8 relative z-10 p-8">
                            <h1 className="text-4xl md:text-5xl font-black text-center mb-2 tracking-tighter drop-shadow-2xl">
                                <>GACHA <span className="text-brand-primary">CRATES</span></>
                            </h1>
                            <p className="text-center text-gray-400 mb-12 max-w-xl mx-auto text-sm md:text-base leading-relaxed h-6">
                                Use your keys to unlock crates and discover rare Pokemon!
                            </p>`;

content = content.replace(originalCondition, newCondition);

fs.writeFileSync('pages/GachaDev.tsx', content);
