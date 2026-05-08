import { Link } from 'react-router-dom';
import { 
  FiTarget, 
  FiMessageCircle, 
  FiBarChart2, 
  FiMonitor,
  FiArrowRight 
} from 'react-icons/fi';
import { 
  BsLightbulb, 
  BsMegaphone, 
  BsBrush, 
  BsGraphUp, 
  BsLaptop,
  BsCheckCircle,
  BsCalendarCheck,
  BsClock
} from 'react-icons/bs';
import { MdDesignServices, MdOutlineSocialDistance } from 'react-icons/md';
import { FaRegGem } from 'react-icons/fa';

interface ServicesProps {
  onCtaClick?: () => void;
}

const Services = ({ onCtaClick }: ServicesProps) => {
  const services = [
    {
      name: "Brand Strategy & Positioning",
      description: "Define your unique space in the market",
      icon: FiTarget,
      secondaryIcon: BsLightbulb,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Messaging & Tone Development",
      description: "Speak directly to your ideal clients",
      icon: FiMessageCircle,
      secondaryIcon: BsMegaphone,
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Visual Identity & Graphic Design",
      description: "Look professional and memorable",
      icon: BsBrush,
      secondaryIcon: MdDesignServices,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Social Media Management",
      description: "Build community that converts",
      icon: MdOutlineSocialDistance,
      secondaryIcon: MdOutlineSocialDistance,
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Paid Advertising (Meta & Google)",
      description: "Turn ad spend into revenue",
      icon: FiBarChart2,
      secondaryIcon: BsGraphUp,
      color: "from-blue-700 to-blue-800"
    },
    {
      name: "Website Design & Optimization",
      description: "Your 24/7 sales machine",
      icon: FiMonitor,
      secondaryIcon: BsLaptop,
      color: "from-blue-600 to-blue-700"
    }
  ];

  const benefits = [
    "Strategy-first approach",
    "Results-driven execution",
    "Clear communication",
    "Monthly optimization"
  ];

  return (
    <section id="services" className="relative py-20 md:py-28 bg-white overflow-hidden">
      {/* Decorative Background Elements - Removed silver grid, kept subtle blue blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-40 left-0 w-72 h-72 bg-blue-50 rounded-full filter blur-3xl" />
        <div className="absolute bottom-40 right-0 w-72 h-72 bg-blue-50 rounded-full filter blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 shadow-sm">
            <FaRegGem className="w-4 h-4 text-blue-600" />
            <span className="text-xs md:text-sm font-medium text-blue-700 uppercase tracking-wider">
              Our Services
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
          </div>

          {/* Headline - Removed gradients for solid text */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gray-900">What</span>{' '}
            <span className="text-blue-600">We Do</span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <BsCheckCircle className="w-5 h-5 text-blue-500" />
            Simple, clear, and designed to get results.
          </p>
        </div>

        {/* Services Grid - Clean cards */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1 h-0.5 bg-gray-100 rounded-full" />
                  
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <service.secondaryIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiArrowRight className="w-5 h-5 text-blue-500" />
                </div>

                <div className="absolute top-4 right-4 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
                  <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Strip - Left aligned on mobile, centered on desktop */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center justify-start md:justify-center gap-4 md:gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <BsCheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{benefit}</span>
                  {index < benefits.length - 1 && (
                    <div className="hidden md:block w-1 h-1 bg-gray-300 rounded-full ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA - Simplified, no gradients */}
        <div className="max-w-4xl mx-auto text-center mt-20">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-gray-200 shadow-lg">
            <div className="inline-flex p-3 bg-blue-600 rounded-xl mb-6 shadow-sm">
              <BsCalendarCheck className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to move into{' '}
              <span className="text-blue-600">Q2 with clarity?</span>
            </h3>
            
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Book a free strategy session and let's map out your brand's next quarter.
            </p>
            
            <Link
              to="#contact"
              onClick={(e) => {
                e.preventDefault();
                if (onCtaClick) {
                  onCtaClick();
                } else {
                  const contactSection = document.getElementById('contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }
              }}
              className="group inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <span>Book Free Session</span>
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <BsClock className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">30-minute strategy session</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <BsCheckCircle className="w-4 h-4 text-blue-500" />
                <span className="text-xs text-gray-500">100% free</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Services;