// components/UduuaValueStrip.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight,
  FaCheckCircle,
  FaShoppingBag,
  FaRocket
} from 'react-icons/fa';

const UduuaValueStrip = () => {
  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#0043FC]"></div>
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#0043FC]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#79FFFF]/5 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Built for{' '}
            <span className="text-[#0043FC]">Shoppers</span>
            {' '}and{' '}
            <span className="text-[#0043FC]">Brands</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            One platform connecting quality products with ready shoppers across Africa.
          </p>
        </div>

        {/* Buyer and Brand Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Buyers Card */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 lg:p-10 border border-gray-200 hover:border-[#0043FC]/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0043FC]/5 rounded-full blur-3xl"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-[#0043FC] flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaShoppingBag className="text-2xl" />
              </div>
              
              {/* Content */}
              <h3 className="text-sm font-semibold text-[#0043FC] uppercase tracking-wider mb-2">For Buyers</h3>
              <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Shop from Unique Brands
              </p>
              
              {/* Features List */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Quality products from fast-growing brands</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Retail and bulk pricing available</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Fast access to new products entering the market</span>
                </li>
              </ul>
              
              {/* CTA Button */}
              <Link 
                to="/uduua/shop"
                className="inline-flex items-center gap-2 bg-[#0043FC] hover:bg-[#0038D4] text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group/btn"
              >
                <FaShoppingBag />
                Shop Marketplace
                <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* For Brands Card */}
          <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 lg:p-10 border border-gray-200 hover:border-[#0043FC]/40 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#79FFFF]/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-[#0043FC] flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                <FaRocket className="text-2xl" />
              </div>
              
              {/* Content */}
              <h3 className="text-sm font-semibold text-[#0043FC] uppercase tracking-wider mb-2">For Brands</h3>
              <p className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Grow Your Brand with Uduua
              </p>
              
              {/* Features List */}
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Market access into retail and distribution channels</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Product visibility across buyers and resellers</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-[#0043FC] flex-shrink-0 text-lg mt-0.5" />
                  <span className="text-gray-700 text-base">Entry into fast-moving commercial markets</span>
                </li>
              </ul>
              
              {/* CTA Button */}
              <Link 
                to="/uduua/services"
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border-2 border-[#0043FC] text-[#0043FC] hover:text-[#0043FC] px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group/btn"
              >
                <FaRocket />
                Grow Your Brand
                <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UduuaValueStrip;