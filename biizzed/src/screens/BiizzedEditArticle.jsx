// screens/BiizzedEditArticle.jsx – Premium design with brand colors & active states
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiSave, FiImage, FiTrash2, FiPlus, FiBold, FiItalic, FiUnderline,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiList, FiLink, FiEye,
  FiLoader, FiTag, FiClock, FiCheckCircle, FiXCircle, FiInfo,
  FiMove, FiGrid, FiHash, FiUser, FiLock, FiAlertCircle,
} from 'react-icons/fi';
import { useGetArticleByIdQuery, useUpdateArticleMutation } from '../slices/articlesApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedEditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const titleInputRef = useRef(null);

  const { data: article, isLoading, error, refetch } = useGetArticleByIdQuery(id);
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: '',
    customCategory: '',
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
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false,
    justifyLeft: true, justifyCenter: false, justifyRight: false,
    insertUnorderedList: false, insertOrderedList: false,
  });
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [imagePlacementMode, setImagePlacementMode] = useState('manual');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const defaultCategories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation', 'Others'];
  
  const getFinalCategory = () => {
    if (formData.category === 'Others' && formData.customCategory) {
      return formData.customCategory;
    }
    return formData.category;
  };

  // Validation functions
  const validateTitle = (title) => {
    if (!title || title.trim().length === 0) return 'Title is required';
    if (title.trim().length < 5) return 'Title must be at least 5 characters';
    return null;
  };

  const validateContent = (contentText) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentText || '';
    const cleanText = tempDiv.textContent || '';
    if (!contentText || cleanText.trim().length === 0) return 'Content is required';
    if (cleanText.trim().length < 50) return 'Content must be at least 50 characters';
    return null;
  };

  const validateCategory = (category, customCategory) => {
    if (!category) return 'Category is required';
    if (category === 'Others' && (!customCategory || customCategory.trim().length === 0)) {
      return 'Please enter a custom category';
    }
    return null;
  };

  const validateImages = (imageList) => {
    if (imageList.length === 0) return 'At least one image is required';
    return null;
  };

  const validateAll = () => {
    const titleError = validateTitle(formData.title);
    const categoryError = validateCategory(formData.category, formData.customCategory);
    const imagesError = validateImages([...existingImages, ...newImages]);
    let contentError = null;
    
    if (!formData.comingSoon) {
      contentError = validateContent(content);
    }
    
    setErrors({
      title: titleError,
      content: contentError,
      category: categoryError,
      images: imagesError,
    });
    
    return !titleError && !contentError && !categoryError && !imagesError;
  };

  // Update word count
  useEffect(() => {
    if (editorRef.current && !formData.comingSoon) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    }
  }, [content, formData.comingSoon]);

  // Track active formatting states
  useEffect(() => {
    if (formData.comingSoon) return;
    
    const checkActiveFormats = () => {
      if (!editorRef.current) return;
      
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        justifyLeft: document.queryCommandState('justifyLeft'),
        justifyCenter: document.queryCommandState('justifyCenter'),
        justifyRight: document.queryCommandState('justifyRight'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });
    };

    document.addEventListener('selectionchange', checkActiveFormats);
    document.addEventListener('keyup', checkActiveFormats);
    document.addEventListener('mouseup', checkActiveFormats);
    
    return () => {
      document.removeEventListener('selectionchange', checkActiveFormats);
      document.removeEventListener('keyup', checkActiveFormats);
      document.removeEventListener('mouseup', checkActiveFormats);
    };
  }, [formData.comingSoon]);

  // Initialize editor content from article data
  useEffect(() => {
    if (article && editorRef.current && !isEditorInitialized) {
      const isCustomCategory = !defaultCategories.includes(article.category);
      
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        category: isCustomCategory ? 'Others' : (article.category || ''),
        customCategory: isCustomCategory ? article.category : '',
        tags: article.tags?.join(', ') || '',
        comingSoon: article.comingSoon || article.status === 'coming_soon',
        status: article.status || 'draft',
      });
      
      if (isCustomCategory) {
        setShowCustomCategory(true);
      }
      
      setContent(article.content || '');
      setExistingImages(article.images || []);
      setKeepImages(article.images || []);
      
      // Set editor content
      editorRef.current.innerHTML = article.content || '';
      setIsEditorInitialized(true);
    }
  }, [article, isEditorInitialized]);

  // Real-time validation on blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    switch(field) {
      case 'title':
        setErrors(prev => ({ ...prev, title: validateTitle(formData.title) }));
        break;
      case 'content':
        setErrors(prev => ({ ...prev, content: validateContent(content) }));
        break;
      case 'category':
        setErrors(prev => ({ ...prev, category: validateCategory(formData.category, formData.customCategory) }));
        break;
      case 'images':
        setErrors(prev => ({ ...prev, images: validateImages([...existingImages, ...newImages]) }));
        break;
      default:
        break;
    }
  };

  const scrollToError = () => {
    if (errors.title) {
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      titleInputRef.current?.focus();
    } else if (errors.content) {
      editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      editorRef.current?.focus();
    } else if (errors.category) {
      document.querySelector('[data-category-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (errors.images) {
      document.querySelector('[data-images-section]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current?.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      return { 
        startContainer: range.startContainer, 
        startOffset: range.startOffset, 
        endContainer: range.endContainer, 
        endOffset: range.endOffset 
      };
    }
    return null;
  };

  const restoreSelection = (saved) => {
    if (!saved) return;
    const selection = window.getSelection();
    const range = document.createRange();
    try {
      range.setStart(saved.startContainer, saved.startOffset);
      range.setEnd(saved.endContainer, saved.endOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (e) {}
  };

  const formatText = (command, value = null) => {
    if (!editorRef.current || formData.comingSoon) return;
    const savedSelection = saveSelection();
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current.innerHTML);
    setTimeout(() => restoreSelection(savedSelection), 10);
  };

  const insertLink = () => {
    if (formData.comingSoon) return;
    const url = prompt('Enter URL:', 'https://');
    if (url && editorRef.current) {
      const savedSelection = saveSelection();
      editorRef.current.focus();
      
      const selection = window.getSelection();
      if (selection.toString()) {
        document.execCommand('createLink', false, url);
      } else {
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = url;
        link.textContent = url;
        link.target = '_blank';
        link.className = 'text-[#1B3766] underline';
        range.insertNode(link);
        range.setStartAfter(link);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      
      setContent(editorRef.current.innerHTML);
      setTimeout(() => restoreSelection(savedSelection), 10);
    }
  };

  const insertImageAtCursor = (imageUrl) => {
    if (!editorRef.current || formData.comingSoon) {
      toast.error('Click in the editor first');
      return;
    }
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const savedSelection = saveSelection();
    
    const container = document.createElement('div');
    container.className = 'relative my-6 group';
    container.setAttribute('contenteditable', 'false');
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'w-full rounded-2xl shadow-lg';
    img.style.maxHeight = '500px';
    img.style.objectFit = 'cover';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'absolute top-3 right-3 w-9 h-9 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:shadow-lg z-10';
    deleteBtn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      container.remove();
      setContent(editorRef.current.innerHTML);
      toast.success('Image removed from article');
    };
    
    container.appendChild(img);
    container.appendChild(deleteBtn);
    range.insertNode(container);
    
    const br = document.createElement('br');
    range.setStartAfter(container);
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    setContent(editorRef.current.innerHTML);
    setTimeout(() => restoreSelection(savedSelection), 10);
    toast.success('Image added to your story');
  };

  const handleEditorInput = (e) => {
    if (!formData.comingSoon) {
      setContent(e.currentTarget.innerHTML);
      if (errors.content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = e.currentTarget.innerHTML || '';
        const cleanText = tempDiv.textContent || '';
        if (cleanText.trim().length >= 50) {
          setErrors(prev => ({ ...prev, content: null }));
        }
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear errors when fields are updated
    if (name === 'title' && errors.title) {
      setErrors(prev => ({ ...prev, title: null }));
    }
    if (name === 'category' && errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - (existingImages.length - removedImages.length + newImages.length);
    if (files.length > remainingSlots) {
      toast.error(`Max 5 images total. You can add ${remainingSlots} more.`);
      return;
    }
    
    const newImgs = [];
    const newPrevs = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) { 
        toast.error(`${file.name} exceeds 5MB`); 
        continue; 
      }
      newImgs.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPrevs.push(reader.result);
        if (newPrevs.length === newImgs.length) {
          setNewImagePreviews(prev => [...prev, ...newPrevs]);
          toast.info(`${newImgs.length} image(s) added. Click to insert into editor.`);
          // Clear images error when images are added
          if (errors.images && [...existingImages, ...newImgs].length > 0) {
            setErrors(prev => ({ ...prev, images: null }));
          }
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
    toast.success('Image removed');
    
    // Update images error
    if (existingImages.length === 1 && newImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
    
    // Update images error
    if (existingImages.length === 0 && newImages.length === 1) {
      setErrors(prev => ({ ...prev, images: 'At least one image is required' }));
    }
  };

  const handleSubmit = async () => {
    // Mark all fields as touched
    setTouched({
      title: true,
      content: true,
      category: true,
      images: true,
    });
    
    const finalCategory = getFinalCategory();
    
    // Validate all fields
    const titleError = validateTitle(formData.title);
    const contentError = !formData.comingSoon ? validateContent(content) : null;
    const categoryError = validateCategory(formData.category, formData.customCategory);
    const imagesError = validateImages([...existingImages, ...newImages]);
    
    setErrors({
      title: titleError,
      content: contentError,
      category: categoryError,
      images: imagesError,
    });
    
    // If any errors, show toast and scroll to first error
    if (titleError || contentError || categoryError || imagesError) {
      if (titleError) toast.error(titleError);
      else if (contentError) toast.error(contentError);
      else if (categoryError) toast.error(categoryError);
      else if (imagesError) toast.error(imagesError);
      
      scrollToError();
      return;
    }
    
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error('Add at least one image');
      return;
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('excerpt', formData.excerpt || formData.title.trim());
    fd.append('content', content || '');
    fd.append('category', finalCategory);
    fd.append('tags', formData.tags);
    fd.append('comingSoon', formData.comingSoon);
    fd.append('status', formData.comingSoon ? 'coming_soon' : formData.status);
    fd.append('keepImages', JSON.stringify(keepImages));
    newImages.forEach(img => fd.append('images', img));

    try {
      const result = await updateArticle({ id, data: fd }).unwrap();
      if (result) {
        toast.success(formData.comingSoon ? '✨ Article updated as "Coming Soon"!' : '🎉 Article updated successfully!');
        navigate('/profile?tab=articles');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update article. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <FiLoader className="animate-spin text-3xl text-[#1B3766] mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading your article...</p>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FiXCircle className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Article not found</h2>
            <p className="text-gray-500 text-sm mb-8">The article you're looking for doesn't exist or you don't have permission to edit it.</p>
            <button onClick={() => navigate('/profile?tab=articles')} className="w-full py-4 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-xl font-medium hover:shadow-lg">
              Back to Profile
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;
  const canAddMore = totalImages < 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <BiizzedArticlesNavbar />
      
      <div className="max-w-4xl mx-auto px-5 py-6 pb-32">
        {/* Elegant Header */}
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-20 rounded-2xl px-4 shadow-sm">
          <button onClick={() => navigate('/profile?tab=articles')} className="text-gray-600 hover:text-[#1B3766] transition-all group">
            <FiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-5">
            {!formData.comingSoon && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                <FiCheckCircle className="text-sm text-green-500" />
                <span className="text-xs font-medium text-gray-600">{wordCount} words</span>
              </div>
            )}
            
            <button 
              onClick={handleSubmit} 
              disabled={isUpdating}
              className="px-6 py-2.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <FiLoader className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <FiSave />
                  Update
                </>
              )}
            </button>
          </div>
        </div>

        {/* Coming Soon Toggle - Premium */}
        <div className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              name="comingSoon"
              checked={formData.comingSoon}
              onChange={handleChange}
              className="w-5 h-5 text-[#1B3766] rounded focus:ring-2 focus:ring-[#1B3766]"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FiClock className="text-[#1B3766] text-base" />
                <span className="font-semibold text-gray-800">Coming Soon Mode</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {formData.comingSoon
                  ? "Article will be shown as 'Coming Soon'. Content can be added later."
                  : "Full content required (min 50 characters). Article will be published or saved as draft."}
              </p>
            </div>
          </label>
        </div>

        {/* Mode selector - if not coming soon */}
        {!formData.comingSoon && showModeSelector && newImagePreviews.length === 0 && (
          <div className="mb-8 p-1.5 bg-gray-100/80 backdrop-blur rounded-2xl inline-flex w-full max-w-md">
            <button
              onClick={() => { setImagePlacementMode('manual'); setShowModeSelector(false); }}
              className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-all ${
                imagePlacementMode === 'manual' 
                  ? 'bg-white shadow-md text-[#1B3766]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiMove className="inline mr-2" /> Manual placement
            </button>
            <button
              onClick={() => { setImagePlacementMode('auto'); setShowModeSelector(false); }}
              className={`flex-1 py-3 px-5 rounded-xl text-sm font-medium transition-all ${
                imagePlacementMode === 'auto' 
                  ? 'bg-white shadow-md text-[#1B3766]' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FiGrid className="inline mr-2" /> Auto placement
            </button>
          </div>
        )}

        {/* Mode indicator */}
        {!formData.comingSoon && !showModeSelector && newImagePreviews.length > 0 && (
          <div className="mb-4 flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2">
              <FiMove className="text-[#1B3766] text-sm" />
              <span className="text-xs text-gray-700">Manual mode: Click any new image to insert at cursor</span>
            </div>
          </div>
        )}

        {/* Title input with error handling */}
        <div className="mb-6">
          <input
            ref={titleInputRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={() => handleBlur('title')}
            placeholder="Edit your title..."
            className={`w-full text-4xl md:text-5xl lg:text-6xl font-bold border-0 outline-none placeholder:text-gray-300 p-0 focus:ring-0 bg-transparent ${
              touched.title && errors.title ? 'text-red-500 placeholder:text-red-200' : ''
            }`}
          />
          {touched.title && errors.title && (
            <div className="flex items-center gap-1 mt-2 text-red-500 text-sm">
              <FiAlertCircle className="text-xs" />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div className="mb-8">
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Edit your excerpt..."
            rows={2}
            className="w-full text-gray-500 text-lg border-0 outline-none placeholder:text-gray-300 resize-none p-0 bg-transparent"
          />
        </div>

        {/* Premium Toolbar - Only if not coming soon */}
        {!formData.comingSoon && (
          <div className="sticky top-20 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl p-2 mb-8 z-10 shadow-sm">
            <div className="flex flex-wrap gap-1">
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.bold ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiBold className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Bold (Ctrl + B)
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.italic ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiItalic className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Italic (Ctrl + I)
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.underline ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiUnderline className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Underline (Ctrl + U)
                </span>
              </div>
              
              <div className="w-px h-7 bg-gray-200 mx-1 self-center" />
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyLeft'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.justifyLeft ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiAlignLeft className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Align Left
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyCenter'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.justifyCenter ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiAlignCenter className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Align Center
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyRight'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.justifyRight ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiAlignRight className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Align Right
                </span>
              </div>
              
              <div className="w-px h-7 bg-gray-200 mx-1 self-center" />
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('insertUnorderedList'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.insertUnorderedList ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiList className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Bullet List
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); formatText('insertOrderedList'); }} className={`p-2.5 rounded-xl transition-all ${activeFormats.insertOrderedList ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiHash className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Numbered List
                </span>
              </div>
              
              <div className="w-px h-7 bg-gray-200 mx-1 self-center" />
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-all">
                  <FiLink className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Insert Link (Ctrl + K)
                </span>
              </div>
              
              <div className="relative group">
                <button onMouseDown={(e) => { e.preventDefault(); setPreviewMode(!previewMode); }} className={`p-2.5 rounded-xl transition-all ml-auto ${previewMode ? 'bg-[#1B3766] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <FiEye className="text-lg" />
                </button>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {previewMode ? 'Edit Mode' : 'Preview Mode'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Editor content with error handling */}
        {!formData.comingSoon ? (
          previewMode ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm min-h-[500px]">
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-300 italic">Start writing...</p>' }} />
            </div>
          ) : (
            <div className={`bg-white rounded-2xl p-8 shadow-sm min-h-[500px] transition-shadow hover:shadow-md ${touched.content && errors.content ? 'ring-2 ring-red-500' : ''}`}>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Edit your story..."
                className="focus:outline-none prose prose-lg max-w-none text-gray-800 leading-relaxed min-h-[400px]"
                onInput={handleEditorInput}
                onBlur={() => handleBlur('content')}
              />
              {touched.content && errors.content && (
                <div className="flex items-center gap-1 mt-3 text-red-500 text-sm">
                  <FiAlertCircle className="text-xs" />
                  <span>{errors.content}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
            <FiClock className="text-4xl text-[#1B3766] mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Content editing is disabled in "Coming Soon" mode</p>
            <p className="text-sm text-gray-400 mt-1">Uncheck "Coming Soon Mode" to edit the full content</p>
          </div>
        )}

        {/* Images Management with error handling */}
        <div className="mt-12 pt-8 border-t-2 border-gray-100" data-images-section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiImage className="text-[#1B3766]" /> Visuals
              </h3>
              <p className="text-sm text-gray-400 mt-1">{totalImages}/5 images • First image is cover photo</p>
            </div>
            {!formData.comingSoon && newImagePreviews.length > 0 && (
              <span className="text-xs text-[#1B3766] bg-blue-50 px-3 py-1.5 rounded-full">
                Click any new image to insert
              </span>
            )}
          </div>

          {errors.images && touched.images && (
            <div className="flex items-center gap-1 mb-3 text-red-500 text-sm">
              <FiAlertCircle className="text-xs" />
              <span>{errors.images}</span>
            </div>
          )}

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Current Images</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all">
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                    
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white text-[10px] font-medium rounded-full shadow-lg">
                        Cover
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New images previews */}
          {newImagePreviews.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">New Images to Add</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {newImagePreviews.map((preview, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-xl overflow-hidden bg-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => !formData.comingSoon && insertImageAtCursor(preview)}
                  >
                    <img src={preview} alt="" className="w-full aspect-square object-cover transition-transform group-hover:scale-105" />
                    
                    {existingImages.length === 0 && idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white text-[10px] font-medium rounded-full shadow-lg">
                        Cover
                      </div>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewImage(idx);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg"
                    >
                      <FiTrash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    
                    {!formData.comingSoon && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">
                          Click to Insert
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!formData.comingSoon && (
                <p className="text-xs text-gray-400 mt-3 text-center">
                  💡 Tip: Click any new image above to insert it at your cursor position
                </p>
              )}
            </div>
          )}

          {/* Add more images */}
          {canAddMore && (
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all group ${
                errors.images && touched.images && totalImages === 0
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-gray-200 hover:border-[#1B3766] hover:bg-blue-50/30'
              }`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all ${
                  errors.images && touched.images && totalImages === 0
                    ? 'bg-red-100'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-blue-50 group-hover:to-indigo-50'
                }`}>
                  <FiPlus className={`text-2xl ${
                    errors.images && touched.images && totalImages === 0
                      ? 'text-red-400'
                      : 'text-gray-400 group-hover:text-[#1B3766]'
                  }`} />
                </div>
                <p className="text-gray-500 font-medium">Add images</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </div>
            </label>
          )}
        </div>

        {/* Category with custom option and error handling */}
        <div className="mt-8 pt-4 space-y-5" data-category-section>
          <div className={`bg-white rounded-2xl p-6 shadow-sm border ${touched.category && errors.category ? 'border-red-300' : 'border-gray-100'}`}>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiTag className="text-[#1B3766]" /> Category
            </label>
            
            {touched.category && errors.category && (
              <div className="flex items-center gap-1 mb-3 text-red-500 text-sm">
                <FiAlertCircle className="text-xs" />
                <span>{errors.category}</span>
              </div>
            )}
            
            {!showCustomCategory ? (
              <div className="flex flex-wrap gap-2">
                {defaultCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      if (cat === 'Others') {
                        setShowCustomCategory(true);
                        setFormData(prev => ({ ...prev, category: 'Others' }));
                      } else {
                        setFormData(prev => ({ ...prev, category: cat, customCategory: '' }));
                        setShowCustomCategory(false);
                      }
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: null }));
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      formData.category === cat && cat !== 'Others'
                        ? 'bg-gradient-to-r from-[#1B3766] to-[#142952] text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customCategory: e.target.value, category: 'Others' }));
                      if (errors.category && e.target.value.trim().length > 0) {
                        setErrors(prev => ({ ...prev, category: null }));
                      }
                    }}
                    onBlur={() => handleBlur('category')}
                    placeholder="Enter your custom category"
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowCustomCategory(false);
                      setFormData(prev => ({ ...prev, category: '', customCategory: '' }));
                    }}
                    className="px-4 py-2.5 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FiTag className="text-[#1B3766]" /> Tags
            </label>
            <input 
              type="text" 
              name="tags" 
              value={formData.tags} 
              onChange={handleChange}
              placeholder="Add up to 5 tags (e.g., technology, innovation, AI)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent" 
            />
            <p className="text-xs text-gray-400 mt-2">Separate tags with commas</p>
          </div>
        </div>

        {/* Status selector */}
        {!formData.comingSoon && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
            >
              <option value="draft">Draft - Only you can see it</option>
              <option value="published">Published - Visible to everyone</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">Published articles are visible to all readers. Subscribers will be notified.</p>
          </div>
        )}

        {/* Info note */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 flex items-start gap-2 mt-4">
          <FiInfo className="text-[#1B3766] mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-700">
            {formData.comingSoon 
              ? "Coming Soon mode hides the full content. Uncheck to edit and publish your complete article."
              : "Make sure your content is ready. Published articles will be visible to all subscribers immediately."}
          </p>
        </div>

        {/* Mobile update button */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-lg">
          <button 
            onClick={handleSubmit} 
            disabled={isUpdating}
            className="w-full py-4 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <FiLoader className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <FiSave />
                Update Article
              </>
            )}
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .prose {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #1f2937;
        }
        .prose p {
          margin-bottom: 1.75rem;
        }
        .prose ul, .prose ol {
          margin: 1.25rem 0;
          padding-left: 1.75rem;
        }
        .prose ul { 
          list-style-type: disc; 
        }
        .prose ol { 
          list-style-type: decimal; 
        }
        .prose li {
          margin: 0.5rem 0;
        }
        .prose h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 2.5rem 0 1.25rem;
          color: #111827;
        }
        .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          color: #1f2937;
        }
        .prose a {
          color: #1B3766;
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .prose a:hover {
          color: #142952;
        }
        .prose strong {
          font-weight: 700;
          color: #111827;
        }
        .prose em {
          font-style: italic;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #D1D5DB;
          font-weight: normal;
        }
        [contenteditable] {
          caret-color: #1B3766;
        }
        [contenteditable]:focus {
          outline: none;
        }
      `}</style>
      
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedEditArticle;