import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useUser } from '../context/UserContext';
import Avatar from './Avatar';
import ProfileForm from './profile/ProfileForm';
import ConfirmDialog from './profile/ConfirmDialog';

const Profile = () => {
    const navigate = useNavigate();
    const { user, avatarUrl, loading, error: userError, updateUserData, updateAvatar } = useUser();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });

    // Auto-dismiss success message
    useEffect(() => {
        let timeoutId;
        if (successMessage) {
            timeoutId = setTimeout(() => {
                setSuccessMessage('');
            }, 3000);
        }
        return () => timeoutId && clearTimeout(timeoutId);
    }, [successMessage]);

    // Initialize form data when user data is loaded
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, [user]);

    // Initial data fetch
    useEffect(() => {
        updateUserData().catch(error => {
            if (error.code === 401) {
                navigate('/login');
            }
        });
    }, [updateUserData, navigate]);

    /*const handleAvatarUpload = async (file) => {
        try {
            setError('');
            setIsUploading(true);
            setUploadProgress(0);
            
            // Add a small delay to ensure the loading state is visible
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await updateAvatar(file);
            setSuccessMessage('Avatar updated successfully!');
        } catch (error) {
            setError('Failed to upload avatar. Please try again.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    }; */

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Name must be less than 50 characters';
        }

        if (formData.currentPassword || formData.newPassword || formData.confirmNewPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required';
            }
            if (!formData.newPassword) {
                newErrors.newPassword = 'New password is required';
            } else if (formData.newPassword.length < 8) {
                newErrors.newPassword = 'Password must be at least 8 characters';
            }
            if (!formData.confirmNewPassword) {
                newErrors.confirmNewPassword = 'Please confirm your new password';
            } else if (formData.newPassword !== formData.confirmNewPassword) {
                newErrors.confirmNewPassword = 'Passwords do not match';
            }
        }

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            const updates = {
                name: formData.name
            };

            if (formData.currentPassword) {
                updates.password = formData.newPassword;
            }

            await updateUserData(updates);
            
            // Show appropriate success message
            if (formData.currentPassword) {
                setSuccessMessage('Profile and password updated successfully!');
            } else {
                setSuccessMessage('Profile updated successfully!');
            }
            
            setIsEditing(false);
            setError('');
            setHasUnsavedChanges(false);

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (error) {
            if (error.code === 'PASSWORD_INCORRECT') {
                setError('Current password is incorrect');
            } else if (error.code === 401) {
                // Only redirect on real session expiry
                navigate('/login');
            } else {
                setError(error.message || 'Failed to update profile. Please try again.');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setHasUnsavedChanges(true);
    };

    const handleCancelClick = () => {
        if (hasUnsavedChanges) {
            setShowConfirmDialog(true);
        } else {
            setIsEditing(false);
            setFormData({
                name: user?.name || '',
                email: user?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });
            setHasUnsavedChanges(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                </div>
            </div>
        );
    }

    if (!user && !loading) {
        navigate('/login');
        return null;
    }

    if (userError) {
        return <div>Error: {userError}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {successMessage}
                </div>
            )}

            <div className="flex flex-col md:flex-row md:space-x-8">
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:space-x-16">
                        <div className="md:w-1/3 flex flex-col  items-center flex-shrink-0">
                            <Avatar size="xl" showUpdateOverlay={true} />
                        </div>
                        <div className="md:w-2/3 min-w-0">
                            <ProfileForm
                                formData={formData}
                                errors={{}}
                                isEditing={isEditing}
                                onSubmit={handleSubmit}
                                onChange={handleChange}
                                onEdit={() => setIsEditing(true)}
                                onCancel={handleCancelClick}
                                hasUnsavedChanges={hasUnsavedChanges}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={() => {
                    setIsEditing(false);
                    setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmNewPassword: ''
                    });
                    setHasUnsavedChanges(false);
                    setShowConfirmDialog(false);
                }}
                title="Discard Changes?"
                message="You have unsaved changes. Are you sure you want to discard them?"
            />
        </div>
    );
};

export default Profile;
