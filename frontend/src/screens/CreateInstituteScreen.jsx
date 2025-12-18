// screens/CreateInstituteScreen.jsx
import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt, 
  FaChalkboardTeacher,
  FaCertificate,
  FaBriefcase,
  FaLightbulb,
  FaChartLine,
  FaLaptopCode,
  FaBullseye,
  FaHandsHelping,
  FaClipboardCheck,
  FaRocket
} from 'react-icons/fa';
import Footer from '../components/Footer.jsx';

const CreateInstituteScreen = () => {
  const [activeTrack, setActiveTrack] = useState('All');

  const programStructure = [
    {
      id: 1,
      phase: "Week 1",
      title: "Foundations & Orientation",
      description: "Digital basics, brand awareness, tools & workflows, professional expectations",
      duration: "1 Week",
      focus: "Alignment & Shared Language",
      icon: <FaGraduationCap />,
      color: "bg-blue-100 text-blue-700"
    },
    {
      id: 2,
      phase: "Weeks 2-5",
      title: "Specialization Tracks",
      description: "Deep dive into chosen specialization with practical, hands-on learning",
      duration: "4 Weeks",
      focus: "Track-Specific Skills",
      icon: <FaChalkboardTeacher />,
      color: "bg-purple-100 text-purple-700"
    },
    {
      id: 3,
      phase: "Weeks 6-8",
      title: "Guided Internship",
      description: "Track-aligned participation with controlled exposure and supervised execution",
      duration: "3 Weeks",
      focus: "Real Workflow Experience",
      icon: <FaBriefcase />,
      color: "bg-green-100 text-green-700"
    }
  ];

  const tracks = [
    {
      id: 1,
      name: "Strategy Track",
      title: "Brand Strategy & Business Thinking",
      description: "Learn brand positioning, business models, strategy documentation, and structuring brands for growth",
      duration: "4 Weeks",
      outcome: "Think strategically about brands and business",
      icon: <FaBullseye />,
      color: "from-blue-500 to-blue-700",
      facilitators: ["BDM Unit", "Business Strategist", "External Experts"],
      skills: ["Brand Positioning", "Business Models", "Strategy Documentation", "Growth Structuring"]
    },
    {
      id: 2,
      name: "Media & Marketing",
      title: "Media, Content & Campaign Execution",
      description: "Master social media management, content creation, campaign execution, and performance reporting",
      duration: "4 Weeks",
      outcome: "Execute marketing campaigns effectively",
      icon: <FaChartLine />,
      color: "from-purple-500 to-purple-700",
      facilitators: ["Head of Digitals", "Digital & Creative Unit", "Media Experts"],
      skills: ["Social Media", "Content Creation", "Campaign Management", "Performance Analysis"]
    },
    {
      id: 3,
      name: "Tech Track",
      title: "Digital Products & Systems",
      description: "Learn web fundamentals, no-code/low-code tools, software thinking, and product mindset",
      duration: "4 Weeks",
      outcome: "Build digital solutions",
      icon: <FaLaptopCode />,
      color: "from-green-500 to-green-700",
      facilitators: ["Innovation & Tech Unit", "Product Experts", "Tech Facilitators"],
      skills: ["Web Fundamentals", "No-Code Tools", "Product Thinking", "Systems Mindset"]
    }
  ];

  const leadershipTeam = [
    {
      id: 1,
      role: "Head of Digitals",
      title: "Academic / Program Lead",
      responsibilities: [
        "Own curriculum delivery",
        "Coordinate all tracks",
        "Supervise facilitators",
        "Ensure learning quality"
      ],
      icon: <FaChalkboardTeacher />
    },
    {
      id: 2,
      role: "BDM Unit",
      title: "Integration & Sustainability Engine",
      responsibilities: [
        "Design workflow integration",
        "Control project exposure",
        "Balance learning & business needs",
        "Ensure scalability"
      ],
      icon: <FaHandsHelping />
    },
    {
      id: 3,
      role: "CGO Office",
      title: "Program Governance & Quality",
      responsibilities: [
        "Manage external facilitators",
        "Maintain learning standards",
        "Track learner outcomes",
        "Ensure accountability"
      ],
      icon: <FaClipboardCheck />
    }
  ];

  const programDetails = [
    {
      id: 1,
      title: "Cohort-Based Model",
      description: "8-week intensive programs with structured progression",
      icon: <FaUsers />
    },
    {
      id: 2,
      title: "Practical-First Learning",
      description: "Learn by doing with real workflow exposure",
      icon: <FaLightbulb />
    },
    {
      id: 3,
      title: "Structured Timeline",
      description: "Weekly flow with clear milestones and deliverables",
      icon: <FaCalendarAlt />
    },
    {
      id: 4,
      title: "Certification",
      description: "Graduate with verified skills and portfolio",
      icon: <FaCertificate />
    }
  ];

  const filteredTracks = activeTrack === "All" 
    ? tracks 
    : tracks.filter(track => track.name === activeTrack);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="mt-10 relative py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Sub-brand Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/create-institute-logo.png" 
                alt="Create Institute" 
                className="h-40 w-auto"
              />
            </div>

            {/* Program Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-sm uppercase tracking-wider">
                A Lovoh Create Talent Development Program
              </span>
            </div>

            {/* Institute Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Create Institute
            </h1>
            
            {/* Tagline */}
            <p className="text-2xl lg:text-3xl text-blue-100 italic">
              Execution-Ready Talent Development
            </p>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              An 8-week structured program training creatives, marketers, strategists, 
              and tech talents through practical learning and real workflow exposure.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Apply Now
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Download Brochure
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Program Structure Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              8-Week Program Structure
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A carefully designed progression from foundations to guided internship
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {programStructure.map((phase) => (
              <div 
                key={phase.id}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-2xl ${phase.color} flex items-center justify-center text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    {phase.icon}
                  </div>
                  
                  <div className="text-center mb-4">
                    <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                      {phase.phase}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {phase.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {phase.description}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Duration:</span>
                      <span className="font-bold">{phase.duration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Focus:</span>
                      <span className="font-bold text-blue-600">{phase.focus}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialization Tracks Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Specialization Track
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deep dive into one track during weeks 2-5 for focused skill development
            </p>
          </div>

          {/* Track Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setActiveTrack('All')}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeTrack === 'All'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600 hover:text-blue-600'
              }`}
            >
              All Tracks
            </button>
            {tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => setActiveTrack(track.name)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTrack === track.name
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredTracks.map((track) => (
              <div 
                key={track.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                {/* Track Header */}
                <div className={`h-3 bg-gradient-to-r ${track.color}`}></div>
                
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${track.color} text-white flex items-center justify-center text-xl`}>
                      {track.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{track.name}</h3>
                      <p className="text-gray-600 text-sm">{track.duration}</p>
                    </div>
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 mb-3">
                    {track.title}
                  </h4>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {track.description}
                  </p>

                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Key Skills:</h5>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Facilitated By:</h5>
                    <div className="space-y-2">
                      {track.facilitators.map((facilitator, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-700">{facilitator}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 font-medium">Outcome:</span>
                      <span className="font-bold text-blue-600">{track.outcome}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance & Leadership Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Program Governance & Leadership
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Structured oversight ensuring quality, integration, and sustainability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leadershipTeam.map((leader) => (
              <div 
                key={leader.id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    {leader.icon}
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {leader.role}
                    </h3>
                    <p className="text-blue-600 font-semibold mb-4">
                      {leader.title}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Responsibilities:</h4>
                    {leader.responsibilities.map((responsibility, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{responsibility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Details */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Program Features & Benefits
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programDetails.map((detail) => (
              <div 
                key={detail.id}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-gray-100"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white text-lg mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {detail.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  {detail.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {detail.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Benefits */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Welcome Pack
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-white">
                    <FaRocket className="text-green-400" />
                    <span>Digital ID Card / Member's Card</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <FaRocket className="text-green-400" />
                    <span>Onboarding materials & assets</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <FaRocket className="text-green-400" />
                    <span>Social media assets & toolkit</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Post-Program Support
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-white">
                    <FaCertificate className="text-yellow-400" />
                    <span>Graduation Certificate</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <FaBriefcase className="text-yellow-400" />
                    <span>CV & Portfolio Guidance</span>
                  </li>
                  <li className="flex items-center gap-3 text-white">
                    <FaHandsHelping className="text-yellow-400" />
                    <span>Placement Recommendations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cohort 1 Timeline */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cohort 1 — January Intake
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our inaugural cohort and be part of the first wave of execution-ready talent
            </p>
          </div>

          <div className="bg-gray-50 rounded-3xl p-8">
            <div className="space-y-8">
              {/* January Phase */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                  <div className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-center">
                    <span className="block text-2xl font-bold">JANUARY</span>
                    <span className="block text-lg">Weeks 1-5</span>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Foundations & Specialization
                  </h3>
                  <p className="text-gray-600">
                    Week 1: Orientation & digital basics • Weeks 2-5: Deep dive into chosen specialization track
                  </p>
                </div>
              </div>

              {/* February-March Phase */}
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="md:w-1/3">
                  <div className="bg-green-600 text-white px-6 py-4 rounded-2xl text-center">
                    <span className="block text-2xl font-bold">FEB-MAR</span>
                    <span className="block text-lg">Weeks 6-8</span>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Guided Internship
                  </h3>
                  <p className="text-gray-600">
                    Track-aligned participation with supervised execution and controlled workflow exposure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Application CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Become Execution-Ready?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join Create Institute and transform theoretical knowledge into practical, 
            job-ready skills through our structured 8-week program.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Apply for Cohort 1
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Schedule Consultation
            </button>
          </div>
          
          <p className="text-sm text-blue-300 mt-6">
            Limited spots available for our inaugural cohort
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreateInstituteScreen;