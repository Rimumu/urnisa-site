
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { useDiscordChat, DiscordMessage } from '../hooks/useDiscordChat';
import { DISCORD_INVITE_URL, DISCORD_ROLES_CONFIG, DISCORD_CHAT_CHANNEL_ID } from '../constants';
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
const ICON_PLACEHOLDER_URL = "https://images.weserv.nl/?url=i.ibb.co/j9W0ZQhn/nisa-nomnom.png&w=24&h=24&blur=3&fit=cover";

const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  const statusColor: Record<string, string> = {
    online: 'bg-green-500',
    idle: 'bg-amber-400',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500',
  };

  return (
    <div className="absolute -bottom-0.5 -right-0.5 bg-brand-secondary rounded-full p-[2px]">
        <div 
            className={`h-2.5 w-2.5 rounded-full ${statusColor[status] || 'bg-gray-500'}`} 
            title={status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Offline'}
        />
    </div>
  );
};

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-[600px] bg-brand-secondary rounded-2xl border border-white/10 overflow-hidden flex flex-col animate-pulse">
        <div className="h-32 bg-white/5"></div>
        <div className="flex-1 flex">
            <div className="flex-1 p-4 space-y-4">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-1/2"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
            </div>
            <div className="w-60 bg-white/5 border-l border-white/5 p-4 space-y-4 hidden md:block">
                 <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10"></div>
                    <div className="h-3 bg-white/10 rounded w-20"></div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white/10"></div>
                    <div className="h-3 bg-white/10 rounded w-20"></div>
                </div>
            </div>
        </div>
    </div>
);

const MemberRow: React.FC<{ member: any }> = ({ member }) => (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group">
        <div className="relative flex-shrink-0">
            <img 
                loading="lazy" 
                src={getDiscordAvatarUrl(member)} 
                alt={`${member.username}'s avatar`} 
                className="w-8 h-8 rounded-full object-cover bg-brand-secondary" 
            />
            <StatusIndicator status={member.status} />
        </div>
        <div className="flex-grow overflow-hidden min-w-0 text-left">
            <div className="flex items-center justify-between">
                <p className={`font-medium truncate text-sm transition-colors ${member.status === 'offline' ? 'text-gray-500' : 'text-gray-300 group-hover:text-white'}`}>
                    {member.nick || member.global_name || member.username}
                </p>
            </div>
            
            {/* Activity / Game Status */}
            {member.game ? (
                <p className="text-[10px] text-gray-400 truncate">
                    Playing <span className="font-semibold text-gray-300">{member.game.name}</span>
                </p>
            ) : (
                <p className="text-[10px] text-gray-500 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    View Profile
                </p>
            )}
        </div>
    </div>
);

const ChatMessage: React.FC<{ message: DiscordMessage }> = ({ message }) => {
    const date = new Date(message.timestamp);
    const dateString = date.toLocaleDateString() === new Date().toLocaleDateString()
        ? `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : date.toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex gap-3 p-1 py-1.5 hover:bg-black/20 rounded-sm transition-colors group text-left">
             <div className="flex-shrink-0 pt-0.5">
                <img 
                    src={getDiscordAvatarUrl(message.author)} 
                    alt={message.author.username}
                    className="w-10 h-10 rounded-full bg-brand-surface object-cover cursor-pointer hover:opacity-80 transition-opacity"
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="font-medium text-white text-sm hover:underline cursor-pointer">{message.author.username}</span>
                    <span className="text-[10px] text-gray-500">{dateString}</span>
                </div>
                <div className="text-gray-300 text-[14px] whitespace-pre-wrap break-words leading-relaxed">
                    {message.content}
                </div>
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
            </div>
        </div>
    );
};

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ serverId }) => {
  const { data, ownerData, loading, error } = useDiscordWidget(serverId);
  const { messages, loading: chatLoading, error: chatError } = useDiscordChat(DISCORD_CHAT_CHANNEL_ID);

  const isBannerLoaded = useImageLoaded(BANNER_URL);
  const isIconLoaded = useImageLoaded(ICON_URL);

  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');
  
  const ownerRole = DISCORD_ROLES_CONFIG.find(r => r.id === 'owner');
  const guardRole = DISCORD_ROLES_CONFIG.find(r => r.id === 'guard_dogs');

  // Auto-scroll chat to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((activeTab === 'chat' || window.innerWidth >= 768) && messages.length > 0) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, messages]);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    owner: true,
    guard_dogs: true,
    meatlings: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Categorize and Sort Members
  const categorizedMembers = useMemo(() => {
    if (!data || !data.members) return null;

    const groups: Record<string, any[]> = {
        owner: [],
        guard_dogs: [],
        meatlings: []
    };

    // Normalize helper
    const norm = (val: any) => String(val || '').trim().toLowerCase();

    // Pre-calculate sets of IDs for O(1) lookup
    const ownerIds = new Set(ownerRole?.userIds?.map(norm) || []);
    const guardIds = new Set(guardRole?.userIds?.map(norm) || []);
    const ownerUsernames = new Set(ownerRole?.usernames?.map(norm) || []);

    // 1. SINGLE PASS BUCKET SORT
    // Iterate through all online members exactly ONCE and assign to the highest priority group.
    data.members.forEach(member => {
        const mId = norm(member.id);
        const mUser = norm(member.username);

        // Priority 1: Owner
        if (ownerIds.has(mId) || ownerUsernames.has(mUser)) {
            groups.owner.push(member);
            return; // Assigned! Move to next member.
        }

        // Priority 2: Guard Dogs
        if (guardIds.has(mId)) {
            groups.guard_dogs.push(member);
            return; // Assigned!
        }

        // Priority 3: Meatlings (Everyone else)
        groups.meatlings.push(member);
    });

    // 2. OWNER HANDLING (Search & Rescue + Injection)
    // We want to ensure the owner is displayed with high-quality data if possible.
    const targetOwnerId = ownerData ? norm(ownerData.id) : (Array.from(ownerIds)[0] || '');

    // Check if owner ended up in the Owner bucket (Ideal case)
    let finalOwnerEntry = groups.owner.find(m => norm(m.id) === targetOwnerId);

    // If not in Owner bucket, check if they accidentally fell into Meatlings 
    // (e.g. if ID config had a typo but we have a fresh ID from ownerData)
    if (!finalOwnerEntry && targetOwnerId) {
        const rescueIndex = groups.meatlings.findIndex(m => norm(m.id) === targetOwnerId);
        if (rescueIndex !== -1) {
            // Found them in meatlings! Move them to Owner.
            finalOwnerEntry = groups.meatlings[rescueIndex];
            groups.meatlings.splice(rescueIndex, 1); // Remove from meatlings to prevent duplicate
            groups.owner.push(finalOwnerEntry);
        }
    }

    // If still not found, they are OFFLINE. Inject them using bot data.
    if (!finalOwnerEntry && ownerData) {
        finalOwnerEntry = {
            ...ownerData,
            status: 'offline',
            game: undefined
        };
        groups.owner.push(finalOwnerEntry);
    }

    // 3. ENHANCE DATA
    // If we have the owner entry (from any source) and we have bot data, merge it.
    if (finalOwnerEntry && ownerData) {
        const idx = groups.owner.indexOf(finalOwnerEntry);
        if (idx !== -1) {
            groups.owner[idx] = {
                ...finalOwnerEntry, // Base data (preserves 'online' status if from widget)
                nick: ownerData.nick || finalOwnerEntry.nick, // Prefer Bot/Server Nickname
                avatar_url: ownerData.avatar_url || finalOwnerEntry.avatar_url, // Prefer Bot Avatar
                global_name: ownerData.global_name || finalOwnerEntry.global_name,
                // IMPORTANT: Do not overwrite status/game with bot data if the user was actually online
                status: finalOwnerEntry.status, 
                game: finalOwnerEntry.game 
            };
        }
    }

    // 4. SORT ALPHABETICALLY
    const sortByName = (a: any, b: any) => {
        const getName = (m: any) => (m.nick || m.global_name || m.username || '').toLowerCase();
        return getName(a).localeCompare(getName(b));
    };

    groups.owner.sort(sortByName);
    groups.guard_dogs.sort(sortByName);
    groups.meatlings.sort(sortByName);

    return groups;
  }, [data, ownerData, ownerRole, guardRole]);

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

      {/* 2. Main Content Area (Split Pane) */}
      <div className="flex-grow flex overflow-hidden relative bg-[#2b2d31]"> {/* Discord-ish dark bg */}
        
        {/* Left Pane: Chat */}
        <div className={`flex-1 flex flex-col min-w-0 bg-black/10 transition-all ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}`}>
             
             {/* Channel Header */}
             <div className="h-12 border-b border-white/5 flex items-center px-4 shrink-0 bg-brand-secondary/40 backdrop-blur-sm shadow-sm z-10">
                <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.4049C21.7155 7 21.951 7.28023 21.8974 7.58619L21.7224 8.58619C21.6805 8.82544 21.4728 9 21.2299 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0305 16.8254 19.8228 17 19.5799 17H16.0001L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41001 9L8.35001 15H14.35L15.41 9H9.41001Z" /></svg>
                <span className="font-bold text-white text-sm tracking-wide">general-chat</span>
                <div className="hidden sm:block w-px h-4 bg-white/10 mx-4"></div>
                <span className="hidden sm:block text-xs text-gray-400 truncate">Welcome to the Steak House!</span>
                
                {/* Mobile Tabs Toggle */}
                <div className="ml-auto flex md:hidden bg-black/20 rounded p-0.5">
                    <button onClick={() => setActiveTab('chat')} className={`px-2 py-1 rounded text-xs font-bold ${activeTab === 'chat' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}>Chat</button>
                    <button onClick={() => setActiveTab('members')} className={`px-2 py-1 rounded text-xs font-bold ${activeTab === 'members' ? 'bg-brand-primary text-white' : 'text-gray-400'}`}>People</button>
                </div>
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
            <div className="p-4 bg-brand-secondary/10 shrink-0">
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

        {/* Right Pane: Members List */}
        <div className={`w-full md:w-[240px] bg-[#2b2d31] border-l border-black/20 flex-col overflow-y-auto custom-scrollbar shrink-0 ${activeTab === 'members' ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-3 space-y-6">
                
                {/* Role: Owner */}
                {categorizedMembers && categorizedMembers.owner.length > 0 && (
                    <div>
                        <button 
                            onClick={() => toggleSection('owner')}
                            className="w-full flex items-center justify-between font-bold text-[11px] uppercase mb-2 px-2 transition-opacity focus:outline-none group hover:opacity-80"
                        >
                            <span className={ownerRole?.color || 'text-gray-400'}>Owner — {categorizedMembers.owner.length}</span>
                            <span className="text-[10px] text-gray-400 group-hover:text-white">{expandedSections['owner'] ? '▼' : '›'}</span>
                        </button>
                        {expandedSections['owner'] && (
                            <div className="space-y-0.5">
                                {categorizedMembers.owner.map(member => (
                                    <MemberRow key={member.id} member={member} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Role: Guard Dogs */}
                {categorizedMembers && categorizedMembers.guard_dogs.length > 0 && (
                    <div>
                         <button 
                            onClick={() => toggleSection('guard_dogs')}
                            className="w-full flex items-center justify-between font-bold text-[11px] uppercase mb-2 px-2 transition-opacity focus:outline-none group hover:opacity-80"
                        >
                            <span className={guardRole?.color || 'text-gray-400'}>Guard Dogs — {categorizedMembers.guard_dogs.length}</span>
                            <span className="text-[10px] text-gray-400 group-hover:text-white">{expandedSections['guard_dogs'] ? '▼' : '›'}</span>
                        </button>
                        {expandedSections['guard_dogs'] && (
                            <div className="space-y-0.5">
                                {categorizedMembers.guard_dogs.map(member => (
                                    <MemberRow key={member.id} member={member} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Role: Meatlings */}
                {categorizedMembers && categorizedMembers.meatlings.length > 0 && (
                    <div>
                         <button 
                            onClick={() => toggleSection('meatlings')}
                            className="w-full flex items-center justify-between font-bold text-[11px] text-gray-400 uppercase mb-2 px-2 transition-opacity focus:outline-none group hover:opacity-80"
                        >
                            <span>Meatlings — {categorizedMembers.meatlings.length}</span>
                            <span className="text-[10px] group-hover:text-white">{expandedSections['meatlings'] ? '▼' : '›'}</span>
                        </button>
                        {expandedSections['meatlings'] && (
                            <div className="space-y-0.5">
                                {categorizedMembers.meatlings.map(member => (
                                    <MemberRow key={member.id} member={member} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Empty State */}
                {data && data.members.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                        <p className="text-4xl mb-2">🍃</p>
                        <p className="text-xs text-gray-400">It's quiet here...</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordWidget;
