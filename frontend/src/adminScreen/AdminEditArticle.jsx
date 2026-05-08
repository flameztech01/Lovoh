// adminScreen/AdminEditArticle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaImage,
  FaTag,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaInfoCircle,
  FaSpinner,
  FaUser,
  FaFire,
  FaTrashAlt
} from 'react-icons/fa';
import { useGetArticleByIdQuery, useUpdateArticleMutation, useGetArticleCategoriesQuery } from '../slices/articlesApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: article, isLoading: isLoadingArticle } = useGetArticleByIdQuery(id);
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();
  const { data: categoriesData } = useGetArticleCategoriesQuery();
  const categories = categoriesData || [
    'Business', 'Technology', 'Leadership', 'Innovation', 'Marketing', 'Finance', 'Lifestyle', 'Startups'
  ];
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    tags: '',
    status: 'draft',
    isFeatured: false,
    isEditorsPick: false,
  });
  
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        category: article.category || '',
        author: article.author || '',
        tags: article.tags ? article.tags.join(', ') : '',
        status: article.status || 'draft',
        isFeatured: article.isFeatured || false,
        isEditorsPick: article.isEditorsPick || false,
      });
      setExistingImage(article.featuredImage || '');
      setImagePreview(article.featuredImage || '');
    }
  }, [article]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageSelect = (e) => {
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
    
    setFeaturedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFeaturedImage(null);
    setExistingImage('');
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Article title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('Article content is required');
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
    
    if (!featuredImage && !existingImage) {
      toast.error('Featured image is required');
      return;
    }
    
    // Prepare FormData for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('excerpt', formData.excerpt || formData.content.substring(0, 160));
    submitData.append('content', formData.content);
    submitData.append('category', formData.category);
    submitData.append('author', formData.author);
    submitData.append('status', formData.status);
    submitData.append('isFeatured', formData.isFeatured);
    submitData.append('isEditorsPick', formData.isEditorsPick);
    
    if (formData.tags) {
      submitData.append('tags', formData.tags);
    }
    
    // Append featured image only if new one selected
    if (featuredImage) {
      submitData.append('featuredImage', featuredImage);
    }
    
    try {
      setUploading(true);
      await updateArticle({ id, data: submitData }).unwrap();
      toast.success('Article updated successfully!');
      navigate('/admin/articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update article');
    } finally {
      setUploading(false);
    }
  };

  if (isLoadingArticle) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!article) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
          <button
            onClick={() => navigate('/admin/articles')}
            className="px-4 py-2 bg-[#1B3766] text-white rounded-lg"
          >
            Back to Articles
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
              onClick={() => navigate('/admin/articles')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-2 transition-colors"
            >
              <FaArrowLeft />
              Back to Articles
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-gray-500 mt-1">Update your blog article</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isUpdating || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all duration-300 disabled:opacity-50"
          >
            <FaSave />
            {uploading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Form */}
        <form className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt / Summary
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent resize-none"
              />
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Article Content *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="20"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent resize-none font-mono text-sm"
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaImage className="text-[#1B3766]" />
                Featured Image *
              </h2>
              
              {!imagePreview ? (
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1B3766] transition-colors">
                    <FaImage className="text-3xl text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload featured image</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Featured preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <FaTrashAlt className="text-sm" />
                  </button>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaUser className="text-[#1B3766]" />
                Author *
              </h2>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaTag className="text-[#1B3766]" />
                Category *
              </h2>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Publication Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-[#1B3766]" />
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
                        className="text-[#1B3766] focus:ring-[#1B3766]"
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
                        Draft
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
                      Feature this article
                    </span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isEditorsPick"
                      checked={formData.isEditorsPick}
                      onChange={handleChange}
                      className="text-red-400 focus:ring-red-400"
                    />
                    <span className="flex items-center gap-1">
                      {formData.isEditorsPick ? <FaFire className="text-red-500" /> : <FaFire className="text-gray-400" />}
                      Editor's Pick
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Preview Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FaInfoCircle className="text-[#1B3766]" />
                Preview Info
              </h3>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• Title: {formData.title || '(Not set)'}</li>
                <li>• Author: {formData.author || '(Not set)'}</li>
                <li>• Category: {formData.category || '(Not set)'}</li>
                <li>• Status: {formData.status === 'published' ? 'Published' : 'Draft'}</li>
                <li>• Featured: {formData.isFeatured ? 'Yes' : 'No'}</li>
                <li>• Editor's Pick: {formData.isEditorsPick ? 'Yes' : 'No'}</li>
                <li>• Featured Image: {imagePreview ? 'Selected' : 'Not selected'}</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminEditArticle;