// screens/BizzzedArticleDetails.jsx - Optimized with Modern Icons & Action Bar
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaEye,
  FaTwitter, FaFacebookF, FaLinkedinIn, FaLink,
  FaBookmark, FaRegBookmark, FaHeart, FaRegHeart,
  FaSpinner, FaRegComment, FaShare, FaUser, FaReply,
  FaTrashAlt, FaChevronUp, FaChevronDown,
  FaPaperPlane, FaCheck, FaPlus, FaCheckCircle,
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
import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import BizzzedBottomBar from '../components/BizzzedBottombar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

const BizzzedArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });
  
  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  
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
  const authorName = article?.author || 'Editorial';
  const authorProfile = article?.authorId?.profile || null;
  const isOwn = myId && authorId ? myId === authorId : false;
  
  // Admin check
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
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Optimistic handlers
  const handleLike = async () => {
    if (!myId) { toast.info('Login to like articles'); return; }
    const cl = (article.likes || []).some(l => extractId(l) === myId);
    const cc = article.likesCount || (article.likes || []).length;
    setOptLikes({ liked: !cl, count: cc + (cl ? -1 : 1) });
    try { await likeArticle(article._id).unwrap(); refetch(); } 
    catch { setOptLikes(null); toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!myId) { toast.info('Login to bookmark'); return; }
    const cb = (article.bookmarks || []).some(b => extractId(b) === myId);
    setOptBookmark(!cb);
    try { await bookmarkArticle(article._id).unwrap(); refetch(); } 
    catch { setOptBookmark(null); toast.error('Failed'); }
  };

  const handleFollowToggle = async (e) => {
    e.preventDefault();
    if (!myId) { toast.info('Login to follow'); return; }
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
    if (!myId) { toast.info('Login to comment'); return; }
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
    if (!myId) { toast.info('Login to like'); return; }
    try { await likeComment({ id: article._id, commentId, replyId }).unwrap(); refetch(); } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId, replyId) => {
    if (!confirm('Delete this comment?')) return;
    try { await deleteComment({ id: article._id, commentId, replyId }).unwrap(); refetch(); toast.success('Comment deleted'); } catch { toast.error('Failed'); }
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || '';
    switch (platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
      case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'copy': navigator.clipboard.writeText(url); toast.success('Link copied!'); break;
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
      const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
      if (pMatches && pMatches.length > 1) {
        paragraphs = pMatches.map(match => match.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, ''));
      } else {
        content = content.replace(/<br\s*\/?>/gi, '\n').replace(/<\/div>\s*<div[^>]*>/gi, '\n\n');
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
        <BizzzedArticlesNavbar />
        <div className="flex justify-center items-center h-64"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div>
        <BizzzedBottomBar />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BizzzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-xl">Go Back</button>
        </div>
        <BizzzedBottomBar />
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{article.title} | Bizzzed</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={coverImage} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        <meta name="twitter:image" content={coverImage} />
      </Helmet>

      <BizzzedArticlesNavbar />
      
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
                {/* Author Info with Follow */}
                <div className="flex items-center gap-3 mb-4">
                  {authorProfile ? (
                    <img src={authorProfile} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold">
                      {authorName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-900 truncate">{authorName}</p>
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
                  {/* Left side - Actions */}
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

                    <button onClick={() => handleShare('copy')} className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors">
                      <FaPaperPlane className="text-sm" />
                    </button>

                    <button onClick={handleBookmark} className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${isBookmarked ? 'text-[#1B3766] bg-[#1B3766]/5' : 'text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5'}`}>
                      {isBookmarked ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
                    </button>
                  </div>

                  {/* Right side - Brand */}
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

                  {userInfo ? (
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
                  ) : (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                      <p className="text-sm text-gray-500">Login to join the conversation</p>
                      <Link to="/biizzed/login" className="text-xs text-[#1B3766] font-medium hover:underline mt-1 inline-block">Login now</Link>
                    </div>
                  )}

                  <div className="space-y-4">
                    {article.comments?.map((comment) => {
                      const isCommentLiked = comment.likes?.includes(userInfo?._id);
                      const hasReplies = comment.replies?.length > 0;
                      const showReply = showReplies[comment._id];

                      return (
                        <div key={comment._id} className="flex gap-3">
                          {comment.userProfile ? (
                            <img src={comment.userProfile} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {(comment.userName || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                              <p className="text-sm font-semibold text-gray-900">{comment.userName || 'User'}</p>
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
                                    {comment.replies.map((reply) => (
                                      <div key={reply._id} className="flex gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{(reply.userName || 'U')[0].toUpperCase()}</div>
                                        <div className="flex-1 min-w-0">
                                          <div className="bg-gray-50 rounded-xl px-3 py-2">
                                            <p className="text-xs font-semibold text-gray-900">{reply.userName || 'User'}</p>
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
                                    ))}
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
              {/* Share Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Share</h3>
                <div className="flex gap-2">
                  <button onClick={() => handleShare('twitter')} className="flex-1 py-2 bg-[#1DA1F2] text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"><FaTwitter /> Tweet</button>
                  <button onClick={() => handleShare('facebook')} className="flex-1 py-2 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-1"><FaFacebookF /> Share</button>
                </div>
                <button onClick={() => handleShare('copy')} className="w-full mt-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1"><FaLink /> Copy Link</button>
              </div>

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedArticles.map((related) => (
                      <Link key={related._id} to={`/biizzed/articles/${related.slug}`} className="flex gap-3 group">
                        <img 
                          src={related.featuredImage || related.images?.[0] || '/placeholder-article.jpg'} 
                          alt="" 
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0" 
                          onError={(e) => { e.target.src = '/placeholder-article.jpg'; }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#1B3766] transition-colors">{related.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                            <span>{related.category}</span>
                            <span>•</span>
                            <span>{related.readTime || '5 min'}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
                {authorProfile ? (
                  <img src={authorProfile} alt="" className="w-14 h-14 rounded-full object-cover mx-auto mb-2" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold mx-auto mb-2">
                    {authorName[0]?.toUpperCase()}
                  </div>
                )}
                <p className="text-sm font-semibold text-gray-900">{authorName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Author</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BizzzedBottomBar />
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}`}</style>
    </div>
  );
};

export default BizzzedArticleDetails;