
import { useState, useEffect } from 'react';

// TypeScript interfaces for the Discord widget API response
interface Game {
  name: string;
}

interface Member {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatar_url: string;
  game?: Game;
  nick?: string;
  global_name?: string;
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: { id: string; name:string; position: number }[];
  members: Member[];
  presence_count: number;
}

interface UseDiscordWidgetReturn {
  data: DiscordWidgetData | null;
  loading: boolean;
  error: Error | null;
}

const WIDGET_CACHE_DURATION_MS = 60000; // 60 seconds

interface WidgetCacheData {
  data: DiscordWidgetData;
  timestamp: number;
}

const getCachedWidget = (serverId: string, ignoreExpiry = false): DiscordWidgetData | null => {
  try {
    const cached = sessionStorage.getItem(`discord_widget_${serverId}`);
    if (cached) {
      const { data, timestamp }: WidgetCacheData = JSON.parse(cached);
      if (ignoreExpiry || Date.now() - timestamp < WIDGET_CACHE_DURATION_MS) {
        return data;
      }
    }
  } catch (e) {
    console.error('Error reading widget cache:', e);
  }
  return null;
};

const setCachedWidget = (serverId: string, data: DiscordWidgetData) => {
  try {
    sessionStorage.setItem(
      `discord_widget_${serverId}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {
    console.error('Error saving widget cache:', e);
  }
};

/**
 * A custom hook to fetch live data from a Discord server's widget API with aggressive caching and fallback support.
 * 
 * @param {string} serverId The ID of the Discord server.
 * @returns {UseDiscordWidgetReturn} An object containing the widget data, loading state, and error state.
 */
export const useDiscordWidget = (serverId: string): UseDiscordWidgetReturn => {
  const [data, setData] = useState<DiscordWidgetData | null>(() => {
    return getCachedWidget(serverId, true);
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return !getCachedWidget(serverId, false);
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!serverId) return;

    const fetchData = async () => {
      const cachedFresh = getCachedWidget(serverId, false);
      if (cachedFresh) {
        setData(cachedFresh);
        setLoading(false);
        return;
      }

      const hasStale = getCachedWidget(serverId, true);
      if (!hasStale) {
        setLoading(true);
      }
      setError(null);
      
      try {
        // Fetch Server Widget Data (Online members & presence count)
        const widgetResponse = await fetch(`https://discord.com/api/guilds/${serverId}/widget.json`);
        if (!widgetResponse.ok) {
          throw new Error(`Failed to fetch Discord widget data. Status: ${widgetResponse.status}`);
        }
        const widgetData: DiscordWidgetData = await widgetResponse.json();
        setData(widgetData);
        setCachedWidget(serverId, widgetData);

      } catch (e) {
        console.error('Error fetching Discord widget data:', e);
        
        // Serve stale cache on error
        const fallbackData = getCachedWidget(serverId, true);
        if (fallbackData) {
          console.log('Serving stale Discord widget data from cache due to fetch error.');
          setData(fallbackData);
        } else {
          if (e instanceof Error) {
              setError(e);
          } else {
              setError(new Error('An unknown error occurred while fetching Discord data.'));
          }
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch only
    fetchData();

  }, [serverId]); 

  return { data, loading, error };
};
