// screens/UduuaServices.jsx
import React from 'react';
import ShopNavbar from '../components/ShopNavbar';
import { 
  FaRocket, 
  FaStore, 
  FaChartLine, 
  FaUsers, 
  FaBox, 
  FaTruck,
  FaHeadset,
  FaCheckCircle,
  FaArrowRight,
  FaBullhorn,
  FaWhatsapp,
  FaHandshake,
  FaEnvelope,
  FaPhone
} from 'react-icons/fa';

const UduuaServices = () => {
  const whatsappNumber = '2348055766461';
  const partnershipMessage = "Hello%2C%20I%27m%20interested%20in%20a%20partnership%20with%20%C3%9Aduua.%20I%27d%20like%20to%20discuss%20selling%20my%20products%20or%20advertising.";
  const adsMessage = "Hello%2C%20I%27m%20interested%20in%20advertising%20on%20%C3%9Aduua.%20Please%20share%20your%20rates%20and%20options.";

  return (
    <>
      <ShopNavbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] bg-white overflow-hidden pt-20 sm:pt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-10 -left-20 w-72 h-72 rounded-full bg-[#0043FC]/5 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-[#79FFFF]/10 blur-3xl"></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(#0043FC 1px, transparent 1px), linear-gradient(90deg, #0043FC 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 border border-[#0043FC]/20 px-4 py-2 rounded-full">
                <span className="w-2 h-2 bg-[#0043FC] rounded-full animate-pulse"></span>
                <span className="text-xs sm:text-sm font-semibold text-[#0043FC]">Partner with Úduua</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Grow Your Brand
                  <span className="block text-[#0043FC]">With Úduua</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-md leading-relaxed">
                  Partner with us to showcase your products to ready buyers. We handle the selling while you focus on what you do best.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${partnershipMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <FaWhatsapp className="text-lg" /> Message for Partnership
                </a>
                
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${adsMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0043FC] text-[#0043FC] hover:text-[#0043FC] px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <FaBullhorn /> Advertise with Us
                </a>
              </div>
            </div>

            {/* Right Content - Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#0043FC] to-[#0038D4] rounded-2xl p-5 text-white shadow-xl">
                <FaBox className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-1">Sell With Us</h3>
                <p className="text-white/80 text-xs">We list and sell your products to our active buyer network</p>
              </div>
              <div className="bg-gradient-to-br from-[#79FFFF] to-[#00D4D4] rounded-2xl p-5 text-gray-900 shadow-xl">
                <FaBullhorn className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-1">Advertise</h3>
                <p className="text-gray-700 text-xs">Get your brand seen by thousands of shoppers</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white shadow-xl">
                <FaHandshake className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-1">Partnership</h3>
                <p className="text-white/80 text-xs">Collaborate with us for mutual growth</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-5 text-white shadow-xl">
                <FaTruck className="text-2xl mb-3" />
                <h3 className="font-bold text-lg mb-1">We Fulfill</h3>
                <p className="text-white/80 text-xs">We handle storage, delivery, and customer support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strip 1 - How Partnership Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How Partnership Works</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Simple steps to start selling your products on Úduua
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-[#0043FC] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                  1
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -z-10"></div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Reach Out</h3>
              <p className="text-gray-600 text-sm">
                Message us on WhatsApp about your products or brand. We'll respond within hours.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 mx-auto bg-[#0043FC] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                  2
                </div>
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -z-10"></div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Send Products</h3>
              <p className="text-gray-600 text-sm">
                Share your product details and images. We'll review and get everything ready for listing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-[#0043FC] rounded-full flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Start Earning</h3>
              <p className="text-gray-600 text-sm">
                We list your products, handle sales and delivery, and you receive your earnings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Strip 2 - Partnership Options */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Partnership Options</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Choose how you want to work with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Option 1 - Sell Products */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <FaStore className="text-green-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Sell Your Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send us your products and we'll list them on Úduua. We handle:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Product photography and listing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Storage and inventory management</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Order processing and delivery</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Customer support and returns</span>
                </li>
              </ul>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${partnershipMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                <FaWhatsapp /> Message to Start Selling <FaArrowRight className="text-xs" />
              </a>
            </div>

            {/* Option 2 - Advertise */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <FaBullhorn className="text-blue-600 text-xl" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Advertise Your Brand</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get your brand in front of our active shoppers. We offer:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Hero banner placements</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Featured product spots</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Category page promotions</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-600">
                  <FaCheckCircle className="text-green-500 text-xs mt-1" />
                  <span>Newsletter features</span>
                </li>
              </ul>
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${adsMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0043FC] font-semibold hover:text-[#0033cc] transition-colors"
              >
                <FaBullhorn /> Message for Ad Rates <FaArrowRight className="text-xs" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 text-lg mb-1">Ready to partner with Úduua?</h3>
              <p className="text-gray-500 text-sm">Reach out to our partnerships team today</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href={`https://wa.me/${whatsappNumber}?text=${partnershipMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
              >
                <FaWhatsapp /> WhatsApp
              </a>
              <a 
                href="mailto:partnerships@uduua.com"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:border-[#0043FC] hover:text-[#0043FC] transition-colors"
              >
                <FaEnvelope className="text-sm" /> Email
              </a>
              <a 
                href="tel:+2347059585905"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:border-[#0043FC] hover:text-[#0043FC] transition-colors"
              >
                <FaPhone className="text-sm" /> Call
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UduuaServices;