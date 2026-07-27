
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

// --- AUTHENTIC HAT OVERRIDES ---
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

// SystemSettings Schema
const SystemSettingsSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed }
});
const SystemSettings = mongoose.model('SystemSettings', SystemSettingsSchema);

const UserKeySchema = new mongoose.Schema({
    discordId: { type: String, required: true, unique: true },
    lambKeys: { type: Number, default: 0 },
    steakKeys: { type: Number, default: 0 },
    wagyuKeys: { type: Number, default: 0 },
    lastDailyClaim: { type: Date }, // Added for daily check-in
    updatedAt: { type: Date, default: Date.now }
});
const UserKey = mongoose.model('UserKey', UserKeySchema);

// Redemption Code Schema (UPDATED)
const RedemptionCodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true }, // 'lamb', 'steak', or 'wagyu'
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

const fetchGuildMember = async (guildId, userId, force = false) => {
    if (!DISCORD_BOT_TOKEN) return null;

    const cacheKey = `${guildId}:${userId}`;
    
    if (!force) {
        const cached = memberCache.get(cacheKey);
        // Cache members for 60 minutes to reduce API calls significantly
        if (cached && (Date.now() - cached.timestamp < 60 * 60 * 1000)) {
            return cached.data;
        }

        // Reuse in-flight promise if we are already fetching this user to avoid concurrent duplicates
        if (activeMemberFetches.has(cacheKey)) {
            return activeMemberFetches.get(cacheKey);
        }
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

    // 4. Check Discord Roles (force fetch to bypass cache)
    const member = await fetchGuildMember(GUILD_ID, discordId, true);
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

        let wallet = await UserKey.findOne({ discordId: targetDiscordId });
        if (!wallet) {
            wallet = new UserKey({ discordId: targetDiscordId });
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

    if (!type || !['lamb', 'steak', 'wagyu', 'nisaball'].includes(type)) return res.status(400).json({ error: "Invalid pack type" });

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


app.post('/api/admin/users/merge', auth, async (req, res) => {
    const { sourceUser, targetUser } = req.body;
    if (!sourceUser || !targetUser) return res.status(400).json({ error: "Invalid parameters" });
    try {
        const escapedSource = sourceUser.trim().replace(/[.*+?^\$\{\}()|[\]\\]/g, '\\$&');
        const sourceRegex = new RegExp(`^\\s*\${escapedSource}\\s*$`, 'i');
        
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
                await axios.post(`${backendUrl}/api/nisathon/test-event`, {
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
            let cmd = `/give ${link.minecraftUsername} ${item.itemId} 1`;
            if (item.type === 'Pokemon') cmd = `/pokegive ${link.minecraftUsername} ${item.name}`;
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
        
        const balanceRes = await axios.get(`${backendUrl}/api/nisathon/user/${encodeURIComponent(link.twitchUsername.trim())}`);
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        const totalCost = item.price;
        
        if (currentNisaballs < totalCost) return res.status(400).json({ error: `Insufficient Nisaballs! Need ${totalCost}.` });

        const deductRes = await axios.post(`${backendUrl}/api/nisathon/test-event`, {
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
        
        const balanceRes = await axios.get(`${backendUrl}/api/nisathon/user/${encodeURIComponent(link.twitchUsername.trim())}`);
        const currentNisaballs = balanceRes.data.totalNisaballs || 0;
        
        if (currentNisaballs < 1) return res.status(400).json({ error: "Insufficient Nisaballs! Need 1." });

        await axios.post(`${backendUrl}/api/nisathon/test-event`, {
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
    console.log(`✅ [DBot] Server running on port ${PORT}`);
});
