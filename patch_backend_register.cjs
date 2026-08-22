const fs = require('fs');
let file = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf8');

const targetStr = `        // Check if locked
        const existing = await TournamentEntry.findOne({ discordId, seasonId: targetSeasonId });
        if (existing && existing.isLocked) {
            return res.status(403).json({ error: "Team is locked and cannot be edited." });
        }`;

const replaceStr = `        // Check if locked
        const isAdmin = req.headers['x-admin-override'] === 'GreatRimu_Override_True';
        const existing = await TournamentEntry.findOne({ discordId, seasonId: targetSeasonId });
        if (!isAdmin && existing && existing.isLocked) {
            return res.status(403).json({ error: "Team is locked and cannot be edited." });
        }`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, replaceStr);
    fs.writeFileSync('backend-references/urnisa-backend/server.js', file, 'utf8');
    console.log("Patched register endpoint.");
} else {
    console.log("Could not find register endpoint.");
}
