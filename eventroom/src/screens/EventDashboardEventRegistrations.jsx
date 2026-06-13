// screens/EventDashboardEventRegistrations.jsx - Fixed QR Scanner & Mobile Design
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaUser, FaUsers, FaDownload, FaSearch, FaTimes, FaEye,
  FaSync, FaBan, FaTicketAlt, FaChair, FaClipboardCheck,
  FaQrcode, FaUserFriends, FaDollarSign, FaFilter, FaLayerGroup,
  FaEnvelope, FaCamera, FaSlidersH,
} from 'react-icons/fa';
import {
  useGetEventByIdQuery,
  useGetEventRegistrationsQuery,
  useCheckInAttendeeMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardEventRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- State ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [scannerError, setScannerError] = useState(null);

  // Modal animations
  const [detailsModalAnim, setDetailsModalAnim] = useState(false);
  const [checkInModalAnim, setCheckInModalAnim] = useState(false);
  const [ticketModalAnim, setTicketModalAnim] = useState(false);

  // QR scanner refs
  const qrScannerRef = useRef(null);
  const scannerContainerId = 'qr-reader-container';
  const [scannerInitialized, setScannerInitialized] = useState(false);

  // API hooks
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

  // --- Effects ---
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize QR scanner when modal opens
  useEffect(() => {
    if (showScanner && !scannerInitialized) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const container = document.getElementById(scannerContainerId);
        if (container && !qrScannerRef.current) {
          const scanner = new Html5Qrcode(scannerContainerId);
          qrScannerRef.current = scanner;
          scanner.start(
            { facingMode: 'environment' }, // use back camera
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              scanner.stop();
              setScannerInitialized(false);
              handleScan(decodedText);
            },
            (error) => {
              console.debug('QR scan error', error);
            }
          ).catch(err => {
            console.error('Failed to start scanner', err);
            setScannerError('Could not access camera. Please check permissions.');
            toast.error('Camera access denied or not available');
            setShowScanner(false);
          });
          setScannerInitialized(true);
        }
      }, 100);
    } else if (!showScanner && qrScannerRef.current) {
      qrScannerRef.current.stop().catch(console.error);
      qrScannerRef.current.clear();
      qrScannerRef.current = null;
      setScannerInitialized(false);
    }
  }, [showScanner]);

  // --- Helper functions ---
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

  const getCustomValue = (value) => {
    if (Array.isArray(value)) return value.join('; ');
    if (value === undefined || value === null) return '';
    return String(value);
  };

  const getAllCustomLabels = () => {
    const labelsSet = new Set();
    registrations.forEach((reg) => {
      if (reg.customFormResponses && Array.isArray(reg.customFormResponses)) {
        reg.customFormResponses.forEach((resp) => {
          if (resp.label) labelsSet.add(resp.label);
        });
      }
    });
    return Array.from(labelsSet).sort();
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      reg.name?.toLowerCase().includes(s) ||
      reg.email?.toLowerCase().includes(s) ||
      reg.phone?.toLowerCase().includes(s) ||
      reg.ticketId?.toLowerCase().includes(s) ||
      reg.seatNumber?.toLowerCase().includes(s) ||
      reg.ticketType?.toLowerCase().includes(s) ||
      reg.additionalAttendees?.some(
        (a) =>
          a.name?.toLowerCase().includes(s) ||
          a.email?.toLowerCase().includes(s) ||
          a.ticketId?.toLowerCase().includes(s) ||
          a.seatNumber?.toLowerCase().includes(s)
      )
    );
  });

  const exportToCSV = () => {
    const customLabels = getAllCustomLabels();
    const baseColumns = [
      'Type', 'Name', 'Email', 'Phone', 'Ticket ID', 'Seat Number',
      'Ticket Type', 'Quantity', 'Registration Date', 'Status',
      'Amount (NGN)', 'Checked In', 'Check-in Time',
      'Payment Reference', 'Paid Amount (NGN)'
    ];
    const headers = [...baseColumns, ...customLabels];
    
    const rows = [headers];

    const formatCheckInTime = (reg, isAttendee = false, attendee = null) => {
      if (isAttendee && attendee) {
        return attendee.checkedInAt ? formatDate(attendee.checkedInAt) : '';
      }
      return reg.checkedInAt ? formatDate(reg.checkedInAt) : '';
    };

    filteredRegistrations.forEach((reg) => {
      const buyerRow = {};
      baseColumns.forEach(col => buyerRow[col] = '');
      customLabels.forEach(label => buyerRow[label] = '');
      
      buyerRow['Type'] = 'Buyer';
      buyerRow['Name'] = reg.name || '';
      buyerRow['Email'] = reg.email || '';
      buyerRow['Phone'] = reg.phone || '';
      buyerRow['Ticket ID'] = reg.ticketId || '';
      buyerRow['Seat Number'] = reg.seatNumber || '';
      buyerRow['Ticket Type'] = reg.ticketType || 'General';
      buyerRow['Quantity'] = reg.quantity || 1;
      buyerRow['Registration Date'] = formatDate(reg.createdAt);
      buyerRow['Status'] = reg.status || '';
      buyerRow['Amount (NGN)'] = reg.totalAmount || reg.price || 0;
      buyerRow['Checked In'] = reg.ticketCheckedIn ? 'Yes' : 'No';
      buyerRow['Check-in Time'] = formatCheckInTime(reg);
      buyerRow['Payment Reference'] = reg.paymentReference || '';
      buyerRow['Paid Amount (NGN)'] = reg.paidAmount || '';
      
      if (reg.customFormResponses && Array.isArray(reg.customFormResponses)) {
        reg.customFormResponses.forEach((resp) => {
          if (resp.label && buyerRow.hasOwnProperty(resp.label)) {
            buyerRow[resp.label] = getCustomValue(resp.value);
          }
        });
      }
      
      rows.push(baseColumns.map(col => `"${String(buyerRow[col] || '').replace(/"/g, '""')}"`).concat(
        customLabels.map(label => `"${String(buyerRow[label] || '').replace(/"/g, '""')}"`)
      ));

      if (reg.additionalAttendees && reg.additionalAttendees.length > 0) {
        reg.additionalAttendees.forEach((att) => {
          const guestRow = {};
          baseColumns.forEach(col => guestRow[col] = '');
          customLabels.forEach(label => guestRow[label] = '');
          
          guestRow['Type'] = 'Guest';
          guestRow['Name'] = att.name || '';
          guestRow['Email'] = att.email || '';
          guestRow['Phone'] = att.phone || '';
          guestRow['Ticket ID'] = att.ticketId || '';
          guestRow['Seat Number'] = att.seatNumber || '';
          guestRow['Ticket Type'] = reg.ticketType || 'General';
          guestRow['Quantity'] = 1;
          guestRow['Registration Date'] = '';
          guestRow['Status'] = reg.status || '';
          guestRow['Amount (NGN)'] = 0;
          guestRow['Checked In'] = att.checkedIn ? 'Yes' : 'No';
          guestRow['Check-in Time'] = formatCheckInTime(reg, true, att);
          guestRow['Payment Reference'] = reg.paymentReference || '';
          guestRow['Paid Amount (NGN)'] = '';
          
          if (reg.customFormResponses && Array.isArray(reg.customFormResponses)) {
            reg.customFormResponses.forEach((resp) => {
              if (resp.label && guestRow.hasOwnProperty(resp.label)) {
                guestRow[resp.label] = getCustomValue(resp.value);
              }
            });
          }
          
          rows.push(baseColumns.map(col => `"${String(guestRow[col] || '').replace(/"/g, '""')}"`).concat(
            customLabels.map(label => `"${String(guestRow[label] || '').replace(/"/g, '""')}"`)
          ));
        });
      }
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `registrations_${event?.title?.replace(/\s+/g, '_') || 'export'}_${new Date().toISOString().slice(0,19)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filteredRegistrations.length} registrations with all details!`);
  };

  const bulkMail = () => {
    const emailSet = new Set();
    filteredRegistrations.forEach((reg) => {
      if (reg.email && reg.email.trim()) emailSet.add(reg.email.trim());
      if (reg.additionalAttendees && reg.additionalAttendees.length) {
        reg.additionalAttendees.forEach((att) => {
          if (att.email && att.email.trim()) emailSet.add(att.email.trim());
        });
      }
    });
    
    const emails = Array.from(emailSet);
    if (emails.length === 0) {
      toast.error('No email addresses found to send mail.');
      return;
    }
    
    const subject = encodeURIComponent(`Follow-up: ${event?.title || 'Event'} Update`);
    const body = encodeURIComponent(
      `Dear Attendee,\n\nThank you for registering for "${event?.title}". We hope you had a great experience!\n\n` +
      `We would love to hear your feedback. Please feel free to reply to this email with any questions or comments.\n\n` +
      `Best regards,\n${event?.organizer || 'Event Team'}`
    );
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emails.join(','))}&su=${subject}&body=${body}`;
    window.open(gmailComposeUrl, '_blank');
    toast.success(`Opening Gmail with ${emails.length} recipient(s).`);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchEvent(), refetchRegistrations()]);
    setIsRefreshing(false);
    toast.success('Refreshed');
  };

  const handleScan = async (decodedText) => {
    setScannerError(null);
    try {
      let ticketId = decodedText;
      if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        const parsed = JSON.parse(decodedText);
        ticketId = parsed.ticketId;
      }
      if (!ticketId) throw new Error('Invalid QR code: no ticket ID');

      await checkInAttendee(ticketId).unwrap();
      toast.success('✅ Check-in successful!');
      setShowScanner(false);
      refetchRegistrations();
    } catch (error) {
      const msg = error?.data?.message || error?.message || 'Check-in failed';
      toast.error(msg);
      setScannerError(msg);
    }
  };

  // Modal helpers
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

  // --- Early returns ---
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
            onClick={() => navigate('/dashboard/events')}
            className="px-4 py-2 bg-[#1B3766] text-white rounded-lg"
          >
            Back to My Events
          </button>
        </div>
      </EventDashboardSidebar>
    );
  }

  // --- UI Components (mobile optimised) ---
  const FilterSelectDesktop = () => (
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

  const FilterPopupMobile = () => (
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

  // Floating action buttons (mobile only)
  const FloatingButtons = () => (
    <div className="md:hidden fixed bottom-6 right-4 z-40 flex flex-col gap-3">
      <button
        onClick={() => setShowScanner(true)}
        className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center hover:bg-purple-700 transition-all"
      >
        <FaCamera className="text-xl" />
      </button>
      <button
        onClick={openFilterPopup}
        className="w-14 h-14 rounded-full bg-[#1B3766] text-white shadow-lg flex items-center justify-center hover:bg-[#142952] transition-all"
      >
        <FaSlidersH className="text-xl" />
      </button>
    </div>
  );

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
                  Ticket: {att.ticketId || '—'} • Seat: {att.seatNumber || '—'} • Email: {att.email || '—'}
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

  const ScannerModal = () => (
    <ModalContainer show={showScanner} onClose={() => setShowScanner(false)} anim={showScanner}>
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button onClick={() => setShowScanner(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes />
          </button>
        </div>
        <div id={scannerContainerId} className="w-full rounded-xl overflow-hidden" style={{ minHeight: '300px' }}></div>
        {scannerError && (
          <p className="text-red-600 text-sm mt-3">{scannerError}</p>
        )}
        <p className="text-xs text-gray-500 my-4">
          Position the QR code inside the frame. The ticket will be checked in automatically.
        </p>
        <button
          onClick={() => setShowScanner(false)}
          className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>
    </ModalContainer>
  );

  // --- Main return with mobile‑optimised list ---
  return (
    <EventDashboardSidebar>
      <div className="p-3 md:p-6 relative">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <button
              onClick={() => navigate(`/dashboard/events/${id}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors text-sm"
            >
              <FaArrowLeft className="text-xs" /> Back to Event
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Registrations</h1>
            <p className="text-gray-500 text-sm mt-0.5">{event.title}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
            >
              <FaSync className={isRefreshing ? 'animate-spin' : ''} /> <span className="hidden md:inline">Refresh</span>
            </button>
            <button
              onClick={bulkMail}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              <FaEnvelope /> <span className="hidden md:inline">Bulk Mail</span>
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952] text-sm"
            >
              <FaDownload /> <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Stats - reduced padding on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
          <StatCardMobile label="Total" value={totalRegistrations} color="bg-gray-50" textColor="text-gray-900" icon={FaUsers} />
          <StatCardMobile label="Confirmed" value={confirmedCount} color="bg-green-50" textColor="text-green-700" icon={FaCheckCircle} />
          <StatCardMobile label="Pending" value={pendingCount} color="bg-yellow-50" textColor="text-yellow-700" icon={FaSpinner} />
          <StatCardMobile label="Checked In" value={getAllCheckedInCount()} color="bg-blue-50" textColor="text-blue-700" icon={FaClipboardCheck} />
          <StatCardMobile label="Revenue" value={formatPrice(totalRevenue)} color="bg-purple-50" textColor="text-purple-700" icon={FaDollarSign} isCurrency />
        </div>

        {/* Search + Desktop Filter */}
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, ticket ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <FaTimes />
                </button>
              )}
            </div>
            <FilterSelectDesktop />
          </div>
        </div>

        {/* Registration list - Desktop (cards with shadow) */}
        <div className="hidden md:block">
          {filteredRegistrations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((reg) => {
                const status = getStatusBadge(reg.status);
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
                    <div className="p-4 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${reg.ticketCheckedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
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
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                          <span>{reg.email}</span>
                          {reg.phone && <span>📞 {reg.phone}</span>}
                          <span>•</span>
                          <span>{reg.ticketType || 'General'}</span>
                          <span>•</span>
                          <span>Qty: {reg.quantity || 1}</span>
                          <span>•</span>
                          <span className="font-mono">{reg.ticketId}</span>
                          <span>•</span>
                          <span><FaChair className="inline text-[10px]" /> {reg.seatNumber}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-semibold text-sm">{reg.totalAmount > 0 ? formatPrice(reg.totalAmount) : 'Free'}</p>
                        <p className="text-[10px] text-gray-400">{formatDate(reg.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {reg.ticketCheckedIn ? (
                          <span className="text-[10px] text-green-600 font-medium px-2">✅ In</span>
                        ) : (
                          reg.status === 'confirmed' && (
                            <button onClick={() => openCheckInModal(reg)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Check In</button>
                          )
                        )}
                        <button onClick={() => openTicketModal(reg)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Ticket"><FaTicketAlt className="text-sm" /></button>
                        <button onClick={() => openDetailsModal(reg)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEye className="text-sm" /></button>
                      </div>
                    </div>
                    {hasAdditional && (
                      <div className="border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                        {reg.additionalAttendees.map((att, idx) => (
                          <div key={idx} className="px-4 py-2.5 flex items-center gap-4 border-b border-gray-100 last:border-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${att.checkedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <FaUser className={`text-xs ${att.checkedIn ? 'text-green-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{att.name || 'Guest'}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                {att.email && <span>{att.email}</span>}
                                {att.phone && <span>📞 {att.phone}</span>}
                                <span className="font-mono">{att.ticketId}</span>
                                {att.seatNumber && <span><FaChair className="inline text-[10px]" /> {att.seatNumber}</span>}
                              </div>
                            </div>
                            {att.checkedIn ? (
                              <span className="text-[10px] text-green-600 font-medium px-2">✅ In</span>
                            ) : (
                              <button onClick={() => openCheckInModal(reg, att)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Check In</button>
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

        {/* Registration list - Mobile (edge-to-edge, border-bottom separators, no shadows) */}
        <div className="md:hidden -mx-3 px-3">
          {filteredRegistrations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredRegistrations.map((reg) => {
                const status = getStatusBadge(reg.status);
                const hasAdditional = reg.additionalAttendees?.length > 0;
                return (
                  <div key={reg._id} className="py-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm">{reg.name}</p>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${status.color}`}>
                            <status.icon className="text-[10px]" /> {status.label}
                          </span>
                          {hasAdditional && (
                            <span className="text-[10px] text-blue-600">
                              <FaUserFriends className="inline mr-0.5" />+{reg.additionalAttendees.length}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 space-x-1">
                          <span>{reg.email}</span>
                          {reg.phone && <span>📞 {reg.phone}</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">{reg.ticketType || 'General'}</span>
                          <span>Qty: {reg.quantity || 1}</span>
                          <span className="font-mono text-[11px]">{reg.ticketId}</span>
                          <span><FaChair className="inline text-[10px]" /> {reg.seatNumber || '—'}</span>
                          <span className="font-semibold text-gray-700">{reg.totalAmount > 0 ? formatPrice(reg.totalAmount) : 'Free'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 ml-2">
                        {reg.ticketCheckedIn ? (
                          <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">✅ In</span>
                        ) : (
                          reg.status === 'confirmed' && (
                            <button onClick={() => openCheckInModal(reg)} className="px-2 py-1 bg-green-600 text-white rounded text-[11px]">Check In</button>
                          )
                        )}
                        <div className="flex gap-1 mt-1">
                          <button onClick={() => openTicketModal(reg)} className="p-1 text-indigo-600 bg-indigo-50 rounded" title="Ticket"><FaTicketAlt className="text-xs" /></button>
                          <button onClick={() => openDetailsModal(reg)} className="p-1 text-blue-600 bg-blue-50 rounded"><FaEye className="text-xs" /></button>
                        </div>
                      </div>
                    </div>
                    {hasAdditional && (
                      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1.5">
                        {reg.additionalAttendees.map((att, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${att.checkedIn ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <FaUser className="text-[9px] text-gray-500" />
                              </div>
                              <div>
                                <span className="font-medium text-gray-800">{att.name || 'Guest'}</span>
                                <div className="text-[10px] text-gray-400">{att.ticketId}</div>
                              </div>
                            </div>
                            {att.checkedIn ? (
                              <span className="text-green-600 text-[10px] bg-green-50 px-1.5 py-0.5 rounded-full">✅ In</span>
                            ) : (
                              <button onClick={() => openCheckInModal(reg, att)} className="px-2 py-0.5 bg-green-600 text-white rounded text-[10px]">Check In</button>
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

        <p className="text-center text-xs text-gray-500 mt-4">
          Showing {filteredRegistrations.length} of {totalRegistrations} registrations
        </p>

        {/* Floating buttons (mobile) */}
        <FloatingButtons />
        <FilterPopupMobile />

        {/* Modals */}
        <ModalContainer show={showDetailsModal} onClose={closeDetailsModal} anim={detailsModalAnim}>
          {detailsContent}
        </ModalContainer>
        <ModalContainer show={showCheckInModal} onClose={closeCheckInModal} anim={checkInModalAnim}>
          {checkInContent}
        </ModalContainer>
        <ModalContainer show={showTicketModal} onClose={closeTicketModal} anim={ticketModalAnim}>
          {ticketContent}
        </ModalContainer>
        <ScannerModal />
      </div>
    </EventDashboardSidebar>
  );
};

// --- Reusable components (mobile optimised stat card) ---
const StatCardMobile = ({ label, value, color, textColor, icon: Icon, isCurrency }) => (
  <div className={`rounded-xl p-3 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className={`text-base font-bold mt-0.5 ${textColor} ${isCurrency ? 'text-xs' : ''}`}>{value}</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center">
        <Icon className={`text-sm ${textColor}`} />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="bg-white rounded-xl border border-gray-100 text-center py-12">
    <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
      <FaUsers className="text-xl text-gray-400" />
    </div>
    <h3 className="text-md font-semibold text-gray-900 mb-1">No registrations found</h3>
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