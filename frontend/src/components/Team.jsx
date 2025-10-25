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
    { id: 2, name: 'Kayode Olayiwola', title: 'Digital Strategist', image: 'team2.png' },
    { id: 3, name: 'Edidiong Sunday', title: 'Lead Designer', image: 'team3.png' },
    { id: 4, name: 'Uduak Daniel', title: 'Brand Development Manager', image: 'team4.png' },
    { id: 5, name: 'Emmanuel "Kembit" Nkem', title: 'Lead Software Developer', image: 'team6.png' },
    { id: 6, name: 'Daniel "Brilla" Joseph', title: 'Marketing & PR Specialist', image: 'team7.png' },
    { id: 7, name: 'Anwuli Victory Ogbogu', title: 'Project Manager', image: 'team8.png' },
  ];

  return (
    <section className="relative z-20 py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Our Team
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Meet our exceptional team of professionals who bring innovative ideas, 
          strategic thinking, and flawless execution to deliver outstanding results. 
          We specialize in brand marketing and technology solutions.
        </p>
      </div>
      
      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        {teamMembers.map((member) => (
          <div 
            key={member.id} 
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 text-center"
          >
            {/* Image Container with padding */}
            <div className="p-3 mb-4"> {/* 12px padding (close to your 10-15px range) */}
              <img 
                src={member.image} 
                alt={`Portrait of ${member.name}, ${member.title}`}
                className="w-full aspect-square object-cover rounded-lg"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {member.name}
            </h2>
            <p className="text-gray-600 text-sm font-medium">
              {member.title}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <button
          onClick={() => scrollToSection("contact")}
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md hover:shadow-lg"
        >
          Join Our Team
        </button>
      </div>
    </section>
  );
};

export default Team;