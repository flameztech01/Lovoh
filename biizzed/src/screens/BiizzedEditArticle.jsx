// screens/BiizzedEditArticle.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaImage, FaTrashAlt, FaPlus,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaEye, FaQuoteRight, FaTimes,
  FaSpinner, FaTag, FaNewspaper, FaClock, FaInfoCircle,
} from 'react-icons/fa';
import { useGetArticleByIdQuery, useUpdateArticleMutation } from '../slices/articlesApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const ToolbarButton = ({ onClick, icon: Icon, title }) => (
  <button type="button" onClick={onClick} title={title} className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors">
    <Icon className="text-sm" />
  </button>
);

const BiizzedEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const { data: article, isLoading, error } = useGetArticleByIdQuery(id);
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    tags: '',
    comingSoon: false,
    status: 'draft',
  });
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [keepImages, setKeepImages] = useState([]); // URLs of images to keep
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        category: article.category || '',
        tags: article.tags?.join(', ') || '',
        comingSoon: article.comingSoon || article.status === 'coming_soon',
        status: article.status || 'draft',
      });
      setContent(article.content || '');
      setExistingImages(article.images || []);
      setKeepImages(article.images || []);
      if (editorRef.current) {
        editorRef.current.innerHTML = article.content || '';
      }
    }
  }, [article]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  };

  const insertHeading = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const h2 = document.createElement('h2');
      h2.style.fontSize = '20px'; h2.style.fontWeight = 'bold'; h2.style.marginBottom = '8px';
      h2.textContent = selection.toString();
      range.deleteContents(); range.insertNode(h2);
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) execCommand('createLink', url);
  };

  const insertQuote = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '3px solid #1B3766'; blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '12px 0'; blockquote.style.color = '#4B5563'; blockquote.style.fontStyle = 'italic';
      blockquote.textContent = selection.toString();
      range.deleteContents(); range.insertNode(blockquote);
      if (editorRef.current) setContent(editorRef.current.innerHTML);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - (existingImages.length - removedImages.length + newImages.length);
    if (files.length > remainingSlots) {
      toast.error(`Max 5 images total. You can add up to ${remainingSlots} more.`);
      return;
    }
    const newImgs = [];
    const newPrevs = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large`); continue; }
      newImgs.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPrevs.push(reader.result);
        if (newPrevs.length === newImgs.length) {
          setNewImagePreviews(prev => [...prev, ...newPrevs]);
        }
      };
      reader.readAsDataURL(file);
    }
    setNewImages(prev => [...prev, ...newImgs]);
  };

  const removeExistingImage = (index) => {
    const urlToRemove = existingImages[index];
    setKeepImages(prev => prev.filter(url => url !== urlToRemove));
    setRemovedImages(prev => [...prev, urlToRemove]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!content || content.trim().length < 20) { toast.error('Content must be at least 20 characters'); return; }
    if (!formData.category) { toast.error('Category is required'); return; }
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('excerpt', formData.excerpt || formData.title.trim());
    fd.append('content', content);
    fd.append('category', formData.category);
    fd.append('tags', formData.tags);
    fd.append('comingSoon', formData.comingSoon);
    fd.append('status', formData.comingSoon ? 'coming_soon' : formData.status);
    // Send keepImages as JSON string
    fd.append('keepImages', JSON.stringify(keepImages));
    newImages.forEach(img => fd.append('images', img));

    try {
      await updateArticle({ id, data: fd }).unwrap();
      toast.success(formData.comingSoon ? 'Article updated as "Coming Soon"!' : 'Article updated successfully!');
      navigate('/articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update article');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-xl">Go Back</button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;
  const canAddMore = totalImages < 5;

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
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
            {isUpdating ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Update Article</>}
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
                    ? "The article will be shown as 'Coming Soon'. Full content can be added later."
                    : "Requires full content. Article will be published (or draft)."}
                </p>
              </div>
            </label>
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Article title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief excerpt or subtitle..."
              rows={2}
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Rich Text Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <ToolbarButton onClick={() => execCommand('bold')} icon={FaBold} title="Bold" />
              <ToolbarButton onClick={() => execCommand('italic')} icon={FaItalic} title="Italic" />
              <ToolbarButton onClick={() => execCommand('underline')} icon={FaUnderline} title="Underline" />
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={FaAlignLeft} title="Left" />
              <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={FaAlignCenter} title="Center" />
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={FaListUl} title="Bullets" />
              <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={FaListOl} title="Numbers" />
              <div className="w-px h-5 bg-gray-300 mx-1" />
              <ToolbarButton onClick={insertHeading} icon={FaHeading} title="Heading" />
              <ToolbarButton onClick={insertQuote} icon={FaQuoteRight} title="Quote" />
              <ToolbarButton onClick={insertLink} icon={FaLink} title="Link" />
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`ml-auto px-3 py-1 rounded text-xs ${previewMode ? 'bg-[#1B3766] text-white' : 'text-gray-500'}`}
              >
                <FaEye className="inline mr-1" />{previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
            {previewMode ? (
              <div className="min-h-[300px] p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[300px] p-4 focus:outline-none text-gray-700"
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Write your article content here..."
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
            <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #9CA3AF; }`}</style>
          </div>

          {/* Images Management */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> Images ({totalImages}/5)
            </h3>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Current images</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-28 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTrashAlt className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New images previews */}
            {newImagePreviews.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">New images</p>
                <div className="grid grid-cols-2 gap-2">
                  {newImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTrashAlt className="text-[10px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add more images */}
            {canAddMore && (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#1B3766] transition-colors">
                  <FaPlus className="text-xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Add more images</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </div>
              </label>
            )}
            <p className="text-[10px] text-gray-400 mt-2">Images help your article stand out. First image is the featured image.</p>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" required>
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tech, business..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          {/* Status (only if not coming soon) */}
          {!formData.comingSoon && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Published articles are visible to everyone.</p>
            </div>
          )}

          {/* Info note */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
            <FaInfoCircle className="text-[#1B3766] mt-0.5 flex-shrink-0" />
            <p>If you change the article from “Coming Soon” to published, full content is required. Subscribers will be notified of new published articles.</p>
          </div>

          <button onClick={handleSubmit} disabled={isUpdating} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden">
            {isUpdating ? 'Updating...' : 'Update Article'}
          </button>
        </form>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedEditArticle;