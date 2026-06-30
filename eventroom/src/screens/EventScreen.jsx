// screens/EventsScreen.jsx
import React from 'react';
import Header from '../components/Header';
import EventHero from '../components/EventHero';
import EventUpcomingGrid from '../components/EventUpcomingGrid';
import EventPastGrid from '../components/EventPastGrid';
import EventAvatarSection from '../components/EventAvatarSection';
import EventCTASection from '../components/EventCTASection';
import Footer from '../components/Footer';

const EventsScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Home section – scrolls to #home */}
      <div id="home">
        <EventHero />
      </div>

      {/* Featured section – scrolls to #featured */}
      <div id="featured">
        <EventUpcomingGrid />
      </div>

      {/* Past events – not linked in header, but kept as is */}
      <EventPastGrid />

      {/* Avatar section – placeholder for now; you can replace with your real component */}
      <div id="avatar" className="py-16 bg-white">
      <EventAvatarSection />
      </div>

      {/* Contact section – scrolls to #contact */}
      <div id="contact">
        <EventCTASection />
      </div>

      <Footer />
    </div>
  );
};

export default EventsScreen;