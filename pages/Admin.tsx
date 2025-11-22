
import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '../constants';
import { useSchedule } from '../hooks/useSchedule';
import { useProfileContent, AboutItem, CreditItem, ArtistItem } from '../hooks/useProfileContent';

// --- HELPER: GOOGLE DRIVE CONVERTER ---
// Converts standard drive sharing links to direct image URLs
const convertGoogleDriveLink = (url: string): string => {
    if (!url) return '';
    const cleanUrl = url.trim();
    
    // Check if it's a google drive link
    if (!cleanUrl.includes('drive.google.com') && !cleanUrl.includes('docs.google.com')) {
        return cleanUrl;
    }
    
    // Regex to extract the ID from various Drive URL formats
    // Matches /file/d/ID/view, /d/ID/, ?id=ID
    const idMatch = cleanUrl.match(/(?:\/file\/d\/|\/d\/|\?id=)([-\w]+)/);
    const id = idMatch ? idMatch[1] : null;
    
    if (id) {
        // Use the thumbnail endpoint with a large size (w4000) to get a high-res image.
        // This is more reliable for <img> tags than 'uc?export=view' which often triggers 
        // download headers or CORS issues.
        return `https://drive.google.com/thumbnail?id=${id}&sz=w4000`;
    }
    return cleanUrl;
};

// --- RICH TEXT EDITOR COMPONENT ---
const RichTextEditor: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        list: false
    });

    // Sync external value changes to internal ref if they differ (e.g. initial load)
    useEffect(() => {
        if (contentRef.current && contentRef.current.innerHTML !== value) {
             if (document.activeElement !== contentRef.current) {
                 contentRef.current.innerHTML = value;
             }
        }
    }, [value]);

    const exec = (command: string) => {
        document.execCommand(command, false, undefined);
        checkActiveStates();
        if (contentRef.current) onChange(contentRef.current.innerHTML);
        contentRef.current?.focus();
    };

    const checkActiveStates = () => {
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            list: document.queryCommandState('insertUnorderedList'),
        });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
        if (contentRef.current) onChange(contentRef.current.innerHTML);
    };

    return (
        <div className="w-full bg-black/20 border border-white/10 rounded-xl overflow-hidden flex flex-col h-56 group focus-within:border-brand-primary/50 transition-colors">
             <style>{`
                .editor-content ul {
                    list-style-type: disc !important;
                    padding-left: 1.5em !important;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                .editor-content li {
                    display: list-item !important;
                }
             `}</style>
             <div className="flex gap-1 p-2 bg-white/5 border-b border-white/5 select-none items-center">
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center font-bold ${activeFormats.bold ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Bold"
                >
                    B
                </button>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center italic ${activeFormats.italic ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Italic"
                >
                    I
                </button>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center underline ${activeFormats.underline ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Underline"
                >
                    U
                </button>
                <div className="w-px h-5 bg-white/10 mx-1"></div>
                <button 
                    type="button" 
                    onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} 
                    className={`p-1.5 rounded transition-all w-8 h-8 flex items-center justify-center ${activeFormats.list ? 'bg-brand-primary text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`} 
                    title="Bullet List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div
                ref={contentRef}
                className="editor-content flex-1 p-3 text-white text-sm outline-none overflow-y-auto"
                contentEditable
                onInput={(e) => {
                    onChange(e.currentTarget.innerHTML);
                    checkActiveStates();
                }}
                onKeyUp={checkActiveStates}
                onMouseUp={checkActiveStates}
                onClick={checkActiveStates}
                onPaste={handlePaste}
                suppressContentEditableWarning
                style={{ minHeight: '100px' }}
            />
        </div>
    );
};

const Admin: React.FC = () => {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState('');
    
    // Schedule State
    const { scheduleUrl: currentScheduleUrl } = useSchedule();
    const [newScheduleUrl, setNewScheduleUrl] = useState('');
    const [scheduleStatus, setScheduleStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Profile Content State
    const { aboutContent, creditsContent, artworksContent, refetch: refetchProfile } = useProfileContent();
    const [localAbout, setLocalAbout] = useState<AboutItem[]>([]);
    const [localCredits, setLocalCredits] = useState<CreditItem[]>([]);
    const [localArtworks, setLocalArtworks] = useState<ArtistItem[]>([]);
    const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Init local state when data fetches
    useEffect(() => {
        setNewScheduleUrl(currentScheduleUrl);
    }, [currentScheduleUrl]);

    useEffect(() => {
        setLocalAbout(aboutContent);
        setLocalCredits(creditsContent);
        setLocalArtworks(artworksContent);
    }, [aboutContent, creditsContent, artworksContent]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setLoginError('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setIsAuthenticated(true);
            } else {
                setLoginError('Incorrect password. Access denied.');
            }
        } catch (error) {
            setLoginError('Failed to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setScheduleStatus(null);

        // Auto-convert Google Drive links before saving
        const processedUrl = convertGoogleDriveLink(newScheduleUrl);

        try {
            const response = await fetch(`${API_BASE_URL}/api/schedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ url: processedUrl })
            });
            const data = await response.json();
            if (response.ok) {
                setScheduleStatus({ type: 'success', message: 'Schedule updated successfully!' });
                // Update local state to show the converted link
                setNewScheduleUrl(processedUrl);
            } else {
                setScheduleStatus({ type: 'error', message: data.error || 'Failed to update.' });
            }
        } catch (error) {
            setScheduleStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (type: 'about' | 'credits' | 'artworks') => {
        setLoading(true);
        setProfileStatus(null);
        let data;
        if (type === 'about') data = localAbout;
        else if (type === 'credits') data = localCredits;
        else if (type === 'artworks') data = localArtworks;

        try {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ type, data })
            });
            if (response.ok) {
                const typeLabel = type === 'artworks' ? 'Artworks' : type === 'about' ? 'About' : 'Credits';
                setProfileStatus({ type: 'success', message: `${typeLabel} saved successfully!` });
                refetchProfile();
            } else {
                setProfileStatus({ type: 'error', message: 'Failed to save.' });
            }
        } catch (error) {
            setProfileStatus({ type: 'error', message: 'Network error.' });
        } finally {
            setLoading(false);
        }
    };

    // Helper: About Content Editors
    const updateAboutItem = (index: number, field: keyof AboutItem, value: string) => {
        const updated = [...localAbout];
        updated[index] = { ...updated[index], [field]: value };
        setLocalAbout(updated);
    };
    const addAboutItem = () => {
        setLocalAbout([...localAbout, { id: Date.now().toString(), title: 'New Section', text: '' }]);
    };
    const removeAboutItem = (index: number) => {
        setLocalAbout(localAbout.filter((_, i) => i !== index));
    };

    // Helper: Credits Editors
    const updateCreditItem = (index: number, field: keyof CreditItem, value: string) => {
        const updated = [...localCredits];
        let finalValue = value;
        
        // Auto-convert Drive links for images
        if (field === 'image') {
            finalValue = convertGoogleDriveLink(value);
        }
        
        // @ts-ignore
        updated[index] = { ...updated[index], [field]: finalValue };
        setLocalCredits(updated);
    };
    const addCreditItem = () => {
        setLocalCredits([...localCredits, { id: Date.now().toString(), name: 'Name', role: 'Role', color: '#e5383b', initial: '?', link: '' }]);
    };
    const removeCreditItem = (index: number) => {
        setLocalCredits(localCredits.filter((_, i) => i !== index));
    };

    // Helper: Artworks Editors
    const addArtist = () => {
        setLocalArtworks([...localArtworks, { id: Date.now().toString(), artistName: 'New Artist', artistLink: '', images: [] }]);
    };
    const removeArtist = (index: number) => {
        setLocalArtworks(localArtworks.filter((_, i) => i !== index));
    };
    const updateArtistName = (index: number, name: string) => {
        const updated = [...localArtworks];
        updated[index].artistName = name;
        setLocalArtworks(updated);
    };
    const updateArtistLink = (index: number, link: string) => {
        const updated = [...localArtworks];
        updated[index].artistLink = link;
        setLocalArtworks(updated);
    };
    const addImageToArtist = (artistIndex: number, url: string) => {
        if (!url) return;
        // Auto-convert Drive links
        const processedUrl = convertGoogleDriveLink(url);
        
        const updated = [...localArtworks];
        updated[artistIndex].images.push(processedUrl);
        setLocalArtworks(updated);
    };
    const removeImageFromArtist = (artistIndex: number, imageIndex: number) => {
        const updated = [...localArtworks];
        updated[artistIndex].images = updated[artistIndex].images.filter((_, i) => i !== imageIndex);
        setLocalArtworks(updated);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="bg-black/30 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl w-full max-w-md">
                    <h1 className="text-3xl font-extrabold text-center mb-6 text-white">Admin <span className="text-brand-primary">Login</span></h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none" placeholder="Enter password" />
                        {loginError && <div className="text-red-400 text-sm text-center">{loginError}</div>}
                        <button type="submit" disabled={loading} className="w-full bg-brand-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-all">{loading ? 'Verifying...' : 'Access Dashboard'}</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <h1 className="text-4xl font-extrabold text-center mb-8 text-white">Admin <span className="text-brand-primary">Dashboard</span></h1>
            
            {profileStatus && (
                <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl ${profileStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white animate-in fade-in slide-in-from-right`}>
                    {profileStatus.message}
                </div>
            )}

            {/* --- SCHEDULE --- */}
            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-4 border-b border-white/10 pb-2">📅 Stream Schedule</h2>
                <form onSubmit={handleUpdateSchedule} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-400 mb-1">Image URL</label>
                        <input type="url" value={newScheduleUrl} onChange={(e) => setNewScheduleUrl(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-primary focus:outline-none font-mono text-sm" required />
                    </div>
                    {newScheduleUrl && <img src={convertGoogleDriveLink(newScheduleUrl)} alt="Preview" className="w-full h-32 object-cover rounded-lg opacity-70 border border-white/10" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                    <button type="submit" disabled={loading} className="bg-brand-primary hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-all">{loading ? 'Saving...' : 'Update Schedule'}</button>
                    {scheduleStatus && <span className={`ml-4 text-sm ${scheduleStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{scheduleStatus.message}</span>}
                </form>
            </div>

            {/* --- ABOUT ME EDITOR --- */}
            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                    <h2 className="text-2xl font-bold text-white">ℹ️ About Me Content</h2>
                    <button onClick={() => handleSaveProfile('about')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded text-sm transition-colors">Save Changes</button>
                </div>
                <div className="space-y-4">
                    {localAbout.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                            <button onClick={() => removeAboutItem(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                            <div className="mb-2">
                                <label className="text-xs text-gray-500 uppercase">Title (Optional)</label>
                                <input type="text" value={item.title} onChange={(e) => updateAboutItem(idx, 'title', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm font-bold" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase">Text Body</label>
                                <RichTextEditor value={item.text} onChange={(val) => updateAboutItem(idx, 'text', val)} />
                            </div>
                        </div>
                    ))}
                    <button onClick={addAboutItem} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Section</button>
                </div>
            </div>

            {/* --- CREDITS EDITOR --- */}
            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                    <h2 className="text-2xl font-bold text-white">⭐ Credits Content</h2>
                    <button onClick={() => handleSaveProfile('credits')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded text-sm transition-colors">Save Changes</button>
                </div>
                <div className="space-y-4">
                    {localCredits.map((item, idx) => (
                        <div key={item.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group flex gap-4 items-start">
                            <button onClick={() => removeCreditItem(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                            
                            <div className="space-y-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white border border-white/20 overflow-hidden" style={{ backgroundColor: item.color }}>
                                    {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : (item.initial || item.name.charAt(0))}
                                </div>
                                <input type="color" value={item.color} onChange={(e) => updateCreditItem(idx, 'color', e.target.value)} className="w-12 h-6 bg-transparent cursor-pointer" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" placeholder="Name" value={item.name} onChange={(e) => updateCreditItem(idx, 'name', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white text-sm font-bold" />
                                    <input type="text" placeholder="Role" value={item.role} onChange={(e) => updateCreditItem(idx, 'role', e.target.value)} className="bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-300 text-sm" />
                                </div>
                                <input type="text" placeholder="Image URL" value={item.image || ''} onChange={(e) => updateCreditItem(idx, 'image', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs font-mono" />
                                <div className="flex gap-2">
                                     <input type="text" placeholder="Link (Optional)" value={item.link || ''} onChange={(e) => updateCreditItem(idx, 'link', e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs font-mono" />
                                     <input type="text" placeholder="Initial" value={item.initial || ''} onChange={(e) => updateCreditItem(idx, 'initial', e.target.value)} className="w-20 bg-black/20 border border-white/10 rounded px-2 py-1 text-gray-400 text-xs" maxLength={2} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addCreditItem} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Credit</button>
                </div>
            </div>

            {/* --- ART GALLERY EDITOR --- */}
            <div className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                    <h2 className="text-2xl font-bold text-white">🎨 Art Gallery Editor</h2>
                    <button onClick={() => handleSaveProfile('artworks')} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-4 rounded text-sm transition-colors">Save Changes</button>
                </div>
                <div className="space-y-6">
                    {localArtworks.map((artist, artistIdx) => (
                        <div key={artist.id} className="bg-white/5 p-4 rounded-xl border border-white/5 relative group">
                             <button onClick={() => removeArtist(artistIdx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️ Delete Artist</button>
                             
                             <div className="mb-4 space-y-2">
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Artist Name</label>
                                    <input 
                                        type="text" 
                                        value={artist.artistName} 
                                        onChange={(e) => updateArtistName(artistIdx, e.target.value)} 
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white font-bold" 
                                        placeholder="Artist Name"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 uppercase">Artist Profile Link (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={artist.artistLink || ''} 
                                        onChange={(e) => updateArtistLink(artistIdx, e.target.value)} 
                                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-gray-300 text-sm font-mono" 
                                        placeholder="https://twitter.com/artist"
                                    />
                                </div>
                             </div>

                             <div className="space-y-2">
                                <label className="text-xs text-gray-500 uppercase">Artwork Images</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                                    {artist.images.map((img, imgIdx) => (
                                        <div key={imgIdx} className="relative aspect-square bg-black/30 rounded overflow-hidden group/img">
                                            <img src={img} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => removeImageFromArtist(artistIdx, imgIdx)}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-red-400 font-bold transition-opacity"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        id={`new-img-${artist.id}`}
                                        className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1 text-gray-400 text-xs font-mono"
                                        placeholder="Paste Image URL"
                                    />
                                    <button 
                                        onClick={() => {
                                            const input = document.getElementById(`new-img-${artist.id}`) as HTMLInputElement;
                                            if (input.value) {
                                                addImageToArtist(artistIdx, input.value);
                                                input.value = '';
                                            }
                                        }}
                                        className="bg-brand-primary/20 text-brand-primary px-4 rounded border border-brand-primary/50 hover:bg-brand-primary hover:text-white transition-colors text-xs font-bold"
                                    >
                                        Add Image
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                    <button onClick={addArtist} className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:border-brand-primary/50 hover:text-brand-primary transition-colors">+ Add New Artist Group</button>
                </div>
            </div>
        </div>
    );
};

export default Admin;
