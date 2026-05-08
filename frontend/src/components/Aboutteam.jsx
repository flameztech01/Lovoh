// components/about/Team.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Aboutteam = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const teamMembers = [
    {
      name: "Embee M. Sunday",
      title: "Director & Brand Strategist",
      image: "team1.png",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Embee is a visionary brand and systems strategist with over a decade of experience helping founders and businesses claim their rightful place in the market. He specialises in positioning and crafting the kind of clarity that turns brands into market leaders, while simultaneously building the people and systems needed to scale. When he's not shaping strategy, Embee is making music or pouring into the next generation through mentorship."
    },
    {
      name: "Uduak Daniel",
      title: "Business Development Manager",
      image: "team4.png",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Uduak is a results-driven business development professional who turns ideas into growth. With four years of experience identifying opportunities, positioning brands, and building pipelines that deliver, he brings both strategic vision and operational discipline to everything he does. His approach is simple, understand the goal, map the path, and make sure things get done the right way. Music is the fuel of his creativity off the clock."
    },
    {
      name: "Anita Ayeni",
      title: "Operations Manager",
      image: "anita.png",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Anita is the kind of person who brings order to complexity without breaking a sweat. A natural organiser, she has a sharp eye for structure, managing tasks, coordinating moving parts, and keeping things running smoothly so the team can focus on doing their best work. Anita approaches every responsibility with the quiet precision of a true craftsman, and her instinct for organisation is already making its mark on how the team operates."
    },
    {
      name: "Joshua Armstrong",
      title: "Digital Strategist",
      image: "joshua.png",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Joshua is a builder at heart. With five years of experience leading large-scale product and community initiatives, he has a rare gift for translating complex, ambitious ideas into clear, executable plans and then seeing them through to products people actually want to use. Joshua believes big things can come from unexpected places, and his track record proves it. Outside of work, you'll find him reading, writing, seeing a movie, or exploring a new destination."
    },
    {
      name: 'Emmanuel "Kembit" Nkem',
      title: "Lead Software Developer",
      image: "team6.png",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Emmanuel is the rare developer who cares as much about how something looks as how it works. With six years of experience, he brings technical precision and strategic thinking to every project. Architecting clean, scalable codebases while ensuring the final product is both robust under the hood and polished on the surface. He approaches software with the care and intention a craftsman approaches their trade."
    },
    {
      name: "Samuel Njoku",
      title: "Systems Manager",
      image: "samuel.jpeg",
      accent: "from-[#254899] to-[#1a3480]",
      bio: "Samuel is a systems architect with a passion for building robust, scalable infrastructure that powers digital experiences. With expertise in cloud architecture, DevOps, and system optimization, he ensures that every technical foundation is solid, secure, and ready for growth. Samuel believes that great systems are invisible, they just work. When he's not engineering solutions, he enjoys exploring emerging technologies and mentoring junior developers."
    },
  ];

  return (
    <>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header - CENTRALIZED with single line */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#254899]/20 bg-[#254899]/5 px-6 py-3 mb-6">
              <div className="w-2 h-2 bg-[#254899] rounded-full"></div>
              <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
                Meet The Team
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
              <span className="text-[#111827]">The Minds Behind </span>
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                The Success
              </span>
            </h2>

            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meet our exceptional team of brand leaders who bring innovative ideas, 
              strategic thinking, and execution to deliver outstanding results. 
              We specialize in brand marketing and technology solutions.
            </p>
          </div>

          {/* Team Grid - 2 columns on mobile, 3 columns on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                onClick={() => setSelectedMember(member)}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100 cursor-pointer"
              >
                {/* Image Container with improved handling */}
                <div className="relative w-full pt-[100%] overflow-hidden bg-gray-50">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;base64,${btoa(`
                      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#254899;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#1a3480;stop-opacity:1" />
                          </linearGradient>
                        </defs>
                        <rect width="400" height="400" fill="url(#grad${index})"/>
                        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">${member.name.split(" ")[0]}</text>
                      </svg>
                    `)}`;
                    }}
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-sm font-light opacity-90">
                        Click to read bio
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                  <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2 group-hover:text-[#254899] transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 font-medium">
                    {member.title}
                  </p>
                </div>

                {/* Accent Border */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800"></div>
              </div>
            ))}
          </div>

          {/* Team Stats */}
          <div className="mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
              <div className="text-center p-4 md:p-6 bg-gradient-to-br from-[#ebed17] to-[#f0f269] rounded-2xl text-[#254899]">
                <div className="text-2xl md:text-3xl font-bold mb-2">15+</div>
                <div className="text-xs md:text-sm opacity-90">Years Combined Experience</div>
              </div>
              <div className="text-center p-4 md:p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl text-white">
                <div className="text-2xl md:text-3xl font-bold mb-2">100%</div>
                <div className="text-xs md:text-sm opacity-90">Dedicated to Your Success</div>
              </div>
            </div>

            {/* Work With Us Button - Simple and subtle */}
            <div className="text-center mt-12">
              <Link
                to="/start-project"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:text-[#254899] border border-gray-300 hover:border-[#254899] rounded-full transition-all duration-300 text-sm font-medium"
              >
                Work with us
                <svg 
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 px-4 overflow-y-auto py-8"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white max-w-2xl w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative animate-[fadeIn_0.3s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-black/60 hover:bg-black/80 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-sm sm:text-base"
            >
              ✕
            </button>

            {/* Modal Content */}
            <div className="flex flex-col sm:flex-row">
              {/* Image Side */}
              <div className="sm:w-2/5 bg-gradient-to-br from-[#254899] to-[#1a3480] p-6 flex items-center justify-center">
                <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden bg-white/10 border-4 border-white/30 shadow-xl">
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.target.src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="100" cy="100" r="100" fill="#254899"/>
                          <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" text-anchor="middle" dy=".3em">${selectedMember.name.split(" ")[0]}</text>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
              </div>

              {/* Bio Side */}
              <div className="sm:w-3/5 p-6 sm:p-8">
                <div className="mb-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-[#254899]/70 font-semibold">
                    {selectedMember.title}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-3">
                  {selectedMember.name}
                </h3>

                {/* Bio Text */}
                <div className="mt-4">
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                {/* Quote/Footer */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 italic">
                    Passionate about delivering excellence
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add fadeIn animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-\\[fadeIn_0\\.3s_ease\\] {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Aboutteam;