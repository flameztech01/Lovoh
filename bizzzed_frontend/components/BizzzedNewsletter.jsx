// components/BizzzedNewsletter.jsx
import React, { useState } from 'react';
import { FaEnvelope, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { useSubscribeToMagazineMutation } from '../slices/magApiSlice';
import { toast } from 'react-toastify';

const BizzzedNewsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribeToMagazine, { isLoading }] = useSubscribeToMagazineMutation();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      await subscribeToMagazine({ email, name }).unwrap();
      setIsSubscribed(true);
      setEmail('');
      setName('');
      toast.success('Successfully subscribed to Bizzzed Magazine!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <section id="newsletter-section" className="py-16 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1B3766] rounded-2xl p-8 md:p-12 text-center">
          {!isSubscribed ? (
            <>
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Stay Bizzzed
              </h2>
              <p className="text-gray-200 mb-6 max-w-md mx-auto text-sm">
                Get the latest business insights, trends, and strategies delivered straight to your inbox.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white text-sm"
                  required
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-white text-[#1B3766] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 text-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                  <FaArrowRight className="text-xs" />
                </button>
              </form>
              
              <p className="text-gray-300 text-xs mt-4">
                No spam, unsubscribe at any time
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <FaCheckCircle className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                You're Subscribed!
              </h2>
              <p className="text-gray-200 mb-4 max-w-md mx-auto text-sm">
                Thank you for subscribing to Bizzzed Magazine. Get ready for premium insights in your inbox.
              </p>
              <button 
                onClick={() => setIsSubscribed(false)}
                className="bg-white text-[#1B3766] px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all text-sm"
              >
                Subscribe Another Email
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BizzzedNewsletter;