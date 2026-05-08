// components/services/ServiceCategories.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaLaptopCode,
  FaCrosshairs,
  FaChartBar,
  FaEnvelope,
  FaUser,
  FaPhone,
  FaBriefcase,
  FaArrowUpRightFromSquare,
  FaMobileScreenButton,
  FaPenNib,
  FaRocket,
  FaArrowRight,
} from "react-icons/fa6";

const Servicecategories = () => {
  const categories = [
    {
      id: 0,
      title: "Campaign & PR",
      icon: <FaPenNib />,
      description: "Strategic Campaigns and public relations that amplify your brand.",
      services: [
        "PR Strategy",
        "Campaign Management",
        "Media Buying",
        "Influencer Coordination",
        "Event Branding & Marketing",
      ],
    },
    {
      id: 1,
      title: "Web & App Development",
      icon: <FaLaptopCode />,
      description: "Custom digital solutions built for performance and scale.",
      services: [
        "Product Design",
        "Web App/Website Development",
        "Mobile App Development",
        "E-commerce Solutions",
      ],
    },
    {
      id: 2,
      title: "Digitals & AI",
      icon: <FaMobileScreenButton />,
      description: "AI integration and data-driven marketing strategies for digital growth.",
      services: [
        "Content & Email Marketing",
        "Sponsored Ads",
        "SEO | GEO | AEO",
        "System & AI Integration",
      ],
    },
    {
      id: 3,
      title: "Socials & Content",
      icon: <FaCrosshairs />,
      description: "Social media management and content creation that connects and converts.",
      services: [
        "Social Media Management",
        "Content Strategy & Creation",
        "Design & Video Production",
        "Copywriting/Script & Blog Writing",
        "Analytics & Reporting",
      ],
    },
    {
      id: 4,
      title: "Strategy & Consulting",
      icon: <FaChartBar />,
      description: "Wholistic guidance and practical strategies for business growth.",
      services: [
        "Growth Planning",
        "Digital Transformation",
        "Team Training & Workshops",
        "Market Analysis",
        "Competitive Research",
      ],
    },
  ];

  return (
    <>
      <section id="services" className="bg-[#f7f8f4] px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Centered header */}
          <div className="text-center mb-5 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-[1.2]">
              Tailored services to{" "}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent whitespace-nowrap">build and grow brands</span>
            </h2>
          </div>

          {/* Centered paragraph */}
          <div className="flex justify-center mb-14">
            <div className="max-w-3xl text-center">
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                From strategy and brand development to design, development, and
                communications, we create solutions that help businesses show up
                clearly, connect meaningfully, and grow with confidence.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="group rounded-[1.75rem] border border-[#254899]/10 bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(37,72,153,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(37,72,153,0.10)]"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg bg-gradient-to-r from-blue-600/10 via-blue-700/10 to-blue-800/10 text-[#254899] border border-[#254899]/10 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-blue-800 group-hover:text-white transition-all duration-300">
                    <span className="group-hover:text-white transition-colors duration-300">
                      {category.icon}
                    </span>
                  </div>

                  <Link
                    to="/start-project"
                    state={{ selectedService: category.title }}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 bg-[#f4f6fb] text-[#254899] hover:bg-gradient-to-r hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 hover:text-white"
                    aria-label={`Get quote for ${category.title}`}
                  >
                    <FaArrowUpRightFromSquare className="text-sm" />
                  </Link>
                </div>

                <h3 className="text-xl font-semibold leading-snug text-[#111827] group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-blue-800 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  {category.title}
                </h3>

                <p className="mt-3 text-sm sm:text-base leading-7 text-gray-600">
                  {category.description}
                </p>

                <div className="mt-6 space-y-3">
                  {category.services.slice(0, 4).map((service, serviceIndex) => (
                    <div
                      key={serviceIndex}
                      className="flex items-start gap-3 text-sm text-gray-700"
                    >
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex-shrink-0" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-5 border-t border-black/5 flex items-center justify-between gap-4">
                  <Link
                    to="/start-project"
                    state={{ selectedService: category.title }}
                    className="text-sm font-semibold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent hover:from-[#ebed17] hover:to-yellow-400 transition-all duration-200"
                  >
                    Get Quote
                  </Link>

                  <span className="text-xs uppercase tracking-[0.16em] text-gray-400">
                    {String(category.services.length).padStart(2, "0")} services
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Start Project CTA */}
          <div className="mt-16 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-lg opacity-40"></div>
              <Link
                to="/start-project"
                className="relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group"
              >
                <FaRocket className="text-xl group-hover:animate-bounce" />
                <span>Start Your Project</span>
                <FaArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Ready to bring your vision to life? Let's make it happen.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Servicecategories;