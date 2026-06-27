
import { useState, useEffect } from 'react';
import { DISCORD_API_URL } from '../constants';

export interface DiscordMessage {
    id: string;
    content: string;
    timestamp: string;
    author: {
        id: string;
        username: string;
        global_name?: string;
        avatar: string | null;
        discriminator: string;
    };
    member?: {
        nick?: string;
        avatar?: string;
    };
    attachments: any[];
    sticker_items?: {
        id: string;
        name: string;
        format_type: number; // 1 = PNG, 2 = APNG, 3 = LOTTIE, 4 = GIF
    }[];
    mentions?: {
        id: string;
        username: string;
        discriminator: string;
        global_name?: string;
    }[];
    reactions?: {
        emoji: {
            id: string | null;
            name: string | null;
            animated?: boolean;
        };
        count: number;
        me: boolean;
    }[];
    referenced_message?: {
        id: string;
        author: {
            id: string;
            username: string;
            global_name?: string;
            avatar: string | null;
            discriminator: string;
        };
        content: string;
        mentions?: {
            id: string;
            username: string;
            discriminator: string;
            global_name?: string;
        }[];
    } | null;
}

const CACHE_DURATION_MS = 45000; // 45 seconds cache to drastically reduce requests

interface CacheData {
    data: DiscordMessage[];
    timestamp: number;
}

const getCachedMessages = (channelId: string, ignoreExpiry = false): DiscordMessage[] | null => {
    try {
        const cached = sessionStorage.getItem(`discord_chat_${channelId}`);
        if (cached) {
            const { data, timestamp }: CacheData = JSON.parse(cached);
            if (ignoreExpiry || Date.now() - timestamp < CACHE_DURATION_MS) {
                return data;
            }
        }
    } catch (e) {
        console.error('Error reading chat cache:', e);
    }
    return null;
};

const setCachedMessages = (channelId: string, data: DiscordMessage[]) => {
    try {
        sessionStorage.setItem(
            `discord_chat_${channelId}`,
            JSON.stringify({ data, timestamp: Date.now() })
        );
    } catch (e) {
        console.error('Error saving chat cache:', e);
    }
};

export const useDiscordChat = (channelId: string) => {
    const [messages, setMessages] = useState<DiscordMessage[]>(() => {
        // Initialize state from cache if available (even if expired, as initial placeholder)
        return getCachedMessages(channelId, true) || [];
    });
    const [loading, setLoading] = useState<boolean>(() => {
        // If we have fresh cached messages, don't show initial loading screen
        return !getCachedMessages(channelId, false);
    });
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!channelId) return;

        const fetchMessages = async () => {
            const cachedFresh = getCachedMessages(channelId, false);
            if (cachedFresh) {
                setMessages(cachedFresh);
                setLoading(false);
                return;
            }

            // If we have stale cache, don't flash loading spinner
            const hasStale = getCachedMessages(channelId, true);
            if (!hasStale) {
                setLoading(true);
            }
            setError(null);
            
            const targetUrl = `${DISCORD_API_URL}/api/messages?channelId=${channelId}`;
            try {
                console.log(`Fetching chat from: ${targetUrl}`);
                
                const response = await fetch(targetUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                    setCachedMessages(channelId, data);
                } else {
                    throw new Error('Response data is not an array of messages');
                }
            } catch (err) {
                console.error(`Error loading chat preview from ${targetUrl}:`, err);
                
                // Graceful fallback to whatever we have in cache (even if stale) on network failure or rate limit
                const fallbackData = getCachedMessages(channelId, true);
                if (fallbackData && fallbackData.length > 0) {
                    console.log('Serving stale Discord chat from cache due to fetch failure (e.g. rate limit/429).');
                    setMessages(fallbackData);
                } else {
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        
    }, [channelId]);

    return { messages, loading, error };
};
