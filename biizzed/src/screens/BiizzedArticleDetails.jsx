// screens/BiizzedArticleDetails.jsx - With Auth Modal & Modern Share (Web + Mobile)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaEye,
  FaTwitter, FaFacebookF, FaWhatsapp, FaLink,
  FaBookmark, FaRegBookmark, FaHeart, FaRegHeart,
  FaSpinner, FaRegComment, FaShare, FaUser, FaReply,
  FaTrashAlt, FaChevronUp, FaChevronDown,
  FaPaperPlane, FaCheck, FaPlus, FaCheckCircle,
  FaTimes,
} from 'react-icons/fa';
import {
  useGetArticleBySlugQuery,
  useGetArticlesQuery,
  useLikeArticleMutation,
  useBookmarkArticleMutation,
  useAddArticleCommentMutation,
  useLikeArticleCommentMutation,
  useDeleteArticleCommentMutation,
} from '../slices/articlesApiSlice';
import { useFollowUserMutation, useUnfollowUserMutation, useGetProfileInfoQuery } from '../slices/userApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// ====== CONFIG ======
const WEBSITE_URL = 'https://biizzed.lovohcreate.com';

// ====== UTILS ======
const toStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try { return v.toString(); } catch { return String(v); }
};

const extractId = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (v._id) return toStr(v._id);
    if (v.toString) return v.toString();
  }
  return toStr(v);
};

// ====== AUTH MODAL ======
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaUser className="text-[#1B3766] text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Join the Conversation</h3>
          <p className="text-sm text-gray-500 mt-1">Sign in to like, comment, and follow creators</p>
        </div>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-2.5 bg-[#1B3766] text-white rounded-xl text-center font-medium hover:bg-[#142952] transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to Biizzed's Terms of Service.
        </p>
      </div>
    </div>
  );
};

// ====== MODERN SHARE MODAL ======
const ShareModal = ({ isOpen, onClose, url, title }) => {
  if (!isOpen) return null;

  const handleNativeShare = async () => {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: title,
        text: title,
        url: url,
      });
    } catch (err) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied!');
      }
    }
    onClose();
  };

  const shareLinks = [
    { name: 'X (Twitter)', icon: FaTwitter, color: 'bg-black', shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { name: 'Facebook', icon: FaFacebookF, color: 'bg-[#1877F2]', shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'WhatsApp', icon: FaWhatsapp, color: 'bg-[#25D366]', shareUrl: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` },
    { name: 'Copy Link', icon: FaLink, color: 'bg-gray-600', onClick: async () => {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      } catch {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast.success('Link copied!');
      }
      onClose();
    }},
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Share this article</h3>
        
        {/* Native share button for mobile */}
        <button
          onClick={handleNativeShare}
          className="w-full mb-4 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors flex items-center justify-center gap-2"
        >
          <FaShare /> Share via App
        </button>

        <div className="flex justify-around">
          {shareLinks.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.shareUrl) {
                  window.open(item.shareUrl, '_blank');
                } else if (item.onClick) {
                  item.onClick();
                }
                onClose();
              }}
              className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all transform hover:scale-110`}
            >
              <item.icon className="text-xl" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BiizzedArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });
  
  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // Optimistic state
  const [optLikes, setOptLikes] = useState(null);
  const [optBookmark, setOptBookmark] = useState(null);
  const [optFollow, setOptFollow] = useState(null);

  const { data: article, isLoading, error, refetch } = useGetArticleBySlugQuery(slug);

  const [likeArticle] = useLikeArticleMutation();
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [addComment] = useAddArticleCommentMutation();
  const [likeComment] = useLikeArticleCommentMutation();
  const [deleteComment] = useDeleteArticleCommentMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const { data: relatedData } = useGetArticlesQuery(
    { category: article?.category, limit: 4, status: 'published' },
    { skip: !article }
  );

  const relatedArticles = relatedData?.articles?.filter(item => item.slug !== slug)?.slice(0, 3) || [];
  const coverImage = article?.featuredImage || article?.images?.[0];
  const images = article?.images || [];
  const additionalImages = images.slice(1);

  const authorId = extractId(article?.authorId?._id || article?.authorId || article?.createdBy);
  const authorUsername = article?.authorId?.username || article?.authorUsername || authorId;
  const authorName = article?.author || 'Editorial';
  const authorProfile = article?.authorId?.profile || null;
  const isOwn = myId && authorId ? myId === authorId : false;
  
  const isAdmin = () => {
    const at = article?.authorType;
    if (!at) return false;
    return String(at).toLowerCase().trim() === 'admin';
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRelativeDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diffMins = Math.floor((now - d) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Auth-guarded actions
  const requireAuth = (action) => {
    if (!userInfo) {
      setPendingAction(action);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    if (!requireAuth('like')) return;
    const cl = (article.likes || []).some(l => extractId(l) === myId);
    const cc = article.likesCount || (article.likes || []).length;
    setOptLikes({ liked: !cl, count: cc + (cl ? -1 : 1) });
    try { await likeArticle(article._id).unwrap(); refetch(); } 
    catch { setOptLikes(null); toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!requireAuth('bookmark')) return;
    const cb = (article.bookmarks || []).some(b => extractId(b) === myId);
    setOptBookmark(!cb);
    try { await bookmarkArticle(article._id).unwrap(); refetch(); } 
    catch { setOptBookmark(null); toast.error('Failed'); }
  };

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    if (!requireAuth('follow')) return;
    const cf = followingList.some(f => extractId(f) === authorId);
    setOptFollow(!cf);
    try {
      if (cf) { await unfollowUser(authorId).unwrap(); }
      else { await followUser(authorId).unwrap(); toast.success(`Following ${authorName}!`); }
      refetch();
    } catch (err) {
      setOptFollow(null);
      if (err?.data?.message?.includes('already')) setOptFollow(true);
      else toast.error('Failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!requireAuth('comment')) return;
    if (!commentText.trim()) return;
    try {
      await addComment({ id: article._id, text: commentText, parentCommentId: replyTo }).unwrap();
      setCommentText('');
      setReplyTo(null);
      refetch();
      toast.success('Comment added!');
    } catch { toast.error('Failed to add comment'); }
  };

  const handleLikeComment = async (commentId, replyId) => {
    if (!requireAuth('likeComment')) return;
    try { await likeComment({ id: article._id, commentId, replyId }).unwrap(); refetch(); } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId, replyId) => {
    if (!confirm('Delete this comment?')) return;
    try { await deleteComment({ id: article._id, commentId, replyId }).unwrap(); refetch(); toast.success('Comment deleted'); } catch { toast.error('Failed'); }
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Updated share — uses WEBSITE_URL, works on web + mobile
  const handleShare = (platform) => {
    const url = `${WEBSITE_URL}/articles/${slug}`;
    const title = article?.title || '';
    switch (platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
      case 'whatsapp': window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_blank'); break;
      case 'copy': 
        navigator.clipboard.writeText(url).then(() => toast.success('Link copied!')).catch(() => {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Link copied!');
        });
        break;
    }
  };

  // Get optimistic values
  const isLiked = optLikes ? optLikes.liked : (article?.likes || []).some(l => extractId(l) === myId);
  const likesCount = optLikes ? optLikes.count : (article?.likesCount || (article?.likes || []).length);
  const isBookmarked = optBookmark !== null ? optBookmark : (article?.bookmarks || []).some(b => extractId(b) === myId);
  const isFollowing = optFollow !== null ? optFollow : followingList.some(f => extractId(f) === authorId);

  const renderContentWithImages = () => {
    if (!article?.content) return null;
    let content = article.content;
    const hasHtmlTags = /<[a-z][\s\S]*?>/i.test(content);
    let paragraphs = [];

    if (hasHtmlTags) {
      const pMatches = content.match(/<<p[^>]*>([\s\S]*?)<<\/p>/gi);
      if (pMatches && pMatches.length > 1) {
        paragraphs = pMatches.map(match => match.replace(/<<p[^>]*>/i, '').replace(/<<\/p>/i, ''));
      } else {
        content = content.replace(/<<br\s*\/?>/gi, '\n').replace(/<<\/div>\s*<<div[^>]*>/gi, '\n\n');
        paragraphs = content.split(/\n\s*\n/);
      }
    } else {
      paragraphs = content.split(/\n\s*\n/);
    }

    const validParagraphs = paragraphs.filter(p => p.trim().length > 10);
    const totalParagraphs = validParagraphs.length;
    const imageCount = additionalImages.length;

    if (totalParagraphs === 0 || imageCount === 0) {
      return (
        <div className="text-gray-700 leading-8 space-y-5 text-[15px] sm:text-base"
          dangerouslySetInnerHTML={{ __html: article.content }} />
      );
    }

    const insertPositions = [];
    const step = totalParagraphs / (imageCount + 1);
    for (let i = 1; i <= imageCount; i++) {
      insertPositions.push(Math.min(Math.round(i * step), totalParagraphs - 1));
    }

    const elements = [];
    let imageIndex = 0;

    for (let i = 0; i < validParagraphs.length; i++) {
      elements.push(
        <div key={`para-${i}`} className="text-gray-700 leading-8 text-[15px] sm:text-base"
          dangerouslySetInnerHTML={{ __html: validParagraphs[i].trim() }} />
      );

      if (insertPositions.includes(i + 1) && imageIndex < additionalImages.length) {
        elements.push(
          <figure key={`image-${imageIndex}`} className="my-8">
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
              <img src={additionalImages[imageIndex]} alt={`${article.title}`} className="w-full h-auto object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            <figcaption className="text-xs text-gray-400 mt-2 text-center italic">{article.category} insights</figcaption>
          </figure>
        );
        imageIndex++;
      }
    }
    return elements;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-xl">Go Back</button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const shareUrl = `${WEBSITE_URL}/articles/${slug}`;

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{article.title} | Biizzed</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:image:secure_url" content={coverImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:site_name" content="Biizzed" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={coverImage} />
        <meta name="twitter:image:alt" content={article.title} />
      </Helmet>

      <BiizzedArticlesNavbar />
      
      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex gap-6 px-4 py-6">
          
          {/* Main Content */}
          <main className="flex-1 max-w-[720px] mx-auto lg:mx-0 pb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] mb-4 text-sm">
              <FaArrowLeft className="text-xs" /> Back
            </button>

            <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {coverImage && (
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img src={coverImage} alt={article.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-6">
                {/* Author Info with Follow - NOW CLICKABLE */}
                <div className="flex items-center gap-3 mb-4">
                  <Link to={`/user/${authorUsername}`} onClick={(e) => e.stopPropagation()}>
                    {authorProfile ? (
                      <img src={authorProfile} alt="" className="w-11 h-11 rounded-full object-cover cursor-pointer hover:opacity-80 transition" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:opacity-80 transition">
                        {authorName[0]?.toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link to={`/user/${authorUsername}`} className="text-sm font-semibold text-gray-900 truncate hover:text-[#1B3766] hover:underline transition">
                        {authorName}
                      </Link>
                      {isAdmin() && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                          <FaCheckCircle className="text-[8px]" /> Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{formatDate(article.publishedAt || article.createdAt)} · {article.readTime || '5 min read'}</p>
                  </div>
                  {!isOwn && authorId && !isAdmin() && (
                    <button onClick={handleFollowToggle} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      isFollowing ? 'bg-[#1B3766] text-white' : 'text-[#1B3766] border border-[#1B3766] hover:bg-[#1B3766] hover:text-white'
                    }`}>
                      {isFollowing ? <><FaCheck className="text-[8px]"/> Following</> : <><FaPlus className="text-[8px]"/> Follow</>}
                    </button>
                  )}
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{article.title}</h1>
                
                {article.excerpt && (
                  <p className="text-gray-600 text-sm mb-4 border-l-3 border-[#1B3766] pl-4 italic">{article.excerpt}</p>
                )}

                {/* Modern Action Bar */}
                <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 mb-6">
                  <div className="flex items-center gap-1">
                    <button onClick={handleLike} className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}>
                      {isLiked ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
                      <span className="text-[13px] font-medium">{likesCount}</span>
                    </button>

                    <button onClick={e => { e.preventDefault(); }} className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors">
                      <FaRegComment className="text-sm" />
                      <span className="text-[13px] font-medium">{article.comments?.length || 0}</span>
                    </button>

                    <div className="flex items-center gap-1.5 px-3 py-2 text-gray-500">
                      <FaEye className="text-sm" />
                      <span className="text-[13px] font-medium">{article.views || 0}</span>
                    </div>

                    {/* Share button - opens modern share modal */}
                    <button onClick={() => setShowShareModal(true)} className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors">
                      <FaShare className="text-sm" />
                    </button>

                    <button onClick={handleBookmark} className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${isBookmarked ? 'text-[#1B3766] bg-[#1B3766]/5' : 'text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5'}`}>
                      {isBookmarked ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
                    </button>
                  </div>

                  <span className="text-[11px] font-semibold text-[#1B3766] bg-[#1B3766]/5 px-2.5 py-1.5 rounded-full">Biizzed</span>
                </div>

                <div className="space-y-5 mb-6">
                  {renderContentWithImages()}
                </div>

                {article.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 pt-4 border-t border-gray-100">
                    {article.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Comments Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaRegComment className="text-[#1B3766]" /> Comments ({article.comments?.length || 0})
                  </h3>

                  <form onSubmit={handleAddComment} className="mb-6">
                    {replyTo && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                        <FaReply className="text-[10px]" /> Replying
                        <button type="button" onClick={() => setReplyTo(null)} className="text-red-500 hover:underline">Cancel</button>
                      </div>
                    )}
                    <div className="flex gap-3">
                      {userInfo?.profile ? (
                        <img src={userInfo.profile} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(userInfo?.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1">
                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                        <button type="submit" disabled={!commentText.trim()} className="mt-2 px-4 py-1.5 bg-[#1B3766] text-white rounded-full text-xs font-medium hover:bg-[#142952] disabled:opacity-50">Post</button>
                      </div>
                    </div>
                  </form>

                  <div className="space-y-4">
                    {article.comments?.map((comment) => {
                      const isCommentLiked = comment.likes?.includes(userInfo?._id);
                      const hasReplies = comment.replies?.length > 0;
                      const showReply = showReplies[comment._id];
                      const commentUsername = comment.user?.username || comment.userName;

                      return (
                        <div key={comment._id} className="flex gap-3">
                          <Link to={`/user/${commentUsername || comment.user}`}>
                            {comment.userProfile ? (
                              <img src={comment.userProfile} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5 hover:opacity-80 transition" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 hover:opacity-80 transition">
                                {(comment.userName || 'U')[0].toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                              <Link to={`/user/${commentUsername || comment.user}`} className="text-sm font-semibold text-gray-900 hover:text-[#1B3766] hover:underline transition">
                                {comment.userName || 'User'}
                              </Link>
                              <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>{formatRelativeDate(comment.createdAt)}</span>
                              <button onClick={() => handleLikeComment(comment._id)} className="hover:text-[#1B3766]">{isCommentLiked ? 'Liked' : 'Like'}</button>
                              {comment.likes?.length > 0 && <span>{comment.likes.length} likes</span>}
                              <button onClick={() => { setReplyTo(comment._id); setCommentText(''); }} className="hover:text-[#1B3766]"><FaReply className="inline text-[10px]" /> Reply</button>
                              {(userInfo?._id === comment.user || userInfo?.role === 'admin') && (
                                <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500 hover:text-red-600"><FaTrashAlt className="text-[10px]" /></button>
                              )}
                            </div>

                            {hasReplies && (
                              <div className="mt-2">
                                <button onClick={() => toggleReplies(comment._id)} className="flex items-center gap-1 text-xs font-medium text-[#1B3766] hover:underline">
                                  {showReply ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
                                  {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                                </button>
                                {showReply && (
                                  <div className="mt-2 ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
                                    {comment.replies.map((reply) => {
                                      const replyUsername = reply.user?.username || reply.userName;
                                      return (
                                        <div key={reply._id} className="flex gap-2">
                                          <Link to={`/user/${replyUsername || reply.user}`}>
                                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 hover:opacity-80 transition">
                                              {(reply.userName || 'U')[0].toUpperCase()}
                                            </div>
                                          </Link>
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2">
                                              <Link to={`/user/${replyUsername || reply.user}`} className="text-xs font-semibold text-gray-900 hover:text-[#1B3766] hover:underline transition">
                                                {reply.userName || 'User'}
                                              </Link>
                                              <p className="text-xs text-gray-700 mt-0.5">{reply.text}</p>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
                                              <span>{formatRelativeDate(reply.createdAt)}</span>
                                              <button onClick={() => handleLikeComment(comment._id, reply._id)}>Like</button>
                                              {(userInfo?._id === reply.user || userInfo?.role === 'admin') && (
                                                <button onClick={() => handleDeleteComment(comment._id, reply._id)} className="text-red-500">Delete</button>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </article>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden lg:block w-[320px] flex-shrink-0">
            <div className="fixed top-[120px] w-[320px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              {/* Share Section - Modern circular icons */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Share</h3>
                <div className="flex justify-around">
                  <button onClick={() => handleShare('twitter')} className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <FaTwitter className="text-lg" />
                  </button>
                  <button onClick={() => handleShare('facebook')} className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <FaFacebookF className="text-lg" />
                  </button>
                  <button onClick={() => handleShare('whatsapp')} className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <FaWhatsapp className="text-lg" />
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform">
                    <FaLink className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => {
                      const relatedAuthorId = extractId(related.authorId?._id || related.authorId);
                      const relatedAuthorUsername = related.authorId?.username || relatedAuthorId;
                      return (
                        <Link key={related._id} to={`/articles/${related.slug}`} className="flex gap-3 group">
                          <img 
                            src={related.featuredImage || related.images?.[0] || '/placeholder-article.jpg'} 
                            alt="" 
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
                            onError={(e) => { e.target.src = '/placeholder-article.jpg'; }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#1B3766] transition-colors">{related.title}</p>
                            <Link to={`/user/${relatedAuthorUsername}`} className="text-[10px] text-gray-500 hover:text-[#1B3766] hover:underline mt-1 inline-block">
                              By {related.author || 'Editorial'}
                            </Link>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Author Info - CLICKABLE */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                <Link to={`/user/${authorUsername}`}>
                  {authorProfile ? (
                    <img src={authorProfile} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2 hover:opacity-80 transition" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold mx-auto mb-2 hover:opacity-80 transition">
                      {authorName[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
                <Link to={`/user/${authorUsername}`} className="text-sm font-semibold text-gray-900 hover:text-[#1B3766] hover:underline transition">
                  {authorName}
                </Link>
                <p className="text-xs text-gray-500 mt-0.5">Author</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <ShareModal isOpen={showShareModal} onClose={() => setShowShareModal(false)} url={shareUrl} title={article.title} />

      <BiizzedBottomBar />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.28s ease-out; }
      `}</style>
    </div>
  );
};

export default BiizzedArticleDetails;