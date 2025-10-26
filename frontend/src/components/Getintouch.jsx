import React from 'react'
import { useState } from 'react'
import { useUserMessageMutation } from '../slices/appApiSlice';
import { toast } from 'react-toastify';

const Getintouch = () => {
    const [userMessage, { isLoading, error }] = useUserMessageMutation();
    
    if(isLoading){
        console.log('Loading')
    };

    if(error) {
        console.log('error')
    };

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
           const res = await userMessage({name, email, subject, message}).unwrap();
           toast.success('Message Sent Successfully')
           // Clear form
           setName('');
           setEmail('');
           setSubject('');
           setMessage('');
        } catch (error) {
            toast.error(error?.data?.message || error.error);
        }
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#054889] via-[#004aff] to-[#3c3c4e] py-20 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#79ffff] to-[#ebed47]">Touch</span>
        </h1>
        <p className="text-xl text-[#79ffff]">
          Let's make your new Success story
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-[#37acf7]/30">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-white font-semibold mb-2">
                  Name
                </label>
                <input 
                  type="text" 
                  id="name"
                  placeholder='Enter Your Name'
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="w-full px-4 py-3 bg-white/5 border border-[#37acf7]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#79ffff] focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  id="email"
                  placeholder='Enter Your Email'
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className="w-full px-4 py-3 bg-white/5 border border-[#37acf7]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#79ffff] focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-white font-semibold mb-2">
                Subject
              </label>
              <input 
                type="text" 
                id="subject"
                placeholder='Enter The Subject'
                onChange={(e) => setSubject(e.target.value)}
                value={subject}
                className="w-full px-4 py-3 bg-white/5 border border-[#37acf7]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#79ffff] focus:border-transparent transition-all duration-300"
                required
              />
            </div>

            {/* Message Field */}
            <div className="mb-8">
              <label htmlFor="message" className="block text-white font-semibold mb-2">
                Message
              </label>
              <textarea 
                id="message"
                placeholder='Enter Your Message'
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                rows="6"
                className="w-full px-4 py-3 bg-white/5 border border-[#37acf7]/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#79ffff] focus:border-transparent transition-all duration-300 resize-none"
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#004aff] to-[#2f7dcb] hover:from-[#054889] hover:to-[#004aff] text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send a Message'
              )}
            </button>
          </form>
        </div>

        {/* Contact Details */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 lg:p-12 border border-[#37acf7]/30">
          <div className="text-center h-full flex flex-col justify-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-8">
              We can't wait to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ebed47] to-[#79ffff]">win</span> with you!
            </h1>
            
            <div className="space-y-6 text-lg text-gray-300">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#37acf7]/20 rounded-full flex items-center justify-center border border-[#37acf7]/30">
                  <svg className="w-5 h-5 text-[#37acf7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p>3, Amode Close, Ikeja, Lagos, Nigeria.</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#79ffff]/20 rounded-full flex items-center justify-center border border-[#79ffff]/30">
                  <svg className="w-5 h-5 text-[#79ffff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p>growth@lovohcreate.com</p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#ebed47]/20 rounded-full flex items-center justify-center border border-[#ebed47]/30">
                  <svg className="w-5 h-5 text-[#ebed47]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p>+2347059585905</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements for Decoration */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-[#37acf7] rounded-full opacity-60 animate-pulse"></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-[#79ffff] rounded-full opacity-40 animate-bounce"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-[#ebed47] rounded-full opacity-60 animate-pulse"></div>
    </div>
  )
}

export default Getintouch