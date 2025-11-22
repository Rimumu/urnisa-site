
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
// Since the widget API does not return roles, we must manually map specific
// User IDs or Usernames to these groups.
export const DISCORD_ROLES_CONFIG = [
    { 
        id: 'owner',
        name: 'Owner', 
        color: 'text-pink-300',
        // Real Discord User ID for the owner provided by user.
        userIds: ['433262414759198720'], 
        usernames: ['Urnisa', 'urnisa', 'urnisa_', 'nisa'],
        // Fallback avatar if user is offline or avatar cannot be fetched.
        // Using the Nisa Nomnom icon as it is more brand-appropriate than the Twitch PFP.
        avatarUrl: 'https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png'
    },
    { 
        id: 'guard_dogs',
        name: 'Guard Dogs', 
        color: 'text-green-400',
        // Add Moderator/VIP IDs here
        userIds: ['938038904072855562'], 
        // Fallback usernames
        usernames: ['MegaBooster', 'SuperFan'] 
    },
    // Any user not matching the above roles will be placed in the "Meatlings" section.
];