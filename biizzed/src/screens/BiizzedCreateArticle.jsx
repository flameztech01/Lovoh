// screens/BiizzedCreateArticle.jsx – Mobile-optimized premium design
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft, FiSave, FiImage, FiTrash2, FiBold, FiItalic, FiUnderline,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiList, FiLink, FiEye,
  FiLoader, FiTag, FiCamera, FiUser, FiLock, FiClock, FiCheckCircle,
  FiXCircle, FiInfo, FiMove, FiArrowUp, FiArrowDown, FiPlus, FiGrid,
  FiHash, FiAlertCircle,
} from 'react-icons/fi';
import { useCreateArticleMutation } from '../slices/articlesApiSlice';
import { useGetContributorStatusQuery } from '../slices/contributorApiSlice';
import { toast } from 'react-toastify';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';

const BiizzedCreateArticle = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const titleInputRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  const [createArticle, { isLoading }] = useCreateArticleMutation();

  const DRAFT_KEY = `article_draft_${userInfo?._id || 'anonymous'}`;
  
  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (Date.now() - draft.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return draft.data;
        }
      }
    } catch (e) {}
    return null;
  };

  const savedDraft = loadDraft();

  const [formData, setFormData] = useState({
    title: savedDraft?.title || '', 
    excerpt: savedDraft?.excerpt || '', 
    category: savedDraft?.category || '', 
    customCategory: savedDraft?.customCategory || '',
    tags: savedDraft?.tags || '',
  });
  const [content, setContent] = useState(savedDraft?.content || '');
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState(savedDraft?.images || []);
  const [imagePreviews, setImagePreviews] = useState(savedDraft?.imagePreviews || []);
  const [imagePlacementMode, setImagePlacementMode] = useState(savedDraft?.imagePlacementMode || 'manual');
  const [showModeSelector, setShowModeSelector] = useState(!savedDraft?.imagePlacementMode);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [activeFormats, setActiveFormats] = useState({
    bold: false, italic: false, underline: false,
    justifyLeft: true, justifyCenter: false, justifyRight: false,
    insertUnorderedList: false, insertOrderedList: false,
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  // Fetch contributor status
  const { data: contribData, isLoading: contribLoading } = useGetContributorStatusQuery(undefined, {
    skip: !userInfo?._id,
  });

  const isContributor = contribData?.data?.biizzed_contributor === true;
  const applicationStatus = contribData?.data?.contributor_application?.status || "not_applied";
  const isPending = applicationStatus === "pending";
  const isApproved = isContributor;
  const isRejected = applicationStatus === "rejected";
  const hasNotApplied = applicationStatus === "not_applied";

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

  // Update word count
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    }
  }, [content]);

  // Track active formatting states
  useEffect(() => {
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
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (!userInfo) return;
    
    const saveDraft = () => {
      const draftData = {
        title: formData.title,
        excerpt: formData.excerpt,
        category: formData.category,
        customCategory: formData.customCategory,
        tags: formData.tags,
        content: content,
        images: images,
        imagePreviews: imagePreviews,
        imagePlacementMode: imagePlacementMode,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setIsSaving(false);
    };
    
    setIsSaving(true);
    const timer = setTimeout(saveDraft, 800);
    return () => clearTimeout(timer);
  }, [formData, content, images, imagePreviews, imagePlacementMode, userInfo]);

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (formData.title || content || images.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData.title, content, images.length]);

  // Restore editor content
  useEffect(() => {
    if (editorRef.current && savedDraft?.content) {
      editorRef.current.innerHTML = savedDraft.content;
    }
  }, []);

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
        setErrors(prev => ({ ...prev, images: validateImages(images) }));
        break;
      default:
        break;
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
    if (!editorRef.current) return;
    const savedSelection = saveSelection();
    editorRef.current.focus();
    document.execCommand(command, false, value);
    setContent(editorRef.current.innerHTML);
    setTimeout(() => restoreSelection(savedSelection), 10);
  };

  const insertImageAtCursor = (imageUrl) => {
    if (!editorRef.current) {
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - images.length;
    if (files.length > remainingSlots) {
      toast.error(`Max 5 images. ${remainingSlots} left`);
      return;
    }
    
    const newImages = [];
    const newPreviews = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        continue;
      }
      newImages.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
          if (errors.images) {
            setErrors(prev => ({ ...prev, images: null }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
    setImages(prev => [...prev, ...newImages]);
    toast.success(`${newImages.length} image(s) added`);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  const moveImage = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === images.length - 1) return;
    
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    toast.success('Order updated');
  };

  const clearDraft = () => {
    if (confirm('Clear all draft work?')) {
      localStorage.removeItem(DRAFT_KEY);
      setFormData({ title: '', excerpt: '', category: '', customCategory: '', tags: '' });
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setErrors({});
      setTouched({});
      toast.info('Draft cleared');
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

  const handleSubmit = async () => {
    setTouched({ title: true, content: true, category: true, images: true });
    
    const finalCategory = getFinalCategory();
    const titleError = validateTitle(formData.title);
    const contentError = validateContent(content);
    const categoryError = validateCategory(formData.category, formData.customCategory);
    const imagesError = validateImages(images);
    
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
    fd.append('status', 'published');
    images.forEach(img => fd.append('images', img));

    try {
      await createArticle(fd).unwrap();
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Article published!');
      navigate('/profile?tab=articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to publish');
    }
  };

  // Loading states (simplified for mobile)
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#1B3766] to-[#142952] rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiLock className="text-2xl text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Sign in to write</h2>
            <p className="text-gray-500 text-xs mb-6">Join as a contributor</p>
            <button onClick={() => navigate('/login?redirect=/create-article')} className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-lg text-sm font-medium">
              Continue
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (contribLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <FiLoader className="animate-spin text-2xl text-[#1B3766]" />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiClock className="text-2xl text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold mb-1">Pending</h2>
            <p className="text-gray-500 text-xs mb-6">Application under review</p>
            <button onClick={() => navigate('/profile')} className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              Back
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiXCircle className="text-2xl text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-1">Not approved</h2>
            <p className="text-gray-500 text-xs mb-6">Reapply after 30 days</p>
            <button onClick={() => navigate('/contributor/apply')} className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-lg text-sm font-medium">
              Reapply
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (hasNotApplied) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FiUser className="text-2xl text-gray-600" />
            </div>
            <h2 className="text-xl font-bold mb-1">Become a contributor</h2>
            <p className="text-gray-500 text-xs mb-6">Apply to write for Biizzed</p>
            <button onClick={() => navigate('/contributor/apply')} className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-lg text-sm font-medium">
              Apply now
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />
      
      <div className="px-3 py-3 pb-28">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-50/95 backdrop-blur-sm py-2 z-20">
          <button onClick={() => navigate(-1)} className="text-gray-600">
            <FiArrowLeft className="text-lg" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 bg-white rounded-full shadow-sm">
              {isSaving ? (
                <FiLoader className="animate-spin text-xs text-[#1B3766]" />
              ) : (
                <FiCheckCircle className="text-xs text-green-500" />
              )}
              <span className="text-[10px] font-medium text-gray-500">{wordCount}</span>
            </div>
            
            <button onClick={clearDraft} className="text-xs text-gray-400 px-2 py-1">
              Clear
            </button>
            
            <button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="px-4 py-1.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-full text-xs font-medium flex items-center gap-1"
            >
              {isLoading ? <FiLoader className="animate-spin text-xs" /> : <FiSave className="text-xs" />}
              <span>Post</span>
            </button>
          </div>
        </div>

        {/* Mode selector - Compact */}
        {showModeSelector && imagePreviews.length === 0 && (
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
        {!showModeSelector && (
          <div className="mb-3 flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1">
              {imagePlacementMode === 'auto' ? (
                <FiGrid className="text-[#1B3766] text-xs" />
              ) : (
                <FiMove className="text-[#1B3766] text-xs" />
              )}
              <span className="text-[10px] text-gray-600">
                {imagePlacementMode === 'auto' ? 'Auto mode' : 'Tap image to insert'}
              </span>
            </div>
            <button onClick={() => setShowModeSelector(true)} className="text-[10px] text-[#1B3766] font-medium">
              Change
            </button>
          </div>
        )}

        {/* Title - Smaller font on mobile */}
        <div className="mb-3">
          <input
            ref={titleInputRef}
            type="text"
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              if (errors.title && e.target.value.trim().length >= 5) {
                setErrors(prev => ({ ...prev, title: null }));
              }
            }}
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
            value={formData.excerpt}
            onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
            placeholder="Excerpt..."
            rows={1}
            className="w-full text-gray-500 text-sm border-0 outline-none placeholder:text-gray-300 resize-none p-0 bg-transparent"
          />
        </div>

        {/* Compact Toolbar */}
        <div className="sticky top-12 bg-white rounded-xl border border-gray-100 p-1 mb-3 shadow-sm">
          <div className="flex flex-wrap gap-0.5">
            <button onMouseDown={(e) => { e.preventDefault(); formatText('bold'); }} className={`p-1.5 rounded-lg transition-all ${activeFormats.bold ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
              <FiBold className="text-sm" />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText('italic'); }} className={`p-1.5 rounded-lg transition-all ${activeFormats.italic ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
              <FiItalic className="text-sm" />
            </button>
            <button onMouseDown={(e) => { e.preventDefault(); formatText('underline'); }} className={`p-1.5 rounded-lg transition-all ${activeFormats.underline ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
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
            
            <button onMouseDown={(e) => { e.preventDefault(); 
              const url = prompt('Enter URL:', 'https://');
              if (url) formatText('createLink', url);
            }} className="p-1.5 rounded-lg text-gray-600">
              <FiLink className="text-sm" />
            </button>
            
            <button onMouseDown={(e) => { e.preventDefault(); setPreviewMode(!previewMode); }} className={`p-1.5 rounded-lg ml-auto ${previewMode ? 'bg-[#1B3766] text-white' : 'text-gray-600'}`}>
              <FiEye className="text-sm" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className={`bg-white rounded-xl p-3 shadow-sm min-h-[300px] ${touched.content && errors.content ? 'ring-1 ring-red-500' : ''}`}>
          {previewMode ? (
            <div className="prose prose-sm max-w-none text-sm">
              <div dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-300 text-sm">Start writing...</p>' }} />
            </div>
          ) : (
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Write your story..."
              className="focus:outline-none prose prose-sm max-w-none text-gray-700 leading-relaxed min-h-[280px] text-sm"
              onInput={(e) => {
                setContent(e.currentTarget.innerHTML);
                if (errors.content) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = e.currentTarget.innerHTML || '';
                  const cleanText = tempDiv.textContent || '';
                  if (cleanText.trim().length >= 50) {
                    setErrors(prev => ({ ...prev, content: null }));
                  }
                }
              }}
              onBlur={() => handleBlur('content')}
            />
          )}
          {touched.content && errors.content && (
            <div className="flex items-center gap-1 mt-2 text-red-500 text-[10px]">
              <FiAlertCircle className="text-[10px]" />
              <span>{errors.content}</span>
            </div>
          )}
        </div>

        {/* Images section - Compact grid */}
        <div className="mt-4 pt-3" data-images-section>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-1">
                <FiImage className="text-[#1B3766] text-xs" /> Images
              </h3>
              <p className="text-[10px] text-gray-400">{images.length}/5 • First is cover</p>
            </div>
            {imagePlacementMode === 'manual' && images.length > 0 && (
              <span className="text-[9px] text-[#1B3766] bg-blue-50 px-2 py-0.5 rounded-full">Tap to insert</span>
            )}
          </div>

          {errors.images && touched.images && (
            <div className="flex items-center gap-1 mb-2 text-red-500 text-[10px]">
              <FiAlertCircle className="text-[10px]" />
              <span>{errors.images}</span>
            </div>
          )}

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={preview} 
                    alt="" 
                    className="w-full aspect-square object-cover cursor-pointer"
                    onClick={() => imagePlacementMode === 'manual' && insertImageAtCursor(preview)}
                  />
                  
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white text-[8px] font-medium rounded shadow">
                      Cover
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <FiTrash2 className="w-2.5 h-2.5 text-white" />
                  </button>
                  
                  <div className="absolute bottom-1 left-1 flex gap-0.5">
                    {idx > 0 && (
                      <button onClick={() => moveImage(idx, 'up')} className="w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                        <FiArrowUp className="w-2.5 h-2.5 text-white" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button onClick={() => moveImage(idx, 'down')} className="w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                        <FiArrowDown className="w-2.5 h-2.5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <label className="block cursor-pointer">
              <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                errors.images && touched.images && images.length === 0
                  ? 'border-red-300 bg-red-50/30'
                  : 'border-gray-200 hover:border-[#1B3766]'
              }`}>
                <FiPlus className={`text-lg mx-auto mb-1 ${
                  errors.images && touched.images && images.length === 0
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`} />
                <p className="text-xs text-gray-500">Add images</p>
                <p className="text-[9px] text-gray-400 mt-0.5">PNG, JPG up to 5MB</p>
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
              value={formData.tags} 
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="tech, business, AI"
              className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm" 
            />
            <p className="text-[9px] text-gray-400 mt-1">Separate with commas</p>
          </div>
        </div>

        {/* Mobile publish button - Fixed bottom */}
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100 shadow-lg z-10">
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-xl font-medium flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? <FiLoader className="animate-spin text-sm" /> : <FiSave className="text-sm" />}
            Publish Article
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

export default BiizzedCreateArticle;