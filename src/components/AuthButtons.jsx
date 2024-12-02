import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthButtons = () => {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const handleSignOut = () => {
        setIsSignedIn(false);
        setShowDropdown(false);
    };

    const handleSignIn = () => {
        setIsSignedIn(true);
    };

    const handleSignUp = () => {
        navigate('/signup');
    };

    if (isSignedIn) {
        return (
            <div className="relative">
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center space-x-2 focus:outline-none"
                >
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">JD</span>
                    </div>
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            <p className="font-medium">John Doe</p>
                            <p className="text-gray-500">john@example.com</p>
                        </div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Your Profile
                        </button>
                        <button
                            onClick={() => navigate('/settings')}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Settings
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-gray-100"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-4">
            <button
                onClick={handleSignIn}
                className="text-gray-500 hover:text-gray-700 font-medium"
            >
                Sign in
            </button>
            <button
                onClick={handleSignUp}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-medium"
            >
                Sign up
            </button>
        </div>
    );
};

export default AuthButtons;
