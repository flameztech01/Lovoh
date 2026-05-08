// screens/EventDashboard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaCalendarAlt,
  FaTicketAlt,
  FaUsers,
  FaWallet,
  FaPlus,
  FaArrowRight,
  FaMoneyBillWave,
  FaSpinner,
  FaCheckCircle,
} from 'react-icons/fa';
import { useGetMyEventsQuery, useGetWalletInfoQuery, useGetMyRegistrationsQuery } from '../slices/eventApiSlice';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const { data: eventsData, isLoading: eventsLoading } = useGetMyEventsQuery();
  const { data: walletData, isLoading: walletLoading } = useGetWalletInfoQuery();
  const { data: registrationsData, isLoading: regLoading } = useGetMyRegistrationsQuery();

  

  const events = eventsData || [];
  const wallet = walletData || {};
  const myRegistrations = registrationsData || [];

  const totalEvents = events.length;
  const activeEvents = events.filter(e => new Date(e.date) >= new Date() && !e.isDisabled).length;
  const totalRegistrations = events.reduce((sum, e) => sum + (e.currentAttendees || 0), 0);
  const totalRevenue = events.reduce((sum, e) => {
    if (e.isPaid) return sum + ((e.currentAttendees || 0) * (e.price || 0));
    return sum;
  }, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  if (eventsLoading || walletLoading || regLoading) {
    return (
      <EventDashboardSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </EventDashboardSidebar>
    );
  }

  return (
    <EventDashboardSidebar>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {userInfo?.name?.split(' ')[0] || 'Creator'}!
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your events.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalEvents}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Active Events</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{activeEvents}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <FaCheckCircle className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Registrations</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalRegistrations}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <FaUsers className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
              <p className="text-xl font-bold text-orange-600 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <FaMoneyBillWave className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/events/dashboard/events/new"
              className="flex items-center justify-between p-4 bg-[#1B3766] text-white rounded-xl hover:bg-[#142952] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaPlus />
                </div>
                <div>
                  <p className="font-semibold">Create New Event</p>
                  <p className="text-sm text-white/70">Set up and publish your event</p>
                </div>
              </div>
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/events/dashboard/wallet"
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <FaWallet className="text-[#1B3766]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Wallet</p>
                  <p className="text-sm text-gray-500">
                    {wallet.hasWallet ? `Balance: ${formatCurrency(wallet.availableBalance)}` : 'Set up your wallet'}
                  </p>
                </div>
              </div>
              <FaArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            {!wallet.hasWallet && (
              <Link
                to="/events/dashboard/wallet"
                className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-all group border border-yellow-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaWallet className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Set Up Payment Wallet</p>
                    <p className="text-sm text-yellow-700">Required for paid events</p>
                  </div>
                </div>
                <FaArrowRight className="text-yellow-600 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
            <Link to="/events/dashboard/events" className="text-sm text-[#1B3766] hover:underline font-medium">
              View All
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <FaCalendarAlt className="text-2xl text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-4">No events created yet</p>
              <Link
                to="/events/dashboard/events/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952] transition-all"
              >
                <FaPlus /> Create Your First Event
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/dashboard/events/${event._id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100 group"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {event.images?.[0] ? (
                      <img src={event.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaCalendarAlt className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-[#1B3766] transition-colors">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" /> {formatDate(event.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaUsers className="text-[10px]" /> {event.currentAttendees || 0}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                        new Date(event.date) >= new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {new Date(event.date) >= new Date() ? 'Active' : 'Past'}
                      </span>
                    </div>
                  </div>
                  <FaArrowRight className="text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Upcoming Registrations */}
      {myRegistrations.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Registrations</h2>
          <div className="space-y-3">
            {myRegistrations.slice(0, 3).map((reg) => (
              <div key={reg._id} className="flex items-center gap-4 p-3 rounded-xl border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#1B3766] text-white flex items-center justify-center flex-shrink-0">
                  <FaTicketAlt className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{reg.event?.title || 'Event'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{formatDate(reg.event?.date)}</span>
                    <span>Ticket: {reg.ticketId || 'Pending'}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reg.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {reg.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </EventDashboardSidebar>
  );
};

export default EventDashboard;