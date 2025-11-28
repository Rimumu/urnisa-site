
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(cors({ origin: '*' }));

let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.trim() : "";
if (DISCORD_BOT_TOKEN.startsWith("Bot ")) DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN.substring(4).trim();

// Logging to verify token presence (masked)
if (!DISCORD_BOT_TOKEN) {
    console.error("❌ ERROR: DISCORD_BOT_TOKEN is missing in Environment Variables!");
} else {
    console.log(`✅ Bot Token loaded (starts with: ${DISCORD_BOT_TOKEN.substring(0, 5)}...)`);
}

// Helper to fetch messages from Discord API
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

// Helper to fetch Guild Member details (Nickname, Avatar)
const fetchGuildMember = async (guildId, userId) => {
    if (!DISCORD_BOT_TOKEN) return null;
    try {
        const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
        });
        return response.data;
    } catch (error) {
        return null; 
    }
};

app.get('/', (req, res) => res.send('Urnisa Discord Bot Service is Running!'));

app.get('/api/messages', async (req, res) => {
    const { channelId } = req.query;
    const guildId = '1336782145833668729'; // STEAK HOUSE Server ID

    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

    try {
        const messages = await fetchDiscordMessages(channelId);
        
        // Enhance messages with Guild Member data (Nicknames/Server Avatars)
        const enhancedMessages = await Promise.all(messages.map(async (msg) => {
            const memberData = await fetchGuildMember(guildId, msg.author.id);
            
            // If it's a reply, fetch the referenced author's member data too (optional but nice)
            // For now, we just pass the raw reference data provided by Discord API
            
            return {
                ...msg,
                member: memberData ? {
                    nick: memberData.nick,
                    avatar: memberData.avatar
                } : null
            };
        }));

        // Reverse to show oldest first (top to bottom)
        res.json(enhancedMessages.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Self-Ping to keep active
const SELF_URL = 'https://urnisa-bot.onrender.com';
setInterval(() => {
    axios.get(SELF_URL).catch(() => {});
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🤖 Discord Bot Service running on port ${PORT}`);
});
