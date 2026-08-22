const fs = require('fs');
let file = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf8');

// For Duo Save Team
const duoTarget = `        // Verify user is part of the duo
        if (duo.player1DiscordId !== discordId && duo.player2DiscordId !== discordId) {
            return res.status(403).json({ error: "You are not part of this duo." });
        }

        // Check if locked
        if (duo.isLocked) {
            return res.status(403).json({ error: "Team is locked and cannot be edited." });
        }

        // Merge logic: Only trust the slots the player is allowed to edit.
        let mergedTeam = [...(duo.team || [])];
        while (mergedTeam.length < 6) mergedTeam.push(null);
        
        if (duo.player1DiscordId === discordId) {
            mergedTeam[0] = team[0] || null;
            mergedTeam[1] = team[1] || null;
            mergedTeam[2] = team[2] || null;
        } 
        if (duo.player2DiscordId === discordId) {
            mergedTeam[3] = team[3] || null;
            mergedTeam[4] = team[4] || null;
            mergedTeam[5] = team[5] || null;
        }`;

const duoReplace = `        let isAdmin = req.headers['x-admin-override'] === 'GreatRimu_Override_True';

        // Verify user is part of the duo or admin
        if (!isAdmin && duo.player1DiscordId !== discordId && duo.player2DiscordId !== discordId) {
            return res.status(403).json({ error: "You are not part of this duo." });
        }

        // Check if locked
        if (!isAdmin && duo.isLocked) {
            return res.status(403).json({ error: "Team is locked and cannot be edited." });
        }

        // Merge logic: Only trust the slots the player is allowed to edit.
        let mergedTeam = [...(duo.team || [])];
        while (mergedTeam.length < 6) mergedTeam.push(null);
        
        if (isAdmin) {
            mergedTeam = team;
        } else {
            if (duo.player1DiscordId === discordId) {
                mergedTeam[0] = team[0] || null;
                mergedTeam[1] = team[1] || null;
                mergedTeam[2] = team[2] || null;
            } 
            if (duo.player2DiscordId === discordId) {
                mergedTeam[3] = team[3] || null;
                mergedTeam[4] = team[4] || null;
                mergedTeam[5] = team[5] || null;
            }
        }`;

if (file.includes(duoTarget)) file = file.replace(duoTarget, duoReplace);

// For Singles Save Team
const singleTarget = `app.post('/api/tournament/save-team', async (req, res) => {
    const { discordId, team, seasonId } = req.body;
    if (!discordId || !team) return res.status(400).json({ error: "Missing data" });

    try {
        const player = await TournamentPlayer.findOne({ discordId, seasonId });
        if (!player) return res.status(404).json({ error: "Player not found" });`;

const singleReplace = `app.post('/api/tournament/save-team', async (req, res) => {
    const { discordId, team, seasonId } = req.body;
    if (!discordId || !team) return res.status(400).json({ error: "Missing data" });

    try {
        let isAdmin = req.headers['x-admin-override'] === 'GreatRimu_Override_True';
        const targetDiscordId = (isAdmin && req.headers['x-admin-target-id']) ? req.headers['x-admin-target-id'] : discordId;
        
        const player = await TournamentPlayer.findOne({ discordId: targetDiscordId, seasonId });
        if (!player) return res.status(404).json({ error: "Player not found" });
        
        if (isAdmin) {
            // allows admin to bypass lock
        } else if (player.isLocked) {
            return res.status(403).json({ error: "Team is locked and cannot be edited." });
        }`;

if (file.includes(singleTarget)) file = file.replace(singleTarget, singleReplace);

// Wait, the original Singles save-team had a lock check:
const singleLockTarget = `        if (player.isLocked) return res.status(403).json({ error: "Team is locked" });`;
const singleLockReplace = `        if (!isAdmin && player.isLocked) return res.status(403).json({ error: "Team is locked" });`;

if (file.includes(singleLockTarget)) file = file.replace(singleLockTarget, singleLockReplace);

fs.writeFileSync('backend-references/urnisa-backend/server.js', file, 'utf8');
console.log("Patched backend for Admin override");
