'use strict';

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const mongoose = require('mongoose');
const crypto = require('crypto');
let Rcon;
try {
    Rcon = require('rcon-client').Rcon;
} catch (e) {
    console.warn("⚠️ 'rcon-client' not installed. RCON commands will be simulated in logs.");
}
require('dotenv').config();

// ==========================================
// 1. CONFIGURATION & MIDDLEWARE
// ==========================================
const app = express();
const PORT = process.env.BOT_PORT || process.env.PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const MONGO_URI = process.env.MONGO_URI;
const BACKEND_URL = (process.env.BACKEND_URL || 'https://urnisa-backend-3b3m.onrender.com').replace(/\/+$/, '');
const KEEP_ALIVE_INTERVAL_MS = 8 * 60 * 1000; // 8 minutes (well under Render's 15-minute idle timeout)

let DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN.trim() : '';
if (DISCORD_BOT_TOKEN.startsWith('Bot ')) DISCORD_BOT_TOKEN = DISCORD_BOT_TOKEN.substring(4).trim();

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// RCON Config
const RCON_HOST = process.env.RCON_HOST;
const RCON_PORT = parseInt(process.env.RCON_PORT || '25575', 10);
const RCON_PASSWORD = process.env.RCON_PASSWORD;

// Discord Server Constants
const GUILD_ID = '1336782145833668729';
const ROLE_SUBSCRIBER = '1339227370833448980';
const ROLE_FRIEND = '1445655680735383675';
const WHITELIST_NOTIFY_CHANNEL = '1375823728717467788';

app.use(express.json());
app.use(cors({ origin: '*' }));

// ==========================================
// 2. HELPERS & AUTH MIDDLEWARE
// ==========================================
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const auth = (req, res, next) => {
    if (req.headers.authorization !== ADMIN_PASSWORD) {
        console.warn('❌ Admin Auth Failed: Unauthorized request rejected.');
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// ==========================================
// 3. STATIC GAME DATA & ITEM MAPPINGS
// ==========================================
const AUTHENTIC_HAT_OVERRIDES = {
    "amalgalichhat": { name: "Amalgalich", dyeable: false },
    "angrymask": { name: "Tribal Mask", dyeable: false },
    "antlers": { name: "Antlers", dyeable: false },
    "apple": { name: "Apple", dyeable: false },
    "artsy": { name: "Artsy", dyeable: true },
    "babydolphin": { name: "Baby Dolphin", dyeable: false },
    "babyturtle": { name: "Baby Turtle", dyeable: false },
    "bandana": { name: "Bandana", dyeable: true },
    "bandanargb": { name: "RGB Bandana", dyeable: false },
    "baseballeaster": { name: "Easter Baseball Cap", dyeable: true },
    "baseballhat": { name: "Baseball Cap", dyeable: true },
    "baseballhatfestive": { name: "Festive Baseball Cap", dyeable: false },
    "baseballhatjuly": { name: "Summer Baseball Cap", dyeable: false },
    "baseballhatrgb": { name: "RGB Baseball Cap", dyeable: false },
    "batwinghat": { name: "Bat Wing Hat", dyeable: false },
    "beanie": { name: "Beanie", dyeable: true },
    "beanieeaster": { name: "Easter Beanie", dyeable: true },
    "beaniefestive": { name: "Festive Beanie", dyeable: false },
    "beaniejuly": { name: "Summer Beanie", dyeable: false },
    "beaniergb": { name: "RGB Beanie", dyeable: false },
    "beaniespooky": { name: "Halloween Beanie", dyeable: false },
    "beehat": { name: "Bee Hat", dyeable: false },
    "bicorne": { name: "Bicorne", dyeable: false },
    "bigbrain": { name: "Big Brain", dyeable: false },
    "bigcrown": { name: "Big Crown", dyeable: false },
    "bigeyes": { name: "Big Eyes", dyeable: false },
    "bigribbon": { name: "Big Ribbon", dyeable: true },
    "bigstevehead": { name: "Mascot Head", dyeable: false },
    "bluefireeye": { name: "Skeleton Eye", dyeable: false },
    "bowler": { name: "Bowler Cap", dyeable: true },
    "breadhat": { name: "Bread on Head", dyeable: false },
    "brownbrick": { name: "Brick on Head", dyeable: false },
    "bunnyhat": { name: "Bunny Hat", dyeable: true },
    "burgerhat": { name: "Burger", dyeable: false },
    "caddycap": { name: "Caddy Cap", dyeable: true },
    "camera": { name: "Camera Head", dyeable: false },
    "camerabeard": { name: "Camera Beard", dyeable: false },
    "candleonhead": { name: "Candle", dyeable: false },
    "candycane": { name: "Candy Cane", dyeable: false },
    "carrotonstick": { name: "Carrot on a Stick", dyeable: false },
    "cartoonegg": { name: "Cartoon Egg", dyeable: false },
    "cheeseslice": { name: "Cheese Slice", dyeable: false },
    "chefshat": { name: "Chef's Hat", dyeable: false },
    "chickenhead": { name: "Chicken Head", dyeable: false },
    "chickenonhead": { name: "Chicken on Head", dyeable: false },
    "christmascakehat": { name: "Fruit Cake", dyeable: false },
    "christmastree": { name: "Festive Tree", dyeable: false },
    "clockface": { name: "Clock Head", dyeable: false },
    "cowboy": { name: "Cowboy Hat", dyeable: true },
    "cowboyrgb": { name: "RGB Cowboy Hat", dyeable: false },
    "crabonhead": { name: "Crab on Head", dyeable: false },
    "crown": { name: "Crown", dyeable: false },
    "cuphead": { name: "Cup Head", dyeable: false },
    "cyclopseye": { name: "Cyclops Eye", dyeable: false },
    "dairyqueen": { name: "DQ Lips", dyeable: false },
    "dangereqsue": { name: "Dangeresque Shades", dyeable: false },
    "dangeresquejuly": { name: "Summer Dangeresque Shades", dyeable: false },
    "demoneyes": { name: "Demon Eyes", dyeable: false },
    "demonhorns": { name: "Demon Horns", dyeable: false },
    "digger": { name: "Diglett", dyeable: false },
    "dimmahat": { name: "Dimmadome Dimmahat", dyeable: false },
    "discoball": { name: "Disco", dyeable: false },
    "disguise": { name: "Disguise", dyeable: false },
    "doctorhat": { name: "Doctor's Gear", dyeable: false },
    "dorkglassesandteeth": { name: "Dork", dyeable: false },
    "doubletake": { name: "Double Take", dyeable: false },
    "dragonhead": { name: "Dragon Head", dyeable: false },
    "dragonskull": { name: "Dragon Skull", dyeable: false },
    "dragonskullender": { name: "Ender Dragon Skull", dyeable: false },
    "drinkinhat": { name: "Drinking Hat", dyeable: false },
    "dumhat": { name: "Dum", dyeable: false },
    "dwarfminerbeard": { name: "Dwarven Miner", dyeable: false },
    "easterhead": { name: "Easter Island Head", dyeable: false },
    "egghead": { name: "Egg Head", dyeable: false },
    "eggonhead": { name: "Egg on Head", dyeable: false },
    "elfhat": { name: "Elf Hat", dyeable: true },
    "explorerhat": { name: "Explorer Hat", dyeable: true },
    "eyepatch": { name: "Eye Patch", dyeable: false },
    "fakeblight": { name: "Blight", dyeable: false },
    "fakefire": { name: "Fire", dyeable: false },
    "farmerbrim": { name: "Farmer Brim", dyeable: true },
    "festiveantlers": { name: "Festive Antlers", dyeable: false },
    "festiveribbon": { name: "Festive Ribbon", dyeable: false },
    "finnhood": { name: "Finn Hood", dyeable: true },
    "fireworks": { name: "Fireworks", dyeable: false },
    "fishonhead": { name: "Fish on Head", dyeable: false },
    "flagjuly": { name: "Summer Flag", dyeable: false },
    "flies": { name: "Flies", dyeable: false },
    "floatinghearts": { name: "Floating Hearts", dyeable: false },
    "floatingstar": { name: "Floating Star", dyeable: false },
    "flowercrown": { name: "Flower Crown", dyeable: false },
    "floweronhead": { name: "Flower Head", dyeable: false },
    "foxhat": { name: "Fox Hat", dyeable: false },
    "fro": { name: "Fro", dyeable: true },
    "frozenhead": { name: "Frozen Head", dyeable: false },
    "fullironhelm": { name: "Armor Helm", dyeable: false },
    "ghostmask": { name: "Ghost Head", dyeable: false },
    "goggles": { name: "Goggles", dyeable: true },
    "grandmadisguise": { name: "Grandma Disguise", dyeable: false },
    "greenbirb": { name: "Green Birb", dyeable: false },
    "grinchhat": { name: "Grinch Mask", dyeable: false },
    "halo": { name: "Halo", dyeable: false },
    "headbolts": { name: "Head Bolts", dyeable: false },
    "headphonesblue": { name: "Headphones", dyeable: true },
    "headshot": { name: "Headshot", dyeable: false },
    "hockeymask": { name: "Hockey Mask", dyeable: false },
    "holyhead": { name: "Holy Head", dyeable: false },
    "horsemask": { name: "Horse Head", dyeable: false },
    "hosthat": { name: "Host", dyeable: false },
    "icedragonskull": { name: "Ice Dragon Skull", dyeable: false },
    "jackohat": { name: "Jack-o-Lantern Hat", dyeable: false },
    "jesterhat": { name: "Jester", dyeable: true },
    "julydouble": { name: "Summer Gear", dyeable: false },
    "kirbymouthful": { name: "Mouthful", dyeable: false },
    "largehorns": { name: "Large Horns", dyeable: false },
    "lilbow": { name: "Lil' Bow", dyeable: true },
    "madscientist": { name: "Wily Head", dyeable: false },
    "magikarp": { name: "Magikarp", dyeable: false },
    "megamanhat": { name: "Megaman Head", dyeable: false },
    "mistletoe": { name: "Mistletoe", dyeable: false },
    "mohawk": { name: "Mohawk", dyeable: true },
    "monkeyking": { name: "Monkey King", dyeable: false },
    "monocle": { name: "Monocle", dyeable: false },
    "moreeyes": { name: "Eye Head", dyeable: false },
    "murdered": { name: "Murdered", dyeable: false },
    "nekoears": { name: "Neko Ears", dyeable: true },
    "palmtree": { name: "Palm Tree", dyeable: false },
    "paperbag": { name: "Paper Bag", dyeable: false },
    "partyhat": { name: "Party Hat", dyeable: true },
    "paypay": { name: "Paypay", dyeable: false },
    "penguinbaby": { name: "Baby Penguin", dyeable: false },
    "penguinhat": { name: "Penguin Hat", dyeable: false },
    "pighead": { name: "Pig Head", dyeable: false },
    "pinhead": { name: "Pin Head", dyeable: false },
    "plaguedoctor": { name: "Plague Doctor", dyeable: false },
    "pog": { name: "Poggers", dyeable: false },
    "pohatoe": { name: "Pohatoe", dyeable: false },
    "policebucket": { name: "Police Bucket", dyeable: true },
    "policesiren": { name: "Siren", dyeable: false },
    "poofballhat": { name: "Poofball", dyeable: true },
    "poofballrgb": { name: "RGB Poofball", dyeable: false },
    "popehat": { name: "Pope Hat", dyeable: false },
    "potionhead": { name: "Potion Head", dyeable: false },
    "presentsstack": { name: "Presents", dyeable: false },
    "propelhat": { name: "Propeller", dyeable: true },
    "questbook": { name: "Questbook Hat", dyeable: false },
    "rabbitears": { name: "Bunny Ears", dyeable: true },
    "rabbitonhead": { name: "Bunny on Head", dyeable: false },
    "rainboworbiters": { name: "Rainbow Orbiters", dyeable: false },
    "ranahat": { name: "Rana Cap", dyeable: true },
    "redeyes": { name: "Red Eyes", dyeable: false },
    "rednose": { name: "Red Nose", dyeable: false },
    "redstache": { name: "Plumber Stache", dyeable: false },
    "rgbbigribbon": { name: "RGB Big Ribbon", dyeable: false },
    "rgbbowler": { name: "RGB Bowler Cap", dyeable: false },
    "rgbdragonskull": { name: "RGB Dragon Skull", dyeable: false },
    "rgbdrinkinhat": { name: "RGB Drinking Hat", dyeable: false },
    "rgbeasterhead": { name: "RGB Easter Island Head", dyeable: false },
    "rgbfullhelm": { name: "RGB Armor Helm", dyeable: false },
    "rgbpartyhat": { name: "RGB Party Hat", dyeable: false },
    "rgbsmallbowler": { name: "RGB Small Bowler Cap", dyeable: false },
    "rgbsunglasses": { name: "RGB Sunglasses", dyeable: false },
    "rgbtoptophathat": { name: "RGB Toptop Hathat", dyeable: false },
    "rgbushanka": { name: "RGB Ushanka", dyeable: false },
    "rock": { name: "Rock Eye", dyeable: false },
    "rubbernipple": { name: "Baby Bottle Head", dyeable: false },
    "sandcastle": { name: "Sand Castle", dyeable: false },
    "santaclaus": { name: "Santa Claus", dyeable: false },
    "sausage": { name: "Sausage", dyeable: false },
    "seaweedhat": { name: "Seaweed Hat", dyeable: false },
    "shakehat": { name: "Shake Head", dyeable: false },
    "sheep": { name: "Sheep Head", dyeable: false },
    "shrekears": { name: "Shrek Ears", dyeable: false },
    "shroomcap": { name: "Shroom Cap", dyeable: true },
    "smokingpipe": { name: "Smoking Pipe", dyeable: false },
    "snowmanbaby": { name: "Baby Snowman", dyeable: false },
    "sombrero": { name: "Sombrero", dyeable: true },
    "sonichood": { name: "Sonic Head", dyeable: false },
    "spadesoldier": { name: "Spade Soldier", dyeable: false },
    "spiderweb": { name: "Web Head", dyeable: false },
    "springer": { name: "Springer", dyeable: false },
    "sprout": { name: "Sprout", dyeable: false },
    "spyzombie": { name: "Spy Zombie", dyeable: false },
    "stackofeggs": { name: "Egg Stack", dyeable: false },
    "stress": { name: "Stress", dyeable: false },
    "summerhat": { name: "Summer Hat", dyeable: true },
    "sunglasses": { name: "Sunglasses", dyeable: false },
    "sunglassesbig": { name: "Big Sunglasses", dyeable: false },
    "supersandhat": { name: "Saiyan Head", dyeable: false },
    "swimmer": { name: "Swimmer Cap", dyeable: true },
    "tinkerhat": { name: "Tinker's Helm", dyeable: false },
    "topcathat": { name: "Top Cat Hat", dyeable: false },
    "tophat": { name: "Top Hat", dyeable: true },
    "toptophathat": { name: "Toptop Hathat", dyeable: false },
    "triangleshades": { name: "Angled Shades", dyeable: false },
    "tricorne": { name: "Tricorne", dyeable: false },
    "tvhead": { name: "TV Head", dyeable: false },
    "unicornhorn": { name: "Unicorn Horn", dyeable: false },
    "ushanka": { name: "Ushanka", dyeable: true },
    "vikinghatbeard": { name: "Viking Helm", dyeable: false },
    "villagernose": { name: "Villager Nose", dyeable: false },
    "winghat": { name: "Wing Cap", dyeable: false },
    "zigzagwitchhat": { name: "Witch Hat", dyeable: true },
    "acornhat": { name: "Acorn Cap", dyeable: true },
    "aegishat": { name: "Aegis", dyeable: false },
    "alienphil": { name: "Phil?", dyeable: false },
    "simsgem": { name: "Plumbob", dyeable: false },
    "artsy_doll": { name: "Artsy Doll", dyeable: false },
    "azumanga_hat": { name: "Azumanga's Hat", dyeable: false },
    "beret_ribbon": { name: "Beret Ribbon", dyeable: true },
    "bucket": { name: "Bucket", dyeable: true },
    "burning_m_bison": { name: "Burning Flames Team Captain", dyeable: false },
    "chalk_stick": { name: "Chalk Stick", dyeable: false },
    "chi_ears": { name: "Chi's Ears", dyeable: false },
    "circular_glasses": { name: "Circular Glasses", dyeable: false },
    "cucumbereyemask": { name: "Cucumber Eye Mask", dyeable: false },
    "dejiko": { name: "Dejiko's Hat", dyeable: false },
    "fez": { name: "Fez", dyeable: true },
    "fishing_hat": { name: "Fishing Hat", dyeable: true },
    "lightning_eyes": { name: "Lightning Eyes", dyeable: false },
    "longfoxears": { name: "Long Fox Ears", dyeable: false },
    "milady_doll": { name: "Milady Doll", dyeable: false },
    "nyan_doll": { name: "Nyan Doll", dyeable: false },
    "orange_hat": { name: "Orange Hat", dyeable: true },
    "peppino": { name: "Peppino", dyeable: false },
    "pom_moog": { name: "Pom-Moog", dyeable: false },
    "puchiko": { name: "Puchiko's Hat", dyeable: false },
    "rabi_en_rose": { name: "Rabi~en~Rose's Hat", dyeable: false },
    "raincloud": { name: "Raincloud", dyeable: false },
    "scouter": { name: "Scouter", dyeable: false },
    "sleepeyemask": { name: "Sleep Eye Mask", dyeable: false },
    "sport_sunglasses": { name: "Sport Sunglasses", dyeable: false },
    "strawberry_hat": { name: "Strawberry Hat", dyeable: false },
    "teddy_bear": { name: "Teddy Bear", dyeable: false },
    "the_noise": { name: "The Noise", dyeable: false },
    "toy_story_alien": { name: "Toy Story Alien", dyeable: false },
    "twilight_doll": { name: "Twilight Doll", dyeable: false },
    "worms_mine": { name: "Worm's Mine", dyeable: false },
    "alien_antennae": { name: "Alien Antennae", dyeable: false },
    "angel_and_devil": { name: "Angel and Devil", dyeable: false },
    "astronaut": { name: "Astronaut", dyeable: false },
    "axolotl_on_head": { name: "Axolotl Friend", dyeable: true },
    "baby_crewmate": { name: "Baby Crewmate", dyeable: true },
    "bee_on_head": { name: "Bee Friend", dyeable: false },
    "beetle_on_head": { name: "Beetle Friend", dyeable: false },
    "binky": { name: "Binky", dyeable: true },
    "cardboard_box": { name: "Cardboard Box", dyeable: false },
    "cat_hat": { name: "Cat Hat", dyeable: true },
    "cat_on_head": { name: "Cat Friend", dyeable: true },
    "caterpillar_on_head": { name: "Caterpillar Friend", dyeable: false },
    "chocolate_sauced": { name: "Chocolate Sauced", dyeable: false },
    "crystal_horns": { name: "Crystal Horns", dyeable: false },
    "dipper": { name: "Dipper", dyeable: false },
    "druid_antlers": { name: "Druid Antlers", dyeable: false },
    "druid_antlers_rare": { name: "Elder Druid Antlers", dyeable: false },
    "eevee_ears": { name: "Eevee Ears", dyeable: false },
    "eyeholder_beeholder": { name: "Beeholder", dyeable: false },
    "eyeholder_dark": { name: "Dark Eyeholder", dyeable: false },
    "eyeholder_evil": { name: "Evil Eyeholder", dyeable: false },
    "eyeholder_warm": { name: "Warm Eyeholder", dyeable: false },
    "eyeholder_xanath": { name: "Xanath Eyeholder", dyeable: false },
    "gnome": { name: "Gnome Hat", dyeable: true },
    "gnome_clover_wig": { name: "Gnome Disguise", dyeable: false },
    "greaser": { name: "Greaser", dyeable: false },
    "hat_of_discipline": { name: "Hat of Discipline", dyeable: false },
    "ladybug_on_head": { name: "Ladybug Friend", dyeable: false },
    "lil_bows": { name: "Lil' Bows", dyeable: true },
    "lil_termagant": { name: "Lil' Termagant", dyeable: false },
    "medusa": { name: "Medusa", dyeable: false },
    "mimic_head": { name: "Mimic", dyeable: false },
    "mimic_head_dark": { name: "Dark Mimic", dyeable: false },
    "mimic_head_gold": { name: "Gold Mimic", dyeable: false },
    "mindflayer": { name: "Mindflayer", dyeable: false },
    "mindflayer_alhoon": { name: "Alhoon", dyeable: false },
    "octodad": { name: "Octodad", dyeable: false },
    "pika_ears": { name: "Pika Ears", dyeable: false },
    "right_hand_hat": { name: "Right Hand", dyeable: false },
    "round_purple_wig": { name: "Purple Wig", dyeable: false },
    "round_red_wig": { name: "Red Wig", dyeable: false },
    "slime_cube_dnd": { name: "Dungeon Slime Cube", dyeable: false },
    "slime_head": { name: "Slime Head", dyeable: false },
    "stinkycheeseman": { name: "Stinky Cheese Man", dyeable: false },
    "stuck_lollipop": { name: "Stuck Lollipop", dyeable: false },
    "tanuki_leaf": { name: "Tanuki Leaf", dyeable: false },
    "the_noisier": { name: "The Noisier", dyeable: false },
    "thumbnail": { name: "Youtube Thumbnail", dyeable: false },
    "tick_on_head": { name: "Tick Friend", dyeable: false },
    "toast": { name: "Toast", dyeable: false },
    "toilet": { name: "Toilet Head", dyeable: false },
    "tomato_splats": { name: "Tomato Splats", dyeable: false },
    "traffic_cone": { name: "Traffic Cone", dyeable: false },
    "udder_hat": { name: "Udder Hat", dyeable: false },
    "worm_hat": { name: "Worm Hat", dyeable: false },
    "frog_on_head": { name: "Frog Friend", dyeable: true },
    "parrot_on_head": { name: "Parrot Friend", dyeable: true },
    "bunny": { name: "Bunny Ears", dyeable: true },
    "beret": { name: "Beret", dyeable: true },
    "headphones": { name: "Headphones", dyeable: true },
    "cap": { name: "Cap", dyeable: true },
    "fedora": { name: "Fedora", dyeable: true }
};

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

// ==========================================
// 4. DATABASE SCHEMAS & MODELS
// ==========================================
const MinecraftLink = mongoose.model('MinecraftLink', new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    discordUsername: String,
    discordAvatar: String,
    minecraftUsername: { type: String, required: true, unique: true },
    minecraftUuid: String,
    twitchUsername: String,
    twitchAvatar: String,
    linkedAt: { type: Date, default: Date.now }
}));

const WhitelistApp = mongoose.model('WhitelistApp', new mongoose.Schema({
    discordId: String,
    discordUsername: String,
    discordAvatar: String,
    minecraftUsername: String,
    minecraftUuid: String,
    twitchUsername: String,
    twitchAvatar: String,
    status: { type: String, default: 'pending' }, // pending, approved, rejected
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date }
}));

const InventoryItem = mongoose.model('InventoryItem', new mongoose.Schema({
    discordId: { type: String, required: true },
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true }, // 'Pokemon' or 'Item'
    rarity: { type: String, required: true },
    image: String,
    claimed: { type: Boolean, default: false },
    claimedAt: Date,
    receivedAt: { type: Date, default: Date.now }
}));

const SystemSettings = mongoose.model('SystemSettings', new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed }
}));

const UserKey = mongoose.model('UserKey', new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    lambKeys: { type: Number, default: 0 },
    steakKeys: { type: Number, default: 0 },
    wagyuKeys: { type: Number, default: 0 },
    lastDailyClaim: { type: Date },
    updatedAt: { type: Date, default: Date.now }
}));

const RedemptionCode = mongoose.model('RedemptionCode', new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'lamb', 'steak', 'wagyu', 'nisaball'
    keyAmount: { type: Number, default: 1 },
    usageType: { type: String, default: 'once_global' }, // 'once_global', 'once_per_user', 'infinite', 'time_limited'
    expiresAt: { type: Date },
    usageCount: { type: Number, default: 0 },
    redeemedBy: [{ type: String }],
    isRedeemed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}));

// ==========================================
// 5. EXTERNAL INTEGRATIONS (RCON & DISCORD)
// ==========================================
const sendRconCommand = async (command) => {
    if (!Rcon || !RCON_HOST || !RCON_PASSWORD) {
        console.log(`🔔 [RCON SIMULATION] ${command}`);
        return 'Simulation: Success';
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const rcon = new Rcon({
            host: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD,
            timeout: 5000
        });

        try {
            await rcon.connect();
            const response = await rcon.send(command);
            console.log(`✅ [RCON SENT] ${command} | Response: ${response}`);
            await rcon.end().catch(() => {});
            return response;
        } catch (error) {
            await rcon.end().catch(() => {});
            console.warn(`⚠️ [RCON ATTEMPT ${attempt}/${maxRetries}] Failed: ${error.message}`);

            if (attempt === maxRetries) {
                console.error(`❌ [RCON ERROR] Could not send "${command}" after ${maxRetries} attempts.`);
                return false;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    return false;
};

const messageCache = {}; // channelId -> { data, timestamp }
const memberCache = new Map(); // `${guildId}:${userId}` -> { data, timestamp }
const activeMemberFetches = new Map(); // `${guildId}:${userId}` -> Promise

const fetchDiscordMessages = async (channelId) => {
    if (!DISCORD_BOT_TOKEN) throw new Error('Missing Bot Token');
    try {
        const response = await axios.get(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
            params: { limit: 15 },
            timeout: 5000
        });
        return response.data;
    } catch (error) {
        console.error('Discord API Error:', error.response?.status, error.response?.data || error.message);
        throw error;
    }
};

const fetchGuildMember = async (guildId, userId, force = false) => {
    if (!DISCORD_BOT_TOKEN) return null;

    const cacheKey = `${guildId}:${userId}`;

    if (!force) {
        const cached = memberCache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < 60 * 60 * 1000)) {
            return cached.data;
        }
        if (activeMemberFetches.has(cacheKey)) {
            return activeMemberFetches.get(cacheKey);
        }
    }

    const fetchPromise = (async () => {
        try {
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
            // Cache failure for 10 minutes to prevent API hammering on repeated 404s
            memberCache.set(cacheKey, {
                data: null,
                timestamp: Date.now() - (60 * 60 * 1000) + (10 * 60 * 1000)
            });
            return null;
        } finally {
            activeMemberFetches.delete(cacheKey);
        }
    })();

    activeMemberFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
};

// ==========================================
// 6. ROUTES
// ==========================================

// --- Health & Status ---
app.get('/', (req, res) => res.send('Urnisa Discord Service Active'));

app.get('/health', (req, res) => {
    res.status(200).json({
        ok: true,
        status: 'ok',
        service: 'urnisa-dbot',
        uptime: Math.floor(process.uptime()),
        dbConnected: mongoose.connection.readyState === 1,
        timestamp: new Date().toISOString()
    });
});

// --- Chat Preview ---
app.get('/api/messages', async (req, res) => {
    const { channelId } = req.query;
    if (!channelId) return res.status(400).json({ error: 'Channel ID required' });

    const cachedMsg = messageCache[channelId];
    if (cachedMsg && (Date.now() - cachedMsg.timestamp < 15 * 1000)) {
        return res.json(cachedMsg.data);
    }

    try {
        const messages = await fetchDiscordMessages(channelId);
        if (!Array.isArray(messages)) {
            throw new Error('Discord API response is not an array');
        }

        const enhancedMessages = await Promise.all(messages.map(async (msg) => {
            const memberData = await fetchGuildMember(GUILD_ID, msg.author.id);
            return {
                ...msg,
                member: memberData ? { nick: memberData.nick, avatar: memberData.avatar } : null
            };
        }));

        const finalData = enhancedMessages.reverse();
        messageCache[channelId] = { data: finalData, timestamp: Date.now() };
        res.json(finalData);
    } catch (error) {
        if (cachedMsg) {
            console.warn('⚠️ Discord API call failed. Serving stale cache.');
            return res.json(cachedMsg.data);
        }
        res.status(500).json({ error: 'Failed' });
    }
});

// --- Discord OAuth ---
app.post('/api/auth/discord', async (req, res) => {
    const { code, redirectUri } = req.body;
    if (!CLIENT_ID || !CLIENT_SECRET) return res.status(500).json({ error: 'Config missing' });

    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: redirectUri
            }),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 8000
            }
        );

        const { access_token } = tokenResponse.data;
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` },
            timeout: 5000
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

                if (mcUuid) {
                    try {
                        const profileRes = await axios.get(
                            `https://sessionserver.mojang.com/session/minecraft/profile/${encodeURIComponent(mcUuid)}`,
                            { timeout: 3000 }
                        );
                        if (profileRes.data && profileRes.data.name && profileRes.data.name !== mcUsername) {
                            console.log(`🔄 Minecraft username change detected for ${mcUuid}: ${mcUsername} -> ${profileRes.data.name}`);
                            mcUsername = profileRes.data.name;
                            existing.minecraftUsername = profileRes.data.name;
                            await existing.save();

                            await WhitelistApp.updateMany(
                                { discordId: userData.id },
                                { minecraftUsername: profileRes.data.name }
                            );
                        }
                    } catch (updateErr) {
                        console.error('Failed to check for Minecraft username updates via sessionserver:', updateErr.message);
                    }
                }
            }
        }

        res.json({
            id: userData.id,
            username: userData.username,
            global_name: userData.global_name,
            avatar: userData.avatar
                ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${(Number(userData.discriminator) || 0) % 5}.png`,
            minecraftUsername: mcUsername,
            minecraftUuid: mcUuid,
            twitchUsername,
            twitchAvatar
        });
    } catch (error) {
        res.status(400).json({ error: 'Auth Failed' });
    }
});

// --- Minecraft Account Linking ---
app.post('/api/minecraft/link', async (req, res) => {
    const { discordId, discordUsername, discordAvatar, minecraftUsername, twitchUsername, twitchAvatar } = req.body;
    if (!discordId || !minecraftUsername) return res.status(400).json({ error: 'Missing fields' });

    try {
        let minecraftUuid = null;
        let resolvedUsername = minecraftUsername;

        try {
            const uuidRes = await axios.get(
                `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(minecraftUsername)}`,
                { timeout: 4000 }
            );
            if (uuidRes.data && uuidRes.data.id) {
                minecraftUuid = uuidRes.data.id;
                resolvedUsername = uuidRes.data.name || minecraftUsername;
            }
        } catch (uuidErr) {
            console.error('Failed to fetch UUID from Mojang during link:', uuidErr.message);
            if (uuidErr.response && uuidErr.response.status === 404) {
                return res.status(404).json({ error: 'Minecraft username does not exist!' });
            }
        }

        const usernameRegex = new RegExp(`^${escapeRegex(resolvedUsername)}$`, 'i');
        const queryFilter = minecraftUuid
            ? { $or: [{ minecraftUuid }, { minecraftUsername: usernameRegex }] }
            : { minecraftUsername: usernameRegex };

        const existingLink = await MinecraftLink.findOne(queryFilter);
        if (existingLink && existingLink.discordId !== discordId) {
            return res.status(409).json({ error: 'Minecraft account already linked to another user!' });
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
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Minecraft account already linked to another user!' });
        }
        res.status(500).json({ error: 'Failed to link account' });
    }
});

app.delete('/api/minecraft/link', async (req, res) => {
    const { discordId } = req.body || {};
    if (!discordId) return res.status(400).json({ error: 'Missing Discord ID' });
    try {
        await MinecraftLink.findOneAndDelete({ discordId });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
});

// --- Whitelist Applications ---
app.post('/api/whitelist/apply', async (req, res) => {
    const { discordId } = req.body;
    if (!discordId) return res.status(400).json({ error: 'Missing ID' });

    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.minecraftUsername) return res.status(400).json({ error: 'No Minecraft account linked!' });
        if (!link.twitchUsername) return res.status(400).json({ error: 'No Twitch account linked!' });

        const existingApp = await WhitelistApp.findOne({ discordId, status: 'pending' });
        if (existingApp) return res.status(409).json({ error: 'You already have a pending application!' });

        const approvedApp = await WhitelistApp.findOne({ discordId, status: 'approved' });
        if (approvedApp) return res.status(200).json({ message: 'You are already whitelisted!' });

        const member = await fetchGuildMember(GUILD_ID, discordId, true);
        if (!member) return res.status(403).json({ error: 'You are not in the Discord server!' });

        const roles = member.roles || [];
        const hasSub = roles.includes(ROLE_SUBSCRIBER);
        const hasFriend = roles.includes(ROLE_FRIEND);
        if (!hasSub && !hasFriend) return res.status(403).json({ error: 'You need to be a Subscriber!' });

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
        res.json({ success: true, message: 'Application Sent! Please wait for admin approval.' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Admin Whitelist & Code Management ---
app.get('/api/admin/whitelist', auth, async (req, res) => {
    try {
        const apps = await WhitelistApp.find({ status: 'pending' }).sort({ appliedAt: 1 });
        res.json(apps);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/admin/whitelist/approved', auth, async (req, res) => {
    try {
        const apps = await WhitelistApp.find({ status: 'approved' }).sort({ approvedAt: -1, appliedAt: -1 });
        res.json(apps);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/whitelist/approve', auth, async (req, res) => {
    const { id } = req.body;
    try {
        const application = await WhitelistApp.findById(id);
        if (!application) return res.status(404).json({ error: 'App not found' });

        application.status = 'approved';
        application.approvedAt = new Date();
        await application.save();

        await sendRconCommand(`whitelist add ${application.minecraftUsername}`);

        if (DISCORD_BOT_TOKEN) {
            try {
                await axios.post(
                    `https://discord.com/api/v10/channels/${WHITELIST_NOTIFY_CHANNEL}/messages`,
                    { content: `<@${application.discordId}> You have been whitelisted!` },
                    {
                        headers: {
                            Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000
                    }
                );
                console.log(`✅ [Discord] Notification sent to <@${application.discordId}>`);
            } catch (err) {
                console.error(`❌ [Discord] Failed to send notification: ${err.message}`);
            }
        }

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/whitelist/reject', auth, async (req, res) => {
    const { id } = req.body;
    try {
        console.log(`❌ Rejecting app ID: ${id}`);
        await WhitelistApp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/whitelist/revoke', auth, async (req, res) => {
    const { id } = req.body;
    try {
        const application = await WhitelistApp.findById(id);
        if (!application) return res.status(404).json({ error: 'App not found' });

        await sendRconCommand(`whitelist remove ${application.minecraftUsername}`);
        await sendRconCommand(`kick ${application.minecraftUsername} You have been removed from the whitelist.`);

        await WhitelistApp.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/users/reset-daily', auth, async (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') return res.status(400).json({ error: 'Missing query' });

    try {
        let targetDiscordId = query.trim();
        const escapedQuery = escapeRegex(targetDiscordId);
        const queryRegex = new RegExp(`^${escapedQuery}$`, 'i');

        const link = await MinecraftLink.findOne({
            $or: [{ minecraftUsername: queryRegex }, { discordUsername: queryRegex }]
        });
        if (link) targetDiscordId = link.discordId;

        let wallet = await UserKey.findOne({ discordId: targetDiscordId });
        if (!wallet) wallet = new UserKey({ discordId: targetDiscordId });

        wallet.lastDailyClaim = null;
        await wallet.save();

        res.json({ success: true, message: `Daily timer reset for ${targetDiscordId}` });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Operation failed' });
    }
});

app.post('/api/admin/codes/generate', auth, async (req, res) => {
    const { type, amount = 1, keyAmount = 1, usageType = 'once_global', hours = 0 } = req.body;
    if (!type || !['lamb', 'steak', 'wagyu', 'nisaball'].includes(type)) {
        return res.status(400).json({ error: 'Invalid pack type' });
    }

    try {
        const codes = [];
        const totalToCreate = Math.max(1, Math.min(parseInt(amount, 10) || 1, 500));
        const parsedKeyAmount = Math.max(1, parseInt(keyAmount, 10) || 1);
        let expiresAt;
        if (usageType === 'time_limited' && hours > 0) {
            expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        }

        for (let i = 0; i < totalToCreate; i++) {
            const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
            codes.push({
                code: `${type.toUpperCase()}-${raw}`,
                type,
                keyAmount: parsedKeyAmount,
                usageType,
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
        res.status(500).json({ error: 'Failed to generate codes' });
    }
});

app.get('/api/admin/codes/list', auth, async (req, res) => {
    try {
        const codes = await RedemptionCode.find().sort({ createdAt: -1 }).limit(100);
        res.json(codes);
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch codes' });
    }
});

app.post('/api/admin/codes/delete', auth, async (req, res) => {
    const { id } = req.body;
    try {
        await RedemptionCode.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to delete' });
    }
});

app.post('/api/admin/users/merge', auth, async (req, res) => {
    const { sourceUser, targetUser } = req.body;
    if (!sourceUser || !targetUser) return res.status(400).json({ error: 'Invalid parameters' });
    try {
        const escapedSource = escapeRegex(sourceUser.trim());
        const sourceRegex = new RegExp(`^\\s*${escapedSource}\\s*$`, 'i');

        await MinecraftLink.updateMany({ twitchUsername: sourceRegex }, { twitchUsername: targetUser.trim() });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/admin/maintenance/wipe-minecraft-data', auth, async (req, res) => {
    const { scope } = req.body;
    try {
        console.log(`⚠️ Admin triggered wipe on DBot. Scope: ${scope}`);
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

// --- Codes, Packs & Inventory ---
app.post('/api/codes/redeem', async (req, res) => {
    const { discordId, code } = req.body;
    if (!discordId || !code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing Discord ID or code.' });
    }

    try {
        const codeRecord = await RedemptionCode.findOne({ code: code.trim().toUpperCase() });
        if (!codeRecord) return res.status(404).json({ error: 'Invalid code.' });

        if (codeRecord.isRedeemed && codeRecord.usageType === 'once_global') {
            return res.status(400).json({ error: 'Code already redeemed.' });
        }
        if (codeRecord.usageType === 'once_per_user' && codeRecord.redeemedBy.includes(discordId)) {
            return res.status(400).json({ error: 'You already redeemed this code.' });
        }
        if (codeRecord.usageType === 'time_limited' && codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Code expired.' });
        }

        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = new UserKey({ discordId });

        const amount = codeRecord.keyAmount || 1;
        if (codeRecord.type === 'lamb') wallet.lambKeys += amount;
        else if (codeRecord.type === 'steak') wallet.steakKeys += amount;
        else if (codeRecord.type === 'wagyu') wallet.wagyuKeys += amount;
        else if (codeRecord.type === 'nisaball') {
            const link = await MinecraftLink.findOne({ discordId });
            if (link && link.twitchUsername) {
                await axios.post(
                    `${BACKEND_URL}/api/nisathon/test-event`,
                    {
                        type: 'nisaball',
                        user: link.twitchUsername,
                        amount,
                        tier: '1000',
                        isNisathon: false,
                        hidden: true
                    },
                    { headers: { Authorization: ADMIN_PASSWORD }, timeout: 8000 }
                ).catch(e => console.error('Failed to add nisaball:', e.message));
            }
        }

        if (codeRecord.usageType === 'once_global') codeRecord.isRedeemed = true;
        codeRecord.redeemedBy.push(discordId);
        codeRecord.usageCount += 1;

        await codeRecord.save();
        await wallet.save();

        res.json({ success: true, type: codeRecord.type, amount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error.' });
    }
});

app.post('/api/inventory/save', async (req, res) => {
    const { discordId, items } = req.body;
    if (!discordId || !Array.isArray(items)) {
        return res.status(400).json({ error: 'Missing discordId or items array' });
    }

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
    const { discordId, packType, type, amount = 1 } = req.body;
    const actualPackType = (packType || type || '').toLowerCase();
    const qty = Math.max(1, parseInt(amount, 10) || 1);

    if (!discordId) return res.status(400).json({ error: 'Missing Discord ID.' });

    try {
        const wallet = await UserKey.findOne({ discordId });
        if (!wallet) return res.status(400).json({ error: 'No wallet found.' });

        let remaining = 0;
        if (actualPackType === 'lamb') {
            if ((wallet.lambKeys || 0) < qty) return res.status(400).json({ error: 'Not enough Lamb Keys.' });
            wallet.lambKeys -= qty;
            remaining = wallet.lambKeys;
        } else if (actualPackType === 'steak' || actualPackType === 'wagyu') {
            const hasSteak = wallet.steakKeys || 0;
            const hasWagyu = wallet.wagyuKeys || 0;
            if (hasSteak + hasWagyu < qty) return res.status(400).json({ error: 'Not enough keys.' });

            const primaryField = actualPackType === 'steak' ? 'steakKeys' : 'wagyuKeys';
            const secondaryField = actualPackType === 'steak' ? 'wagyuKeys' : 'steakKeys';

            let needed = qty;
            const takePrimary = Math.min(wallet[primaryField] || 0, needed);
            wallet[primaryField] = (wallet[primaryField] || 0) - takePrimary;
            needed -= takePrimary;

            if (needed > 0) {
                wallet[secondaryField] = Math.max(0, (wallet[secondaryField] || 0) - needed);
            }
            remaining = (wallet.wagyuKeys || 0) + (wallet.steakKeys || 0);
        } else {
            return res.status(400).json({ error: 'Invalid pack type.' });
        }

        await wallet.save();
        res.json({ success: true, remaining });
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
        const items = await InventoryItem.find({ discordId: req.query.discordId }).sort({ receivedAt: -1 });
        res.json(items);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const TCG_PACK_PATH_RULES = [
    { match: (lower, id) => lower.includes('silver tempest') || id === 'tcg-13', path: 'silvertempest/sealed_silvertempest' },
    { match: (lower, id) => lower.includes('paldea evolved') || id === 'tcg-15', path: 'paldeanevolved/sealed_paldeanevolved' },
    { match: (lower, id) => lower.includes('prismatic evolutions') || id === 'tcg-21', path: 'prismaticevolutions/sealed_prismaticevolution' },
    { match: (lower, id) => lower.includes('ascended') || id === 'tcg-28', path: 'ascended/sealed_ascended' },
    { match: (lower, id) => lower.includes('astral radiance') || id === 'tcg-11', path: 'aradiance/sealed_aradiance' },
    { match: (lower, id) => lower.includes('base set') || id === 'tcg-1' || id === '40001', path: 'baseset/sealed_baseset' },
    { match: (lower, id) => lower.includes('brilliant stars') || id === 'tcg-10', path: 'bstars/sealed_bstars' },
    { match: (lower, id) => lower.includes('crown zenith') || id === 'tcg-14', path: 'czenith/sealed_czenith' },
    { match: (lower, id) => lower.includes('destined rivals') || id === 'tcg-23', path: 'drivals/sealed_drivals' },
    { match: (lower, id) => lower.includes('evolving skies') || id === 'tcg-9', path: 'eskies/sealed_eskies' },
    { match: (lower, id) => lower.includes('lost origin') || id === 'tcg-12', path: 'lorigin/sealed_lorigin' },
    { match: (lower, id) => lower.includes('phantasmal') || id === 'tcg-27', path: 'pflames/sealed_pflames' },
    { match: (lower, id) => lower.includes('roaring skies') || id === 'tcg-4', path: 'rskies/sealed_rskies' },
    { match: (lower, id) => lower.includes('team up') || id === 'tcg-5', path: 'teamup/sealed_teamup' },
    { match: (lower, id) => lower.includes('team rocket') || id === 'tcg-2', path: 'trocket/sealed_trocket' },
    { match: (lower, id) => lower.includes('surging sparks') || id === 'tcg-20', path: 'ssparks/sealed_ssparks' },
    { match: (lower, id) => lower.includes('unified minds') || id === 'tcg-7', path: 'uminds/sealed_uminds' },
    { match: (lower, id) => lower.includes('gym challenge') || id === 'tcg-3', path: 'gchallange/sealed_gchallange' },
    { match: (lower, id) => lower.includes('hidden fates') || id === 'tcg-8', path: 'hfates/sealed_hfates' },
    { match: (lower, id) => lower.includes('paldean fates') || id === 'tcg-18', path: 'pfates/sealed_pfates' },
    { match: (lower, id) => lower.includes('unbroken bounds') || id === 'tcg-6', path: 'ubounds/sealed_ubounds' },
    { match: (lower, id) => lower.includes('paradox rift') || id === 'tcg-17', path: 'prift/sealed_prift' },
    { match: (lower, id) => lower.includes('temporal forces') || id === 'tcg-19', path: 'tforces/sealed_tforces' },
    { match: (lower, id) => lower.includes('journey together') || id === 'tcg-22', path: 'jtogether/sealed_jtogether' },
    { match: (lower, id) => lower.includes('black bolt') || id === 'tcg-24', path: 'bbolt/sealed_bbolt' },
    { match: (lower, id) => lower.includes('white flare') || id === 'tcg-25', path: 'wflare/sealed_wflare' },
    { match: (lower, id) => lower.includes('mega evolution') || id === 'tcg-26', path: 'mevolution/sealed_mevolution' },
    { match: (lower, id) => lower.includes('mew 151') || id === 'tcg-16' || id === '40050', path: 'mew151/sealed_mew151' }
];

const buildClaimRconCommand = (player, item) => {
    const itemNameLower = item.name.toLowerCase();

    if (item.type === 'Pokemon') {
        return `pokegiveother ${player} ${item.name.replace(/\s+/g, '').toLowerCase()} level=5`;
    }
    if (itemNameLower.includes('mew ex tcg card') || item.itemId === '40051') {
        return `give ${player} cobbletcg:mew151/cards/mew151 1`;
    }
    if (
        itemNameLower.includes('tcg pack') ||
        itemNameLower.includes('booster pack') ||
        (item.itemId && item.itemId.startsWith('tcg-')) ||
        item.itemId === '40001' ||
        item.itemId === '40050'
    ) {
        const matchedRule = TCG_PACK_PATH_RULES.find(r => r.match(itemNameLower, item.itemId));
        const packPath = matchedRule ? matchedRule.path : 'baseset/sealed_baseset';
        return `give ${player} cobbletcg:${packPath} 1`;
    }
    if (itemNameLower.includes('loot ball') || itemNameLower.includes('lootball')) {
        let lootBallNbt = 'poke';
        let variant = 'poke';
        let texture = 'cobblemon:textures/poke_balls/poke_ball.png';

        if (itemNameLower.includes('uncommon') || item.itemId === '40011') {
            lootBallNbt = 'great';
            variant = 'great';
            texture = 'cobblemon:textures/poke_balls/great_ball.png';
        } else if (itemNameLower.includes('ultra rare') || itemNameLower.includes('ultra-rare') || item.itemId === '40061') {
            lootBallNbt = 'master';
            variant = 'master';
            texture = 'cobblemon:textures/poke_balls/master_ball.png';
        } else if (itemNameLower.includes('rare') || item.itemId === '40060') {
            lootBallNbt = 'ultra';
            variant = 'ultra';
            texture = 'cobblemon:textures/poke_balls/ultra_ball.png';
        }
        return `give ${player} cobbleloots:loot_ball[minecraft:custom_data={LootBallData:"cobbleloots:loot_ball/${lootBallNbt}",Variant:"${variant}",Texture:"${texture}"}] 1`;
    }
    if (itemNameLower.includes('cobbledollar')) {
        const dollarsMatch = item.name.match(/\d+/);
        const amount = dollarsMatch ? dollarsMatch[0] : '50';
        return `cobbledollars give ${player} ${amount}`;
    }
    if (itemNameLower.includes('relic coin')) {
        const relicMatch = item.name.match(/^(\d+)x/);
        const count = relicMatch ? parseInt(relicMatch[1], 10) : 1;
        return `give ${player} cobblemon:relic_coin ${count}`;
    }
    if (itemNameLower.includes('koban coin')) {
        const kobanMatch = item.name.match(/^(\d+)x/);
        const count = kobanMatch ? parseInt(kobanMatch[1], 10) : 1;
        return `give ${player} cobbledgacha:koban_coin ${count}`;
    }
    if (itemNameLower.includes('hat bag')) {
        let bagId = 'simplehats:hatbag_common';
        if (itemNameLower.includes('uncommon')) bagId = 'simplehats:hatbag_uncommon';
        else if (itemNameLower.includes('rare')) bagId = 'simplehats:hatbag_rare';
        else if (itemNameLower.includes('epic')) bagId = 'simplehats:hatbag_epic';
        else if (itemNameLower.includes('summer')) bagId = 'simplehats:hatbag_summer';
        return `give ${player} ${bagId} 1`;
    }

    let count = 1;
    let itemName = item.name;
    const match = item.name.match(/^(\d+)x\s+(.+)$/);
    if (match) {
        count = parseInt(match[1], 10);
        itemName = match[2];
    }

    let isHat = false;
    let hatId = null;
    const cleanItemId = item.itemId ? item.itemId.replace(/^hat-/, '').toLowerCase() : '';
    const cleanName = itemName.toLowerCase().replace(/\s+/g, '').replace(/hat$/, '');

    if (AUTHENTIC_HAT_OVERRIDES[cleanItemId]) {
        isHat = true;
        hatId = cleanItemId;
    } else if (AUTHENTIC_HAT_OVERRIDES[itemName.toLowerCase()]) {
        isHat = true;
        hatId = itemName.toLowerCase();
    } else if (AUTHENTIC_HAT_OVERRIDES[cleanName]) {
        isHat = true;
        hatId = cleanName;
    } else if (AUTHENTIC_HAT_OVERRIDES[cleanName + 'hat']) {
        isHat = true;
        hatId = cleanName + 'hat';
    } else {
        for (const [key, val] of Object.entries(AUTHENTIC_HAT_OVERRIDES)) {
            if (val.name.toLowerCase() === itemName.toLowerCase() || val.name.toLowerCase() === cleanName) {
                isHat = true;
                hatId = key;
                break;
            }
        }
    }

    if (!isHat && (item.type?.toLowerCase() === 'hat' || (item.itemId && item.itemId.startsWith('hat-')))) {
        isHat = true;
        hatId = cleanItemId || cleanName;
    }

    if (isHat && hatId) {
        return `give ${player} simplehats:${hatId} 1`;
    }

    const mappedId = ITEM_MAP[itemName];
    if (mappedId) {
        return `give ${player} ${mappedId} ${count}`;
    }

    return null;
};

app.post('/api/inventory/claim', async (req, res) => {
    const { discordId, itemIds, dbItemId } = req.body;
    if (!discordId) return res.status(400).json({ error: 'Missing Discord ID' });

    const targetIds = Array.isArray(itemIds) ? itemIds : (dbItemId ? [dbItemId] : []);
    if (targetIds.length === 0) return res.status(400).json({ error: 'No items specified.' });

    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.minecraftUsername) return res.status(400).json({ error: 'No Minecraft account linked!' });

        const items = await InventoryItem.find({ _id: { $in: targetIds }, discordId, claimed: false });
        if (items.length === 0) return res.status(400).json({ error: 'No unclaimed items found.' });

        const player = link.minecraftUsername;
        const listResponse = await sendRconCommand('list');
        if (listResponse === false) {
            return res.status(502).json({ error: 'Could not connect to Minecraft Server.' });
        }

        const lowerList = (listResponse || '').toLowerCase();
        const lowerPlayer = player.toLowerCase();
        const playerRegex = new RegExp(`\\b${escapeRegex(lowerPlayer)}\\b`);
        const isOnline = (lowerList.includes(lowerPlayer) && playerRegex.test(lowerList)) ||
            (listResponse || '').includes('Simulation');

        if (!isOnline) {
            return res.status(409).json({ error: 'You must be online in-game to claim items!' });
        }

        let claimedCount = 0;
        for (const item of items) {
            const command = buildClaimRconCommand(player, item);
            if (!command) {
                console.error(`❌ Unknown item mapping: ${item.name}`);
                return res.status(500).json({ error: 'Item ID map missing. Contact Admin.' });
            }

            console.log(`🚀 Executing Claim: ${command}`);
            const rconSuccess = await sendRconCommand(command);
            if (rconSuccess) {
                item.claimed = true;
                item.claimedAt = new Date();
                await item.save();
                claimedCount++;
            }
        }

        if (claimedCount > 0) {
            res.json({ success: true, claimedCount });
        } else {
            res.status(502).json({ error: 'RCON Failed. Server might be offline.' });
        }
    } catch (e) {
        console.error('Claim Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// --- Shop & Daily Check-In ---
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
        if (!doc) doc = new SystemSettings({ key: 'shopOffset', value: 0 });
        doc.value = (doc.value || 0) + 1;
        await doc.save();
        res.json({ success: true, newOffset: doc.value });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/shop/buy-item', async (req, res) => {
    const { discordId, item } = req.body;
    if (!discordId || !item || !item.id || !item.price) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.twitchUsername) return res.status(400).json({ error: 'No Twitch account linked!' });

        const balanceRes = await axios.get(
            `${BACKEND_URL}/api/nisathon/user/${encodeURIComponent(link.twitchUsername.trim())}`,
            { timeout: 8000 }
        );
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        const totalCost = item.price;

        if (currentNisaballs < totalCost) {
            return res.status(400).json({ error: `Insufficient Nisaballs! Need ${totalCost}.` });
        }

        const deductRes = await axios.post(
            `${BACKEND_URL}/api/nisathon/test-event`,
            { type: 'shop', user: link.twitchUsername, amount: -totalCost, tier: '1000', isNisathon: false, hidden: true },
            { headers: { Authorization: ADMIN_PASSWORD }, timeout: 8000 }
        );
        if (!deductRes.data || deductRes.data.error) throw new Error('Failed deduction');

        const newItem = await InventoryItem.create({
            discordId,
            itemId: item.id.toString(),
            name: item.name,
            type: item.type || 'Item',
            rarity: item.rarity || 'COMMON',
            image: item.image || '',
            claimed: false
        });

        res.json({ success: true, item: newItem, newBalance: Math.floor(currentNisaballs - totalCost) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/shop/spin', async (req, res) => {
    const { discordId } = req.body;
    if (!discordId) return res.status(400).json({ error: 'Missing Discord ID' });

    try {
        const link = await MinecraftLink.findOne({ discordId });
        if (!link || !link.twitchUsername) return res.status(400).json({ error: 'No Twitch account linked!' });

        const balanceRes = await axios.get(
            `${BACKEND_URL}/api/nisathon/user/${encodeURIComponent(link.twitchUsername.trim())}`,
            { timeout: 8000 }
        );
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        if (currentNisaballs < 1) return res.status(400).json({ error: 'Insufficient Nisaballs! Need 1.' });

        await axios.post(
            `${BACKEND_URL}/api/nisathon/test-event`,
            { type: 'shop', user: link.twitchUsername, amount: -1, tier: '1000', isNisathon: false, hidden: true },
            { headers: { Authorization: ADMIN_PASSWORD }, timeout: 8000 }
        );

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
    if (!discordId) return res.status(400).json({ error: 'Missing Discord ID' });

    try {
        let wallet = await UserKey.findOne({ discordId });
        if (!wallet) wallet = new UserKey({ discordId });

        const now = new Date();
        if (wallet.lastDailyClaim) {
            const diff = now.getTime() - new Date(wallet.lastDailyClaim).getTime();
            const cooldown = 24 * 60 * 60 * 1000;
            if (diff < cooldown) {
                return res.status(403).json({ success: false, error: 'Already claimed today.', remainingMs: cooldown - diff });
            }
        }
        wallet.lambKeys += 1;
        wallet.lastDailyClaim = now;
        await wallet.save();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ==========================================
// 7. STARTUP, KEEP-ALIVE & SHUTDOWN
// ==========================================
let server = null;
let keepAliveInterval = null;
let keepAliveInitialTimer = null;

const pingBackend = async () => {
    try {
        await axios.get(`${BACKEND_URL}/health`, { timeout: 10000 });
    } catch (err) {
        console.warn(`⚠️ [Keep-Alive] Ping to ${BACKEND_URL}/health failed: ${err.message}`);
    }
};

const startKeepAlive = () => {
    if (!BACKEND_URL || BACKEND_URL.includes('localhost') || BACKEND_URL.includes('127.0.0.1')) return;
    // Initial staggered ping 30s after startup, then every 8 minutes
    keepAliveInitialTimer = setTimeout(pingBackend, 30 * 1000);
    keepAliveInterval = setInterval(pingBackend, KEEP_ALIVE_INTERVAL_MS);
    console.log(`🔁 [Keep-Alive] Mutual ping active -> ${BACKEND_URL}/health (every ${KEEP_ALIVE_INTERVAL_MS / 60000}m)`);
};

const startServer = () => {
    server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ [DBot] Server running on port ${PORT}`);
        startKeepAlive();
    });

    if (MONGO_URI) {
        mongoose.set('strictQuery', false);
        mongoose.connect(MONGO_URI)
            .then(() => console.log('✅ [BotDB] MongoDB Connected'))
            .catch(e => console.error('❌ [BotDB] MongoDB Error:', e.message));
    } else {
        console.warn('⚠️ [BotDB] MONGO_URI missing. Account linking will not save.');
    }
};

const gracefulShutdown = async (signal) => {
    console.log(`🛑 [DBot] Received ${signal}. Shutting down cleanly...`);
    if (keepAliveInitialTimer) clearTimeout(keepAliveInitialTimer);
    if (keepAliveInterval) clearInterval(keepAliveInterval);

    if (server) {
        server.close(async () => {
            try {
                if (mongoose.connection.readyState !== 0) await mongoose.connection.close();
            } catch (e) {
                console.error('Error closing MongoDB:', e.message);
            }
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();
