import React, { useEffect, useRef } from 'react';

// Make Twitch available on the window object
declare global {
  interface Window {
    Twitch: any;
  }
}

interface TwitchEmbedProps {
  channel: string;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = React.memo(({ channel }) => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This helper function robustly determines all potential parent domains for the Twitch embed.
    // This is necessary for complex sandboxed environments (like web IDEs) where the app
    // might be framed multiple times.
    const getParentDomains = (): string[] => {
      const domains = new Set<string>();

      // The most common case is the current window's hostname.
      if (window.location.hostname) {
        domains.add(window.location.hostname);
      }

      // In sandboxed iframes, the referrer can point to the parent frame's domain.
      try {
        if (document.referrer) {
          const referrerHostname = new URL(document.referrer).hostname;
          if (referrerHostname) {
            domains.add(referrerHostname);
          }
        }
      } catch (e) {
        // This can fail if the referrer is not a valid URL, so we suppress the error.
        console.warn("Could not parse document.referrer for Twitch embed:", e);
      }

      // Add localhost as a fallback for local development environments.
      domains.add('localhost');
      
      const domainArray = Array.from(domains);
      return domainArray;
    };


    if (embedRef.current && window.Twitch) {
      // Clear any existing embed to prevent duplicates on re-render
      embedRef.current.innerHTML = "";
      
      const embed = new window.Twitch.Embed(embedRef.current.id, {
        width: '100%',
        height: '100%',
        channel: channel,
        // Provide all potential parent domains. Twitch will use them to set the
        // Content-Security-Policy header correctly.
        parent: getParentDomains(),
        autoplay: false,
      });

      embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
        console.log('Twitch embed is ready');
      });
    }
  }, [channel]);

  return (
    <div 
        id="twitch-embed" 
        ref={embedRef} 
        className="w-full aspect-video min-h-[220px] md:min-h-[400px] rounded-lg overflow-hidden"
    />
  );
});

export default TwitchEmbed;
