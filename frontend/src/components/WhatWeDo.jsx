import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { BsLightbulb } from "react-icons/bs";
import { FaCheckCircle } from 'react-icons/fa';

const WhatWeDo = () => {
  const categories = [
    "Website/App Development",
    "Experience",
    "PR",
    "Brand Development",
    "Strategy",
    "Design",
    "Digital Media",
    "Marketing",
    "Socials",
  ];

  const scrollingCategories = [...categories, ...categories];

  return (
    <>
      <style>
        {`
          @keyframes marqueeLeft {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          .whatwedo-marquee-track {
            width: max-content;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: marqueeLeft 24s linear infinite;
          }

          .whatwedo-marquee-track:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <section className="relative py-20 md:py-28 bg-gradient-to-b from-white to-blue-50/30 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-10 md:mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                How We Can Help You.
              </span>
            </h2>
          </div>

          {/* CTA Box */}
          <div className="max-w-4xl mx-auto relative mb-14 md:mb-16">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-blue-400 rounded-3xl blur opacity-30 transition duration-300 pointer-events-none"></div>

            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 md:p-10 text-center shadow-2xl overflow-hidden">
              {/* Decorative blurs */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping" />
                <div className="absolute bottom-10 right-10 w-3 h-3 bg-white/20 rounded-full animate-pulse" />
              </div>

              <div className="inline-flex p-3 bg-white/10 rounded-full backdrop-blur-sm mb-6 border border-white/20">
                <BsLightbulb className="w-8 h-8 text-white" />
              </div>

              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                We help brands define{" "}
                <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">
                  strategy, messaging,
                </span>{" "}
                <span className="bg-white/20 px-3 py-1 rounded-full font-semibold">
                  structure
                </span>
                <br className="hidden md:block" />
                <span className="text-blue-100">
                  and marketing actually works.
                </span>
              </p>

              {/* Round Button */}
              <Link
                to="/contact"
                className="relative z-10 group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-700 font-semibold rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <FaCheckCircle className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>Start with a Clarity Session</span>
                <FiArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="mt-6 text-sm text-blue-200 flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                  30-Minute Strategy Call
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-300 rounded-full"></span>
                  100% Free
                </span>
              </div>
            </div>
          </div>

          {/* Scrolling Pills */}
          <div className="relative max-w-6xl mx-auto">
            <div className="rounded-2xl border border-blue-100/70 bg-blue-50/40 px-3 py-4 md:px-4 md:py-5 shadow-sm overflow-hidden">
              <div className="whatwedo-marquee-track">
                {scrollingCategories.map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-blue-100 text-gray-700 text-sm md:text-[15px] font-medium shadow-sm whitespace-nowrap"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhatWeDo;