import React from 'react';
import TimerWidget from './overlays/TimerWidget';
import GoalWidget from './overlays/GoalWidget';
import ActivityWidget from './overlays/ActivityWidget';
import SpinWidget from './overlays/SpinWidget';

const Overlay: React.FC = () => {
    return (
        <div className="w-screen h-screen bg-black/80 font-sans text-white p-10 flex flex-col items-center justify-center gap-10 overflow-auto">
            <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-500 mb-4">OBS Overlay Preview Dashboard</h1>
            
            <div className="flex flex-wrap items-start justify-center gap-10">
                {/* Timer Widget - Increased height for bubble space */}
                <div className="border border-dashed border-gray-600 p-2 relative">
                    <div className="absolute -top-6 left-0 text-xs text-gray-400">Timer (680x400)</div>
                    <div style={{ width: 680, height: 400 }} className="bg-black/20">
                        <TimerWidget />
                    </div>
                </div>

                <div className="border border-dashed border-gray-600 p-2 relative">
                    <div className="absolute -top-6 left-0 text-xs text-gray-400">Goal (350x400)</div>
                    <div style={{ width: 350, height: 400 }} className="bg-black/20">
                        <GoalWidget />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-10">
                <div className="border border-dashed border-gray-600 p-2 relative">
                    <div className="absolute -top-6 left-0 text-xs text-gray-400">Activity (350x120)</div>
                    <div style={{ width: 350, height: 120 }} className="bg-black/20">
                        <ActivityWidget />
                    </div>
                </div>

                <div className="border border-dashed border-gray-600 p-2 relative">
                    <div className="absolute -top-6 left-0 text-xs text-gray-400">Spin (350x120)</div>
                    <div style={{ width: 350, height: 120 }} className="bg-black/20">
                        <SpinWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overlay;