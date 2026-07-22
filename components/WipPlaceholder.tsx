import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import UserProfile from './UserProfile';

interface WipPlaceholderProps {
    backPath?: string;
}

const WipPlaceholder: React.FC<WipPlaceholderProps> = ({ 
    backPath = "/minecraft"
}) => {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 font-sans relative flex flex-col justify-center items-center">
            {/* Top Right User Profile */}
            <UserProfile className="!absolute top-4 right-4 z-50" />
            
            <div className="max-w-md mx-auto w-full space-y-6">
                <Link to={backPath} className="text-gray-400 hover:text-white mb-2 inline-flex items-center gap-2 group transition-colors">
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Minecraft Dashboard
                </Link>

                {/* Ultra-Minimalist Under Maintenance Card */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Custom Hammer SVG */}
                    <div className="w-24 h-24 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)] mb-8">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="w-12 h-12"
                        >
                            {/* Hammer Head */}
                            <path d="M14.5 2L22 9.5L19.5 12L17.5 10L10 17.5H6V13.5L13.5 6L11.5 4L14.5 2Z" fill="currentColor" fillOpacity="0.1" />
                            {/* Hammer Handle */}
                            <path d="M6 17.5L2 21.5" />
                            {/* Details on the head */}
                            <path d="M13.5 6L17.5 10" />
                            <path d="M8 15.5L12 11.5" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
                        UNDER MAINTENANCE
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default WipPlaceholder;
