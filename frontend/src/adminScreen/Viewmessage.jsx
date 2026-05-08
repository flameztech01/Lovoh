import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetMessageQuery } from '../slices/adminApiSlice'
import Headeradmin from '../adminComponents/Headeradmin'

const Viewmessage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { data: message, isLoading, isError } = useGetMessageQuery(id)

    const handleBack = () => {
        navigate(-1) // Go back to previous page
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Headeradmin />
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Headeradmin />
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Error loading message</h3>
                        <p className="mt-1 text-sm text-gray-500">The message could not be loaded. Please try again.</p>
                        <button
                            onClick={handleBack}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }
console.log("Message data:", message);

    if (!message) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Headeradmin />
                <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1m4 0h-4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Message not found</h3>
                        <p className="mt-1 text-sm text-gray-500">The requested message could not be found.</p>
                        <button
                            onClick={handleBack}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Headeradmin />
            <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Messages
                </button>

                {/* Message Card */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">{message.subject}</h1>
                    </div>

                    {/* Message Content */}
                    <div className="p-6">
                        {/* Sender Info */}
                        <div className="flex items-start space-x-4 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold text-lg">
                                        {message.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-lg font-semibold text-gray-900">{message.name || 'Unknown'}</h2>
                                <p className="text-gray-600">{message.email}</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Sent on {message.createdAt ? new Date(message.createdAt).toLocaleString() : 'Unknown date'}
                                </p>
                            </div>
                            <div className="flex-shrink-0">
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                                    message.read 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {message.read ? 'Read' : 'Unread'}
                                </span>
                            </div>
                        </div>

                        {/* Message Body */}
                        <div className="prose max-w-none">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Message:</h3>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {message.message}
                                </p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <span className="font-medium">Message ID:</span> {message._id}
                                </div>
                                {message.phone && (
                                    <div>
                                        <span className="font-medium">Phone:</span> {message.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Viewmessage