
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

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
            try {
                const response = await fetch(`${API_BASE_URL}/api/messages?channelId=${channelId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch messages: ${response.status}`);
                }
                const data = await response.json();
                // The server now reverses it, so we don't need to reverse here if we want oldest-first.
                // If server sends oldest-first (due to reverse() there), we just set it.
                // Checking server.js: it sends `messages.reverse()`.
                setMessages(data);
            } catch (err) {
                console.error("Error loading chat preview:", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        
    }, [channelId]);

    return { messages, loading, error };
};
