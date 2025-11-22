
export const TWITCH_CHANNEL_NAME = 'urnisa_';
export const DISCORD_SERVER_ID = '1336782145833668729';
export const DISCORD_INVITE_URL = 'https://discord.gg/urnisa';
export const DISCORD_CHAT_CHANNEL_ID = '1336782147490549869';
export const DEFAULT_SCHEDULE_URL = 'https://cdn.discordapp.com/attachments/1338254150479118347/1439859590152978443/3_am_17.png?ex=6921fbfd&is=6920aa7d&hm=926ad591d323ccc29cd9f7dc2e256de99d8f5dcc292aa3a883f565455844c977&';

// --------------------------------------------------------------------------
// IMPORTANT: REPLACE THE URL BELOW WITH YOUR ACTUAL RENDER APP URL
// --------------------------------------------------------------------------
const RENDER_URL = 'https://urnisa-bot.onrender.com';

// Automatically use localhost for development, and Render for production.
// Checks for localhost, 127.0.0.1, and common local network IPs (192.168.x.x).
const hostname = window.location.hostname;
const isLocal = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.');

export const API_BASE_URL = isLocal ? 'http://localhost:3001' : RENDER_URL;

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
