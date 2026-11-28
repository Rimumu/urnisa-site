import React from 'react';
import { SOJU_BAR_KEYFRAMES, SojuBarShowcase } from '../../components/SojuBarShowcase';
import { useDrinkingEvent } from '../../hooks/useDrinkingEvent';

const MAX_GLASS_SHOTS = 25;

const SojuWidget: React.FC = () => {
    // Poll on the exact same 2.5s cadence as DrinkWidget so both OBS sources stay synchronized
    const { stats } = useDrinkingEvent(2500);

    const glassFillPercent = Math.min(100, Math.round((stats.completedShots / MAX_GLASS_SHOTS) * 100));
    const isGlassOverfilled = stats.completedShots > MAX_GLASS_SHOTS;
    const isPouring = stats.pendingShotsCount > 0;

    return (
        <div className="w-full h-full flex-1 bg-transparent py-4 px-10 flex items-center justify-center overflow-visible select-none">
            <style>{SOJU_BAR_KEYFRAMES}</style>
            <SojuBarShowcase
                glassFillPercent={glassFillPercent}
                isPouring={isPouring}
                isGlassOverfilled={isGlassOverfilled}
                className="relative w-full max-w-[340px] mx-auto flex flex-col items-end"
            />
        </div>
    );
};

export default SojuWidget;
