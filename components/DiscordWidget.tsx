
import React, { useMemo, useState } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { DISCORD_INVITE_URL, DISCORD_ROLES_CONFIG } from '../constants';
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
  const colorClasses: Record<string, string> = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
    offline: 'bg-gray-500',
  };
  
  const colorClass = colorClasses[status] || 'bg-gray-500';
  
  return (
    <span
      className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-brand-surface ${colorClass}`}
      title={status.charAt(0).toUpperCase() + status.slice(1)}
    />
  );
};

const SkeletonLoader: React.FC = () => (
    <div className="w-full h-[500px] bg-brand-secondary rounded-2xl p-4 animate-pulse">
        <div className="h-24 bg-brand-surface rounded-t-lg relative mb-12">
            <div className="absolute -bottom-10 left-4 h-20 w-20 rounded-full bg-brand-bg border-4 border-brand-surface"></div>
        </div>
        <div className="h-6 w-3/4 bg-brand-surface rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-brand-surface rounded mb-6"></div>
        <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand-surface"></div>
                    <div className="h-4 w-2/3 bg-brand-surface rounded"></div>
                </div>
            ))}
        </div>
    </div>
);

const MemberRow: React.FC<{ member: any }> = ({ member }) => (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 transition-colors">
        <div className="relative flex-shrink-0">
            <img 
                loading="lazy" 
                src={getDiscordAvatarUrl(member)} 
                alt={`${member.username}'s avatar`} 
                className="w-10 h-10 rounded-full object-cover" 
            />
            <StatusIndicator status={member.status} />
        </div>
        <div className="flex-grow overflow-hidden min-w-0">
            <p className="font-semibold text-white truncate text-sm">
                {member.nick || member.global_name || member.username}
            </p>
            {member.status === 'offline' ? (
                 <p className="text-xs text-gray-500 truncate">Offline</p>
            ) : member.game && (
                <p className="text-xs text-gray-400 truncate">Playing {member.game.name}</p>
            )}
        </div>
    </div>
);

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ serverId }) => {
  const { data, ownerData, loading, error } = useDiscordWidget(serverId);

  const isBannerLoaded = useImageLoaded(BANNER_URL);
  const isIconLoaded = useImageLoaded(ICON_URL);

  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    owner: true,
    guard_dogs: false,
    meatlings: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Sort members into categories based on config
  const categorizedMembers = useMemo(() => {
    if (!data || !data.members) return null;

    const groups: Record<string, any[]> = {
        owner: [],
        guard_dogs: [],
        meatlings: []
    };

    // Config maps
    const ownerConfig = DISCORD_ROLES_CONFIG.find(r => r.id === 'owner');
    const guardConfig = DISCORD_ROLES_CONFIG.find(r => r.id === 'guard_dogs');

    const isMatch = (config: any, memberId: string, memberUsername: string, fullUsername: string) => {
        if (!config) return false;
        
        // Check ID exact match (robust string comparison)
        if (config.userIds && config.userIds.some((id: string) => id.trim() === memberId)) {
            return true;
        }

        // Check username or username#discriminator
        return config.usernames.some((u: string) => {
            const lowerU = u.toLowerCase();
            return memberUsername === lowerU || fullUsername === lowerU;
        });
    };

    data.members.forEach(member => {
        const memberId = String(member.id).trim();
        const memberUsername = member.username.toLowerCase();
        // Construct full username tag for legacy username support (e.g. username#1234)
        const fullUsername = member.discriminator && member.discriminator !== '0' 
            ? `${memberUsername}#${member.discriminator}` 
            : memberUsername;

        if (isMatch(ownerConfig, memberId, memberUsername, fullUsername)) {
            groups.owner.push(member);
            return;
        }
        
        if (isMatch(guardConfig, memberId, memberUsername, fullUsername)) {
            groups.guard_dogs.push(member);
            return;
        }

        // Everyone else goes to Meatlings
        groups.meatlings.push(member);
    });

    // Fallback: If Owner is offline (not in widget data), inject them using fetched profile data
    if (groups.owner.length === 0 && ownerConfig && ownerConfig.userIds.length > 0) {
        // Use data from the local bot API if available
        const realOwner = ownerData;
        
        groups.owner.push({
            id: ownerConfig.userIds[0],
            username: realOwner?.username || ownerConfig.usernames[0] || 'Owner',
            global_name: realOwner?.global_name || null,
            // Use 'nick' from the bot API which corresponds to the server nickname
            nick: realOwner?.nick || null, 
            discriminator: realOwner?.discriminator || '0000',
            // 'avatar_url' is pre-calculated by our server.js
            avatar_url: realOwner?.avatar_url || ownerConfig.avatarUrl, 
            // We don't have the raw avatar hash here usually if coming from constants, but server provides avatar_url
            avatar: null, 
            status: 'offline',
            game: null
        });
    }

    // Sort members alphabetically within each group
    const sortByName = (a: any, b: any) => {
        const nameA = a.nick || a.global_name || a.username;
        const nameB = b.nick || b.global_name || b.username;
        return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    };

    groups.owner.sort(sortByName);
    groups.guard_dogs.sort(sortByName);
    groups.meatlings.sort(sortByName);

    return groups;
  }, [data, ownerData]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <div className="w-full h-[500px] bg-brand-secondary rounded-2xl p-4 flex flex-col items-center justify-center text-center border border-white/10">
        <p className="text-5xl mb-4">😢</p>
        <h3 className="text-xl font-bold text-brand-primary">Could not load Discord data</h3>
        <p className="text-gray-400 text-sm mt-2">There was an issue fetching the server information. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-secondary text-left w-full rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden flex flex-col h-full max-h-[600px]">
      {/* Header Section */}
       <div className="relative flex-shrink-0">
        <div className="relative w-full h-28 bg-brand-surface overflow-hidden">
            <img
                src={BANNER_PLACEHOLDER_URL}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover scale-110"
            />
            <img
                src={BANNER_URL}
                alt={`${data.name} server banner`}
                className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${isBannerLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary/80 to-transparent"></div>
        </div>

        <div className="absolute -bottom-10 left-6 flex items-end">
             <div className="w-20 h-20 rounded-full border-4 border-brand-secondary bg-brand-bg relative overflow-hidden">
                <img
                    src={ICON_PLACEHOLDER_URL}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover scale-110"
                />
                <img
                    src={ICON_URL}
                    alt={`${data.name} server icon`}
                    className={`w-full h-full absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${isIconLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>
        </div>
        
        <div className="absolute bottom-2 right-4">
            <span className="text-xs font-bold bg-black/50 backdrop-blur-md px-2 py-1 rounded text-green-400 border border-green-500/30 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                {data.presence_count} Online
            </span>
        </div>
    </div>

      {/* Server Name & Action */}
      <div className="mt-12 px-6 mb-4 flex justify-between items-end flex-shrink-0">
        <div>
            <h3 className="text-xl font-bold text-white leading-tight">{data.name}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Official Community</p>
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-primary text-white text-sm font-bold py-2 px-4 rounded hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg shadow-red-900/20"
        >
          Join
        </a>
      </div>
      
      {/* Member List */}
      <div className="flex-grow overflow-y-auto px-4 pb-4 custom-scrollbar space-y-4">
        
        {/* Owner Section */}
        {categorizedMembers && categorizedMembers.owner.length > 0 && (
            <div>
                <button 
                    onClick={() => toggleSection('owner')}
                    className="w-full flex items-center justify-between font-bold text-xs text-pink-300 uppercase mb-2 px-2 tracking-wider border-b border-pink-500/20 pb-1 hover:bg-white/5 rounded transition-colors focus:outline-none"
                >
                    <span className="flex items-center gap-2">
                        <span>👑</span> Owner 
                        <span className="text-pink-300/50 text-[10px]">({categorizedMembers.owner.length})</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${expandedSections['owner'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {expandedSections['owner'] && (
                    <div className="space-y-1">
                        {categorizedMembers.owner.map(member => (
                            <MemberRow key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Guard Dogs Section */}
        {categorizedMembers && categorizedMembers.guard_dogs.length > 0 && (
            <div>
                <button 
                    onClick={() => toggleSection('guard_dogs')}
                    className="w-full flex items-center justify-between font-bold text-xs text-green-400 uppercase mb-2 px-2 tracking-wider border-b border-green-500/20 pb-1 hover:bg-white/5 rounded transition-colors focus:outline-none"
                >
                     <span className="flex items-center gap-2">
                        <span>🛡️</span> Guard Dogs
                        <span className="text-green-400/50 text-[10px]">({categorizedMembers.guard_dogs.length})</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${expandedSections['guard_dogs'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {expandedSections['guard_dogs'] && (
                    <div className="space-y-1">
                        {categorizedMembers.guard_dogs.map(member => (
                            <MemberRow key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Meatlings Section */}
        {categorizedMembers && categorizedMembers.meatlings.length > 0 && (
            <div>
                 <button 
                    onClick={() => toggleSection('meatlings')}
                    className="w-full flex items-center justify-between font-bold text-xs text-gray-400 uppercase mb-2 px-2 tracking-wider border-b border-white/10 pb-1 hover:bg-white/5 rounded transition-colors focus:outline-none"
                >
                    <span className="flex items-center gap-2">
                        Meatlings
                        <span className="text-gray-500 text-[10px]">({categorizedMembers.meatlings.length})</span>
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${expandedSections['meatlings'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {expandedSections['meatlings'] && (
                    <div className="space-y-1">
                        {categorizedMembers.meatlings.map(member => (
                            <MemberRow key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* Empty State if no one is online */}
        {data && data.members.length === 0 && categorizedMembers?.owner.length === 0 && (
             <div className="text-center py-10 text-gray-500">
                <p>No one is online right now... 🦗</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default DiscordWidget;
