// components/EventPastGrid.jsx
import React from 'react';
import { useGetEventsQuery } from '../slices/eventApiSlice';
import EventCard from './EventCard';

const EventPastGrid = () => {
  const { data: eventsData, isLoading } = useGetEventsQuery({ 
    status: 'passed',
    limit: 4,
  });

  const pastEvents = eventsData?.events || [];

  if (isLoading) return null;
  if (pastEvents.length === 0) return null;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <h2 className="text-3xl font-bold text-gray-900">Past Events</h2>
          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
            {pastEvents.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pastEvents.map(event => (
            <EventCard key={event._id} event={event} isUpcoming={false} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventPastGrid;