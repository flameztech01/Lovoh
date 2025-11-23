// components/about/WhyChooseUs.jsx
import React from 'react';
import { 
  FaBullseye, 
  FaBolt, 
  FaLightbulb, 
  FaChartLine 
} from 'react-icons/fa';

const Whychooseus = () => {
  const features = [
    {
      icon: <FaBullseye />,
      title: 'Strategic Partnership',
      description: 'We become an extension of your team, working closely to understand your goals and deliver solutions that drive real business impact.',
      stats: '150+ Successful Partnerships'
    },
    {
      icon: <FaBolt />,
      title: 'Rapid Execution',
      description: 'Our agile methodology ensures quick turnaround times without compromising on quality or strategic depth.',
      stats: '98% On-Time Delivery'
    },
    {
      icon: <FaLightbulb />,
      title: 'Innovation-Driven',
      description: 'We stay ahead of industry trends and leverage cutting-edge technologies to keep your brand competitive and relevant.',
      stats: '50+ Tech Innovations'
    },
    {
      icon: <FaChartLine />,
      title: 'Measurable Results',
      description: 'Every project includes clear KPIs and analytics to track performance and demonstrate ROI to stakeholders.',
      stats: 'Average 3x ROI'
    }
  ];

  const process = [
    { step: '01', title: 'Discover & Analyze', description: 'Deep dive into your business, market, and audience' },
    { step: '02', title: 'Strategize & Plan', description: 'Develop data-driven strategies tailored to your goals' },
    { step: '03', title: 'Create & Execute', description: 'Bring ideas to life with precision and creativity' },
    { step: '04', title: 'Optimize & Scale', description: 'Continuously improve and scale successful initiatives' }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#254899] to-[#1a3480]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            The Lovoh Create
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ebed17] to-[#f0f269]">
              Difference
            </span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-[#ebed17] rounded-2xl flex items-center justify-center text-2xl text-[#254899] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-gray-200 leading-relaxed mb-4">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 bg-[#ebed17] text-[#254899] px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-[#254899] rounded-full"></div>
                    <span className="font-semibold text-sm">{feature.stats}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Process Section */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Proven Process
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A structured approach that ensures consistency, quality, and outstanding results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, index) => (
              <div 
                key={index}
                className="group text-center p-6 rounded-2xl border-2 border-gray-100 hover:border-[#254899] transition-all duration-300 hover:shadow-lg"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#254899] to-[#1a3480] rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                  {step.step}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                
                {/* Connector Line */}
                {index < process.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-6 h-0.5 bg-gray-200 group-hover:bg-[#254899] transition-colors duration-300"></div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <div className="inline-flex flex-col sm:flex-row gap-6 items-center bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-2xl px-8 py-6 text-white">
              <div className="text-left">
                <h4 className="text-2xl font-bold mb-2">Ready to Get Started?</h4>
                <p className="text-white/80">Let's discuss how we can help transform your business</p>
              </div>
              <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap">
                Start Your Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Whychooseus;