import React from 'react'
import { Link } from 'react-router-dom';

const Clients = () => {
    const clients = [
        {logo: 'logo1.png'},
        {logo: 'logo2.png'},
        {logo: 'logo3.png'},
        {logo: 'logo4.png'},
        {logo: 'logo5.png'},
        {logo: 'logo6.png'},
        {logo: 'logo7.png'},
        {logo: 'logo8.png'},
        {logo: 'logo9.png'},
        {logo: 'logo10.png'},
        {logo: 'logo11.png'},
        {logo: 'logo12.png'},
        {logo: 'logo13.png'},
        {logo: 'logo14.png'},
        {logo: 'logo15.png'},
        {logo: 'logo16.png'},
        {logo: 'logo17.png'},
        {logo: 'logo18.png'},
        {logo: 'logo19.png'},
        {logo: 'logo20.png'},
        {logo: 'logo21.png'},
        {logo: 'logo22.png'}
    ]

    // Duplicate the clients array to create seamless loop
    const duplicatedClients = [...clients, ...clients];

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Our Clients
            </h1>
            <p className="text-xl text-gray-600">
                Meet some of our partners in success
            </p>
        </div>

        {/* Infinite Scrolling Logos */}
        <div className="relative overflow-hidden py-12 mb-16">
            <div className="flex animate-infinite-scroll space-x-12">
                {duplicatedClients.map((client, index) => (
                    <div 
                        key={index}
                        className="flex-shrink-0 w-32 h-32 lg:w-40 lg:h-40 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center p-4"
                    >
                        <img 
                            src={client.logo} 
                            alt="Client logo" 
                            className="w-full h-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                        />
                    </div>
                ))}
            </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Join the Family
            </h2>
            <Link 
                to="" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
                Let's Work
            </Link>
        </div>
    </div>
  )
}

export default Clients