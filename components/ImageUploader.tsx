import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../constants';

interface ImageUploaderProps {
    onUploadSuccess: (url: string) => void;
    className?: string;
    allowedTypes?: string[]; // e.g. ['image/*', 'video/*']
    initialUrl?: string;
    dropzoneClassName?: string;
    compact?: boolean;
    alwaysShowIcon?: boolean;
    hidePreview?: boolean;
    multiple?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onUploadSuccess, 
    className = "",
    allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'],
    initialUrl,
    dropzoneClassName = "",
    compact = false,
    alwaysShowIcon = false,
    hidePreview = false,
    multiple = false
}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Synchronize initialUrl with previewUrl
    useEffect(() => {
        if (initialUrl) {
            setPreviewUrl(initialUrl);
        } else {
            setPreviewUrl(null);
        }
    }, [initialUrl]);

    // Clean up object URL previews on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (multiple) {
                validateAndUploadMultiple(Array.from(e.dataTransfer.files));
            } else {
                validateAndUpload(e.dataTransfer.files[0]);
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (multiple) {
                validateAndUploadMultiple(Array.from(e.target.files));
            } else {
                validateAndUpload(e.target.files[0]);
            }
        }
    };

    const validateAndUploadMultiple = async (files: File[]) => {
        setError('');
        setProgress(0);
        setFileInfo(null);

        // Filter valid files
        const validFiles: File[] = [];
        for (const file of files) {
            const isTypeAllowed = allowedTypes.some(type => {
                if (type.endsWith('/*')) {
                    const baseType = type.split('/')[0];
                    return file.type.startsWith(baseType + '/');
                }
                return file.type === type;
            });

            if (!isTypeAllowed) {
                setError(`Unsupported file type: ${file.name}`);
                continue;
            }

            const MAX_SIZE_MB = 50;
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setError(`File is too large (${formatBytes(file.size)}). Max allowed is ${MAX_SIZE_MB}MB.`);
                continue;
            }

            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        setUploading(true);
        let completed = 0;
        const total = validFiles.length;

        // Perform uploads concurrently
        const uploadPromises = validFiles.map((file) => {
            return new Promise<string>((resolve, reject) => {
                const formData = new FormData();
                formData.append('file', file);

                const xhr = new XMLHttpRequest();
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            const url = data.url || data.data?.url;
                            if (url) {
                                onUploadSuccess(url);
                                resolve(url);
                            } else {
                                reject(new Error('Invalid response'));
                            }
                        } catch {
                            reject(new Error('Parse error'));
                        }
                    } else {
                        reject(new Error('Upload failed'));
                    }
                });

                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.open('POST', `${API_BASE_URL}/api/upload`);
                
                const adminPass = localStorage.getItem('admin_password');
                if (adminPass) {
                    xhr.setRequestHeader('Authorization', adminPass);
                }
                
                xhr.send(formData);
            }).then(() => {
                completed++;
                setProgress(Math.round((completed / total) * 100));
            }).catch((err) => {
                setError(`Some uploads failed.`);
            });
        });

        await Promise.all(uploadPromises);
        setUploading(false);
    };

    const validateAndUpload = async (file: File) => {
        setError('');
        setProgress(0);
        setFileInfo(null);

        // Revoke previous preview
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        // Validate File Type
        const isTypeAllowed = allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(baseType + '/');
            }
            return file.type === type;
        });

        if (!isTypeAllowed) {
            setError(`Unsupported file type: ${file.name}. Please upload PNG, JPG, GIF, WEBP, or MP4/WebM videos.`);
            return;
        }

        // Validate File Size (Let's set a maximum of 50MB for Supabase Storage)
        const MAX_SIZE_MB = 50;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File is too large (${formatBytes(file.size)}). Max allowed is ${MAX_SIZE_MB}MB.`);
            return;
        }

        // Create local preview and capture info
        setFileInfo({
            name: file.name,
            size: formatBytes(file.size),
            type: file.type
        });
        
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
            setPreviewUrl(URL.createObjectURL(file));
        }

        // Proceed to upload raw file using FormData to keep original quality (including transparency/GIF frames/video tracks)
        uploadFile(file);
    };

    const uploadFile = (file: File) => {
        setUploading(true);
        
        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentage = Math.round((e.loaded * 100) / e.total);
                setProgress(percentage);
            }
        });

        // Track upload completion
        xhr.addEventListener('load', () => {
            setUploading(false);
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.success && data.url) {
                        onUploadSuccess(data.url);
                        setProgress(100);
                    } else if (data.success && data.data?.url) {
                        onUploadSuccess(data.data.url);
                        setProgress(100);
                    } else {
                        setError(data.error?.message || data.error || 'Upload failed. Invalid response from server.');
                    }
                } catch (e) {
                    setError('Failed to parse server response.');
                }
            } else {
                try {
                    const data = JSON.parse(xhr.responseText);
                    setError(data.error || 'Upload failed. Server responded with error.');
                } catch {
                    setError(`Upload failed with status code ${xhr.status}.`);
                }
            }
        });

        xhr.addEventListener('error', () => {
            setUploading(false);
            setError('Network error or server connection refused.');
        });

        xhr.open('POST', `${API_BASE_URL}/api/upload`);
        
        // If your server needs authorization tokens, they can be set here:
        const adminPass = localStorage.getItem('admin_password');
        if (adminPass) {
            xhr.setRequestHeader('Authorization', adminPass);
        }

        xhr.send(formData);
    };

    const isVideo = fileInfo?.type.startsWith('video/') || (previewUrl && previewUrl.match(/\.(mp4|webm)(\?.*)?$/i)) || false;

    if (compact) {
        return (
            <div className={`relative ${className}`} id="supabase-uploader-compact">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept={allowedTypes.join(',')}
                    multiple={multiple}
                />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        w-10 h-10 rounded-xl border flex items-center justify-center 
                        transition-all duration-300 relative overflow-hidden group/compact shrink-0
                        ${uploading ? 'bg-brand-primary/10 border-brand-primary/30 cursor-wait' : 'bg-black/40 hover:bg-white/10'}
                        ${error ? 'border-red-500/50 hover:border-red-500' : 'border-white/10 hover:border-brand-primary/40'}
                    `}
                    title={error ? `Error: ${error}` : uploading ? `Uploading... ${progress}%` : "Upload Image"}
                >
                    {previewUrl && !alwaysShowIcon ? (
                        isVideo || previewUrl.match(/\.(mp4|webm)(\?.*)?$/i) ? (
                            <video src={previewUrl} className="w-full h-full object-cover rounded-lg group-hover/compact:opacity-40 transition-opacity" autoPlay loop muted playsInline />
                        ) : (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg group-hover/compact:opacity-40 transition-opacity" />
                        )
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${uploading ? 'text-brand-primary animate-pulse' : 'text-brand-primary group-hover/compact:text-red-400 transition-colors'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-[10px] font-mono font-black text-brand-primary">{progress}%</span>
                        </div>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-4 ${className}`} id="supabase-uploader-container">
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept={allowedTypes.join(',')}
                multiple={multiple}
            />
            
            {/* Drag and Drop Zone */}
            <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer
                    transition-all duration-300 ${dropzoneClassName || 'min-h-[160px]'} text-center overflow-hidden group
                    ${dragActive 
                        ? 'border-brand-primary bg-brand-primary/10 scale-[0.98]' 
                        : 'border-white/10 bg-white/5 hover:border-brand-primary/40 hover:bg-white/10'}
                    ${uploading ? 'pointer-events-none opacity-80' : ''}
                `}
                id="uploader-dropzone"
            >
                {previewUrl && !hidePreview ? (
                    <div className="absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-black/40">
                        {isVideo ? (
                            <video 
                                src={previewUrl} 
                                className="w-full h-full object-contain" 
                                autoPlay 
                                loop 
                                muted 
                                playsInline 
                            />
                        ) : (
                            /* Grid background for transparency checking */
                            <div 
                                className="w-full h-full bg-cover bg-center flex items-center justify-center relative"
                                style={{
                                    backgroundImage: `url(${previewUrl})`,
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            >
                                {/* Checkered pattern indicating transparency in background */}
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,#222_25%,transparent_25%),linear-gradient(-45deg,#222_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#222_75%),linear-gradient(-45deg,transparent_75%,#222_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] opacity-30 -z-10"></div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <span className="text-white text-xs font-bold uppercase bg-brand-primary py-1.5 px-3 rounded-full">Replace File</span>
                            {fileInfo && (
                                <span className="text-gray-300 text-[10px] font-mono px-2 bg-black/60 rounded py-0.5">
                                    {fileInfo.name} ({fileInfo.size})
                                </span>
                            )}
                        </div>
                    </div>
                ) : null}

                {/* Content Overlay */}
                <div className={`flex flex-col items-center justify-center gap-3 transition-opacity duration-300 ${(previewUrl && !hidePreview) ? 'opacity-0 hover:opacity-100 z-10' : 'opacity-100'}`}>
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white">Drag & drop files here, or <span className="text-brand-primary">browse</span></p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold">Supports PNG, JPG, WebP, high-quality GIF & Videos up to 50MB</p>
                    </div>
                </div>
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
                <div className="w-full bg-white/5 border border-white/10 rounded-full h-4 overflow-hidden p-0.5 relative flex items-center justify-center shadow-inner" id="upload-progress-bar">
                    <div 
                        className="bg-brand-primary h-full rounded-full transition-all duration-300 ease-out absolute left-0 top-0 shadow-[0_0_10px_rgba(229,56,59,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                    <span className="text-[10px] font-black text-white z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-mono">{progress}%</span>
                </div>
            )}

            {fileInfo && !uploading && !error && (
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-2xl p-3 text-xs text-gray-300">
                    <div className="flex-1 overflow-hidden">
                        <p className="font-bold truncate text-white">{fileInfo.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{fileInfo.size} • {fileInfo.type}</p>
                    </div>
                    <div className="text-green-400 bg-green-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
                        Ready
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
