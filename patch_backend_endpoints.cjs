const fs = require('fs');

// --- 1. urnisa-backend/server.js ---
let backendCode = fs.readFileSync('backend-references/urnisa-backend/server.js', 'utf-8');

backendCode = backendCode.replace(
    /if \(!scope \|\| scope === 'all' \|\| scope === 'tournament'\) \{/,
    `if (!scope || scope === 'all' || scope === 'nisaballs') {
            const updateRes = await NisathonEvent.updateMany({}, { $set: { nisaballAmount: 0 } });
            results.nisaballs = { success: true, updatedCount: updateRes.modifiedCount };
        }

        if (!scope || scope === 'all' || scope === 'tournament') {`
);
fs.writeFileSync('backend-references/urnisa-backend/server.js', backendCode);

// --- 2. urnisa-dbot/server.js ---
let dbotCode = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf-8');

// Add SystemSettings model
const systemSettingsModel = `
// SystemSettings Schema
const SystemSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed }
});
const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);
`;
dbotCode = dbotCode.replace(/const UserKeySchema = new mongoose\.Schema\(\{/, systemSettingsModel + '\nconst UserKeySchema = new mongoose.Schema({');

// Add endpoints
const newEndpoints = `
app.post('/api/admin/users/merge', auth, async (req, res) => {
    const { sourceUser, targetUser } = req.body;
    if (!sourceUser || !targetUser) return res.status(400).json({ error: "Invalid parameters" });
    try {
        const escapedSource = sourceUser.trim().replace(/[.*+?^\\$\\{\\}()|[\\]\\\\]/g, '\\\\$&');
        const sourceRegex = new RegExp(\`^\\\\s*\${escapedSource}\\\\s*$\`, 'i');
        
        await MinecraftLink.updateMany({ twitchUsername: sourceRegex }, { twitchUsername: targetUser.trim() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/shop/daily-offset', async (req, res) => {
    try {
        const doc = await SystemSettings.findOne({ key: 'shopOffset' });
        res.json({ offset: doc ? doc.value : 0 });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/shop/randomize', auth, async (req, res) => {
    try {
        let doc = await SystemSettings.findOne({ key: 'shopOffset' });
        if (!doc) {
            doc = new SystemSettings({ key: 'shopOffset', value: 0 });
        }
        doc.value = (doc.value || 0) + 1;
        await doc.save();
        res.json({ success: true, newOffset: doc.value });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
`;

dbotCode = dbotCode.replace(/\/\/ Maintenance Wipe Endpoint for Minecraft Data \(DANGER ZONE\)/, newEndpoints + '\n// Maintenance Wipe Endpoint for Minecraft Data (DANGER ZONE)');
fs.writeFileSync('backend-references/urnisa-dbot/server.js', dbotCode);

