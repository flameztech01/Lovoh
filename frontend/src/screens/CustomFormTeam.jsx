// screens/CustomFormTeam.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaPlus, FaTrashAlt, FaSpinner, FaSearch,
  FaUser, FaEnvelope, FaShieldAlt, FaUsers, FaCrown,
} from 'react-icons/fa';
import {
  useGetMyCustomFormsQuery,
  useAddCustomFormManagerMutation,
  useRemoveCustomFormManagerMutation,
} from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const CustomFormTeam = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedFormId, setSelectedFormId] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [removeUserId, setRemoveUserId] = useState(null);

  const { data: formsData, isLoading: formsLoading } = useGetMyCustomFormsQuery({ sort: '-updatedAt', limit: 50 });
  const forms = formsData?.forms || [];
  const selectedForm = forms.find(f => f._id === selectedFormId);

  const [addManager, { isLoading: addingManager }] = useAddCustomFormManagerMutation();
  const [removeManager, { isLoading: removingManager }] = useRemoveCustomFormManagerMutation();

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!managerEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    try {
      await addManager({ id: selectedFormId, email: managerEmail.trim() }).unwrap();
      toast.success('Manager added successfully!');
      setManagerEmail('');
      setShowAddModal(false);
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add manager');
    }
  };

  const handleRemoveManager = async (userId) => {
    try {
      await removeManager({ id: selectedFormId, userId }).unwrap();
      toast.success('Manager removed');
      setRemoveUserId(null);
    } catch { toast.error('Failed to remove manager'); }
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
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-500">Manage who can access your forms</p>
            </div>
          </div>
        </div>

        {/* Form Selector */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 w-full">
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">Select a form...</option>
                {forms.map((form) => (
                  <option key={form._id} value={form._id}>{form.title}</option>
                ))}
              </select>
            </div>
            {selectedFormId && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] flex-shrink-0"
              >
                <FaPlus className="text-xs" /> Add Manager
              </button>
            )}
          </div>
        </div>

        {!selectedFormId ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-16">
            <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Form</h3>
            <p className="text-gray-500">Choose a form above to manage its team</p>
          </div>
        ) : formsLoading ? (
          <div className="flex justify-center py-16"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {/* Owner Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Form Owner</h3>
              <div className="flex items-center gap-4 p-4 bg-[#1B3766]/5 rounded-xl">
                {selectedForm?.createdBy?.profile ? (
                  <img src={selectedForm.createdBy.profile} alt="" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold">
                    {(selectedForm?.createdBy?.name || userInfo?.name || 'O')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedForm?.createdBy?.name || userInfo?.name || 'You'}
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-medium">
                      <FaCrown className="text-[8px]" /> Owner
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{selectedForm?.createdBy?.email || userInfo?.email}</p>
                </div>
              </div>
            </div>

            {/* Managers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Managers ({selectedForm?.managers?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B3766] text-white rounded-lg text-xs font-medium hover:bg-[#142952]"
                >
                  <FaPlus className="text-[10px]" /> Add
                </button>
              </div>

              {!selectedForm?.managers || selectedForm.managers.length === 0 ? (
                <div className="text-center py-8">
                  <FaUser className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No managers yet</p>
                  <p className="text-xs text-gray-400 mt-1">Add people to help manage form submissions</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedForm.managers.map((manager) => (
                    <div key={manager._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      {manager.profile ? (
                        <img src={manager.profile} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                          {(manager.name || 'M')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{manager.name || 'Manager'}</p>
                        <p className="text-xs text-gray-500">{manager.email}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                        <FaShieldAlt className="text-[8px]" /> Manager
                      </span>
                      <button
                        onClick={() => setRemoveUserId(manager._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove manager"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Permissions Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">What managers can do:</h4>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• View and export form submissions</li>
                <li>• Edit form fields and settings</li>
                <li>• View analytics and reports</li>
                <li>• Cannot delete the form</li>
                <li>• Cannot add or remove other managers</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Add Manager Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Manager</h3>
            <p className="text-sm text-gray-500 mb-4">Enter the email of the person you want to add</p>
            
            <form onSubmit={handleAddManager}>
              <div className="relative mb-4">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  placeholder="manager@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingManager || !managerEmail.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] disabled:opacity-50"
                >
                  {addingManager ? <FaSpinner className="animate-spin mx-auto" /> : 'Add Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeUserId && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setRemoveUserId(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaTrashAlt className="text-xl text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Remove Manager</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to remove this manager?</p>
              <div className="flex gap-3">
                <button onClick={() => setRemoveUserId(null)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleRemoveManager(removeUserId)} disabled={removingManager}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                  {removingManager ? <FaSpinner className="animate-spin mx-auto" /> : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFormTeam;