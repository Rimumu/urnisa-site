
import { useState, useEffect } from 'react';
import { API_BASE_URL, DEFAULT_ABOUT_CONTENT, DEFAULT_CREDITS_CONTENT, DEFAULT_ARTWORKS_CONTENT } from '../constants';

export interface AboutItem {
    id: string;
    title: string;
    text: string;
}

export interface CreditItem {
    id: string;
    name: string;
    role: string;
    image?: string;
    color?: string;
    initial?: string;
    link?: string;
}

export interface ArtistItem {
    id: string;
    artistName: string;
    artistLink?: string;
    images: string[];
}

export const useProfileContent = () => {
    const [aboutContent, setAboutContent] = useState<AboutItem[]>(DEFAULT_ABOUT_CONTENT);
    const [creditsContent, setCreditsContent] = useState<CreditItem[]>(DEFAULT_CREDITS_CONTENT);
    const [artworksContent, setArtworksContent] = useState<ArtistItem[]>(DEFAULT_ARTWORKS_CONTENT);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`);
            if (response.ok) {
                const data = await response.json();
                // Only update if data exists, otherwise fall back to defaults
                if (data.about && data.about.length > 0) setAboutContent(data.about);
                if (data.credits && data.credits.length > 0) setCreditsContent(data.credits);
                if (data.artworks && data.artworks.length > 0) setArtworksContent(data.artworks);
            }
        } catch (error) {
            console.error("Failed to fetch profile content", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Return refetch function for admin updates
    return { aboutContent, creditsContent, artworksContent, loading, refetch: fetchData };
};
