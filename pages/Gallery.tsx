import React, { useState, useEffect } from 'react';
import { useProfileContent } from '../hooks/useProfileContent';
import OptimizedImage from '../components/OptimizedImage';
import { motion, AnimatePresence } from 'motion/react';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const GalleryIcon = () => (
    <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
    </svg>
);

const ArtistGallerySection = ({ artist, index, setLightboxImage }: { artist: any, index: number, setLightboxImage: (img: string) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasMore = artist.images.length > 6;
    const displayedImages = hasMore && !isExpanded ? artist.images.slice(0, 5) : artist.images;

    return (
        <div 
            className="bg-black/20 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-700 fill-mode-both"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-4">
                <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-brand-primary"><GalleryIcon /></span>
                    {artist.artistLink ? (
                        <a href={artist.artistLink} target="_blank" rel="noreferrer" className="hover:text-brand-primary hover:underline transition-colors decoration-brand-primary/50 underline-offset-4">
                            {artist.artistName}
                        </a>
                    ) : (
                        artist.artistName
                    )}
                </h3>
                <span className="text-sm font-bold text-gray-400 bg-black/40 border border-white/5 px-4 py-2 rounded-full uppercase tracking-widest shadow-inner">
                    {artist.images.length} works
                </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                <AnimatePresence mode="popLayout">
                    {displayedImages.map((img: string, idx: number) => (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            key={`${img}-${idx}`} 
                            className="aspect-square rounded-2xl overflow-hidden cursor-zoom-in relative group border border-white/10 hover:border-brand-primary/50 transition-all duration-300 bg-black/40 shadow-lg hover:shadow-brand-primary/20 hover:-translate-y-1"
                            onClick={() => setLightboxImage(img)}
                        >
                            <OptimizedImage 
                                src={img} 
                                alt={`Art by ${artist.artistName}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                <span className="text-white text-xs font-bold tracking-widest bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    VIEW
                                </span>
                            </div>
                        </motion.div>
                    ))}
                    {hasMore && !isExpanded && (
                        <motion.div 
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: 5 * 0.05 }}
                            key="view-all-btn"
                            className="aspect-square rounded-2xl overflow-hidden cursor-pointer relative group border border-white/10 hover:border-brand-primary/50 transition-all duration-300 bg-brand-primary/10 hover:bg-brand-primary/20 flex flex-col items-center justify-center shadow-lg hover:-translate-y-1"
                            onClick={() => setIsExpanded(true)}
                        >
                            <span className="text-white text-2xl font-bold tracking-wider mb-2">+{artist.images.length - 5}</span>
                            <span className="text-brand-primary text-sm font-bold tracking-widest uppercase">View All</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const Gallery: React.FC = () => {
    const { artworksContent, loading } = useProfileContent();
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate total works
    const totalWorks = artworksContent.reduce((acc, artist) => acc + artist.images.length, 0);

    // Filter artists based on search query
    const filteredArtworks = artworksContent.filter(artist => 
        artist.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        if (!lightboxImage) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxImage(null);
            } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const allImages = filteredArtworks.flatMap(artist => artist.images);
                const currentIndex = allImages.indexOf(lightboxImage);
                if (currentIndex === -1) return;

                if (e.key === 'ArrowRight') {
                    const nextIndex = (currentIndex + 1) % allImages.length;
                    setLightboxImage(allImages[nextIndex]);
                } else if (e.key === 'ArrowLeft') {
                    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    setLightboxImage(allImages[prevIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage, filteredArtworks]);

    return (
        <div className="w-full font-sans">
            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div 
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center group/lightbox"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.button 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute left-6 text-white hover:text-brand-primary p-3 bg-black/40 backdrop-blur-md rounded-full transition-colors z-50 hover:bg-black/80 border border-white/10 shadow-xl opacity-0 group-hover/lightbox:opacity-100 hidden md:block"
                            onClick={(e) => {
                                e.stopPropagation();
                                const allImages = filteredArtworks.flatMap(artist => artist.images);
                                const currentIndex = allImages.indexOf(lightboxImage);
                                if (currentIndex === -1) return;
                                const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                                setLightboxImage(allImages[prevIndex]);
                            }}
                        >
                            <ChevronLeftIcon />
                        </motion.button>
                        <motion.img 
                            initial={{ scale: 0.8, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 30 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            src={lightboxImage} 
                            className="max-w-[95vw] max-h-[95vh] object-contain rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] select-none"
                            alt="Full size artwork"
                            loading="lazy"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <motion.button 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute right-6 text-white hover:text-brand-primary p-3 bg-black/40 backdrop-blur-md rounded-full transition-colors z-50 hover:bg-black/80 border border-white/10 shadow-xl opacity-0 group-hover/lightbox:opacity-100 hidden md:block"
                            onClick={(e) => {
                                e.stopPropagation();
                                const allImages = filteredArtworks.flatMap(artist => artist.images);
                                const currentIndex = allImages.indexOf(lightboxImage);
                                if (currentIndex === -1) return;
                                const nextIndex = (currentIndex + 1) % allImages.length;
                                setLightboxImage(allImages[nextIndex]);
                            }}
                        >
                            <ChevronRightIcon />
                        </motion.button>
                        <motion.button 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            className="absolute top-6 right-6 text-white hover:text-brand-primary p-3 bg-black/40 backdrop-blur-md rounded-full transition-colors z-50 hover:bg-black/80 border border-white/10 shadow-xl"
                            onClick={() => setLightboxImage(null)}
                        >
                            <CloseIcon />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="relative w-full p-8 md:p-12 lg:p-16 rounded-[3rem] overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
                    {/* Decorative floating elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                    
                    <div className="relative z-10">
                        <div className="text-center space-y-3 mb-12 animate-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter drop-shadow-2xl">
                        <span className="text-brand-primary">ART</span> <span className="text-white">GALLERY</span>
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-brand-accent/10 px-6 py-2 rounded-full border border-brand-accent/20">
                        <h2 className="text-lg md:text-xl font-bold text-brand-accent tracking-widest uppercase">Media</h2>
                    </div>
                    <p className="text-gray-400 text-sm mt-4">
                        A collection of beautiful and amazing artworks related to Nisa!
                        <br />
                        Featuring <span className="text-white font-bold">{totalWorks}</span> works from <span className="text-brand-primary font-bold">{artworksContent.length}</span> talented artists.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-16 max-w-2xl mx-auto animate-in slide-in-from-bottom-6 duration-700 delay-100">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-primary transition-colors">
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search artwork by artist name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-12 pr-12 py-4 bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all shadow-lg hover:bg-black/30"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-16">
                    {loading ? (
                        <>
                            <div className="text-center py-12 mb-8 animate-pulse">
                                <h3 className="text-2xl font-bold text-white mb-2">Loading Artwork...</h3>
                                <p className="text-gray-400">Fetching the gallery masterpieces</p>
                            </div>
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-black/20 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden animate-pulse">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-4">
                                        <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
                                        <div className="h-8 w-24 bg-white/10 rounded-full"></div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((j) => (
                                            <div key={j} className="aspect-square rounded-2xl bg-white/5 border border-white/10"></div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : filteredArtworks.length > 0 ? (
                        filteredArtworks.map((artist, index) => (
                        <ArtistGallerySection key={artist.id} artist={artist} index={index} setLightboxImage={setLightboxImage} />
                        ))
                    ) : (
                        <div className="text-center py-20 bg-black/20 backdrop-blur-md border border-white/10 rounded-[2rem] shadow-xl relative overflow-hidden">
                            <GalleryIcon />
                            <h3 className="text-2xl font-bold text-white mt-4 mb-2">No artists found</h3>
                            <p className="text-gray-400">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gallery;
