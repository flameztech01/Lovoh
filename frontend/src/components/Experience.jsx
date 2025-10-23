import React from 'react'
import { Link } from 'react-router-dom'

const Experience = () => {
    const experiences = [
        {text: 'Building and Construction'},
        {text: 'Tech, Media, E-Commerce'},
        {text: 'Food, Fashion, Beauty, Lifestyle'},
        {text: 'Hospitality, Travels, Logistics'},
        {text: 'Churches, Social Services, Coaching, NGOs'},
    ]
  return (
    <div className="relative z-20 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center lg:space-x-24 space-y-8 lg:space-y-0 mb-8">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900">
            Industries <span className="text-blue-600">Xperience</span>
          </h1>
          <p className="text-lg lg:text-xl text-gray-600 leading-relaxed max-w-md lg:text-left text-center">
            In our 5 years in business, we've gained results and experience crafting and executing ideas and solutions for both personal and corporate brands in these industries.
          </p>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 leading-tight">
                  {experience.text}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">
          We have helped over 50 SMEs
        </h2>
        <h1 className="text-4xl lg:text-5xl font-bold mb-8">
          It's Your Turn
        </h1>
        <Link 
          to="" 
          className="inline-block bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Slide in Our Dm
        </Link>
      </div>
    </div>
  )
}

export default Experience