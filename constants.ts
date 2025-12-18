
export const TWITCH_CHANNEL_NAME = 'urnisa_';
export const DISCORD_SERVER_ID = '1336782145833668729';
export const DISCORD_INVITE_URL = 'https://discord.gg/urnisa';
export const DISCORD_CHAT_CHANNEL_ID = '1336782147490549869';
export const DEFAULT_SCHEDULE_URL = 'https://cdn.discordapp.com/attachments/1338254150479118347/1439859590152978443/3_am_17.png?ex=6921fbfd&is=6920aa7d&hm=926ad591d323ccc29cd9f7dc2e256de99d8f5dcc292aa3a883f565455844c977&';

// --------------------------------------------------------------------------
// SERVICE CONFIGURATION
// --------------------------------------------------------------------------

const hostname = window.location.hostname;
const isLocal = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.');

// 1. General Website Backend (Database, Nisathon, Admin)
const BACKEND_PROD_URL = 'https://urnisa-backend-21ls.onrender.com';
export const API_BASE_URL = isLocal ? `http://${hostname}:3001` : BACKEND_PROD_URL;

// 2. Discord Bot Service (Chat Preview + Auth)
const BOT_PROD_URL = 'https://urnisa-dbot-r1lm.onrender.com';
export const DISCORD_API_URL = isLocal ? `http://${hostname}:3002` : BOT_PROD_URL;

// 3. Discord OAuth Configuration
// Replace with your actual Client ID from Discord Developer Portal
export const DISCORD_CLIENT_ID = "1381873499173421056"; // Using Server ID as placeholder, REPLACE WITH REAL CLIENT ID
export const DISCORD_REDIRECT_URI = isLocal 
    ? `http://${hostname}:5173/minecraft`
    : `https://www.urnisa.live/minecraft`;


// Configuration for grouping online members from the Discord Widget API.
export const DISCORD_ROLES_CONFIG = [
    { 
        id: 'owner',
        name: 'Owner', 
        color: 'text-pink-300',
        userIds: ['433262414759198720'], 
        usernames: ['Urnisa', 'urnisa', 'urnisa_', 'nisa'],
        avatarUrl: 'https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png'
    },
    { 
        id: 'guard_dogs',
        name: 'Guard Dogs', 
        color: 'text-green-400',
        userIds: ['938038904072855562'], 
        usernames: ['MegaBooster', 'SuperFan'] 
    },
];

// Default Content for About Page (Database Fallback)
export const DEFAULT_ABOUT_CONTENT = [
    {
        id: '1',
        title: 'Introduction',
        text: 'put introduction here'
    }
];

export const DEFAULT_CREDITS_CONTENT = [
    {
        id: '1',
        name: 'Rimu',
        role: 'Website Developer',
        image: '', 
        color: '#e5383b', // brand-primary
        initial: 'R',
        link: 'https://github.com/Rimumu'
    },
    {
        id: '2',
        name: 'ArtistName',
        role: 'Stream Overlays & Emotes',
        image: '',
        color: '#9333ea', // purple-600
        initial: 'A',
        link: ''
    },
    {
        id: '3',
        name: 'Moderators',
        role: 'Keeping the chat clean & cozy',
        image: '',
        color: '#3b82f6', // blue-500
        initial: 'M',
        link: ''
    }
];

export const DEFAULT_ARTWORKS_CONTENT = [
    {
        id: '1',
        artistName: 'Official Art',
        artistLink: '',
        images: [
            'https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png',
            'https://i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png'
        ]
    }
];

export const DEFAULT_NISATHON_GOALS = [
    { count: 1, reward: "Open Mic" },
    { count: 5, reward: "Unlock New Emote" },
    { count: 10, reward: "Change In-Game Name" },
    { count: 25, reward: "Chat Changes Socials PFP" },
    { count: 50, reward: "BDSM Test" },
    { count: 75, reward: "Minecraft Server Opening" },
    { count: 100, reward: "Karaoke & Dancing" },
    { count: 150, reward: "18+ ASMR" },
    { count: 200, reward: "NSFW Art Release" },
    { count: 300, reward: "Nisa's Mom Stream" },
    { count: 400, reward: "Maid Outfit Stream" },
    { count: 500, reward: "NSFW Twitter Post" },
    { count: 669, reward: "Top Secret Extended Goal", secret: true },
];

export const DEFAULT_WHEEL_ITEMS = [
    { label: "VIP Status", weight: 5 },
    { label: "Timeout (10m)", weight: 15 },
    { label: "Choose Game", weight: 5 },
    { label: "Free Sub", weight: 10 },
    { label: "Hydrate!", weight: 20 },
    { label: "Posture Check", weight: 20 },
    { label: "Karaoke Song", weight: 10 },
    { label: "Nothing KEKW", weight: 15 },
];