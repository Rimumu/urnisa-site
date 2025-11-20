
export const TWITCH_CHANNEL_NAME = 'urnisa_';
export const DISCORD_SERVER_ID = '1336782145833668729';
export const DISCORD_INVITE_URL = 'https://discord.gg/urnisa';

// AFTER YOU DEPLOY TO RENDER:
// Replace 'http://localhost:3001' below with your new Render URL (e.g., 'https://urnisa-bot.onrender.com')
export const API_BASE_URL = 'https://urnisa-bot.onrender.com';

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
        userIds: [], 
        // Fallback usernames
        usernames: ['MegaBooster', 'SuperFan'] 
    },
    // Any user not matching the above roles will be placed in the "Meatlings" section.
];
