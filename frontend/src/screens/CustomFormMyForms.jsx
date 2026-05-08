// screens/CustomFormMyForms.jsx - Updated with renamed imports
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaPlusCircle, FaEdit, FaTrashAlt, FaCopy, FaEye,
  FaSpinner, FaSearch, FaTimes, FaClipboardList,
  FaStar, FaChartBar, FaUsers, FaPlay, FaPause, FaFolderOpen,
} from 'react-icons/fa';
import { 
  useGetMyCustomFormsQuery, 
  useDeleteCustomFormMutation, 
  useDuplicateCustomFormMutation,
  useUpdateCustomFormMutation,
} from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const CustomFormMyForms = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const { data: formsData, isLoading, refetch } = useGetMyCustomFormsQuery({
    search: searchTerm || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    page: currentPage,
    limit: 20,
    sort: '-updatedAt',
  });

  const [deleteForm] = useDeleteCustomFormMutation();
  const [duplicateForm] = useDuplicateCustomFormMutation();
  const [updateForm] = useUpdateCustomFormMutation();

  const forms = formsData?.forms || [];
  const totalPages = formsData?.pages || 1;
  const total = formsData?.total || 0;

  const handleDelete = async (id) => {
    try {
      await deleteForm(id).unwrap();
      toast.success('Form deleted');
      setShowDeleteModal(null);
      refetch();
    } catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateForm(id).unwrap();
      toast.success('Form duplicated');
      refetch();
    } catch { toast.error('Failed to duplicate'); }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'closed' : 'published';
    try {
      await updateForm({ id, data: { status: newStatus } }).unwrap();
      toast.success(`Form ${newStatus === 'published' ? 'published' : 'closed'}`);
      refetch();
    } catch { toast.error('Failed to update status'); }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || typeFilter || statusFilter;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const statuses = {
      published: { label: 'Published', color: 'bg-green-100 text-green-700' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-600' },
      closed: { label: 'Closed', color: 'bg-red-100 text-red-600' },
      archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700' },
    };
    return statuses[status] || statuses.draft;
  };

  const getTypeIcon = (type) => {
    const types = {
      form: FaClipboardList,
      quiz: FaStar,
      survey: FaChartBar,
      registration: FaUsers,
    };
    return types[type] || FaClipboardList;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomFormSidebar />
        <div className="lg:ml-[280px] flex justify-center items-center h-96">
          <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />
      <div className="lg:ml-[280px] p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
            <p className="text-gray-500 text-sm mt-1">
              {total > 0 ? `${total} form${total !== 1 ? 's' : ''} total` : 'Create your first form'}
            </p>
          </div>
          <Link to="/custom-form/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] transition-colors">
            <FaPlusCircle /> Create New Form
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search forms..." className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FaTimes /></button>
              )}
            </div>
            <div className="flex gap-2">
              <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">All Types</option>
                <option value="form">Form</option>
                <option value="quiz">Quiz</option>
                <option value="survey">Survey</option>
                <option value="registration">Registration</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">Clear</button>
              )}
            </div>
          </div>
        </div>

        {forms.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFolderOpen className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{hasActiveFilters ? 'No forms match' : 'No forms yet'}</h3>
            <p className="text-gray-500 mb-4">{hasActiveFilters ? 'Try adjusting filters' : 'Create your first form'}</p>
            {!hasActiveFilters && (
              <Link to="/custom-form/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium"><FaPlusCircle /> Create Form</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {forms.map((form) => {
              const statusBadge = getStatusBadge(form.status);
              const TypeIcon = getTypeIcon(form.type);
              return (
                <div key={form._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
                  <Link to={`/custom-form/${form._id}`} className="block p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-[#1B3766]/10 rounded-lg flex items-center justify-center flex-shrink-0"><TypeIcon className="text-[#1B3766] text-sm" /></div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#1B3766]">{form.title}</h3>
                          <p className="text-xs text-gray-400 capitalize">{form.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${statusBadge.color}`}>{statusBadge.label}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><FaClipboardList className="text-gray-400" />{form.submissions || 0}</span>
                      <span className="flex items-center gap-1"><FaEye className="text-gray-400" />{form.views || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{form.fields?.length || 0} fields</span>
                      <span>{formatDate(form.updatedAt)}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-0.5 px-3 py-2 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <Link to={`/custom-form/${form._id}`} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><FaEye className="text-xs" /></Link>
                    <Link to={`/custom-form/${form._id}/edit`} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg" title="Edit"><FaEdit className="text-xs" /></Link>
                    <Link to={`/custom-form/${form._id}/submissions`} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg" title="Submissions"><FaClipboardList className="text-xs" /></Link>
                    <button onClick={(e) => { e.preventDefault(); handleDuplicate(form._id); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Duplicate"><FaCopy className="text-xs" /></button>
                    <button onClick={(e) => { e.preventDefault(); handleStatusToggle(form._id, form.status); }}
                      className={`p-1.5 rounded-lg ${form.status === 'published' ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'}`}
                      title={form.status === 'published' ? 'Close' : 'Publish'}>
                      {form.status === 'published' ? <FaPause className="text-xs" /> : <FaPlay className="text-xs" />}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setShowDeleteModal(form._id); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto" title="Delete"><FaTrashAlt className="text-xs" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#1B3766] disabled:opacity-50">Previous</button>
            <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#1B3766] disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowDeleteModal(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center"><FaTrashAlt className="text-xl text-red-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Form</h3>
              <p className="text-sm text-gray-500 mb-6">This will permanently delete this form and all its submissions.</p>
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

export default CustomFormMyForms;