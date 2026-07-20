const fs = require('fs');
let code = fs.readFileSync('pages/Nisathon.tsx', 'utf8');

code = code.replace(/interface NisaballWidgetProps \{/, 'interface NisaballWidgetProps {\n    stats: any;');
code = code.replace(/const NisaballWidget: React\.FC<NisaballWidgetProps> = \(\{\s*currentSubs/, 'const NisaballWidget: React.FC<NisaballWidgetProps> = ({ stats,\n    currentSubs');
code = code.replace(/className="h-full"\s*onDonateClick=\{\(\) => setShowDonatePopup\(true\)\}/, 'className="h-full"\n                            stats={stats}\n                            onDonateClick={() => setShowDonatePopup(true)}');

// Wait! Also the rates calculation inside the main component needs updating!
// Currently it is:
// const nbFromSubs = currentSubs * 0.5;
// const nbFromBits = currentBits * 0.002;
// const nbFromDonations = currentDonations * 0.2;
code = code.replace(/const nbFromSubs = currentSubs \* 0\.5;/, 'const nbFromSubs = currentSubs / (stats.subsRate || 2);');
code = code.replace(/const nbFromBits = currentBits \* 0\.002;/, 'const nbFromBits = currentBits / (stats.bitsRate || 500);');
code = code.replace(/const nbFromDonations = currentDonations \* 0\.2;/, 'const nbFromDonations = currentDonations / (stats.donationRate || 5);');

fs.writeFileSync('pages/Nisathon.tsx', code);
