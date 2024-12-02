import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { account, storage } from '../appwrite/config';
import { ID } from 'appwrite';

const UserContext = createContext();

const AVATAR_BUCKET_ID = import.meta.env.VITE_AVATAR_BUCKET_ID;


export const UserProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        user: null,
        avatarUrl: '',
        loading: true,
        error: null,
        isAuthenticated: false
    });

    const getAvatarUrl = useCallback((avatarId) => {
       if (!avatarId) {
            return null;
        }
        try {
            return storage.getFileView(AVATAR_BUCKET_ID, avatarId);
        } catch (error) {
            console.error('Error generating avatar URL:', error);
            return null;
        }
    }, []);

    const updateUserData = useCallback(async (updates = null) => {
        try {
            // If updates are provided, update the user data first
            if (updates) {
                // Handle password update separately due to different error handling needs
                if (updates.password) {
                    try {
                        await account.updatePassword(updates.password);
                    } catch (error) {
                        if (error.code === 401 && error.message.includes('Invalid credentials')) {
                            const passwordError = new Error('Current password is incorrect');
                            passwordError.code = 'PASSWORD_INCORRECT';
                            throw passwordError;
                        }
                        throw error;
                    }
                }

                // Handle other updates
                if (updates.name) {
                    await account.updateName(updates.name);
                }
                if (updates.prefs) {
                    await account.updatePrefs(updates.prefs);
                }
            }

            // Then fetch the latest user data
            const accountDetails = await account.get();
            
            let avatarUrl = '';
            if (accountDetails.prefs?.avatarId) {
                const generatedUrl = getAvatarUrl(accountDetails.prefs.avatarId);
                if (generatedUrl) {
                    avatarUrl = generatedUrl;
                }
            } else if (accountDetails.prefs?.avatarUrl) {
                avatarUrl = accountDetails.prefs.avatarUrl;
            }
            
            setUserData(prev => ({
                ...prev,
                user: accountDetails,
                avatarUrl,
                loading: false,
                error: null,
                isAuthenticated: true
            }));
            
            return { accountDetails, avatarUrl };
        } catch (error) {
            // Check if it's a password verification error
            if (error.code === 'PASSWORD_INCORRECT') {
                setUserData(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
                throw error;
            }
            
            // Check if it's a real session expiry
            if (error.code === 401) {
                setUserData({
                    user: null,
                    avatarUrl: '',
                    loading: false,
                    error: null,
                    isAuthenticated: false
                });
                throw error;
            }
            
            // For other errors, preserve user data
            setUserData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            throw error;
        }
    }, [getAvatarUrl]);

    // Initialize user session check
    useEffect(() => {
        const checkSession = async () => {
            try {
                await updateUserData();
            } catch (error) {
                // If there's no session, just set loading to false
                if (error.code === 401) {
                    setUserData(prev => ({
                        ...prev,
                        loading: false,
                        isAuthenticated: false
                    }));
                }
            }
        };
        checkSession();
    }, [updateUserData]);

    const login = useCallback(async (email, password) => {
        try {
            setUserData(prev => ({ ...prev, loading: true, error: null }));
            await account.createEmailPasswordSession(email, password);
            await updateUserData();
        } catch (error) {
            setUserData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            throw error;
        }
    }, [updateUserData]);

    const logout = useCallback(async () => {
        try {
            setUserData(prev => ({ ...prev, loading: true, error: null }));
            await account.deleteSession('current');
            setUserData({
                user: null,
                avatarUrl: '',
                loading: false,
                error: null,
                isAuthenticated: false
            });
        } catch (error) {
            setUserData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            throw error;
        }
    }, []);

    const updateAvatar = useCallback(async (file) => {
        if (!AVATAR_BUCKET_ID) {
            throw new Error('Avatar bucket ID not configured');
        }

        try {
            // Upload the new avatar file
            const uploadedFile = await storage.createFile(
                AVATAR_BUCKET_ID,
                ID.unique(),
                file
            );

            // Update user preferences with the new avatar ID
            await account.updatePrefs({
                ...userData.user.prefs,
                avatarId: uploadedFile.$id
            });

            // Update local user data
            await updateUserData();
        } catch (error) {
            console.error('Error updating avatar:', error);
            throw error;
        }
    }, [userData.user?.prefs, updateUserData]);

    const value = {
        ...userData,
        updateUserData,
        updateAvatar,
        login,
        logout
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
