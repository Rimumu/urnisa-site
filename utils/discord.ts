
// This interface represents the structure of a member object,
// whether it comes from the live Discord API or our static constants file.
interface MemberData {
    id: string;
    avatar?: string | null; // From live API
    avatar_url?: string;    // From static list
}

const DEFAULT_AVATAR_URL = 'https://cdn.discordapp.com/embed/avatars/0.png';

/**
 * Intelligently determines the correct avatar URL for a Discord user.
 * It can construct a URL from an ID and avatar hash, use a provided full URL,
 * or fall back to a default avatar.
 * @param member The member object, which can have different properties
 *               depending on its source (live API vs. static list).
 * @returns {string} The final, usable URL for the member's avatar.
 */
export const getDiscordAvatarUrl = (member: MemberData): string => {
    // Priority 1: Use a specific `avatar_url` if provided (for manual overrides).
    if (member.avatar_url) {
        return member.avatar_url;
    }

    // Priority 2: Construct the URL from the user ID and avatar hash.
    if (member.id && member.avatar) {
        const format = member.avatar.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.${format}`;
    }

    // Fallback: Use the default Discord avatar.
    return DEFAULT_AVATAR_URL;
};
