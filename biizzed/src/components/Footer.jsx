import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const services = [
    "Brand Development",
    "Strategy",
    "Design",
    "Digital Media",
    "Marketing",
    "Communications",
    "Web Development",
    "App Development",
  ];

  return (
    <footer className="bg-[#0f172a] text-white px-4 sm:px-6 lg:px-8 pt-14 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Top section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-white/10">
          {/* Brand block */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-3 h-3 rounded-full bg-[#254899]" />
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Lovoh Create Brand
              </h3>
            </div>

            <p className="text-white/70 leading-8 max-w-xl text-sm sm:text-base">
              Lovoh Create is a dynamic Brand Marketing and Tech Agency using vision, strategy,
              creativity, and technology to build effective ideas and solutions
              for forward-thinking businesses.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#254899]" />
                Brand Partner
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/40" />
                Since 2020
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50 mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-white/75 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/75 hover:text-white transition-colors duration-200"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/work"
                  className="text-white/75 hover:text-white transition-colors duration-200"
                >
                  Our Work
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-white/75 hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/75 hover:text-white transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50 mb-5">
              Contact
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8ea7e8] flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <p className="text-white/70 leading-7 text-sm sm:text-base">
                  1, Adedeji Close, Opebi, Ikeja, Lagos.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8ea7e8] flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-white/70 leading-7 text-sm sm:text-base">
                  growth@lovohcreate.com
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#8ea7e8] flex-shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <p className="text-white/70 leading-7 text-sm sm:text-base">
                  +234 805 576 6461
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services row */}
        <div className="py-8 border-b border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/50 whitespace-nowrap">
              Services
            </h4>

            <div className="flex flex-wrap gap-3">
              {services.map((service, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/70"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-white/50 text-center md:text-left">
            © {new Date().getFullYear()} Lovoh Create. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-white/50 text-center">
            <span className="text-[#8ea7e8] font-medium">Your Brand Partner</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Creative Strategy</span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>Digital Execution</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;