// pages/EventDashboardTeam.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  useGetMyTeamEventsQuery,
  useGetEventTeamQuery,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,
  useGetEventRegistrationsTeamQuery,
  useVerifyTicketTeamMutation,
} from '../slices/eventApiSlice';
import { toast } from 'react-toastify';
import {
  FaChevronDown,
  FaChevronRight,
  FaUsers,
  FaUserPlus,
  FaTrash,
  FaTicketAlt,
  FaCheckCircle,
  FaSpinner,
  FaCamera,
  FaTimes,
} from 'react-icons/fa';
import { Html5Qrcode } from 'html5-qrcode';
import EventDashboardSidebar from '../components/EventDashboardSidebar';

const EventDashboardTeam = () => {
  // ==================== STATE ====================
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showRegistrations, setShowRegistrations] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('viewer');
  const [addingMember, setAddingMember] = useState(false);
  const [checkingIn, setCheckingIn] = useState(null);

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // QR scanner state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [isProcessingScan, setIsProcessingScan] = useState(false);
  const qrScannerRef = useRef(null);
  const scannerContainerId = 'team-qr-reader';
  const lastScanTimeRef = useRef(0);

  // Role options for custom dropdown
  const roleOptions = [
    { value: 'viewer', label: 'Viewer', desc: 'View only' },
    { value: 'checker', label: 'Checker', desc: 'View + check-in' },
    { value: 'manager', label: 'Manager', desc: 'Full access + manage team' },
  ];

  // ==================== API HOOKS ====================
  const {
    data: teamEvents,
    isLoading: loadingEvents,
    error: eventsError,
    refetch: refetchEvents,
  } = useGetMyTeamEventsQuery();

  const {
    data: teamData,
    isLoading: loadingTeam,
    refetch: refetchTeam,
  } = useGetEventTeamQuery(expandedEvent, {
    skip: !expandedEvent,
  });

  const {
    data: registrationsData,
    isLoading: loadingRegs,
    refetch: refetchRegs,
  } = useGetEventRegistrationsTeamQuery(
    { id: showRegistrations },
    { skip: !showRegistrations }
  );

  const [addTeamMember] = useAddTeamMemberMutation();
  const [removeTeamMember] = useRemoveTeamMemberMutation();
  const [verifyTicketTeam] = useVerifyTicketTeamMutation();

  // ==================== QR SCANNER LIFECYCLE ====================
  const startScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        await qrScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping existing scanner:', err);
      }
      qrScannerRef.current = null;
    }

    const container = document.getElementById(scannerContainerId);
    if (!container) {
      setScannerError('Scanner container not found');
      toast.error('Scanner error, please try again');
      setShowScanner(false);
      return;
    }

    try {
      const scanner = new Html5Qrcode(scannerContainerId);
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => handleScan(decodedText),
        () => {} // ignore debug messages
      );
      qrScannerRef.current = scanner;
      setScannerError(null);
    } catch (err) {
      console.error('Failed to start scanner:', err);
      let errorMsg = 'Could not start camera. ';
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera permission denied. Please allow camera access.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else {
        errorMsg += 'Please check your camera and try again.';
      }
      setScannerError(errorMsg);
      toast.error(errorMsg);
      setShowScanner(false);
    }
  };

  const stopScanner = async () => {
    if (qrScannerRef.current) {
      try {
        await qrScannerRef.current.stop();
        await qrScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      qrScannerRef.current = null;
    }
  };

  useEffect(() => {
    if (showScanner) {
      const timer = setTimeout(() => startScanner(), 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
      setIsProcessingScan(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner]);

  // ==================== HANDLERS ====================
  const handleScan = async (decodedText) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current < 2000) return;
    lastScanTimeRef.current = now;

    if (isProcessingScan) return;
    setIsProcessingScan(true);
    setScannerError(null);

    try {
      let ticketId = decodedText;
      if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        const parsed = JSON.parse(decodedText);
        ticketId = parsed.ticketId;
      }
      if (!ticketId) throw new Error('Invalid QR code');

      await verifyTicketTeam({
        id: expandedEvent,
        ticketId,
      }).unwrap();

      toast.success(`✅ Ticket checked in successfully!`);
      setShowScanner(false);
      if (showRegistrations) refetchRegs();
    } catch (error) {
      const msg = error?.data?.message || error?.message || 'Check-in failed';
      toast.error(msg);
      setScannerError(msg);
    } finally {
      setIsProcessingScan(false);
    }
  };

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
    setShowRegistrations(null);
  };

  const toggleRegistrations = (eventId) => {
    setShowRegistrations(showRegistrations === eventId ? null : eventId);
  };

  const handleAddMember = async (eventId) => {
    if (!newMemberEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    setAddingMember(true);
    try {
      await addTeamMember({
        id: eventId,
        data: { email: newMemberEmail.trim(), role: newMemberRole },
      }).unwrap();
      toast.success('Team member added successfully');
      setNewMemberEmail('');
      setNewMemberRole('viewer');
      refetchTeam();
      refetchEvents();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
      setDropdownOpen(false);
    }
  };

  const handleRemoveMember = async (eventId, userId) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await removeTeamMember({ id: eventId, userId }).unwrap();
      toast.success('Team member removed');
      refetchTeam();
      refetchEvents();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove team member');
    }
  };

  const handleCheckIn = async (eventId, ticketId) => {
    setCheckingIn(ticketId);
    try {
      await verifyTicketTeam({ id: eventId, ticketId }).unwrap();
      toast.success('Check-in successful');
      refetchRegs();
    } catch (err) {
      toast.error(err?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(null);
    }
  };

  // ==================== HELPERS ====================
  const roleBadge = (role) => {
    const colors = {
      creator: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      checker: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || colors.viewer;
  };

  // ==================== SCANNER MODAL ====================
  const ScannerModal = () => (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity ${
        showScanner ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setShowScanner(false)}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Scan QR Code</h3>
          <button
            onClick={() => setShowScanner(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ minHeight: '300px' }}>
          <div id={scannerContainerId} className="w-full"></div>
          <div className="absolute inset-0 border-2 border-white/30 pointer-events-none rounded-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg pointer-events-none"></div>
        </div>
        {isProcessingScan && (
          <div className="mt-3 text-blue-600 text-sm flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin" /> Checking in...
          </div>
        )}
        {scannerError && (
          <p className="text-red-600 text-sm mt-3">{scannerError}</p>
        )}
        <p className="text-xs text-gray-500 mt-4">
          📷 Position the QR code inside the frame. <br />
          🔍 Move the camera closer if needed.
        </p>
        <button
          onClick={() => setShowScanner(false)}
          className="w-full py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm mt-4"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // ==================== LOADING / ERROR STATES ====================
  if (loadingEvents) {
    return (
      <EventDashboardSidebar>
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
      </EventDashboardSidebar>
    );
  }

  if (eventsError) {
    return (
      <EventDashboardSidebar>
        <div className="text-center text-red-600 py-8">
          Failed to load team events. Please try again.
        </div>
      </EventDashboardSidebar>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <EventDashboardSidebar>
      <div className="max-w-6xl mx-auto relative">
        {/* Header with Scan button */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm shadow-sm transition-colors"
            >
              <FaCamera /> Scan QR
            </button>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
              {teamEvents?.length || 0} events
            </span>
          </div>
        </div>

        {!teamEvents || teamEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <FaUsers className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">You are not a team member of any event yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Events you create will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamEvents.map((event) => {
              const isExpanded = expandedEvent === event._id;
              const isRegsOpen = showRegistrations === event._id;

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible transition-all hover:shadow-md"
                >
                  {/* Event header */}
                  <div
                    className="px-4 py-4 md:px-6 flex flex-wrap items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(event._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-400">
                        {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-0.5">
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{event.status}</span>
                          <span>•</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(event.role)}`}>
                            {event.role || 'viewer'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      {event.role !== 'viewer' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRegistrations(event._id);
                          }}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <FaTicketAlt className="text-xs" />
                          Registrations
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-4 md:px-6 pb-4 pt-2 border-t border-gray-100">
                      {/* Team members list */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <FaUsers className="text-gray-400" /> Team Members
                          {loadingTeam && <FaSpinner className="animate-spin ml-2" />}
                        </h4>
                        {teamData?.teamMembers?.length > 0 ? (
                          <ul className="space-y-1">
                            {teamData.teamMembers.map((member) => (
                              <li
                                key={member.userId}
                                className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{member.name}</span>
                                  <span className="text-xs text-gray-500">({member.email})</span>
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${roleBadge(member.role)}`}>
                                    {member.role}
                                  </span>
                                </div>
                                {(event.role === 'creator' || event.role === 'manager') && (
                                  <button
                                    onClick={() => handleRemoveMember(event._id, member.userId)}
                                    className="text-red-500 hover:text-red-700 text-sm transition-colors"
                                    title="Remove member"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No team members yet.</p>
                        )}
                      </div>

                      {/* Add member form */}
                      {(event.role === 'creator' || event.role === 'manager') && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                          <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <FaUserPlus className="text-gray-400" /> Add Team Member
                          </h5>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              type="email"
                              placeholder="Email address"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm bg-white shadow-sm"
                            />

                            {/* Custom Dropdown */}
                            <div className="relative w-full sm:w-48">
                              <button
                                type="button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-full px-4 py-2.5 text-sm text-left bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-between hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                              >
                                <span className="capitalize">{newMemberRole}</span>
                                <svg
                                  className={`w-4 h-4 text-gray-400 transition-transform ${
                                    dropdownOpen ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>

                              {dropdownOpen && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                  {roleOptions.map((option) => (
                                    <div
                                      key={option.value}
                                      className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-colors ${
                                        newMemberRole === option.value
                                          ? 'bg-indigo-50 text-indigo-700'
                                          : 'text-gray-700'
                                      }`}
                                      onClick={() => {
                                        setNewMemberRole(option.value);
                                        setDropdownOpen(false);
                                      }}
                                    >
                                      <span className="capitalize">{option.label}</span>
                                      <span className="text-xs text-gray-400">{option.desc}</span>
                                      {newMemberRole === option.value && (
                                        <FaCheckCircle className="text-indigo-500 ml-2" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleAddMember(event._id)}
                              disabled={addingMember}
                              className="px-6 py-2.5 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#152a4f] transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm whitespace-nowrap"
                            >
                              {addingMember ? <FaSpinner className="animate-spin" /> : 'Add'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Roles: <span className="font-medium">Viewer</span> (view only) •{' '}
                            <span className="font-medium">Checker</span> (view + check-in) •{' '}
                            <span className="font-medium">Manager</span> (all + manage team)
                          </p>
                        </div>
                      )}

                      {/* Registrations section */}
                      {event.role !== 'viewer' && isRegsOpen && (
                        <div className="mt-4 border-t border-gray-200 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FaTicketAlt className="text-gray-400" /> Registrations
                            {loadingRegs && <FaSpinner className="animate-spin ml-2" />}
                          </h4>
                          {registrationsData?.registrations?.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Checked In</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {registrationsData.registrations.map((reg) => (
                                    <tr key={reg._id}>
                                      <td className="px-3 py-2">{reg.name}</td>
                                      <td className="px-3 py-2">{reg.email}</td>
                                      <td className="px-3 py-2 font-mono text-xs">{reg.ticketId}</td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            reg.status === 'confirmed'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}
                                        >
                                          {reg.status}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        {reg.ticketCheckedIn ? (
                                          <span className="text-green-600 flex items-center gap-1">
                                            <FaCheckCircle className="text-xs" /> Yes
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">No</span>
                                        )}
                                      </td>
                                      <td className="px-3 py-2">
                                        {reg.status === 'confirmed' && !reg.ticketCheckedIn && (
                                          <button
                                            onClick={() => handleCheckIn(event._id, reg.ticketId)}
                                            disabled={checkingIn === reg.ticketId}
                                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
                                          >
                                            {checkingIn === reg.ticketId ? (
                                              <FaSpinner className="animate-spin" />
                                            ) : (
                                              'Check In'
                                            )}
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No registrations found.</p>
                          )}
                          {registrationsData && (
                            <div className="mt-2 text-xs text-gray-400">
                              Total: {registrationsData.totalRegistrations} | Confirmed:{' '}
                              {registrationsData.confirmedCount}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <ScannerModal />
      </div>
    </EventDashboardSidebar>
  );
};

export default EventDashboardTeam;