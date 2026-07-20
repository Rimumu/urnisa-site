const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf8');

code = code.replace(/if \(tStr\.includes\('3000'\) \|\| tStr === '3'\) \{ tVal = 2\.0; tLbl = "Tier 3"; \}/g, 
  'if (tStr.includes(\'3000\') || tStr === \'3\') { tVal = 4 * (1 / (stats.subsRate || 2)); tLbl = "Tier 3"; }');
code = code.replace(/else if \(tStr\.includes\('2000'\) \|\| tStr === '2'\) \{ tVal = 1\.0; tLbl = "Tier 2"; \}/g,
  'else if (tStr.includes(\'2000\') || tStr === \'2\') { tVal = 2 * (1 / (stats.subsRate || 2)); tLbl = "Tier 2"; }');
code = code.replace(/else if \(tStr\.includes\('prime'\)\) \{ tVal = 0\.5; tLbl = "Prime"; \}/g,
  'else if (tStr.includes(\'prime\')) { tVal = 1 / (stats.subsRate || 2); tLbl = "Prime"; }');
code = code.replace(/earnedNisaballs = 0\.5 \* amount; \/\/ 0\.5 NB per gift sub/g,
  'earnedNisaballs = (1 / (stats.subsRate || 2)) * amount; // NB per gift sub');
code = code.replace(/earnedNisaballs = amount \* 0\.002;/g,
  'earnedNisaballs = amount / (stats.bitsRate || 500);');
code = code.replace(/earnedNisaballs = amount \* 0\.2;/g,
  'earnedNisaballs = amount / (stats.donationRate || 5);');
code = code.replace(/const msAdd = earnedNisaballs \* 10 \* mult \* 60000;/g,
  'const msAdd = earnedNisaballs * (stats.timePerNb || 10) * mult * 60000;');
code = code.replace(/const msToRemove = event\.nisaballAmount \* 10 \* 60 \* 1000;/g,
  'const msToRemove = event.nisaballAmount * (stats.timePerNb || 10) * 60 * 1000;');

const apiEndpoint = `
app.post('/api/nisathon/settings', auth, async (req, res) => {
    try {
        const { subsRate, bitsRate, donationRate, timePerNb } = req.body;
        await NisathonStats.findOneAndUpdate({ key: 'main' }, {
            subsRate: subsRate || 2,
            bitsRate: bitsRate || 500,
            donationRate: donationRate || 5,
            timePerNb: timePerNb || 10
        });
        res.json({ success: true, message: "Settings Updated" });
    } catch (e) {
        res.status(500).json({ error: "Failed to update settings" });
    }
});
`;

code = code.replace(/app\.post\('\/api\/nisathon\/reset', auth, async \(req, res\) => \{/, apiEndpoint + "\napp.post('/api/nisathon/reset', auth, async (req, res) => {");

fs.writeFileSync('backend-references/urnisa-backend/server.js', code);
