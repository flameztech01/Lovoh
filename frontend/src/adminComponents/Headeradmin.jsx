import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAdminLogoutMutation } from '../slices/adminApiSlice';
import { toast } from 'react-toastify';
import { logout } from '../slices/authslice';

const Headeradmin = () => {
    const { adminInfo } = useSelector((state) => state.auth);
    const [logoutApiCall] = useAdminLogoutMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const logoutHandler = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/admin/login');
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error('Error Logging out');
        }
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    return (
        <div className="fixed w-full bg-white shadow-lg border-b border-gray-200">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <img 
                            src="../public/logo.png" 
                            alt="Logo" 
                            className="h-8 w-auto"
                        />
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center space-x-4">
                            <p className="text-gray-700 font-medium">
                                Welcome, {adminInfo?.username}
                            </p>
                            <button 
                                onClick={logoutHandler}
                                className="bg-blue-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger icon */}
                            <svg 
                                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {/* Close icon */}
                            <svg 
                                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-gray-200`}>
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <div className="px-3 py-2 text-gray-700 font-medium border-b border-gray-100">
                            Welcome, {adminInfo?.name}
                        </div>
                        <button
                            onClick={logoutHandler}
                            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md font-medium transition-colors duration-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    )
}

export default Headeradmin