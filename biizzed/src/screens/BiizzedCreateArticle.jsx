// screens/BiizzedCreateArticle.jsx – Contributor-gated with dual image placement modes (Manual default)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft, FaSave, FaImage, FaTrashAlt,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaEye, FaQuoteRight,
  FaSpinner, FaTag, FaCamera, FaUserEdit, FaArrowRight, FaLock,
  FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaMagic,
  FaHandPointer, FaGripVertical, FaArrowUp, FaArrowDown,
} from 'react-icons/fa';
import { useCreateArticleMutation } from '../slices/articlesApiSlice';
import { useGetContributorStatusQuery } from '../slices/contributorApiSlice';
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

const BiizzedCreateArticle = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const { userInfo } = useSelector((state) => state.auth);
  const [createArticle, { isLoading }] = useCreateArticleMutation();

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

  const [formData, setFormData] = useState({
    title: '', excerpt: '', category: '', tags: '',
  });
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [activeFormats, setActiveFormats] = useState({});
  const [imagePlacementMode, setImagePlacementMode] = useState('manual'); // MANUAL IS NOW DEFAULT
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  // Track active formatting
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (
        editorRef.current &&
        selection.rangeCount > 0 &&
        editorRef.current.contains(selection.anchorNode)
      ) {
        const formatState = {
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          justifyLeft: document.queryCommandState('justifyLeft'),
          justifyCenter: document.queryCommandState('justifyCenter'),
          justifyRight: document.queryCommandState('justifyRight'),
          insertUnorderedList: document.queryCommandState('insertUnorderedList'),
          insertOrderedList: document.queryCommandState('insertOrderedList'),
        };
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

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && editorRef.current && editorRef.current.contains(selection.anchorNode)) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();
      preSelectionRange.selectNodeContents(editorRef.current);
      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      return preSelectionRange.toString().length;
    }
    return null;
  };

  // Restore cursor position
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

  // Insert image at cursor position (manual mode)
  const insertImageAtCursor = (imageUrl, imageIndex) => {
    if (!editorRef.current) {
      toast.error('Click in the editor first to place the image');
      return;
    }
    
    editorRef.current.focus();
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const savedPos = saveCursorPosition();
    
    // Create clean image container (NO CAPTION INPUT)
    const container = document.createElement('div');
    container.className = 'inserted-image-container my-4 relative group';
    container.setAttribute('contenteditable', 'false');
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'w-full max-w-2xl h-auto rounded-xl shadow-md mx-auto block';
    img.alt = `Article image ${imageIndex + 1}`;
    
    // Delete button only (no drag handle, no caption)
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10';
    deleteBtn.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('Remove this image from the article?')) {
        container.remove();
        setContent(editorRef.current.innerHTML);
        toast.info('Image removed from article');
      }
    };
    
    container.appendChild(img);
    container.appendChild(deleteBtn);
    
    range.insertNode(container);
    
    // Add a line break after image for better spacing
    const br = document.createElement('br');
    range.setStartAfter(container);
    range.insertNode(br);
    
    // Move cursor after the image
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
    
    setTimeout(() => restoreCursorPosition(savedPos), 10);
    toast.success(`Image inserted at cursor position`);
  };

  // Auto-distribute images between paragraphs
  const autoDistributeImages = (contentHtml, imageUrls) => {
    if (!contentHtml || imageUrls.length === 0) return contentHtml;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentHtml;
    
    const paragraphs = Array.from(tempDiv.querySelectorAll('p'));
    
    if (paragraphs.length === 0) {
      imageUrls.forEach((url, idx) => {
        const container = createSimpleImageContainer(url);
        tempDiv.appendChild(container);
      });
      return tempDiv.innerHTML;
    }
    
    const insertPositions = [];
    const step = paragraphs.length / (imageUrls.length + 1);
    for (let i = 1; i <= imageUrls.length; i++) {
      insertPositions.push(Math.min(Math.round(i * step) - 1, paragraphs.length - 1));
    }
    
    for (let i = insertPositions.length - 1; i >= 0; i--) {
      const pos = insertPositions[i];
      const paragraph = paragraphs[pos];
      const container = createSimpleImageContainer(imageUrls[i]);
      
      if (paragraph.nextSibling) {
        paragraph.parentNode.insertBefore(container, paragraph.nextSibling);
      } else {
        paragraph.parentNode.appendChild(container);
      }
    }
    
    return tempDiv.innerHTML;
  };

  const createSimpleImageContainer = (imageUrl) => {
    const container = document.createElement('div');
    container.className = 'image-container my-4';
    container.setAttribute('contenteditable', 'false');
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'w-full max-w-2xl h-auto rounded-xl shadow-md mx-auto block';
    img.alt = 'Article image';
    
    container.appendChild(img);
    return container;
  };

  // Simple execCommand that works
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    
    const savedPos = saveCursorPosition();
    editorRef.current.focus();
    document.execCommand(command, false, value);
    
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      // Update active formats
      setTimeout(() => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 5 - images.length;
    if (files.length > remainingSlots) {
      toast.error(`Max 5 images. You can add ${remainingSlots} more.`);
      return;
    }
    
    const newImages = [];
    const newPreviews = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
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
    
    if (imagePlacementMode === 'auto' && newPreviews.length > 0) {
      toast.info(`Added ${newPreviews.length} image(s). They will be auto-distributed.`);
    } else if (imagePlacementMode === 'manual' && newPreviews.length > 0) {
      toast.info(`Added ${newPreviews.length} image(s). Click on any image to insert it into the editor.`);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Drag and drop reordering
  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    setSelectedImageIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setSelectedImageIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (isNaN(sourceIndex)) return;
    
    if (sourceIndex === targetIndex) return;
    
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [movedImage] = newImages.splice(sourceIndex, 1);
    const [movedPreview] = newPreviews.splice(sourceIndex, 1);
    
    newImages.splice(targetIndex, 0, movedImage);
    newPreviews.splice(targetIndex, 0, movedPreview);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    toast.success('Image order updated. First image will be the cover photo.');
    setSelectedImageIndex(null);
    setDragOverIndex(null);
  };

  const moveImageUp = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    [newPreviews[index - 1], newPreviews[index]] = [newPreviews[index], newPreviews[index - 1]];
    setImages(newImages);
    setImagePreviews(newPreviews);
    toast.success('Image moved up');
  };

  const moveImageDown = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    [newPreviews[index + 1], newPreviews[index]] = [newPreviews[index], newPreviews[index + 1]];
    setImages(newImages);
    setImagePreviews(newPreviews);
    toast.success('Image moved down');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) { 
      toast.error('Title is required'); 
      return; 
    }
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content || '';
    const cleanText = tempDiv.textContent || tempDiv.innerText || '';
    
    if (!content || cleanText.trim().length < 20) { 
      toast.error('Content must be at least 20 characters'); 
      return; 
    }
    
    if (!formData.category) { 
      toast.error('Category is required'); 
      return; 
    }
    
    if (images.length === 0) {
      toast.error('At least one image is required');
      return;
    }

    let finalContent = content;
    
    if (imagePlacementMode === 'auto' && imagePreviews.length > 0 && content) {
      finalContent = autoDistributeImages(content, imagePreviews);
      toast.info('Images automatically distributed throughout your article');
    }

    const fd = new FormData();
    fd.append('title', formData.title.trim());
    fd.append('excerpt', formData.excerpt || formData.title.trim());
    fd.append('content', finalContent || '');
    fd.append('category', formData.category);
    fd.append('tags', formData.tags);
    fd.append('status', 'published');
    images.forEach(img => fd.append('images', img));

    try {
      await createArticle(fd).unwrap();
      toast.success('Article published!');
      navigate('/profile?tab=articles');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to publish');
    }
  };

  // If not logged in
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-3xl text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
            <p className="text-sm text-gray-500 mb-6">You need to log in to create articles.</p>
            <button
              onClick={() => navigate('/login?redirect=/create-article')}
              className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors"
            >
              Login to Continue
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // Contributor status checks
  if (contribLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#1B3766] mx-auto mb-4" />
            <p className="text-gray-500">Checking contributor status...</p>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaClock className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Pending</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your contributor application is currently being reviewed by our team.
              You'll be notified once a decision is made.
            </p>
            <button onClick={() => navigate('/profile')} className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Back to Profile
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaTimesCircle className="text-red-600 text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
            <p className="text-sm text-gray-500 mb-6">
              Unfortunately, your contributor application was not approved at this time.
              You can reapply after 30 days.
            </p>
            <div className="space-y-3">
              <button onClick={() => navigate('/contributor/apply')} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2">
                Reapply <FaArrowRight className="text-sm" />
              </button>
              <button onClick={() => navigate('/profile')} className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Back to Profile
              </button>
            </div>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (hasNotApplied) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserEdit className="text-[#1B3766] text-2xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Become a Contributor</h2>
            <p className="text-sm text-gray-500 mb-6">
              You need to be an approved Biizzed contributor to create articles. 
              Apply now to share your stories and insights with the community.
            </p>
            <button onClick={() => navigate('/contributor/apply')} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2">
              Apply to Become a Contributor <FaArrowRight className="text-sm" />
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // Approved contributor – show creation form
  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm group">
            <FaArrowLeft className="group-hover:-translate-x-0.5 transition-transform" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <FaCheckCircle className="text-[10px]" /> Contributor
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-colors">
              {isLoading ? <><FaSpinner className="animate-spin" /> Publishing...</> : <><FaSave /> Publish Article</>}
            </button>
          </div>
        </div>

        {/* Image Placement Mode Selector - Manual is default */}
        {showModeSelector && imagePreviews.length === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-6 border border-blue-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> How would you like to place your images?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <button
                type="button"
                onClick={() => { setImagePlacementMode('manual'); setShowModeSelector(false); }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${imagePlacementMode === 'manual' ? 'border-[#1B3766] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaHandPointer className="text-[#1B3766] text-lg" />
                  <span className="font-semibold text-gray-800">Manual Placement (Recommended)</span>
                </div>
                <p className="text-xs text-gray-500">Insert images exactly where you want them. Click on any image below to insert it at your cursor position.</p>
              </button>
              <button
                type="button"
                onClick={() => { setImagePlacementMode('auto'); setShowModeSelector(false); }}
                className={`p-4 rounded-xl border-2 transition-all text-left ${imagePlacementMode === 'auto' ? 'border-[#1B3766] bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FaMagic className="text-[#1B3766] text-lg" />
                  <span className="font-semibold text-gray-800">Auto Placement</span>
                </div>
                <p className="text-xs text-gray-500">Upload all images at once. They will be automatically distributed between paragraphs.</p>
              </button>
            </div>
          </div>
        )}

        {/* Mode Indicator */}
        {!showModeSelector && (
          <div className="flex items-center justify-between mb-4 p-2 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-2">
              {imagePlacementMode === 'auto' ? (
                <>
                  <FaMagic className="text-[#1B3766] text-sm" />
                  <span className="text-xs font-medium text-gray-700">Auto Mode: Images will be distributed automatically</span>
                </>
              ) : (
                <>
                  <FaHandPointer className="text-[#1B3766] text-sm" />
                  <span className="text-xs font-medium text-gray-700">Manual Mode: Click any image below to insert it at your cursor position</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowModeSelector(true)}
              className="text-xs text-[#1B3766] hover:underline"
            >
              Change Mode
            </button>
          </div>
        )}

        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          {/* Title */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <input
              type="text" name="title" value={formData.title} onChange={handleChange}
              placeholder="Article title..."
              className="w-full text-xl font-bold border-0 outline-none placeholder:text-gray-400 focus:ring-0"
            />
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <textarea
              name="excerpt" value={formData.excerpt} onChange={handleChange}
              placeholder="Brief excerpt or subtitle..."
              rows={2}
              className="w-full text-sm border-0 outline-none placeholder:text-gray-400 resize-none focus:ring-0"
            />
          </div>

          {/* Rich Text Editor */}
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
              />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Click here and start writing your article content..."
                className="min-h-[300px] p-4 focus:outline-none text-gray-700 prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
              />
            )}
          </div>

          {/* Instruction for manual mode */}
          {imagePlacementMode === 'manual' && !showModeSelector && imagePreviews.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
              <p className="text-xs text-blue-700 flex items-center justify-center gap-2">
                <FaHandPointer className="text-sm" />
                <span>Click on any image below to insert it at your cursor position in the editor</span>
              </p>
            </div>
          )}

          {/* Images Section with Drag & Drop */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> Images ({images.length}/5)
            </h3>
            <p className="text-xs text-gray-500 mb-3 flex items-start gap-1.5">
              <FaInfoCircle className="mt-0.5 text-gray-400 shrink-0" />
              <span>
                {imagePlacementMode === 'auto' 
                  ? 'Upload all images at once. They will be automatically placed between paragraphs.'
                  : 'Upload images, then click on any image to insert it at your cursor position in the editor. Drag to reorder.'}
                <strong className="block mt-1">⭐ The FIRST image will be used as the cover photo. Drag to reorder!</strong>
              </span>
            </p>

            {/* Image Gallery with Drag & Drop */}
            {imagePreviews.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                  <span>Uploaded images ({imagePreviews.length}/5)</span>
                  <span className="text-[10px] text-gray-400">Drag to reorder</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div
                      key={idx}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`relative group transition-all duration-200 ${
                        dragOverIndex === idx ? 'ring-2 ring-[#1B3766] ring-offset-2 scale-105' : ''
                      } ${selectedImageIndex === idx ? 'opacity-50' : ''}`}
                    >
                      <div className="relative">
                        <img 
                          src={preview} 
                          alt="" 
                          className={`w-full h-28 object-cover rounded-lg border-2 cursor-pointer transition-all hover:opacity-80 ${
                            imagePlacementMode === 'manual' ? 'hover:ring-2 hover:ring-[#1B3766]' : ''
                          } ${idx === 0 ? 'border-[#1B3766]' : 'border-gray-200'}`} 
                          onClick={() => {
                            if (imagePlacementMode === 'manual') {
                              insertImageAtCursor(preview, idx);
                            }
                          }}
                        />
                        
                        {/* Drag handle */}
                        <div className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                          <FaGripVertical className="w-3 h-3" />
                        </div>
                        
                        {/* Cover badge */}
                        {idx === 0 && (
                          <div className="absolute top-1 left-8 px-1.5 py-0.5 bg-[#1B3766] text-white text-[8px] font-medium rounded">
                            COVER
                          </div>
                        )}
                        
                        {/* Order number */}
                        <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded">
                          #{idx + 1}
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-1 right-1 flex gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImageUp(idx)}
                              className="w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
                              title="Move up"
                            >
                              <FaArrowUp className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImageDown(idx)}
                              className="w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-700"
                              title="Move down"
                            >
                              <FaArrowDown className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Delete"
                          >
                            <FaTrashAlt className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Insert instruction for manual mode */}
                      {imagePlacementMode === 'manual' && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center pointer-events-none">
                          <span className="text-white text-[10px] font-medium bg-black/60 px-2 py-1 rounded-full">
                            Click to Insert
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {imagePlacementMode === 'manual' && (
                  <div className="mt-3 text-center">
                    <p className="text-[10px] text-gray-400">
                      💡 Tip: Click on any image to insert it. Inserted images can be deleted by clicking the red button on the image.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Upload Button */}
            {images.length < 5 && (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1B3766] transition-colors">
                  <FaCamera className="text-xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Click to add {images.length === 0 ? 'images' : 'more images'}</p>
                  <p className="text-[9px] text-gray-400 mt-1">Max 5 images, up to 5MB each</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </div>
              </label>
            )}
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]">
                <option value="">Select a category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
              <label className="block text-xs font-semibold text-gray-500 mb-2"><FaTag className="inline mr-1" />Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="tech, business, innovation..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
            </div>
          </div>

          {/* Submit Button Mobile */}
          <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-medium hover:bg-[#142952] disabled:opacity-50 transition-colors lg:hidden">
            {isLoading ? <><FaSpinner className="animate-spin inline mr-2" /> Publishing...</> : <><FaSave className="inline mr-2" /> Publish Article</>}
          </button>
        </form>
      </div>
      
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
        .inserted-image-container {
          position: relative;
        }
      `}</style>
      
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedCreateArticle;