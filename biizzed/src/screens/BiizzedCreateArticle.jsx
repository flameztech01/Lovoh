// screens/BiizzedCreateArticle.jsx – Contributor-gated with proper status handling
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowLeft, FaSave, FaImage, FaTrashAlt,
  FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaListUl, FaListOl, FaLink, FaHeading, FaEye, FaQuoteRight,
  FaSpinner, FaTag, FaCamera, FaUserEdit, FaArrowRight, FaLock,
  FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle,
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
      e.preventDefault();      // keeps cursor in editor
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

  // Fetch contributor status (skip if not logged in)
  const { data: contribData, isLoading: contribLoading } = useGetContributorStatusQuery(undefined, {
    skip: !userInfo?._id,
  });

  // Determine contributor status
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

  const categories = ['Business', 'Technology', 'Startups', 'Leadership', 'Marketing', 'Finance', 'Lifestyle', 'Innovation'];

  // Track active formatting as the cursor moves
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      if (
        editorRef.current &&
        selection.rangeCount > 0 &&
        editorRef.current.contains(selection.anchorNode)
      ) {
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

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
      // Immediately reflect new active state
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
    }
  };

  const insertHeading = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      const h2 = document.createElement('h2');
      h2.style.fontSize = '20px';
      h2.style.fontWeight = 'bold';
      h2.style.marginBottom = '8px';
      h2.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(h2);
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
      blockquote.style.borderLeft = '3px solid #1B3766';
      blockquote.style.paddingLeft = '16px';
      blockquote.style.margin = '12px 0';
      blockquote.style.color = '#4B5563';
      blockquote.style.fontStyle = 'italic';
      blockquote.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(blockquote);
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
    if (!formData.title.trim()) { toast.error('Title is required'); return; }
    if (!content || content.replace(/<<[^>]*>/g, '').trim().length < 50) { toast.error('Content must be at least 50 characters'); return; }
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

  // If not logged in, show login prompt
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

  // If contributor status is loading, show spinner
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

  // If pending approval, show pending message
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
              You'll be notified once a decision is made. Thank you for your patience!
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Back to Profile
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // If rejected, show rejected message with reapply option
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
              <button
                onClick={() => navigate('/contributor/apply')}
                className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
              >
                Reapply
                <FaArrowRight className="text-sm" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // If not applied, show application prompt
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
            <button
              onClick={() => navigate('/contributor/apply')}
              className="w-full py-3 bg-[#1B3766] text-white rounded-xl font-semibold hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
            >
              Apply to Become a Contributor
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  // Approved contributor – show the full creation form
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
            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <FaCheckCircle className="text-[10px]" /> Contributor
            </div>
            <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-colors">
              {isLoading ? <><FaSpinner className="animate-spin" /> Publishing...</> : <><FaSave /> Publish Article</>}
            </button>
          </div>
        </div>

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
              <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={FaListUl} title="Bullets" active={activeFormats.insertUnorderedList} />
              <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={FaListOl} title="Numbers" active={activeFormats.insertOrderedList} />
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
              <div className="min-h-[300px] p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">No content yet. Start writing...</p>' }} />
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[300px] p-4 focus:outline-none text-gray-700 prose prose-sm max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
              />
            )}
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <FaImage className="text-[#1B3766]" /> Images ({images.length}/5)
            </h3>
            <p className="text-xs text-gray-500 mb-3 flex items-start gap-1.5">
              <FaInfoCircle className="mt-0.5 text-gray-400 shrink-0" />
              <span>
                Images will appear between paragraphs in your article. The <strong>first image</strong> will be used as the cover photo.
              </span>
            </p>
            {images.length < 5 && (
              <label className="block cursor-pointer mb-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1B3766] transition-colors">
                  <FaCamera className="text-xl text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Click to add images</p>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </div>
              </label>
            )}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt="" className="w-full h-28 object-cover rounded-lg border" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#1B3766] text-white text-[10px] font-medium rounded">
                        Cover
                      </span>
                    )}
                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaTrashAlt className="text-[10px]" />
                    </button>
                  </div>
                ))}
              </div>
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
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedCreateArticle;