import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#054889] to-[#3c3c4e] text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 bg-[#79ffff] rounded-full animate-pulse"></div>
              <h3 className="text-2xl font-bold text-[#79ffff]">Lovoh Create</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              A dynamic Brand Marketing & Tech Agency, capitalizing on the power of vision, strategy, 
              cutting-edge creativity, and technology to develop and deploy effective ideas and solutions 
              for forward-thinking businesses.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#37acf7] rounded-full"></div>
                <span>Brand Partner</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#ebed47] rounded-full"></div>
                <span>Since 2019</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#79ffff]">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-[#37acf7] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-[#37acf7] transition-colors duration-300">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/work" className="text-gray-300 hover:text-[#37acf7] transition-colors duration-300">
                  Our Work
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-[#37acf7] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-[#37acf7] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-[#79ffff]">Get In Touch</h4>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 mt-1 text-[#37acf7]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm">3, Amode Close, Ikeja, Lagos, Nigeria</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-[#79ffff]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm">growth@lovohcreate.com</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 text-[#ebed47]">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-sm">+2347059585905</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#37acf7]/20 rounded-full flex items-center justify-center border border-[#37acf7]/30 hover:bg-[#37acf7]/30 transition-all duration-300">
                <span className="text-[#37acf7] text-sm">in</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#79ffff]/20 rounded-full flex items-center justify-center border border-[#79ffff]/30 hover:bg-[#79ffff]/30 transition-all duration-300">
                <span className="text-[#79ffff] text-sm">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#ebed47]/20 rounded-full flex items-center justify-center border border-[#ebed47]/30 hover:bg-[#ebed47]/30 transition-all duration-300">
                <span className="text-[#ebed47] text-sm">ig</span>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2f7dcb]/20 rounded-full flex items-center justify-center border border-[#2f7dcb]/30 hover:bg-[#2f7dcb]/30 transition-all duration-300">
                <span className="text-[#2f7dcb] text-sm">t</span>
              </a>
            </div>
          </div>
        </div>

        {/* Services Preview */}
        <div className="border-t border-[#37acf7]/30 pt-8 mb-8">
          <h4 className="text-lg font-semibold mb-6 text-center text-[#79ffff]">Our Services</h4>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {[
              'Brand Development', 'Strategy', 'Design', 'Digital Media', 
              'Marketing', 'Communications', 'Web Development', 'App Development'
            ].map((service, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-white/5 rounded-full border border-[#37acf7]/20 text-gray-300 hover:bg-[#37acf7]/10 hover:border-[#37acf7]/40 transition-all duration-300"
              >
                {service}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#37acf7]/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Lovoh Create. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <span className="text-[#37acf7] font-semibold">Your Brand Partner</span>
            <div className="w-1 h-1 bg-[#79ffff] rounded-full"></div>
            <span>150+ Projects Completed</span>
            <div className="w-1 h-1 bg-[#ebed47] rounded-full"></div>
            <span>98% Success Rate</span>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      
    </footer>
  )
}

export default Footer