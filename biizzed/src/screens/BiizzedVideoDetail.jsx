// screens/BiizzedVideoDetail.jsx – TikTok-style fullscreen scroll mode (Mobile Only)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaEye, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaShare, FaSpinner, FaComment, FaUser, FaReply, FaTrashAlt,
  FaLink, FaPlus, FaCheck, FaClock,
  FaYoutube, FaPlay, FaExternalLinkAlt, FaVolumeMute, FaVolumeUp,
  FaCheckCircle, FaUserCircle, FaAd, FaExpand, FaCompress,
  FaChevronDown, FaChevronUp, FaTimes, FaMobileAlt, FaHandPaper,
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

// ====== CONFIG ======
const WEBSITE_URL = 'https://biizzed.lovohcreate.com';

// ====== UTILS ======
const extractId = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (v._id) return v._id.toString();
    if (v.toString) return v.toString();
  }
  return String(v);
};

const BiizzedVideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ==================== TIKTOK MODE STATE ====================
  const [isTikTokMode, setIsTikTokMode] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [tikTokVideos, setTikTokVideos] = useState([]);
  const [currentTikTokIndex, setCurrentTikTokIndex] = useState(0);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null);
  const tikTokScrollRef = useRef(null);
  const videoItemRefs = useRef({});

  // ==================== PRE-ROLL AD STATE ====================
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

  // ==================== VIDEO DATA ====================
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [isPortrait, setIsPortrait] = useState(false);
  const [localFollowing, setLocalFollowing] = useState(false);

  const { data: video, isLoading, error, refetch: refetchVideo } = useGetVideoByIdQuery(id);
  const { data: relatedData } = useGetVideosQuery({ limit: 50, sort: '-createdAt' }, { skip: !video });
  const relatedVideos = relatedData?.videos?.filter(v => v._id !== id) || [];

  const [likeVideo] = useLikeVideoMutation();
  const [addComment] = useAddVideoCommentMutation();
  const [likeComment] = useLikeVideoCommentMutation();
  const [deleteComment] = useDeleteVideoCommentMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const { data: profileData, refetch: refetchProfile } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });

  // ==================== TIKTOK MODE SETUP ====================
  useEffect(() => {
    if (video && relatedVideos.length > 0) {
      const feed = [video, ...relatedVideos];
      setTikTokVideos(feed);
      setCurrentTikTokIndex(0);
    }
  }, [video, relatedData]);

  // Auto-hide swipe hint after 3 seconds
  useEffect(() => {
    if (isTikTokMode && showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTikTokMode, showSwipeHint]);

  // Intersection Observer for TikTok scroll snap
  useEffect(() => {
    if (!isTikTokMode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.index);
            setCurrentTikTokIndex(idx);
            setActiveCommentVideoId(tikTokVideos[idx]?._id);
            setShowAd(!!preRollAd);
            setAdCompleted(false);
            setAdCanSkip(false);
            setAdCountdown(10);
            setAdPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );

    Object.values(videoItemRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isTikTokMode, tikTokVideos, preRollAd]);

  // Pause/play videos based on visibility
  useEffect(() => {
    if (!isTikTokMode) return;

    Object.entries(videoItemRefs.current).forEach(([idx, el]) => {
      if (!el) return;
      const videoEl = el.querySelector('video');
      const iframeEl = el.querySelector('iframe');
      const index = Number(idx);

      if (index === currentTikTokIndex) {
        if (videoEl && !showAd) {
          videoEl.play().catch(() => {});
        }
      } else {
        if (videoEl) {
          videoEl.pause();
          videoEl.currentTime = 0;
        }
        if (iframeEl) {
          const src = iframeEl.src;
          iframeEl.src = '';
          setTimeout(() => { iframeEl.src = src; }, 50);
        }
      }
    });
  }, [isTikTokMode, currentTikTokIndex, showAd]);

  const scrollToVideo = useCallback((index) => {
    const el = videoItemRefs.current[index];
    if (el && tikTokScrollRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // ==================== HELPERS ====================
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
  
  // Get username for routing
  const getAuthorUsername = (v) => {
    return v?.user?.username || v?.authorUsername || extractId(v?.user?._id || v?.user);
  };

  // ==================== ACTIONS ====================
  const handleLike = async (videoId) => {
    const targetId = videoId || id;
    if (!userInfo) { toast.info('Login to like'); return; }
    try { await likeVideo(targetId).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleFollowToggle = async (e, targetVideo) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!userInfo) { toast.info('Login to follow'); return; }
    const authorId = targetVideo?.user?._id?.toString() || targetVideo?.user?.toString();
    if (!authorId) return;
    try {
      if (following) {
        await unfollowUser(authorId).unwrap();
        setLocalFollowing(false);
        toast.info(`Unfollowed ${targetVideo?.authorName || 'creator'}`);
      } else {
        await followUser(authorId).unwrap();
        setLocalFollowing(true);
        toast.success(`Following ${targetVideo?.authorName || 'creator'}!`);
      }
      refetchProfile();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed');
    }
  };

  const handleAddComment = async (e, videoId) => {
    e.preventDefault();
    const targetId = videoId || id;
    if (!userInfo) { toast.info('Login to comment'); return; }
    if (!commentText.trim()) return;
    try {
      await addComment({ id: targetId, text: commentText }).unwrap();
      setCommentText('');
      setReplyTo(null);
      refetchVideo();
    } catch { toast.error('Failed'); }
  };

  const handleLikeComment = async (commentId, videoId) => {
    const targetId = videoId || id;
    if (!userInfo) { toast.info('Login to like'); return; }
    try { await likeComment({ id: targetId, commentId }).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleDeleteComment = async (commentId, videoId) => {
    const targetId = videoId || id;
    if (!confirm('Delete this comment?')) return;
    try { await deleteComment({ id: targetId, commentId }).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };

  const handleShare = async (targetVideo) => {
    const v = targetVideo || video;
    const vid = v?._id || id;
    const url = `${WEBSITE_URL}/videos/${vid}`;
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: v?.title || video?.title,
        text: v?.title || video?.title,
        url: url,
      });
    } catch (err) {
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

  // ==================== TIKTOK VIDEO ITEM RENDERER ====================
  const renderTikTokVideoItem = (v, index) => {
    const isCurrentYouTube = v.videoType === 'youtube';
    const isCurrentAdmin = v.authorType === 'admin';
    const isCurrentLiked = v.likes?.includes(userInfo?._id);
    const currentAuthorId = v?.user?._id?.toString() || v?.user?.toString();
    const currentAuthorUsername = v?.user?.username || v?.authorUsername || currentAuthorId;
    const currentAuthorName = v?.authorName || 'Creator';
    const currentAuthorProfile = v?.authorProfile || v?.user?.profile;
    const currentIsOwn = userInfo?._id?.toString() === currentAuthorId;
    const currentIsFollowing = profileData?.following?.some(f => {
      const fid = typeof f === 'object' ? f._id : f;
      return fid?.toString() === currentAuthorId;
    });

    return (
      <div
        key={v._id}
        ref={(el) => { videoItemRefs.current[index] = el; }}
        data-index={index}
        className="relative w-full h-[100dvh] flex-shrink-0 snap-start snap-always overflow-hidden bg-black"
      >
        {/* Video Content */}
        <div className="absolute inset-0 w-full h-full">
          {isCurrentYouTube ? (
            index === currentTikTokIndex ? (
              <iframe
                src={`https://www.youtube.com/embed/${v.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={v.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                playsInline
              />
            ) : (
              <div className="w-full h-full relative cursor-pointer" onClick={() => scrollToVideo(index)}>
                <img
                  src={v.youtubeThumbnail || v.thumbnail}
                  alt={v.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                    <FaPlay className="text-white text-xl ml-1" />
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
                  <FaYoutube className="text-red-500" /> YouTube
                </div>
              </div>
            )
          ) : v.videoUrl ? (
            <video
              src={v.videoUrl}
              className="w-full h-full object-cover"
              poster={v.thumbnail}
              playsInline
              loop
              muted={index !== currentTikTokIndex}
              controls={false}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <p className="text-gray-400">Video unavailable</p>
            </div>
          )}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

        {/* YouTube Badge */}
        {isCurrentYouTube && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
            <FaYoutube /> YouTube
          </div>
        )}

        {/* Admin Badge */}
        {isCurrentAdmin && (
          <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 z-10">
            <FaCheckCircle className="text-[10px]" /> Admin
          </div>
        )}

        {/* Bottom Left: Info */}
        <div className="absolute bottom-24 left-4 right-20 z-10">
          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 drop-shadow-lg">
            {v.title}
          </h3>
          
          <Link 
            to={`/user/${currentAuthorUsername}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mb-3"
          >
            {currentAuthorProfile ? (
              <img src={currentAuthorProfile} alt="" className="w-8 h-8 rounded-full object-cover border border-white/30" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                {currentAuthorName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-white font-medium text-sm drop-shadow">{currentAuthorName}</p>
              <p className="text-white/70 text-xs">{formatViews(v.views)}</p>
            </div>
          </Link>

          {v.description && (
            <p className="text-white/80 text-sm line-clamp-2 drop-shadow mb-2">
              {v.description}
            </p>
          )}

          {/* Tags */}
          {v.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {v.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs text-white/70 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {isCurrentYouTube && v.youtubeUrl && (
            <a
              href={v.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-2 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              <FaExternalLinkAlt className="text-[10px]" /> Watch on YouTube
            </a>
          )}
        </div>

        {/* Right Side: Action Buttons (TikTok Style) */}
        <div className="absolute right-2 bottom-24 flex flex-col items-center gap-5 z-20">
          {/* Avatar with Follow */}
          <div className="relative mb-2">
            {currentAuthorProfile ? (
              <img 
                src={currentAuthorProfile} 
                alt="" 
                className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                onClick={(e) => { e.stopPropagation(); navigate(`/user/${currentAuthorUsername}`); }}
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center text-lg font-bold border-2 border-white/30"
                onClick={(e) => { e.stopPropagation(); navigate(`/user/${currentAuthorUsername}`); }}
              >
                {currentAuthorName[0]?.toUpperCase()}
              </div>
            )}
            {!currentIsOwn && userInfo && !isCurrentAdmin && (
              <button
                onClick={(e) => handleFollowToggle(e, v)}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#1B3766] rounded-full flex items-center justify-center border-2 border-black"
              >
                {currentIsFollowing ? <FaCheck className="text-white text-[10px]" /> : <FaPlus className="text-white text-[10px]" />}
              </button>
            )}
          </div>

          {/* Like */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleLike(v._id); }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
              {isCurrentLiked ? <FaHeart className="text-red-500 text-xl" /> : <FaRegHeart className="text-white text-xl" />}
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{v.likes?.length || 0}</span>
          </button>

          {/* Comments */}
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              setActiveCommentVideoId(v._id);
              setShowCommentsDrawer(true);
            }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
              <FaComment className="text-white text-xl" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">{v.comments?.length || 0}</span>
          </button>

          {/* Share */}
          <button 
            onClick={(e) => { e.stopPropagation(); handleShare(v); }}
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center group-active:scale-90 transition-transform">
              <FaShare className="text-white text-xl" />
            </div>
            <span className="text-white text-xs font-medium drop-shadow">Share</span>
          </button>
        </div>

        {/* Scroll Indicators */}
        {index > 0 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <FaChevronUp className="text-white/40 text-lg" />
          </div>
        )}
        {index < tikTokVideos.length - 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <FaChevronDown className="text-white/40 text-lg" />
          </div>
        )}
      </div>
    );
  };

  // ==================== COMMENTS DRAWER ====================
  const renderCommentsDrawer = () => {
    if (!showCommentsDrawer) return null;
    
    const activeVideo = tikTokVideos.find(v => v._id === activeCommentVideoId) || video;
    if (!activeVideo) return null;

    return (
      <div 
        className="fixed inset-0 z-[100] flex items-end"
        onClick={() => setShowCommentsDrawer(false)}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        <div 
          className="relative w-full bg-white rounded-t-3xl max-h-[70vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">
              Comments ({activeVideo.comments?.length || 0})
            </h3>
            <button 
              onClick={() => setShowCommentsDrawer(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <FaTimes className="text-gray-500 text-sm" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {activeVideo.comments?.length > 0 ? (
              activeVideo.comments.map((comment) => {
                const isCommentLiked = comment.likes?.includes(userInfo?._id);
                const commentUsername = comment.user?.username || comment.userName;
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
                        <Link to={`/user/${commentUsername || comment.user}`} className="text-sm font-semibold text-gray-900 hover:underline">
                          {comment.userName || 'User'}
                        </Link>
                        <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatRelativeDate(comment.createdAt)}</span>
                        <button onClick={() => handleLikeComment(comment._id, activeVideo._id)} className="hover:text-[#1B3766]">
                          {isCommentLiked ? 'Liked' : 'Like'}
                        </button>
                        {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
                        {(userInfo?._id === comment.user || userInfo?.role === 'admin') && (
                          <button onClick={() => handleDeleteComment(comment._id, activeVideo._id)} className="text-red-500">
                            <FaTrashAlt className="text-[10px]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FaComment className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
              </div>
            )}
          </div>

          {userInfo ? (
            <form onSubmit={(e) => handleAddComment(e, activeVideo._id)} className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                {userInfo?.profile ? (
                  <img src={userInfo.profile} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {(userInfo?.name || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-2 bg-[#1B3766] text-white rounded-xl text-xs font-medium hover:bg-[#142952] disabled:opacity-50"
                  >
                    Post
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="px-5 py-4 border-t border-gray-100 text-center">
              <Link to="/login" className="text-sm text-[#1B3766] font-medium hover:underline">Login to comment</Link>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==================== SWIPE HINT COMPONENT ====================
  const SwipeHint = () => {
    if (!showSwipeHint || !isTikTokMode) return null;
    
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-out" style={{ animationDelay: '2.5s', animationFillMode: 'forwards' }}>
        <div className="bg-white/10 rounded-2xl p-8 text-center backdrop-blur-sm">
          <div className="animate-bounce mb-4">
            <FaHandPaper className="text-white text-5xl mx-auto" />
          </div>
          <p className="text-white text-lg font-semibold mb-2">Tap & Swipe Up</p>
          <p className="text-white/70 text-sm">Scroll through videos like TikTok</p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
            <div className="w-2 h-2 rounded-full bg-white/50"></div>
            <div className="w-2 h-2 rounded-full bg-white/30"></div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== DESKTOP LOADING / ERROR ====================
  if (isLoading && !isTikTokMode) {
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

  if ((error || !video) && !isTikTokMode) {
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
  const authorUsername = video?.user?.username || video?.authorUsername || authorId;
  const authorName = video?.authorName || 'Creator';
  const authorProfile = video?.authorProfile || video?.user?.profile;

  // ==================== TIKTOK MODE RENDER (Mobile Only) ====================
  if (isTikTokMode && isMobile) {
    return (
      <div className="fixed inset-0 z-[90] bg-black overflow-hidden">
        <Helmet>
          <title>{video?.title || 'Biizzed Feed'} | Biizzed</title>
        </Helmet>

        {/* Close Button */}
        <button
          onClick={() => setIsTikTokMode(false)}
          className="absolute top-4 left-4 z-[95] w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <FaCompress className="text-lg" />
        </button>

        {/* Swipe Hint */}
        <SwipeHint />

        {/* Scrollable Feed */}
        <div 
          ref={tikTokScrollRef}
          className="h-full w-full overflow-y-auto snap-y snap-mandatory scroll-smooth"
          style={{ 
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {tikTokVideos.map((v, index) => renderTikTokVideoItem(v, index))}
        </div>

        {/* Comments Drawer */}
        {renderCommentsDrawer()}

        <style>{`
          .snap-y::-webkit-scrollbar { display: none; }
          @keyframes slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slide-up 0.3s ease-out;
          }
          @keyframes fade-out {
            from { opacity: 1; visibility: visible; }
            to { opacity: 0; visibility: hidden; }
          }
          .animate-fade-out {
            animation: fade-out 0.3s ease-in forwards;
          }
        `}</style>
      </div>
    );
  }

  // ==================== DESKTOP MODE RENDER ====================
  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>{video.title} | Biizzed</title>
        <meta name="description" content={video.description} />
        <meta property="og:title" content={video.title} />
        <meta property="og:image" content={isYouTube ? video.youtubeThumbnail : video.thumbnail} />
        <meta property="og:type" content="video" />
      </Helmet>

      <BiizzedArticlesNavbar />

      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex gap-6 px-4 py-6">

          {/* Main Content */}
          <main className="flex-1 max-w-[900px] mx-auto">

            {/* TikTok Mode Toggle - Mobile Only */}
            {isMobile && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setIsTikTokMode(true)}
                  className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-[#1B3766] to-[#142952] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <FaHandPaper className="text-sm animate-bounce" />
                    Tap to Scroll
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1B3766] to-[#1B3766]/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            )}

            {/* Video Player with Pre‑roll Ad */}
            <div className={`bg-black rounded-2xl overflow-hidden mb-4 ${getVideoContainerClass()}`}>
              <div className={getVideoHeightClass()}>
                {/* AD PLAYER */}
                {showAd && preRollAd && !adCompleted && (
                  <div className="relative w-full h-full z-20">
                    {preRollAd.mediaType === 'image' && preRollAd.image ? (
                      <div
                        onClick={handleAdClick}
                        className="cursor-pointer relative w-full h-full bg-black flex items-center justify-center"
                      >
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
                        <div
                          onClick={handleAdClick}
                          className="absolute inset-0 cursor-pointer z-10"
                          style={{ pointerEvents: adCanSkip ? 'auto' : 'none' }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-white">Ad failed to load – skipping</span>
                        <button onClick={handleSkipAd} className="ml-4 bg-white text-black px-3 py-1 rounded">Skip</button>
                      </div>
                    )}
                  </div>
                )}

                {/* MAIN VIDEO */}
                <div style={{ display: showAd && !adCompleted ? 'none' : 'block' }} className="w-full h-full">
                  {isYouTube ? (
                    !isYouTubePlaying ? (
                      <div
                        className="relative w-full h-full cursor-pointer group"
                        onClick={() => setIsYouTubePlaying(true)}
                      >
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
              {/* Badges */}
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
              </div>

              <h1 className="text-xl font-bold text-gray-900 mb-3">{video.title}</h1>

              {/* Stats & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatViews(video.views)}</span>
                  <span>•</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleLike()} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200">
                    {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                    {video.likes?.length || 0}
                  </button>
                  <button onClick={() => handleShare()} className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200">
                    <FaShare /> Share
                  </button>
                </div>
              </div>

              {/* Creator Info - Using username route */}
              <div className="flex items-center justify-between mt-4">
                <Link to={`/user/${authorUsername}`} className="flex items-center gap-3">
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
                    </div>
                    <p className="text-xs text-gray-500">@{authorUsername}</p>
                  </div>
                </Link>

                {userInfo && !isOwn && !isAdmin && (
                  <button
                    onClick={handleFollowToggle}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      following ? 'bg-[#1B3766] text-white hover:bg-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {following ? <><FaCheck className="text-xs" /> Following</> : <><FaPlus className="text-xs" /> Follow</>}
                  </button>
                )}
              </div>

              {/* Description */}
              {(video.description || isYouTube) && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  {video.description ? (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{video.description}</p>
                  ) : isYouTube && (
                    <p className="text-sm text-gray-500 italic">This is a YouTube video shared on Biizzed.</p>
                  )}
                  {isYouTube && video.youtubeUrl && (
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      <FaExternalLinkAlt className="text-[10px]" /> Open in YouTube
                    </a>
                  )}
                </div>
              )}

              {/* Tags */}
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

              {userInfo ? (
                <form onSubmit={(e) => handleAddComment(e)} className="mb-6">
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
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                  <p className="text-sm text-gray-500">Login to join the conversation</p>
                  <Link to="/login" className="text-xs text-[#1B3766] font-medium hover:underline mt-1 inline-block">Login now</Link>
                </div>
              )}

              <div className="space-y-4">
                {video.comments?.map((comment) => {
                  const isCommentLiked = comment.likes?.includes(userInfo?._id);
                  const commentUsername = comment.user?.username || comment.userName;
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
                          <Link to={`/user/${commentUsername || comment.user}`} className="text-sm font-semibold text-gray-900 hover:underline">
                            {comment.userName || 'User'}
                          </Link>
                          <p className="text-sm text-gray-700 mt-0.5">{comment.text}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>{formatRelativeDate(comment.createdAt)}</span>
                          <button onClick={() => handleLikeComment(comment._id)} className="hover:text-[#1B3766]">
                            {isCommentLiked ? 'Liked' : 'Like'}
                          </button>
                          {comment.likes?.length > 0 && <span>{comment.likes.length}</span>}
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

          {/* Right Sidebar - Related Videos */}
          <aside className="hidden lg:block w-[320px] flex-shrink-0">
            <div className="sticky top-[120px] w-[320px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Related Videos</h3>
                <div className="space-y-3">
                  {relatedVideos.slice(0, 4).map((v) => {
                    const relatedUsername = v?.user?.username || v?.authorUsername;
                    return (
                      <Link key={v._id} to={`/videos/${v._id}`} className="flex gap-3 group">
                        <div className="relative w-40 h-24 rounded-lg overflow-hidden bg-black flex-shrink-0">
                          {getRelatedThumbnail(v) ? (
                            <img src={getRelatedThumbnail(v)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-800">
                              {v.videoType === 'youtube' ? <FaYoutube className="text-gray-600 text-2xl" /> : <FaPlay className="text-gray-600" />}
                            </div>
                          )}
                          {v.videoType === 'youtube' && (
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-600/90 text-white text-[10px] rounded flex items-center gap-0.5">
                              <FaYoutube className="text-[8px]" /> YT
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 line-clamp-2 group-hover:text-[#1B3766]">{v.title}</p>
                          <p className="text-[10px] text-gray-500 mt-1">@{relatedUsername || 'creator'}</p>
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
      `}</style>
    </div>
  );
};

export default BiizzedVideoDetail;