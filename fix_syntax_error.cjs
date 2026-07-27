const fs = require('fs');
let code = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');

// Find the bad replacement string
const badCodeIndex = code.indexOf("const sourceRegex = new RegExp(\`^\\\\s*\${escapedSource}\\\\s*");

if (badCodeIndex !== -1) {
    // Delete everything from the bad replacement all the way down to where we appended the new endpoints!
    // Wait, the new endpoints start at "app.post('/api/admin/maintenance/wipe-minecraft-data'"
    const newEndpointsIndex = code.indexOf("app.post('/api/admin/maintenance/wipe-minecraft-data'");
    if (newEndpointsIndex !== -1) {
        // Find the start of the bad app.post('/api/admin/users/merge' block which I injected
        const mergeBlockStart = code.lastIndexOf("app.post('/api/admin/users/merge'", badCodeIndex);
        if (mergeBlockStart !== -1) {
            const firstPart = code.substring(0, mergeBlockStart);
            const secondPart = code.substring(newEndpointsIndex);

            // Re-insert the proper merge block
            const mergeBlock = `app.post('/api/admin/users/merge', auth, async (req, res) => {
    const { sourceUser, targetUser } = req.body;
    if (!sourceUser || !targetUser) return res.status(400).json({ error: "Invalid parameters" });
    try {
        const escapedSource = sourceUser.trim().replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
        const sourceRegex = new RegExp(\`^\\\\s*\\\${escapedSource}\\\\s*$\`, 'i');
        
        await MinecraftLink.updateMany({ twitchUsername: sourceRegex }, { twitchUsername: targetUser.trim() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

`;
            code = firstPart + mergeBlock + secondPart;
            fs.writeFileSync('backend-references/urnisa-dbot/server.js', code);
            console.log("Fixed syntax error!");
        }
    }
} else {
    console.log("Could not find bad code index.");
}
