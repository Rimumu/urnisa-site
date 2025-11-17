
export const TWITCH_CHANNEL_NAME = 'urnisa_';
export const DISCORD_SERVER_ID = '1336782145833668729';
export const DISCORD_INVITE_URL = 'https://discord.gg/urnisa';

// Defines the key roles to be displayed in the custom Discord Widget.
// The color should be a Tailwind CSS color class (e.g., 'text-red-400').
// Includes a static list of members for each role to be displayed when filtered.
export const FEATURED_ROLES = [
    { 
        name: 'Owner', 
        color: 'text-pink-300',
        members: [
            { id: 'urnisa_owner', username: 'urnisa', avatar_url: 'https://i.ibb.co/XZnspyRV/b7587fee-97a4-4c4b-a046-b7ae4ec6650c-profile-image-70x70.png', status: 'online' as const },
        ]
    },
    { 
        name: 'Guard Dogs', 
        color: 'text-green-600',
        members: [
            { id: 'booster1', username: 'MegaBooster', avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png', status: 'online' as const },
            { id: 'booster2', username: 'SuperFan', avatar_url: 'https://cdn.discordapp.com/embed/avatars/4.png', status: 'idle' as const },
            { id: 'booster3', username: 'Loyal Supporter', avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png', status: 'online' as const },
        ]
    },
    { 
        name: 'Wagyu A5', 
        color: 'text-yellow-400',
        members: [
            { id: 'vip1', username: 'VeryImportantPerson', avatar_url: 'https://cdn.discordapp.com/embed/avatars/1.png', status: 'idle' as const },
        ]
    },
    { 
        name: 'Meatlings', 
        color: 'text-amber-800',
        members: [
             { id: 'friend1', username: 'Bestie', avatar_url: 'https://cdn.discordapp.com/embed/avatars/2.png', status: 'online' as const },
             { id: 'friend2', username: 'Pal', avatar_url: 'https://cdn.discordapp.com/embed/avatars/3.png', status: 'online' as const },
        ]
    },
];