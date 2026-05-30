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

const ToolbarButton = ({ onClick, icon: Icon, title, active }) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
    title={title}
    className={`p-2 rounded transition-colors ${
      active ? 'bg-[#1B3766] text-white' : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
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
  const [keepImages, setKeepImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [activeFormats, setActiveFormats] = useState({});
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  // Initialize editor content from article data
  useEffect(() => {
    if (article && editorRef.current && !isEditorInitialized) {
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
      
      // Set editor content without triggering re-renders
      editorRef.current.innerHTML = article.content || '';
      setIsEditorInitialized(true);
    }
  }, [article, isEditorInitialized]);

  // Track active formatting as the cursor moves
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (
        editorRef.current &&
        selection.rangeCount > 0 &&
        editorRef.current.contains(selection.anchorNode)
      ) {
        const formatState = {
          bold: false,
          italic: false,
          underline: false,
          justifyLeft: false,
          justifyCenter: false,
          justifyRight: false,
          insertUnorderedList: false,
          insertOrderedList: false,
        };
        
        const node = selection.anchorNode;
        if (node) {
          let parent = node.parentElement;
          while (parent && parent !== editorRef.current) {
            if (parent.tagName === 'STRONG' || parent.tagName === 'B') {
              formatState.bold = true;
            }
            if (parent.tagName === 'EM' || parent.tagName === 'I') {
              formatState.italic = true;
            }
            if (parent.tagName === 'U') {
              formatState.underline = true;
            }
            if (parent.tagName === 'UL') {
              formatState.insertUnorderedList = true;
            }
            if (parent.tagName === 'OL') {
              formatState.insertOrderedList = true;
            }
            parent = parent.parentElement;
          }
        }
        
        setActiveFormats(formatState);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Return focus to editor when leaving preview mode
  useEffect(() => {
    if (!previewMode && editorRef.current) {
      setTimeout(() => editorRef.current.focus(), 0);
    }
  }, [previewMode]);

  // Helper function to save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      return start;
    }
    return null;
  };

  // Helper function to restore cursor position
  const restoreCursorPosition = (savedPos) => {
    if (!savedPos) return;
    const selection = window.getSelection();
    const range = document.createRange();
    let charIndex = 0;
    let found = false;
    
    const walk = (node) => {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const textLength = node.textContent.length;
        if (charIndex + textLength >= savedPos) {
          range.setStart(node, savedPos - charIndex);
          range.setEnd(node, savedPos - charIndex);
          found = true;
          return;
        }
        charIndex += textLength;
      } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
          if (found) break;
        }
      }
    };
    
    walk(editorRef.current);
    if (found) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Improved execCommand with proper list handling
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    const savedPos = saveCursorPosition();
    editorRef.current.focus();
    
    if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      
      const range = selection.getRangeAt(0);
      const isListActive = activeFormats[command];
      
      if (isListActive) {
        document.execCommand('outdent', false, null);
      } else {
        let parent = selection.anchorNode.parentElement;
        let inList = false;
        while (parent && parent !== editorRef.current) {
          if (parent.tagName === 'UL' || parent.tagName === 'OL') {
            inList = true;
            break;
          }
          parent = parent.parentElement;
        }
        
        if (inList) {
          document.execCommand('outdent', false, null);
        } else {
          const listTag = command === 'insertUnorderedList' ? 'UL' : 'OL';
          const listItemTag = 'LI';
          const text = selection.toString();
          
          if (text) {
            const lines = text.split('\n');
            const list = document.createElement(listTag);
            list.style.margin = '12px 0';
            list.style.paddingLeft = '24px';
            
            lines.forEach(line => {
              if (line.trim()) {
                const li = document.createElement(listItemTag);
                li.textContent = line;
                list.appendChild(li);
              }
            });
            
            range.deleteContents();
            range.insertNode(list);
            
            const lastItem = list.lastChild;
            if (lastItem) {
              const newRange = document.createRange();
              newRange.selectNodeContents(lastItem);
              newRange.collapse(false);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } else {
            const list = document.createElement(listTag);
            list.style.margin = '12px 0';
            list.style.paddingLeft = '24px';
            const li = document.createElement(listItemTag);
            li.innerHTML = '<br>';
            list.appendChild(li);
            range.insertNode(list);
            
            const newRange = document.createRange();
            newRange.selectNodeContents(li);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    } else {
      document.execCommand(command, false, value);
    }
    
    // Update content state after command
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      setTimeout(() => {
        const newFormats = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          justifyLeft: document.queryCommandState('justifyLeft'),
          justifyCenter: document.queryCommandState('justifyCenter'),
          justifyRight: document.queryCommandState('justifyRight'),
          insertUnorderedList: !!editorRef.current.querySelector('ul'),
          insertOrderedList: !!editorRef.current.querySelector('ol'),
        };
        setActiveFormats(newFormats);
      }, 10);
    }
    
    setTimeout(() => restoreCursorPosition(savedPos), 10);
  };

  const insertHeading = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const savedPos = saveCursorPosition();
    
    if (selection.toString()) {
      const h2 = document.createElement('h2');
      h2.style.fontSize = '1.5rem';
      h2.style.fontWeight = 'bold';
      h2.style.margin = '1rem 0 0.5rem 0';
      h2.style.lineHeight = '1.3';
      h2.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(h2);
      
      range.setStartAfter(h2);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      const h2 = document.createElement('h2');
      h2.style.fontSize = '1.5rem';
      h2.style.fontWeight = 'bold';
      h2.style.margin = '1rem 0 0.5rem 0';
      h2.style.lineHeight = '1.3';
      h2.innerHTML = '<br>';
      range.insertNode(h2);
      
      range.selectNodeContents(h2);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    setTimeout(() => restoreCursorPosition(savedPos), 10);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url && editorRef.current) {
      editorRef.current.focus();
      const savedPos = saveCursorPosition();
      
      const selection = window.getSelection();
      if (selection.toString()) {
        document.execCommand('createLink', false, url);
      } else {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.color = '#1B3766';
        link.style.textDecoration = 'underline';
        range.insertNode(link);
        
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      if (editorRef.current) {
        setContent(editorRef.current.innerHTML);
      }
      setTimeout(() => restoreCursorPosition(savedPos), 10);
    }
  };

  const insertQuote = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const savedPos = saveCursorPosition();
    
    if (selection.toString()) {
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '3px solid #1B3766';
      blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '12px 0';
      blockquote.style.color = '#4B5563';
      blockquote.style.fontStyle = 'italic';
      blockquote.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(blockquote);
      
      range.setStartAfter(blockquote);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      const blockquote = document.createElement('blockquote');
      blockquote.style.borderLeft = '3px solid #1B3766';
      blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '12px 0';
      blockquote.style.color = '#4B5563';
      blockquote.style.fontStyle = 'italic';
      blockquote.innerHTML = '<br>';
      range.insertNode(blockquote);
      
      range.selectNodeContents(blockquote);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    setTimeout(() => restoreCursorPosition(savedPos), 10);
  };

  const handleEditorInput = (e) => {
    setContent(e.currentTarget.innerHTML);
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
    
    if (!formData.comingSoon) {
      const cleanContent = content?.replace(/<[^>]*>/g, '').trim() || '';
      if (!content || cleanContent.length < 20) { 
        toast.error('Content must be at least 20 characters'); 
        return; 
      }
    }
    
    if (!formData.category) { toast.error('Category is required'); return; }
    
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error('At least one image is required');
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('excerpt', formData.excerpt || formData.title.trim());
    fd.append('content', content || '');
    fd.append('category', formData.category);
    fd.append('tags', formData.tags);
    fd.append('comingSoon', formData.comingSoon);
    fd.append('status', formData.comingSoon ? 'coming_soon' : formData.status);
    fd.append('keepImages', JSON.stringify(keepImages));
    newImages.forEach(img => fd.append('images', img));

    try {
      await updateArticle({ id, data: fd }).unwrap();
      toast.success(formData.comingSoon ? 'Article updated as "Coming Soon"!' : 'Article updated successfully!');
      navigate('/profile?tab=articles');
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
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/profile?tab=articles')} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm group">
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" /> Back to Profile
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-colors"
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
                    : "Requires full content (min 20 characters). Article will be published or saved as draft."}
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
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400 focus:ring-0"
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
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none focus:ring-0"
            />
          </div>

          {/* Rich Text Editor - Only show if not coming soon mode */}
          {!formData.comingSoon && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-gray-100 bg-gray-50">
                <ToolbarButton onClick={() => execCommand('bold')} icon={FaBold} title="Bold" active={activeFormats.bold} />
                <ToolbarButton onClick={() => execCommand('italic')} icon={FaItalic} title="Italic" active={activeFormats.italic} />
                <ToolbarButton onClick={() => execCommand('underline')} icon={FaUnderline} title="Underline" active={activeFormats.underline} />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={FaAlignLeft} title="Left" active={activeFormats.justifyLeft} />
                <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={FaAlignCenter} title="Center" active={activeFormats.justifyCenter} />
                <ToolbarButton onClick={() => execCommand('justifyRight')} icon={FaAlignRight} title="Right" active={activeFormats.justifyRight} />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={FaListUl} title="Bullet List" active={activeFormats.insertUnorderedList} />
                <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={FaListOl} title="Numbered List" active={activeFormats.insertOrderedList} />
                <div className="w-px h-5 bg-gray-300 mx-1" />
                <ToolbarButton onClick={insertHeading} icon={FaHeading} title="Heading" active={false} />
                <ToolbarButton onClick={insertQuote} icon={FaQuoteRight} title="Quote" active={false} />
                <ToolbarButton onClick={insertLink} icon={FaLink} title="Link" active={false} />
                <button
                  type="button"
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`ml-auto px-3 py-1 rounded text-xs font-medium transition-colors ${
                    previewMode ? 'bg-[#1B3766] text-white' : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <FaEye className="inline mr-1" />{previewMode ? 'Edit' : 'Preview'}
                </button>
              </div>
              {previewMode ? (
                <div 
                  className="min-h-[300px] p-4 prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content yet. Start writing...</p>' }} 
                  style={{
                    '--tw-prose-bullets': '#1B3766',
                    '--tw-prose-counters': '#1B3766',
                  }}
                />
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Write your article content here..."
                  className="min-h-[300px] p-4 focus:outline-none text-gray-700 prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                  onInput={handleEditorInput}
                  style={{
                    '--tw-prose-bullets': '#1B3766',
                    '--tw-prose-counters': '#1B3766',
                  }}
                />
              )}
            </div>
          )}

          {/* Coming Soon placeholder */}
          {formData.comingSoon && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
              <FaClock className="text-3xl text-[#1B3766] mx-auto mb-2" />
              <p className="text-sm text-gray-600">Content editing is disabled in "Coming Soon" mode.</p>
              <p className="text-xs text-gray-500 mt-1">Uncheck "Coming Soon Mode" to edit the full content.</p>
            </div>
          )}

          {/* Images Management */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> Images ({totalImages}/5)
            </h3>
            <p className="text-xs text-gray-500 mb-3 flex items-start gap-1.5">
              <FaInfoCircle className="mt-0.5 text-gray-400 shrink-0" />
              <span>
                The <strong>first image</strong> will be used as the cover photo.
              </span>
            </p>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current images</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img src={url} alt="" className="w-full h-28 object-cover rounded-lg border" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#1B3766] text-white text-[10px] font-medium rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">New images to add</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {newImagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1B3766] transition-colors">
                  <FaPlus className="text-xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Add more images</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </div>
              </label>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" required>
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tech, business, innovation..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
            </div>
          </div>

          {/* Status (only if not coming soon) */}
          {!formData.comingSoon && (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Published articles are visible to everyone. Subscribers will be notified.</p>
            </div>
          )}

          {/* Info note */}
          <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
            <FaInfoCircle className="text-[#1B3766] mt-0.5 flex-shrink-0" />
            <p>If you change the article from "Coming Soon" to published, full content is required (min 20 characters). Subscribers will be notified of new published articles.</p>
          </div>

          {/* Submit Button Mobile */}
          <button onClick={handleSubmit} disabled={isUpdating} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 transition-colors lg:hidden">
            {isUpdating ? <><FaSpinner className="animate-spin inline mr-2" /> Updating...</> : <><FaSave className="inline mr-2" /> Update Article</>}
          </button>
        </form>
      </div>
      
      <BiizzedBottomBar />

      <style>{`
        .prose ul, .prose ol {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
        }
        .prose ul {
          list-style-type: disc;
        }
        .prose ol {
          list-style-type: decimal;
        }
        .prose li {
          margin: 0.25rem 0;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9CA3AF;
        }
      `}</style>
    </div>
  );
};

export default BiizzedEditArticle;