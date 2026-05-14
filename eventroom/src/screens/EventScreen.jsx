// screens/EventsScreen.jsx
import React from 'react';
import Header from '../components/Header';
import EventHero from '../components/EventHero';
import EventFilters from '../components/EventFilters';
import EventUpcomingGrid from '../components/EventUpcomingGrid';
import EventPastGrid from '../components/EventPastGrid';
import EventCTASection from '../components/EventCTASection';
import Footer from '../components/Footer';

const EventsScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <EventHero />
      {/* <EventFilters /> */}
      <EventUpcomingGrid />
      <EventPastGrid />
      <EventCTASection />
      <Footer />
    </div>
  );
};

export default EventsScreen;