const fs = require('fs');
let code = fs.readFileSync('pages/Nisathon.tsx', 'utf8');

// Replace the hardcoded constants logic
code = code.replace(/const CURRENCY_RATES = \[\s*\{\s*label: "\$5 USD", value: "1 Nisaball"\s*\},.*\];/s, "");
code = code.replace(/const TIMER_CONVERSION = "1 Nisaball = 10 Minutes";/, "");

// Find where CURRENCY_RATES is mapped and replace it
const dynamicRates = `
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">$\{stats.donationRate || 5} USD</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">{stats.subsRate || 2} Subs</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">{stats.bitsRate || 500} Bits</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
`;

code = code.replace(/\{CURRENCY_RATES\.map\(\(rate, idx\) => \([\s\S]*?\}\)\)\}/g, dynamicRates);
code = code.replace(/\{TIMER_CONVERSION\}/g, "1 Nisaball = {stats.timePerNb || 10} Minutes");

fs.writeFileSync('pages/Nisathon.tsx', code);
