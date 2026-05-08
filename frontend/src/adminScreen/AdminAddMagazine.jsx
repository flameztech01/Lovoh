// adminScreen/AdminAddMagazine.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaFilePdf,
  FaImage,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaInfoCircle,
  FaUser,
  FaTrashAlt
} from 'react-icons/fa';
import { useCreateMagazineMutation } from '../slices/magApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminAddMagazine = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  const [createMagazine, { isLoading }] = useCreateMagazineMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    author: '',
    category: '',
    tags: '',
    status: 'draft',
    isFeatured: false,
  });
  
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  // Set author from admin info
  React.useEffect(() => {
    if (adminInfo) {
      setFormData(prev => ({ ...prev, author: adminInfo.name || adminInfo.username || 'Admin' }));
    }
  }, [adminInfo]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePdfSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) {
      toast.error('PDF size must be less than 50MB');
      return;
    }
    
    setPdfFile(file);
    setPdfName(file.name);
    toast.success(`PDF selected: ${file.name}`);
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file for cover');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image size must be less than 5MB');
      return;
    }
    
    setCoverImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
    toast.success('Cover image selected');
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfName('');
  };

  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Magazine title is required');
      return;
    }
    
    if (!formData.summary.trim()) {
      toast.error('Magazine summary is required');
      return;
    }
    
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    
    if (!formData.author.trim()) {
      toast.error('Author name is required');
      return;
    }
    
    if (!pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (!coverImage) {
      toast.error('Please upload a cover image');
      return;
    }
    
    // Prepare FormData for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('summary', formData.summary);
    submitData.append('category', formData.category);
    submitData.append('author', formData.author);
    submitData.append('status', formData.status);
    submitData.append('isFeatured', formData.isFeatured);
    
    if (formData.tags) {
      submitData.append('tags', formData.tags);
    }
    
    // Append files
    submitData.append('pdf', pdfFile);
    submitData.append('coverImage', coverImage);
    
    try {
      setUploading(true);
      await createMagazine(submitData).unwrap();
      toast.success('Magazine created successfully!');
      navigate('/admin/magazines');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create magazine');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminSidebar>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <button
              onClick={() => navigate('/admin/magazines')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-2 transition-colors"
            >
              <FaArrowLeft />
              Back to Magazines
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Upload New Magazine</h1>
            <p className="text-gray-500 mt-1">Upload a PDF magazine edition with cover image</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-all duration-300 disabled:opacity-50"
          >
            <FaSave />
            {uploading ? 'Uploading...' : 'Publish Magazine'}
          </button>
        </div>

        {/* Form */}
        <form className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Magazine Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., The Future of Business - Summer Edition"
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
              />
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary / Description *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="6"
                placeholder="Brief description of the magazine content..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear in magazine previews
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., Business, Technology, Innovation"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas for better searchability
              </p>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Cover Image Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaImage className="text-[#0043FC]" />
                Cover Image *
              </h2>
              
              {!coverImage ? (
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0043FC] transition-colors">
                    <FaImage className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload cover image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="mb-4">
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeCover}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <FaTrashAlt className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PDF Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                PDF File *
              </h2>
              
              {!pdfFile ? (
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0043FC] transition-colors">
                    <FaFilePdf className="text-4xl text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload PDF</p>
                    <p className="text-xs text-gray-400 mt-1">PDF files only, Max 50MB</p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfSelect}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaFilePdf className="text-3xl text-red-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{pdfName}</p>
                        <p className="text-xs text-gray-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-[#0043FC]" />
                Author *
              </h2>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTag className="text-[#0043FC]" />
                Category *
              </h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
              >
                <option value="">Select a category</option>
                <option value="Business">Business</option>
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Fashion">Fashion</option>
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Health">Health</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>

            {/* Status & Featured */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-[#0043FC]" />
                Publication Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={formData.status === 'published'}
                        onChange={handleChange}
                        className="text-[#0043FC] focus:ring-[#0043FC]"
                      />
                      <span className="flex items-center gap-1">
                        <FaEye className="text-green-500" />
                        Publish
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={formData.status === 'draft'}
                        onChange={handleChange}
                        className="text-gray-400 focus:ring-gray-400"
                      />
                      <span className="flex items-center gap-1">
                        <FaEyeSlash className="text-gray-500" />
                        Save as Draft
                      </span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="text-yellow-400 focus:ring-yellow-400"
                    />
                    <span className="flex items-center gap-1">
                      {formData.isFeatured ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-400" />}
                      Feature this magazine
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-[#0043FC]" />
                Preview Info
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Title: {formData.title || '(Not set)'}</li>
                <li>• Author: {formData.author || '(Not set)'}</li>
                <li>• Category: {formData.category || '(Not set)'}</li>
                <li>• Status: {formData.status === 'published' ? 'Published' : 'Draft'}</li>
                <li>• Featured: {formData.isFeatured ? 'Yes' : 'No'}</li>
                <li>• PDF: {pdfFile ? 'Selected' : 'Not selected'}</li>
                <li>• Cover: {coverImage ? 'Selected' : 'Not selected'}</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminAddMagazine;