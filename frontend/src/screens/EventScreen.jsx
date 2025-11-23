// screens/EventsScreen.jsx
import React, { useState } from 'react';
import Header from '../components/Header.jsx';

const EventsScreen = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const upcomingEvents = [
    {
      id: 1,
      title: "Digital Marketing Summit 2024",
      date: "2024-12-20",
      time: "9:00 AM - 5:00 PM",
      location: "Lagos Business School, Victoria Island",
      type: "Conference",
      category: "Marketing",
      description: "Join industry leaders for a day of insights on the future of digital marketing, AI integration, and customer engagement strategies.",
      image: "/now1.jpg",
      speakers: 12,
      attendees: 300,
      price: "₦25,000",
      status: "Upcoming"
    },
    {
      id: 2,
      title: "Startup Pitch Competition",
      date: "2024-12-22",
      time: "2:00 PM - 6:00 PM",
      location: "The Foundry, Ikeja",
      type: "Competition",
      category: "Entrepreneurship",
      description: "Witness innovative startups pitch their ideas to a panel of investors. Great networking opportunity for entrepreneurs.",
      image: "/now2.jpg",
      speakers: 8,
      attendees: 150,
      price: "Free",
      status: "Upcoming"
    },
    {
      id: 3,
      title: "Creative Design Workshop",
      date: "2024-12-28",
      time: "10:00 AM - 4:00 PM",
      location: "Lovoh Create Studio, Ikeja",
      type: "Workshop",
      category: "Design",
      description: "Hands-on workshop covering UI/UX design principles, brand identity development, and creative process optimization.",
      image: "/now3.jpg",
      speakers: 3,
      attendees: 25,
      price: "₦15,000",
      status: "Upcoming"
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: "Tech Innovation Forum",
      date: "2024-11-15",
      time: "10:00 AM - 3:00 PM",
      location: "Eko Hotel & Suites, VI",
      type: "Forum",
      category: "Technology",
      description: "Exploring the latest trends in tech innovation and their impact on Nigerian businesses.",
      image: "/now4.jpg",
      speakers: 10,
      attendees: 200,
      status: "Past"
    },
    {
      id: 5,
      title: "Brand Strategy Masterclass",
      date: "2024-11-08",
      time: "9:00 AM - 1:00 PM",
      location: "Online Event",
      type: "Webinar",
      category: "Branding",
      description: "Interactive session on building resilient brands in the digital age.",
      image: "/now1.jpg",
      speakers: 2,
      attendees: 85,
      status: "Past"
    }
  ];

  const eventTypes = ["All", "Conference", "Workshop", "Webinar", "Competition", "Forum"];
  const categories = ["All", "Marketing", "Technology", "Design", "Entrepreneurship", "Branding"];

  const allEvents = [...upcomingEvents, ...pastEvents];
  
  const filteredEvents = allEvents.filter(event => {
    if (activeFilter === 'All') return true;
    return event.category === activeFilter || event.type === activeFilter;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      {/* Hero Section */}
      <section className="mt-16 relative py-20 bg-gradient-to-br from-[#254899] via-[#1a3480] to-[#0f2166]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Events Badge */}
            <div className="inline-flex items-center gap-2 bg-[#ebed17]/10 backdrop-blur-sm border border-[#ebed17]/30 rounded-full px-6 py-3">
              <div className="w-2 h-2 bg-[#ebed17] rounded-full animate-pulse"></div>
              <span className="text-[#ebed17] font-semibold text-sm uppercase tracking-wider">
                Events & Happenings
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Events
            </h1>
            
            {/* Description */}
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join us for insightful conferences, workshops, and networking events 
              that drive innovation and foster growth in the business community.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ebed17] mb-2">{upcomingEvents.length}</div>
                <div className="text-gray-300 text-sm">Upcoming Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ebed17] mb-2">{pastEvents.length}</div>
                <div className="text-gray-300 text-sm">Past Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ebed17] mb-2">500+</div>
                <div className="text-gray-300 text-sm">Total Attendees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#ebed17] mb-2">25+</div>
                <div className="text-gray-300 text-sm">Industry Speakers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Events</h2>
              <p className="text-gray-600">Discover upcoming and past events</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Event Type Filters */}
              <div className="flex flex-wrap gap-2">
                {eventTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === type
                        ? 'bg-[#254899] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === category
                        ? 'bg-[#ebed17] text-[#254899] shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Upcoming Events */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-[#ebed17] rounded-full animate-pulse"></div>
              <h2 className="text-3xl font-bold text-gray-900">Upcoming Events</h2>
              <span className="bg-[#254899] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {upcomingEvents.length} events
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {upcomingEvents.map(event => (
                <div 
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-gray-100"
                >
                  {/* Event Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-[#ebed17] text-[#254899] px-3 py-1 rounded-full text-sm font-bold">
                        {event.type}
                      </span>
                      <span className="bg-white/90 text-[#254899] px-3 py-1 rounded-full text-sm font-semibold">
                        {event.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Upcoming
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#254899] transition-colors duration-300 leading-tight">
                      {event.title}
                    </h3>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4 text-[#254899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">{formatDate(event.date)} • {event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <svg className="w-4 h-4 text-[#254899]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm">{event.location}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span>👥 {event.speakers} speakers</span>
                        <span>🎯 {event.attendees} attendees</span>
                      </div>
                      <span className={`font-bold ${
                        event.price === 'Free' ? 'text-green-600' : 'text-[#254899]'
                      }`}>
                        {event.price}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-[#254899] hover:bg-[#1a3480] text-white py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105">
                        Register Now
                      </button>
                      <button className="px-4 py-3 border border-gray-300 text-gray-700 hover:border-[#254899] hover:text-[#254899] rounded-xl font-semibold transition-all duration-300">
                        📅
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Events */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <h2 className="text-3xl font-bold text-gray-900">Past Events</h2>
              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {pastEvents.length} events
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {pastEvents.map(event => (
                <div 
                  key={event.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 opacity-80 hover:opacity-100"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Completed
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-3 text-gray-500 text-sm">
                          <span>{formatDate(event.date)}</span>
                          <span>•</span>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span>👥 {event.speakers} speakers</span>
                        <span>🎯 {event.attendees} attendees</span>
                      </div>
                      <button className="text-[#254899] hover:text-[#1a3480] font-semibold flex items-center gap-2 group">
                        View Photos
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#254899] to-[#1a3480] rounded-3xl p-8 lg:p-12 text-white">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Host Your Event With Us
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Looking for a venue or partnership for your next business event? 
              Let's create something amazing together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Partner With Us
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                Contact Events Team
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventsScreen;