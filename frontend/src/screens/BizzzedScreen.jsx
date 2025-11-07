// screens/BizzzedScreen.jsx
import React, { useState } from 'react';
import Header from '../components/Header.jsx';

const BizzzedScreen = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const featuredArticles = [
    {
      id: 1,
      title: "The Future of Digital Marketing in 2024",
      excerpt: "Exploring emerging trends and technologies that are reshaping how brands connect with audiences.",
      category: "Marketing",
      author: "Sarah Chen",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      image: "bizzzed-1.jpg",
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
      image: "bizzzed-2.jpg",
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
      image: "bizzzed-3.jpg"
    },
    {
      id: 4,
      title: "The Psychology of Consumer Behavior",
      excerpt: "Understanding the cognitive processes behind purchasing decisions and brand loyalty.",
      category: "Psychology",
      author: "Dr. Michael Tan",
      date: "Dec 8, 2024",
      readTime: "7 min read",
      image: "bizzzed-4.jpg"
    },
    {
      id: 5,
      title: "Sustainable Business Practices That Actually Work",
      excerpt: "Real-world case studies of companies successfully implementing eco-friendly strategies.",
      category: "Sustainability",
      author: "Lisa Wang",
      date: "Dec 5, 2024",
      readTime: "9 min read",
      image: "bizzzed-5.jpg"
    },
    {
      id: 6,
      title: "Remote Work: The New Normal and Its Impact",
      excerpt: "Analyzing the long-term effects of remote work on productivity and company culture.",
      category: "Workplace",
      author: "James Peterson",
      date: "Dec 3, 2024",
      readTime: "5 min read",
      image: "bizzzed-6.jpg"
    },
    {
      id: 7,
      title: "Content Strategy for the Attention Economy",
      excerpt: "Creating content that captures and retains audience attention in a crowded digital space.",
      category: "Content",
      author: "Rachel Green",
      date: "Nov 30, 2024",
      readTime: "6 min read",
      image: "bizzzed-7.jpg"
    },
    {
      id: 8,
      title: "The Rise of Community-Driven Brands",
      excerpt: "How brands are building loyal communities that drive growth and innovation.",
      category: "Community",
      author: "Alex Thompson",
      date: "Nov 28, 2024",
      readTime: "8 min read",
      image: "bizzzed-8.jpg"
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
      {/* Hero Section */}
      <section className="mt-10 relative py-20 bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Magazine Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
              <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
                Business & Innovation Magazine
              </span>
            </div>

            {/* Magazine Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Bizzzed
            </h1>
            
            {/* Tagline */}
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your daily dose of business insights, marketing strategies, and innovation trends 
              that keep you ahead in the competitive landscape.
            </p>

            {/* Subscription CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Subscribe Now
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Latest Issue
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deep dives into the most pressing topics shaping today's business world
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {featuredArticles.map((article) => (
              <article 
                key={article.id}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                {/* Article Image */}
                <div className="relative h-64 bg-gradient-to-br from-[#254899] to-[#1a3480] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-4xl opacity-20">
                    📰
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#ebed17] text-[#254899] px-3 py-1 rounded-full text-sm font-bold">
                      Featured
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="bg-[#254899] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                    <span className="text-gray-500 text-sm">{article.date}</span>
                    <span className="text-gray-500 text-sm">{article.readTime}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#254899] transition-colors duration-300 leading-tight">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-sm font-bold">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-700 font-medium">{article.author}</span>
                    </div>
                    <button className="text-[#254899] hover:text-[#1a3480] font-semibold flex items-center gap-2 group">
                      Read More
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Articles Grid Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeCategory === category
                    ? 'bg-[#254899] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#254899] hover:text-[#254899]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article 
                key={article.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                {/* Article Image */}
                <div className="relative h-48 bg-gradient-to-br from-[#254899] to-[#1a3480] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl opacity-20">
                    📖
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 text-[#254899] px-2 py-1 rounded-full text-xs font-semibold">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gray-500 text-xs">{article.date}</span>
                    <span className="text-gray-500 text-xs">•</span>
                    <span className="text-gray-500 text-xs">{article.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#254899] transition-colors duration-300 leading-tight line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-[#ebed17] rounded-full flex items-center justify-center text-[#254899] text-xs font-bold">
                        {article.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{article.author}</span>
                    </div>
                    <button className="text-[#254899] hover:text-[#1a3480] text-sm font-semibold flex items-center gap-1 group">
                      Read
                      <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-[#254899] hover:bg-[#1a3480] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
              Load More Articles
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-3xl p-8 lg:p-12 text-center text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Stay Bizzzed
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get the latest business insights, trends, and strategies delivered straight to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ebed17]"
              />
              <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                Subscribe
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mt-4">
              No spam, unsubscribe at any time
            </p>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Topics
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dive deeper into specific areas of business and innovation
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.filter(cat => cat !== 'All').map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
              >
                <div className="w-12 h-12 bg-[#254899] rounded-2xl flex items-center justify-center text-white text-lg mb-3 mx-auto group-hover:bg-[#ebed17] group-hover:text-[#254899] transition-all duration-300">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#254899] transition-colors duration-300">
                  {category}
                </h3>
                <p className="text-gray-500 text-sm mt-1">12 articles</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper function to get icons for categories
const getCategoryIcon = (category) => {
  const icons = {
    Marketing: '📈',
    Branding: '🎯',
    Technology: '💻',
    Psychology: '🧠',
    Sustainability: '🌱',
    Workplace: '🏢',
    Content: '📝',
    Community: '👥'
  };
  return icons[category] || '📰';
};

export default BizzzedScreen;