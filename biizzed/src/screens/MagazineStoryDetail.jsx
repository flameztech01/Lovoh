// screens/MagazineStoryDetail.jsx – With Auth Modal for login prompts (comment input always visible)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaChevronLeft, FaChevronRight, FaDownload,
  FaSpinner, FaBookOpen, FaEye, FaUser, FaCalendarAlt,
  FaTwitter, FaFacebookF, FaLinkedinIn, FaLink, FaCheck,
  FaHeart, FaRegHeart, FaBookmark, FaRegBookmark, FaShare,
  FaComment, FaReply, FaTrashAlt, FaHourglassHalf, FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useGetMagazineBySlugQuery, useGetMagazinesQuery, useLikeMagazineMutation, useBookmarkMagazineMutation, useAddMagazineCommentMutation, useLikeMagazineCommentMutation, useDeleteMagazineCommentMutation } from '../slices/magApiSlice';
import { useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

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
          <p className="text-sm text-gray-500 mt-1">Sign in to like, bookmark, and comment</p>
        </div>
        <div className="space-y-3">
          <Link to="/login" className="block w-full py-2.5 bg-[#1B3766] text-white rounded-xl text-center font-medium hover:bg-[#142952] transition-colors">Login</Link>
          <Link to="/signup" className="block w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-50 transition-colors">Create Account</Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">By continuing, you agree to Biizzed's Terms of Service.</p>
      </div>
    </div>
  );
};

const MagazineStoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const mobileCanvasRef = useRef(null);

  const { data: magazine, isLoading, error, refetch } = useGetMagazineBySlugQuery(slug);
  const { data: otherMagazinesData } = useGetMagazinesQuery({ status: 'published,coming_soon', limit: 4 });
  const otherMagazines = otherMagazinesData?.magazines?.filter(m => m.slug !== slug)?.slice(0, 4) || [];

  const [likeMagazine] = useLikeMagazineMutation();
  const [bookmarkMagazine] = useBookmarkMagazineMutation();
  const [addComment] = useAddMagazineCommentMutation();
  const [likeComment] = useLikeMagazineCommentMutation();
  const [deleteComment] = useDeleteMagazineCommentMutation();

  const isComingSoon = magazine?.status === 'coming_soon' || magazine?.comingSoon === true;

  const requireAuth = () => {
    if (!userInfo) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  // ====== ALL useEffect HOOKS MUST BE HERE, BEFORE ANY CONDITIONAL RETURNS ======

  useEffect(() => {
    if (magazine?.pdfUrl && !pdfDoc && !isComingSoon) {
      setLoadingPdf(true);
      const loadPDF = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument(magazine.pdfUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setLoadingPdf(false);
        } catch { setLoadingPdf(false); }
      };
      loadPDF();
    }
  }, [magazine?.pdfUrl, isComingSoon]);

  useEffect(() => {
    if (pdfDoc && leftCanvasRef.current && rightCanvasRef.current && window.innerWidth >= 768 && !isComingSoon) {
      renderDesktopPages();
    }
  }, [pdfDoc, currentPage, isComingSoon]);

  useEffect(() => {
    if (pdfDoc && mobileCanvasRef.current && window.innerWidth < 768 && !isComingSoon) {
      renderMobilePage();
    }
  }, [pdfDoc, currentMobilePage, isComingSoon]);

  // 404 navigation — MUST be before any early return
  useEffect(() => {
    if ((error || !magazine) && !isLoading) {
      navigate('/not-found', { replace: true });
    }
  }, [error, magazine, isLoading, navigate]);

  const renderDesktopPages = async () => {
    const leftPageNum = currentPage + 1;
    const rightPageNum = currentPage + 2;
    if (leftPageNum <= totalPages) {
      const page = await pdfDoc.getPage(leftPageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = leftCanvasRef.current;
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    }
    if (rightPageNum <= totalPages) {
      const page = await pdfDoc.getPage(rightPageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = rightCanvasRef.current;
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    }
  };

  const renderMobilePage = async () => {
    const pageNum = currentMobilePage + 1;
    if (pageNum <= totalPages) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = mobileCanvasRef.current;
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatRelativeDate = (date) => {
    if (!date) return '';
    const now = new Date(); const d = new Date(date);
    const diffMins = Math.floor((now - d) / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isLiked = magazine?.likes?.includes(userInfo?._id);
  const isBookmarked = magazine?.bookmarks?.includes(userInfo?._id);

  const handleLike = async () => {
    if (!requireAuth()) return;
    try { await likeMagazine(magazine._id).unwrap(); refetch(); } catch { toast.error('Failed'); }
  };

  const handleBookmark = async () => {
    if (!requireAuth()) return;
    try { await bookmarkMagazine(magazine._id).unwrap(); refetch(); } catch { toast.error('Failed'); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!commentText.trim()) return;
    try {
      await addComment({ id: magazine._id, text: commentText, parentCommentId: replyTo }).unwrap();
      setCommentText(''); setReplyTo(null); refetch();
    } catch { toast.error('Failed'); }
  };

  const handleLikeComment = async (commentId) => {
    if (!requireAuth()) return;
    try { await likeComment({ id: magazine._id, commentId }).unwrap(); refetch(); } catch {}
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete?')) return;
    try { await deleteComment({ id: magazine._id, commentId }).unwrap(); refetch(); } catch {}
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = magazine?.title || '';
    switch (platform) {
      case 'twitter': window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`); break;
      case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`); break;
      case 'linkedin': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`); break;
      case 'copy': navigator.clipboard.writeText(url); setCopied(true); toast.success('Link copied!'); setTimeout(() => setCopied(false), 2000); break;
    }
  };

  const handleDownload = async () => {
    if (!magazine?.pdfUrl || isComingSoon) return;
    setDownloading(true);
    try {
      const response = await fetch(magazine.pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = `${magazine.title}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch { toast.error('Download failed'); }
    setDownloading(false);
  };

  // ====== CONDITIONAL RETURNS — ALL useEffect HOOKS ARE ABOVE THIS LINE ======

  if (isLoading) return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-center items-center h-96"><FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" /></div>
      <BiizzedBottomBar />
    </div>
  );

  // Navigation to /not-found already fired in useEffect above
  if (error || !magazine) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-[#1B3766] text-sm">
            <FaArrowLeft /> Back
          </button>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">{magazine.title}</span>
          {!isComingSoon && (
            <button onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1B3766] text-white rounded-full text-sm font-medium hover:bg-[#142952] disabled:opacity-70">
              {downloading ? <FaSpinner className="animate-spin text-xs" /> : <FaDownload className="text-xs" />}
              <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          )}
          {isComingSoon && <div className="w-20" />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Magazine Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
          <div className="flex gap-4">
            {magazine.coverImage ? (
              <img src={magazine.coverImage} alt="" className="w-20 h-28 rounded-xl object-cover shadow-md flex-shrink-0" />
            ) : (
              <div className="w-20 h-28 bg-gradient-to-br from-purple-600 to-indigo-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaBookOpen className="text-white text-2xl" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900 mb-1">{magazine.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                <span><FaUser className="inline mr-1" />{magazine.author || 'Editorial'}</span>
                <span><FaCalendarAlt className="inline mr-1" />{formatDate(magazine.createdAt)}</span>
                {!isComingSoon && <span><FaEye className="inline mr-1" />{magazine.views || 0} views</span>}
                {!isComingSoon && <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-medium">{totalPages} Pages</span>}
                {isComingSoon && <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-medium flex items-center gap-1"><FaHourglassHalf className="text-[10px]" /> Coming Soon</span>}
              </div>
              {/* Stats & Actions */}
              <div className="flex items-center gap-2">
                <button onClick={handleLike} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                  {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />} {magazine.likes?.length || 0}
                </button>
                <button onClick={handleBookmark} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                  {isBookmarked ? <FaBookmark className="text-[#1B3766]" /> : <FaRegBookmark />} Save
                </button>
                <button onClick={() => handleShare('copy')} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors">
                  <FaShare /> Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Hero Section */}
        {isComingSoon ? (
          <div className="relative bg-gradient-to-r from-[#1B3766] via-[#142952] to-[#1B3766] rounded-2xl shadow-xl overflow-hidden mb-4 min-h-[400px] flex flex-col items-center justify-center text-center p-8">
            <div className="overflow-hidden whitespace-nowrap w-full mb-8">
              <div className="animate-scrollRightToLeft text-3xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 inline-block">
                Coming Soon! Anticipate!!
              </div>
            </div>
            <FaHourglassHalf className="text-6xl sm:text-8xl text-white/20 mb-6 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Something Great is Coming</h2>
            <p className="text-white/80 max-w-md mx-auto text-sm sm:text-base">
              This magazine is not yet published. Stay tuned for exclusive insights, deep dives, and premium content.
            </p>
            <div className="mt-8 flex gap-3">
              <button onClick={handleBookmark} className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                <FaBookmark className="inline mr-2" /> Notify Me
              </button>
              <button onClick={() => handleShare('copy')} className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/20 transition-colors">
                <FaShare className="inline mr-2" /> Share
              </button>
            </div>
          </div>
        ) : (
          loadingPdf ? (
            <div className="bg-white rounded-2xl p-8 text-center mb-4">
              <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading magazine...</p>
            </div>
          ) : (
            <>
              {/* Desktop view */}
              <div className="hidden md:block bg-gradient-to-b from-[#f8f6f0] to-[#efe9df] rounded-2xl shadow-lg p-6 border border-gray-200 mb-4">
                <div className="flex gap-4 justify-center">
                  <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 flex items-center justify-center min-h-[500px]">
                      <canvas ref={leftCanvasRef} className="w-full h-auto rounded" />
                    </div>
                    <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 border-t">Page {currentPage + 1} of {totalPages}</div>
                  </div>
                  <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 flex items-center justify-center min-h-[500px]">
                      <canvas ref={rightCanvasRef} className="w-full h-auto rounded" />
                    </div>
                    <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 border-t">Page {currentPage + 2} of {totalPages}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <button onClick={() => currentPage > 0 && setCurrentPage(c => c - 2)}
                    disabled={currentPage === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm disabled:opacity-40">
                    <FaChevronLeft /> Previous
                  </button>
                  <span className="text-sm text-gray-500">{currentPage + 1}–{Math.min(currentPage + 2, totalPages)} of {totalPages}</span>
                  <button onClick={() => currentPage + 2 < totalPages && setCurrentPage(c => c + 2)}
                    disabled={currentPage + 2 >= totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1B3766] text-white rounded-full text-sm disabled:opacity-40">
                    Next <FaChevronRight />
                  </button>
                </div>
              </div>
              {/* Mobile view */}
              <div className="md:hidden bg-gradient-to-b from-[#f8f6f0] to-[#efe9df] rounded-2xl shadow-lg p-4 border border-gray-200 mb-4">
                <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[400px] flex items-center justify-center">
                  <canvas ref={mobileCanvasRef} className="w-full h-auto" />
                </div>
                <div className="text-center py-2 text-sm text-gray-600">Page {currentMobilePage + 1} of {totalPages}</div>
                <div className="flex justify-between gap-3 mt-3">
                  <button onClick={() => currentMobilePage > 0 && setCurrentMobilePage(p => p - 1)}
                    disabled={currentMobilePage === 0}
                    className="flex-1 py-2.5 bg-white border border-gray-200 rounded-full text-sm disabled:opacity-40">
                    <FaChevronLeft className="inline mr-1" /> Prev
                  </button>
                  <button onClick={() => currentMobilePage < totalPages - 1 && setCurrentMobilePage(p => p + 1)}
                    disabled={currentMobilePage >= totalPages - 1}
                    className="flex-1 py-2.5 bg-[#1B3766] text-white rounded-full text-sm disabled:opacity-40">
                    Next <FaChevronRight className="inline ml-1" />
                  </button>
                </div>
              </div>
            </>
          )
        )}

        {/* Summary */}
        {magazine.summary && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">About This Edition</h3>
            <p className="text-sm text-gray-600">{magazine.summary}</p>
            {magazine.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {magazine.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaComment className="text-[#1B3766]" /> Comments ({magazine.comments?.length || 0})
          </h3>

          <form onSubmit={handleAddComment} className="mb-6">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                <FaReply /> Replying <button type="button" onClick={() => setReplyTo(null)} className="text-red-500">Cancel</button>
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
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..." className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]" />
                <button type="submit" disabled={!commentText.trim()} className="mt-2 px-4 py-1.5 bg-[#1B3766] text-white rounded-full text-xs font-medium hover:bg-[#142952] disabled:opacity-50">Post</button>
              </div>
            </div>
          </form>

          <div className="space-y-4">
            {magazine.comments?.map((comment) => {
              const isCommentLiked = comment.likes?.includes(userInfo?._id);
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
                      {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                      <button onClick={() => { setReplyTo(comment._id); setCommentText(''); }} className="hover:text-[#1B3766]"><FaReply className="inline text-[10px]" /> Reply</button>
                      {(userInfo?._id === comment.user || userInfo?.role === 'admin') && (
                        <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500"><FaTrashAlt className="text-[10px]" /></button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Related Magazines */}
        {otherMagazines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">More Magazines</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {otherMagazines.map((mag) => (
                <Link key={mag._id} to={`/${mag.slug}`} className="group">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-2 relative">
                    {mag.coverImage ? (
                      <img src={mag.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center">
                        <FaBookOpen className="text-white text-2xl" />
                      </div>
                    )}
                    {mag.status === 'coming_soon' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="px-2 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full">Coming Soon</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#1B3766]">{mag.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <BiizzedBottomBar />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <style>{`
        @keyframes scrollRightToLeft {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-scrollRightToLeft {
          animation: scrollRightToLeft 12s linear infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.28s ease-out; }
      `}</style>
    </div>
  );
};

export default MagazineStoryDetail;