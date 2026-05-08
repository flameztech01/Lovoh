// components/about/Values.jsx
import React from "react";
import {
  FaLightbulb,
  FaBullseye,
  FaHandshake,
  FaRocket,
  FaGem,
  FaSyncAlt,
} from "react-icons/fa";

const Values = () => {
  const values = [
    {
      icon: <FaBullseye />,
      title: "Strategic Partnership",
      description:
        "We become an extension of your team, working closely to understand your goals and deliver solutions that drive real business impact.",
    },
    {
      icon: <FaRocket />,
      title: "Rapid Execution",
      description:
        "Our agile methodology ensures quick turnaround times without compromising on quality or strategic depth.",
    },
    {
      icon: <FaLightbulb />,
      title: "Innovation-Driven",
      description:
        "We stay ahead of industry trends and leverage cutting-edge technologies to keep your brand competitive and relevant.",
    },
    {
      icon: <FaGem />,
      title: "Measurable Results",
      description:
        "Every project includes clear KPIs and analytics to track performance and demonstrate ROI to stakeholders.",
    },
  ];

  return (
    <section className="relative bg-[#f8fafc] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Soft background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-[#254899]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#254899]/8 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header - CENTRALIZED */}
        <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-14">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#254899]/70 mb-4">
            Why Choose Us
          </p>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] whitespace-nowrap">
            <span className="text-[#111827]">The Lovoh Create </span>
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">Difference</span>
          </h2>
        </div>

        {/* Values Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="group rounded-[1.75rem] bg-white border border-[#254899]/10 p-7 shadow-[0_12px_30px_rgba(37,72,153,0.08)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(37,72,153,0.12)]"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#254899]/8 text-[#254899] border border-[#254899]/10 flex items-center justify-center text-lg mb-6 transition-transform duration-300 group-hover:rotate-6">
                {value.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-[#111827] mb-3">
                {value.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-7 text-sm sm:text-base">
                {value.description}
              </p>

              {/* subtle bottom line */}
              <div className="mt-6 h-px w-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 group-hover:w-full transition-all duration-500" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;