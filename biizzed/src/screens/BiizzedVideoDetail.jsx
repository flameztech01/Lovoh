// screens/BiizzedVideoDetail.jsx – with pre‑roll ad support
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  FaArrowLeft, FaEye, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaShare, FaSpinner, FaComment, FaUser, FaReply, FaTrashAlt,
  FaLink, FaPlus, FaCheck, FaClock,
  FaYoutube, FaPlay, FaExternalLinkAlt, FaVolumeMute, FaVolumeUp,
  FaCheckCircle, FaUserCircle, FaAd,
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

const BiizzedVideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  // Fetch ad for video pre‑roll placement
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
  
  // Reset ad state when video changes
  useEffect(() => {
    setShowAd(!!preRollAd);
    setAdCompleted(false);
    setAdCanSkip(false);
    setAdCountdown(10);
    setAdPlaying(false);
  }, [preRollAd, id]);
  
  // Start countdown when ad starts playing
  useEffect(() => {
    if (adPlaying && adCountdown > 0) {
      const timer = setTimeout(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (adCountdown === 0 && !adCompleted) {
      setAdCanSkip(true);
    }
  }, [adPlaying, adCountdown, adCompleted]);
  
  // Track ad view when shown
  useEffect(() => {
    if (showAd && preRollAd && !adCompleted) {
      trackAdView(preRollAd._id).catch(err => console.error('Ad view track error:', err));
    }
  }, [showAd, preRollAd, adCompleted]);
  
  const handleAdClick = () => {
    if (!preRollAd) return;
    trackAdClick(preRollAd._id).catch(err => console.error('Ad click track error:', err));
    if (preRollAd.ctaLink) {
      window.open(preRollAd.ctaLink, '_blank');
    }
  };
  
  const handleSkipAd = () => {
    if (adCanSkip) {
      if (adVideoRef.current) {
        adVideoRef.current.pause();
      }
      setAdCompleted(true);
      setShowAd(false);
      // Start main video if it was waiting
      if (mainVideoRef.current && !isYouTubePlaying) {
        mainVideoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      }
    }
  };
  
  const handleAdEnded = () => {
    setAdCompleted(true);
    setShowAd(false);
    // Auto‑skip when video ends
  };
  
  const handleAdPlay = () => setAdPlaying(true);
  const handleAdPause = () => setAdPlaying(false);
  
  // Existing state for video page
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showReplies, setShowReplies] = useState({});
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
  
  // Formatting functions (unchanged)
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
    if (!userInfo) { toast.info('Login to like'); return; }
    try { await likeVideo(id).unwrap(); refetchVideo(); } catch { toast.error('Failed'); }
  };
  
  const handleFollowToggle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!userInfo) { toast.info('Login to follow'); return; }
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
    if (!userInfo) { toast.info('Login to comment'); return; }
    if (!commentText.trim()) return;
    try {
      await addComment({ id, text: commentText }).unwrap();
      setCommentText('');
      setReplyTo(null);
      refetchVideo();
    } catch { toast.error('Failed'); }
  };
  
  const handleLikeComment = async (commentId) => {
    if (!userInfo) { toast.info('Login to like'); return; }
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
                {/* AD PLAYER (overlay on top of main video container) */}
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
                      // Fallback: no media, skip immediately
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-white">Ad failed to load – skipping</span>
                        <button onClick={handleSkipAd} className="ml-4 bg-white text-black px-3 py-1 rounded">Skip</button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* MAIN VIDEO (hidden when ad is active) */}
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
            
            {/* Rest of the page unchanged */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-4">
              {/* ... video info, creator, comments (keep as originally written) ... */}
              {/* To avoid clutter, I'm not copying the entire unchanged section, but you can keep your existing JSX from here down. */}
            </div>
          </main>
          
          {/* Right Sidebar – unchanged */}
          <aside className="hidden lg:block w-[320px] flex-shrink-0">
            {/* ... related videos ... */}
          </aside>
        </div>
      </div>
      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedVideoDetail;