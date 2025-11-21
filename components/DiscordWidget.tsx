
import React, { useState, useEffect, useRef } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { useDiscordChat, DiscordMessage } from '../hooks/useDiscordChat';
import { DISCORD_INVITE_URL, DISCORD_CHAT_CHANNEL_ID } from '../constants';
import { getDiscordAvatarUrl } from '../utils/discord';

interface DiscordWidgetProps {
  serverId: string;
}

// Hardcoded assets for the widget
const BANNER_URL = "https://i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png";
const ICON_URL = "https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png";
const CHANNEL_NAME = "₊˚ᰔ┊chill";

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

const parseDiscordContent = (content: string, mentions: any[] = [], isJumbo: boolean = false): React.ReactNode => {
    if (!content) return null;

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

        // --- PRIORITY 2: CONTAINERS ---

        // 3. Blockquotes
        parts = splitText(parts, /^(?:>>>\s|>\s)([\s\S]*)/gm, (match, i) => (
            <div key={`bq-${i}`} className="flex gap-3 my-2 pl-1 relative group">
                 <div className="w-1 bg-brand-primary rounded-full shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"></div>
                 <div className="opacity-90 flex-1 italic text-gray-300">{process(match[1])}</div>
            </div>
        ));

        // 4. Spoilers (Interactive)
        parts = splitText(parts, /\|\|(.*?)\|\|/g, (match, i) => {
            const SpoilerContent = () => {
                const [revealed, setRevealed] = useState(false);
                return (
                    <span 
                        onClick={() => setRevealed(true)}
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

        // 5. Styling
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

        // --- PRIORITY 3: LEAF NODES ---

        // 6. Links
        parts = splitText(parts, /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g, (match, i) => (
            <a key={`a-${i}`} href={match[1]} target="_blank" rel="noreferrer" className="text-brand-primary hover:text-brand-accent hover:underline break-all transition-colors">
                {match[1]}
            </a>
        ));

        // 7. Emotes
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
                    className={`${isJumbo ? 'w-12 h-12 my-1' : 'w-6 h-6 -translate-y-0.5'} inline-block object-contain align-middle mx-0.5 hover:scale-110 transition-transform duration-200`}
                />
            );
        });

        // 8. User Mentions
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
        
        // 9. Role & Channel Mentions
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
        
        return parts;
    };

    return process(content);
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
        <div className="flex gap-4 px-4 py-2 hover:bg-white/5 group transition-colors border-l-2 border-transparent hover:border-brand-primary/50">
             <div className="flex-shrink-0 pt-1">
                <img 
                    src={avatarUrl} 
                    alt={displayName}
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
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {message.attachments.map((att) => (
                            <div key={att.id} className="max-w-full rounded-lg overflow-hidden bg-black/40 border border-white/10 hover:border-brand-primary/50 transition-colors group/att">
                                {att.content_type?.startsWith('image/') ? (
                                     <img src={att.url} alt="attachment" className="max-w-[300px] max-h-[300px] object-contain" />
                                ) : (
                                    <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 max-w-xs">
                                        <div className="text-3xl">📎</div>
                                        <div className="overflow-hidden min-w-0">
                                            <div className="text-brand-primary group-hover/att:underline truncate text-sm font-bold">{att.filename}</div>
                                            <div className="text-xs text-gray-500 font-mono">{(att.size / 1024).toFixed(0)} KB</div>
                                        </div>
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
                                className="w-32 h-32 object-contain hover:scale-105 transition-transform drop-shadow-md"
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
  const { data, loading, error } = useDiscordWidget(serverId);
  const { messages, loading: chatLoading, error: chatError } = useDiscordChat(DISCORD_CHAT_CHANNEL_ID);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 50;
      setShowScrollButton(distanceFromBottom > 200);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
        });
        shouldAutoScrollRef.current = true;
        setShowScrollButton(false);
    }
  };

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

  return (
    <div className="flex flex-col h-[600px] md:h-[800px] w-full bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-2xl font-sans text-gray-200 text-left">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background-color: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #581c25; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #e5383b; }
      `}</style>

      {/* 1. Header Section - Banner & Server Info */}
      <div className="shrink-0 relative h-40 bg-brand-secondary overflow-hidden group select-none">
            <img src={BANNER_URL} alt="Server Banner" className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            
            <div className="absolute bottom-0 left-0 p-5 flex items-end gap-4 w-full z-10">
                 <div className="relative w-20 h-20 shrink-0 rounded-2xl p-[3px] bg-gradient-to-tr from-brand-primary to-brand-accent shadow-xl -mb-4 transform group-hover:-translate-y-1 transition-transform duration-300">
                     <div className="w-full h-full rounded-[13px] overflow-hidden bg-brand-secondary">
                        <img src={ICON_URL} alt="Icon" className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#23a559] rounded-full border-[4px] border-black" title="Online"></div>
                 </div>
                 <div className="mb-1 flex-1 min-w-0 pb-1">
                     <h2 className="text-white font-extrabold text-2xl leading-tight truncate drop-shadow-lg tracking-wide">{data.name}</h2>
                     <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5 mt-1 backdrop-blur-sm bg-black/30 w-fit px-2 py-0.5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-[#23a559] animate-pulse shadow-[0_0_8px_#23a559]"></span>
                        <span className="text-white">{data.presence_count.toLocaleString()}</span> Members Online
                     </p>
                 </div>
                 <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer" 
                    className="shrink-0 bg-brand-primary hover:bg-red-600 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-all hover:scale-105 mb-2 shadow-lg hover:shadow-brand-primary/40 border border-white/10">
                    Join Server
                 </a>
            </div>
      </div>

      {/* 2. Channel Bar */}
      <div className="shrink-0 h-14 border-b border-white/5 flex items-center px-5 bg-black/20 shadow-sm z-20 backdrop-blur-sm mt-4">
            <span className="text-2xl mr-3 text-brand-accent">#</span>
            <span className="font-bold text-white text-lg tracking-wide mr-3 drop-shadow-sm">{CHANNEL_NAME}</span>
      </div>

      {/* 3. Chat Area */}
      <div 
        className="flex-1 overflow-y-auto custom-scrollbar relative min-h-0 bg-transparent scroll-smooth" 
        ref={chatContainerRef} 
        onScroll={handleScroll}
      >
          {/* Spacer */}
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

          {showScrollButton && (
            <button 
                onClick={scrollToBottom}
                className="sticky bottom-6 left-[50%] translate-x-[-50%] z-30 bg-brand-surface hover:bg-brand-primary text-white px-5 py-2 rounded-full shadow-xl border border-white/10 flex items-center gap-2 transition-all active:scale-95 hover:scale-105 group animate-bounce"
            >
                <span className="text-xs font-bold">New Messages</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
          )}
      </div>

      {/* 4. Input Area */}
      <div className="shrink-0 p-4 bg-black/20 z-20 border-t border-white/5">
         <div className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3 cursor-not-allowed select-none transition-colors group hover:border-white/10">
            <div className="w-7 h-7 rounded-full bg-white/10 text-gray-400 flex items-center justify-center font-bold text-lg pb-0.5 group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                +
            </div>
            <div className="text-gray-500 text-sm font-medium truncate group-hover:text-gray-400 transition-colors">
                Message #{CHANNEL_NAME}
            </div>
            <div className="ml-auto flex gap-4 opacity-50 shrink-0">
                 <span className="font-bold text-[10px] border-2 border-current rounded-[4px] px-1 py-px">GIF</span>
                 <span className="text-xl hover:text-brand-accent transition-colors">☺</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DiscordWidget;
