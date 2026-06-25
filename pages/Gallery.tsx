import React, { useState } from 'react';
import { useProfileContent } from '../hooks/useProfileContent';
import OptimizedImage from '../components/OptimizedImage';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

const Gallery: React.FC = () => {
    const { artworksContent } = useProfileContent();
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate total works
    const totalWorks = artworksContent.reduce((acc, artist) => acc + artist.images.length, 0);

    // Filter artists based on search query
    const filteredArtworks = artworksContent.filter(artist => 
        artist.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-brand-bg text-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Lightbox */}
            {lightboxImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setLightboxImage(null)}
                >
                    <img 
                        src={lightboxImage} 
                        className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl select-none"
                        alt="Full size artwork"
                        loading="lazy"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                        className="absolute top-4 right-4 text-white/70 hover:text-brand-primary p-3 bg-black/50 rounded-full transition-colors z-50 hover:bg-black/80"
                        onClick={() => setLightboxImage(null)}
                    >
                        <CloseIcon />
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
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
                            className="block w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all shadow-lg hover:bg-white/10"
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
                    {filteredArtworks.length > 0 ? (
                        filteredArtworks.map((artist, index) => (
                            <div 
                                key={artist.id} 
                                className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-[30px] border border-white/10 shadow-xl animate-in slide-in-from-bottom-8 duration-700 fill-mode-both"
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
                                    {artist.images.map((img, idx) => (
                                        <div 
                                            key={idx} 
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
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-[30px] border border-white/10">
                            <GalleryIcon />
                            <h3 className="text-2xl font-bold text-white mt-4 mb-2">No artists found</h3>
                            <p className="text-gray-400">Try adjusting your search query.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gallery;
