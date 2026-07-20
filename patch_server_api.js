const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf8');

// Insert after app.post('/api/nisathon/reset'
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
