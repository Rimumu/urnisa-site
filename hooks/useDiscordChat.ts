
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

export const useDiscordChat = (channelId: string) => {
    const [messages, setMessages] = useState<DiscordMessage[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!channelId) return;

        const fetchMessages = async () => {
            setLoading(true);
            setError(null);
            // Use the specific Discord Service URL
            const targetUrl = `${DISCORD_API_URL}/api/messages?channelId=${channelId}`;
            try {
                // Debug log to see exactly where we are trying to connect
                console.log(`Fetching chat from: ${targetUrl}`);
                
                const response = await fetch(targetUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    throw new Error('Response data is not an array of messages');
                }
            } catch (err) {
                console.error(`Error loading chat preview from ${targetUrl}:`, err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        
    }, [channelId]);

    return { messages, loading, error };
};
