// components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const brands = [
    { name: 'Puuls', path: '/puuls', description: 'the workforce you need' },
    { name: 'Uduua', path: '/uduua', description: 'make it sell' },
    { name: 'The Fruiit', path: '/thefruiit', description: 'everyday advancement' },
    { name: 'Create Institute', path: '/createinstitute', description: 'learn and grow' }
  ];

  const handleMobileLinkClick = () => {
    setIsMenuOpen(false);
    setIsBrandsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src="logo.png" 
                alt="Lovoh Create Logo" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iNDAiIGZpbGw9IiMyNTQ4OTkiLz48dGV4dCB4PSIyMCIgeT0iMjUiIGZpbGw9IiNmZmZmZmYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+TG92b2ggQ3JlYXRlPC90ZXh0Pjwvc3ZnPg==';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link 
                to='/'
                className="text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Welcome
              </Link>

              <Link
                to='/about'
                className="text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                About
              </Link>
              <Link 
                to='/services' 
                className="text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Services
              </Link>

              
              {/* Brands Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                  className="flex items-center text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Our Brands
                  <svg 
                    className={`ml-1 w-4 h-4 transition-transform duration-200 ${isBrandsOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Brands Dropdown Menu */}
                {isBrandsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    {brands.map((brand) => (
                      <Link
                        key={brand.name}
                        to={brand.path}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-l-4 border-transparent hover:border-[#254899]"
                        onClick={() => setIsBrandsOpen(false)}
                      >
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {brand.name}
                          {brand.name === 'Uduua' && (
                            <span className="text-xs bg-[#ebed17] text-[#254899] px-2 py-1 rounded-full font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link 
                to='/bizzzed' 
                className="text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Bizzzed (Magazine)
              </Link>

              <Link 
                to='/events' 
                className="text-gray-700 hover:text-[#254899] px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                Events
              </Link>

              <Link 
                to='/contact'
                className="bg-[#254899] text-white hover:bg-[#1a3480] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#254899] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#254899]"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50`}>
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to='/'
              className="text-gray-700 hover:text-[#254899] block px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-gray-100"
              onClick={handleMobileLinkClick}
            >
              Welcome
            </Link>
            <Link
              to='/about'
              className="text-gray-700 hover:text-[#254899] block px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-gray-100"
              onClick={handleMobileLinkClick}
            >
              About
            </Link>
            <Link
              to='/services'
              className="text-gray-700 hover:text-[#254899] block px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-gray-100"
              onClick={handleMobileLinkClick}
            >
              Services
            </Link>
            
            {/* Mobile Brands Accordion */}
            <div className="border-b border-gray-100">
              <button
                onClick={() => setIsBrandsOpen(!isBrandsOpen)}
                className="flex items-center justify-between w-full text-gray-700 hover:text-[#254899] px-3 py-3 text-base font-medium transition-colors duration-200"
              >
                Our Brands
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isBrandsOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isBrandsOpen && (
                <div className="bg-gray-50 ml-4 mb-2 rounded-lg">
                  {brands.map((brand) => (
                    <Link
                      key={brand.name}
                      to={brand.path}
                      className="block px-3 py-3 text-sm text-gray-600 hover:text-[#254899] hover:bg-gray-100 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                      onClick={handleMobileLinkClick}
                    >
                      <div className="font-medium flex items-center gap-2">
                        {brand.name}
                        {brand.name === 'Uduua' && (
                          <span className="text-xs bg-[#ebed17] text-[#254899] px-2 py-1 rounded-full font-bold">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{brand.description}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to='/bizzzed'
              className="text-gray-700 hover:text-[#254899] block px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-gray-100"
            >
              Bizzzed (Magazine)
            </Link>

            <Link
              to='/events'
              className="text-gray-700 hover:text-[#254899] block px-3 py-3 text-base font-medium transition-colors duration-200 border-b border-gray-100"
            >
              Events
            </Link>

            <Link
              to='/contact'
              className="bg-[#254899] text-white hover:bg-[#1a3480] block px-3 py-3 rounded-md text-base font-medium text-center transition-colors duration-200 mx-2 mt-4"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Overlay for closing dropdowns - FIXED Z-INDEX */}
      {(isBrandsOpen || isMenuOpen) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => {
            setIsBrandsOpen(false);
            setIsMenuOpen(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;