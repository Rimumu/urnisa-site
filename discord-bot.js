const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

app.use(express.json());
app.use(cors({ origin: '*' }));

// --- CONFIGURATION ---
let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.trim() : "";
if (DISCORD_BOT_TOKEN.startsWith("Bot ")) DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN.substring(4).trim();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

const GUILD_ID = '1336782145833668729'; 
const ROLE_SUBSCRIBER = '1339227370833448980';
const ROLE_FRIEND = '1445655680735383675';

// --- DATABASE ---
if (MONGO_URI) {
    mongoose.set('strictQuery', false);
    mongoose.connect(MONGO_URI)
        .then(() => console.log("✅ [BotDB] MongoDB Connected"))
        .catch(e => console.error("❌ [BotDB] Error:", e));
} else {
    console.warn("⚠️ [BotDB] MONGO_URI missing. Account linking will not save.");
}

const MinecraftLinkSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    discordUsername: String,
    discordAvatar: String,
    minecraftUsername: { type: String, required: true, unique: true },
    linkedAt: { type: Date, default: Date.now }
});
const MinecraftLink = mongoose.model('MinecraftLink', MinecraftLinkSchema);

// Whitelist Application Schema
const WhitelistAppSchema = new mongoose.Schema({
    discordId: String,
    discordUsername: String,
    discordAvatar: String,
    minecraftUsername: String,
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    appliedAt: { type: Date, default: Date.now }
});
const WhitelistApp = mongoose.model('WhitelistApp', WhitelistAppSchema);


// --- CHAT PREVIEW LOGIC ---
const fetchDiscordMessages = async (channelId) => {
    if (!DISCORD_BOT_TOKEN) throw new Error("Missing Bot Token");
    try {
        const response = await axios.get(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
            params: { limit: 15 }
        });
        return response.data;
    } catch (error) {
        console.error("Discord API Error:", error.response?.status, error.response?.data || error.message);
        throw error;
    }
};

const fetchGuildMember = async (guildId, userId) => {
    if (!DISCORD_BOT_TOKEN) return null;
    try {
        const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
        });
        return response.data;
    } catch (error) { return null; }
};

// --- ROUTES ---

app.get('/', (req, res) => res.send('Urnisa Discord Service Active'));

// 1. Chat Preview
app.get('/api/messages', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });
    try {
        const messages = await fetchDiscordMessages(channelId);
        const enhancedMessages = await Promise.all(messages.map(async (msg) => {
            const memberData = await fetchGuildMember(GUILD_ID, msg.author.id);
            return {
                ...msg,
                member: memberData ? { nick: memberData.nick, avatar: memberData.avatar } : null
            };
        }));
        res.json(enhancedMessages.reverse());
    } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// 2. OAuth
app.post('/api/auth/discord', async (req, res) => {
    const { code, redirectUri } = req.body;
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: "Config missing" });

    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenResponse.data;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userData = userResponse.data;
        let mcUsername = null;
        
        if (mongoose.connection.readyState === 1) {
            const existing = await MinecraftLink.findOne({ discordId: userData.id });
            if (existing) mcUsername = existing.minecraftUsername;
        }

        res.json({
            id: userData.id,
            username: userData.username,
            global_name: userData.global_name,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`,
            minecraftUsername: mcUsername
        });

    } catch (error) { res.status(400).json({ error: "Auth Failed" }); }
});

// 3. Link Account
app.post('/api/minecraft/link', async (req, res) => {
    const { discordId, discordUsername, discordAvatar, minecraftUsername } = req.body;
    if (!discordId || !minecraftUsername) return res.status(400).json({ error: "Missing fields" });

    try {
        const existingLink = await MinecraftLink.findOne({ minecraftUsername: new RegExp(`^${minecraftUsername}$`, 'i') });
        if (existingLink && existingLink.discordId !== discordId) return res.status(409).json({ error: "Username taken" });

        await MinecraftLink.findOneAndUpdate(
            { discordId },
            { discordUsername, discordAvatar, minecraftUsername, linkedAt: new Date() },
            { upsert: true, new: true }
        );
        res.json({ success: true, minecraftUsername });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: "Username taken" });
        res.status(500).json({ error: "Failed" });
    }
});

app.delete('/api/minecraft/link', async (req, res) => {
    const { discordId } = req.body;
    try {
        await MinecraftLink.findOneAndDelete({ discordId });
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: "Failed" }); }
});

// 4. WHITELIST APPLICATION (USER)
app.post('/api/whitelist/apply', async (req, res) => {
    const { discordId } = req.body;
    if (!discordId) return res.status(400).json({ error: "Missing ID" });

    // 1. Check DB Link
    const link = await MinecraftLink.findOne({ discordId });
    if (!link || !link.minecraftUsername) return res.status(400).json({ error: "No Minecraft account linked!" });

    // 2. Check existing pending app
    const existingApp = await WhitelistApp.findOne({ discordId, status: 'pending' });
    if (existingApp) return res.status(409).json({ error: "You already have a pending application!" });
    
    // 3. Check if already approved (optional, prevents spam)
    const approvedApp = await WhitelistApp.findOne({ discordId, status: 'approved' });
    if (approvedApp) return res.status(200).json({ message: "You are already whitelisted!" });

    // 4. Check Discord Roles
    const member = await fetchGuildMember(GUILD_ID, discordId);
    if (!member) return res.status(403).json({ error: "You are not in the Discord server!" });

    const roles = member.roles || [];
    const hasSub = roles.includes(ROLE_SUBSCRIBER);
    const hasFriend = roles.includes(ROLE_FRIEND);

    if (!hasSub && !hasFriend) return res.status(403).json({ error: "You need to be a Subscriber!" });

    // 5. Save Application
    await WhitelistApp.create({
        discordId,
        discordUsername: link.discordUsername,
        discordAvatar: link.discordAvatar,
        minecraftUsername: link.minecraftUsername,
        status: 'pending',
        appliedAt: new Date()
    });
    
    console.log(`📝 New Whitelist Application: ${link.minecraftUsername}`);
    res.json({ success: true, message: "Application Sent! Please wait for admin approval." });
});

// 5. ADMIN WHITELIST MANAGEMENT
const auth = (req, res, next) => {
    if (req.headers.authorization !== ADMIN_PASSWORD) {
        console.log(`❌ Admin Auth Failed: '${req.headers.authorization}' vs '${ADMIN_PASSWORD}'`);
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.get('/api/admin/whitelist', auth, async (req, res) => {
    try {
        console.log("🔍 Fetching Whitelist Apps...");
        const apps = await WhitelistApp.find({ status: 'pending' }).sort({ appliedAt: 1 });
        console.log(`   Found ${apps.length} pending apps.`);
        res.json(apps);
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/whitelist/approve', auth, async (req, res) => {
    const { id } = req.body;
    try {
        const app = await WhitelistApp.findById(id);
        if (!app) return res.status(404).json({ error: "App not found" });

        console.log(`✅ Approving: ${app.minecraftUsername}`);
        
        app.status = 'approved';
        await app.save();
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/whitelist/reject', auth, async (req, res) => {
    const { id } = req.body;
    try {
        console.log(`❌ Rejecting app ID: ${id}`);
        await WhitelistApp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- KEEP ALIVE ---
const SELF_URL = 'https://urnisa-bot.onrender.com';
const BACKEND_URL = 'https://urnisa-backend.onrender.com';

setInterval(() => {
    axios.get(SELF_URL).catch(() => {});
    axios.get(BACKEND_URL).catch(() => {});
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🤖 Discord Bot Service running on port ${PORT}`);
});