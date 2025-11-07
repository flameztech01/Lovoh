import React from 'react';
import { Link } from 'react-router-dom';

const Aboutcta = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#37acf7]/20 to-[#79ffff]/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-[#3c3c4e] mb-6">
          Ready to Work Together?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Let's discuss how our team can help bring your vision to life and drive your business forward.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/contact"
            className="bg-[#004aff] hover:bg-[#054889] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Start Your Project
          </Link>
          <Link 
            to="/work"
            className="border-2 border-[#3c3c4e]/30 hover:border-[#004aff] text-[#3c3c4e] hover:text-[#004aff] px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
          >
            View Our Work
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#004aff]">5+</div>
            <div className="text-[#3c3c4e] text-sm">Years Excellence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#2f7dcb]">15+</div>
            <div className="text-[#3c3c4e] text-sm">Experts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#054889]">98%</div>
            <div className="text-[#3c3c4e] text-sm">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Aboutcta;