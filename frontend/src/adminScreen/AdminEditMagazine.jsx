// adminScreen/AdminEditMagazine.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaImage,
  FaFilePdf,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaInfoCircle,
  FaSpinner,
  FaTrashAlt,
  FaUser
} from 'react-icons/fa';
import { useGetMagazineByIdQuery, useUpdateMagazineMutation } from '../slices/magApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEditMagazine = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: magazine, isLoading: isLoadingMagazine } = useGetMagazineByIdQuery(id);
  const [updateMagazine, { isLoading: isUpdating }] = useUpdateMagazineMutation();
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    author: '',
    category: '',
    tags: '',
    status: 'draft',
    isFeatured: false,
    coverImage: '',
    pdfUrl: ''
  });
  
  const [coverPreview, setCoverPreview] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (magazine) {
      setFormData({
        title: magazine.title || '',
        summary: magazine.summary || '',
        author: magazine.author || '',
        category: magazine.category || '',
        tags: magazine.tags ? magazine.tags.join(', ') : '',
        status: magazine.status || 'draft',
        isFeatured: magazine.isFeatured || false,
        coverImage: magazine.coverImage || '',
        pdfUrl: magazine.pdfUrl || ''
      });
      setCoverPreview(magazine.coverImage || '');
      if (magazine.pdfUrl) {
        const pdfNameFromUrl = magazine.pdfUrl.split('/').pop();
        setPdfName(pdfNameFromUrl);
      }
    }
  }, [magazine]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverPreview(reader.result);
    };
    reader.readAsDataURL(file);
    toast.success('Cover image selected');
  };

  const handlePdfUpload = (e) => {
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
    toast.success('PDF selected');
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setCoverPreview('');
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  const removePdf = () => {
    setPdfFile(null);
    setPdfName('');
    setFormData(prev => ({ ...prev, pdfUrl: '' }));
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
    
    // Only append files if they were changed
    if (coverImageFile) {
      submitData.append('coverImage', coverImageFile);
    }
    
    if (pdfFile) {
      submitData.append('pdf', pdfFile);
    }
    
    try {
      setUploading(true);
      await updateMagazine({ id, data: submitData }).unwrap();
      toast.success('Magazine updated successfully!');
      navigate('/admin/magazines');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update magazine');
    } finally {
      setUploading(false);
    }
  };

  if (isLoadingMagazine) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!magazine) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Magazine Not Found</h2>
          <button
            onClick={() => navigate('/admin/magazines')}
            className="px-4 py-2 bg-[#0043FC] text-white rounded-lg"
          >
            Back to Magazines
          </button>
        </div>
      </AdminSidebar>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Magazine</h1>
            <p className="text-gray-500 mt-1">Update your PDF magazine edition</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-all duration-300 disabled:opacity-50"
          >
            <FaSave />
            {isUpdating ? 'Saving...' : 'Save Changes'}
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
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] focus:border-transparent resize-none"
              />
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
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaImage className="text-[#0043FC]" />
                Cover Image
              </h2>
              
              <div className="mb-4">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0043FC] transition-colors">
                    {coverPreview ? (
                      <div className="relative">
                        <img src={coverPreview} alt="Cover preview" className="max-h-40 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={removeCoverImage}
                          className="absolute top-0 right-0 mt-1 mr-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <FaImage className="text-3xl text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new cover image</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
            </div>

            {/* PDF File */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                PDF File
              </h2>
              
              <div className="mb-4">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#0043FC] transition-colors">
                    {pdfName ? (
                      <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FaFilePdf className="text-3xl text-red-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{pdfName}</p>
                            <p className="text-xs text-gray-500">Current PDF</p>
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
                    ) : (
                      <>
                        <FaFilePdf className="text-4xl text-red-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload new PDF</p>
                        <p className="text-xs text-gray-400 mt-1">PDF only, Max 50MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                  </div>
                </label>
              </div>
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

            {/* Publication Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-[#0043FC]" />
                Publication Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                      <span className="flex items-center gap-1"><FaEye className="text-green-500" /> Publish</span>
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
                      <span className="flex items-center gap-1"><FaEyeSlash className="text-gray-500" /> Draft</span>
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
                <li>• Cover: {coverPreview ? 'Selected' : 'Not selected'}</li>
                <li>• PDF: {pdfName ? 'Selected' : (magazine?.pdfUrl ? 'Current PDF' : 'Not selected')}</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminEditMagazine;