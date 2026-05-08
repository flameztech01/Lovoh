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
  FaRocket,
  FaPlayCircle,
  FaCheckCircle,
  FaStar,
  FaArrowRight
} from 'react-icons/fa';
import Footer from '../components/Footer.jsx';

const CreateInstituteScreen = () => {
  const [activeTrack, setActiveTrack] = useState('All');

  const heroImages = [
    "/learning1.jpg",
    "/learning2.jpg",
    "/learning3.jpg",
    "/learning4.jpg"
  ];

  const programStructure = [
    {
      id: 1,
      phase: "Week 1",
      title: "Foundations & Orientation",
      description: "Digital basics, brand awareness, tools & workflows",
      duration: "1 Week",
      focus: "Alignment & Shared Language",
      icon: <FaGraduationCap />,
      color: "bg-blue-100 text-blue-700",
      image: "/foundation.jpg",
      stats: ["100% Practical", "Team Integration", "Toolkit Provided"]
    },
    {
      id: 2,
      phase: "Weeks 2-5",
      title: "Specialization Tracks",
      description: "Deep dive into chosen specialization",
      duration: "4 Weeks",
      focus: "Track-Specific Mastery",
      icon: <FaChalkboardTeacher />,
      color: "bg-purple-100 text-purple-700",
      image: "/specialization.jpg",
      stats: ["Hands-on Projects", "Expert Mentors", "Live Feedback"]
    },
    {
      id: 3,
      phase: "Weeks 6-8",
      title: "Guided Internship",
      description: "Real workflow exposure with supervision",
      duration: "3 Weeks",
      focus: "Industry Experience",
      icon: <FaBriefcase />,
      color: "bg-green-100 text-green-700",
      image: "/internship.jpg",
      stats: ["Client Projects", "Team Collaboration", "Portfolio Building"]
    }
  ];

  const tracks = [
    {
      id: 1,
      name: "Strategy Track",
      title: "Brand Strategy & Business Thinking",
      description: "Learn to think strategically about brands and business positioning",
      duration: "4 Weeks",
      outcome: "Think strategically about brands and business",
      icon: <FaBullseye />,
      color: "from-blue-500 to-blue-700",
      image: "/strategy.jpg",
      facilitators: ["Industry Strategists", "BDM Team", "Business Leaders"],
      skills: ["Brand Positioning", "Business Models", "Strategy Documentation"],
      projects: 5,
      mentors: 3
    },
    {
      id: 2,
      name: "Media & Marketing",
      title: "Content & Campaign Execution",
      description: "Master social media, content creation, and campaign management",
      duration: "4 Weeks",
      outcome: "Execute marketing campaigns effectively",
      icon: <FaChartLine />,
      color: "from-purple-500 to-purple-700",
      image: "/marketing.jpg",
      facilitators: ["Digital Experts", "Content Creators", "Media Specialists"],
      skills: ["Social Media", "Content Creation", "Campaign Management"],
      projects: 6,
      mentors: 4
    },
    {
      id: 3,
      name: "Tech Track",
      title: "Digital Products & Systems",
      description: "Build digital solutions with no-code/low-code tools",
      duration: "4 Weeks",
      outcome: "Build digital solutions",
      icon: <FaLaptopCode />,
      color: "from-green-500 to-green-700",
      image: "/tech.jpg",
      facilitators: ["Tech Innovators", "Product Designers", "Developers"],
      skills: ["Web Development", "No-Code Tools", "Product Thinking"],
      projects: 4,
      mentors: 3
    }
  ];

  const successStories = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "Marketing Strategist",
      track: "Strategy Track",
      image: "/alumni1.jpg",
      quote: "The practical approach transformed how I think about brands.",
      company: "Now at TechCorp"
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Content Director",
      track: "Media & Marketing",
      image: "/alumni2.jpg",
      quote: "From theory to execution in 8 weeks. Game-changing!",
      company: "Leading at CreativeHub"
    },
    {
      id: 3,
      name: "Marcus Lee",
      role: "Product Builder",
      track: "Tech Track",
      image: "/alumni3.jpg",
      quote: "Built my first MVP during the internship phase.",
      company: "Founder at StartupX"
    }
  ];

  const campusLife = [
    "/campus1.jpg",
    "/campus2.jpg",
    "/campus3.jpg",
    "/campus4.jpg",
    "/campus5.jpg",
    "/campus6.jpg"
  ];

  const keyFeatures = [
    {
      id: 1,
      title: "Cohort Learning",
      description: "Learn with a community of driven peers",
      icon: <FaUsers />,
      image: "/feature-cohort.jpg",
      color: "bg-[#004aff]"
    },
    {
      id: 2,
      title: "Live Projects",
      description: "Work on real client briefs from day one",
      icon: <FaBriefcase />,
      image: "/feature-projects.jpg",
      color: "bg-[#004aff]"
    },
    {
      id: 3,
      title: "Expert Mentors",
      description: "Industry professionals guide your journey",
      icon: <FaChalkboardTeacher />,
      image: "/feature-mentors.jpg",
      color: "bg-[#004aff]"
    },
    {
      id: 4,
      title: "Portfolio Ready",
      description: "Graduate with tangible work samples",
      icon: <FaCertificate />,
      image: "/feature-portfolio.jpg",
      color: "bg-[#004aff]"
    }
  ];

  const filteredTracks = activeTrack === "All" ? tracks : tracks.filter(track => track.name === activeTrack);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Slider */}
      <section className="mt-10 relative h-screen overflow-hidden">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {heroImages.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === 0 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img 
                src={img} 
                alt={`Learning ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#004aff]/90 to-[#004aff]/70"></div>
            </div>
          ))}
        </div>

        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 backdrop-blur-sm bg-white/10 rounded-3xl p-8 lg:p-12 border border-white/20">
              {/* Institute Logo - Made Smaller */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-4">
                  <img 
                    src="/6.png" 
                    alt="Create Institute" 
                    className="h-20 w-auto"
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-3 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-semibold text-sm uppercase tracking-wider">
                  Cohort 1 Applications Open • January Intake
                </span>
              </div>

              {/* <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl">
                Create Institute
              </h1> */}
              
              <p className="text-2xl lg:text-3xl text-white/90 italic font-light mb-6">
                Where Theory Meets <span className="font-bold text-green-300">Execution</span>
              </p>
              
              <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
                An immersive 8-week journey transforming creative talent into 
                <span className="font-bold text-yellow-300"> execution-ready professionals</span> through hands-on learning.
              </p>

              {/* Video Preview */}
              {/* <div className="flex justify-center my-8">
                <div className="relative group cursor-pointer">
                  <div className="w-32 h-32 bg-[#004aff] rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                    <FaPlayCircle className="text-white text-4xl" />
                  </div>
                  <div className="absolute inset-0 animate-ping rounded-full border-4 border-white/30 group-hover:border-white/50"></div>
                </div>
              </div> */}

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
                <button className="group bg-[#004aff] hover:bg-[#003bd6] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3">
                  Apply Now
                  <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
                </button>
                <button className="group border-2 border-white text-white hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
                  View Program Tour
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {/* <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div> */}
      </section>

      {/* Visual Program Structure */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Your <span className="text-[#004aff]">8-Week Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A visual roadmap from learning to execution
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {programStructure.map((phase, index) => (
              <div 
                key={phase.id}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img 
                    src={phase.image} 
                    alt={phase.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="relative h-full min-h-[500px] flex flex-col justify-end p-8">
                  {/* Phase Badge */}
                  <div className="absolute top-6 left-6">
                    <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold">
                      Phase {index + 1}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${phase.color} flex items-center justify-center text-xl`}>
                        {phase.icon}
                      </div>
                      <div>
                        <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                          {phase.phase}
                        </span>
                        <h3 className="text-2xl font-bold text-white">
                          {phase.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-white/90 text-lg">
                      {phase.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3">
                      {phase.stats.map((stat, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                          <span className="text-white text-sm font-medium">{stat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                      <span className="text-white font-bold text-lg">{phase.duration}</span>
                      <span className="text-green-300 font-bold">{phase.focus}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tracks Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your <span className="text-[#004aff]">Pathway</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Specialize in one track and master it through intensive, project-based learning
            </p>
          </div>

          {/* Track Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveTrack('All')}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                activeTrack === 'All'
                  ? 'bg-[#004aff] text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#004aff]'
              }`}
            >
              All Tracks
            </button>
            {tracks.map((track) => (
              <button
                key={track.name}
                onClick={() => setActiveTrack(track.name)}
                className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  activeTrack === track.name
                    ? 'bg-[#004aff] text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-[#004aff]'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>

          {/* Tracks Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {filteredTracks.map((track) => (
              <div 
                key={track.id}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700"
              >
                {/* Track Image */}
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={track.image} 
                    alt={track.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/90 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      {track.projects} Projects
                    </span>
                  </div>
                </div>

                {/* Track Content */}
                <div className="p-8 bg-white">
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-[#004aff] text-white flex items-center justify-center text-2xl`}>
                      {track.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{track.name}</h3>
                      <p className="text-gray-600">{track.duration} • {track.mentors} Mentors</p>
                    </div>
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-4">{track.title}</h4>
                  <p className="text-gray-600 mb-6 leading-relaxed">{track.description}</p>

                  {/* Skills */}
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">You'll Master:</h5>
                    <div className="flex flex-wrap gap-2">
                      {track.skills.map((skill, index) => (
                        <span key={index} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#004aff]">{track.projects}</div>
                      <div className="text-sm text-gray-600">Live Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#004aff]">{track.mentors}</div>
                      <div className="text-sm text-gray-600">Expert Mentors</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">100%</div>
                      <div className="text-sm text-gray-600">Practical</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#004aff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Success <span className="text-yellow-300">Stories</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Hear from professionals who transformed their careers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story) => (
              <div 
                key={story.id}
                className="group relative overflow-hidden rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-4"
              >
                {/* Story Image */}
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={story.image} 
                    alt={story.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  
                  {/* Track Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-bold">
                      {story.track}
                    </span>
                  </div>
                </div>

                {/* Story Content */}
                <div className="p-8 bg-white">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#004aff] rounded-full flex items-center justify-center text-white text-lg font-bold">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                      <p className="text-[#004aff] font-semibold">{story.role}</p>
                      <p className="text-gray-500 text-sm">{story.company}</p>
                    </div>
                  </div>

                  <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-6">
                    "{story.quote}"
                  </blockquote>

                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Campus Life Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Campus <span className="text-[#004aff]">Life</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the vibrant learning environment
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            {campusLife.map((img, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group"
              >
                <img 
                  src={img} 
                  alt={`Campus ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-medium text-sm">View</span>
                </div>
              </div>
            ))}
          </div>

          {/* Features Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature) => (
              <div 
                key={feature.id}
                className="group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500"
              >
                {/* Feature Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center text-xl ${feature.color}`}>
                      {feature.icon}
                    </div>
                  </div>
                </div>

                {/* Feature Content */}
                <div className="p-6 bg-white">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-[#004aff] font-semibold group-hover:gap-3 transition-all duration-300">
                    <span>Learn more</span>
                    <FaArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#004aff]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Cohort 1 <span className="text-yellow-300">Timeline</span>
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              January Intake • 8 Weeks • Limited Spots
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-white/30"></div>

            {/* Timeline Items */}
            <div className="space-y-16">
              {/* January */}
              <div className="relative flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-1/3">
                      <div className="relative">
                        <img 
                          src="/january.jpg" 
                          alt="January"
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute -top-4 -right-4">
                          <div className="bg-white text-[#004aff] px-6 py-3 rounded-2xl font-bold text-lg">
                            JAN
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Foundations & Specialization Kickoff
                      </h3>
                      <p className="text-white/90 mb-6">
                        Week 1: Orientation & digital mastery • Weeks 2-5: Deep specialization in chosen track with expert mentors
                      </p>
                      <div className="flex items-center gap-4">
                        <FaCheckCircle className="text-green-400 text-xl" />
                        <span className="text-white font-medium">Applications Open Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* February-March */}
              <div className="relative flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-1/3 order-2 md:order-1">
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Guided Internship & Portfolio Building
                      </h3>
                      <p className="text-white/90 mb-6">
                        Weeks 6-8: Real client projects, supervised execution, and portfolio development with industry partners
                      </p>
                      <div className="flex items-center gap-4">
                        <FaCertificate className="text-yellow-400 text-xl" />
                        <span className="text-white font-medium">Certificate & Placement Support</span>
                      </div>
                    </div>
                    <div className="md:w-1/3 order-1 md:order-2">
                      <div className="relative">
                        <img 
                          src="/march.jpg" 
                          alt="February-March"
                          className="w-full h-48 object-cover rounded-2xl shadow-2xl"
                        />
                        <div className="absolute -top-4 -left-4">
                          <div className="bg-white text-[#004aff] px-6 py-3 rounded-2xl font-bold text-lg">
                            FEB-MAR
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA with Gallery Background */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Gallery */}
        <div className="absolute inset-0 grid grid-cols-4 gap-0">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="overflow-hidden">
              <img 
                src={`/images/cta${num}.jpg`}
                alt={`CTA Background ${num}`}
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[#004aff]/90"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-2xl">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto backdrop-blur-sm bg-white/10 p-6 rounded-3xl border border-white/20">
            Join Cohort 1 and become part of a new generation of 
            <span className="font-bold text-yellow-300"> execution-ready professionals</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button className="group bg-[#004aff] hover:bg-[#003bd6] text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3">
              <FaRocket className="group-hover:animate-pulse" />
              Apply for Cohort 1
              <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <button className="group bg-white/20 backdrop-blur-lg border-2 border-white text-white hover:bg-white/30 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105">
              Book Campus Tour
            </button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">24</div>
              <div className="text-white/80">Spots Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">8</div>
              <div className="text-white/80">Weeks Intensive</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">15+</div>
              <div className="text-white/80">Live Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-white/80">Practical Learning</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CreateInstituteScreen;