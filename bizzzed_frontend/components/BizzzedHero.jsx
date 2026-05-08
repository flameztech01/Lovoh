// components/BizzzedHero.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBook, 
  FaArrowRight, 
  FaCalendar,
  FaSpinner,
  FaStar,
  FaEye,
  FaUser,
  FaChartLine,
  FaLightbulb,
  FaNewspaper,
  FaBookOpen,
  FaFileAlt
} from 'react-icons/fa';
import { useGetMagazinesQuery, useGetMagazineStatsQuery } from '../slices/magApiSlice';

const BizzzedHero = () => {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const { data: magazinesData, isLoading } = useGetMagazinesQuery({
    status: 'published',
    limit: 10
  });
  
  const { data: statsData } = useGetMagazineStatsQuery();

  const magazines = magazinesData?.magazines || [];

  const headlines = magazines.slice(0, 4).map(m => m.title) || [
    "The Future of Business Innovation",
    "Leadership Strategies for Modern Enterprises",
    "Digital Transformation Trends",
    "Sustainable Business Practices"
  ];

  const featuredMagazines = magazines.filter(m => m.isFeatured).slice(0, 2);
  const displayMagazines = featuredMagazines.length >= 2 ? featuredMagazines : magazines.slice(0, 2);

  useEffect(() => {
    if (isPlaying && headlines.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlines.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, headlines.length]);

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleSubscribe = () => {
    const newsletterSection = document.getElementById('newsletter-section');
    if (newsletterSection) {
      newsletterSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className="pt-20 pb-12 relative bg-white overflow-hidden">
        <div className="flex justify-center items-center h-[400px]">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="pt-23 pb-12 relative bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B3766]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#1B3766]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1B3766]/3 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
        {/* Top Bar */}
        <div className="flex flex-wrap justify-between items-center mb-6 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <FaCalendar className="text-[#1B3766] text-xs" />
              {formatDate()}
            </div>
          </div>
        </div>

        {/* Main Hero Layout - Two columns */}
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left Column - Content */}
          <div className="space-y-5">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#1B3766]/10 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#1B3766] rounded-full animate-pulse"></span>
              <span className="text-[10px] sm:text-xs font-semibold text-[#1B3766] uppercase tracking-wider">
                The Business & Culture Magazine
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                For the People & Businesses
                <span className="block text-[#1B3766]">
                  Shaping Culture and Innovation
                </span>
              </h1>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg">
                Spotlight stories from rising founders, industry leaders, and practical insight for real-world builders.
              </p>
            </div>

            {/* Breaking News Ticker */}
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-[10px] font-bold uppercase tracking-wider">Breaking</span>
                </div>
                <div className="flex-1 relative h-10 overflow-hidden">
                  {headlines.map((headline, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-500 ${
                        index === currentHeadline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <p className="text-white text-xs sm:text-sm font-medium leading-relaxed">
                        {headline}
                      </p>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white/60 hover:text-white transition-colors text-xs"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
              </div>
              <div className="flex gap-1 mt-2 justify-end">
                {headlines.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentHeadline(index);
                      setIsPlaying(false);
                    }}
                    className={`h-0.5 rounded-full transition-all ${
                      index === currentHeadline ? 'w-4 bg-[#1B3766]' : 'w-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              {/* Desktop: Three buttons in a row */}
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  to="/biizzed/magazines"
                  className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-all duration-300 text-sm"
                >
                  <FaBookOpen className="text-sm" />
                  View Magazines
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/biizzed/articles"
                  className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-all duration-300 text-sm"
                >
                  <FaFileAlt className="text-sm" />
                  View Articles
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <button 
                  onClick={handleSubscribe}
                  className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-lg font-semibold hover:bg-[#142952] transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  <FaBook className="text-sm" />
                  Subscribe
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Mobile: Two buttons side by side, then full-width Subscribe */}
              <div className="sm:hidden space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/biizzed/magazines"
                    className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-all duration-300 text-sm"
                  >
                    <FaBookOpen className="text-sm" />
                    Magazines
                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link
                    to="/biizzed/articles"
                    className="group flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-all duration-300 text-sm"
                  >
                    <FaFileAlt className="text-sm" />
                    Articles
                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <button 
                  onClick={handleSubscribe}
                  className="group w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3766] text-white rounded-lg font-semibold hover:bg-[#142952] transition-all duration-300 text-sm"
                >
                  <FaBook className="text-sm" />
                  Subscribe to Newsletter
                  <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100">
                <FaChartLine className="text-[#1B3766] text-xs" />
                <span className="text-xs font-medium text-gray-700">In-depth Analysis</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100">
                <FaLightbulb className="text-[#1B3766] text-xs" />
                <span className="text-xs font-medium text-gray-700">Expert Insights</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100">
                <FaNewspaper className="text-[#1B3766] text-xs" />
                <span className="text-xs font-medium text-gray-700">Weekly Editions</span>
              </div>
            </div>
          </div>

          {/* Right Column - Two Featured Magazines - Entire card is clickable */}
          <div className="grid grid-cols-2 gap-4">
            {displayMagazines.map((magazine, index) => (
              <Link
                key={magazine._id || index}
                to={`/biizzed/${magazine.slug}`}
                className="group block"
              >
                <div className="relative bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                  {/* Cover Image */}
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    {magazine.coverImage ? (
                      <img 
                        src={magazine.coverImage} 
                        alt={magazine.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/300x400/1B3766/white?text=Bizzzed';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1B3766] flex items-center justify-center">
                        <span className="text-white text-lg font-bold">Bizzzed</span>
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {magazine.isFeatured && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#1B3766] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5">
                          <FaStar className="text-[6px]" />
                          FEATURED
                        </span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-[#1B3766]/0 group-hover:bg-[#1B3766]/30 transition-all duration-300 flex items-center justify-center">
                      <span className="text-white font-semibold text-xs sm:text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 bg-[#1B3766]/80 px-4 py-2 rounded-full transform scale-90 group-hover:scale-100">
                        Read Now
                      </span>
                    </div>
                  </div>
                  
                  {/* Description under the image */}
                  <div className="p-3 bg-white">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#1B3766] transition-colors">
                      {magazine.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {magazine.summary?.substring(0, 80) || 'Discover premium insights in this edition.'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <FaUser className="text-[8px]" />
                          {magazine.author?.split(' ')[0] || 'Editor'}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <FaEye className="text-[8px]" />
                          {magazine.views || 0}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[#1B3766] font-semibold text-[10px] group-hover:gap-1.5 transition-all">
                        Read More
                        <FaArrowRight className="text-[8px]" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BizzzedHero;