// screens/BiizzedCreateArticle.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaSave, FaImage, FaTrashAlt, FaPlus,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaEye, FaQuoteRight, FaTimes,
  FaSpinner, FaTag, FaNewspaper, FaCamera,
} from 'react-icons/fa';
import { useCreateArticleMutation } from '../slices/articlesApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const ToolbarButton = ({ onClick, icon: Icon, title }) => (
  <button type="button" onClick={onClick} title={title} className="p-2 rounded hover:bg-gray-200 text-gray-600 transition-colors">
    <Icon className="text-sm" />
  </button>
);

const BiizzedCreateArticle = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [createArticle, { isLoading }] = useCreateArticleMutation();

  const [formData, setFormData] = useState({
    title: '', excerpt: '', category: '', tags: '',
  });
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) { toast.error('Max 5 images'); return; }
    const newImages = [], newPreviews = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} too large`); continue; }
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => { newPreviews.push(reader.result); if (newPreviews.length === newImages.length) setImagePreviews(prev => [...prev, ...newPreviews]); };
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
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!content || content.length < 50) { toast.error('Content must be at least 50 characters'); return; }
    if (!formData.category) { toast.error('Category is required'); return; }
    if (images.length === 0) { toast.error('At least one image is required'); return; }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('excerpt', formData.excerpt || formData.title.trim());
    fd.append('content', content);
    fd.append('category', formData.category);
    fd.append('tags', formData.tags);
    fd.append('status', 'published');
    images.forEach(img => fd.append('images', img));

    try {
      await createArticle(fd).unwrap();
      toast.success('Article published!');
      navigate('/articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to publish');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50">
            {isLoading ? <><FaSpinner className="animate-spin" /> Publishing...</> : <><FaSave /> Publish Article</>}
          </button>
        </div>

        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Article title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="excerpt" value={formData.excerpt} onChange={handleChange}
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
              <button type="button" onClick={() => setPreviewMode(!previewMode)} className={`ml-auto px-3 py-1 rounded text-xs ${previewMode ? 'bg-[#1B3766] text-white' : 'text-gray-500'}`}>
                <FaEye className="inline mr-1" />{previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>
            {previewMode ? (
              <div className="min-h-[300px] p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            ) : (
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                className="min-h-[300px] p-4 focus:outline-none text-gray-700"
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Write your article content here..."
              />
            )}
            <style>{`[contenteditable]:empty:before { content: attr(data-placeholder); color: #9CA3AF; }`}</style>
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FaImage className="text-[#1B3766]" /> Images ({images.length}/5)</h3>
            {images.length < 5 && (
              <label className="block cursor-pointer mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1B3766]">
                  <FaPlus className="text-xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Add Images</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </div>
              </label>
            )}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <FaTrashAlt className="text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Tags</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tech, business..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>

          {/* Submit Mobile */}
          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 lg:hidden">
            {isLoading ? 'Publishing...' : 'Publish Article'}
          </button>
        </form>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedCreateArticle;