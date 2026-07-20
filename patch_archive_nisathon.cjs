const fs = require('fs');
let code = fs.readFileSync('pages/ArchiveNisathon.tsx', 'utf8');

const target = `{CURRENCY_RATES.map((rate, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                            <span className="text-brand-accent font-bold">{rate.label}</span>
                                            <span className="text-gray-500 font-bold text-lg">→</span>
                                            <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">{rate.value}</span>
                                        </li>
                                    ))}`;

const replacement = `
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">$\{stats?.donationRate || 5} USD</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">{stats?.subsRate || 2} Subs</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-brand-accent font-bold">{stats?.bitsRate || 500} Bits</span>
                                        <span className="text-gray-500 font-bold text-lg">→</span>
                                        <span className="text-white font-bold bg-black/30 px-2 py-1 rounded-lg">1 Nisaball</span>
                                    </li>
`;

code = code.replace(target, replacement);

code = code.replace(/const CURRENCY_RATES = \[\s*\{\s*label: "\$5 USD", value: "1 Nisaball"\s*\},.*\];/s, "");
code = code.replace(/const TIMER_CONVERSION = "1 Nisaball = 10 Minutes";/, "");
code = code.replace(/\{TIMER_CONVERSION\}/g, "1 Nisaball = {stats?.timePerNb || 10} Minutes");

code = code.replace(/interface NisaballWidgetProps \{/, 'interface NisaballWidgetProps {\n    stats?: any;');
code = code.replace(/const NisaballWidget: React\.FC<NisaballWidgetProps> = \(\{\s*currentSubs/, 'const NisaballWidget: React.FC<NisaballWidgetProps> = ({ stats,\n    currentSubs');
code = code.replace(/className="h-full"\s*eventName=\{archiveId\}/, 'className="h-full"\n                            stats={stats}\n                            eventName={archiveId}');
code = code.replace(/className="h-full"\s*eventName=\{archive\.id\}/, 'className="h-full"\n                            stats={stats}\n                            eventName={archive.id}');

code = code.replace(/const nbFromSubs = currentSubs \* 0\.5;/, 'const nbFromSubs = currentSubs / (stats?.subsRate || 2);');
code = code.replace(/const nbFromBits = currentBits \* 0\.002;/, 'const nbFromBits = currentBits / (stats?.bitsRate || 500);');
code = code.replace(/const nbFromDonations = currentDonations \* 0\.2;/, 'const nbFromDonations = currentDonations / (stats?.donationRate || 5);');

code = code.replace(/rate="2 Subs = 1 NB"/g, 'rate={`${stats?.subsRate || 2} Subs = 1 NB`}');
code = code.replace(/rate="\$5 USD = 1 NB"/g, 'rate={`$${stats?.donationRate || 5} USD = 1 NB`}');
code = code.replace(/rate="500 Bits = 1 NB"/g, 'rate={`${stats?.bitsRate || 500} Bits = 1 NB`}');


fs.writeFileSync('pages/ArchiveNisathon.tsx', code);
