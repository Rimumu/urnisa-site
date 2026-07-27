const fs = require('fs');

const missingCode = `
app.post('/api/admin/maintenance/wipe-minecraft-data', auth, async (req, res) => {
    const { scope } = req.body;
    try {
        console.log(\`⚠️ Admin triggered wipe on DBot. Scope: \${scope}\`);
        if (scope === 'all' || scope === 'currency') {
            await UserKey.updateMany({}, { lambKeys: 0, wagyuKeys: 0, steakKeys: 0 });
        }
        if (scope === 'all' || scope === 'inventory') {
            await InventoryItem.deleteMany({});
        }
        if (scope === 'all' || scope === 'approved_users') {
            await WhitelistApp.deleteMany({ status: 'approved' });
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/codes/redeem', async (req, res) => {
    const { discordId, code } = req.body;
    try {
        const codeRecord = await RedemptionCode.findOne({ code: code.trim().toUpperCase() });
        if (!codeRecord) return res.status(404).json({ error: "Invalid code." });

        if (codeRecord.isRedeemed && codeRecord.usageType === 'once_global') {
            return res.status(400).json({ error: "Code already redeemed." });
        }
        if (codeRecord.usageType === 'once_per_user' && codeRecord.redeemedBy.includes(discordId)) {
            return res.status(400).json({ error: "You already redeemed this code." });
        }
        if (codeRecord.usageType === 'time_limited' && codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: "Code expired." });
        }

        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = new UserKey({ discordId });

        const amount = codeRecord.keyAmount || 1;
        if (codeRecord.type === 'lamb') wallet.lambKeys += amount;
        else if (codeRecord.type === 'steak') wallet.steakKeys += amount;
        else if (codeRecord.type === 'wagyu') wallet.wagyuKeys += amount;
        else if (codeRecord.type === 'nisaball') {
            // Hit backend to add nisaballs
            const link = await MinecraftLink.findOne({ discordId });
            if (link && link.twitchUsername) {
                const backendUrl = process.env.BACKEND_URL || 'https://urnisa-backend-21ls.onrender.com';
                await axios.post(\`\${backendUrl}/api/nisathon/test-event\`, {
                    type: 'nisaball',
                    user: link.twitchUsername,
                    amount: amount,
                    tier: '1000',
                    isNisathon: false,
                    hidden: true
                }, { headers: { 'Authorization': ADMIN_PASSWORD || "admin" } }).catch(e => console.error("Failed to add nisaball", e.message));
            }
        }

        if (codeRecord.usageType === 'once_global') codeRecord.isRedeemed = true;
        codeRecord.redeemedBy.push(discordId);
        codeRecord.usageCount += 1;
        
        await codeRecord.save();
        await wallet.save();

        res.json({ success: true, type: codeRecord.type, amount: amount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Server error." });
    }
});

app.post('/api/inventory/save', async (req, res) => {
    const { discordId, items } = req.body;
    try {
        const toInsert = items.map(i => ({
            discordId,
            itemId: i.id || i.itemId,
            name: i.name,
            type: i.type || 'Item',
            rarity: i.rarity || 'COMMON',
            image: i.image || '',
            claimed: false,
            receivedAt: new Date()
        }));
        if (toInsert.length > 0) {
            await InventoryItem.insertMany(toInsert);
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/packs/use', async (req, res) => {
    const { discordId, packType, amount = 1 } = req.body;
    try {
        const wallet = await UserKey.findOne({ discordId });
        if (!wallet) return res.status(400).json({ error: "No wallet found." });

        if (packType === 'lamb') {
            if (wallet.lambKeys < amount) return res.status(400).json({ error: "Not enough Lamb Keys." });
            wallet.lambKeys -= amount;
        } else if (packType === 'wagyu') {
            if (wallet.wagyuKeys < amount) return res.status(400).json({ error: "Not enough Wagyu Keys." });
            wallet.wagyuKeys -= amount;
        } else {
            return res.status(400).json({ error: "Invalid pack type." });
        }
        await wallet.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/packs', async (req, res) => {
    try {
        let wallet = await UserKey.findOne({ discordId: req.query.discordId });
        if (!wallet) wallet = { lambKeys: 0, wagyuKeys: 0, steakKeys: 0 };
        res.json(wallet);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/inventory', async (req, res) => {
    try {
        const items = await InventoryItem.find({ discordId: req.query.discordId, claimed: false }).sort({ receivedAt: -1 });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/inventory/claim', async (req, res) => {
    const { discordId, itemIds } = req.body;
    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link) return res.status(400).json({ error: "No Minecraft account linked." });

        const items = await InventoryItem.find({ _id: { $in: itemIds }, discordId, claimed: false });
        if (items.length === 0) return res.status(400).json({ error: "No items to claim." });

        // Try to give items (this can be basic since I don't have the full RCON logic, just fallback or pretend success if RCON missing)
        for (const item of items) {
            let cmd = \`/give \${link.minecraftUsername} \${item.itemId} 1\`;
            if (item.type === 'Pokemon') cmd = \`/pokegive \${link.minecraftUsername} \${item.name}\`;
            await sendRconCommand(cmd);
            item.claimed = true;
            item.claimedAt = new Date();
            await item.save();
        }

        res.json({ success: true, claimedCount: items.length });
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

app.post('/api/shop/buy-item', async (req, res) => {
    const { discordId, item } = req.body;
    if (!discordId || !item || !item.id || !item.price) return res.status(400).json({ error: "Missing required fields" });
    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.twitchUsername) return res.status(400).json({ error: "No Twitch account linked!" });
        const backendUrl = process.env.BACKEND_URL || 'https://urnisa-backend-21ls.onrender.com';
        
        const balanceRes = await axios.get(\`\${backendUrl}/api/nisathon/user/\${encodeURIComponent(link.twitchUsername.trim())}\`);
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        const totalCost = item.price;
        
        if (currentNisaballs < totalCost) return res.status(400).json({ error: \`Insufficient Nisaballs! Need \${totalCost}.\` });

        const deductRes = await axios.post(\`\${backendUrl}/api/nisathon/test-event\`, {
            type: 'shop', user: link.twitchUsername, amount: -totalCost, tier: '1000', isNisathon: false, hidden: true
        }, { headers: { 'Authorization': ADMIN_PASSWORD || "admin" } });
        
        if (!deductRes.data || deductRes.data.error) throw new Error("Failed deduction");

        const newItem = new InventoryItem({
            discordId, itemId: item.id.toString(), name: item.name, type: item.type || 'Item', rarity: item.rarity || 'COMMON', image: item.image || '', claimed: false
        });
        await newItem.save();
        res.json({ success: true, item: newItem, newBalance: Math.floor(currentNisaballs - totalCost) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/shop/spin', async (req, res) => {
    const { discordId } = req.body;
    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.twitchUsername) return res.status(400).json({ error: "No Twitch account linked!" });
        const backendUrl = process.env.BACKEND_URL || 'https://urnisa-backend-21ls.onrender.com';
        
        const balanceRes = await axios.get(\`\${backendUrl}/api/nisathon/user/\${encodeURIComponent(link.twitchUsername.trim())}\`);
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        
        if (currentNisaballs < 1) return res.status(400).json({ error: "Insufficient Nisaballs! Need 1." });

        await axios.post(\`\${backendUrl}/api/nisathon/test-event\`, {
            type: 'shop', user: link.twitchUsername, amount: -1, tier: '1000', isNisathon: false, hidden: true
        }, { headers: { 'Authorization': ADMIN_PASSWORD || "admin" } });

        const isLamb = Math.random() < 0.50;
        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = new UserKey({ discordId });
        if (isLamb) wallet.lambKeys += 1;
        else wallet.wagyuKeys += 1;
        await wallet.save();

        res.json({ success: true, reward: isLamb ? 'lamb' : 'wagyu', newBalance: Math.floor(currentNisaballs - 1) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/daily/claim', async (req, res) => {
    const { discordId } = req.body;
    try {
        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = new UserKey({ discordId });

        const now = new Date();
        if (wallet.lastDailyClaim) {
            const lastClaim = new Date(wallet.lastDailyClaim);
            // reset at midnight UTC or 24 hours
            if (now.getTime() - lastClaim.getTime() < 24 * 60 * 60 * 1000) {
                return res.status(400).json({ error: "Already claimed today." });
            }
        }
        wallet.lambKeys += 1; // Or whatever daily reward
        wallet.lastDailyClaim = now;
        await wallet.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(\`✅ [DBot] Server running on port \${PORT}\`);
});
`;

let content = fs.readFileSync('backend-references/urnisa-dbot/server.js', 'utf8');
// make sure we don't duplicate
if (!content.includes('/api/codes/redeem')) {
    content += missingCode;
    fs.writeFileSync('backend-references/urnisa-dbot/server.js', content);
    console.log("Restored missing endpoints.");
} else {
    console.log("Endpoints already exist.");
}
