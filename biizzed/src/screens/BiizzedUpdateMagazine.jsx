// screens/BiizzedUpdateMagazine.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaUpload, FaImage, FaTrashAlt,
  FaSpinner, FaTag, FaBookOpen, FaFilePdf, FaTimes,
  FaClock, FaInfoCircle,
} from 'react-icons/fa';
import { useGetMagazineByIdQuery, useUpdateMagazineMutation } from '../slices/magApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedUpdateMagazine = () => {
  const { id } = useParams(); // magazine ID from URL
  const navigate = useNavigate();

  // Fetch existing magazine data
  const { data: magazine, isLoading: isLoadingMag, error } = useGetMagazineByIdQuery(id);
  const [updateMagazine, { isLoading: isUpdating }] = useUpdateMagazineMutation();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    author: '',
    category: '',
    tags: '',
    comingSoon: false,
    status: 'draft',
  });
  
  // File states
  const [pdfFile, setPdfFile] = useState(null);      // new PDF (optional)
  const [coverImage, setCoverImage] = useState(null); // new cover image (optional)
  const [coverPreview, setCoverPreview] = useState(''); // preview of existing or new cover

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  // Populate form when magazine data is loaded
  useEffect(() => {
    if (magazine) {
      setFormData({
        title: magazine.title || '',
        summary: magazine.summary || '',
        author: magazine.author || '',
        category: magazine.category || '',
        tags: magazine.tags?.join(', ') || '',
        comingSoon: magazine.comingSoon || magazine.status === 'coming_soon',
        status: magazine.status || 'draft',
      });
      setCoverPreview(magazine.coverImage || '');
    }
  }, [magazine]);

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
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files allowed');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('PDF must be under 50MB');
      return;
    }
    setPdfFile(file);
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large');
      return;
    }
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setCoverPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePdf = () => setPdfFile(null);
  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.summary.trim()) {
      toast.error('Summary is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    // If not coming soon and no existing PDF and no new PDF uploaded → require PDF
    if (!formData.comingSoon && !magazine?.pdfUrl && !pdfFile) {
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
    
    // Only send new files if they were selected
    if (pdfFile) fd.append('pdf', pdfFile);
    if (coverImage) fd.append('coverImage', coverImage);

    try {
      await updateMagazine({ id, data: fd }).unwrap();
      toast.success(formData.comingSoon ? 'Magazine updated as "Coming Soon"!' : 'Magazine updated successfully!');
      navigate('/magazines');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update magazine');
    }
  };

  if (isLoadingMag) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Magazine not found</h1>
          <button onClick={() => navigate('/magazines')} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-lg">
            Back to Magazines
          </button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50"
          >
            {isUpdating ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Update Magazine</>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    ? "Only the cover image is required. You can upload the PDF later."
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
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Magazine title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
              required
            />
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Magazine summary / description..."
              rows={4}
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none"
              required
            />
          </div>

          {/* PDF Upload – shows current PDF and option to replace */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FaFilePdf className="text-red-500" /> PDF File
              {!formData.comingSoon && <span className="text-red-500 text-xs">*</span>}
              {formData.comingSoon && <span className="text-gray-400 text-xs">(Optional – upload later)</span>}
            </h3>

            {magazine?.pdfUrl && !pdfFile && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaFilePdf className="text-red-400" />
                  <span className="truncate">Current PDF: {magazine.pdfUrl.split('/').pop()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Replace
                </button>
              </div>
            )}

            {!pdfFile ? (
              <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#1B3766] transition-colors">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaFilePdf className="text-red-500 text-xl" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {magazine?.pdfUrl ? 'Replace PDF' : 'Upload PDF'}
                  </p>
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
                <button onClick={removePdf} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                  <FaTrashAlt className="text-sm" />
                </button>
              </div>
            )}
          </div>

          {/* Author, Category, Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                <FaTag className="inline mr-1" /> Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                required
              >
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <label className="block text-xs font-semibold text-gray-500 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="business, report, analysis..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>

          {/* Info note */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
            <FaInfoCircle className="text-[#1B3766] mt-0.5 flex-shrink-0" />
            <p>If you change the magazine from “Coming Soon” to published, a PDF is required. Subscribers will be notified of the new issue.</p>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden"
          >
            {isUpdating ? 'Updating...' : 'Update Magazine'}
          </button>
        </form>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedUpdateMagazine;