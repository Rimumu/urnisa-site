
import React from 'react';
import { useDiscordWidget } from '../hooks/useDiscordWidget';
import { DISCORD_INVITE_URL } from '../constants';

interface DiscordWidgetProps {
  serverId: string;
}

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

  return (
    <div className="bg-brand-secondary text-left w-full rounded-2xl shadow-2xl shadow-black/40 border border-white/10 overflow-hidden">
      {/* Banner and Icon */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-brand-primary via-red-800 to-brand-bg"></div>
        <img
          src="https://cdn.discordapp.com/icons/1336782145833668729/a_0d5b799e0b8e6b1e6b8c9d0f1f8e5f7e.gif?size=128"
          alt={`${data.name} server icon`}
          className="w-24 h-24 rounded-full absolute -bottom-12 left-6 border-4 border-brand-secondary bg-brand-bg"
        />
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

      {/* Member List */}
      <div className="px-6 pb-6">
        <h4 className="font-bold text-xs text-gray-400 uppercase mb-2">Members Online</h4>
        <div className="max-h-80 overflow-y-auto pr-2 space-y-2">
          {data.members.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
              <div className="relative">
                <img src={member.avatar_url} alt={`${member.username}'s avatar`} className="w-10 h-10 rounded-full" />
                <StatusIndicator status={member.status} />
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="font-semibold text-white truncate">{member.username}</p>
                {member.game && (
                  <p className="text-xs text-gray-400 truncate">Playing {member.game.name}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiscordWidget;
