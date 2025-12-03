const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({ origin: '*' }));

// --- CONFIGURATION ---
let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.trim() : "";
if (DISCORD_BOT_TOKEN.startsWith("Bot ")) DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN.substring(4).trim();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

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
    minecraftUsername: { type: String, required: true, unique: true }, // Ensure MC username is unique across all links
    linkedAt: { type: Date, default: Date.now }
});
const MinecraftLink = mongoose.model('MinecraftLink', MinecraftLinkSchema);

// --- CHAT PREVIEW LOGIC (EXISTING) ---
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
    const guildId = '1336782145833668729'; 

    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

    try {
        const messages = await fetchDiscordMessages(channelId);
        const enhancedMessages = await Promise.all(messages.map(async (msg) => {
            const memberData = await fetchGuildMember(guildId, msg.author.id);
            return {
                ...msg,
                member: memberData ? { nick: memberData.nick, avatar: memberData.avatar } : null
            };
        }));
        res.json(enhancedMessages.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// 2. Discord OAuth Exchange
app.post('/api/auth/discord', async (req, res) => {
    const { code, redirectUri } = req.body;

    if (!CLIENT_ID || !CLIENT_SECRET) {
        return res.status(500).json({ error: "Server missing Discord Client Config" });
    }

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
            avatar: userData.avatar 
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` 
                : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`,
            minecraftUsername: mcUsername
        });

    } catch (error) {
        console.error("OAuth Error:", error.response?.data || error.message);
        res.status(400).json({ error: "Failed to authenticate with Discord" });
    }
});

// 3. Link Minecraft Account
app.post('/api/minecraft/link', async (req, res) => {
    const { discordId, discordUsername, discordAvatar, minecraftUsername } = req.body;

    if (!discordId || !minecraftUsername) return res.status(400).json({ error: "Missing fields" });
    if (mongoose.connection.readyState !== 1) return res.status(500).json({ error: "Database unavailable" });

    try {
        // Check if this MC username is already linked to SOMEONE ELSE
        const existingLink = await MinecraftLink.findOne({ minecraftUsername: new RegExp(`^${minecraftUsername}$`, 'i') });
        
        if (existingLink && existingLink.discordId !== discordId) {
            return res.status(409).json({ error: "Username already linked to another account" });
        }

        await MinecraftLink.findOneAndUpdate(
            { discordId },
            { 
                discordUsername,
                discordAvatar,
                minecraftUsername, // Mongoose unique index will also catch duplicates if regex check misses
                linkedAt: new Date()
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, minecraftUsername });
    } catch (error) {
        // Handle Mongoose unique error (E11000)
        if (error.code === 11000) {
             return res.status(409).json({ error: "Username already linked" });
        }
        res.status(500).json({ error: "Failed to save link" });
    }
});

// 4. Unlink Minecraft Account
app.delete('/api/minecraft/link', async (req, res) => {
    const { discordId } = req.body;

    if (!discordId) return res.status(400).json({ error: "Missing Discord ID" });
    if (mongoose.connection.readyState !== 1) return res.status(500).json({ error: "Database unavailable" });

    try {
        await MinecraftLink.findOneAndDelete({ discordId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Failed to unlink" });
    }
});

// --- CROSS-PING KEEP ALIVE ---
const SELF_URL = 'https://urnisa-bot.onrender.com';
const BACKEND_URL = 'https://urnisa-backend.onrender.com';

setInterval(() => {
    axios.get(SELF_URL).catch(() => {});
    axios.get(BACKEND_URL).catch(() => {});
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🤖 Discord Bot Service running on port ${PORT}`);
});