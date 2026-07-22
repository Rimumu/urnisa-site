
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto'); // Added for code generation
let Rcon;
try {
    Rcon = require('rcon-client').Rcon;
} catch (e) {
    console.warn("⚠️ 'rcon-client' not installed. RCON commands will be simulated in logs.");
}
require('dotenv').config();

const app = express();
const PORT = process.env.BOT_PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

app.use(express.json());
app.use(cors({ origin: '*' }));

// --- CONFIGURATION ---
let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.trim() : "";
if (DISCORD_BOT_TOKEN.startsWith("Bot ")) DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN.substring(4).trim();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const MONGO_URI = process.env.MONGO_URI;

// RCON Config
const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = parseInt(process.env.RCON_PORT || '25575');
const RCON_PASSWORD = process.env.RCON_PASSWORD;

const GUILD_ID = '1336782145833668729';
const ROLE_SUBSCRIBER = '1339227370833448980';
const ROLE_FRIEND = '1445655680735383675';
const WHITELIST_NOTIFY_CHANNEL = '1375823728717467788';
const GACHA_LOG_CHANNEL = '1382803278449868921';

// --- ITEM MAPPING ---
// Map Gacha Item Names to RCON Commands / Minecraft IDs
const ITEM_MAP = {
    'Bronze Coin': 'numismatic-overhaul:bronze_coin',
    'Silver Coin': 'numismatic-overhaul:silver_coin',
    'Gold Coin': 'numismatic-overhaul:gold_coin',
    'Pokeball': 'cobblemon:poke_ball',
    'Great Ball': 'cobblemon:great_ball',
    'Ultra Ball': 'cobblemon:ultra_ball',
    'Master Ball': 'cobblemon:master_ball',
    'Quick Ball': 'cobblemon:quick_ball',
    'Safari Ball': 'cobblemon:safari_ball',
    'Level Ball': 'cobblemon:level_ball',
    'Rare Candy': 'cobblemon:rare_candy',
    'Exp. Candy XS': 'cobblemon:exp_candy_xs',
    'Exp. Candy S': 'cobblemon:exp_candy_s',
    'Exp. Candy M': 'cobblemon:exp_candy_m',
    'Exp. Candy L': 'cobblemon:exp_candy_l',
    'Exp. Candy XL': 'cobblemon:exp_candy_xl',
    'Full Restore': 'cobblemon:full_restore',
    'Full Heal': 'cobblemon:full_heal',
    'Max Ether': 'cobblemon:max_ether',
    'Max Elixir': 'cobblemon:max_elixir',
    'Super Potion': 'cobblemon:super_potion',
    'Antidote': 'cobblemon:antidote',
    'Awakening': 'cobblemon:awakening',
    'Ether': 'cobblemon:ether',
    'Elixir': 'cobblemon:elixir',
    'HP IV Cap': 'cobblemon_utility:hpsilvercap',
    'Atk IV Cap': 'cobblemon_utility:atksilvercap',
    'Def IV Cap': 'cobblemon_utility:defsilvercap',
    'Sp. Atk IV Cap': 'cobblemon_utility:spatksilvercap',
    'Sp. Def IV Cap': 'cobblemon_utility:spdefsilvercap',
    'Speed IV Cap': 'cobblemon_utility:speedsilvercap',
    'Shiny Upgrade': 'cobblemon_utility:shinycard',
    '1 TM Choice': "lever[custom_name='{\"text\":\"TM Choice\"}',lore=['{\"text\":\"Get a TM of your choice! Redeem this to Rimu!\"}']]"
};

// --- HELPER: RCON SENDER WITH RETRY ---
const sendRconCommand = async (command) => {
    // 1. Check if configured
    if (!Rcon || !RCON_HOST || !RCON_PASSWORD) {
        console.log(`🔔 [RCON SIMULATION] ${command}`);
        return "Simulation: Success"; // Return truthy string simulating response
    }

    const rcon = new Rcon({
        host: RCON_HOST,
        port: RCON_PORT,
        password: RCON_PASSWORD,
        timeout: 5000 // 5s connection timeout
    });

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await rcon.connect();
            const response = await rcon.send(command);
            console.log(`✅ [RCON SENT] ${command} | Response: ${response}`);
            await rcon.end();
            return response; // Return the actual response string
        } catch (error) {
            console.warn(`⚠️ [RCON ATTEMPT ${attempt}/${maxRetries}] Failed: ${error.message}`);

            if (attempt === maxRetries) {
                console.error(`❌ [RCON ERROR] Could not send "${command}" after 3 attempts.`);
                return false;
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
};

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
    minecraftUuid: String,
    twitchUsername: String,
    twitchAvatar: String,
    linkedAt: { type: Date, default: Date.now }
});
const MinecraftLink = mongoose.model('MinecraftLink', MinecraftLinkSchema);

// Whitelist Application Schema
const WhitelistAppSchema = new mongoose.Schema({
    discordId: String,
    discordUsername: String,
    discordAvatar: String,
    minecraftUsername: String,
    minecraftUuid: String,
    twitchUsername: String,
    twitchAvatar: String,
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date } // Added to track approval time
});
const WhitelistApp = mongoose.model('WhitelistApp', WhitelistAppSchema);

// Inventory Schema
const InventoryItemSchema = new mongoose.Schema({
    discordId: { type: String, required: true },
    itemId: { type: String, required: true }, // e.g. "150" (dex) or "30001" (custom id)
    name: { type: String, required: true },
    type: { type: String, required: true }, // 'Pokemon' or 'Item'
    rarity: { type: String, required: true },
    image: String,
    claimed: { type: Boolean, default: false },
    claimedAt: Date,
    receivedAt: { type: Date, default: Date.now }
});
const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);

// User Pack Wallet Schema
const UserKeySchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    lambKeys: { type: Number, default: 0 },
    steakKeys: { type: Number, default: 0 },
    lastDailyClaim: { type: Date }, // Added for daily check-in
    updatedAt: { type: Date, default: Date.now }
});
const UserKey = mongoose.model('UserKey', UserKeySchema);

// Redemption Code Schema (UPDATED)
const RedemptionCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'lamb' or 'steak'
    keyAmount: { type: Number, default: 1 },

    // Usage Logic
    usageType: { type: String, default: 'once_global' }, // 'once_global', 'once_per_user', 'infinite', 'time_limited'
    expiresAt: { type: Date }, // For time_limited

    // Tracking
    usageCount: { type: Number, default: 0 },
    redeemedBy: [{ type: String }], // Array of discordIds

    // Legacy support (optional)
    isRedeemed: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now }
});
const RedemptionCode = mongoose.model('RedemptionCode', RedemptionCodeSchema);


// --- CACHING SYSTEMS ---
const messageCache = {}; // channelId -> { data, timestamp }
const memberCache = new Map(); // userId -> { data, timestamp }
const activeMemberFetches = new Map(); // userId -> Promise (to prevent concurrent duplicate API calls)

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

    const cacheKey = `${guildId}:${userId}`;
    const cached = memberCache.get(cacheKey);
    // Cache members for 60 minutes to reduce API calls significantly
    if (cached && (Date.now() - cached.timestamp < 60 * 60 * 1000)) {
        return cached.data;
    }

    // Reuse in-flight promise if we are already fetching this user to avoid concurrent duplicates
    if (activeMemberFetches.has(cacheKey)) {
        return activeMemberFetches.get(cacheKey);
    }

    const fetchPromise = (async () => {
        try {
            // Space out member fetches slightly to avoid sudden bursts
            await new Promise(resolve => setTimeout(resolve, 50));
            const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
                headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
                timeout: 3000
            });

            const memberData = response.data;
            memberCache.set(cacheKey, {
                data: memberData,
                timestamp: Date.now()
            });
            return memberData;
        } catch (error) {
            // Cache failure for 10 minutes so we don't spam the API on repeated failures/404s
            memberCache.set(cacheKey, {
                data: null,
                timestamp: Date.now() - (60 * 60 * 1000) + (10 * 60 * 1000) // expires in 10 mins
            });
            return null;
        } finally {
            activeMemberFetches.delete(cacheKey);
        }
    })();

    activeMemberFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
};

// --- ROUTES ---

app.get('/', (req, res) => res.send('Urnisa Discord Service Active'));

// 1. Chat Preview (CACHED)
app.get('/api/messages', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

    // Check Message Cache (serve cached results if requested within 15 seconds)
    const cachedMsg = messageCache[channelId];
    if (cachedMsg && (Date.now() - cachedMsg.timestamp < 15 * 1000)) {
        return res.json(cachedMsg.data);
    }

    try {
        const messages = await fetchDiscordMessages(channelId);

        // Ensure messages is an array
        if (!Array.isArray(messages)) {
            throw new Error("Discord API response is not an array");
        }

        // Fetch member data with individual caching, deduplicated and safely handled
        const enhancedMessages = await Promise.all(messages.map(async (msg) => {
            const memberData = await fetchGuildMember(GUILD_ID, msg.author.id);
            return {
                ...msg,
                member: memberData ? { nick: memberData.nick, avatar: memberData.avatar } : null
            };
        }));

        const finalData = enhancedMessages.reverse();

        // Update Cache
        messageCache[channelId] = {
            data: finalData,
            timestamp: Date.now()
        };

        res.json(finalData);
    } catch (error) {
        // Fallback: If we hit a rate limit or other error but have stale data, return that instead of erroring
        if (cachedMsg) {
            console.warn("⚠️ Discord API call failed. Serving stale cache.");
            return res.json(cachedMsg.data);
        }
        res.status(500).json({ error: 'Failed' });
    }
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
        let mcUuid = null;
        let twitchUsername = null;
        let twitchAvatar = null;

        if (mongoose.connection.readyState === 1) {
            const existing = await MinecraftLink.findOne({ discordId: userData.id });
            if (existing) {
                mcUsername = existing.minecraftUsername;
                mcUuid = existing.minecraftUuid || null;
                twitchUsername = existing.twitchUsername || null;
                twitchAvatar = existing.twitchAvatar || null;

                // Reverse lookup/update if UUID is present to see if the username has changed
                if (mcUuid) {
                    try {
                        const profileRes = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${mcUuid}`, { timeout: 3000 });
                        if (profileRes.data && profileRes.data.name && profileRes.data.name !== mcUsername) {
                            console.log(`🔄 Minecraft username change detected for ${mcUuid}: ${mcUsername} -> ${profileRes.data.name}`);
                            mcUsername = profileRes.data.name;
                            existing.minecraftUsername = profileRes.data.name;
                            await existing.save();

                            // Update applications
                            await WhitelistApp.updateMany(
                                { discordId: userData.id },
                                { minecraftUsername: profileRes.data.name }
                            );
                        }
                    } catch (updateErr) {
                        console.error("Failed to check for Minecraft username updates via sessionserver:", updateErr.message);
                    }
                }
            }
        }

        res.json({
            id: userData.id,
            username: userData.username,
            global_name: userData.global_name,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${userData.discriminator % 5}.png`,
            minecraftUsername: mcUsername,
            minecraftUuid: mcUuid,
            twitchUsername: twitchUsername,
            twitchAvatar: twitchAvatar
        });

    } catch (error) { res.status(400).json({ error: "Auth Failed" }); }
});

// 3. Link Account
app.post('/api/minecraft/link', async (req, res) => {
    const { discordId, discordUsername, discordAvatar, minecraftUsername, twitchUsername, twitchAvatar } = req.body;
    if (!discordId || !minecraftUsername) return res.status(400).json({ error: "Missing fields" });

    try {
        let minecraftUuid = null;
        let resolvedUsername = minecraftUsername;

        try {
            const uuidRes = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(minecraftUsername)}`, { timeout: 4000 });
            if (uuidRes.data && uuidRes.data.id) {
                minecraftUuid = uuidRes.data.id;
                resolvedUsername = uuidRes.data.name || minecraftUsername;
            }
        } catch (uuidErr) {
            console.error("Failed to fetch UUID from Mojang via Axios during link:", uuidErr.message);
            if (uuidErr.response && uuidErr.response.status === 404) {
                return res.status(404).json({ error: "Minecraft username does not exist!" });
            }
        }

        let existingLink = null;
        if (minecraftUuid) {
            existingLink = await MinecraftLink.findOne({
                $or: [
                    { minecraftUuid },
                    { minecraftUsername: new RegExp(`^${resolvedUsername}$`, 'i') }
                ]
            });
        } else {
            existingLink = await MinecraftLink.findOne({ minecraftUsername: new RegExp(`^${resolvedUsername}$`, 'i') });
        }

        if (existingLink && existingLink.discordId !== discordId) {
            return res.status(409).json({ error: "Minecraft account already linked to another user!" });
        }

        await MinecraftLink.findOneAndUpdate(
            { discordId },
            { 
                discordUsername, 
                discordAvatar, 
                minecraftUsername: resolvedUsername, 
                minecraftUuid,
                twitchUsername, 
                twitchAvatar, 
                linkedAt: new Date() 
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, minecraftUsername: resolvedUsername, minecraftUuid });
    } catch (error) {
        if (error.code === 11000) return res.status(409).json({ error: "Minecraft account already linked to another user!" });
        res.status(500).json({ error: "Failed to link account" });
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
    if (!link.twitchUsername) return res.status(400).json({ error: "No Twitch account linked!" });

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
        minecraftUuid: link.minecraftUuid,
        twitchUsername: link.twitchUsername,
        twitchAvatar: link.twitchAvatar,
        status: 'pending',
        appliedAt: new Date()
    });

    console.log(`📝 New Whitelist Application: ${link.minecraftUsername} (UUID: ${link.minecraftUuid})`);
    res.json({ success: true, message: "Application Sent! Please wait for admin approval." });
});

// 5. ADMIN WHITELIST & CODE MANAGEMENT
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
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/whitelist/approved', auth, async (req, res) => {
    try {
        // Removed limit to show all history as requested
        const apps = await WhitelistApp.find({ status: 'approved' }).sort({ approvedAt: -1, appliedAt: -1 });
        res.json(apps);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/whitelist/approve', auth, async (req, res) => {
    const { id } = req.body;
    try {
        const app = await WhitelistApp.findById(id);
        if (!app) return res.status(404).json({ error: "App not found" });

        // Update DB
        app.status = 'approved';
        app.approvedAt = new Date(); // Track approval time
        await app.save();

        // Send RCON Command
        await sendRconCommand(`whitelist add ${app.minecraftUsername}`);

        // --- Send Discord Notification ---
        if (DISCORD_BOT_TOKEN) {
            try {
                await axios.post(
                    `https://discord.com/api/v10/channels/${WHITELIST_NOTIFY_CHANNEL}/messages`,
                    {
                        content: `<@${app.discordId}> You have been whitelisted!`
                    },
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`✅ [Discord] Notification sent to <@${app.discordId}>`);
            } catch (err) {
                console.error(`❌ [Discord] Failed to send notification: ${err.message}`);
                // Proceed without erroring the whole request
            }
        }

        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/whitelist/reject', auth, async (req, res) => {
    const { id } = req.body;
    try {
        console.log(`❌ Rejecting app ID: ${id}`);
        await WhitelistApp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/whitelist/revoke', auth, async (req, res) => {
    const { id } = req.body;
    try {
        const app = await WhitelistApp.findById(id);
        if (!app) return res.status(404).json({ error: "App not found" });

        // Send RCON Command
        await sendRconCommand(`whitelist remove ${app.minecraftUsername}`);
        await sendRconCommand(`kick ${app.minecraftUsername} You have been removed from the whitelist.`);

        await WhitelistApp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Reset Daily Check-In (Admin)
app.post('/api/admin/users/reset-daily', auth, async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Missing query" });

    try {
        let targetDiscordId = query;

        // Try to resolve username first (Discord or Minecraft username)
        const link = await MinecraftLink.findOne({
            $or: [
                { minecraftUsername: new RegExp(`^${query}$`, 'i') },
                { discordUsername: new RegExp(`^${query}$`, 'i') }
            ]
        });

        if (link) {
            targetDiscordId = link.discordId;
        }

        const wallet = await UserKey.findOne({ discordId: targetDiscordId });
        if (!wallet) {
            return res.status(404).json({ error: "User wallet/history not found." });
        }

        wallet.lastDailyClaim = null; // Clear the date
        await wallet.save();

        res.json({ success: true, message: `Daily timer reset for ${targetDiscordId}` });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Operation failed" });
    }
});

// --- CODE GENERATION (Admin) ---
// UPDATED to support amounts and limits
app.post('/api/admin/codes/generate', auth, async (req, res) => {
    const { type, amount = 1, keyAmount = 1, usageType = 'once_global', hours = 0 } = req.body;

    if (!type || !['lamb', 'steak'].includes(type)) return res.status(400).json({ error: "Invalid pack type" });

    try {
        const codes = [];
        let expiresAt = undefined;
        if (usageType === 'time_limited' && hours > 0) {
            expiresAt = new Date(Date.now() + (hours * 60 * 60 * 1000));
        }

        for (let i = 0; i < amount; i++) {
            const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
            const codeStr = `${type.toUpperCase()}-${raw}`;
            codes.push({
                code: codeStr,
                type,
                keyAmount: Math.max(1, parseInt(keyAmount)),
                usageType, // 'once_global', 'once_per_user', 'infinite', 'time_limited'
                expiresAt,
                isRedeemed: false,
                usageCount: 0,
                redeemedBy: []
            });
        }
        await RedemptionCode.insertMany(codes);
        res.json({ success: true, codes: codes.map(c => c.code) });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to generate codes" });
    }
});

// NEW: List Codes
app.get('/api/admin/codes/list', auth, async (req, res) => {
    try {
        const codes = await RedemptionCode.find().sort({ createdAt: -1 }).limit(100);
        res.json(codes);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch codes" });
    }
});

// NEW: Delete Code
app.post('/api/admin/codes/delete', auth, async (req, res) => {
    const { id } = req.body;
    try {
        await RedemptionCode.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed to delete" });
    }
});

// Maintenance Wipe Endpoint for Minecraft Data (DANGER ZONE)
app.post('/api/admin/maintenance/wipe-minecraft-data', auth, async (req, res) => {
    const { scope } = req.body; // 'all', 'inventory', 'currency', 'approved_users'
    try {
        console.log(`⚠️ Admin triggered Minecraft Data Wipe on Bot Server. Scope: ${scope}`);
        const results = {};

        if (!scope || scope === 'all' || scope === 'inventory') {
            const delRes = await InventoryItem.deleteMany({});
            results.inventory = { success: true, count: delRes.deletedCount };
        }

        if (!scope || scope === 'all' || scope === 'currency') {
            const delRes = await UserKey.deleteMany({});
            results.currency = { success: true, count: delRes.deletedCount };
        }

        if (!scope || scope === 'all' || scope === 'approved_users') {
            const delRes = await WhitelistApp.deleteMany({ status: 'approved' });
            results.approvedUsers = { success: true, count: delRes.deletedCount };
        }

        res.json({ success: true, results });
    } catch (e) {
        console.error("❌ Failed to wipe Minecraft data on Bot Server:", e);
        res.status(500).json({ error: "Failed to wipe Minecraft data", details: e.message });
    }
});

// --- INVENTORY, PACKS & GACHA API ---

// 1. Fetch User Pack Balance
app.get('/api/packs', async (req, res) => {
    const { discordId } = req.query;
    if (!discordId) return res.status(400).json({ error: "Discord ID required" });

    try {
        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = { lambKeys: 0, steakKeys: 0 }; // Default
        res.json(wallet);
    } catch (e) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// 2. Use/Deduct Pack (Used by Gacha Page before opening)
app.post('/api/packs/use', async (req, res) => {
    const { discordId, type } = req.body;
    if (!discordId || !type) return res.status(400).json({ error: "Missing data" });

    try {
        const wallet = await UserKey.findOne({ discordId });
        if (!wallet) return res.status(404).json({ error: "No wallet found" });

        if (type === 'lamb') {
            if (wallet.lambKeys < 1) return res.status(403).json({ error: "Not enough keys" });
            wallet.lambKeys -= 1;
        } else if (type === 'steak') {
            if (wallet.steakKeys < 1) return res.status(403).json({ error: "Not enough keys" });
            wallet.steakKeys -= 1;
        } else {
            return res.status(400).json({ error: "Invalid pack type" });
        }

        await wallet.save();
        res.json({ success: true, remaining: type === 'lamb' ? wallet.lambKeys : wallet.steakKeys });
    } catch (e) {
        res.status(500).json({ error: "Transaction failed" });
    }
});

// 2.5 DAILY CLAIM
app.post('/api/daily/claim', async (req, res) => {
    const { discordId } = req.body;
    if (!discordId) return res.status(400).json({ error: "Missing Discord ID" });

    try {
        // Find or create wallet
        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) {
            wallet = new UserKey({ discordId });
        }

        const now = new Date();
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours in ms

        if (wallet.lastDailyClaim) {
            const lastClaim = new Date(wallet.lastDailyClaim).getTime();
            const elapsed = now.getTime() - lastClaim;

            if (elapsed < cooldown) {
                const remainingMs = cooldown - elapsed;
                return res.status(403).json({
                    error: "Already claimed today",
                    remainingMs
                });
            }
        }

        // Apply Reward (1 Lamb Chop Pack)
        wallet.lambKeys = (wallet.lambKeys || 0) + 1;
        wallet.lastDailyClaim = now;
        await wallet.save();

        res.json({
            success: true,
            message: "You have been rewarded with 1x Lamb Crate Key for checking in!",
            wallet
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Daily Claim Failed" });
    }
});

// 3. Redeem Code (UPDATED LOGIC)
app.post('/api/codes/redeem', async (req, res) => {
    const { discordId, code } = req.body;
    if (!discordId || !code) return res.status(400).json({ error: "Missing data" });

    try {
        const codeRecord = await RedemptionCode.findOne({ code: code.trim().toUpperCase() });

        if (!codeRecord) return res.status(404).json({ error: "Invalid code" });

        // Logic check based on usageType
        const usageType = codeRecord.usageType || 'once_global'; // Default to old behavior if missing

        // 1. Time Limit Check
        if (usageType === 'time_limited' && codeRecord.expiresAt && new Date() > new Date(codeRecord.expiresAt)) {
            return res.status(400).json({ error: "Code has expired" });
        }

        // 2. Global Single Use Check
        if (usageType === 'once_global' && (codeRecord.isRedeemed || codeRecord.usageCount > 0)) {
            return res.status(409).json({ error: "Code already redeemed" });
        }

        // 3. Once Per User Check
        if (usageType === 'once_per_user') {
            const redeemedList = codeRecord.redeemedBy || [];
            // Legacy check: check if redeemedBy string matches (if older schema)
            if (typeof codeRecord.redeemedBy === 'string' && codeRecord.redeemedBy === discordId) {
                return res.status(409).json({ error: "You already redeemed this code" });
            }
            // Array check
            if (Array.isArray(redeemedList) && redeemedList.includes(discordId)) {
                return res.status(409).json({ error: "You already redeemed this code" });
            }
        }

        // Apply Redemption
        // Update Code Record
        codeRecord.usageCount = (codeRecord.usageCount || 0) + 1;
        codeRecord.redeemedAt = new Date(); // Last redeemed time

        // Handle array update safely
        if (!Array.isArray(codeRecord.redeemedBy)) codeRecord.redeemedBy = [];
        codeRecord.redeemedBy.push(discordId);

        if (usageType === 'once_global') {
            codeRecord.isRedeemed = true;
        }

        await codeRecord.save();

        // Add Pack to User Wallet
        const keysToAdd = codeRecord.keyAmount || 1;
        const wallet = await UserKey.findOneAndUpdate(
            { discordId },
            {
                $setOnInsert: { discordId },
                $inc: { [codeRecord.type === 'lamb' ? 'lambKeys' : 'steakKeys']: keysToAdd }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, type: codeRecord.type, amount: keysToAdd, wallet });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Redemption failed" });
    }
});

// 4. Save Gacha Results
app.post('/api/inventory/save', async (req, res) => {
    const { discordId, items, packType } = req.body;
    if (!discordId || !items || !Array.isArray(items)) return res.status(400).json({ error: "Invalid data" });

    try {
        const newItems = items.map(item => ({
            discordId,
            itemId: item.id.toString(),
            name: item.name,
            type: item.type,
            rarity: item.rarity,
            image: item.image, // Optional, can be undefined
            claimed: false,
            receivedAt: new Date()
        }));

        await InventoryItem.insertMany(newItems);
        console.log(`📦 Saved ${items.length} items for user ${discordId}`);

        res.json({ success: true });
    } catch (e) {
        console.error("Save Inventory Error:", e);
        res.status(500).json({ error: "Failed to save items" });
    }
});

// 5. Fetch User Inventory
app.get('/api/inventory', async (req, res) => {
    const { discordId } = req.query;
    if (!discordId) return res.status(400).json({ error: "Discord ID required" });

    try {
        const items = await InventoryItem.find({ discordId }).sort({ receivedAt: -1 });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

// 6. Claim Item
app.post('/api/inventory/claim', async (req, res) => {
    const { discordId, dbItemId } = req.body;
    if (!discordId || !dbItemId) return res.status(400).json({ error: "Missing data" });

    try {
        // 1. Verify User and Link
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.minecraftUsername) return res.status(400).json({ error: "Minecraft account not linked!" });

        // 2. Find Item
        const item = await InventoryItem.findOne({ _id: dbItemId, discordId });
        if (!item) return res.status(404).json({ error: "Item not found" });
        if (item.claimed) return res.status(400).json({ error: "Item already claimed" });

        // 2.5 Check Online Status
        const player = link.minecraftUsername;

        // Check if online via RCON "list" command
        const listResponse = await sendRconCommand("list");

        if (listResponse === false) {
            return res.status(502).json({ error: "Could not connect to Minecraft Server." });
        }

        // Parse list response (Case-insensitive check)
        // Typical response: "There are 2 of a max of 20 players online: Player1, Player2"
        const lowerList = listResponse.toLowerCase();
        const lowerPlayer = player.toLowerCase();

        let isOnline = false;

        // Check if username is in the output string
        if (lowerList.includes(lowerPlayer)) {
            // Regex to ensure word boundary match
            const safePlayer = lowerPlayer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${safePlayer}\\b`);
            if (regex.test(lowerList)) {
                isOnline = true;
            }
        }

        // Allow simulation to pass
        if (listResponse.includes("Simulation")) isOnline = true;

        if (!isOnline) {
            return res.status(409).json({ error: "You must be online in-game to claim items!" });
        }

        // 3. Construct Command
        let command = "";

        if (item.type === 'Pokemon') {
            command = `pokegiveother ${player} ${item.name.replace(/\s+/g, '').toLowerCase()} level=5`; // Giving at lvl 5 is safe default
        } else {
            let count = 1;
            let itemName = item.name;

            const match = item.name.match(/^(\d+)x\s+(.+)$/);
            if (match) {
                count = parseInt(match[1]);
                itemName = match[2];
            }

            const mappedId = ITEM_MAP[itemName];
            if (!mappedId) {
                console.error(`❌ Unknown item mapping: ${itemName}`);
                return res.status(500).json({ error: "Item ID map missing. Contact Admin." });
            }

            command = `give ${player} ${mappedId} ${count}`;
        }

        console.log(`🚀 Executing Claim: ${command}`);
        const rconSuccess = await sendRconCommand(command);

        // Check response of give command if possible, but assume success if RCON connected
        if (rconSuccess) {
            item.claimed = true;
            item.claimedAt = new Date();
            await item.save();
            res.json({ success: true });
        } else {
            res.status(502).json({ error: "RCON Failed. Server might be offline." });
        }

    } catch (e) {
        console.error("Claim Error:", e);
        res.status(500).json({ error: e.message });
    }
});

// --- DEV ENDPOINTS ---
app.get('/api/dev/packs', (req, res) => {
    // Return infinite packs for testing
    res.json({ lambKeys: 999, steakKeys: 999 });
});

app.post('/api/dev/packs/use', (req, res) => {
    // Simulate usage
    res.json({ success: true, remaining: 998 });
});

app.post('/api/dev/inventory/save', (req, res) => {
    // Simulate save
    console.log("📝 [DEV] Inventory Save Triggered (Not saved to DB)", req.body);
    res.json({ success: true });
});


// --- KEEP ALIVE ---
const SELF_URL = 'https://urnisa-dbot.onrender.com';
const BACKEND_URL = 'https://urnisa-backend-3b3m.onrender.com';

setInterval(() => {
    axios.get(SELF_URL).catch(() => { });
    axios.get(BACKEND_URL).catch(() => { });
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🤖 Discord Bot Service running on port ${PORT}`);
});