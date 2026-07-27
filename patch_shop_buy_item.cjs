const fs = require('fs');
const file = 'backend-references/urnisa-dbot/server.js';
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
app.post('/api/shop/buy-item', async (req, res) => {
    const { discordId, item } = req.body;
    
    if (!discordId || !item || !item.id || !item.price) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.twitchUsername) {
            return res.status(400).json({ error: "No Twitch account linked!" });
        }

        const backendUrl = process.env.BACKEND_URL || 'https://urnisa-backend-21ls.onrender.com';
        
        let currentNisaballs = 0;
        try {
            const balanceRes = await axios.get(\`\${backendUrl}/api/nisathon/user/\${encodeURIComponent(link.twitchUsername.trim())}\`);
            currentNisaballs = balanceRes.data.totalNisaballs || 0;
        } catch (err) {
            console.error("Failed to fetch user balance:", err);
            return res.status(500).json({ error: "Failed to verify Nisaballs balance." });
        }

        const totalCost = item.price;
        if (currentNisaballs < totalCost) {
            return res.status(400).json({ error: \`Insufficient Nisaballs! Need \${totalCost} but have \${Math.floor(currentNisaballs)}.\` });
        }

        // Deduct Nisaballs
        try {
            const deductRes = await axios.post(\`\${backendUrl}/api/nisathon/test-event\`, {
                type: 'shop',
                user: link.twitchUsername,
                amount: -totalCost,
                tier: '1000',
                isNisathon: false,
                hidden: true
            }, {
                headers: { 'Authorization': ADMIN_PASSWORD || "admin" }
            });

            if (!deductRes.data || deductRes.data.error) throw new Error("Failed deduction");
        } catch (err) {
            console.error("Payment failed:", err);
            return res.status(500).json({ error: "Failed to process payment." });
        }

        // Save to inventory
        const newItem = new InventoryItem({
            discordId,
            itemId: item.id.toString(),
            name: item.name,
            type: item.type || 'Item',
            rarity: item.rarity || 'COMMON',
            image: item.image || '',
            claimed: false,
            receivedAt: new Date()
        });

        await newItem.save();

        res.json({ success: true, item: newItem, newBalance: Math.floor(currentNisaballs - totalCost) });
    } catch (e) {
        console.error("Shop item purchase error:", e);
        res.status(500).json({ error: "Internal server error." });
    }
});
`;

if (!content.includes('/api/shop/buy-item')) {
    content = content.replace("app.post('/api/shop/buy', async (req, res) => {", newEndpoint + "\napp.post('/api/shop/buy', async (req, res) => {");
    fs.writeFileSync(file, content);
    console.log("Patched server.js with /api/shop/buy-item");
} else {
    console.log("Already patched");
}
