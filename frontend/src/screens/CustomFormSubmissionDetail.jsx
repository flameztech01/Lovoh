// screens/CustomFormSubmissionDetail.jsx - Fixed with field labels
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSpinner, FaUser, FaEnvelope, FaClock,
  FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaTrashAlt,
  FaDownload,
} from 'react-icons/fa';
import { useGetCustomSubmissionByIdQuery, useDeleteCustomSubmissionMutation } from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const CustomFormSubmissionDetail = () => {
  const { id, submissionId } = useParams();
  const navigate = useNavigate();

  const { data: submission, isLoading, error } = useGetCustomSubmissionByIdQuery({ id, submissionId });
  const [deleteSubmission] = useDeleteCustomSubmissionMutation();

  const handleDelete = async () => {
    if (!confirm('Delete this submission?')) return;
    try {
      await deleteSubmission({ id, submissionId }).unwrap();
      toast.success('Submission deleted');
      navigate(`/custom-form/${id}/submissions`);
    } catch { toast.error('Failed to delete'); }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatTime = (seconds) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getResponseValue = (response) => {
    if (response.value === null || response.value === undefined || response.value === '') {
      return <span className="text-gray-400 italic">No response</span>;
    }
    if (Array.isArray(response.value)) {
      return response.value.join(', ');
    }
    return String(response.value);
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

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CustomFormSidebar />
        <div className="lg:ml-[280px] flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <button onClick={() => navigate(-1)} className="text-[#1B3766] hover:underline">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />

      <div className="lg:ml-[280px] p-4 md:p-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/custom-form/${id}/submissions`)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Submission Details</h1>
              <p className="text-sm text-gray-500">
                {submission.formTitle || 'Form'} • {submission.respondentName || 'Anonymous'}
              </p>
            </div>
          </div>
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
            <FaTrashAlt className="text-xs" /> Delete
          </button>
        </div>

        {/* Respondent Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Respondent Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem icon={FaUser} label="Name" value={submission.respondentName || 'Anonymous'} />
            <InfoItem icon={FaEnvelope} label="Email" value={submission.respondentEmail || 'N/A'} />
            <InfoItem icon={FaCalendarAlt} label="Submitted" value={formatDate(submission.createdAt)} />
            <InfoItem icon={FaClock} label="Time Taken" value={formatTime(submission.timeTaken)} />
            <InfoItem 
              icon={submission.status === 'completed' ? FaCheckCircle : FaTimesCircle} 
              label="Status" 
              value={submission.status}
              valueClass={submission.status === 'completed' ? 'text-green-600 capitalize' : 'text-red-500 capitalize'}
            />
            {submission.totalPoints > 0 && (
              <InfoItem 
                icon={FaCheckCircle} 
                label="Score" 
                value={`${submission.percentage}% (${submission.score}/${submission.totalPoints}) ${submission.passed ? '✅ Passed' : '❌ Failed'}`}
                valueClass={submission.passed ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}
              />
            )}
          </div>
        </div>

        {/* Responses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Responses ({submission.responses?.length || 0})
          </h3>
          <div className="space-y-3">
            {submission.responses?.map((response, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {response.fieldLabel || response.fieldId}
                </p>
                <p className="text-sm text-gray-900 break-words">
                  {getResponseValue(response)}
                </p>
                {response.fileUrl && (
                  <a 
                    href={response.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1 mt-2 text-xs text-[#1B3766] hover:underline"
                  >
                    <FaDownload className="text-[10px]" /> {response.fileName || 'Download File'}
                  </a>
                )}
              </div>
            ))}
          </div>

          {(!submission.responses || submission.responses.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-8">No responses recorded</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem = ({ icon: Icon, label, value, valueClass }) => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-[#1B3766]/10 flex items-center justify-center flex-shrink-0">
      <Icon className="text-[#1B3766] text-sm" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-medium break-words ${valueClass || 'text-gray-900'}`}>{value || 'N/A'}</p>
    </div>
  </div>
);

export default CustomFormSubmissionDetail;