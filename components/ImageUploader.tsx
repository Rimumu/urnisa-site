
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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (ImgBB Limit is 32MB, but let's limit to 8MB for Base64 sanity)
        if (file.size > 8 * 1024 * 1024) {
            setError('File too large. Max 8MB.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // 1. Convert file to Base64
            const base64String = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove the "data:image/png;base64," prefix
                    const base64 = result.split(',')[1]; 
                    resolve(base64);
                };
                reader.onerror = error => reject(error);
            });

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
                onUploadSuccess(data.data.url);
            } else {
                setError('Upload failed. ' + (data.error?.message || 'Server Error.'));
                console.error('Upload Error:', data);
            }
        } catch (err) {
            setError('Network error during upload.');
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
                        Uploading...
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
