const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf-8');

const oldReset = `        const wallet = await UserKey.findOne({ discordId: targetDiscordId });
        if (!wallet) {
            return res.status(404).json({ error: "User wallet/history not found." });
        }

        wallet.lastDailyClaim = null; // Clear the date
        await wallet.save();

        res.json({ success: true, message: \`Daily timer reset for \${targetDiscordId}\` });`;

const newReset = `        let wallet = await UserKey.findOne({ discordId: targetDiscordId });
        if (!wallet) {
            wallet = new UserKey({ discordId: targetDiscordId });
        }

        wallet.lastDailyClaim = null; // Clear the date
        await wallet.save();

        res.json({ success: true, message: \`Daily timer reset for \${targetDiscordId}\` });`;

code = code.replace(oldReset, newReset);
fs.writeFileSync('backend-references/urnisa-dbot/server.js', code);
