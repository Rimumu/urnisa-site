
import React, { useState } from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { DISCORD_INVITE_URL, FEATURED_ROLES } from '../constants';
import { useImageLoaded } from '../hooks/useImageLoaded';
import { getDiscordAvatarUrl } from '../utils/discord';

interface DiscordWidgetProps {
  serverId: string;
}

// URLs for high-resolution images
const BANNER_URL = "https://i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png";
const ICON_URL = "https://i.ibb.co/j9W0ZQhn/nisa-nomnom.png";

// URLs for tiny, blurred placeholder images, proxied through a resizing service
const BANNER_PLACEHOLDER_URL = "https://images.weserv.nl/?url=i.ibb.co/rG0Y03L0/1500x500-twitter-cover.png&w=48&h=16&blur=3&fit=cover";
const ICON_PLACEHOLDER_URL = "https://images.weserv.nl/?url=i.ibb.co/j9W0ZQhn/nisa-nomnom.png&w=24&h=24&blur=3&fit=cover";


const StatusIndicator: React.FC<{ status: 'online' | 'idle' | 'dnd' }> = ({ status }) => {
  const colorClasses = {
    online: 'bg-green-500',
    idle: 'bg-yellow-500',
    dnd: 'bg-red-500',
  };
  return (
    <span
      className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-brand-surface ${colorClasses[status]}`}
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

const DiscordWidget: React.FC<DiscordWidgetProps> = ({ serverId }) => {
  const { data, loading, error } = useDiscordWidget(serverId);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Hooks to track when the full-resolution images are loaded
  const isBannerLoaded = useImageLoaded(BANNER_URL);
  const isIconLoaded = useImageLoaded(ICON_URL);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error || !data) {
    return (
      <div className="w-full h-[500px] bg-brand-secondary rounded-2xl p-4 flex flex-col items-center justify-center text-center">
        <p className="text-5xl mb-4">😢</p>
        <h3 className="text-xl font-bold text-brand-primary">Could not load Discord data</h3>
        <p className="text-gray-400">There was an issue fetching the server information. Please try again later.</p>
      </div>
    );
  }

  const roleData = FEATURED_ROLES.find(r => r.name === selectedRole);
  const membersToDisplay = roleData ? roleData.members : data.members;
  const listTitle = selectedRole ? `${selectedRole}` : `Members Online (${data.presence_count})`;

  return (
    <div className="bg-brand-secondary text-left w-full rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
      {/* Banner and Icon */}
       <div className="relative">
        <div className="relative w-full h-32 bg-brand-surface overflow-hidden">
            {/* Low-res, blurred placeholder. Always rendered. */}
            <img
                src={BANNER_PLACEHOLDER_URL}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover scale-110" // Scale up to hide blurry edges
            />
            {/* High-res image. Fades in on top when loaded. */}
            <img
                src={BANNER_URL}
                alt={`${data.name} server banner`}
                className={`w-full h-full object-cover absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${isBannerLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>

        <div className="w-24 h-24 rounded-full absolute -bottom-12 left-6 border-4 border-brand-secondary bg-brand-bg object-cover overflow-hidden">
            {/* Low-res, blurred placeholder */}
            <img
                src={ICON_PLACEHOLDER_URL}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover scale-110"
            />
            {/* High-res image */}
            <img
                src={ICON_URL}
                alt={`${data.name} server icon`}
                className={`w-full h-full rounded-full absolute top-0 left-0 transition-opacity duration-700 ease-in-out ${isIconLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    </div>


      {/* Server Info & Join Button */}
      <div className="pt-16 pb-4 px-6 flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-white">{data.name}</h3>
          <p className="text-gray-400 font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            {data.presence_count} Members Online
          </p>
        </div>
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 transition-all transform hover:scale-105"
        >
          Join Server
        </a>
      </div>
      
      {/* Role Filters Section */}
      <div className="px-6 pb-4">
        <h4 className="font-bold text-xs text-gray-400 uppercase mb-2">Filter Members</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole(null)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${selectedRole === null ? 'bg-brand-primary text-white' : 'bg-black/30 text-gray-300 hover:bg-white/10'}`}
          >
            All Members
          </button>
          {FEATURED_ROLES.map(role => (
            <button 
              key={role.name}
              onClick={() => setSelectedRole(role.name)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold transition-colors ${selectedRole === role.name ? 'bg-brand-primary text-white' : 'bg-black/30 text-gray-300 hover:bg-white/10'}`}
            >
              <span className={`w-3 h-3 rounded-full ${role.color.replace('text-', 'bg-')}`}></span>
              <span>{role.name}</span>
            </button>
          ))}
        </div>
      </div>


      {/* Member List */}
      <div className="px-6 pb-6">
        <h4 className="font-bold text-xs text-gray-400 uppercase mb-2">{listTitle}</h4>
        <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
          {membersToDisplay.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
              <div className="relative">
                <img loading="lazy" src={getDiscordAvatarUrl(member)} alt={`${member.username}'s avatar`} className="w-10 h-10 rounded-full" />
                <StatusIndicator status={member.status} />
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-white truncate">{member.username}</p>
                {'game' in member && member.game && (
                  <p className="text-xs text-gray-400 truncate">Playing {member.game.name}</p>
                )}
              </div>
            </div>
          ))}
           {membersToDisplay.length === 0 && (
             <div className="text-center py-8 text-gray-400">
               <p>No members to display for this role.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DiscordWidget;
