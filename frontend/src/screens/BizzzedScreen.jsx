// screens/BizzzedScreen.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import { 
  FaChartLine, 
  FaBullseye, 
  FaLaptopCode, 
  FaBrain, 
  FaLeaf, 
  FaBuilding,
  FaPenAlt,
  FaUsers,
  FaNewspaper,
  FaBook,
  FaSearch,
  FaBolt,
  FaArrowRight,
  FaChevronLeft,
  FaChevronRight,
  FaPlayCircle,
  FaCalendar
} from 'react-icons/fa';
import Footer from '../components/Footer.jsx'

const BizzzedScreen = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const headlines = [
    "AI Revolution: Transforming Creative Industries",
    "Building Resilient Brands in Uncertain Times",
    "The Future of Digital Marketing in 2024",
    "Sustainable Business Practices That Actually Work"
  ];

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlines.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const featuredArticles = [
    {
      id: 1,
      title: "The Future of Digital Marketing in 2024",
      excerpt: "Exploring emerging trends and technologies that are reshaping how brands connect with audiences.",
      category: "Marketing",
      author: "Sarah Chen",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      image: "/now1.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Building Resilient Brands in Uncertain Times",
      excerpt: "Strategies for creating brands that can withstand market fluctuations and emerge stronger.",
      category: "Branding",
      author: "Marcus Johnson",
      date: "Dec 12, 2024",
      readTime: "6 min read",
      image: "/now2.jpg",
      featured: true
    }
  ];

  const articles = [
    {
      id: 3,
      title: "AI Revolution: Transforming Creative Industries",
      excerpt: "How artificial intelligence is augmenting human creativity in design and content creation.",
      category: "Technology",
      author: "Dr. Emily Rodriguez",
      date: "Dec 10, 2024",
      readTime: "10 min read",
      image: "/now3.jpg"
    },
    {
      id: 4,
      title: "The Psychology of Consumer Behavior",
      excerpt: "Understanding the cognitive processes behind purchasing decisions and brand loyalty.",
      category: "Psychology",
      author: "Dr. Michael Tan",
      date: "Dec 8, 2024",
      readTime: "7 min read",
      image: "/now4.jpg"
    },
    {
      id: 5,
      title: "Sustainable Business Practices That Actually Work",
      excerpt: "Real-world case studies of companies successfully implementing eco-friendly strategies.",
      category: "Sustainability",
      author: "Lisa Wang",
      date: "Dec 5, 2024",
      readTime: "9 min read",
      image: "/now1.jpg"
    },
    {
      id: 6,
      title: "Remote Work: The New Normal and Its Impact",
      excerpt: "Analyzing the long-term effects of remote work on productivity and company culture.",
      category: "Workplace",
      author: "James Peterson",
      date: "Dec 3, 2024",
      readTime: "5 min read",
      image: "/now2.jpg"
    },
    {
      id: 7,
      title: "Content Strategy for the Attention Economy",
      excerpt: "Creating content that captures and retains audience attention in a crowded digital space.",
      category: "Content",
      author: "Rachel Green",
      date: "Nov 30, 2024",
      readTime: "6 min read",
      image: "/now3.jpg"
    },
    {
      id: 8,
      title: "The Rise of Community-Driven Brands",
      excerpt: "How brands are building loyal communities that drive growth and innovation.",
      category: "Community",
      author: "Alex Thompson",
      date: "Nov 28, 2024",
      readTime: "8 min read",
      image: "/now4.jpg"
    }
  ];

  const categories = ["All", "Marketing", "Branding", "Technology", "Psychology", "Sustainability", "Workplace", "Content", "Community"];

  const allArticles = [...featuredArticles, ...articles];
  const filteredArticles = activeCategory === "All" 
    ? allArticles 
    : allArticles.filter(article => article.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* UNIQUE HERO DESIGN - Fixed for navbar spacing */}
      <section className="pt-16 h-screen relative bg-gradient-to-br from-white via-[#79FFFF]/10 to-white px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Newspaper Texture Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(30, 58, 138, 0.1) 25%, rgba(30, 58, 138, 0.1) 26%, transparent 27%, transparent 74%, rgba(30, 58, 138, 0.1) 75%, rgba(30, 58, 138, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(30, 58, 138, 0.1) 25%, rgba(30, 58, 138, 0.1) 26%, transparent 27%, transparent 74%, rgba(30, 58, 138, 0.1) 75%, rgba(30, 58, 138, 0.1) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Animated Business Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute text-[#193564]/10 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${20 + Math.random() * 60}%`,
                fontSize: `${20 + Math.random() * 30}px`,
                animationDuration: `${15 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              {['📊', '📈', '💡', '🎯', '🚀', '💼', '🌐', '📱'][i % 8]}
            </div>
          ))}
        </div>
        
        {/* Main Content Container with proper spacing */}
        <div className="relative h-full max-w-7xl mx-auto">
          <div className="h-full flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 py-4 lg:py-8">
            {/* Left Column - Main Content */}
            <div className="lg:w-2/3 space-y-4 lg:space-y-6">
              {/* Header with Date and Brand */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                  <img 
                    src="/8copy.png" 
                    alt="Bizzzed" 
                    className="h-12 sm:h-16 w-auto"
                  />
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#79FFFF] to-transparent"></div>
                  <div className="text-xs sm:text-sm text-[#193564]/80 italic max-w-xs">
                    Your pulse on business innovation
                  </div>
                </div>
                  <div className="text-xs sm:text-sm text-[#193564]/70 font-medium">
                    <FaCalendar className="inline mr-2" />
                    {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="inline-flex items-center gap-2 bg-[#193564]/10 border border-[#193564]/20 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-[#193564] rounded-full animate-pulse"></div>
                    <span className="text-[#193564] text-xs font-semibold uppercase tracking-wider">
                      A Lovoh Create Brand
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">VOL. 7, ISSUE 42</div>
                  <FaBolt className="text-[#79FFFF] text-sm" />
                </div>
              </div>
              
              {/* Main Logo and Tagline - More compact */}
              <div className="space-y-2">
                {/* <div className="flex items-center gap-3">
                  <img 
                    src="/8copy.png" 
                    alt="Bizzzed" 
                    className="h-12 sm:h-16 w-auto"
                  />
                  <div className="h-8 w-px bg-gradient-to-b from-transparent via-[#79FFFF] to-transparent"></div>
                  <div className="text-xs sm:text-sm text-[#193564]/80 italic max-w-xs">
                    Your pulse on business innovation
                  </div>
                </div> */}
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#193564] leading-tight">
                  Business &<br />
                  <span className="relative">
                    Innovation
                    <div className="absolute -bottom-1 sm:-bottom-2 left-0 w-32 sm:w-48 h-1 sm:h-2 bg-gradient-to-r from-[#79FFFF] to-transparent"></div>
                  </span>
                </h1>
              </div>
              
              {/* Rotating Headlines Section - More compact */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between border-t border-b border-[#193564]/20 py-2 sm:py-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#193564] text-white flex items-center justify-center hover:bg-[#1e40af] transition-colors text-xs"
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    <span className="text-xs sm:text-sm font-semibold text-[#193564] uppercase tracking-widest">Breaking News</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {headlines.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentHeadline(index);
                          setIsPlaying(false);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          index === currentHeadline 
                            ? 'bg-[#193564] scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Headline Display - More compact */}
                <div className="relative h-16 sm:h-20 overflow-hidden">
                  {headlines.map((headline, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentHeadline ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1">
                        {headline}
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        Exclusive insights into the latest business trends and innovations shaping 2024
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Search and CTA Section - More compact */}
              <div className="space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    placeholder="Search articles, trends, and insights..."
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#79FFFF] focus:border-transparent"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <button className="group relative bg-gradient-to-r from-[#193564] to-[#1e3a8a] hover:from-[#1e3a8a] hover:to-[#193564] text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg overflow-hidden text-sm sm:text-base">
                    <span className="relative z-10 flex items-center justify-center gap-1 sm:gap-2">
                      <FaBook className="text-xs sm:text-sm" /> Subscribe Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#79FFFF] to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </button>
                  
                  <button className="group bg-white hover:bg-gray-50 border border-[#193564] text-[#193564] hover:text-[#1e40af] px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base">
                    <FaPlayCircle className="text-xs sm:text-sm" /> Latest Podcast
                  </button>
                </div>
              </div>
              
              {/* Quick Stats - More compact */}
              {/* <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200">
                  <div className="text-sm sm:text-base font-bold text-[#193564]">500+</div>
                  <div className="text-gray-600 text-xs">Expert Articles</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200">
                  <div className="text-sm sm:text-base font-bold text-[#193564]">50K+</div>
                  <div className="text-gray-600 text-xs">Monthly Readers</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-gray-200">
                  <div className="text-sm sm:text-base font-bold text-[#193564]">24/7</div>
                  <div className="text-gray-600 text-xs">Content Updates</div>
                </div>
              </div> */}
            </div>
            
            {/* Right Column - Featured Article Previews - More compact */}
            <div className="lg:w-1/3 space-y-3 mt-4 lg:mt-0">
              <div className="text-xs sm:text-sm font-semibold text-[#193564] uppercase tracking-widest mb-1">
                Today's Featured
              </div>
              
              {featuredArticles.slice(0, 2).map((article, index) => (
                <div 
                  key={article.id}
                  className="group relative overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-28 sm:h-32 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#79FFFF] text-[#193564] px-1.5 py-0.5 rounded-full text-xs font-bold">
                        Featured
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium text-[#193564] bg-[#79FFFF]/20 px-1.5 py-0.5 rounded">
                        {article.category}
                      </span>
                      <span className="text-xs text-gray-500">{article.readTime}</span>
                    </div>
                    
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#193564] transition-colors line-clamp-2 text-sm">
                      {article.title}
                    </h3>
                    
                    <button className="text-[#193564] hover:text-[#1e40af] text-xs font-semibold flex items-center gap-1 group">
                      Read Full Story
                      <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Quick Category Navigation - More compact */}
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
                <div className="text-xs sm:text-sm font-semibold text-[#193564] mb-2">Browse Topics</div>
                <div className="grid grid-cols-2 gap-1">
                  {categories.filter(cat => cat !== 'All').slice(0, 4).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className="text-xs font-medium text-gray-700 hover:text-[#193564] hover:bg-[#79FFFF]/20 px-2 py-1 rounded transition-colors text-left"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll Indicator - Positioned properly */}
          {/* <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex flex-col items-center">
              <span className="text-[#193564] text-xs sm:text-sm mb-1 animate-pulse">Continue Reading</span>
              <div className="relative">
                <div className="w-4 h-6 sm:w-6 sm:h-10 border border-[#193564]/30 rounded-full flex justify-center">
                  <div className="w-1 h-1.5 sm:w-1.5 sm:h-1.5 bg-[#79FFFF] rounded-full absolute top-1 sm:top-2 animate-bounce"></div>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Featured Articles Section - Start immediately after hero */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Stories
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Deep dives into the most pressing topics shaping today's business world
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {featuredArticles.map((article) => (
              <article 
                key={article.id}
                className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <span className="bg-[#79FFFF] text-[#1e3a8a] px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold">
                      Featured
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <span className="bg-[#1e3a8a] text-white px-2 sm:px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">{article.date}</span>
                    <span className="text-gray-500 text-xs sm:text-sm">{article.readTime}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-[#1e3a8a] transition-colors duration-300 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#79FFFF] rounded-full flex items-center justify-center text-[#1e3a8a] text-xs sm:text-sm font-bold">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-700 text-sm sm:text-base font-medium">{article.author}</span>
                    </div>
                    <button className="text-[#1e3a8a] hover:text-[#1e40af] font-semibold text-sm sm:text-base flex items-center gap-1 sm:gap-2 group">
                      Read More
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Rest of the sections with adjusted spacing */}
      {/* Articles Grid Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-[#1e3a8a] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#1e3a8a] hover:text-[#1e3a8a]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article 
                key={article.id}
                className="group bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
              >
                <div className="relative h-40 sm:h-48 overflow-hidden">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                    <span className="bg-white/90 text-[#1e3a8a] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-gray-500 text-xs">{article.date}</span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{article.readTime}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-[#1e3a8a] transition-colors duration-300 leading-tight line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#79FFFF] rounded-full flex items-center justify-center text-[#1e3a8a] text-xs font-bold">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-700 text-xs sm:text-sm font-medium">{article.author}</span>
                    </div>
                    <button className="text-[#1e3a8a] hover:text-[#1e40af] text-xs sm:text-sm font-semibold flex items-center gap-1 group">
                      Read
                      <svg className="w-2 h-2 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <button className="bg-[#193564] hover:bg-[#1e40af] text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] rounded-xl sm:rounded-2xl lg:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              Stay Bizzzed
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Get the latest business insights, trends, and strategies delivered straight to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#79FFFF] text-sm sm:text-base"
              />
              <button className="bg-[#79FFFF] hover:bg-[#a6fffe] text-[#1e3a8a] px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm sm:text-base">
                Subscribe
              </button>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-300 mt-3 sm:mt-4">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    Marketing: <FaChartLine />,
    Branding: <FaBullseye />,
    Technology: <FaLaptopCode />,
    Psychology: <FaBrain />,
    Sustainability: <FaLeaf />,
    Workplace: <FaBuilding />,
    Content: <FaPenAlt />,
    Community: <FaUsers />
  };
  return icons[category] || <FaNewspaper />;
};

export default BizzzedScreen;