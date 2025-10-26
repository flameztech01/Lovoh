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
    <div className="relative z-20 min-h-screen bg-gradient-to-br from-[#37acf7]/10 to-[#79ffff]/10 py-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-16">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center lg:space-x-24 space-y-8 lg:space-y-0 mb-8">
          {/* Header now comes first on mobile */}
          <div className="order-1 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#3c3c4e] text-center lg:text-left">
              Industries <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004aff] to-[#2f7dcb]">Xperience</span>
            </h1>
          </div>
          
          {/* Description comes after header on mobile */}
          <div className="order-2 lg:order-2">
            <p className="text-lg lg:text-xl text-[#3c3c4e] leading-relaxed max-w-md lg:text-left text-center">
              In our 5 years in business, we've gained results and experience crafting and executing ideas and solutions for both personal and corporate brands in these industries.
            </p>
          </div>
        </div>
      </div>

      {/* Experiences Grid */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((experience, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-[#37acf7]/20"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#37acf7]/20 to-[#79ffff]/20 rounded-lg flex items-center justify-center border border-[#37acf7]/30">
                  <span className="text-[#004aff] font-bold text-lg">{index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#3c3c4e] leading-tight">
                  {experience.text}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#004aff] to-[#054889] rounded-2xl p-8 lg:p-12 text-center text-white shadow-2xl border border-[#37acf7]/30">
        <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-[#79ffff]">
          We have helped over 50 SMEs transcend.
        </h2>
        <h1 className="text-4xl lg:text-5xl font-bold mb-8">
          It's Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebed47] to-[#79ffff]">Turn</span>
        </h1>
        <Link 
          to="" 
          className="inline-block bg-white text-[#004aff] hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-[#79ffff]"
        >
          Slide in Our Dm
        </Link>
      </div>

      {/* Background Decorative Elements */}
      
    </div>
  )
}

export default Experience