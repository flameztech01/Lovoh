// screens/TheFruiitScreen.jsx
import React from 'react';
import Header from '../components/Header';
import { 
  FaStar,
  FaCrown,
  FaPalette,
  FaBriefcase,
  FaRocket,
  FaHandshake,
  FaBook,
  FaUsers,
  FaCalendarAlt,
  FaBullseye
} from 'react-icons/fa';

const TheFruiitScreen = () => {
  const developmentAreas = [
    {
      icon: <FaStar className="text-2xl" />,
      title: 'Lifestyle',
      description: 'Cultivate habits and mindsets for balanced, fulfilling personal growth',
      benefits: ['Mindfulness practices', 'Health & wellness', 'Personal organization', 'Work-life balance']
    },
    {
      icon: <FaCrown className="text-2xl" />,
      title: 'Leadership',
      description: 'Develop the skills to inspire, influence, and lead with purpose',
      benefits: ['Communication skills', 'Decision making', 'Team management', 'Strategic thinking']
    },
    {
      icon: <FaPalette className="text-2xl" />,
      title: 'Creativity',
      description: 'Unlock your creative potential and innovative thinking abilities',
      benefits: ['Creative problem-solving', 'Innovation techniques', 'Artistic expression', 'Design thinking']
    },
    {
      icon: <FaBriefcase className="text-2xl" />,
      title: 'Career',
      description: 'Accelerate your professional growth and career advancement',
      benefits: ['Career planning', 'Skill development', 'Networking strategies', 'Professional branding']
    },
    {
      icon: <FaRocket className="text-2xl" />,
      title: 'Business',
      description: 'Build entrepreneurial skills and business acumen for success',
      benefits: ['Business fundamentals', 'Entrepreneurship', 'Financial literacy', 'Market understanding']
    },
    {
      icon: <FaHandshake className="text-2xl" />,
      title: 'Community',
      description: 'Connect with like-minded individuals for mutual growth and support',
      benefits: ['Peer networking', 'Mentorship opportunities', 'Collaborative projects', 'Support system']
    }
  ];

  const programFeatures = [
    {
      icon: <FaBook className="text-2xl" />,
      title: 'Learning Modules',
      description: 'Structured courses and workshops for systematic growth'
    },
    {
      icon: <FaUsers className="text-2xl" />,
      title: 'Mentorship',
      description: 'Guidance from experienced professionals and industry experts'
    },
    {
      icon: <FaCalendarAlt className="text-2xl" />,
      title: 'Community Events',
      description: 'Regular meetups, workshops, and networking opportunities'
    },
    {
      icon: <FaBullseye className="text-2xl" />,
      title: 'Progress Tracking',
      description: 'Tools to monitor and celebrate your development journey'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-[#193564] px-4 sm:px-6 lg:px-8 overflow-hidden mt-15">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="space-y-8">
            {/* Sub-brand Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/10copy.png" 
                alt="theFruiit" 
                className="h-16 w-auto"
              />
            </div>

            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 bg-[#7EF949]/10 backdrop-blur-sm border border-[#7EF949]/30 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-[#7EF949] rounded-full animate-pulse"></div>
              <span className="text-[#7EF949] font-semibold text-sm uppercase tracking-wider">
                A Lovoh Create Initiative
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FFFCFF] leading-tight">
              theFruiit
            </h1>
            
            {/* Tagline */}
            <div className="space-y-4">
              <p className="text-2xl lg:text-3xl text-[#FFFCFF] italic">
                …everyday advancement
              </p>
              <p className="text-xl text-[#FFFCFF] max-w-3xl mx-auto leading-relaxed">
                Growth community empowering young people for 360° development in lifestyle, 
                leadership, creativity, career and business.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button className="bg-[#7EF949] hover:bg-[#9aff6e] text-[#193564] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Join the Community
              </button>
              <button className="border-2 border-[#FFFCFF] text-[#FFFCFF] hover:bg-[#FFFCFF] hover:text-[#193564] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Explore Programs
              </button>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 max-w-2xl mx-auto">
              {/* <div className="text-center">
                <div className="text-2xl font-bold text-[#7EF949] mb-2">1K+</div>
                <div className="text-[#FFFCFF] text-sm">Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7EF949] mb-2">50+</div>
                <div className="text-[#FFFCFF] text-sm">Mentors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7EF949] mb-2">100+</div>
                <div className="text-[#FFFCFF] text-sm">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#7EF949] mb-2">360°</div>
                <div className="text-[#FFFCFF] text-sm">Development</div>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Development Areas Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#193564] mb-6">
              360° Personal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7EF949] to-[#193564]">
                Development
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive growth across all aspects of life to help you become 
              the best version of yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {developmentAreas.map((area, index) => (
              <div 
                key={index}
                className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-r from-[#193564] to-[#7EF949] rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {area.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#193564] transition-colors duration-300">
                  {area.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {area.description}
                </p>

                {/* Benefits */}
                <div className="space-y-2">
                  {area.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#7EF949] rounded-full"></div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-6 bg-[#193564] hover:bg-[#7EF949] hover:text-[#193564] text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                  Explore {area.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#193564] mb-6">
              How theFruiit
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#7EF949] to-[#193564]">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A comprehensive ecosystem designed to support your growth journey every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {programFeatures.map((feature, index) => (
              <div 
                key={index}
                className="group text-center bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-[#7EF949] rounded-2xl flex items-center justify-center text-[#193564] mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-[#193564] transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#193564]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#FFFCFF] mb-6">
            Ready to Start Your Growth Journey?
          </h2>
          <p className="text-xl text-[#FFFCFF] mb-8 max-w-2xl mx-auto">
            Join a community of ambitious young people committed to everyday advancement 
            and 360° personal development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#7EF949] hover:bg-[#9aff6e] text-[#193564] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Become a Member
            </button>
            <button className="border-2 border-[#FFFCFF] text-[#FFFCFF] hover:bg-[#FFFCFF] hover:text-[#193564] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Attend an Event
            </button>
          </div>
          
          {/* Community Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-8 border-t border-[#7EF949]/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7EF949] mb-2">Weekly</div>
              <div className="text-[#FFFCFF]/80">Workshops & Seminars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7EF949] mb-2">Monthly</div>
              <div className="text-[#FFFCFF]/80">Networking Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#7EF949] mb-2">Quarterly</div>
              <div className="text-[#FFFCFF]/80">Growth Challenges</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TheFruiitScreen;