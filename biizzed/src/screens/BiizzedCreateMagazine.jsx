// screens/BiizzedCreateMagazine.jsx – Contributor-gated + Coming Soon support
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft, FaSave, FaUpload, FaImage, FaTrashAlt,
  FaSpinner, FaTag, FaBookOpen, FaFilePdf, FaTimes,
  FaClock, FaInfoCircle, FaUserEdit, FaArrowRight, FaLock,
} from 'react-icons/fa';
import { useCreateMagazineMutation } from '../slices/magApiSlice';
import { useGetContributorStatusQuery } from '../slices/contributorApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedCreateMagazine = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [createMagazine, { isLoading }] = useCreateMagazineMutation();

  // Contributor gating
  const { data: contribData, isLoading: contribLoading } = useGetContributorStatusQuery(undefined, {
    skip: !userInfo?._id,
  });
  const isContributor = contribData?.biizzed_contributor === true;

  const [formData, setFormData] = useState({
    title: '', summary: '', author: '', category: '', tags: '',
    comingSoon: false,
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files allowed'); return; }
    if (file.size > 50 * 1024 * 1024) { toast.error('PDF must be under 50MB'); return; }
    setPdfFile(file);
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Invalid image'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image too large'); return; }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePdf = () => setPdfFile(null);
  const removeCover = () => { setCoverImage(null); setCoverPreview(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!formData.summary.trim()) { toast.error('Summary is required'); return; }
    if (!formData.category) { toast.error('Category is required'); return; }
    if (!coverImage) { toast.error('Cover image is required'); return; }

    // PDF required only if NOT coming soon
    if (!formData.comingSoon && !pdfFile) {
      toast.error('PDF file is required for published magazines. For coming soon, check the "Coming Soon" box.');
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('summary', formData.summary.trim());
    fd.append('author', formData.author || 'Biizzed Editorial');
    fd.append('category', formData.category);
    fd.append('tags', formData.tags);
    fd.append('comingSoon', formData.comingSoon);
    fd.append('status', formData.comingSoon ? 'coming_soon' : 'published');
    fd.append('coverImage', coverImage);
    if (pdfFile) fd.append('pdf', pdfFile);

    try {
      await createMagazine(fd).unwrap();
      if (formData.comingSoon) {
        toast.success('Magazine saved as "Coming Soon"! You can add the PDF later.');
      } else {
        toast.success('Magazine published successfully!');
      }
      navigate('/magazines');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to save magazine');
    }
  };

  // -- Not logged in --
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <BiizzedArticlesNavbar />
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <FaLock className="text-4xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-sm text-gray-500 mb-6">You need to log in to create magazines.</p>
          <button
            onClick={() => navigate('/login?redirect=/create-magazine')}
            className="px-6 py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors"
          >
            Login to Continue
          </button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // -- Loading contributor status --
  if (contribLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <BiizzedArticlesNavbar />
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-[#1B3766] mx-auto" />
          <p className="mt-4 text-gray-500">Checking contributor status...</p>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // -- Not a contributor --
  if (!isContributor) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserEdit className="text-[#1B3766] text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Only Contributors Can Publish</h2>
            <p className="text-sm text-gray-500 mb-6">
              You need to be an approved Biizzed contributor to create magazines. Apply now to share your publications with the community.
            </p>
            <button
              onClick={() => navigate('/contributor/apply')}
              className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
            >
              Apply to Become a Contributor
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // -- Contributor: show magazine creation form --
  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50">
            {isLoading ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {formData.comingSoon ? 'Save as Coming Soon' : 'Publish Magazine'}</>}
          </button>
        </div>

        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          {/* Coming Soon Toggle */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="comingSoon"
                checked={formData.comingSoon}
                onChange={handleChange}
                className="w-4 h-4 text-[#1B3766] rounded focus:ring-[#1B3766]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FaClock className="text-[#1B3766] text-sm" />
                  <span className="font-semibold text-gray-800 text-sm">Coming Soon Mode</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formData.comingSoon
                    ? "Only the cover image is required. You can upload the PDF later from the edit page."
                    : "Requires a PDF file. Magazine will be published immediately."}
                </p>
              </div>
            </label>
          </div>

          {/* Cover Image Upload */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> Magazine Cover <span className="text-red-500">*</span>
            </h3>
            {!coverPreview ? (
              <label className="block cursor-pointer">
                <div className="aspect-[3/4] max-w-[250px] mx-auto border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-[#1B3766] transition-colors p-6">
                  <FaUpload className="text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Upload Cover Image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 10MB)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              </label>
            ) : (
              <div className="relative max-w-[250px] mx-auto">
                <img src={coverPreview} alt="Cover" className="w-full rounded-xl shadow-md" />
                <button onClick={removeCover} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                  <FaTimes className="text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Magazine title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
              required
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="summary" value={formData.summary} onChange={handleChange}
              placeholder="Magazine summary / description..."
              rows={4}
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none"
              required
            />
          </div>

          {/* PDF Upload – conditionally required */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FaFilePdf className="text-red-500" /> PDF File
              {!formData.comingSoon && <span className="text-red-500 text-xs">*</span>}
              {formData.comingSoon && <span className="text-gray-400 text-xs">(Optional – upload later)</span>}
            </h3>
            {!pdfFile ? (
              <label className={`flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 transition-colors ${!formData.comingSoon ? 'hover:border-red-500' : 'hover:border-[#1B3766]'}`}>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaFilePdf className="text-red-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Upload PDF</p>
                  <p className="text-xs text-gray-400">Max 50MB</p>
                </div>
                <input type="file" accept="application/pdf" onChange={handlePdfSelect} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FaFilePdf className="text-red-500 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{pdfFile.name}</p>
                    <p className="text-xs text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
                <button onClick={removePdf} className="p-2 text-red-500 hover:bg-red-50 rounded-full"><FaTrashAlt className="text-sm" /></button>
              </div>
            )}
          </div>

          {/* Author, Category, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Author</label>
              <input type="text" name="author" value={formData.author} onChange={handleChange} placeholder="Author name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category <span className="text-red-500">*</span></label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="business, report, analysis..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>

          {/* Info note */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
            <FaInfoCircle className="text-[#1B3766] mt-0.5 flex-shrink-0" />
            <p>Magazines saved as "Coming Soon" will be visible to visitors with a "Coming Soon" badge. You can upload the PDF later by editing the magazine.</p>
          </div>

          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden">
            {isLoading ? 'Saving...' : (formData.comingSoon ? 'Save as Coming Soon' : 'Publish Magazine')}
          </button>
        </form>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedCreateMagazine;