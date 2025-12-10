
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
const UserPackSchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    lambPacks: { type: Number, default: 0 },
    wagyuPacks: { type: Number, default: 0 },
    lastDailyClaim: { type: Date }, // Added for daily check-in
    updatedAt: { type: Date, default: Date.now }
});
const UserPack = mongoose.model('UserPack', UserPackSchema);

// Redemption Code Schema (UPDATED)
const RedemptionCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'lamb' or 'wagyu'
    packAmount: { type: Number, default: 1 },
    
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
    // Cache members for 15 minutes to reduce API calls significantly
    if (cached && (Date.now() - cached.timestamp < 15 * 60 * 1000)) {
        return cached.data;
    }

    try {
        const response = await axios.get(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
        });
        
        memberCache.set(cacheKey, {
            data: response.data,
            timestamp: Date.now()
        });

        return response.data;
    } catch (error) { return null; }
};

// --- ROUTES ---

app.get('/', (req, res) => res.send('Urnisa Discord Service Active'));

// 1. Chat Preview (CACHED)
app.get('/api/messages', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

    // Check Message Cache (30 seconds)
    const cachedMsg = messageCache[channelId];
    if (cachedMsg && (Date.now() - cachedMsg.timestamp < 30 * 1000)) {
        return res.json(cachedMsg.data);
    }

    try {
        const messages = await fetchDiscordMessages(channelId);
        
        // Parallel fetch for members with individual caching inside fetchGuildMember
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
        // Fallback: If we hit a rate limit (429) but have stale data, return that instead of erroring
        if (cachedMsg) {
            console.warn("⚠️ Discord Rate Limit hit. Serving stale cache.");
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
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/whitelist/approved', auth, async (req, res) => {
    try {
        const apps = await WhitelistApp.find({ status: 'approved' }).sort({ approvedAt: -1, appliedAt: -1 }).limit(50);
        res.json(apps);
    } catch(e) { res.status(500).json({ error: e.message }); }
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
                        content: `<@${app.discordId}> You have been whitelisted! 🎉`
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
    } catch(e) { res.status(500).json({ error: e.message }); }
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

        const wallet = await UserPack.findOne({ discordId: targetDiscordId });
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
    const { type, amount = 1, packAmount = 1, usageType = 'once_global', hours = 0 } = req.body;
    
    if (!type || !['lamb', 'wagyu'].includes(type)) return res.status(400).json({ error: "Invalid pack type" });

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
                packAmount: Math.max(1, parseInt(packAmount)),
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

// --- INVENTORY, PACKS & GACHA API ---

// 1. Fetch User Pack Balance
app.get('/api/packs', async (req, res) => {
    const { discordId } = req.query;
    if (!discordId) return res.status(400).json({ error: "Discord ID required" });

    try {
        let wallet = await UserPack.findOne({ discordId });
        if (!wallet) wallet = { lambPacks: 0, wagyuPacks: 0 }; // Default
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
        const wallet = await UserPack.findOne({ discordId });
        if (!wallet) return res.status(404).json({ error: "No wallet found" });

        if (type === 'lamb') {
            if (wallet.lambPacks < 1) return res.status(403).json({ error: "Not enough packs" });
            wallet.lambPacks -= 1;
        } else if (type === 'wagyu') {
            if (wallet.wagyuPacks < 1) return res.status(403).json({ error: "Not enough packs" });
            wallet.wagyuPacks -= 1;
        } else {
            return res.status(400).json({ error: "Invalid pack type" });
        }

        await wallet.save();
        res.json({ success: true, remaining: type === 'lamb' ? wallet.lambPacks : wallet.wagyuPacks });
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
        let wallet = await UserPack.findOne({ discordId });
        if (!wallet) {
            wallet = new UserPack({ discordId });
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
        wallet.lambPacks = (wallet.lambPacks || 0) + 1;
        wallet.lastDailyClaim = now;
        await wallet.save();

        res.json({ 
            success: true, 
            message: "You have been rewarded with 1x Lamb Chop Pack for checking in!",
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
        const packsToAdd = codeRecord.packAmount || 1;
        const wallet = await UserPack.findOneAndUpdate(
            { discordId },
            { 
                $setOnInsert: { discordId }, 
                $inc: { [codeRecord.type === 'lamb' ? 'lambPacks' : 'wagyuPacks']: packsToAdd }
            },
            { upsert: true, new: true }
        );

        res.json({ success: true, type: codeRecord.type, amount: packsToAdd, wallet });
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

        // --- DISCORD LOGGING ---
        if (DISCORD_BOT_TOKEN) {
            try {
                // 1. Fetch User Info
                let username = "Unknown User";
                let avatarUrl = "";
                try {
                    const userRes = await axios.get(`https://discord.com/api/v10/users/${discordId}`, {
                        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
                    });
                    username = userRes.data.global_name || userRes.data.username;
                    avatarUrl = userRes.data.avatar 
                        ? `https://cdn.discordapp.com/avatars/${discordId}/${userRes.data.avatar}.png`
                        : `https://cdn.discordapp.com/embed/avatars/${parseInt(userRes.data.discriminator || 0) % 5}.png`;
                } catch (e) { console.error("User fetch failed for gacha log"); }

                // 2. Pack Name Handling
                const packName = packType === 'wagyu' ? 'Wagyu A5' : 'Lamb Chop';

                // 3. Build Item List
                let hasMythic = false;
                let hasLegendary = false;
                let highlightImage = null;

                const descriptionLines = items.map(item => {
                    const r = item.rarity;
                    if (r === 'Mythical') { 
                        hasMythic = true; 
                        if (!highlightImage) highlightImage = item; 
                        return `**🌟 [MYTHICAL] ${item.name}**`; 
                    }
                    if (r === 'Legendary') { 
                        hasLegendary = true; 
                        if (!highlightImage && !hasMythic) highlightImage = item; 
                        return `**✨ [LEGENDARY] ${item.name}**`; 
                    }
                    if (r === 'Ultra-Rare') return `🟣 [Ultra-Rare] ${item.name}`;
                    if (r === 'Rare') return `🔵 [Rare] ${item.name}`;
                    if (r === 'Uncommon') return `🟢 [Uncommon] ${item.name}`;
                    return `⚪ [Common] ${item.name}`;
                });

                // 4. Determine Color & Title
                let color = 0x3498db; // Blue default
                let title = "📦 Pack Opened";

                if (hasMythic) {
                    color = 0xff00ff; // Magenta
                    title = "🚨 MYTHIC PULL! 🚨";
                } else if (hasLegendary) {
                    color = 0xffd700; // Gold
                    title = "✨ LEGENDARY PULL! ✨";
                }

                const embed = {
                    title: title,
                    description: descriptionLines.join('\n'),
                    color: color,
                    author: {
                        name: `${username} opened a ${packName} pack`,
                        icon_url: avatarUrl
                    },
                    timestamp: new Date().toISOString(),
                    footer: { text: "Urnisa Cobblemon Gacha" }
                };

                // Add image for high tier pulls
                if (highlightImage) {
                    let imageUrl = highlightImage.image;
                    if (highlightImage.type === 'Pokemon') {
                        const formattedName = highlightImage.name.toLowerCase()
                            .replace(/[.']/g, '')
                            .replace(/♀/g, '-f')
                            .replace(/♂/g, '-m')
                            .replace(/\s+/g, '-');
                        imageUrl = `https://cobblemon.tools/pokedex/pokemon/${formattedName}/sprite.png`;
                    }
                    if (imageUrl) {
                        embed.image = { url: imageUrl };
                        // To ensure Discord displays it properly, verify it's a valid URL string
                    }
                }

                await axios.post(
                    `https://discord.com/api/v10/channels/${GACHA_LOG_CHANNEL}/messages`,
                    { embeds: [embed] },
                    { headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` } }
                );

            } catch (err) {
                console.error("Failed to send gacha log to Discord:", err.message);
            }
        }

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
    res.json({ lambPacks: 999, wagyuPacks: 999 });
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
const SELF_URL = 'https://urnisa-bot.onrender.com';
const BACKEND_URL = 'https://urnisa-backend.onrender.com';

setInterval(() => {
    axios.get(SELF_URL).catch(() => {});
    axios.get(BACKEND_URL).catch(() => {});
}, 5 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🤖 Discord Bot Service running on port ${PORT}`);
});
