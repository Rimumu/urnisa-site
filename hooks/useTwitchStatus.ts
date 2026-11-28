import { useState, useEffect, useCallback } from 'react';
import { TWITCH_CHANNEL_NAME, API_BASE_URL } from '../constants';

export type StreamStatusOverride = 'auto' | 'live' | 'offline';

export interface TwitchStreamInfoOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
  fetchTitle?: boolean;
}

export interface TwitchStreamInfo {
  isLive: boolean;
  streamTitle: string;
  override: StreamStatusOverride;
  checking: boolean;
  refetch: () => Promise<void>;
}

const sanitizeTwitchTitle = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    trimmed.startsWith('<') ||
    lower.includes('404') ||
    lower.includes('error') ||
    lower.includes('user not found') ||
    lower.includes('channel not found') ||
    lower === 'offline' ||
    lower.endsWith('is offline')
  ) {
    return '';
  }
  return trimmed;
};

const fetchChannelLiveFromDecapi = async (): Promise<boolean | null> => {
  try {
    const response = await fetch(`https://decapi.me/twitch/uptime/${TWITCH_CHANNEL_NAME}`);
    if (!response.ok) return null;
    const text = await response.text();
    const cleanText = text.trim().toLowerCase();
    if (
      !cleanText ||
      cleanText.startsWith('<') ||
      cleanText.includes('offline') ||
      cleanText.includes('404') ||
      cleanText.includes('error') ||
      cleanText.includes('not found')
    ) {
      return false;
    }
    return true;
  } catch {
    return null;
  }
};

export const fetchTwitchStreamTitle = async (): Promise<string> => {
  try {
    const response = await fetch(`https://decapi.me/twitch/title/${TWITCH_CHANNEL_NAME}`);
    if (response.ok) {
      const cleaned = sanitizeTwitchTitle(await response.text());
      if (cleaned) return cleaned;
    }
  } catch {
    // Fall back to secondary lookup
  }

  try {
    const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${encodeURIComponent(TWITCH_CHANNEL_NAME)}`);
    if (response.ok) {
      const data = await response.json();
      const user = Array.isArray(data) ? data[0] : data;
      const broadcastTitle = user?.lastBroadcast?.title;
      if (typeof broadcastTitle === 'string') {
        const cleaned = sanitizeTwitchTitle(broadcastTitle);
        if (cleaned) return cleaned;
      }
    }
  } catch {
    // Silent fallback
  }

  return '';
};

export const useTwitchStreamInfo = (options: TwitchStreamInfoOptions = {}): TwitchStreamInfo => {
  const {
    enabled = true,
    pollIntervalMs = 60000,
    fetchTitle = false,
  } = options;

  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [override, setOverride] = useState<StreamStatusOverride>('auto');
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!enabled) return;
    setChecking(true);

    let resolvedOverride: StreamStatusOverride = 'auto';
    let resolvedLive = false;
    let decidedByOverride = false;

    // 1. Check Backend Override first
    try {
      const overrideRes = await fetch(`${API_BASE_URL}/api/stream-status`);
      if (overrideRes.ok) {
        const data = await overrideRes.json();
        if (data?.override === 'live') {
          resolvedOverride = 'live';
          resolvedLive = true;
          decidedByOverride = true;
        } else if (data?.override === 'offline') {
          resolvedOverride = 'offline';
          resolvedLive = false;
          decidedByOverride = true;
        }
      }
    } catch {
      // Ignore error and fall back to decapi
    }

    // 2. Fallback to decapi.me if no override or 'auto'
    if (!decidedByOverride) {
      const decapiLive = await fetchChannelLiveFromDecapi();
      if (decapiLive !== null) {
        resolvedLive = decapiLive;
      }
    }

    setOverride(resolvedOverride);
    setIsLive(resolvedLive);

    // 3. Fetch stream title whenever live or explicitly requested
    if (fetchTitle || resolvedLive) {
      const title = await fetchTwitchStreamTitle();
      if (title) {
        setStreamTitle(title);
      }
    }

    setChecking(false);
  }, [enabled, fetchTitle]);

  useEffect(() => {
    if (!enabled) return;
    checkStatus();
    const interval = window.setInterval(checkStatus, pollIntervalMs);
    return () => window.clearInterval(interval);
  }, [enabled, pollIntervalMs, checkStatus]);

  return {
    isLive,
    streamTitle,
    override,
    checking,
    refetch: checkStatus,
  };
};

/**
 * A hook that fetches the real-time live status of the Twitch channel.
 * It first checks the backend for a manual override.
 * If set to 'auto', it uses the decapi.me API to check uptime.
 *
 * @returns {boolean} A boolean indicating if the stream is live.
 */
export const useTwitchStatus = (): boolean => {
  const { isLive } = useTwitchStreamInfo({ enabled: true, pollIntervalMs: 60000, fetchTitle: false });
  return isLive;
};
