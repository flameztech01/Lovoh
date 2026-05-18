// screens/BiizzedVideoDetail.jsx – With Auth Modal for login prompts
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaEye, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaShare, FaSpinner, FaComment, FaUser, FaReply, FaTrashAlt,
  FaLink, FaPlus, FaCheck, FaClock,
  FaYoutube, FaPlay, FaExternalLinkAlt, FaVolumeMute, FaVolumeUp,
  FaCheckCircle, FaUserCircle, FaAd, FaTimes,
} from 'react-icons/fa';
import {
  useGetVideoByIdQuery,
  useGetVideosQuery,
  useLikeVideoMutation,
  useAddVideoCommentMutation,
  useLikeVideoCommentMutation,
  useDeleteVideoCommentMutation,
} from '../slices/videoApiSlice';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileInfoQuery
} from '../slices/userApiSlice';
import { useGetAdsQuery, useTrackAdViewMutation, useTrackAdClickMutation } from '../slices/adsApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

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

const BiizzedVideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Pre‑roll ad
  const { data: adsData } = useGetAdsQuery({
    page: 'biizzed',
    placement: 'video-pre-roll',
    limit: 1,
    supportsVideo: true,
  });
  const [trackAdView] = useTrackAdViewMutation();
  const [trackAdClick] = useTrackAdClickMutation();
  const [showAd, setShowAd] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);
  const [adCanSkip, setAdCanSkip] = useState(false);
  const [adCountdown, setAdCountdown] = useState(10);
  const [adPlaying, setAdPlaying] = useState(false);
  const [adMuted, setAdMuted] = useState(false);
  const adVideoRef = useRef(null);
  const mainVideoRef = useRef(null);

  const preRollAd = adsData?.ads?.[0];

  // Reset ad when video changes
  useEffect(() => {
    setShowAd(!!preRollAd);
    setAdCompleted(false);
    setAdCanSkip(false);
    setAdCountdown(10);
    setAdPlaying(false);
  }, [preRollAd, id]);

  // Countdown for skip
  useEffect(() => {
    if (adPlaying && adCountdown > 0) {
      const timer = setTimeout(() => setAdCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (adCountdown === 0 && !adCompleted) {
      setAdCanSkip(true);
    }
  }, [adPlaying, adCountdown, adCompleted]);

  // Track ad view
  useEffect(() => {
    if (showAd && preRollAd && !adCompleted) {
      trackAdView(preRollAd._id).catch(err => console.error('Ad view track error:', err));
    }
  }, [showAd, preRollAd, adCompleted]);

  const handleAdClick = () => {
    if (!preRollAd) return;
    trackAdClick(preRollAd._id).catch(err => console.error('Ad click track error:', err));
    if (preRollAd.ctaLink) window.open(preRollAd.ctaLink, '_blank');
  };

  const handleSkipAd = () => {
    if (adCanSkip) {
      if (adVideoRef.current) adVideoRef.current.pause();
      setAdCompleted(true);
      setShowAd(false);
      if (mainVideoRef.current && !isYouTubePlaying) {
        mainVideoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      }
    }
  };

  const handleAdEnded = () => {
    setAdCompleted(true);
    setShowAd(false);
  };

  const handleAdPlay = () => setAdPlaying(true);
  const handleAdPause = () => setAdPlaying(false);

  // Video page state
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [isPortrait, setIsPortrait] = useState(false);
  const [localFollowing, setLocalFollowing] = useState(false);

  const { data: video, isLoading, error, refetch: refetchVideo } = useGetVideoByIdQuery(id);
  const { data: relatedData } = useGetVideosQuery({ limit: 6, sort: '-createdAt' }, { skip: !video });
  const relatedVideos = relatedData?.videos?.filter(v => v._id !== id)?.slice(0, 4) || [];

  const [likeVideo] = useLikeVideoMutation();
  const [addComment] = useAddVideoCommentMutation();
  const [likeComment] = useLikeVideoCommentMutation();
  const [deleteComment] = useDeleteVideoCommentMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { data: profileData, refetch: refetchProfile } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });

  const isFollowing = () => {
    if (!profileData?.following || !video?.user?._id) return false;
    return profileData.following.some(f => {
      const followId = typeof f === 'object' ? f._id : f;
      const authorId = typeof video.user === 'object' ? video.user._id : video.user;
      return followId?.toString() === authorId?.toString();
    });
  };

  const isOwnVideo = () => {
    const currentUserId = userInfo?._id?.toString();
    const authorId = video?.user?._id?.toString() || video?.user?.toString();
    return currentUserId === authorId;
  };

  // Auth‑guarded actions
  const requireAuth = () => {
    if (!userInfo) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsYouTubePlaying(false);
    setLocalFollowing(isFollowing());
  }, [id, profileData, video]);

  useEffect(() => {
    if (!isYouTube && video?.videoUrl) {
      const videoElement = document.createElement('video');
      videoElement.src = video.videoUrl;
      videoElement.addEventListener('loadedmetadata', () => {
        const { videoWidth, videoHeight } = videoElement;
        setVideoDimensions({ width: videoWidth, height: videoHeight });
        setIsPortrait(videoHeight > videoWidth);
      });
    }
  }, [video?.videoUrl]);

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

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isLiked = video?.likes?.includes(userInfo?._id);
  const isYouTube = video?.videoType === 'youtube';
  const isAdmin = video?.authorType === 'admin';
  const isOwn = isOwnVideo();
  const following = localFollowing;

  const handleLike = async () => {
    if (!requireAuth()) return;
    try { await likeVideo(id).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleFollowToggle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth()) return;
    const authorId = video?.user?._id?.toString() || video?.user?.toString();
    if (!authorId) return;
    try {
      if (following) {
        await unfollowUser(authorId).unwrap();
        setLocalFollowing(false);
        toast.info(`Unfollowed ${video?.authorName || 'creator'}`);
      } else {
        await followUser(authorId).unwrap();
        setLocalFollowing(true);
        toast.success(`Following ${video?.authorName || 'creator'}!`);
      }
      refetchProfile();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!commentText.trim()) return;
    try {
      await addComment({ id, text: commentText }).unwrap();
      setCommentText('');
      setReplyTo(null);
      refetchVideo();
    } catch { toast.error('Failed'); }
  };

  const handleLikeComment = async (commentId) => {
    if (!requireAuth()) return;
    try { await likeComment({ id, commentId }).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try { await deleteComment({ id, commentId }).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  const getRelatedThumbnail = (v) => {
    if (v.videoType === 'youtube') return v.youtubeThumbnail || v.thumbnail;
    return v.thumbnail;
  };

  const getVideoContainerClass = () => {
    if (isYouTube) return 'aspect-video';
    if (isPortrait) return 'max-w-[400px] mx-auto h-auto';
    return 'w-full';
  };

  const getVideoHeightClass = () => {
    if (isYouTube) return 'aspect-video';
    if (isPortrait) return 'h-[60vh] md:h-[70vh]';
    return 'aspect-video';
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

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Not Found</h1>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-[#1B3766] text-white rounded-xl">Go Back</button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const authorId = video?.user?._id?.toString() || video?.user?.toString();
  const authorName = video?.authorName || 'Creator';
  const authorProfile = video?.authorProfile;

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{video.title} | Biizzed</title>
        <meta name="description" content={video.description} />
        <meta property="og:title" content={video.title} />
        <meta property="og:image" content={isYouTube ? video.youtubeThumbnail : video.thumbnail} />
        <meta property="og:type" content="video" />
        <meta name="twitter:card" content="player" />
      </Helmet>

      <BiizzedArticlesNavbar />

      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex gap-6 px-4 py-6">

          {/* Main Content */}
          <main className="flex-1 max-w-[900px] mx-auto">

            {/* Video Player with Pre‑roll Ad */}
            <div className={`bg-black rounded-2xl overflow-hidden mb-4 ${getVideoContainerClass()}`}>
              <div className={getVideoHeightClass()}>
                {showAd && preRollAd && !adCompleted && (
                  <div className="relative w-full h-full z-20">
                    {preRollAd.mediaType === 'image' && preRollAd.image ? (
                      <div onClick={handleAdClick} className="cursor-pointer relative w-full h-full bg-black flex items-center justify-center">
                        <img src={preRollAd.image} alt="Ad" className="max-h-full max-w-full object-contain" />
                        <div className="absolute top-2 right-2 flex gap-2">
                          {adCanSkip ? (
                            <button onClick={handleSkipAd} className="bg-black/70 text-white text-xs px-3 py-1 rounded-full hover:bg-black/90">Skip Ad</button>
                          ) : (
                            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">Ad • {adCountdown}s</span>
                          )}
                        </div>
                      </div>
                    ) : (preRollAd.video && (preRollAd.mediaType === 'video' || preRollAd.mediaType === 'both')) ? (
                      <div className="relative w-full h-full">
                        <video
                          ref={adVideoRef}
                          src={preRollAd.video}
                          className="w-full h-full object-contain"
                          autoPlay
                          muted={adMuted}
                          playsInline
                          onPlay={handleAdPlay}
                          onPause={handleAdPause}
                          onEnded={handleAdEnded}
                        />
                        <button
                          onClick={() => setAdMuted(!adMuted)}
                          className="absolute bottom-2 left-2 bg-black/70 text-white p-1.5 rounded-full text-xs hover:bg-black/90"
                        >
                          {adMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                        </button>
                        <div className="absolute top-2 right-2 flex gap-2">
                          {adCanSkip ? (
                            <button onClick={handleSkipAd} className="bg-black/70 text-white text-xs px-3 py-1 rounded-full hover:bg-black/90">Skip Ad</button>
                          ) : (
                            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full">Ad • {adCountdown}s</span>
                          )}
                        </div>
                        <div onClick={handleAdClick} className="absolute inset-0 cursor-pointer z-10" style={{ pointerEvents: adCanSkip ? 'auto' : 'none' }} />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-white">Ad failed to load – skipping</span>
                        <button onClick={handleSkipAd} className="ml-4 bg-white text-black px-3 py-1 rounded">Skip</button>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: showAd && !adCompleted ? 'none' : 'block' }} className="w-full h-full">
                  {isYouTube ? (
                    !isYouTubePlaying ? (
                      <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsYouTubePlaying(true)}>
                        <img
                          src={video.youtubeThumbnail || video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <FaPlay className="text-white text-3xl ml-1.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                          <FaYoutube className="text-red-500" />
                          <span>Watch on YouTube</span>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                        title={video.title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : video.videoUrl ? (
                    <video
                      ref={mainVideoRef}
                      src={video.videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      poster={video.thumbnail}
                      autoPlay={!showAd || adCompleted}
                      controlsList="nodownload"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <p className="text-gray-400">Video unavailable</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Video Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {isYouTube && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                    <FaYoutube className="text-red-600" /> YouTube Video
                  </div>
                )}
                {isAdmin && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    <FaCheckCircle className="text-blue-600" /> Admin
                  </div>
                )}
                {isPortrait && !isYouTube && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    <FaPlay className="text-purple-600 text-[10px]" /> Shorts / Reel
                  </div>
                )}
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-3">{video.title}</h1>

              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatViews(video.views)}</span>
                  <span>•</span>
                  <span>{formatDate(video.createdAt)}</span>
                  {isYouTube && video.youtubeUrl && (
                    <>
                      <span>•</span>
                      <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 flex items-center gap-1">
                        <FaExternalLinkAlt className="text-[10px]" /> Watch on YouTube
                      </a>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleLike} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    {video.likes?.length || 0}
                  </button>
                  <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                    <FaShare /> Share
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link to={`/user/${authorId}`} className="flex items-center gap-3">
                  {authorProfile ? (
                    <img src={authorProfile} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-full text-white flex items-center justify-center text-lg font-bold ${isYouTube ? 'bg-red-600' : 'bg-red-500'}`}>
                      {authorName[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-gray-900 hover:underline">{authorName}</p>
                      {isAdmin && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                          <FaCheckCircle className="text-[8px]" /> Admin
                        </span>
                      )}
                      {isYouTube && (
                        <FaYoutube className="text-red-600 text-xs" title="YouTube Creator" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Creator</p>
                  </div>
                </Link>

                {userInfo && !isOwn && !isAdmin && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      following
                        ? 'bg-[#1B3766] text-white hover:bg-red-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {following ? <><FaCheck className="text-xs" /> Following</> : <><FaPlus className="text-xs" /> Follow</>}
                  </button>
                )}

                {isAdmin && !isOwn && userInfo && (
                  <div className="flex items-center gap-1 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-500">
                    <FaUserCircle className="text-sm" /> Platform Admin
                  </div>
                )}
              </div>

              {(video.description || isYouTube) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  {video.description ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{video.description}</p>
                  ) : isYouTube && (
                    <p className="text-sm text-gray-500 italic">
                      This is a YouTube video shared on Biizzed.
                      <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline ml-1">Watch on YouTube</a>
                    </p>
                  )}
                  {isYouTube && video.youtubeUrl && (
                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
                      <FaExternalLinkAlt className="text-[10px]" /> Open in YouTube
                    </a>
                  )}
                </div>
              )}

              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {video.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaComment className="text-[#1B3766]" /> Comments ({video.comments?.length || 0})
              </h3>

              {/* Comment input always visible, but submit triggers modal if not logged in */}
              <form onSubmit={handleAddComment} className="mb-6">
                {replyTo && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                    <FaReply /> Replying{' '}
                    <button type="button" onClick={() => setReplyTo(null)} className="text-red-500">Cancel</button>
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
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="mt-2 px-4 py-1.5 bg-[#1B3766] text-white rounded-full text-xs font-medium hover:bg-[#142952] disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </form>

              <div className="space-y-4">
                {video.comments?.map((comment) => {
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
                          <button onClick={() => handleLikeComment(comment._id)} className="hover:text-[#1B3766]">
                            {isCommentLiked ? 'Liked' : 'Like'}
                          </button>
                          {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                          <button onClick={() => { setReplyTo(comment._id); setCommentText(''); }} className="hover:text-[#1B3766]">
                            <FaReply className="inline text-[10px]" /> Reply
                          </button>
                          {(userInfo?._id === comment.user || userInfo?.role === 'admin') && (
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500">
                              <FaTrashAlt className="text-[10px]" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* Right Sidebar - Related Videos (unchanged) */}
          <aside className="hidden lg:block w-[320px] flex-shrink-0">
            <div className="sticky top-[120px] w-[320px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Videos</h3>
                <div className="space-y-3">
                  {relatedVideos.map((v) => {
                    const isRelatedYouTube = v.videoType === 'youtube';
                    const isRelatedAdmin = v.authorType === 'admin';
                    return (
                      <Link key={v._id} to={`/videos/${v._id}`} className="flex gap-3 group">
                        <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0">
                          {getRelatedThumbnail(v) ? (
                            <img
                              src={getRelatedThumbnail(v)}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (isRelatedYouTube && v.youtubeId) e.target.src = `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              {isRelatedYouTube ? <FaYoutube className="text-gray-600 text-2xl" /> : <FaPlay className="text-gray-600" />}
                            </div>
                          )}
                          {isRelatedYouTube ? (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-600/90 text-white text-[10px] rounded flex items-center gap-0.5">
                              <FaYoutube className="text-[8px]" /> YT
                            </div>
                          ) : v.duration ? (
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                              {formatDuration(v.duration)}
                            </div>
                          ) : null}
                          {isRelatedAdmin && (
                            <div className="absolute top-1 left-1 px-1 py-0.5 bg-blue-500/90 text-white text-[8px] rounded flex items-center gap-0.5">
                              <FaCheckCircle className="text-[6px]" /> Admin
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#1B3766]">{v.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                            {v.authorName || 'Creator'}
                            {isRelatedYouTube && <FaYoutube className="text-red-600 text-[8px]" />}
                            {isRelatedAdmin && <FaCheckCircle className="text-blue-500 text-[8px]" />}
                          </p>
                          <p className="text-[10px] text-gray-400">{formatViews(v.views)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <BiizzedBottomBar />
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

export default BiizzedVideoDetail;