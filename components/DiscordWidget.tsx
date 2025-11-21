
import React, { useState, useEffect, useRef } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { useDiscordChat, DiscordMessage } from '../hooks/useDiscordChat';
import { DISCORD_INVITE_URL, DISCORD_CHAT_CHANNEL_ID } from '../constants';
import { useImageLoaded } from '../hooks/useImageLoaded';
import { getDiscordAvatarUrl } from '../utils/discord';

interface DiscordWidgetProps {
  serverId: string;
}

// URLs for high-resolution images
const BANNER_URL = "https://i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png";
const ICON_URL = "https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png";

// URLs for tiny, blurred placeholder images
const BANNER_PLACEHOLDER_URL = "https://images.weserv.nl/?url=i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png&w=48&h=16&blur=3&fit=cover";

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-[600px] bg-brand-secondary rounded-2xl border border-white/10 overflow-hidden flex flex-col animate-pulse">
        <div className="h-32 bg-white/5"></div>
        <div className="flex-1 flex flex-col p-4 space-y-4">
            <div className="h-4 bg-white/5 rounded w-3/4"></div>
            <div className="h-4 bg-white/5 rounded w-1/2"></div>
            <div className="h-4 bg-white/5 rounded w-5/6"></div>
            <div className="flex-grow"></div>
            <div className="h-12 bg-white/5 rounded w-full"></div>
        </div>
    </div>
);

// Helper to parse Discord markdown, emotes, and mentions
const parseDiscordContent = (content: string, mentions: any[] = [], isJumbo: boolean = false) => {
    if (!content) return null;

    // Helper function to recursively split text based on patterns
    const splitText = (text: string | React.ReactNode[], regex: RegExp, transform: (match: RegExpMatchArray, index: number) => React.ReactNode): React.ReactNode[] => {
        const result: React.ReactNode[] = [];
        
        // Force text to be array if it isn't
        const nodes = Array.isArray(text) ? text : [text];

        nodes.forEach((node) => {
            if (typeof node !== 'string') {
                result.push(node);
                return;
            }

            const parts = node.split(regex);
            let match;
            // Reset regex index
            regex.lastIndex = 0;
            
            // If no match, keep string as is
            if (parts.length === 1) {
                result.push(node);
                return;
            }

            // Iterate parts and reconstruct with transformed elements
            // Note: .split(regex) with capturing groups includes the captures in the result array
            // But for complex regex with multiple groups, it's safer to match manually or handle the split array carefully
            // For simplicity here, we use a basic split/match approach suitable for specific patterns.
            
            // React-friendly split:
            let lastIndex = 0;
            while ((match = regex.exec(node)) !== null) {
                const before = node.slice(lastIndex, match.index);
                if (before) result.push(before);
                
                result.push(transform(match, lastIndex));
                
                lastIndex = regex.lastIndex;
            }
            const remaining = node.slice(lastIndex);
            if (remaining) result.push(remaining);
        });

        return result;
    };

    let parts: React.ReactNode[] = [content];

    // 1. Code Blocks (```text```)
    parts = splitText(parts, /```([\s\S]*?)```/g, (match, i) => (
        <pre key={`codeblock-${i}`} className="bg-[#2b2d31] p-2 rounded border border-white/10 overflow-x-auto font-mono text-xs my-1">
            <code>{match[1]}</code>
        </pre>
    ));

    // 2. Inline Code (`text`)
    parts = splitText(parts, /`([^`]+)`/g, (match, i) => (
        <code key={`inline-${i}`} className="bg-[#2b2d31] px-1 rounded font-mono text-sm mx-0.5">
            {match[1]}
        </code>
    ));

    // 3. Custom Emotes (<:name:id> or <a:name:id>)
    parts = splitText(parts, /<(a)?:(\w+):(\d+)>/g, (match, i) => {
        const isAnimated = match[1] === 'a';
        const name = match[2];
        const id = match[3];
        const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}`;
        return (
            <img 
                key={`emote-${id}-${i}`} 
                src={url} 
                alt={`:${name}:`} 
                title={`:${name}:`}
                className={`${isJumbo ? 'w-12 h-12' : 'w-6 h-6 -my-1'} inline-block object-contain vertical-align-middle`}
            />
        );
    });

    // 4. Mentions (<@id> or <@!id>)
    parts = splitText(parts, /<@!?(\d+)>/g, (match, i) => {
        const userId = match[1];
        const user = mentions.find(m => m.id === userId);
        const displayName = user ? (user.global_name || user.username) : 'Unknown User';
        return (
            <span key={`mention-${userId}-${i}`} className="bg-[#3c4270] text-[#dee0fc] hover:bg-[#5865f2] px-1 rounded cursor-pointer transition-colors font-medium">
                @{displayName}
            </span>
        );
    });

    // 5. Spoilers (||text||)
    parts = splitText(parts, /\|\|(.*?)\|\|/g, (match, i) => (
        <span key={`spoiler-${i}`} className="bg-[#202225] text-transparent hover:text-gray-100 hover:bg-[#40444b] rounded px-1 cursor-pointer transition-all select-none">
            {match[1]}
        </span>
    ));

    // 6. Bold (**text**)
    parts = splitText(parts, /\*\*(.*?)\*\*/g, (match, i) => (
        <strong key={`bold-${i}`} className="font-bold text-white">{match[1]}</strong>
    ));

    // 7. Italic (*text* or _text_)
    parts = splitText(parts, /(\*|_)(.*?)\1/g, (match, i) => (
        <em key={`italic-${i}`} className="italic">{match[2]}</em>
    ));

    // 8. Underline (__text__)
    parts = splitText(parts, /__(.*?)__/g, (match, i) => (
        <u key={`underline-${i}`} className="underline decoration-gray-400">{match[1]}</u>
    ));

    // 9. Strikethrough (~~text~~)
    parts = splitText(parts, /~~(.*?)~~/g, (match, i) => (
        <s key={`strike-${i}`} className="line-through text-gray-500">{match[1]}</s>
    ));

    // 10. Links (http...)
    parts = splitText(parts, /(https?:\/\/[^\s]+)/g, (match, i) => (
        <a key={`link-${i}`} href={match[1]} target="_blank" rel="noreferrer" className="text-[#00b0f4] hover:underline break-all">
            {match[1]}
        </a>
    ));

    return parts;
};

const ChatMessage: React.FC<{ message: DiscordMessage }> = ({ message }) => {
    const date = new Date(message.timestamp);
    const dateString = date.toLocaleDateString() === new Date().toLocaleDateString()
        ? `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : date.toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    // Detect if message is only emojis (Jumbo mode)
    // Checks if content only contains standard emojis or custom discord emotes, and whitespace
    // Simple check: remove all emote patterns and whitespace, if empty -> jumbo
    const emoteRegex = /<(a)?:(\w+):(\d+)>|\p{Extended_Pictographic}/gu;
    const strippedContent = message.content.replace(emoteRegex, '').trim();
    const isJumbo = strippedContent.length === 0 && message.content.length > 0 && message.content.length < 200;

    return (
        <div className="flex gap-3 p-1 py-1.5 hover:bg-black/20 rounded-sm transition-colors group text-left leading-[1.375rem]">
             <div className="flex-shrink-0 pt-0.5">
                <img 
                    src={getDiscordAvatarUrl(message.author)} 
                    alt={message.author.username}
                    className="w-10 h-10 rounded-full bg-brand-surface object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-white text-sm hover:underline cursor-pointer">{message.author.username}</span>
                    <span className="text-[10px] text-gray-500">{dateString}</span>
                </div>
                <div className={`text-gray-300 text-[15px] whitespace-pre-wrap break-words ${isJumbo ? 'leading-relaxed' : ''}`}>
                    {parseDiscordContent(message.content, message.mentions, isJumbo)}
                </div>
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                        {message.attachments.map((att) => (
                            <div key={att.id} className="inline-block max-w-full rounded overflow-hidden border border-white/5">
                                {att.content_type?.startsWith('image/') ? (
                                     <img src={att.url} alt="attachment" className="max-w-full max-h-[300px] object-contain bg-black/20 rounded-sm" />
                                ) : (
                                    <a href={att.url} target="_blank" rel="noreferrer" className="block p-2 text-xs text-brand-primary hover:underline bg-black/20 truncate">
                                        📎 {att.filename}
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Stickers */}
                {message.sticker_items && message.sticker_items.length > 0 && (
                    <div className="mt-2">
                        {message.sticker_items.map((sticker) => (
                            <img 
                                key={sticker.id} 
                                src={`https://cdn.discordapp.com/stickers/${sticker.id}.png`} 
                                alt={sticker.name}
                                className="w-[160px] h-[160px] object-contain hover:scale-105 transition-transform"
                                title={sticker.name}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ serverId }) => {
  // We still use the widget hook to get the server banner info (name, presence count)
  const { data, loading, error } = useDiscordWidget(serverId);
  const { messages, loading: chatLoading, error: chatError } = useDiscordChat(DISCORD_CHAT_CHANNEL_ID);

  const isBannerLoaded = useImageLoaded(BANNER_URL);
  const isIconLoaded = useImageLoaded(ICON_URL);

  // Auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length > 0) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <div className="w-full h-[500px] bg-brand-secondary rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10">
        <p className="text-5xl mb-4">👻</p>
        <h3 className="text-xl font-bold text-brand-primary">Connection Lost</h3>
        <p className="text-gray-400 text-sm mt-2">Could not load the Discord dimension.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-secondary text-left w-full rounded-2xl shadow-2xl shadow-black/50 border border-white/10 overflow-hidden flex flex-col h-[600px] md:h-[750px]">
      
      {/* 1. Widget Header (Server Banner) */}
       <div className="relative flex-shrink-0 h-28 md:h-32 bg-brand-surface overflow-hidden border-b border-black/20 group">
            <div className="absolute inset-0 bg-black/20 z-10 transition-opacity group-hover:opacity-0"></div>
            <img
                src={BANNER_PLACEHOLDER_URL}
                alt=""
                className="w-full h-full object-cover blur-sm"
            />
            <img
                src={BANNER_URL}
                alt={`${data.name} banner`}
                className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${isBannerLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary to-transparent z-10"></div>

            <div className="absolute bottom-3 left-4 z-20 flex items-center gap-3">
                 <div className="w-12 h-12 md:w-14 md:h-14 rounded-[18px] border-2 border-white/20 bg-brand-bg relative overflow-hidden shadow-lg">
                    <img
                        src={ICON_URL}
                        alt="Icon"
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isIconLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                </div>
                <div className="mb-1">
                    <h2 className="text-lg md:text-xl font-bold text-white leading-none tracking-tight drop-shadow-md">{data.name}</h2>
                    <p className="text-[11px] text-gray-300 font-medium flex items-center gap-1.5 mt-1">
                         <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                         {data.presence_count} Online
                    </p>
                </div>
            </div>

            <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 z-30 bg-brand-primary hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded transition-all shadow-lg transform hover:scale-105 hover:shadow-red-500/20"
            >
                Join Server
            </a>
       </div>

      {/* 2. Chat Content Area (Full Width) */}
      <div className="flex-grow flex flex-col min-w-0 bg-[#313338]">
             
             {/* Channel Header */}
             <div className="h-12 border-b border-black/20 flex items-center px-4 shrink-0 bg-[#2b2d31] shadow-sm z-10">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.4049C21.7155 7 21.951 7.28023 21.8974 7.58619L21.7224 8.58619C21.6805 8.82544 21.4728 9 21.2299 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0305 16.8254 19.8228 17 19.5799 17H16.0001L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41001 9L8.35001 15H14.35L15.41 9H9.41001Z" /></svg>
                <span className="font-bold text-white text-sm tracking-wide">general-chat</span>
                <div className="hidden sm:block w-px h-4 bg-white/10 mx-4"></div>
                <span className="hidden sm:block text-xs text-gray-400 truncate">Welcome to the Steak House!</span>
             </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col space-y-1">
                 {chatLoading ? (
                    <div className="flex flex-col items-center justify-center flex-grow text-gray-400 space-y-3">
                        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-mono animate-pulse">Intercepting transmissions...</p>
                    </div>
                ) : chatError ? (
                    <div className="flex flex-col items-center justify-center flex-grow text-red-400 opacity-60">
                        <p className="text-sm">Chat Unavailable</p>
                    </div>
                ) : messages.length === 0 ? (
                     <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
                        <p>No messages yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-grow"></div> 
                        {messages.map(msg => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
                    </>
                )}
                <div ref={chatEndRef} />
            </div>

             {/* Input Area */}
            <div className="p-4 bg-[#313338] shrink-0">
                 <div className="w-full bg-[#383a40] rounded-lg px-4 py-3 text-gray-400 text-sm flex items-center gap-3 cursor-not-allowed select-none shadow-inner">
                    <div className="w-6 h-6 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <span className="text-lg leading-none pb-1">+</span>
                    </div>
                    <span className="opacity-60">Message #general-chat</span>
                    <div className="ml-auto flex gap-3 opacity-50">
                         <span>🎁</span>
                         <span>GIF</span>
                         <span>😊</span>
                    </div>
                 </div>
                 <p className="text-[10px] text-center text-gray-500 mt-2 font-medium">
                    Join the server to start chatting with the community!
                 </p>
            </div>
        </div>
    </div>
  );
};

export default DiscordWidget;
