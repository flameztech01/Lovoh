// screens/EventDashboardEventRegistrations.jsx - With custom form, mobile bottom-sheet modals & floating filter
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaUser, FaUsers, FaDownload, FaSearch, FaTimes, FaEye,
  FaSync, FaBan, FaTicketAlt, FaChair, FaClipboardCheck,
  FaQrcode, FaUserFriends, FaDollarSign, FaFilter, FaLayerGroup,
} from 'react-icons/fa';
import {
  useGetEventByIdQuery,
  useGetEventRegistrationsQuery,
  useCheckInAttendeeMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardEventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Screen resize for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal animation states (for bottom sheet)
  const [detailsModalAnim, setDetailsModalAnim] = useState(false);
  const [checkInModalAnim, setCheckInModalAnim] = useState(false);
  const [ticketModalAnim, setTicketModalAnim] = useState(false);

  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useGetEventByIdQuery(id);
  const { data: registrationsData, isLoading: regLoading, refetch: refetchRegistrations } = useGetEventRegistrationsQuery({
    id,
    params: { status: statusFilter !== 'all' ? statusFilter : undefined },
  });
  const [checkInAttendee, { isLoading: isCheckingIn }] = useCheckInAttendeeMutation();

  const registrations = registrationsData?.registrations || [];
  const totalRegistrations = registrationsData?.totalRegistrations || 0;
  const confirmedCount = registrationsData?.confirmedCount || 0;
  const pendingCount = registrationsData?.pendingCount || 0;

  const getAllCheckedInCount = () => {
    let count = 0;
    registrations.forEach((reg) => {
      if (reg.ticketCheckedIn) count++;
      reg.additionalAttendees?.forEach((att) => {
        if (att.checkedIn) count++;
      });
    });
    return count;
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';
  const formatShortDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'N/A';
  const formatPrice = (p) =>
    p
      ? new Intl.NumberFormat('en-NG', {
          style: 'currency',
          currency: 'NGN',
          minimumFractionDigits: 0,
        }).format(p)
      : 'Free';

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      reg.name?.toLowerCase().includes(s) ||
      reg.email?.toLowerCase().includes(s) ||
      reg.ticketId?.toLowerCase().includes(s) ||
      reg.seatNumber?.toLowerCase().includes(s) ||
      reg.ticketType?.toLowerCase().includes(s) ||
      reg.additionalAttendees?.some(
        (a) =>
          a.name?.toLowerCase().includes(s) ||
          a.ticketId?.toLowerCase().includes(s) ||
          a.seatNumber?.toLowerCase().includes(s)
      )
    );
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchEvent(), refetchRegistrations()]);
    setIsRefreshing(false);
    toast.success('Refreshed');
  };

  const exportToCSV = () => {
    const rows = [
      ['Type', 'Name', 'Email', 'Ticket ID', 'Seat', 'Ticket Type', 'Registered', 'Status', 'Amount', 'Checked In'],
    ];
    filteredRegistrations.forEach((reg) => {
      rows.push([
        'Buyer',
        reg.name,
        reg.email,
        reg.ticketId || '',
        reg.seatNumber || '',
        reg.ticketType || 'General',
        formatDate(reg.createdAt),
        reg.status,
        formatPrice(reg.totalAmount || reg.price || 0),
        reg.ticketCheckedIn ? 'Yes' : 'No',
      ]);
      reg.additionalAttendees?.forEach((att) => {
        rows.push([
          'Guest',
          att.name || '',
          att.email || '',
          att.ticketId || '',
          att.seatNumber || '',
          reg.ticketType || 'General',
          '',
          '',
          '',
          att.checkedIn ? 'Yes' : 'No',
        ]);
      });
    });
    const csvContent = rows.map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `registrations_${event?.title?.replace(/\s+/g, '_') || 'export'}.csv`;
    a.click();
    toast.success('Exported!');
  };

  // Modal open helpers with animation triggers
  const openDetailsModal = (reg) => {
    setSelectedRegistration(reg);
    setShowDetailsModal(true);
    if (isMobile) setTimeout(() => setDetailsModalAnim(true), 50);
    else setDetailsModalAnim(true);
  };
  const closeDetailsModal = () => {
    setDetailsModalAnim(false);
    setTimeout(() => {
      setShowDetailsModal(false);
      setSelectedRegistration(null);
    }, 200);
  };

  const openCheckInModal = (reg, attendee = null) => {
    setSelectedRegistration(reg);
    setSelectedAttendee(attendee);
    setShowCheckInModal(true);
    if (isMobile) setTimeout(() => setCheckInModalAnim(true), 50);
    else setCheckInModalAnim(true);
  };
  const closeCheckInModal = () => {
    setCheckInModalAnim(false);
    setTimeout(() => {
      setShowCheckInModal(false);
      setSelectedRegistration(null);
      setSelectedAttendee(null);
    }, 200);
  };

  const openTicketModal = (reg) => {
    setSelectedRegistration(reg);
    setShowTicketModal(true);
    if (isMobile) setTimeout(() => setTicketModalAnim(true), 50);
    else setTicketModalAnim(true);
  };
  const closeTicketModal = () => {
    setTicketModalAnim(false);
    setTimeout(() => {
      setShowTicketModal(false);
      setSelectedRegistration(null);
    }, 200);
  };

  // Filter popup
  const openFilterPopup = () => setShowFilterPopup(true);
  const closeFilterPopup = () => setShowFilterPopup(false);
  const handleFilterSelect = (value) => {
    setStatusFilter(value);
    closeFilterPopup();
  };

  const handleCheckIn = async () => {
    const ticketId = selectedAttendee ? selectedAttendee.ticketId : selectedRegistration?.ticketId;
    if (!ticketId) return;
    try {
      await checkInAttendee(ticketId).unwrap();
      const name = selectedAttendee ? selectedAttendee.name : selectedRegistration.name;
      toast.success(`${name} checked in!`);
      closeCheckInModal();
      refetchRegistrations();
    } catch (error) {
      toast.error(error?.data?.message || 'Check-in failed');
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaSpinner };
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: FaBan };
      default:
        return { label: s, color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    }
  };

  const totalRevenue = registrations
    .filter((r) => r.status === 'confirmed')
    .reduce((s, r) => s + (r.totalAmount || r.paidAmount || r.price || 0), 0);

  if (eventLoading || regLoading) {
    return (
      <EventDashboardSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </EventDashboardSidebar>
    );
  }

  if (!event) {
    return (
      <EventDashboardSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <button
            onClick={() => navigate('/events/dashboard/events')}
            className="px-4 py-2 bg-[#1B3766] text-white rounded-lg"
          >
            Back to My Events
          </button>
        </div>
      </EventDashboardSidebar>
    );
  }

  // Desktop filter select (hidden on mobile)
  const FilterSelect = () => (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="hidden md:block px-4 py-2 border border-gray-200 rounded-lg text-sm"
    >
      <option value="all">All</option>
      <option value="confirmed">Confirmed</option>
      <option value="pending">Pending</option>
    </select>
  );

  const FilterPopup = () => (
    <>
      {showFilterPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={closeFilterPopup}>
          <div
            className="bg-white rounded-t-2xl w-full max-w-md p-6 transform translate-y-full transition-transform duration-300 ease-out"
            style={{ transform: showFilterPopup ? 'translateY(0)' : 'translateY(100%)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Status</h3>
            <button
              onClick={() => handleFilterSelect('all')}
              className={`w-full text-left p-3 rounded-lg mb-2 ${statusFilter === 'all' ? 'bg-[#1B3766]/10 font-medium text-[#1B3766]' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterSelect('confirmed')}
              className={`w-full text-left p-3 rounded-lg mb-2 ${statusFilter === 'confirmed' ? 'bg-[#1B3766]/10 font-medium text-[#1B3766]' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Confirmed
            </button>
            <button
              onClick={() => handleFilterSelect('pending')}
              className={`w-full text-left p-3 rounded-lg ${statusFilter === 'pending' ? 'bg-[#1B3766]/10 font-medium text-[#1B3766]' : 'hover:bg-gray-100 text-gray-700'}`}
            >
              Pending
            </button>
            <button onClick={closeFilterPopup} className="w-full mt-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );

  // Mobile floating filter button
  const MobileFilterButton = () => (
    <button
      onClick={openFilterPopup}
      className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#1B3766] text-white shadow-lg flex items-center justify-center hover:bg-[#142952] transition-all"
    >
      <FaFilter className="text-lg" />
    </button>
  );

  // Modal Container for Bottom Sheet (reused)
  const ModalContainer = ({ show, onClose, anim, children }) => {
    if (!show) return null;
    return (
      <div
        className={`fixed inset-0 z-50 flex ${isMobile ? 'items-end' : 'items-center'} justify-center bg-black/50`}
        onClick={onClose}
      >
        <div
          className={`bg-white ${isMobile ? 'rounded-t-2xl w-full max-w-md p-4 max-h-[90vh] overflow-y-auto' : 'rounded-2xl max-w-md w-full p-6'} ${
            isMobile ? 'transform transition-transform duration-300 ease-out' : ''
          }`}
          style={isMobile ? { transform: anim ? 'translateY(0)' : 'translateY(100%)' } : {}}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    );
  };

  const detailsContent = selectedRegistration && (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Registration Details</h3>
        <button onClick={closeDetailsModal} className="p-2 hover:bg-gray-100 rounded-lg">
          <FaTimes />
        </button>
      </div>
      <div className="space-y-4">
        <DetailSection icon={FaUser} title="Buyer Info">
          <DetailRow label="Name" value={selectedRegistration.name} />
          <DetailRow label="Email" value={selectedRegistration.email} />
          <DetailRow label="Phone" value={selectedRegistration.phone || 'N/A'} />
        </DetailSection>
        <DetailSection icon={FaTicketAlt} title="Ticket Info">
          <DetailRow label="Type" value={selectedRegistration.ticketType || 'General'} />
          <DetailRow label="Quantity" value={`${selectedRegistration.quantity || 1}`} />
          <DetailRow label="Ticket ID" value={selectedRegistration.ticketId} mono />
          <DetailRow label="Seat" value={selectedRegistration.seatNumber} />
          <DetailRow
            label="Checked In"
            value={
              selectedRegistration.ticketCheckedIn
                ? `✅ ${formatDate(selectedRegistration.checkedInAt)}`
                : 'No'
            }
          />
        </DetailSection>
        {selectedRegistration.additionalAttendees?.length > 0 && (
          <DetailSection icon={FaUserFriends} title="Additional Attendees">
            {selectedRegistration.additionalAttendees.map((att, idx) => (
              <div key={idx} className="bg-white rounded-lg p-2 border border-gray-100">
                <p className="text-xs font-medium text-gray-700">
                  {att.name || 'Guest'} {att.checkedIn ? '✅' : '⏳'}
                </p>
                <p className="text-[10px] text-gray-500">
                  Ticket: {att.ticketId || '—'} • Seat: {att.seatNumber || '—'}
                </p>
              </div>
            ))}
          </DetailSection>
        )}
        <DetailSection icon={FaDollarSign} title="Payment">
          <DetailRow
            label="Total"
            value={formatPrice(selectedRegistration.totalAmount || selectedRegistration.price || 0)}
          />
          <DetailRow
            label="Paid"
            value={selectedRegistration.paidAmount ? formatPrice(selectedRegistration.paidAmount) : '—'}
          />
          <DetailRow
            label="Reference"
            value={selectedRegistration.paymentReference || 'N/A'}
            mono
          />
        </DetailSection>

        {/* Custom form responses */}
        {selectedRegistration.customFormResponses &&
          selectedRegistration.customFormResponses.length > 0 && (
            <DetailSection icon={FaLayerGroup} title="Additional Info">
              {selectedRegistration.customFormResponses.map((resp, idx) => (
                <div key={idx} className="mb-2">
                  <p className="text-xs font-medium text-gray-700">{resp.label}</p>
                  <p className="text-sm text-gray-900">
                    {Array.isArray(resp.value) ? resp.value.join(', ') : resp.value || '—'}
                  </p>
                </div>
              ))}
            </DetailSection>
          )}
      </div>
    </>
  );

  const checkInContent = selectedRegistration && (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <FaClipboardCheck className="text-2xl text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Check In {selectedAttendee ? 'Guest' : 'Attendee'}
      </h3>
      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
        <p>
          <strong>Name:</strong> {selectedAttendee ? selectedAttendee.name : selectedRegistration.name}
        </p>
        {selectedAttendee?.email && (
          <p>
            <strong>Email:</strong> {selectedAttendee.email}
          </p>
        )}
        <p className="font-mono text-sm">
          <strong>Ticket:</strong>{' '}
          {selectedAttendee ? selectedAttendee.ticketId : selectedRegistration.ticketId}
        </p>
        <p>
          <strong>Seat:</strong>{' '}
          {selectedAttendee ? selectedAttendee.seatNumber : selectedRegistration.seatNumber}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={closeCheckInModal}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
        >
          {isCheckingIn ? 'Checking...' : 'Confirm Check-in'}
        </button>
      </div>
    </div>
  );

  const ticketContent = selectedRegistration && (
    <div className="text-center">
      <FaQrcode className="text-4xl text-[#1B3766] mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Event Ticket</h3>
      <p className="text-sm text-gray-500 mb-4">{event.title}</p>
      <div className="border-2 border-dashed border-[#1B3766] rounded-xl p-4 mb-4">
        <div className="bg-[#1B3766] text-white text-center py-2 rounded-lg mb-3">
          <p className="text-xs text-[#79FFFF]">TICKET ID</p>
          <p className="text-lg font-bold tracking-wider">{selectedRegistration.ticketId}</p>
        </div>
        <div className="space-y-2 text-sm text-left">
          <p><strong>Attendee:</strong> {selectedRegistration.name}</p>
          <p><strong>Email:</strong> {selectedRegistration.email}</p>
          <p><strong>Type:</strong> {selectedRegistration.ticketType || 'General'}</p>
          <p><strong>Qty:</strong> {selectedRegistration.quantity || 1}</p>
          <p><strong>Seat:</strong> {selectedRegistration.seatNumber}</p>
          <p><strong>Date:</strong> {formatShortDate(event?.date)}</p>
          <p><strong>Status:</strong> {selectedRegistration.ticketCheckedIn ? '✅ Checked In' : '⏳ Not Checked In'}</p>
        </div>
        {selectedRegistration.additionalAttendees?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-2">Additional Tickets</p>
            {selectedRegistration.additionalAttendees.map((att, idx) => (
              <div key={idx} className="text-xs text-gray-600 mb-1">
                <span className="font-medium">{att.name || 'Guest'}</span> • Seat: {att.seatNumber} • {att.checkedIn ? '✅' : '⏳'}
              </div>
            ))}
          </div>
        )}
      </div>
      <button onClick={closeTicketModal} className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm">
        Close
      </button>
    </div>
  );

  return (
    <EventDashboardSidebar>
      <div className="p-4 md:p-6 relative">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate(`/events/dashboard/events/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors text-sm"
            >
              <FaArrowLeft className="text-xs" /> Back to Event
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-500 mt-1 text-sm">{event.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              <FaSync className={isRefreshing ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] text-sm"
            >
              <FaDownload /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={totalRegistrations} color="bg-gray-50" textColor="text-gray-900" icon={FaUsers} />
          <StatCard label="Confirmed" value={confirmedCount} color="bg-green-50" textColor="text-green-700" icon={FaCheckCircle} />
          <StatCard label="Pending" value={pendingCount} color="bg-yellow-50" textColor="text-yellow-700" icon={FaSpinner} />
          <StatCard label="Checked In" value={getAllCheckedInCount()} color="bg-blue-50" textColor="text-blue-700" icon={FaClipboardCheck} />
          <StatCard label="Revenue" value={formatPrice(totalRevenue)} color="bg-purple-50" textColor="text-purple-700" icon={FaDollarSign} isCurrency />
        </div>

        {/* Search + Desktop Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaTimes />
                </button>
              )}
            </div>
            <FilterSelect />
          </div>
        </div>

        {/* Registration list - Desktop */}
        <div className="hidden md:block">
          {filteredRegistrations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => {
                const status = getStatusBadge(reg.status);
                const StatusIcon = status.icon;
                const hasAdditional = reg.additionalAttendees?.length > 0;
                const allCheckedIn =
                  reg.ticketCheckedIn &&
                  (!hasAdditional || reg.additionalAttendees.every((a) => a.checkedIn));
                return (
                  <div
                    key={reg._id}
                    className={`bg-white rounded-xl shadow-sm border ${
                      allCheckedIn ? 'border-green-200 bg-green-50/20' : 'border-gray-100'
                    }`}
                  >
                    {/* Primary Buyer */}
                    <div className="p-4 flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          reg.ticketCheckedIn ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <FaUser className={`text-sm ${reg.ticketCheckedIn ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900 text-sm">{reg.name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                            {status.label}
                          </span>
                          {hasAdditional && (
                            <span className="text-[10px] text-blue-600">
                              <FaUserFriends className="inline mr-0.5" />+{reg.additionalAttendees.length}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                          <span>{reg.email}</span>
                          <span>•</span>
                          <span>{reg.ticketType || 'General'}</span>
                          <span>•</span>
                          <span>Qty: {reg.quantity || 1}</span>
                          <span>•</span>
                          <span className="font-mono">{reg.ticketId}</span>
                          <span>•</span>
                          <span>
                            <FaChair className="inline text-[10px]" /> {reg.seatNumber}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">
                          {reg.totalAmount > 0 ? formatPrice(reg.totalAmount) : 'Free'}
                        </p>
                        <p className="text-[10px] text-gray-400">{formatDate(reg.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {reg.ticketCheckedIn ? (
                          <span className="text-[10px] text-green-600 font-medium px-2">✅ In</span>
                        ) : (
                          reg.status === 'confirmed' && (
                            <button
                              onClick={() => openCheckInModal(reg)}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                            >
                              Check In
                            </button>
                          )
                        )}
                        <button
                          onClick={() => openTicketModal(reg)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Ticket"
                        >
                          <FaTicketAlt className="text-sm" />
                        </button>
                        <button
                          onClick={() => openDetailsModal(reg)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <FaEye className="text-sm" />
                        </button>
                      </div>
                    </div>
                    {/* Additional Attendees */}
                    {hasAdditional && (
                      <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        {reg.additionalAttendees.map((att, idx) => (
                          <div
                            key={idx}
                            className="px-4 py-2.5 flex items-center gap-4 border-b border-gray-100 last:border-0"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                att.checkedIn ? 'bg-green-100' : 'bg-gray-100'
                              }`}
                            >
                              <FaUser className={`text-xs ${att.checkedIn ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{att.name || 'Guest'}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {att.email && <span>{att.email}</span>}
                                <span className="font-mono">{att.ticketId}</span>
                                {att.seatNumber && (
                                  <span>
                                    <FaChair className="inline text-[10px]" /> {att.seatNumber}
                                  </span>
                                )}
                              </div>
                            </div>
                            {att.checkedIn ? (
                              <span className="text-[10px] text-green-600 font-medium px-2">✅ In</span>
                            ) : (
                              <button
                                onClick={() => openCheckInModal(reg, att)}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700"
                              >
                                Check In
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registration list - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredRegistrations.length === 0 ? (
            <EmptyState />
          ) : (
            filteredRegistrations.map((reg) => {
              const status = getStatusBadge(reg.status);
              const hasAdditional = reg.additionalAttendees?.length > 0;
              return (
                <div key={reg._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          reg.ticketCheckedIn ? 'bg-green-100' : 'bg-gray-100'
                        }`}
                      >
                        <FaUser className={`text-sm ${reg.ticketCheckedIn ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {reg.name}{' '}
                          {hasAdditional && (
                            <span className="text-[10px] text-blue-600">+{reg.additionalAttendees.length}</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{reg.email}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      <status.icon className="text-[10px]" />
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 px-2 py-0.5 rounded-full">{reg.ticketType || 'General'}</span>
                    <span>Qty: {reg.quantity || 1}</span>
                    <span className="font-mono">{reg.ticketId}</span>
                    <span>
                      <FaChair className="inline text-[10px]" />
                      {reg.seatNumber || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>{formatDate(reg.createdAt)}</span>
                    <span className="font-semibold">
                      {reg.totalAmount > 0 ? formatPrice(reg.totalAmount) : 'Free'}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openTicketModal(reg)}
                      className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium"
                    >
                      <FaTicketAlt className="inline mr-1" />
                      Ticket
                    </button>
                    {reg.ticketCheckedIn ? (
                      <span className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium text-center">
                        ✅ Checked In
                      </span>
                    ) : (
                      reg.status === 'confirmed' && (
                        <button
                          onClick={() => openCheckInModal(reg)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-medium"
                        >
                          Check In
                        </button>
                      )
                    )}
                    <button
                      onClick={() => openDetailsModal(reg)}
                      className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium"
                    >
                      <FaEye className="inline mr-1" />
                      Details
                    </button>
                  </div>
                  {hasAdditional && (
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                      {reg.additionalAttendees.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                att.checkedIn ? 'bg-green-100' : 'bg-gray-100'
                              }`}
                            >
                              <FaUser className="text-[10px] text-gray-500" />
                            </div>
                            <span className="font-medium">{att.name || 'Guest'}</span>
                            <span className="text-gray-400 font-mono">{att.ticketId}</span>
                          </div>
                          {att.checkedIn ? (
                            <span className="text-green-600 text-[10px]">✅ In</span>
                          ) : (
                            <button
                              onClick={() => openCheckInModal(reg, att)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-[10px]"
                            >
                              Check In
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Showing {filteredRegistrations.length} of {totalRegistrations} registrations
        </p>

        {/* Mobile Floating Filter Button */}
        <MobileFilterButton />
        <FilterPopup />

        {/* Modals with bottom-sheet behaviour on mobile */}
        <ModalContainer show={showDetailsModal} onClose={closeDetailsModal} anim={detailsModalAnim}>
          {detailsContent}
        </ModalContainer>

        <ModalContainer show={showCheckInModal} onClose={closeCheckInModal} anim={checkInModalAnim}>
          {checkInContent}
        </ModalContainer>

        <ModalContainer show={showTicketModal} onClose={closeTicketModal} anim={ticketModalAnim}>
          {ticketContent}
        </ModalContainer>
      </div>
    </EventDashboardSidebar>
  );
};

// Reusable stat card
const StatCard = ({ label, value, color, textColor, icon: Icon, isCurrency }) => (
  <div className={`rounded-xl shadow-sm border border-gray-100 p-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-xl font-bold mt-1 ${textColor} ${isCurrency ? 'text-sm' : ''}`}>{value}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
        <Icon className={`text-sm ${textColor}`} />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <FaUsers className="text-2xl text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">No registrations found</h3>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      <Icon className="text-[#1B3766] text-sm" />
      {title}
    </h4>
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">{children}</div>
  </div>
);

const DetailRow = ({ label, value, mono }) => (
  <p className="flex justify-between">
    <span className="text-gray-500">{label}:</span>
    <span className={`font-medium text-gray-900 text-right ml-4 ${mono ? 'font-mono text-xs' : ''}`}>
      {value || '—'}
    </span>
  </p>
);

export default EventDashboardEventRegistrations;