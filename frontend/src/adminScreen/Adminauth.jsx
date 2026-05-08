import React from 'react'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginMutation } from '../slices/adminApiSlice';
import { toast } from 'react-toastify';
import { setAdminCredentials } from '../slices/authslice';

const AdminSignin = () => {
    const [login, {isLoading}] = useAdminLoginMutation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { adminInfo } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        
        try {
            const res = await login({email, password}).unwrap();

            console.log('✅ Login response:', res);
            
            dispatch(setAdminCredentials(res));
            toast.success('Login Successful');
            navigate('/admin/message');
        } catch (error) {
            toast.error(error?.data?.message || error.error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Section - Writeup (Hidden on mobile, visible on desktop) */}
                <div className="hidden lg:block text-left">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                        Admin <span className="text-blue-600">Portal</span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-4">
                        Secure Access to Your Dashboard
                    </p>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Sign in to the Admin Portal to manage and view messages from users. 
                        Maintain complete control over your platform with our secure authentication system.
                    </p>
                    <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
                        <h3 className="font-semibold text-blue-800 mb-2">Security Notice</h3>
                        <p className="text-sm text-blue-600">
                            Ensure you're accessing the portal from a secure network and keep your login credentials confidential.
                        </p>
                    </div>
                </div>

                {/* Right Section - Form (Always visible) */}
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-gray-100">
                    {/* Mobile-only header */}
                    <div className="lg:hidden mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Admin <span className="text-blue-600">Portal</span>
                        </h1>
                        <p className="text-gray-500">Sign in to continue</p>
                    </div>

                    {/* Desktop form header */}
                    <div className="hidden lg:block mb-8 text-center">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Sign In</h2>
                        <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input 
                                type="email" 
                                id="email"
                                placeholder="Enter your admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input 
                                type="password" 
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                required
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing In...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            By signing in, you agree to our security policies and terms of service. 
                            Unauthorized access is strictly prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminSignin