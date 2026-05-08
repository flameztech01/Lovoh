// screens/CustomFormSubmissions.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSearch, FaTimes, FaSpinner,
  FaClipboardList, FaEye, FaTrashAlt, FaDownload,
  FaFilter, FaCheckCircle, FaTimesCircle, FaClock,
} from 'react-icons/fa';
import { useGetMyCustomFormsQuery, useGetCustomFormSubmissionsQuery, useDeleteCustomSubmissionMutation, useExportCustomSubmissionsQuery } from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const CustomFormSubmissions = () => {
  const navigate = useNavigate();
  const [selectedFormId, setSelectedFormId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const { data: formsData } = useGetMyCustomFormsQuery({ sort: '-updatedAt', limit: 50 });
  const forms = formsData?.forms || [];

  const { data: submissionsData, isLoading, refetch } = useGetCustomFormSubmissionsQuery(
    { id: selectedFormId, params: { page: currentPage, limit: 30, status: statusFilter || undefined, search: searchTerm || undefined } },
    { skip: !selectedFormId }
  );

  const [deleteSubmission] = useDeleteCustomSubmissionMutation();
  const { data: csvData, refetch: exportCsv } = useExportCustomSubmissionsQuery(selectedFormId, { skip: !selectedFormId });

  const submissions = submissionsData?.submissions || [];
  const formTitle = submissionsData?.form?.title || '';
  const totalPages = submissionsData?.pages || 1;
  const total = submissionsData?.total || 0;

  const handleDelete = async (submissionId) => {
    try {
      await deleteSubmission({ id: selectedFormId, submissionId }).unwrap();
      toast.success('Submission deleted');
      setShowDeleteModal(null);
      refetch();
    } catch { toast.error('Failed to delete'); }
  };

  const handleExport = () => {
    if (!selectedFormId) return;
    const url = `${import.meta.env.VITE_API_URL || ''}/api/custom-forms/${selectedFormId}/submissions/export`;
    window.open(url, '_blank');
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    const s = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: FaCheckCircle },
      started: { label: 'Started', color: 'bg-yellow-100 text-yellow-700', icon: FaClock },
      abandoned: { label: 'Abandoned', color: 'bg-red-100 text-red-600', icon: FaTimesCircle },
    };
    return s[status] || s.completed;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />
      <div className="lg:ml-[280px] p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
              <p className="text-sm text-gray-500">{formTitle || 'Select a form to view submissions'}</p>
            </div>
          </div>
          {selectedFormId && submissions.length > 0 && (
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952]">
              <FaDownload className="text-xs" /> Export CSV
            </button>
          )}
        </div>

        {/* Form Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedFormId}
              onChange={(e) => { setSelectedFormId(e.target.value); setCurrentPage(1); }}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
            >
              <option value="">Select a form...</option>
              {forms.map((form) => (
                <option key={form._id} value={form._id}>{form.title} ({form.submissions || 0} submissions)</option>
              ))}
            </select>
            {selectedFormId && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Search by name or email..." className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm" />
                  {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FaTimes /></button>}
                </div>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm">
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="started">Started</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Submissions */}
        {!selectedFormId ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Form</h3>
            <p className="text-gray-500">Choose a form above to view its submissions</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-16"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div>
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions</h3>
            <p className="text-gray-500">{searchTerm || statusFilter ? 'Try adjusting your filters' : 'This form has no submissions yet'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Respondent</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Date</th>
                    {submissionsData?.form?.type === 'quiz' && (
                      <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Score</th>
                    )}
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub) => {
                    const sb = getStatusBadge(sub.status);
                    const SbIcon = sb.icon;
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#1B3766]/10 flex items-center justify-center text-xs font-bold text-[#1B3766]">
                              {(sub.respondentName || 'A')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{sub.respondentName || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm text-gray-600">{sub.respondentEmail || 'N/A'}</span></td>
                        <td className="px-5 py-4 text-center"><span className="text-xs text-gray-500">{formatDate(sub.createdAt)}</span></td>
                        {submissionsData?.form?.type === 'quiz' && (
                          <td className="px-5 py-4 text-center">
                            <span className={`text-sm font-bold ${sub.passed ? 'text-green-600' : 'text-red-500'}`}>
                              {sub.percentage}% ({sub.score}/{sub.totalPoints})
                            </span>
                          </td>
                        )}
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${sb.color}`}>
                            <SbIcon className="text-[10px]" />{sb.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/custom-form/${selectedFormId}/submissions/${sub._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><FaEye className="text-sm" /></Link>
                            <button onClick={() => setShowDeleteModal(sub._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><FaTrashAlt className="text-sm" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#1B3766] disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#1B3766] disabled:opacity-50">Next</button>
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">{total} total submissions</p>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><FaTrashAlt className="text-xl text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Submission</h3>
              <p className="text-sm text-gray-500 mb-6">This will permanently delete this submission.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFormSubmissions;