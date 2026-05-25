// screens/BiizzedContributorApply.jsx – With status cards & correct data access
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaFileUpload,
  FaLink,
  FaSpinner,
  FaCheckCircle,
  FaArrowLeft,
  FaCloudUploadAlt,
  FaTimes,
  FaPlus,
  FaClock,
  FaExclamationCircle,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useApplyContributorMutation, useGetContributorStatusQuery } from '../slices/contributorApiSlice';

const BiizzedContributorApply = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [applyContributor, { isLoading }] = useApplyContributorMutation();
  
  // Check existing status
  const { data: contribData, isLoading: statusLoading, refetch: refetchStatus } = useGetContributorStatusQuery(undefined, {
    skip: !userInfo?._id,
  });

  // Form state
  const [queryLetterFile, setQueryLetterFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [briefBio, setBriefBio] = useState('');
  const [publishedWorks, setPublishedWorks] = useState(['']);
  const [errors, setErrors] = useState({});

  // Redirect if not logged in
  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/contributor/apply');
    }
  }, [userInfo, navigate]);

  if (!userInfo) return null;

  // File change handlers
  const handleQueryLetterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = null;
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed.');
        e.target.value = null;
        return;
      }
      setQueryLetterFile(file);
      setErrors(prev => ({ ...prev, queryLetter: null }));
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = null;
        return;
      }
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG allowed.');
        e.target.value = null;
        return;
      }
      setResumeFile(file);
      setErrors(prev => ({ ...prev, resume: null }));
    }
  };

  // Update published works array
  const updatePublishedWork = (index, value) => {
    const updated = [...publishedWorks];
    updated[index] = value;
    setPublishedWorks(updated);
  };

  const removePublishedWork = (index) => {
    const updated = publishedWorks.filter((_, i) => i !== index);
    setPublishedWorks(updated.length ? updated : ['']);
  };

  const addPublishedWorkSlot = () => {
    if (publishedWorks.length < 3) {
      setPublishedWorks([...publishedWorks, '']);
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};
    if (!queryLetterFile) newErrors.queryLetter = 'Query letter is required';
    if (!resumeFile) newErrors.resume = 'Resume is required';
    if (!briefBio.trim()) newErrors.briefBio = 'Brief bio is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('queryLetterFile', queryLetterFile);
    formData.append('resumeFile', resumeFile);
    formData.append('briefBio', briefBio.trim());

    // Filter out empty published works
    const validWorks = publishedWorks.filter(url => url.trim() !== '');
    if (validWorks.length > 0) {
      formData.append('publishedWorks', JSON.stringify(validWorks));
    }

    try {
      await applyContributor(formData).unwrap();
      toast.success('Application submitted successfully!');
      refetchStatus(); // Refetch to update the status card
    } catch (error) {
      console.error('Application error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to submit application';
      toast.error(errorMessage);
    }
  };

  // Helper to format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // CORRECT DATA ACCESS - response is nested inside data
  const applicationData = contribData?.data?.contributor_application;
  const isBiizzedContributor = contribData?.data?.biizzed_contributor || contribData?.biizzed_contributor;
  const appStatus = applicationData?.status;
  const isApproved = isBiizzedContributor || appStatus === 'approved';
  const isPending = appStatus === 'pending';
  const isRejected = appStatus === 'rejected';
  const hasApplied = isApproved || isPending || isRejected;

  // If loading status
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button & header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-4"
          >
            <FaArrowLeft className="text-sm" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Become a Biizzed Contributor</h1>
          <p className="text-sm text-gray-500 mt-1">
            Share your insights and stories with the community.
          </p>
        </div>

        {/* PENDING APPLICATION CARD */}
        {isPending && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-yellow-800">Application Pending</h2>
                <p className="text-sm text-yellow-700 mt-1">
                  Your application is currently under review. Our team will evaluate your submission and get back to you soon.
                </p>
                {applicationData?.submittedAt && (
                  <p className="text-xs text-yellow-600 mt-2">
                    Submitted on {formatDate(applicationData.submittedAt)}
                  </p>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-white border border-yellow-300 rounded-xl text-sm font-medium text-yellow-700 hover:bg-yellow-50 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPROVED CARD */}
        {isApproved && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-green-800">Application Approved! 🎉</h2>
                <p className="text-sm text-green-700 mt-1">
                  Congratulations! You are now an approved Biizzed contributor. You can start creating articles, magazines, and videos.
                </p>
                {applicationData?.reviewedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    Approved on {formatDate(applicationData.reviewedAt)}
                  </p>
                )}
                {applicationData?.adminNotes && (
                  <div className="mt-3 p-3 bg-green-100 rounded-xl">
                    <p className="text-xs font-medium text-green-800">Admin Note:</p>
                    <p className="text-xs text-green-700">{applicationData.adminNotes}</p>
                  </div>
                )}
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigate('/create-article')}
                    className="px-4 py-2 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors"
                  >
                    Create Article
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-white border border-green-300 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED CARD */}
        {isRejected && (
          <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FaExclamationCircle className="text-red-600 text-xl" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-red-800">Application Not Accepted</h2>
                <p className="text-sm text-red-700 mt-1">
                  Unfortunately, your application was not accepted at this time. You can review the admin notes below and apply again.
                </p>
                {applicationData?.reviewedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    Reviewed on {formatDate(applicationData.reviewedAt)}
                  </p>
                )}
                {applicationData?.adminNotes && (
                  <div className="mt-3 p-3 bg-red-100 rounded-xl">
                    <p className="text-xs font-medium text-red-800">Feedback:</p>
                    <p className="text-xs text-red-700">{applicationData.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION FORM - Show if not applied or if rejected */}
        {(!hasApplied || isRejected) && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {isRejected && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-2">
                <p className="text-sm text-blue-800">
                  You can submit a new application below. Make sure to address the feedback provided above.
                </p>
              </div>
            )}

            {/* Query Letter File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Query Letter <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  queryLetterFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#1B3766] hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('queryLetterInput').click()}
              >
                {queryLetterFile ? (
                  <div className="flex flex-col items-center">
                    <FaCheckCircle className="text-green-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-green-700">{queryLetterFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(queryLetterFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQueryLetterFile(null);
                        document.getElementById('queryLetterInput').value = null;
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FaCloudUploadAlt className="text-gray-400 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-600">Click to upload Query Letter</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 5MB)</span>
                  </div>
                )}
                <input
                  id="queryLetterInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleQueryLetterChange}
                  className="hidden"
                />
              </div>
              {errors.queryLetter && <p className="text-xs text-red-500 mt-1">{errors.queryLetter}</p>}
            </div>

            {/* Resume File */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume / CV <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  resumeFile ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-[#1B3766] hover:bg-gray-50'
                }`}
                onClick={() => document.getElementById('resumeInput').click()}
              >
                {resumeFile ? (
                  <div className="flex flex-col items-center">
                    <FaCheckCircle className="text-green-500 text-2xl mb-2" />
                    <span className="text-sm font-medium text-green-700">{resumeFile.name}</span>
                    <span className="text-xs text-gray-500">
                      {(resumeFile.size / 1024).toFixed(1)} KB
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setResumeFile(null);
                        document.getElementById('resumeInput').value = null;
                      }}
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <FaCloudUploadAlt className="text-gray-400 text-3xl mb-2" />
                    <span className="text-sm font-medium text-gray-600">Click to upload Resume</span>
                    <span className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 5MB)</span>
                  </div>
                )}
                <input
                  id="resumeInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleResumeChange}
                  className="hidden"
                />
              </div>
              {errors.resume && <p className="text-xs text-red-500 mt-1">{errors.resume}</p>}
            </div>

            {/* Brief Bio */}
            <div>
              <label htmlFor="briefBio" className="block text-sm font-medium text-gray-700 mb-2">
                Brief Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="briefBio"
                rows={4}
                value={briefBio}
                onChange={(e) => {
                  setBriefBio(e.target.value);
                  setErrors(prev => ({ ...prev, briefBio: null }));
                }}
                placeholder="Tell us a bit about yourself and your writing experience..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#1B3766] focus:ring-2 focus:ring-[#1B3766]/20 text-sm placeholder-gray-400 resize-vertical transition-colors"
              />
              {errors.briefBio && <p className="text-xs text-red-500 mt-1">{errors.briefBio}</p>}
            </div>

            {/* Published Works */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Published Works <span className="text-gray-400 font-normal">(optional, up to 3 links)</span>
              </label>
              <div className="space-y-3">
                {publishedWorks.map((url, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updatePublishedWork(index, e.target.value)}
                        placeholder={`Link to published work #${index + 1}`}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#1B3766] focus:ring-2 focus:ring-[#1B3766]/20 text-sm placeholder-gray-400 transition-colors"
                      />
                    </div>
                    {publishedWorks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePublishedWork(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
                {publishedWorks.length < 3 && (
                  <button
                    type="button"
                    onClick={addPublishedWorkSlot}
                    className="flex items-center gap-1 text-xs text-[#1B3766] hover:text-[#142952] font-medium mt-1"
                  >
                    <FaPlus className="text-[10px]" /> Add another link
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FaFileUpload />
                    {isRejected ? 'Submit New Application' : 'Submit Application'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Info note - only show if hasn't applied or rejected */}
        {(!hasApplied || isRejected) && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
            <p><strong>What happens next?</strong> Our team will review your application. You'll receive a notification on your profile and via email once a decision is made.</p>
          </div>
        )}
      </div>

      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedContributorApply;