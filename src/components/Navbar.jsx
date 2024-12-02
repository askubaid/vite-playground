import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import UserMenu from './UserMenu';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, loading, updateUserData } = useUser();

    useEffect(() => {
        updateUserData().catch(error => {
            console.log('Not logged in or session expired');
        });
    }, [updateUserData]);

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex items-center">
                            <span className="text-xl font-bold text-gray-800">React Playground</span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        {!loading && (
                            <>
                                {user ? (
                                    <UserMenu />
                                ) : (
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            to="/login"
                                            className="text-gray-700 hover:text-gray-900"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
