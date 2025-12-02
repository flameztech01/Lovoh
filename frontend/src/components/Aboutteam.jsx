// components/about/Team.jsx
import React from 'react';

const Aboutteam = () => {
  const teamMembers = [
    {
      name: 'Embee M. Sunday',
      title: 'Director & Founder',
      expertise: 'Brand Strategy & Business Development',
      image: 'team1.png',
      accent: 'from-[#254899] to-[#1a3480]'
    },
    {
      name: 'Kayode Olayiwola',
      title: 'Digital Strategist',
      expertise: 'Digital Marketing & Analytics',
      image: 'team2.png',
      accent: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      name: 'Edidiong Sunday',
      title: 'Lead Designer',
      expertise: 'UI/UX & Brand Identity',
      image: 'team3.png',
      accent: 'from-[#254899] to-[#1a3480]'
    },
    {
      name: 'Uduak Daniel',
      title: 'Brand Development Manager',
      expertise: 'Brand Strategy & Communications',
      image: 'team4.png',
      accent: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      name: 'Emmanuel "Kembit" Nkem',
      title: 'Lead Software Developer',
      expertise: 'Full-Stack Development & Architecture',
      image: 'team6.png',
      accent: 'from-[#254899] to-[#1a3480]'
    },
    {
      name: 'Daniel "Brilla" Joseph',
      title: 'Marketing & PR Specialist',
      expertise: 'Public Relations & Campaign Management',
      image: 'team7.png',
      accent: 'from-[#ebed17] to-[#f0f269]'
    },
    {
      name: 'Anwuli Victory Ogbogu',
      title: 'Project Manager',
      expertise: 'Agile Project Management & Delivery',
      image: 'team8.png',
      accent: 'from-[#254899] to-[#1a3480]'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              Meet The Team
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Minds Behind
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#254899] to-[#ebed17]">
              The Magic
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our diverse team of experts brings together decades of combined experience 
            in brand strategy, design, technology, and marketing to deliver exceptional results.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
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
                            <stop offset="0%" style="stop-color:${member.accent.includes('254899') ? '#254899' : '#ebed17'};stop-opacity:1" />
                            <stop offset="100%" style="stop-color:${member.accent.includes('254899') ? '#1a3480' : '#f0f269'};stop-opacity:1" />
                          </linearGradient>
                        </defs>
                        <rect width="400" height="400" fill="url(#grad${index})"/>
                        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">${member.name.split(' ')[0]}</text>
                      </svg>
                    `)}`;
                  }}
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-sm font-light opacity-90">{member.expertise}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#254899] transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="text-gray-600 font-medium mb-3">{member.title}</p>
                
                {/* Expertise Tags */}
                <div className="flex flex-wrap gap-2">
                  {member.expertise.split(' & ').map((skill, skillIndex) => (
                    <span 
                      key={skillIndex}
                      className={`text-xs px-3 py-1 rounded-full ${
                        member.accent.includes('254899') 
                          ? 'bg-[#254899]/10 text-[#254899] border border-[#254899]/20'
                          : 'bg-[#ebed17]/10 text-[#254899] border border-[#ebed17]/20'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Accent Border */}
              <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${member.accent}`}></div>
            </div>
          ))}
        </div>

        {/* Team Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 bg-gradient-to-br from-[#254899] to-[#1a3480] rounded-2xl text-white">
            <div className="text-3xl font-bold mb-2">7+</div>
            <div className="text-sm opacity-90">Expert Team Members</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#ebed17] to-[#f0f269] rounded-2xl text-[#254899]">
            <div className="text-3xl font-bold mb-2">15+</div>
            <div className="text-sm opacity-90">Years Combined Experience</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#254899] to-[#1a3480] rounded-2xl text-white">
            <div className="text-3xl font-bold mb-2">8</div>
            <div className="text-sm opacity-90">Different Specializations</div>
          </div>
          <div className="text-center p-6 bg-gradient-to-br from-[#ebed17] to-[#f0f269] rounded-2xl text-[#254899]">
            <div className="text-3xl font-bold mb-2">100%</div>
            <div className="text-sm opacity-90">Dedicated to Your Success</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Aboutteam;