import React, { useState, useRef } from 'react';
import { useUser } from '../context/UserContext';

const Avatar = ({ size = 'md', showUpdateOverlay = false }) => {
    const { user, avatarUrl, updateAvatar, loading } = useUser();
    const [localLoading, setLocalLoading] = useState(false);
    const [error, setError] = useState('');
    const [avatarError, setAvatarError] = useState(false);
    const fileInputRef = useRef(null);

    // Size classes mapping
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
        xl: 'w-40 h-40'
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setError('');
            setLocalLoading(true);
            await updateAvatar(file);
        } catch (error) {
            setError('Failed to upload avatar. Please try again.');
        } finally {
            setLocalLoading(false);
        }
    };

    const isLoading = localLoading || loading;

    return (
        <div className="relative flex-shrink-0">
            <div className={`${sizeClasses[size]} relative`}>
                {/* Base Avatar Image or Placeholder */}
                <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
                    {avatarError || !avatarUrl ? (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className={`${size === 'xl' ? 'h-20 w-20' : 'h-6 w-6'} text-gray-400`} 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                    ) : (
                        <img
                            src={avatarUrl}
                            alt={user?.name || 'User avatar'}
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                        />
                    )}
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {size === 'xl' && (
                                <span className="mt-2 text-sm text-white font-medium">Uploading...</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Update Overlay */}
                {showUpdateOverlay && !isLoading && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={isLoading}
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-opacity duration-200"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="text-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm mt-1">Change Photo</span>
                            </div>
                        </label>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-red-100 text-red-600 text-sm px-3 py-1 rounded-md whitespace-nowrap">
                    {error}
                </div>
            )}
        </div>
    );
};

export default Avatar;
