const fs = require('fs');
let code = fs.readFileSync('pages/Nisathon.tsx', 'utf8');

code = code.replace(/rate="2 Subs = 1 NB"/, 'rate={`${stats.subsRate || 2} Subs = 1 NB`}');
code = code.replace(/rate="\$5 USD = 1 NB"/, 'rate={`$${stats.donationRate || 5} USD = 1 NB`}');
code = code.replace(/rate="500 Bits = 1 NB"/, 'rate={`${stats.bitsRate || 500} Bits = 1 NB`}');

fs.writeFileSync('pages/Nisathon.tsx', code);
