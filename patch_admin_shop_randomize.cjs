const fs = require('fs');
let code = fs.readFileSync('pages/Admin.tsx', 'utf-8');

const randomizeSection = `
                                    {/* Randomize Shop */}
                                    <div className="bg-black/30 border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-white text-lg">Reset & Randomize Daily Shop</h4>
                                            <p className="text-xs text-gray-500 mt-1">Changes the global seed to instantly force a new selection of 4 daily hats.</p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if(!window.confirm("Are you sure you want to reroll the 24-hour daily shop for everyone?")) return;
                                                const res = await fetch(\`\${DISCORD_API_URL}/api/admin/shop/randomize\`, {
                                                    method: 'POST',
                                                    headers: { Authorization: password }
                                                });
                                                if(res.ok) alert("Shop randomized successfully!");
                                                else alert("Failed to randomize shop.");
                                            }}
                                            className="bg-amber-600/10 border border-amber-500/20 hover:bg-amber-600 text-amber-400 hover:text-white font-extrabold py-3 px-4 rounded-xl text-xs transition-all mt-6 shadow-sm"
                                        >
                                            RANDOMIZE SHOP
                                        </button>
                                    </div>`;

code = code.replace(/\{(\/\* Clear Approved Users \*\/)\}/, randomizeSection + '\n                                    {$1}');
fs.writeFileSync('pages/Admin.tsx', code);
