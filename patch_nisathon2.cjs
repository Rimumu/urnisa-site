const fs = require('fs');
let code = fs.readFileSync('pages/Nisathon.tsx', 'utf8');

const target = `{CURRENCY_RATES.map((rate, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-brand-accent font-bold">{rate.label}</span>
                                            <span className="text-gray-500 font-bold text-lg">→</span>
                                            <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">{rate.value}</span>
                                        </li>
                                    ))}`;

const replacement = `
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

code = code.replace(target, replacement);
fs.writeFileSync('pages/Nisathon.tsx', code);
