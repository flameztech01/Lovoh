// components/services/ServicesHero.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaPalette,
  FaMobileScreenButton,
  FaLaptopCode,
  FaCrosshairs,
  FaChartBar,
  FaPenNib,
} from "react-icons/fa6";
import { FiDroplet, FiArrowRight, FiZap } from "react-icons/fi";

const ServicesHero = () => {
  const services = [
    {
      title: "Brand Development",
      description: "Comprehensive brand strategy and identity development.",
      icon: FaPalette,
      miniIcon: FaPalette,
    },
    {
      title: "Digitals & AI",
      description: "AI integration and data-driven marketing strategies for digital growth.",
      icon: FaMobileScreenButton,
      miniIcon: FaMobileScreenButton,
    },
    {
      title: "Web & App Development",
      description: "Custom digital solutions built for performance and scale.",
      icon: FaLaptopCode,
      miniIcon: FaLaptopCode,
    },
    {
      title: "Socials & Content",
      description: "Social media management and content creation that connects and converts.",
      icon: FaCrosshairs,
      miniIcon: FaCrosshairs,
    },
    {
      title: "Strategy & Consulting",
      description: "Wholistic guidance and practical strategies for business growth.",
      icon: FaChartBar,
      miniIcon: FaChartBar,
    },
    {
      title: "Campaign & PR",
      description: "Strategic campaigns and public relations that amplify your brand.",
      icon: FaPenNib,
      miniIcon: FaPenNib,
    },
  ];

  return (
    <section className="relative py-10 md:py-14 bg-gradient-to-b from-white via-slate-50/50 to-blue-50/30 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[24rem] h-[24rem] bg-blue-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[22rem] h-[22rem] bg-blue-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto relative">
          <div className="relative rounded-[28px] border border-slate-200/80 bg-white/90 backdrop-blur-sm shadow-[0_16px_40px_rgba(37,99,235,0.08)] px-4 py-6 md:px-6 md:py-8">
            {/* Counter */}
            <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-semibold flex items-center justify-center">
              6
            </div>

            {/* Badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-blue-50 border border-blue-200/60 shadow-sm">
                <FiDroplet className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] sm:text-xs font-semibold tracking-[0.14em] uppercase text-blue-700">
                  Our Services
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              </div>
            </div>

            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto mb-7 md:mb-8">
              <p className="text-sm md:text-base text-slate-600 flex items-center justify-center gap-2">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-blue-300 text-blue-600 text-[10px]">
                  ✓
                </span>
                <span>Simple, clear, and designed to get results.</span>
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-slate-200 bg-white px-4 py-4 md:px-5 md:py-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-200/70 shrink-0">
                          <service.icon className="w-4.5 h-4.5" />
                        </div>

                        <div className="h-px flex-1 bg-slate-200" />

                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 text-blue-500 flex items-center justify-center shrink-0">
                          <service.miniIcon className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg md:text-[1.35rem] font-bold text-slate-900 mb-1.5 leading-snug group-hover:text-blue-700 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-slate-500 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Project Button */}
            <div className="mt-8 pt-4 border-t border-slate-200/60">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <p className="text-slate-600 text-sm text-center sm:text-left">
                  Idea meets execution. Ready?
                </p>
                <Link
                  to="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                >
                  <FiZap className="w-4 h-4" />
                  <span>Start Your Project</span>
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;