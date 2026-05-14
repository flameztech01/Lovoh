// screens/EventDashboardAnalytics.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCalendarAlt, FaUsers, FaTicketAlt, FaMoneyBillWave,
  FaChartBar, FaChartLine, FaChartPie, FaSpinner,
  FaArrowUp, FaCheckCircle, FaClock, FaTimesCircle,
  FaUserFriends,
} from 'react-icons/fa';
import { useGetMyEventsQuery, useGetWalletInfoQuery } from '../slices/eventApiSlice';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardAnalytics = () => {
  const { data: events, isLoading: eventsLoading } = useGetMyEventsQuery();
  const { data: walletData, isLoading: walletLoading } = useGetWalletInfoQuery();

  const wallet = walletData || {};
  const myEvents = events || [];
  const now = new Date();

  // Calculate event revenue properly (ticket types or flat price)
  const getEventRevenue = (e) => {
    if (e.ticketTypes?.length > 0) {
      return e.ticketTypes.reduce((sum, t) => sum + ((t.soldCount || 0) * (t.price || 0)), 0);
    }
    return (e.currentAttendees || 0) * (e.price || 0);
  };

  const getEventPriceDisplay = (e) => {
    if (e.ticketTypes?.length > 0) {
      const prices = e.ticketTypes.map(t => t.price).filter(p => p > 0);
      if (prices.length === 0) return 'Free';
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? formatCurrency(min) : `${formatCurrency(min)} - ${formatCurrency(max)}`;
    }
    return e.isPaid && e.price > 0 ? formatCurrency(e.price) : 'Free';
  };

  const formatCurrency = (a) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(a || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD';

  // Stats
  const totalEvents = myEvents.length;
  const activeEvents = myEvents.filter(e => new Date(e.date) >= now && !e.isDisabled).length;
  const pastEvents = myEvents.filter(e => new Date(e.date) < now).length;
  const paidEvents = myEvents.filter(e => e.isPaid && (e.price > 0 || e.ticketTypes?.length > 0)).length;
  const freeEvents = myEvents.filter(e => !e.isPaid || (e.price === 0 && !e.ticketTypes?.length)).length;
  const eventsWithTicketTypes = myEvents.filter(e => e.ticketTypes?.length > 0).length;
  const eventsWithMultiBuy = myEvents.filter(e => e.enableMultipleTickets).length;

  const totalRegistrations = myEvents.reduce((sum, e) => sum + (e.currentAttendees || 0), 0);
  const totalRevenue = myEvents.reduce((sum, e) => sum + getEventRevenue(e), 0);
  const totalTicketsSold = myEvents.reduce((sum, e) => sum + (e.currentAttendees || 0), 0);
  const avgRegPerEvent = totalEvents > 0 ? Math.round(totalRegistrations / totalEvents) : 0;
  const avgTicketPrice = totalTicketsSold > 0 ? Math.round(totalRevenue / totalTicketsSold) : 0;

  const topEvents = [...myEvents].sort((a, b) => getEventRevenue(b) - getEventRevenue(a)).slice(0, 5);
  const recentEvents = [...myEvents].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const getMonthlyRevenue = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const ms = new Date(d.getFullYear(), d.getMonth(), 1);
      const me = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const rev = myEvents.filter(e => { const ed = new Date(e.date); return ed >= ms && ed <= me; })
        .reduce((s, e) => s + getEventRevenue(e), 0);
      months.push({ month: d.toLocaleDateString('en-NG', { month: 'short', year: 'numeric' }), revenue: rev });
    }
    return months;
  };

  const monthlyRevenue = getMonthlyRevenue();
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const ticketTypeStats = myEvents.reduce((acc, e) => {
    if (e.ticketTypes?.length) {
      e.ticketTypes.forEach(t => {
        const key = t.name || 'General';
        acc[key] = { sold: (acc[key]?.sold || 0) + (t.soldCount || 0), revenue: (acc[key]?.revenue || 0) + (t.soldCount || 0) * (t.price || 0) };
      });
    } else if (e.isPaid && e.currentAttendees > 0) {
      acc['General Admission'] = { sold: (acc['General Admission']?.sold || 0) + (e.currentAttendees || 0), revenue: (acc['General Admission']?.revenue || 0) + (e.currentAttendees || 0) * (e.price || 0) };
    }
    return acc;
  }, {});

  if (eventsLoading || walletLoading) return (<EventDashboardSidebar><div className="flex justify-center items-center h-96"><FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" /></div></EventDashboardSidebar>);

  return (
    <EventDashboardSidebar>
      <div className="mb-8"><h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics</h1><p className="text-gray-500 mt-1 text-sm">Track your event performance and earnings</p></div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Events" value={totalEvents} sub={`${activeEvents} active • ${pastEvents} past`} icon={FaCalendarAlt} color="blue" />
        <MetricCard label="Registrations" value={totalRegistrations} sub={`Avg ${avgRegPerEvent} per event`} icon={FaUsers} color="purple" />
        <MetricCard label="Total Revenue" value={formatCurrency(totalRevenue)} sub={`Avg ticket: ${formatCurrency(avgTicketPrice)}`} icon={FaMoneyBillWave} color="green" />
        <MetricCard label="Wallet" value={wallet.hasWallet ? formatCurrency(wallet.availableBalance || 0) : 'Not set up'} sub={wallet.hasWallet ? `Earnings: ${formatCurrency(wallet.totalEarnings || 0)}` : ''} icon={FaChartPie} color="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><FaChartBar className="text-[#1B3766]" /> Revenue Trend</h2>
          {totalRevenue === 0 ? <EmptyChart icon={FaChartLine} text="No revenue yet" /> : (
            <div className="space-y-3">
              {monthlyRevenue.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-12">{item.month}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1B3766] to-blue-600 rounded-full flex items-center justify-end pr-2" style={{ width: `${(item.revenue/maxRevenue)*100}%` }}>
                      {item.revenue > 0 && <span className="text-[10px] text-white font-medium">{formatCurrency(item.revenue)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2"><FaChartPie className="text-[#1B3766]" /> Event Overview</h2>
          {totalEvents === 0 ? <EmptyChart icon={FaChartPie} text="No events yet" link="/dashboard/events/new" linkText="Create your first event →" /> : (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Paid vs Free</p>
                <div className="flex gap-4">
                  <ProgressBar label="Paid" count={paidEvents} total={totalEvents} color="from-[#1B3766] to-blue-600" />
                  <ProgressBar label="Free" count={freeEvents} total={totalEvents} color="from-green-400 to-green-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <FaTicketAlt className="text-[#1B3766] mx-auto mb-1" /><p className="text-lg font-bold text-gray-900">{eventsWithTicketTypes}</p><p className="text-xs text-gray-500">Ticket Types</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <FaUserFriends className="text-[#1B3766] mx-auto mb-1" /><p className="text-lg font-bold text-gray-900">{eventsWithMultiBuy}</p><p className="text-xs text-gray-500">Multi-buy</p>
                </div>
              </div>
              {Object.keys(ticketTypeStats).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Ticket Performance</p>
                  <div className="space-y-2">
                    {Object.entries(ticketTypeStats).sort((a,b) => b[1].revenue - a[1].revenue).slice(0, 5).map(([name, stats]) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 w-24 truncate">{name}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#1B3766] rounded-full" style={{ width: `${totalRevenue > 0 ? (stats.revenue/totalRevenue)*100 : 0}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{stats.sold} • {formatCurrency(stats.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Events */}
      {topEvents.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaArrowUp className="text-green-600" /> Top Performing Events</h2>
          <div className="space-y-3">
            {topEvents.map((e, idx) => (
              <Link key={e._id} to={`/dashboard/events/${e._id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${idx===0?'bg-yellow-100 text-yellow-700':idx===1?'bg-gray-200 text-gray-600':idx===2?'bg-orange-100 text-orange-700':'bg-gray-100 text-gray-500'}`}>{idx+1}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate group-hover:text-[#1B3766]">{e.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span>{formatDate(e.date)}</span><span>•</span><span>{e.currentAttendees||0} attendees</span>
                    {e.ticketTypes?.length > 0 && <span className="text-blue-600">• {e.ticketTypes.length} ticket types</span>}
                    <span className="text-gray-400">•</span>
                    <span className="font-medium text-gray-700">{getEventPriceDisplay(e)}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-green-600">{formatCurrency(getEventRevenue(e))}</div>
                  <div className="text-xs text-gray-400">revenue</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Events */}
      {recentEvents.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2"><FaClock className="text-[#1B3766]" /> Recent Events</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50"><tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Reg.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recentEvents.map(e => (
                  <tr key={e._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{e.title}</p><p className="text-xs text-gray-500">{e.category}{e.ticketTypes?.length>0&&` • ${e.ticketTypes.length} types`}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{formatDate(e.date)}</td>
                    <td className="px-4 py-3 text-center text-sm hidden sm:table-cell">{e.currentAttendees||0}</td>
                    <td className="px-4 py-3 text-sm">{getEventPriceDisplay(e)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{getEventRevenue(e) > 0 ? formatCurrency(getEventRevenue(e)) : <span className="text-gray-400">—</span>}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${new Date(e.date)>=now?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
                        {new Date(e.date)>=now?<><FaCheckCircle className="text-[10px]"/>Active</>:<><FaTimesCircle className="text-[10px]"/>Past</>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </EventDashboardSidebar>
  );
};

const MetricCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-center justify-between">
      <div><p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p><p className={`text-xl font-bold mt-1 ${color==='green'?'text-green-600':color==='purple'?'text-purple-600':color==='orange'?'text-orange-600':'text-gray-900'}`}>{value}</p></div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color==='blue'?'bg-blue-50':color==='purple'?'bg-purple-50':color==='green'?'bg-green-50':'bg-orange-50'}`}><Icon className={`text-sm ${color==='blue'?'text-blue-600':color==='purple'?'text-purple-600':color==='green'?'text-green-600':'text-orange-600'}`} /></div>
    </div>
    {sub && <p className="text-xs text-gray-500 mt-2">{sub}</p>}
  </div>
);

const ProgressBar = ({ label, count, total, color }) => (
  <div className="flex-1">
    <div className="flex justify-between text-xs text-gray-500 mb-1"><span>{label} ({count})</span><span>{total>0?Math.round((count/total)*100):0}%</span></div>
    <div className="h-4 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{width:`${total>0?(count/total)*100:0}%`}} /></div>
  </div>
);

const EmptyChart = ({ icon: Icon, text, link, linkText }) => (
  <div className="text-center py-12"><Icon className="text-4xl text-gray-300 mx-auto mb-3" /><p className="text-gray-500 text-sm">{text}</p>{link && <Link to={link} className="text-[#1B3766] text-sm font-medium hover:underline mt-2 inline-block">{linkText}</Link>}</div>
);

export default EventDashboardAnalytics;