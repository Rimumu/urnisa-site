
import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../constants';

interface ImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUploadSuccess, className = "" }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Helper to resize and compress image before upload
    // This turns a 5MB PNG into a ~200KB JPEG, preventing timeouts.
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    // Maximum dimensions for web display
                    const MAX_WIDTH = 1280;
                    const MAX_HEIGHT = 1280;
                    
                    let width = img.width;
                    let height = img.height;

                    // Calculate new dimensions while maintaining aspect ratio
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        // Convert to JPEG with 0.8 quality (good balance)
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        // Remove prefix to get raw base64
                        resolve(dataUrl.split(',')[1]);
                    } else {
                        reject(new Error('Canvas context failed'));
                    }
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            // 1. Compress the image client-side
            const base64String = await compressImage(file);

            // 2. Send to Backend Proxy
            const response = await fetch(`${API_BASE_URL}/api/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64String })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // ImgBB returns the display url in data.data.url
                // data.data.url is the direct link (e.g., https://i.ibb.co/...)
                onUploadSuccess(data.data.url);
            } else {
                setError('Upload failed. ' + (data.error?.message || 'Server Error.'));
                console.error('Upload Error:', data);
            }
        } catch (err) {
            setError('Network error or timeout. Try a smaller image.');
            console.error(err);
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`flex flex-col ${className}`}>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
            
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`
                    flex items-center justify-center gap-2 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider
                    transition-all border
                    ${uploading 
                        ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed' 
                        : 'bg-brand-primary/20 text-brand-primary border-brand-primary/50 hover:bg-brand-primary hover:text-white'}
                `}
            >
                {uploading ? (
                    <>
                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Optimizing & Uploading...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload Image
                    </>
                )}
            </button>
            
            {error && <span className="text-red-400 text-[10px] mt-1 font-bold">{error}</span>}
        </div>
    );
};

export default ImageUploader;
