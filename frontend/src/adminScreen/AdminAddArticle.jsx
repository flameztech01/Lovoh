// adminScreen/AdminAddArticle.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaUser,
  FaFire,
  FaTrashAlt,
  FaPlus,
  FaBold,
  FaItalic,
  FaUnderline,
  FaLink,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListUl,
  FaListOl,
  FaHeading,
  FaQuoteRight,
  FaCode
} from 'react-icons/fa';
import { useCreateArticleMutation, useGetArticleCategoriesQuery } from '../slices/articlesApiSlice';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminAddArticle = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);
  const [createArticle, { isLoading }] = useCreateArticleMutation();
  const { data: categoriesData } = useGetArticleCategoriesQuery();
  const defaultCategories = [
    'Business', 'Technology', 'Leadership', 'Innovation', 'Marketing', 'Finance', 'Lifestyle', 'Startups'
  ];
  const existingCategories = categoriesData || defaultCategories;
  
  const [categories, setCategories] = useState(existingCategories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const contentEditorRef = useRef(null);

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
  
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

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

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value === 'other') {
      setShowOtherInput(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setShowOtherInput(false);
      setFormData(prev => ({ ...prev, category: value }));
      setCustomCategory('');
    }
  };

  const handleCustomCategoryChange = (e) => {
    const value = e.target.value;
    setCustomCategory(value);
    setFormData(prev => ({ ...prev, category: value }));
  };

  const addNewCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }
    
    if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
      return;
    }
    
    setCategories([...categories, newCategory.trim()]);
    setFormData(prev => ({ ...prev, category: newCategory.trim() }));
    setIsAddingCategory(false);
    setNewCategory('');
    toast.success(`Category "${newCategory.trim()}" added`);
  };

  // Rich text formatting functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    contentEditorRef.current?.focus();
  };

  const createLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      setLinkText(selectedText);
      setShowLinkModal(true);
    } else {
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      // Insert the link with the selected text
      document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleContentChange = (e) => {
    setFormData(prev => ({ ...prev, content: e.target.innerHTML }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - images.length;
    
    if (files.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 5 images allowed.`);
      return;
    }
    
    const newImages = [];
    const newPreviews = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} size must be less than 5MB`);
        continue;
      }
      
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    
    if (images.length === 0) {
      toast.error('At least one image is required');
      return;
    }
    
    // Prepare FormData for file upload
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('excerpt', formData.excerpt || formData.content.replace(/<[^>]*>/g, '').substring(0, 160));
    submitData.append('content', formData.content);
    submitData.append('category', formData.category);
    submitData.append('author', formData.author);
    submitData.append('status', formData.status);
    submitData.append('isFeatured', formData.isFeatured);
    submitData.append('isEditorsPick', formData.isEditorsPick);
    
    if (formData.tags) {
      submitData.append('tags', formData.tags);
    }
    
    // Append all images
    images.forEach(image => {
      submitData.append('images', image);
    });
    
    try {
      setUploading(true);
      await createArticle(submitData).unwrap();
      toast.success('Article created successfully!');
      navigate('/admin/articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create article');
    } finally {
      setUploading(false);
    }
  };

  // Toolbar buttons configuration
  const toolbarButtons = [
    { icon: FaBold, command: 'bold', title: 'Bold' },
    { icon: FaItalic, command: 'italic', title: 'Italic' },
    { icon: FaUnderline, command: 'underline', title: 'Underline' },
    { divider: true },
    { icon: FaAlignLeft, command: 'justifyLeft', title: 'Align Left' },
    { icon: FaAlignCenter, command: 'justifyCenter', title: 'Align Center' },
    { icon: FaAlignRight, command: 'justifyRight', title: 'Align Right' },
    { divider: true },
    { icon: FaListUl, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: FaListOl, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: FaHeading, command: 'formatBlock', value: 'h2', title: 'Heading' },
    { icon: FaQuoteRight, command: 'formatBlock', value: 'blockquote', title: 'Quote' },
    { icon: FaCode, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { divider: true },
    { icon: FaLink, command: 'link', title: 'Insert Link', custom: true },
  ];

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Write New Article</h1>
            <p className="text-gray-500 mt-1">Create a new blog article with rich text formatting</p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || uploading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] text-white rounded-lg font-medium hover:bg-[#142952] transition-all duration-300 disabled:opacity-50"
          >
            <FaSave />
            {uploading ? 'Publishing...' : 'Publish Article'}
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
                placeholder="Enter an engaging title..."
                className="w-full px-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
            </div>

            {/* Excerpt / Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt / Summary
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="A short summary of your article (will be auto-generated from content if left empty)..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will appear in article previews. Leave empty to auto-generate from content.
              </p>
            </div>

            {/* Rich Text Content Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-2 bg-gray-50 flex flex-wrap gap-1">
                {toolbarButtons.map((btn, idx) => (
                  btn.divider ? (
                    <div key={idx} className="w-px h-6 bg-gray-300 mx-1" />
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => btn.custom ? createLink() : formatText(btn.command, btn.value)}
                      className="p-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                      title={btn.title}
                    >
                      <btn.icon className="text-sm" />
                    </button>
                  )
                ))}
              </div>
              
              <div
                ref={contentEditorRef}
                contentEditable
                onInput={handleContentChange}
                className="p-4 min-h-[400px] max-h-[600px] overflow-y-auto focus:outline-none prose prose-sm max-w-none"
                style={{ fontFamily: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: formData.content }}
              />
              
              <div className="border-t border-gray-100 p-3 bg-gray-50 text-xs text-gray-500">
                <p>Tip: You can format text using the toolbar above. Supports bold, italic, underline, lists, headings, quotes, code blocks, and links.</p>
              </div>
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
              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas for better searchability
              </p>
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Images Upload */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaImage className="text-[#1B3766]" />
                Article Images (Max 5) *
              </h2>
              
              {images.length < 5 && (
                <label className="block w-full cursor-pointer mb-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#1B3766] transition-colors">
                    <FaPlus className="text-2xl text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Add Image ({images.length}/5)</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5MB each)</p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </label>
              )}
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#1B3766] text-white text-[10px] px-1.5 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-gray-500 mt-3">
                First image will be used as the featured image. Up to 5 images total.
              </p>
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
                placeholder="Author name"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              />
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FaTag className="text-[#1B3766]" />
                  Category *
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(!isAddingCategory)}
                  className="text-xs text-[#1B3766] hover:text-[#142952] flex items-center gap-1"
                >
                  <FaPlus className="text-[10px]" />
                  Add New
                </button>
              </div>
              
              {isAddingCategory && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter new category name"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={addNewCategory}
                      className="px-3 py-1.5 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952]"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategory('');
                      }}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <select
                value={formData.category === 'other' ? 'other' : formData.category}
                onChange={handleCategoryChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="other">+ Other (Enter custom category)</option>
              </select>
              
              {showOtherInput && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={customCategory}
                    onChange={handleCustomCategoryChange}
                    placeholder="Enter custom category name"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This category will be saved with this article
                  </p>
                </div>
              )}
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
                      Feature this article
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Featured articles appear at the top of listings</p>
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
                  <p className="text-xs text-gray-500 mt-1">Editor's pick articles get special highlighting</p>
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
                <li>• Images: {images.length} / 5 selected</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Insert Link</h3>
                <p className="text-sm text-gray-500 mt-1">Enter the URL for the link</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  readOnly
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={insertLink}
                  className="flex-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg hover:bg-[#142952]"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminSidebar>
  );
};

export default AdminAddArticle;