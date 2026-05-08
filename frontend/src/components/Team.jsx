// components/Team.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Team = () => {

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const teamMembers = [
    { id: 1, name: 'Embee M. Sunday', title: 'Director', image: 'team1.png' },
    { id: 2, name: 'Uduak Daniel', title: 'Brand Development Manager', image: 'team4.png' },
    { id: 3, name: 'Anita Ayeni', title: 'Operations Manager', image: 'anita.png' },
    { id: 4, name: 'Joshua Armstrong', title: 'Digital Strategist', image: 'joshua.png' },
    { id: 5, name: 'Emmanuel "Kembit" Nkem', title: 'Lead Software Developer', image: 'team6.png' },
    { id: 6, name: 'Samuel Njoku', title: 'Systems Manager', image: 'samuel.jpeg' },
  ];

  const memberCount = teamMembers.length;

  // Determine grid columns for all screen sizes
  const getGridClass = () => {
    // Mobile (default): 1 column for 1 member, 2 columns for 2+ members
    const mobileCols = memberCount === 1 ? 'grid-cols-1' : 'grid-cols-2';
    
    // Tablet (sm): 2 columns for 2+, 3 columns for 3+
    const tabletCols = memberCount === 1 ? 'sm:grid-cols-1' 
      : memberCount === 2 ? 'sm:grid-cols-2'
      : 'sm:grid-cols-2';
    
    // Desktop (lg): based on count
    let desktopCols = 'lg:grid-cols-3';
    if (memberCount === 1) desktopCols = 'lg:grid-cols-1';
    if (memberCount === 2) desktopCols = 'lg:grid-cols-2';
    if (memberCount === 3) desktopCols = 'lg:grid-cols-3';
    if (memberCount === 4) desktopCols = 'lg:grid-cols-4';
    if (memberCount === 5) desktopCols = 'lg:grid-cols-3'; // 3-2 layout
    if (memberCount === 6) desktopCols = 'lg:grid-cols-3'; // 3-3 layout
    if (memberCount >= 7) desktopCols = 'lg:grid-cols-4';
    
    return `${mobileCols} ${tabletCols} ${desktopCols}`;
  };

  // Center the grid items properly
  const getJustifyClass = () => {
    if (memberCount === 1) return 'justify-center';
    if (memberCount === 2) return 'justify-center sm:justify-center';
    if (memberCount === 4) return 'justify-center';
    return 'justify-center';
  };

  // Get max width for container
  const getMaxWidth = () => {
    if (memberCount === 1) return 'max-w-xs';
    if (memberCount === 2) return 'max-w-2xl';
    if (memberCount === 3) return 'max-w-4xl';
    if (memberCount === 4) return 'max-w-6xl';
    if (memberCount === 5) return 'max-w-4xl';
    if (memberCount === 6) return 'max-w-4xl';
    return 'max-w-7xl';
  };

  return (
    <section className="relative z-20 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our Team
        </h1>

        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Meet our exceptional team of brand leaders who bring innovative ideas, 
          strategic thinking, and execution to deliver outstanding results. 
          We specialize in brand marketing and technology solutions.
        </p>
      </div>
      
      {/* Team Grid */}
      <div className={`mx-auto ${getMaxWidth()}`}>
        <div className={`grid ${getGridClass()} ${getJustifyClass()} gap-4 sm:gap-6 lg:gap-8 mb-12`}>
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="w-full mx-auto rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden text-center bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="w-full aspect-square overflow-hidden">
                <img 
                  src={member.image} 
                  alt={`Portrait of ${member.name}, ${member.title}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = '/placeholder-team.png';
                  }}
                />
              </div>
              
              {/* Text */}
              <div className="p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-1">
                  {member.name}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm font-medium">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          onClick={() => scrollToSection("contact")}
          className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 hover:scale-[1.03]"
        >
          Join Our Team
        </button>
      </div>
    </section>
  );
};

export default Team;