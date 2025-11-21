
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

export interface DiscordMessage {
    id: string;
    content: string;
    timestamp: string;
    author: {
        id: string;
        username: string;
        avatar: string | null;
        discriminator: string;
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
                // Discord returns newest first, but we usually want to render top-to-bottom 
                // where bottom is newest. So we reverse the array.
                setMessages(data.reverse());
            } catch (err) {
                console.error("Error loading chat preview:", err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
        
        // Optional: Poll for new messages every 30 seconds
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);

    }, [channelId]);

    return { messages, loading, error };
};
