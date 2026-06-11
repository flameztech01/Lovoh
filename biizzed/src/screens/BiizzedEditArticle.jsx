// screens/BiizzedEditArticle.jsx – Mobile-optimized premium design
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

  const { data: article, isLoading, error } = useGetArticleByIdQuery(id);
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
    if (!title || title.trim().length === 0) return 'Title required';
    if (title.trim().length < 5) return 'Min 5 characters';
    return null;
  };

  const validateContent = (contentText) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentText || '';
    const cleanText = tempDiv.textContent || '';
    if (!contentText || cleanText.trim().length === 0) return 'Content required';
    if (cleanText.trim().length < 50) return 'Min 50 characters';
    return null;
  };

  const validateCategory = (category, customCategory) => {
    if (!category) return 'Category required';
    if (category === 'Others' && (!customCategory || customCategory.trim().length === 0)) {
      return 'Enter custom category';
    }
    return null;
  };

  const validateImages = () => {
    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) return 'At least one image required';
    return null;
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
      
      if (isCustomCategory) setShowCustomCategory(true);
      
      setContent(article.content || '');
      setExistingImages(article.images || []);
      setKeepImages(article.images || []);
      editorRef.current.innerHTML = article.content || '';
      setIsEditorInitialized(true);
    }
  }, [article, isEditorInitialized]);

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
        setErrors(prev => ({ ...prev, images: validateImages() }));
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
      toast.error('Tap in the editor first');
      return;
    }
    
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const savedSelection = saveSelection();
    
    const container = document.createElement('div');
    container.className = 'relative my-3 group';
    container.setAttribute('contenteditable', 'false');
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'w-full rounded-xl shadow-md';
    img.style.maxHeight = '300px';
    img.style.objectFit = 'cover';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'absolute top-2 right-2 w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10';
    deleteBtn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      container.remove();
      setContent(editorRef.current.innerHTML);
      toast.success('Image removed');
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
    toast.success('Image added');
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
    
    if (name === 'title' && errors.title) {
      setErrors(prev => ({ ...prev, title: null }));
    }
    if (name === 'category' && errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - (existingImages.length + newImages.length);
    if (files.length > remainingSlots) {
      toast.error(`Max 5 images. ${remainingSlots} left`);
      return;
    }
    
    const newImgs = [];
    const newPrevs = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} not an image`);
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
          toast.info(`${newImgs.length} image(s) added`);
          if (errors.images && (existingImages.length + newImgs.length) > 0) {
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
    
    if (existingImages.length === 1 && newImages.length === 0) {
      setErrors(prev => ({ ...prev, images: 'At least one image required' }));
    }
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
    
    if (existingImages.length === 0 && newImages.length === 1) {
      setErrors(prev => ({ ...prev, images: 'At least one image required' }));
    }
  };

  const handleSubmit = async () => {
    setTouched({ title: true, content: true, category: true, images: true });
    
    const finalCategory = getFinalCategory();
    const titleError = validateTitle(formData.title);
    const contentError = !formData.comingSoon ? validateContent(content) : null;
    const categoryError = validateCategory(formData.category, formData.customCategory);
    const imagesError = validateImages();
    
    setErrors({ title: titleError, content: contentError, category: categoryError, images: imagesError });
    
    if (titleError || contentError || categoryError || imagesError) {
      if (titleError) toast.error(titleError);
      else if (contentError) toast.error(contentError);
      else if (categoryError) toast.error(categoryError);
      else if (imagesError) toast.error(imagesError);
      scrollToError();
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
      await updateArticle({ id, data: fd }).unwrap();
      toast.success(formData.comingSoon ? 'Updated as "Coming Soon"!' : 'Article updated!');
      navigate('/profile?tab=articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="animate-spin text-2xl text-[#1B3766]" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="text-2xl text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-1">Not found</h2>
            <p className="text-gray-500 text-xs mb-6">Article doesn't exist or no permission</p>
            <button onClick={() => navigate('/profile?tab=articles')} className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-lg text-sm font-medium">
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
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />
      
      <div className="px-3 py-3 pb-28">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-20">
          <button onClick={() => navigate('/profile?tab=articles')} className="text-gray-600">
            <FiArrowLeft className="text-lg" />
          </button>
          
          <div className="flex items-center gap-2">
            {!formData.comingSoon && (
              <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-sm">
                <FiCheckCircle className="text-xs text-green-500" />
                <span className="text-[10px] font-medium text-gray-500">{wordCount}</span>
              </div>
            )}
            
            <button 
              onClick={handleSubmit} 
              disabled={isUpdating}
              className="px-4 py-1.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-full text-xs font-medium flex items-center gap-1"
            >
              {isUpdating ? <FiLoader className="animate-spin text-xs" /> : <FiSave className="text-xs" />}
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Coming Soon Toggle */}
        <div className="mb-3 bg-amber-50 rounded-xl p-3 border border-amber-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="comingSoon"
              checked={formData.comingSoon}
              onChange={handleChange}
              className="w-4 h-4 text-[#1B3766] rounded"
            />
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <FiClock className="text-[#1B3766] text-xs" />
                <span className="font-semibold text-gray-800 text-xs">Coming Soon</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-0.5">
                {formData.comingSoon ? "Content hidden until ready" : "Full content required (min 50 chars)"}
              </p>
            </div>
          </label>
        </div>

        {/* Mode selector */}
        {!formData.comingSoon && showModeSelector && newImagePreviews.length === 0 && (
          <div className="mb-3 p-1 bg-gray-100 rounded-xl inline-flex w-full">
            <button
              onClick={() => { setImagePlacementMode('manual'); setShowModeSelector(false); }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                imagePlacementMode === 'manual' ? 'bg-white shadow text-[#1B3766]' : 'text-gray-500'
              }`}
            >
              <FiMove className="inline mr-1 text-xs" /> Manual
            </button>
            <button
              onClick={() => { setImagePlacementMode('auto'); setShowModeSelector(false); }}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                imagePlacementMode === 'auto' ? 'bg-white shadow text-[#1B3766]' : 'text-gray-500'
              }`}
            >
              <FiGrid className="inline mr-1 text-xs" /> Auto
            </button>
          </div>
        )}

        {/* Mode indicator */}
        {!formData.comingSoon && !showModeSelector && newImagePreviews.length > 0 && (
          <div className="mb-3 flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1">
              <FiMove className="text-[#1B3766] text-xs" />
              <span className="text-[10px] text-gray-600">Tap new image to insert</span>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-3">
          <input
            ref={titleInputRef}
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={() => handleBlur('title')}
            placeholder="Title"
            className={`w-full text-2xl font-bold border-0 outline-none placeholder:text-gray-300 p-0 bg-transparent ${
              touched.title && errors.title ? 'text-red-500' : ''
            }`}
          />
          {touched.title && errors.title && (
            <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px]">
              <FiAlertCircle className="text-[10px]" />
              <span>{errors.title}</span>
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div className="mb-3">
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            placeholder="Excerpt..."
            rows={1}
            className="w-full text-gray-500 text-sm border-0 outline-none placeholder:text-gray-300 resize-none p-0 bg-transparent"
          />
        </div>

        {/* Toolbar */}
        {!formData.comingSoon && (
          <div className="sticky top-12 bg-white rounded-xl border border-gray-100 p-1 mb-3 shadow-sm">
            <div className="flex flex-wrap gap-0.5">
              <button onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }} className={`p-1.5 rounded-lg transition-all ${activeFormats.bold ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiBold className="text-sm" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }} className={`p-1.5 rounded-lg ${activeFormats.italic ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiItalic className="text-sm" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }} className={`p-1.5 rounded-lg ${activeFormats.underline ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiUnderline className="text-sm" />
              </button>
              
              <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
              
              <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyLeft'); }} className={`p-1.5 rounded-lg ${activeFormats.justifyLeft ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiAlignLeft className="text-sm" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyCenter'); }} className={`p-1.5 rounded-lg ${activeFormats.justifyCenter ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiAlignCenter className="text-sm" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); formatText('justifyRight'); }} className={`p-1.5 rounded-lg ${activeFormats.justifyRight ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiAlignRight className="text-sm" />
              </button>
              
              <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
              
              <button onMouseDown={(e) => { e.preventDefault(); formatText('insertUnorderedList'); }} className={`p-1.5 rounded-lg ${activeFormats.insertUnorderedList ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiList className="text-sm" />
              </button>
              <button onMouseDown={(e) => { e.preventDefault(); formatText('insertOrderedList'); }} className={`p-1.5 rounded-lg ${activeFormats.insertOrderedList ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiHash className="text-sm" />
              </button>
              
              <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />
              
              <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-1.5 rounded-lg text-gray-600">
                <FiLink className="text-sm" />
              </button>
              
              <button onMouseDown={(e) => { e.preventDefault(); setPreviewMode(!previewMode); }} className={`p-1.5 rounded-lg ml-auto ${previewMode ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
                <FiEye className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {/* Editor */}
        {!formData.comingSoon ? (
          previewMode ? (
            <div className="bg-white rounded-xl p-3 shadow-sm min-h-[300px]">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-300 text-sm">Start writing...</p>' }} />
            </div>
          ) : (
            <div className={`bg-white rounded-xl p-3 shadow-sm min-h-[300px] ${touched.content && errors.content ? 'ring-1 ring-red-500' : ''}`}>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Edit your story..."
                className="focus:outline-none prose prose-sm max-w-none text-gray-700 leading-relaxed min-h-[280px] text-sm"
                onInput={handleEditorInput}
                onBlur={() => handleBlur('content')}
              />
              {touched.content && errors.content && (
                <div className="flex items-center gap-1 mt-2 text-red-500 text-[10px]">
                  <FiAlertCircle className="text-[10px]" />
                  <span>{errors.content}</span>
                </div>
              )}
            </div>
          )
        ) : (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <FiClock className="text-2xl text-[#1B3766] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Content editing disabled</p>
            <p className="text-[10px] text-gray-400 mt-1">Uncheck "Coming Soon" to edit</p>
          </div>
        )}

        {/* Images Section */}
        <div className="mt-4 pt-3" data-images-section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <FiImage className="text-[#1B3766] text-xs" /> Images
              </h3>
              <p className="text-[10px] text-gray-400">{totalImages}/5 • First is cover</p>
            </div>
            {!formData.comingSoon && newImagePreviews.length > 0 && (
              <span className="text-[9px] text-[#1B3766] bg-blue-50 px-2 py-0.5 rounded-full">Tap to insert</span>
            )}
          </div>

          {errors.images && touched.images && (
            <div className="flex items-center gap-1 mb-2 text-red-500 text-[10px]">
              <FiAlertCircle className="text-[10px]" />
              <span>{errors.images}</span>
            </div>
          )}

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-medium text-gray-500 mb-1.5">Current</p>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100">
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                    {idx === 0 && (
                      <div className="absolute top-1 left-1 px-1 py-0.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white text-[8px] font-medium rounded shadow">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <FiTrash2 className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New images */}
          {newImagePreviews.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-medium text-gray-500 mb-1.5">New</p>
              <div className="grid grid-cols-3 gap-2">
                {newImagePreviews.map((preview, idx) => (
                  <div 
                    key={idx} 
                    className="relative group rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                    onClick={() => !formData.comingSoon && insertImageAtCursor(preview)}
                  >
                    <img src={preview} alt="" className="w-full aspect-square object-cover" />
                    {existingImages.length === 0 && idx === 0 && (
                      <div className="absolute top-1 left-1 px-1 py-0.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white text-[8px] font-medium rounded shadow">
                        Cover
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNewImage(idx); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <FiTrash2 className="w-2.5 h-2.5 text-white" />
                    </button>
                    {!formData.comingSoon && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-[8px] font-medium bg-black/60 px-1.5 py-0.5 rounded-full">
                          Insert
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add images */}
          {canAddMore && (
            <label className="block cursor-pointer">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 text-center hover:border-[#1B3766] transition-all">
                <FiPlus className="text-lg text-gray-400 mx-auto mb-0.5" />
                <p className="text-xs text-gray-500">Add images</p>
                <p className="text-[9px] text-gray-400">PNG, JPG up to 5MB</p>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              </div>
            </label>
          )}
        </div>

        {/* Category */}
        <div className="mt-4 space-y-3" data-category-section>
          <div className={`bg-white rounded-xl p-3 shadow-sm border ${touched.category && errors.category ? 'border-red-300' : 'border-gray-100'}`}>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <FiTag className="text-[#1B3766] text-xs" /> Category
            </label>
            
            {touched.category && errors.category && (
              <div className="flex items-center gap-1 mb-2 text-red-500 text-[10px]">
                <FiAlertCircle className="text-[10px]" />
                <span>{errors.category}</span>
              </div>
            )}
            
            {!showCustomCategory ? (
              <div className="flex flex-wrap gap-1.5">
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
                      if (errors.category) setErrors(prev => ({ ...prev, category: null }));
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-all ${
                      formData.category === cat && cat !== 'Others'
                        ? 'bg-gradient-to-r from-[#1B3766] to-[#142952] text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
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
                  placeholder="Custom category"
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowCustomCategory(false);
                    setFormData(prev => ({ ...prev, category: '', customCategory: '' }));
                  }}
                  className="px-3 py-1.5 text-xs text-gray-500"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <FiTag className="text-[#1B3766] text-xs" /> Tags
            </label>
            <input 
              type="text" 
              name="tags" 
              value={formData.tags} 
              onChange={handleChange}
              placeholder="tech, business, AI"
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
            />
            <p className="text-[9px] text-gray-400 mt-1">Separate with commas</p>
          </div>
        </div>

        {/* Status selector */}
        {!formData.comingSoon && (
          <div className="mt-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        )}

        {/* Info note */}
        <div className="mt-3 bg-blue-50 rounded-lg p-2 flex items-start gap-1.5">
          <FiInfo className="text-[#1B3766] text-xs mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-600">
            {formData.comingSoon 
              ? "Coming Soon hides content. Uncheck to edit full article."
              : "Published articles are visible to everyone immediately."}
          </p>
        </div>

        {/* Mobile update button */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-lg z-10">
          <button 
            onClick={handleSubmit} 
            disabled={isUpdating}
            className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm"
          >
            {isUpdating ? <FiLoader className="animate-spin text-sm" /> : <FiSave className="text-sm" />}
            Update Article
          </button>
        </div>
      </div>
      
      <style jsx>{`
        .prose-sm {
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .prose-sm p {
          margin-bottom: 0.75rem;
        }
        .prose-sm ul, .prose-sm ol {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }
        .prose-sm ul { list-style-type: disc; }
        .prose-sm ol { list-style-type: decimal; }
        .prose-sm li { margin: 0.2rem 0; }
        .prose-sm h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
        }
        .prose-sm a {
          color: #1B3766;
          text-decoration: underline;
        }
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #D1D5DB;
        }
        [contenteditable] {
          caret-color: #1B3766;
        }
      `}</style>
      
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedEditArticle;