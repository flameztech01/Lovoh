// screens/UduuaServices.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ShopNavbar from '../components/ShopNavbar';
import { 
  FaStore, 
  FaBox, 
  FaTruck,
  FaHeadset,
  FaCheckCircle,
  FaArrowRight,
  FaBullhorn,
  FaWhatsapp,
  FaHandshake,
  FaEnvelope,
  FaPhone,
  FaUserPlus,
  FaMoneyBillWave,
  FaClock,
  FaChartLine,
  FaUsers,
  FaStar,
  FaTag,
  FaRocket,
  FaShieldAlt,
  FaGem,
  FaAward,
  FaInfinity,
  FaGlobe,
  FaIdCard,
  FaFileInvoice,
  FaUniversity,
  FaBuilding,
  FaMapMarkerAlt,
} from 'react-icons/fa';

const UduuaServices = () => {
  const navigate = useNavigate();
  const whatsappNumber = '2348055766461';
  const adsMessage = "Hello%2C%20I%27m%20interested%20in%20advertising%20on%20%C3%9Aduua.%20Please%20share%20your%20rates%20and%20options.";

  const handleApplySeller = () => {
    navigate('/apply/seller');
  };

  // Partner brands logos (from public folder)
  const partnerLogos = [
    { name: 'Brand 1', logo: '/logo1.png' },
    { name: 'Brand 2', logo: '/logo2.png' },
    { name: 'Brand 3', logo: '/logo3.png' },
    { name: 'Brand 4', logo: '/logo4.png' },
    { name: 'Brand 5', logo: '/logo5.png' },
    { name: 'Brand 6', logo: '/logo6.png' },
    { name: 'Brand 7', logo: '/logo7.png' },
    { name: 'Brand 8', logo: '/logo8.png' },
    { name: 'Brand 9', logo: '/logo9.png' },
    { name: 'Brand 10', logo: '/logo10.png' },
    { name: 'Brand 11', logo: '/logo11.png' },
    { name: 'Brand 12', logo: '/logo12.png' },
    { name: 'Brand 13', logo: '/logo13.png' },
    { name: 'Brand 14', logo: '/logo14.png' },
    { name: 'Brand 15', logo: '/logo15.png' },
    { name: 'Brand 16', logo: '/logo16.png' },
    { name: 'Brand 17', logo: '/logo17.png' },
    { name: 'Brand 18', logo: '/logo18.png' },
    { name: 'Brand 19', logo: '/logo19.png' },
    { name: 'Brand 20', logo: '/logo20.png' },
    { name: 'Brand 21', logo: '/logo21.png' },
    { name: 'Brand 22', logo: '/logo22.png' },
  ];

  return (
    <>
      <ShopNavbar />
      
      {/* Hero Section - Marketplace Style */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format"
          >
            <source src="https://player.vimeo.com/external/434045528.sd.mp4?s=1e3e7e6a3b6e5f8a9c6d2e0f8b4c2d8e&profile_id=164" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/50"></div>
        </div>

        <div className="absolute top-20 right-10 w-64 h-64 bg-[#0043FC]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-[#79FFFF]/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fadeInUp">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#79FFFF] rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-semibold text-white">Join Nigeria's Fastest Growing Marketplace</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight">
                Turn Your Products
                <span className="block bg-gradient-to-r from-[#79FFFF] to-[#0043FC] bg-clip-text text-transparent animate-gradient">
                  Into Profits
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-white/80 max-w-lg leading-relaxed">
                Become a seller on Úduua and reach thousands of ready buyers. 
                We provide the platform, you provide the products. Simple, fast, and rewarding.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleApplySeller}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0043FC] hover:bg-[#0038D4] text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl overflow-hidden"
                >
                  <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></span>
                  <FaUserPlus className="text-xl relative z-10" /> 
                  <span className="relative z-10">Start Selling Today</span>
                  <FaArrowRight className="text-sm relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${adsMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  <FaBullhorn /> Advertise With Us
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-6">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-[#79FFFF] text-sm animate-pulse" />
                  <span className="text-white/70 text-xs">Secure Payments via Paystack</span>
                </div>
                <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <FaRocket className="text-[#79FFFF] text-sm animate-bounce" />
                  <span className="text-white/70 text-xs">Fast Payouts (3-5 days)</span>
                </div>
                <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <FaHeadset className="text-[#79FFFF] text-sm animate-pulse" />
                  <span className="text-white/70 text-xs">Dedicated Seller Support</span>
                </div>
              </div>
            </div>

            {/* 3D Product Cards */}
            <div className="relative hidden lg:block">
              <div className="relative animate-float">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#0043FC]/20 rounded-full blur-3xl"></div>
                <div className="grid grid-cols-2 gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format"
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <p className="text-white font-semibold text-sm">Smart Watch</p>
                    <p className="text-[#79FFFF] text-xs">₦45,000</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-300 mt-8">
                    <img 
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format"
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <p className="text-white font-semibold text-sm">Headphones</p>
                    <p className="text-[#79FFFF] text-xs">₦25,000</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300">
                    <img 
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format"
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <p className="text-white font-semibold text-sm">Sneakers</p>
                    <p className="text-[#79FFFF] text-xs">₦65,000</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 transform rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-300 mt-8">
                    <img 
                      src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format"
                      alt="Product"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <p className="text-white font-semibold text-sm">Camera</p>
                    <p className="text-[#79FFFF] text-xs">₦250,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Partner Brands Carousel */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0043FC]/10 to-[#79FFFF]/10 px-4 py-2 rounded-full mb-4">
              <FaGem className="text-[#0043FC] text-sm" />
              <span className="text-sm font-semibold text-[#0043FC]">Our Partnering Brands</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Trusted by Leading Brands
            </h2>
            <p className="text-gray-500 mt-2">Join hundreds of successful businesses already selling on Úduua</p>
          </div>

          <div className="relative">
            <div className="flex overflow-hidden group">
              <div className="flex animate-marquee whitespace-nowrap gap-12 py-4">
                {[...partnerLogos, ...partnerLogos].map((brand, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-32 h-20 bg-gray-50 rounded-xl flex items-center justify-center p-4 hover:shadow-lg hover:scale-110 transition-all duration-300 grayscale hover:grayscale-0"
                  >
                    <img 
                      src={brand.logo} 
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { e.target.src = '/placeholder-logo.png'; }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With Us - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 px-4 py-2 rounded-full mb-4">
              <FaRocket className="text-[#0043FC] text-sm animate-pulse" />
              <span className="text-sm font-semibold text-[#0043FC]">Why Choose Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Everything You Need to
              <span className="text-[#0043FC]"> Succeed</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              We provide the tools, support, and audience to help your business thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FaUsers, title: "Massive Audience", desc: "Get your products in front of thousands of active shoppers actively looking to buy.", color: "from-blue-500 to-blue-600", delay: "0s" },
              { icon: FaMoneyBillWave, title: "94% Commission", desc: "Keep almost all of your earnings. Only 6% platform fee - one of the lowest in the industry.", color: "from-green-500 to-green-600", delay: "0.1s" },
              { icon: FaClock, title: "Fast Payouts", desc: "Get paid within 3-5 business days after successful delivery confirmation via Paystack.", color: "from-purple-500 to-purple-600", delay: "0.2s" },
              { icon: FaChartLine, title: "Sales Analytics", desc: "Track your performance with detailed insights and analytics dashboard.", color: "from-orange-500 to-orange-600", delay: "0.3s" },
              { icon: FaTag, title: "Bulk Pricing Tools", desc: "Set bulk discounts and tiered pricing to encourage larger orders.", color: "from-pink-500 to-pink-600", delay: "0.4s" },
              { icon: FaHeadset, title: "Dedicated Support", desc: "Our seller support team is always ready to help you succeed.", color: "from-teal-500 to-teal-600", delay: "0.5s" },
            ].map((item, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: item.delay }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="text-2xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Timeline Enhanced */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0043FC]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#79FFFF]/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
              <FaRocket className="text-green-600 text-sm animate-bounce" />
              <span className="text-sm font-semibold text-green-600">Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Get Started in
              <span className="text-[#0043FC]"> 4 Easy Steps</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              From application to your first sale - we make it simple
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Apply Online", desc: "Fill out our seller application form with your business details and documents", icon: FaUserPlus, color: "from-blue-500 to-blue-600" },
              { step: "02", title: "Get Verified", desc: "Submit required documents - CAC, ID, Proof of Address, TIN for verification within 24-48 hours", icon: FaShieldAlt, color: "from-green-500 to-green-600" },
              { step: "03", title: "Add Bank Details", desc: "Add your bank account for secure payouts via Paystack verification", icon: FaUniversity, color: "from-orange-500 to-orange-600" },
              { step: "04", title: "Start Selling", desc: "List your products and start earning 94% commission on every sale", icon: FaChartLine, color: "from-purple-500 to-purple-600" },
            ].map((item, index) => (
              <div key={index} className="group relative animate-fadeInUp" style={{ animationDelay: `${index * 0.15}s` }}>
                <div className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative z-10 border border-gray-100">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="text-3xl text-white" />
                  </div>
                  <div className="absolute -top-3 right-4 text-6xl font-bold text-gray-100 group-hover:text-gray-200 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-[#0043FC]/20 to-[#0043FC]"></div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleApplySeller}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-[#0043FC] text-white rounded-xl font-semibold text-lg hover:bg-[#0038D4] transition-all transform hover:scale-105 shadow-xl"
            >
              <FaUserPlus /> Apply Now - It's Free!
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-400 text-sm mt-4">No upfront fees • Zero risk • Free to apply</p>
          </div>
        </div>
      </section>

      {/* Required Documents Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
              <FaIdCard className="text-purple-600 text-sm animate-pulse" />
              <span className="text-sm font-semibold text-purple-600">Required Documents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              What You'll Need to
              <span className="text-[#0043FC]"> Apply</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Prepare these documents before starting your application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <FaBuilding className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Business Registration (CAC)</h3>
              <p className="text-sm text-gray-500">Certificate of incorporation or business registration document</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <FaIdCard className="text-green-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Government ID</h3>
              <p className="text-sm text-gray-500">NIN, International Passport, Driver's License, or Voter's Card</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                <FaMapMarkerAlt className="text-orange-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Proof of Address</h3>
              <p className="text-sm text-gray-500">Utility bill (electricity, water) or bank statement (not older than 3 months)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "0.3s" }}>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <FaFileInvoice className="text-purple-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Tax Identification Number (TIN)</h3>
              <p className="text-sm text-gray-500">Your business tax identification number</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                <FaUniversity className="text-pink-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Bank Account Details</h3>
              <p className="text-sm text-gray-500">Bank account for receiving payouts (verified via Paystack)</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "0.5s" }}>
              <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center mb-4">
                <FaStore className="text-cyan-600 text-xl" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Brand Assets</h3>
              <p className="text-sm text-gray-500">Brand logo and profile image (for your seller profile)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Options with Image Cards - Enhanced */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
              <FaHandshake className="text-purple-600 text-sm animate-pulse" />
              <span className="text-sm font-semibold text-purple-600">Partnership Options</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Choose Your
              <span className="text-[#0043FC]"> Success Path</span>
            </h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto text-lg">
              Two powerful ways to grow your business with Úduua
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Option 1 - Sell Products */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp">
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&auto=format"
                  alt="Sell Products"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
              </div>
              
              <div className="relative z-10 p-8 text-white">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FaStore className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sell Your Products</h3>
                <p className="text-white/80 text-sm mb-4 max-w-md">
                  Join our marketplace and start selling to thousands of ready buyers
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Easy product listing with images</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Bulk pricing and discount tools</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Sales analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Dedicated seller support</span>
                  </li>
                </ul>
                <button
                  onClick={handleApplySeller}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0043FC] rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  Apply as Seller <FaArrowRight />
                </button>
              </div>
            </div>

            {/* Option 2 - Advertise */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0">
                <img 
                  src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format"
                  alt="Advertise"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
              </div>
              
              <div className="relative z-10 p-8 text-white">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FaBullhorn className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Advertise Your Brand</h3>
                <p className="text-white/80 text-sm mb-4 max-w-md">
                  Get your brand seen by thousands of shoppers daily
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Hero banner placements on homepage</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Featured product spots</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Category page promotions</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <FaCheckCircle className="text-[#79FFFF] text-xs" />
                    <span>Email newsletter features</span>
                  </li>
                </ul>
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${adsMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#0043FC] rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  <FaWhatsapp /> Get Ad Rates <FaArrowRight />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Corrected with accurate seller info */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
              <FaHeadset className="text-purple-600 text-sm animate-bounce" />
              <span className="text-sm font-semibold text-purple-600">FAQs</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 mt-4">Everything you need to know about selling on Úduua</p>
          </div>

          <div className="space-y-4">
            {[
              { 
                q: "How much does it cost to become a seller?", 
                a: "It's completely free to apply and become a seller. There are no upfront fees or subscription costs. You only pay a 6% commission when you make a sale." 
              },
              { 
                q: "What documents do I need to apply?", 
                a: "You'll need: Business Registration (CAC certificate), Government-issued ID (NIN, Passport, Driver's License, or Voter's Card), Proof of Address (utility bill or bank statement), Tax Identification Number (TIN), Brand Logo, and Profile Image." 
              },
              { 
                q: "How do I get paid?", 
                a: "Earnings are paid directly to your verified bank account via Paystack within 3-5 business days after the customer confirms delivery. You can track all your payouts in your seller dashboard." 
              },
              { 
                q: "How long does approval take?", 
                a: "Our team reviews applications within 24-48 hours. Once approved, you'll receive an email notification and can start listing products immediately." 
              },
              { 
                q: "Do I need to handle delivery?", 
                a: "Yes, sellers are responsible for delivering products to customers. You can use any courier service of your choice. We provide guidance on best delivery practices to ensure customer satisfaction." 
              },
              { 
                q: "What happens after I submit my application?", 
                a: "Your application will be reviewed by our team. You'll receive email updates about your application status. If approved, you'll get access to your seller dashboard where you can start listing products." 
              },
              { 
                q: "Is my bank information secure?", 
                a: "Yes! We use Paystack, a secure payment gateway, to verify and store your bank details. All information is encrypted and protected." 
              },
            ].map((faq, index) => (
              <details 
                key={index} 
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <summary className="flex justify-between items-center cursor-pointer p-5 list-none">
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <span className="text-[#0043FC] group-open:rotate-180 transition-transform duration-300">▼</span>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a 
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all transform hover:scale-105"
              >
                <FaWhatsapp /> WhatsApp Support
              </a>
              <a 
                href="mailto:sellers@uduua.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 transition-all transform hover:scale-105"
              >
                <FaEnvelope /> sellers@uduua.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Bold Banner Enhanced */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&auto=format"
            alt="CTA"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0043FC] to-[#0038D4] opacity-95"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-pulse">
            <FaRocket className="text-white text-sm" />
            <span className="text-white text-sm font-semibold">Limited Time Offer</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fadeInUp">
            Ready to Start Your Selling Journey?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            Join thousands of successful sellers on Úduua. No upfront fees, no hidden costs.
          </p>
          <button
            onClick={handleApplySeller}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0043FC] rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl animate-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            <FaUserPlus /> Apply as Seller Now
            <FaArrowRight />
          </button>
          <p className="text-white/60 text-sm mt-6 animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
            Free to apply • 94% commission rate • Fast payouts via Paystack
          </p>
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
};

export default UduuaServices;