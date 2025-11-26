import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    contain?: boolean; // If true, uses object-contain instead of object-cover
    priority?: boolean; // If true, sets loading="eager"
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ src, alt, className = "", contain = false, priority = false, ...props }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
        setCurrentSrc(src);
        setIsLoading(true);
        setError(false);
    }, [src]);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setError(true);
    };

    return (
        <div className={`relative overflow-hidden bg-white/5 ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse z-0">
                     <svg className="w-8 h-8 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                     </svg>
                </div>
            )}
            
            {error ? (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-gray-500 text-xs p-2 text-center border border-white/5 z-20">
                    <span className="text-xl mb-1 opacity-50">⚠️</span>
                    <span className="opacity-50">Image Error</span>
                 </div>
            ) : (
                <img
                    src={currentSrc}
                    alt={alt}
                    className={`relative z-10 w-full h-full ${contain ? 'object-contain' : 'object-cover'}`}
                    loading={priority ? "eager" : "lazy"}
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onLoad={handleLoad}
                    onError={handleError}
                    {...props}
                />
            )}
        </div>
    );
};

export default OptimizedImage;