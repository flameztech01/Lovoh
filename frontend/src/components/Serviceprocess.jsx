// components/services/ServiceProcess.jsx
import React from 'react';
import { 
  FaSearch, 
  FaClipboardList, 
  FaPalette, 
  FaCheck, 
  FaRocket, 
  FaChartLine 
} from 'react-icons/fa';

const Serviceprocess = () => {
  const process = [
    {
      step: "01",
      title: "Discovery & Analysis",
      description: "We dive deep into your business, market, and goals to understand your unique challenges and opportunities.",
      icon: <FaSearch />,
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      step: "02",
      title: "Strategy & Planning",
      description: "We develop a comprehensive strategy tailored to your objectives with clear milestones and KPIs.",
      icon: <FaClipboardList />,
      color: "from-[#ebed17] to-[#f0f269]"
    },
    {
      step: "03",
      title: "Design & Development",
      description: "Our team brings the strategy to life with creative design and robust technical implementation.",
      icon: <FaPalette />,
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      step: "04",
      title: "Testing & Quality",
      description: "Rigorous testing ensures everything works perfectly and meets the highest quality standards.",
      icon: <FaCheck />,
      color: "from-[#ebed17] to-[#f0f269]"
    },
    {
      step: "05",
      title: "Launch & Deploy",
      description: "We manage the launch process smoothly and ensure everything goes live without issues.",
      icon: <FaRocket />,
      color: "from-[#254899] to-[#1a3480]"
    },
    {
      step: "06",
      title: "Optimize & Scale",
      description: "Continuous monitoring and optimization to ensure long-term success and scalability.",
      icon: <FaChartLine />,
      color: "from-[#ebed17] to-[#f0f269]"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              Our Process
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            How We Deliver
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#254899] to-[#ebed17]">
              Excellence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            A structured, transparent process that ensures quality, efficiency, and outstanding results 
            at every stage of your project.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {process.map((step, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
            >
              {/* Step Number */}
              <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                {step.step}
              </div>

              {/* Icon */}
              <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-2xl ${
                step.color.includes('254899') 
                  ? 'bg-[#254899] text-white' 
                  : 'bg-[#ebed17] text-[#254899]'
              } group-hover:scale-110 transition-transform duration-300 mt-4`}>
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#254899] transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                {step.description}
              </p>

              {/* Hover Effect */}
              <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 ${
                step.color.includes('254899') ? 'bg-[#254899]' : 'bg-[#ebed17]'
              } group-hover:w-3/4 transition-all duration-500 rounded-full`}></div>
            </div>
          ))}
        </div>

        {/* Process Timeline (Desktop) */}
        <div className="hidden lg:block mt-16 relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          
          <div className="relative flex justify-between">
            {process.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${
                  step.color.includes('254899') ? 'bg-[#254899]' : 'bg-[#ebed17]'
                } border-4 border-white shadow-lg z-10`}></div>
                <div className="mt-2 text-sm font-medium text-gray-600 text-center max-w-24">
                  {step.title.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-6 items-center bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-2xl px-8 py-6 text-white shadow-2xl">
            <div className="text-left">
              <h4 className="text-2xl font-bold mb-2">Ready to Start Your Project?</h4>
              <p className="text-white/80">Let's discuss your requirements and create a custom plan</p>
            </div>
            <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
              Schedule Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Serviceprocess;