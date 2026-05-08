// screens/PublicFormView.jsx - Beautiful Public Form UI
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaSpinner, FaUpload, FaStar, FaCheckCircle, FaRegStar,
  FaEnvelope, FaUser, FaPhone, FaCalendarAlt, FaClock, FaLink,
  FaAlignLeft, FaFont, FaList, FaDotCircle, FaCheckSquare,
  FaHeading, FaMinus, FaHashtag, FaArrowRight, FaShieldAlt,
  FaLock, FaGlobe,
} from 'react-icons/fa';
import { useGetPublicCustomFormQuery, useSubmitCustomFormMutation } from '../slices/customFormApiSlice';
import { toast } from 'react-toastify';

const getFieldIcon = (type) => {
  const icons = {
    text: FaFont, textarea: FaAlignLeft, number: FaHashtag,
    email: FaEnvelope, phone: FaPhone, date: FaCalendarAlt,
    time: FaClock, url: FaLink, select: FaList,
    multiSelect: FaList, radio: FaDotCircle, checkbox: FaCheckSquare,
    file: FaUpload, rating: FaStar, heading: FaHeading,
    paragraph: FaAlignLeft, divider: FaMinus,
  };
  return icons[type] || FaFont;
};

const PublicFormView = () => {
  const { slug } = useParams();

  const { data: form, isLoading, error } = useGetPublicCustomFormQuery(slug);
  const [submitForm, { isLoading: isSubmitting }] = useSubmitCustomFormMutation();

  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [errors, setErrors] = useState({});
  const [startTime] = useState(Date.now());
  const [currentStep, setCurrentStep] = useState(0);
  const [isMultiStep, setIsMultiStep] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug, currentStep]);

  const handleInputChange = (fieldId, value) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => { const updated = { ...prev }; delete updated[fieldId]; return updated; });
    }
  };

  const handleCheckboxChange = (fieldId, value, checked) => {
    setResponses(prev => {
      const current = Array.isArray(prev[fieldId]) ? [...prev[fieldId]] : [];
      return { ...prev, [fieldId]: checked ? [...current, value] : current.filter(v => v !== value) };
    });
  };

  const handleRadioChange = (fieldId, value) => setResponses(prev => ({ ...prev, [fieldId]: value }));
  const handleRatingChange = (fieldId, value) => setResponses(prev => ({ ...prev, [fieldId]: value }));

  const validateFields = (fieldsToCheck) => {
    const newErrors = {};
    fieldsToCheck?.forEach(field => {
      if (field.required && !['heading', 'paragraph', 'divider'].includes(field.type)) {
        const value = responses[field.id];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required`;
        }
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateFields(form.fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fill in all required fields');
      return;
    }

    const formattedResponses = Object.entries(responses).map(([fieldId, value]) => ({ fieldId, value }));

    try {
      const result = await submitForm({
        slug, data: {
          responses: formattedResponses,
          timeTaken: Math.floor((Date.now() - startTime) / 1000),
          respondentEmail: responses.email || '',
          respondentName: responses.name || 'Anonymous',
        },
      }).unwrap();

      setSubmitted(true);
      setSubmissionResult(result);
      toast.success('Form submitted successfully!');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to submit form');
    }
  };

  const renderField = (field) => {
    const value = responses[field.id] || '';
    const hasError = errors[field.id];
    const FieldIcon = getFieldIcon(field.type);

    const inputClasses = `w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm transition-all duration-200 ${
      hasError 
        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-200 bg-gray-50 focus:ring-[#1B3766] focus:border-[#1B3766] hover:border-gray-300'
    } focus:outline-none focus:ring-2`;

    switch (field.type) {
      case 'heading':
        return (
          <div className="pt-4 pb-2">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaHeading className="text-[#1B3766] text-lg" />
              {field.label}
            </h3>
            {field.description && <p className="text-sm text-gray-500 mt-1">{field.description}</p>}
          </div>
        );

      case 'paragraph':
        return (
          <div className="py-2">
            <div className="flex items-start gap-2">
              <FaAlignLeft className="text-gray-400 mt-1 flex-shrink-0" />
              <p className="text-sm text-gray-600 leading-relaxed">{field.label}</p>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">● ● ●</span>
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FieldIcon className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <textarea value={value} onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} rows={4}
              className={inputClasses.replace('pl-10', 'pl-4')} />
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'select':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaList className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <div className="relative">
              <select value={value} onChange={(e) => handleInputChange(field.id, e.target.value)} className={inputClasses + ' appearance-none cursor-pointer'}>
                <option value="">{field.placeholder || 'Select an option...'}</option>
                {field.options?.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
              </select>
              <FaList className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'multiSelect':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaList className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <select multiple value={Array.isArray(value) ? value : []}
              onChange={(e) => { const selected = Array.from(e.target.selectedOptions, o => o.value); handleInputChange(field.id, selected); }}
              className={inputClasses + ' min-h-[120px]'} style={{ fontFamily: 'inherit' }}>
              {field.options?.map((opt, i) => <option key={i} value={opt.value}>{opt.label}</option>)}
            </select>
            <p className="text-xs text-gray-400">Hold Ctrl/Cmd to select multiple options</p>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaDotCircle className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <div className="space-y-2">
              {field.options?.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  value === opt.value ? 'border-[#1B3766] bg-[#1B3766]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    value === opt.value ? 'border-[#1B3766]' : 'border-gray-300'
                  }`}>
                    {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-[#1B3766]" />}
                  </div>
                  <input type="radio" name={field.id} value={opt.value} checked={value === opt.value}
                    onChange={(e) => handleRadioChange(field.id, e.target.value)} className="hidden" />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaCheckSquare className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <div className="space-y-2">
              {field.options?.map((opt, i) => (
                <label key={i} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  Array.isArray(value) && value.includes(opt.value) ? 'border-[#1B3766] bg-[#1B3766]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'
                }`}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                    Array.isArray(value) && value.includes(opt.value) ? 'border-[#1B3766] bg-[#1B3766]' : 'border-gray-300'
                  }`}>
                    {Array.isArray(value) && value.includes(opt.value) && <FaCheck className="text-white text-xs" />}
                  </div>
                  <input type="checkbox" value={opt.value} checked={Array.isArray(value) && value.includes(opt.value)}
                    onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)} className="hidden" />
                  <span className="text-sm font-medium text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'rating':
        const maxRating = field.max || 5;
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaStar className="text-yellow-500 text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <div className="flex gap-2">
              {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
                <button key={star} type="button" onClick={() => handleRatingChange(field.id, star)}
                  className="text-3xl transition-all hover:scale-125 transform focus:outline-none">
                  {star <= value ? <FaStar className="text-yellow-400 drop-shadow-sm" /> : <FaRegStar className="text-gray-300" />}
                </button>
              ))}
              {value > 0 && <span className="text-sm font-medium text-gray-500 ml-2 self-center">{value}/{maxRating}</span>}
            </div>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      case 'file':
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaUpload className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-[#1B3766] bg-gray-50 hover:bg-white'
            }`}>
              <div className="w-14 h-14 rounded-full bg-[#1B3766]/10 flex items-center justify-center">
                <FaUpload className="text-[#1B3766] text-xl" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Click to upload file</p>
                <p className="text-xs text-gray-400 mt-0.5">Max {field.maxFileSize || 10}MB</p>
              </div>
              <input type="file" className="hidden" onChange={(e) => { const file = e.target.files[0]; if (file) handleInputChange(field.id, file.name); }} />
            </label>
            {value && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <FaCheckCircle className="text-green-500 text-sm" />
                <p className="text-sm text-green-700 font-medium">{typeof value === 'string' ? value : value.name}</p>
              </div>
            )}
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FieldIcon className="text-[#1B3766] text-sm" />
              {field.label}
              {field.required && <span className="text-red-500 ml-auto text-xs bg-red-50 px-2 py-0.5 rounded-full">Required</span>}
            </label>
            {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
            <div className="relative">
              <FieldIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input type={field.type} value={value} onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`} className={inputClasses} />
            </div>
            {hasError && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {hasError}</p>}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#1B3766]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaSpinner className="w-8 h-8 text-[#1B3766] animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaAlignLeft className="text-red-400 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h1>
          <p className="text-gray-500">This form doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {form?.formSettings?.confirmationMessage || 'Thank You! 🎉'}
          </h1>
          <p className="text-gray-500 mb-8">Your response has been recorded successfully.</p>
          {submissionResult?.percentage !== undefined && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
              <p className="text-sm text-gray-500 mb-2">Your Score</p>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke={submissionResult.passed ? '#22C55E' : '#EF4444'} strokeWidth="3"
                    strokeDasharray={`${submissionResult.percentage}, 100`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${submissionResult.passed ? 'text-green-600' : 'text-red-500'}`}>
                    {submissionResult.percentage}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {submissionResult.score} / {submissionResult.totalPoints} • {submissionResult.passed ? 'Passed ✅' : 'Failed ❌'}
              </p>
            </div>
          )}
          <button onClick={() => { setSubmitted(false); setResponses({}); setSubmissionResult(null); }}
            className="px-8 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] shadow-lg transition-all">
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Top Brand Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1B3766] rounded-lg flex items-center justify-center">
              <FaCheckSquare className="text-white text-sm" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">FormFlow</p>
              {form.formSettings?.requireLogin && (
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <FaLock className="text-[8px]" /> Private form
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FaShieldAlt className="text-[10px]" />
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-br from-[#1B3766] to-[#142952] p-6 md:p-8 text-white">
            {form.theme?.logo && (
              <img src={form.theme.logo} alt="" className="h-10 mb-4" />
            )}
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{form.title}</h1>
            {form.description && (
              <p className="text-white/70 text-sm md:text-base leading-relaxed">{form.description}</p>
            )}
            {form.fields?.length > 0 && (
              <div className="flex items-center gap-3 mt-4 text-white/60 text-xs">
                <div className="flex items-center gap-1">
                  <FaAlignLeft className="text-[10px]" />
                  <span>{form.fields.length} question{form.fields.length !== 1 ? 's' : ''}</span>
                </div>
                {form.type === 'quiz' && (
                  <div className="flex items-center gap-1">
                    <FaStar className="text-[10px] text-yellow-400" />
                    <span>Quiz</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fields Section */}
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields?.map((field) => (
                <div key={field.id} className={field.width === 'half' ? 'md:w-1/2' : 'w-full'}>
                  {renderField(field)}
                </div>
              ))}

              {form.fields?.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaAlignLeft className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-gray-500">This form has no questions yet.</p>
                </div>
              )}

              {form.fields?.length > 0 && (
                <div className="pt-6 border-t border-gray-100">
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-2xl font-semibold text-base hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {isSubmitting ? (
                      <><FaSpinner className="animate-spin" /> Submitting...</>
                    ) : (
                      <>Submit Form <FaArrowRight className="text-sm" /></>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    Your response is secure and encrypted
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <div className="w-5 h-5 bg-[#1B3766] rounded flex items-center justify-center">
              <FaCheckSquare className="text-white text-[8px]" />
            </div>
            <span className="text-xs text-gray-500">Powered by <span className="font-semibold text-[#1B3766]">FormFlow</span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicFormView;