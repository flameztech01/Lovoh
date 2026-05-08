// components/WhyChooseUduua.jsx
import React from "react";
import {
  FaCheck,
  FaGem,
  FaStore,
  FaHandshake,
  FaSearch,
  FaShoppingCart,
  FaTruck,
} from "react-icons/fa";

const WhyChooseUduua = () => {
  const benefits = [
    {
      icon: FaGem,
      title: "Premium Quality",
      desc: "Curated products from trusted brands",
    },
    {
      icon: FaStore,
      title: "Bulk Discounts",
      desc: "Special pricing for bulk purchases",
    },
    {
      icon: FaHandshake,
      title: "Trusted Marketplace",
      desc: "Verified brands meet happy shoppers",
    },
  ];

  const features = [
    {
      icon: FaSearch,
      title: "Discover",
      desc: "Find fast-growing brands and emerging products entering the market.",
    },
    {
      icon: FaShoppingCart,
      title: "Buy",
      desc: "Shop instantly at retail prices or unlock better value with bulk pricing.",
    },
    {
      icon: FaTruck,
      title: "Access",
      desc: "Get products delivered fast, through our distribution network.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Benefits Section */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 border border-[#0043FC]/20 px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-[#0043FC] rounded-full animate-pulse"></span>
              <span className="text-xs sm:text-sm font-semibold text-[#0043FC]">
                Where products meet the market
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Why Choose Úduua?
            </h2>
            <p className="text-gray-500 mt-2">
              The best place to discover quality products from verified brands
              at unbeatable prices.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#0043FC]/10 flex items-center justify-center">
                    <Icon className="text-[#0043FC] text-2xl" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-500">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Row - Discover, Buy, Access */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="relative flex items-start gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#0043FC]/30 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#0043FC] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#0043FC]/10 flex items-center justify-center flex-shrink-0 mt-2">
                    <Icon className="text-[#0043FC] text-lg" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-base mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Indicators Row */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#0043FC]/10 flex items-center justify-center text-[#0043FC]">
              <FaCheck className="text-xs" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Trusted Emerging Brands
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#0043FC]/10 flex items-center justify-center text-[#0043FC]">
              <FaCheck className="text-xs" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Fast-Growing Product Network
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
            <div className="w-5 h-5 rounded-full bg-[#0043FC]/10 flex items-center justify-center text-[#0043FC]">
              <FaCheck className="text-xs" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              Market Access System
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUduua;
