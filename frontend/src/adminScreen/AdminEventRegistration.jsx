// adminScreen/AdminEventRegistrations.jsx - Updated with full backend alignment
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaUsers,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaDollarSign,
  FaDownload,
  FaSearch,
  FaTimes,
  FaEye,
  FaSync,
  FaBan,
  FaTicketAlt,
  FaChair,
  FaQrcode,
  FaClipboardCheck,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaUserPlus,
  FaLayerGroup,
} from 'react-icons/fa';
import { 
  useGetEventByIdQuery, 
  useGetEventRegistrationsQuery,
  useCheckInAttendeeMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [expandedRegistration, setExpandedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // For additional attendee tickets
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: event, isLoading: eventLoading, refetch: refetchEvent } = useGetEventByIdQuery(id);
  const { data: registrationsData, isLoading: regLoading, refetch: refetchRegistrations } = useGetEventRegistrationsQuery({ 
    id,
    params: { status: statusFilter !== 'all' ? statusFilter : undefined }
  });

  const [checkInAttendee, { isLoading: isCheckingIn }] = useCheckInAttendeeMutation();

  const registrations = registrationsData?.registrations || [];
  const totalRegistrations = registrationsData?.totalRegistrations || 0;
  const confirmedCount = registrationsData?.confirmedCount || 0;
  const pendingCount = registrationsData?.pendingCount || 0;
  
  // Calculate checked-in count (including additional attendees)
  const checkedInCount = registrations.reduce((count, reg) => {
    let checked = reg.ticketCheckedIn ? 1 : 0;
    if (reg.additionalAttendees?.length > 0) {
      checked += reg.additionalAttendees.filter(a => a.checkedIn).length;
    }
    return count + checked;
  }, 0);

  // Count total attendees (primary + additional)
  const totalAttendees = registrations.reduce((count, reg) => {
    return count + 1 + (reg.additionalAttendees?.length || 0);
  }, 0);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatShortDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency', currency: 'NGN', minimumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced search - includes additional attendees
  const filteredRegistrations = registrations.filter(reg => {
    if (searchTerm === '') return true;
    const search = searchTerm.toLowerCase();
    
    // Search primary registration
    const primaryMatch = (
      reg.name?.toLowerCase().includes(search) ||
      reg.email?.toLowerCase().includes(search) ||
      reg.phone?.includes(searchTerm) ||
      reg.ticketId?.toLowerCase().includes(search) ||
      reg.seatNumber?.toLowerCase().includes(search) ||
      reg.ticketType?.toLowerCase().includes(search)
    );
    
    // Search additional attendees
    const additionalMatch = reg.additionalAttendees?.some(att =>
      att.name?.toLowerCase().includes(search) ||
      att.email?.toLowerCase().includes(search) ||
      att.ticketId?.toLowerCase().includes(search) ||
      att.seatNumber?.toLowerCase().includes(search)
    );
    
    return primaryMatch || additionalMatch;
  });

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchEvent(), refetchRegistrations()]);
    setIsRefreshing(false);
    toast.success('Data refreshed');
  };

  const exportToCSV = () => {
    const headers = [
      'Name', 'Email', 'Phone', 'Ticket Type', 'Quantity', 
      'Ticket ID', 'Seat Number', 'Registered On', 'Status', 
      'Amount Paid', 'Checked In', 'Payment Reference',
      'Additional Attendees'
    ];
    
    const csvData = filteredRegistrations.map(reg => [
      reg.name,
      reg.email,
      reg.phone || 'N/A',
      reg.ticketType || 'General',
      reg.quantity || 1,
      reg.ticketId || 'N/A',
      reg.seatNumber || 'N/A',
      formatDate(reg.createdAt),
      reg.status,
      reg.isPaidEvent ? formatCurrency(reg.paidAmount || reg.totalAmount) : 'Free',
      reg.ticketCheckedIn ? 'Yes' : 'No',
      reg.paymentReference || 'N/A',
      reg.additionalAttendees?.map(a => `${a.name} (${a.email || 'N/A'})`).join('; ') || 'None'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_registrations_${event?.title?.replace(/\s+/g, '_') || 'export'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Registrations exported to CSV');
  };

  const openDetailsModal = (reg) => {
    setSelectedRegistration(reg);
    setShowDetailsModal(true);
  };

  const openCheckInModal = (reg, ticketId) => {
    setSelectedRegistration(reg);
    setSelectedTicket(ticketId || reg.ticketId);
    setShowCheckInModal(true);
  };

  const openTicketModal = (reg, attendee) => {
    setSelectedRegistration(reg);
    setSelectedTicket(attendee || null);
    setShowTicketModal(true);
  };

  const toggleExpand = (regId) => {
    setExpandedRegistration(expandedRegistration === regId ? null : regId);
  };

  const handleCheckIn = async () => {
    if (!selectedTicket) return;
    try {
      await checkInAttendee(selectedTicket).unwrap();
      toast.success('Attendee checked in successfully!');
      setShowCheckInModal(false);
      setSelectedRegistration(null);
      setSelectedTicket(null);
      refetchRegistrations();
    } catch (error) {
      toast.error(error?.data?.message || 'Check-in failed');
    }
  };

  const getStatusBadge = (reg) => {
    switch (reg.status) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-green-100 text-green-800', icon: FaCheckCircle };
      case 'pending':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: FaSpinner };
      case 'failed':
        return { label: 'Failed', color: 'bg-red-100 text-red-800', icon: FaTimesCircle };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-gray-100 text-gray-600', icon: FaBan };
      default:
        return { label: reg.status, color: 'bg-gray-100 text-gray-600', icon: FaCheckCircle };
    }
  };

  // Calculate total revenue from confirmed paid registrations
  const totalRevenue = registrations
    .filter(r => r.status === 'confirmed' && r.isPaidEvent)
    .reduce((sum, r) => sum + (r.paidAmount || r.totalAmount || 0), 0);

  if (eventLoading || regLoading) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading registrations...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  if (!event) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
          <button onClick={() => navigate('/admin/events')} className="px-4 py-2 bg-[#1B3766] text-white rounded-lg">
            Back to Events
          </button>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <button onClick={() => navigate(`/admin/events/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors text-sm">
              <FaArrowLeft className="text-xs" /> Back to Event
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-500 mt-1 text-sm">{event.title}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshData} disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm">
              <FaSync className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] transition-all text-sm">
              <FaDownload />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total Registrations" value={totalRegistrations} color="bg-gray-50" textColor="text-gray-900" icon={FaClipboardList} />
          <StatCard label="Confirmed" value={confirmedCount} color="bg-green-50" textColor="text-green-700" icon={FaCheckCircle} />
          <StatCard label="Pending" value={pendingCount} color="bg-yellow-50" textColor="text-yellow-700" icon={FaSpinner} />
          <StatCard label="Total Attendees" value={totalAttendees} color="bg-blue-50" textColor="text-blue-700" icon={FaUsers} />
          <StatCard label="Revenue" value={formatCurrency(totalRevenue)} color="bg-purple-50" textColor="text-purple-700" icon={FaDollarSign} isCurrency />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name, email, ticket ID, seat number, or ticket type..."
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm" 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <FaTimes />
                </button>
              )}
            </div>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredRegistrations.length} of {totalRegistrations} registrations
          {searchTerm && ' (filtered)'}
        </p>

        {/* Registrations Cards */}
        {filteredRegistrations.length === 0 ? (
          <EmptyState hasSearch={!!searchTerm} />
        ) : (
          <div className="space-y-4">
            {filteredRegistrations.map((reg) => {
              const status = getStatusBadge(reg);
              const StatusIcon = status.icon;
              const isCheckedIn = reg.ticketCheckedIn;
              const hasAdditionalAttendees = reg.additionalAttendees?.length > 0;
              const isExpanded = expandedRegistration === reg._id;
              const allCheckedIn = isCheckedIn && 
                (!hasAdditionalAttendees || reg.additionalAttendees.every(a => a.checkedIn));

              return (
                <div 
                  key={reg._id} 
                  className={`bg-white rounded-xl shadow-sm border transition-all ${
                    allCheckedIn ? 'border-green-300 bg-green-50/20' : 'border-gray-200'
                  }`}
                >
                  {/* Main Registration Card */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Attendee Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            allCheckedIn ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            <FaUser className={`text-sm ${allCheckedIn ? 'text-green-600' : 'text-gray-500'}`} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{reg.name}</h3>
                            <p className="text-sm text-gray-500 truncate">{reg.email}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>
                            <StatusIcon className="text-[10px]" />
                            {status.label}
                          </span>
                        </div>

                        {/* Registration Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Ticket Type</p>
                            <p className="text-sm font-medium text-gray-900">
                              {reg.ticketType || 'General'}
                              {reg.quantity > 1 && ` (×${reg.quantity})`}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Ticket ID</p>
                            <p className="text-sm font-mono font-medium text-gray-900">
                              {reg.ticketId || 'Pending...'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Seat Number</p>
                            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              <FaChair className="text-gray-400 text-xs" />
                              {reg.seatNumber || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Amount</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {reg.isPaidEvent ? formatCurrency(reg.paidAmount || reg.totalAmount) : 'Free'}
                            </p>
                          </div>
                        </div>

                        {/* Additional Info Row */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                          {reg.phone && (
                            <span className="flex items-center gap-1">
                              <FaPhone className="text-[10px]" />
                              {reg.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt className="text-[10px]" />
                            {formatShortDate(reg.createdAt)}
                          </span>
                          {hasAdditionalAttendees && (
                            <span className="flex items-center gap-1 text-blue-600">
                              <FaUserPlus className="text-[10px]" />
                              {reg.additionalAttendees.length} additional attendee{reg.additionalAttendees.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {isCheckedIn && (
                            <span className="flex items-center gap-1 text-green-600">
                              <FaClipboardCheck className="text-[10px]" />
                              Checked in: {formatShortDate(reg.checkedInAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button onClick={() => openTicketModal(reg)}
                          className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1">
                          <FaTicketAlt /> Ticket
                        </button>
                        {!isCheckedIn && reg.status === 'confirmed' && (
                          <button onClick={() => openCheckInModal(reg, reg.ticketId)}
                            className="px-3 py-1.5 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1">
                            <FaClipboardCheck /> Check In
                          </button>
                        )}
                        <button onClick={() => openDetailsModal(reg)}
                          className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1">
                          <FaEye /> Details
                        </button>
                        {hasAdditionalAttendees && (
                          <button onClick={() => toggleExpand(reg._id)}
                            className="px-3 py-1.5 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                            {isExpanded ? 'Hide' : 'Show'} All
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Attendees (Expandable) */}
                  {isExpanded && hasAdditionalAttendees && (
                    <div className="border-t border-gray-200 bg-gray-50 rounded-b-xl p-5">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaUserPlus className="text-blue-600" />
                        Additional Attendees ({reg.additionalAttendees.length})
                      </h4>
                      <div className="space-y-3">
                        {reg.additionalAttendees.map((att, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  att.checkedIn ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                  <FaUser className={`text-xs ${att.checkedIn ? 'text-green-600' : 'text-gray-500'}`} />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{att.name}</p>
                                  {att.email && <p className="text-xs text-gray-500">{att.email}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {att.checkedIn ? (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <FaClipboardCheck /> Checked In
                                  </span>
                                ) : (
                                  <button onClick={() => openCheckInModal(reg, att.ticketId)}
                                    className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded transition-colors flex items-center gap-1">
                                    <FaClipboardCheck /> Check In
                                  </button>
                                )}
                                <button onClick={() => openTicketModal(reg, att)}
                                  className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded transition-colors flex items-center gap-1">
                                  <FaTicketAlt /> Ticket
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="font-mono">ID: {att.ticketId || 'Pending'}</span>
                              {att.seatNumber && (
                                <span className="flex items-center gap-1">
                                  <FaChair className="text-[10px]" />
                                  Seat: {att.seatNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-semibold text-gray-900">Registration Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <FaTimes />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <DetailSection icon={FaUser} title="Attendee Information">
                <DetailRow label="Name" value={selectedRegistration.name} />
                <DetailRow label="Email" value={selectedRegistration.email} />
                <DetailRow label="Phone" value={selectedRegistration.phone || 'N/A'} />
              </DetailSection>

              <DetailSection icon={FaTicketAlt} title="Ticket Information">
                <DetailRow label="Ticket Type" value={selectedRegistration.ticketType || 'General'} />
                <DetailRow label="Quantity" value={selectedRegistration.quantity || 1} />
                <DetailRow label="Seats per Ticket" value={selectedRegistration.seatsPerTicket || 1} />
                <DetailRow label="Total Seats" value={selectedRegistration.totalSeats || 1} />
                <DetailRow label="Ticket ID" value={selectedRegistration.ticketId || 'Pending'} mono />
                <DetailRow label="Seat Number" value={selectedRegistration.seatNumber || 'Pending'} />
                <DetailRow 
                  label="Checked In" 
                  value={selectedRegistration.ticketCheckedIn ? `Yes - ${formatDate(selectedRegistration.checkedInAt)}` : 'No'} 
                />
              </DetailSection>

              {selectedRegistration.additionalAttendees?.length > 0 && (
                <DetailSection icon={FaUserPlus} title={`Additional Attendees (${selectedRegistration.additionalAttendees.length})`}>
                  {selectedRegistration.additionalAttendees.map((att, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3 mb-2">
                      <p className="text-sm font-medium">{att.name}</p>
                      <div className="text-xs text-gray-500 space-y-1 mt-1">
                        {att.email && <p>Email: {att.email}</p>}
                        <p className="font-mono">Ticket ID: {att.ticketId || 'Pending'}</p>
                        {att.seatNumber && <p>Seat: {att.seatNumber}</p>}
                        <p>Checked In: {att.checkedIn ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  ))}
                </DetailSection>
              )}

              <DetailSection icon={FaDollarSign} title="Payment Information">
                <DetailRow label="Is Paid Event" value={selectedRegistration.isPaidEvent ? 'Yes' : 'No'} />
                {selectedRegistration.isPaidEvent && (
                  <>
                    <DetailRow label="Price per Ticket" value={formatCurrency(selectedRegistration.price)} />
                    <DetailRow label="Total Amount" value={formatCurrency(selectedRegistration.totalAmount)} />
                    <DetailRow label="Paid Amount" value={formatCurrency(selectedRegistration.paidAmount)} />
                    <DetailRow label="Payment Reference" value={selectedRegistration.paymentReference || 'N/A'} mono />
                    {selectedRegistration.paymentConfirmedAt && (
                      <DetailRow label="Payment Confirmed" value={formatDate(selectedRegistration.paymentConfirmedAt)} />
                    )}
                  </>
                )}
                <DetailRow label="Status" value={
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedRegistration).color}`}>
                    {getStatusBadge(selectedRegistration).label}
                  </span>
                } />
              </DetailSection>

              <DetailSection icon={FaCalendarAlt} title="Registration Timeline">
                <DetailRow label="Registered On" value={formatDate(selectedRegistration.createdAt)} />
                <DetailRow label="Last Updated" value={formatDate(selectedRegistration.updatedAt)} />
              </DetailSection>
            </div>
          </div>
        </div>
      )}

      {/* Check-in Modal */}
      {showCheckInModal && selectedRegistration && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowCheckInModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <FaClipboardCheck className="text-2xl text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Check In Attendee</h3>
              
              {/* Show attendee info based on whether it's primary or additional */}
              {selectedTicket === selectedRegistration.ticketId ? (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
                  <p className="text-sm"><strong>Name:</strong> {selectedRegistration.name}</p>
                  <p className="text-sm"><strong>Email:</strong> {selectedRegistration.email}</p>
                  <p className="text-sm font-mono"><strong>Ticket ID:</strong> {selectedTicket}</p>
                  <p className="text-sm"><strong>Seat:</strong> {selectedRegistration.seatNumber || 'General'}</p>
                </div>
              ) : (
                (() => {
                  const att = selectedRegistration.additionalAttendees?.find(a => a.ticketId === selectedTicket);
                  return att ? (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left space-y-2">
                      <p className="text-sm"><strong>Name:</strong> {att.name}</p>
                      {att.email && <p className="text-sm"><strong>Email:</strong> {att.email}</p>}
                      <p className="text-sm font-mono"><strong>Ticket ID:</strong> {selectedTicket}</p>
                      {att.seatNumber && <p className="text-sm"><strong>Seat:</strong> {att.seatNumber}</p>}
                    </div>
                  ) : null;
                })()
              )}
              
              <p className="text-sm text-gray-500 mb-6">Confirm check-in for this attendee?</p>
              <div className="flex gap-3">
                <button onClick={() => { setShowCheckInModal(false); setSelectedTicket(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button onClick={handleCheckIn} disabled={isCheckingIn}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50">
                  {isCheckingIn ? 'Checking in...' : 'Confirm Check-in'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }}>
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <FaQrcode className="text-4xl text-[#1B3766] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Event Ticket</h3>
              <p className="text-sm text-gray-500 mb-4">{event.title}</p>
              
              {/* Determine which attendee to show */}
              {(() => {
                const attendee = selectedTicket && selectedTicket !== selectedRegistration.ticketId
                  ? selectedRegistration.additionalAttendees?.find(a => a.ticketId === selectedTicket?.ticketId || a === selectedTicket)
                  : null;
                
                const displayName = attendee?.name || selectedRegistration.name;
                const displayEmail = attendee?.email || selectedRegistration.email;
                const displayTicketId = attendee?.ticketId || selectedTicket?.ticketId || selectedTicket || selectedRegistration.ticketId;
                const displaySeat = attendee?.seatNumber || selectedRegistration.seatNumber;
                const isCheckedIn = attendee ? attendee.checkedIn : selectedRegistration.ticketCheckedIn;

                return (
                  <div className="border-2 border-dashed border-[#1B3766] rounded-xl p-4 mb-4">
                    <div className="bg-[#1B3766] text-white text-center py-2 rounded-lg mb-3">
                      <p className="text-xs text-[#79FFFF]">TICKET ID</p>
                      <p className="text-lg font-bold tracking-wider">{displayTicketId || 'Pending'}</p>
                    </div>
                    <div className="space-y-2 text-sm text-left">
                      <p><strong>Attendee:</strong> {displayName}</p>
                      <p><strong>Email:</strong> {displayEmail}</p>
                      <p><strong>Ticket Type:</strong> {selectedRegistration.ticketType || 'General'}</p>
                      {displaySeat && <p><strong>Seat:</strong> {displaySeat}</p>}
                      <p><strong>Date:</strong> {formatShortDate(event?.date)}</p>
                      <p><strong>Time:</strong> {event?.time || 'TBD'}</p>
                      <p><strong>Venue:</strong> {event?.venue || event?.location || 'TBD'}</p>
                      <p><strong>Status:</strong> {isCheckedIn ? '✅ Checked In' : '⏳ Not Checked In'}</p>
                    </div>
                  </div>
                );
              })()}

              <button onClick={() => { setShowTicketModal(false); setSelectedTicket(null); }}
                className="w-full py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminSidebar>
  );
};

// Sub-components
const StatCard = ({ label, value, color, textColor, icon: Icon, isCurrency }) => (
  <div className={`rounded-xl shadow-sm border border-gray-200 p-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
        <p className={`text-xl font-bold mt-1 ${textColor} ${isCurrency ? 'text-sm' : ''}`}>{value}</p>
      </div>
      <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center">
        <Icon className={`text-sm ${textColor}`} />
      </div>
    </div>
  </div>
);

const EmptyState = ({ hasSearch }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
      <FaUsers className="text-2xl text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">No registrations found</h3>
    <p className="text-gray-500 text-sm">
      {hasSearch 
        ? 'No registrations match your search criteria. Try different keywords.'
        : 'No attendees have registered for this event yet.'
      }
    </p>
  </div>
);

const DetailSection = ({ icon: Icon, title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
      <Icon className="text-[#1B3766] text-sm" />{title}
    </h4>
    <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">{children}</div>
  </div>
);

const DetailRow = ({ label, value, mono }) => (
  <p className="flex justify-between items-start">
    <span className="text-gray-500 flex-shrink-0">{label}:</span>
    <span className={`font-medium text-gray-900 text-right ml-4 ${mono ? 'font-mono text-xs break-all' : ''}`}>
      {value || '—'}
    </span>
  </p>
);

export default AdminEventRegistrations;