
import React, { useState, useEffect, useRef } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { useDiscordChat, DiscordMessage } from '../hooks/useDiscordChat';
import { DISCORD_INVITE_URL, DISCORD_CHAT_CHANNEL_ID } from '../constants';
import { getDiscordAvatarUrl } from '../utils/discord';

interface DiscordWidgetProps {
  serverId: string;
}

// Hardcoded assets for the widget
const BANNER_URL = "https://res.cloudinary.com/dsencimjn/image/upload/v1764647084/with_Background_z8fi2l.jpg";
const ICON_URL = "https://res.cloudinary.com/dsencimjn/image/upload/v1764647946/20251202_105741_k6rykp.gif";
const CHANNEL_NAME = "₊˚ᰔ┊chill";

// Helper for formatting file sizes
const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Icons
const FileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-brand-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
        <polyline points="13 2 13 9 20 9"></polyline>
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 group-hover/att:text-brand-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-[600px] md:h-[750px] bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden flex flex-col shadow-2xl">
        <div className="h-40 bg-white/5 animate-pulse"></div>
        <div className="h-12 border-b border-white/5 bg-white/5"></div>
        <div className="flex-1 flex flex-col p-4 space-y-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10"></div>
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-white/10 rounded w-1/4"></div>
                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- MARKDOWN PARSER UTILS ---

const splitText = (
    nodes: React.ReactNode[],
    regex: RegExp,
    transform: (match: RegExpMatchArray, index: number) => React.ReactNode
): React.ReactNode[] => {
    const result: React.ReactNode[] = [];
    nodes.forEach(node => {
        if (typeof node !== 'string') {
            result.push(node);
            return;
        }
        
        const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
        
        let lastIndex = 0;
        let match;
        while ((match = globalRegex.exec(node)) !== null) {
            const before = node.slice(lastIndex, match.index);
            if (before) result.push(before);
            result.push(transform(match, match.index));
            lastIndex = globalRegex.lastIndex;
        }
        const remaining = node.slice(lastIndex);
        if (remaining) result.push(remaining);
    });
    return result;
};

const preprocessContent = (text: string): string => {
    if (!text) return "";
    return text.replace(/&amp;/gi, '&').replace(/&amp/gi, '&');
};

const sanitizeUrl = (urlStr: string): string => {
    if (!urlStr) return "";
    return urlStr.replace(/&amp;/gi, '&').replace(/&amp/gi, '&');
};

const parseDiscordContent = (content: string, mentions: any[] = [], isJumbo: boolean = false): React.ReactNode => {
    if (!content) return null;
    const cleanContent = preprocessContent(content);

    const process = (input: string | React.ReactNode[]): React.ReactNode[] => {
        let parts: React.ReactNode[] = Array.isArray(input) ? input : [input];

        // --- PRIORITY 1: PRE-FORMATTED ---

        // 1. Code Blocks
        parts = splitText(parts, /```([\s\S]*?)```/g, (match, i) => (
            <div key={`cb-${i}`} className="my-2 bg-black/40 rounded-md border border-white/10 overflow-hidden">
                <pre className="p-3 font-mono text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                    <code>{match[1]}</code>
                </pre>
            </div>
        ));

        // 2. Inline Code
        parts = splitText(parts, /`([^`]+)`/g, (match, i) => (
            <code key={`ic-${i}`} className="bg-black/40 px-1.5 py-0.5 rounded-md font-mono text-[0.85em] text-brand-accent border border-white/5 break-all">
                {match[1]}
            </code>
        ));

        // --- PRIORITY 2: LEAF NODES (Emotes, Links, Mentions) ---
        // MOVED UP so that underscores in IDs or names don't trigger Italics parsing.

        // 3. Links
        parts = splitText(parts, /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, (match, i) => (
            <a key={`a-${i}`} href={match[1]} target="_blank" rel="noreferrer" className="text-brand-primary hover:text-brand-accent hover:underline break-all transition-colors">
                {match[1]}
            </a>
        ));

        // 4. Emotes
        parts = splitText(parts, /<(a)?:(\w+):(\d+)>/g, (match, i) => {
            const isAnimated = match[1] === 'a';
            const name = match[2];
            const id = match[3];
            const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}`;
            return (
                <img 
                    key={`e-${id}-${i}`} 
                    src={url} 
                    alt={`:${name}:`} 
                    title={`:${name}:`}
                    className={`${isJumbo ? 'w-10 h-10 md:w-12 md:h-12 my-1' : 'w-5 h-5 md:w-6 md:h-6 -translate-y-0.5'} inline-block object-contain align-middle mx-0.5 hover:scale-110 transition-transform duration-200`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            );
        });

        // 5. User Mentions
        parts = splitText(parts, /<@!?(\d+)>/g, (match, i) => {
            const userId = match[1];
            const user = mentions.find(m => m.id === userId);
            const displayName = user ? (user.global_name || user.username) : userId;
            return (
                <span key={`m-${i}`} className="bg-brand-accent/10 text-brand-accent border border-brand-accent/20 px-1.5 py-0.5 rounded-[4px] cursor-pointer font-medium hover:bg-brand-accent hover:text-brand-secondary transition-all select-none inline-block leading-none mx-0.5">
                    @{displayName}
                </span>
            );
        });
        
        // 6. Role & Channel Mentions
        parts = splitText(parts, /<@&(\d+)>/g, (match, i) => (
            <span key={`r-${i}`} className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-[4px] cursor-pointer font-medium hover:bg-brand-primary hover:text-white transition-colors select-none text-xs uppercase tracking-wide">
                @Role
            </span>
        ));
        parts = splitText(parts, /<#(\d+)>/g, (match, i) => (
            <span key={`c-${i}`} className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded-[4px] cursor-pointer font-medium hover:bg-white/20 hover:text-white transition-colors select-none">
                #channel
            </span>
        ));

        // --- PRIORITY 3: CONTAINERS & STYLING ---

        // 7. Blockquotes
        parts = splitText(parts, /^(?:>>>\s|>\s)([\s\S]*)/gm, (match, i) => (
            <div key={`bq-${i}`} className="flex gap-3 my-2 pl-1 relative group">
                 <div className="w-1 bg-brand-primary rounded-full shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                 <div className="opacity-90 flex-1 italic text-gray-300">{process(match[1])}</div>
            </div>
        ));

        // 8. Spoilers (Interactive)
        parts = splitText(parts, /\|\|(.*?)\|\|/g, (match, i) => {
            const SpoilerContent = () => {
                const [revealed, setRevealed] = useState(false);
                return (
                    <span 
                        onClick={(e) => { e.stopPropagation(); setRevealed(true); }}
                        className={`
                            rounded-[3px] px-1 cursor-pointer transition-all duration-200
                            ${revealed ? 'bg-white/10' : 'bg-[#1e1f22] hover:bg-[#2b2d31] select-none text-transparent'}
                        `}
                    >
                        <span className={revealed ? '' : 'opacity-0'}>{process(match[1])}</span>
                    </span>
                );
            };
            return <SpoilerContent key={`spoiler-${i}`} />;
        });

        // 9. Styling
        // Processing these last ensures that underscores in emotes/links don't break things.
        parts = splitText(parts, /\*\*(.*?)\*\*/g, (match, i) => (
            <strong key={`b-${i}`} className="font-bold text-white">{process(match[1])}</strong>
        ));
        parts = splitText(parts, /(\*|_)(.*?)\1/g, (match, i) => (
            <em key={`i-${i}`} className="italic text-gray-300">{process(match[2])}</em>
        ));
        parts = splitText(parts, /__(.*?)__/g, (match, i) => (
            <u key={`u-${i}`} className="underline decoration-brand-primary underline-offset-2">{process(match[1])}</u>
        ));
        parts = splitText(parts, /~~(.*?)~~/g, (match, i) => (
            <s key={`s-${i}`} className="line-through text-gray-500">{process(match[1])}</s>
        ));
        
        return parts;
    };

    return process(cleanContent);
};

interface MediaEmbed {
    id: string;
    type: 'image' | 'tenor-embed';
    url: string;
    originalUrl: string;
}

const extractMediaUrls = (content: string, nativeEmbeds?: any[]): MediaEmbed[] => {
    const embeds: MediaEmbed[] = [];
    const preprocessed = preprocessContent(content);
    
    // 1. Process Native Discord Embeds first (preferred as they contain direct image/gif/mp4 urls solved by Discord itself)
    if (nativeEmbeds && Array.isArray(nativeEmbeds)) {
        nativeEmbeds.forEach((native, index) => {
            if (native.type === 'gifv' || native.type === 'image') {
                const mediaUrl = native.image?.url || native.thumbnail?.url || native.video?.url;
                if (mediaUrl) {
                    embeds.push({
                        id: `native-embed-${index}`,
                        type: 'image',
                        url: sanitizeUrl(mediaUrl),
                        originalUrl: native.url || mediaUrl
                    });
                }
            } else if (native.image && native.image.url) {
                embeds.push({
                    id: `native-embed-img-${index}`,
                    type: 'image',
                    url: sanitizeUrl(native.image.url),
                    originalUrl: native.url || native.image.url
                });
            }
        });
    }
    
    if (preprocessed) {
        // Regex for matching http/https URLs
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
        const matches = preprocessed.match(urlRegex);
        if (matches) {
            const uniqueUrls = Array.from(new Set(matches));
            uniqueUrls.forEach((urlStr, index) => {
                try {
                    const cleanUrlStr = sanitizeUrl(urlStr);
                    const url = new URL(cleanUrlStr);
                    const pathname = url.pathname.toLowerCase();
                    const hostname = url.hostname.toLowerCase();
                    
                    // Skip if we already extracted this URL via native embeds
                    if (embeds.some(e => e.originalUrl === cleanUrlStr || e.originalUrl === urlStr)) {
                        return;
                    }
                    
                    // Tenor View Page fallback (if not processed by native embeds)
                    if (hostname.includes('tenor.com') && pathname.startsWith('/view/')) {
                        const parts = pathname.split('-');
                        const id = parts[parts.length - 1];
                        if (id && /^\d+$/.test(id)) {
                            embeds.push({
                                id: `embed-tenor-${index}`,
                                type: 'tenor-embed',
                                url: `https://tenor.com/embed/${id}`,
                                originalUrl: cleanUrlStr
                            });
                            return;
                        }
                    }
                    
                    // Giphy View Page
                    if (hostname.includes('giphy.com') && pathname.startsWith('/gifs/')) {
                        const parts = pathname.split('/');
                        const slugAndId = parts[parts.length - 1] || parts[parts.length - 2];
                        if (slugAndId) {
                            const idParts = slugAndId.split('-');
                            const id = idParts[idParts.length - 1];
                            if (id) {
                                embeds.push({
                                    id: `embed-giphy-${index}`,
                                    type: 'image',
                                    url: `https://media.giphy.com/media/${id}/giphy.gif`,
                                    originalUrl: cleanUrlStr
                                });
                                return;
                            }
                        }
                    }
                    
                    // Direct Extensions
                    if (pathname.endsWith('.png') || 
                        pathname.endsWith('.jpg') || 
                        pathname.endsWith('.jpeg') || 
                        pathname.endsWith('.gif') || 
                        pathname.endsWith('.webp') || 
                        pathname.endsWith('.svg') ||
                        pathname.endsWith('.apng')) {
                        embeds.push({
                            id: `embed-direct-${index}`,
                            type: 'image',
                            url: cleanUrlStr,
                            originalUrl: cleanUrlStr
                        });
                    }
                } catch (e) {
                    // invalid URL, ignore
                }
            });
        }
    }
    
    return embeds;
};

const EmbedImage: React.FC<{ url: string, alt: string, className?: string, originalUrl?: string }> = ({ url, alt, className = "", originalUrl }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="flex flex-col items-center justify-center p-4 bg-black/30 border border-white/10 rounded-lg max-w-sm text-center">
                <span className="text-xl mb-1">⚠️</span>
                <span className="text-xs text-gray-400 font-bold">Media Unavailable</span>
                <span className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate block" title={alt}>{alt}</span>
                {originalUrl && (
                    <a 
                        href={originalUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="mt-2 px-2.5 py-1 bg-brand-primary/20 hover:bg-brand-primary border border-brand-primary/30 text-white rounded text-[10px] font-bold transition-all"
                    >
                        Open Original Link
                    </a>
                )}
            </div>
        );
    }

    // Determine if media is likely transparent (sticker, emoji, or explicitly contains transparent keywords)
    const lowerUrl = url.toLowerCase();
    const lowerAlt = alt.toLowerCase();
    const isLikelyTransparent = 
        lowerUrl.includes('sticker') || 
        lowerUrl.includes('emoji') || 
        lowerUrl.includes('ych') ||
        lowerUrl.includes('badge') ||
        lowerAlt.includes('sticker') || 
        lowerAlt.includes('emoji') || 
        lowerAlt.includes('ych');

    // Remove stardust-pattern background if the image is NOT transparent/sticker-like (allowing it to be fully opaque)
    let finalClassName = className;
    if (!isLikelyTransparent) {
        finalClassName = className.replace('stardust-pattern', '').trim();
    }

    return (
        <img 
            src={url} 
            alt={alt}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className={finalClassName} 
        />
    );
};

const StickerImage: React.FC<{ stickerId: string, extension: string, name: string }> = ({ stickerId, extension, name }) => {
    const [hasError, setHasError] = useState(false);
    if (hasError) {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-lg text-xs text-gray-400">
                <span>🎨</span>
                <span className="font-bold">{name} (Sticker)</span>
            </div>
        );
    }
    return (
        <img 
            src={`https://cdn.discordapp.com/stickers/${stickerId}.${extension}`} 
            alt={name}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className="w-28 h-28 md:w-32 md:h-32 object-contain hover:scale-105 transition-transform drop-shadow-md"
            title={name}
            loading="lazy"
        />
    );
};

const ReactionEmoji: React.FC<{ url: string, name: string }> = ({ url, name }) => {
    const [hasError, setHasError] = useState(false);
    if (hasError || !url) {
        return <span className="text-sm leading-none text-gray-200">{name}</span>;
    }
    return (
        <img 
            src={url} 
            alt={name} 
            className="w-4 h-4 object-contain" 
            referrerPolicy="no-referrer" 
            onError={() => setHasError(true)}
        />
    );
};

const ChatMessage: React.FC<{ message: DiscordMessage, serverId: string }> = ({ message, serverId }) => {
    const date = new Date(message.timestamp);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    
    const dateString = isToday
        ? `Today at ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : date.toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit' });

    const emoteRegex = /<(a)?:(\w+):(\d+)>|\p{Extended_Pictographic}/gu;
    const strippedContent = message.content.replace(emoteRegex, '').trim();
    const isJumbo = strippedContent.length === 0 && message.content.length > 0 && message.content.length < 150;

    // Prioritize Server Nickname > Global Display Name > Username
    const displayName = message.member?.nick || message.author.global_name || message.author.username;

    // Use server avatar if available, otherwise global/default
    let avatarUrl = getDiscordAvatarUrl(message.author);
    if (message.member?.avatar) {
        avatarUrl = `https://cdn.discordapp.com/guilds/${serverId}/users/${message.author.id}/avatars/${message.member.avatar}.png`;
    }

    return (
        <div className={`flex flex-col group transition-colors border-l-2 border-transparent hover:border-brand-primary/50 relative px-4 py-1 hover:bg-white/5 ${message.referenced_message ? 'mt-3' : 'mt-0.5'}`}>
            
            {/* Reply Reference */}
            {message.referenced_message && (
                <div className="flex items-center gap-2 mb-1 ml-[52px] relative opacity-70 hover:opacity-100 transition-opacity group/reply select-none">
                    {/* The Spine */}
                    <div className="absolute bottom-2 right-full w-9 h-3 border-l-[2px] border-t-[2px] border-gray-600 rounded-tl-[6px] mr-2"></div>
                    
                    <img 
                        src={getDiscordAvatarUrl(message.referenced_message.author)}
                        alt="Ref Avatar"
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded-full bg-brand-secondary shrink-0"
                    />
                    <span className="font-bold text-gray-300 text-xs hover:underline cursor-pointer truncate max-w-[120px]">
                        {message.referenced_message.author.global_name || message.referenced_message.author.username}
                    </span>
                    
                    {/* Render the reply content with formatting (mentions/emotes) but line-clamped */}
                    <div className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-sm cursor-pointer transition-colors group-hover/reply:text-gray-300 flex items-center gap-1 overflow-hidden h-[1.2em]">
                         {message.referenced_message.content 
                            ? parseDiscordContent(message.referenced_message.content, message.referenced_message.mentions || [])
                            : <span className="italic">Click to see attachment</span>
                         }
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <div className="flex-shrink-0 pt-0.5">
                    <img 
                        src={avatarUrl} 
                        alt={displayName}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full bg-brand-secondary object-cover cursor-pointer ring-2 ring-transparent group-hover:ring-brand-primary/30 transition-all shadow-lg"
                    />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-white hover:text-brand-primary hover:underline cursor-pointer transition-colors text-sm md:text-base">
                            {displayName}
                        </span>
                        <span className="text-[0.7rem] text-gray-500 group-hover:text-gray-400 transition-colors font-medium">
                            {dateString}
                        </span>
                    </div>
                    
                    <div className={`text-gray-300 text-[0.9375rem] whitespace-pre-wrap break-words leading-relaxed ${isJumbo ? 'text-4xl leading-normal mt-1' : 'mt-0.5'}`}>
                        {parseDiscordContent(message.content, message.mentions, isJumbo)}
                    </div>

                    {/* Media Link Embeds */}
                    {(() => {
                        const embeds = extractMediaUrls(message.content, (message as any).embeds);
                        if (embeds.length === 0) return null;
                        return (
                            <div className="mt-2 flex flex-col gap-2 max-w-full">
                                {embeds.map((embed) => (
                                    <div key={embed.id} className="max-w-full">
                                        {embed.type === 'image' ? (
                                            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30 group/embed max-w-full">
                                                <div className="relative">
                                                    <a href={embed.originalUrl} target="_blank" rel="noreferrer" className="block cursor-zoom-in">
                                                        <EmbedImage 
                                                            url={embed.url} 
                                                            alt="Chat Embed Media"
                                                            originalUrl={embed.originalUrl}
                                                            className="max-w-full max-h-[350px] object-contain min-w-[50px] min-h-[50px] stardust-pattern" 
                                                        />
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30 max-w-sm w-full aspect-[4/3]">
                                                <iframe 
                                                    src={embed.url} 
                                                    className="w-full h-full border-0 stardust-pattern"
                                                    title="Tenor GIF"
                                                    sandbox="allow-scripts allow-same-origin"
                                                    scrolling="no"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3">
                            {message.attachments.map((att) => {
                                const isImage = att.content_type?.startsWith('image/');
                                const cleanAttUrl = sanitizeUrl(att.url);
                                return (
                                    <div key={att.id} className="overflow-hidden rounded-lg border border-white/10 bg-black/30 group/att max-w-full">
                                        {isImage ? (
                                             <div className="relative">
                                                <a href={cleanAttUrl} target="_blank" rel="noreferrer" className="block cursor-zoom-in">
                                                    <EmbedImage 
                                                        url={cleanAttUrl} 
                                                        alt={att.filename}
                                                        originalUrl={cleanAttUrl}
                                                        className="max-w-full max-h-[350px] object-contain min-w-[50px] min-h-[50px] stardust-pattern" 
                                                    />
                                                </a>
                                             </div>
                                        ) : (
                                             <a href={cleanAttUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 pr-4 max-w-sm hover:bg-white/5 transition-colors">
                                                <div className="w-10 h-10 rounded bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <FileIcon />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-brand-primary font-bold text-sm truncate group-hover/att:underline" title={att.filename}>{att.filename}</div>
                                                    <div className="text-xs text-gray-500 font-mono mt-0.5">{formatFileSize(att.size)}</div>
                                                </div>
                                                <div className="ml-3">
                                                    <DownloadIcon />
                                                </div>
                                             </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Stickers */}
                    {message.sticker_items && message.sticker_items.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {message.sticker_items.map((sticker) => {
                                const extension = sticker.format_type === 4 ? 'gif' : 'png';
                                return (
                                    <StickerImage 
                                        key={sticker.id} 
                                        stickerId={sticker.id} 
                                        extension={extension} 
                                        name={sticker.name} 
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {message.reactions.map((reaction, idx) => {
                                const emojiUrl = reaction.emoji.id 
                                    ? `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.${reaction.emoji.animated ? 'gif' : 'png'}` 
                                    : null;
                                
                                return (
                                    <div 
                                        key={idx} 
                                        className="bg-black/40 hover:bg-brand-primary/20 border border-white/5 hover:border-brand-primary/50 rounded-[8px] px-1.5 py-0.5 flex items-center gap-1.5 cursor-pointer select-none transition-all duration-200 min-h-[1.5rem] group/reaction shadow-sm"
                                        title={`${reaction.emoji.name} - ${reaction.count}`}
                                    >
                                        <ReactionEmoji url={emojiUrl || ''} name={reaction.emoji.name || ''} />
                                        <span className="text-xs font-bold text-gray-400 group-hover/reaction:text-brand-accent transition-colors">{reaction.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ serverId }) => {
  const { data, loading, error } = useDiscordWidget(serverId);
  const { messages, loading: chatLoading, error: chatError } = useDiscordChat(DISCORD_CHAT_CHANNEL_ID);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [showJoinOverlay, setShowJoinOverlay] = useState(false);

  useEffect(() => {
    if (messages.length > 0 && shouldAutoScrollRef.current && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) return <SkeletonLoader />;
  if (error || !data) {
      return (
          <div className="w-full h-[400px] bg-black/30 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-xl p-8 text-center text-left">
              <div className="text-5xl mb-4 grayscale opacity-50">👾</div>
              <h3 className="text-xl font-bold text-brand-primary mb-2">System Offline</h3>
              <p className="text-gray-400 max-w-md">Unable to establish connection to the server. The hamsters might be taking a break.</p>
          </div>
      );
  }

  const contentState = showJoinOverlay 
    ? "blur-md brightness-[0.3] pointer-events-none scale-[1.01]" 
    : "scale-100";
  const transitionClass = "transition-all duration-500 ease-out transform";

  return (
    <div className="flex flex-col h-[600px] md:h-[800px] w-full bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl font-sans text-gray-200 text-left relative isolate">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background-color: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #581c25; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #e5383b; }
        .stardust-pattern {
          background-image: url('https://www.transparenttextures.com/patterns/stardust.png');
          background-repeat: repeat;
          background-color: rgba(0, 0, 0, 0.4);
        }
      `}</style>

      {showJoinOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/10" onClick={() => setShowJoinOverlay(false)}></div>
            <div className="relative bg-[#1e1f22] w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-white/10 transform scale-100 transition-all animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowJoinOverlay(false)}
                    className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="h-32 bg-brand-secondary relative">
                    <img src={BANNER_URL} alt="Server Banner" className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f22] to-transparent"></div>
                </div>

                <div className="px-6 pb-8 text-center -mt-12 relative z-10">
                    <div className="mx-auto w-24 h-24 rounded-[20px] p-1 bg-[#1e1f22] mb-4 shadow-lg">
                         <img src={ICON_URL} alt="Server Icon" className="w-full h-full rounded-[16px] object-cover" />
                    </div>
                    
                    <h2 className="text-2xl font-extrabold text-white mb-1">{data.name}</h2>
                    <p className="text-gray-400 text-sm mb-6">Join the server to chat!</p>

                    <a 
                        href={DISCORD_INVITE_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all hover:scale-105 shadow-lg"
                    >
                        Join Server
                    </a>
                </div>
            </div>
        </div>
      )}

      {/* Header Section */}
      <div className={`shrink-0 relative h-32 sm:h-40 bg-brand-secondary overflow-hidden group select-none ${transitionClass} ${contentState}`}>
            <img src={BANNER_URL} alt="Server Banner" className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-3 sm:p-5 flex items-end gap-3 sm:gap-4 w-full z-10">
                 <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl p-[2px] sm:p-[3px] bg-gradient-to-tr from-brand-primary to-brand-accent shadow-xl -mb-2 sm:-mb-4 transform group-hover:-translate-y-1 transition-transform duration-300">
                     <div className="w-full h-full rounded-[10px] sm:rounded-[13px] overflow-hidden bg-brand-secondary">
                        <img src={ICON_URL} alt="Icon" className="w-full h-full object-cover" />
                     </div>
                 </div>
                 <div className="mb-0.5 sm:mb-1 flex-1 min-w-0 pb-1">
                     <h2 className="text-white font-extrabold text-xl sm:text-2xl leading-tight truncate drop-shadow-lg tracking-wide">{data.name}</h2>
                     <p className="text-[10px] sm:text-xs text-gray-300 font-medium flex items-center gap-1.5 mt-1 backdrop-blur-sm bg-black/30 w-fit px-2 py-0.5 rounded-full border border-white/5">
                        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#23a559] animate-pulse shadow-[0_0_8px_#23a559]"></span>
                        <span className="text-white">{data.presence_count.toLocaleString()}</span> Members
                     </p>
                 </div>
                 <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" 
                    className="shrink-0 bg-brand-primary hover:bg-red-600 text-white text-sm font-bold py-2 sm:py-2.5 px-3 sm:px-5 rounded-lg transition-all hover:scale-105 mb-1 sm:mb-2 shadow-lg hover:shadow-brand-primary/40 border border-white/10 hidden sm:block">
                    Join
                 </a>
                 <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" 
                    className="shrink-0 bg-brand-primary hover:bg-red-600 text-white font-bold p-2 rounded-lg transition-all hover:scale-105 mb-1 shadow-lg hover:shadow-brand-primary/40 border border-white/10 sm:hidden flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                 </a>
            </div>
      </div>

      {/* Channel Bar */}
      <div className={`shrink-0 h-14 border-b border-white/5 flex items-center px-5 bg-black/20 shadow-sm z-20 backdrop-blur-sm ${transitionClass} ${contentState}`}>
            <span className="text-2xl mr-3 text-brand-accent">#</span>
            <span className="font-bold text-white text-lg tracking-wide mr-3 drop-shadow-sm">{CHANNEL_NAME}</span>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 relative min-h-0 ${transitionClass} ${contentState}`}>
        <div 
            className="w-full h-full overflow-y-auto custom-scrollbar bg-transparent scroll-smooth" 
            ref={chatContainerRef} 
        >
            <div className="min-h-full flex flex-col justify-end py-4">
                {chatLoading ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 space-y-4">
                        <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium animate-pulse">Loading chat history...</p>
                    </div>
                ) : chatError ? (
                    <div className="p-6 text-center text-brand-primary bg-brand-primary/5 mx-8 rounded-lg border border-brand-primary/20">
                        <p className="font-bold">⚠ Connection Interrupted</p>
                        <p className="text-sm opacity-80">Could not load messages at this time.</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center opacity-70">
                        <span className="text-4xl mb-3">🍃</span>
                        <span className="font-medium">It's quiet... too quiet.</span>
                    </div>
                ) : (
                    messages.map((msg) => <ChatMessage key={msg.id} message={msg} serverId={serverId} />)
                )}
            </div>
        </div>
      </div>

      {/* Input Area */}
      <div className={`shrink-0 p-4 bg-black/20 z-20 border-t border-white/5 ${transitionClass} ${contentState}`}>
         <div 
            onClick={() => setShowJoinOverlay(true)}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer select-none transition-colors group hover:border-white/10 hover:bg-black/50"
         >
            <div className="w-7 h-7 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-lg pb-0.5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                +
            </div>
            <div className="text-gray-500 text-sm font-medium truncate group-hover:text-gray-400 transition-colors">
                Message #{CHANNEL_NAME}
            </div>
            {/* Send Arrow Icon */}
            <div className="ml-auto opacity-50 shrink-0 group-hover:opacity-100 transition-opacity">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-brand-primary transition-colors">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                 </svg>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DiscordWidget;
