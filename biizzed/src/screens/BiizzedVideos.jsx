// screens/BiizzedVideos.jsx - YouTube Style UI with Hover Video Preview
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaSpinner, FaUser, FaClock, FaEye, FaFire,
  FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaShare, FaPlay, FaThumbsUp, FaFilter,
  FaYoutube, FaVideo, FaVolumeMute, FaVolumeUp,
} from 'react-icons/fa';
import { useGetVideosQuery, useLikeVideoMutation } from '../slices/videoApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const BiizzedVideos = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [likeVideo] = useLikeVideoMutation();
  const [activeCategory, setActiveCategory] = useState('All');
  const [videoTypeFilter, setVideoTypeFilter] = useState('all'); // 'all', 'youtube', 'uploaded'
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const videoRefs = useRef({});

  const { data: videosData, isLoading } = useGetVideosQuery({
    page: currentPage,
    limit: 12,
    category: activeCategory !== 'All' ? activeCategory : undefined,
    videoType: videoTypeFilter !== 'all' ? videoTypeFilter : undefined,
    sort: '-createdAt',
  });

  const videos = videosData?.videos || [];
  const totalPages = videosData?.pages || 1;

  // Expanded categories – now includes industry-specific ones
  const categories = [
    'All',
    'Education',
    'Business',
    'Technology',
    'News',
    'Entertainment',
    'Tutorial',
    'Interview',
    'Music',
    'Sports',
    'Agriculture',
    'Health',
    'Finance',
    'Science',
    'Lifestyle',
    'Gaming',
  ];

  const formatViews = (views) => {
    if (!views) return '0 views';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const videoDate = new Date(date);
    const diffMs = now - videoDate;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = async (videoId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) { toast.info('Login to like videos'); return; }
    try { await likeVideo(videoId).unwrap(); } catch { toast.error('Failed to like'); }
  };

  // Handle video hover - play preview
  const handleVideoHover = (videoId) => {
    if (hoveredVideoId === videoId) return;
    
    Object.keys(videoRefs.current).forEach((id) => {
      if (videoRefs.current[id] && id !== videoId) {
        const video = videoRefs.current[id];
        video.pause();
        video.currentTime = 0;
      }
    });
    
    setHoveredVideoId(videoId);
    
    const videoElement = videoRefs.current[videoId];
    if (videoElement && videoElement.readyState >= 2) {
      videoElement.currentTime = 0;
      videoElement.play().catch(err => console.log('Play failed:', err));
    }
  };

  const handleVideoLeave = (videoId) => {
    const videoElement = videoRefs.current[videoId];
    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0;
    }
    setHoveredVideoId(null);
  };

  const getThumbnail = (video) => {
    if (video.videoType === 'youtube') {
      return video.youtubeThumbnail || video.thumbnail;
    }
    return video.thumbnail;
  };

  const getVideoLink = (video) => {
    return `/videos/${video._id}`;
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-10 h-10 text-white animate-spin" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <BiizzedArticlesNavbar />
      
      <div className="max-w-[1400px] mx-auto px-4 py-4">
        {/* Category Pills + Video Type Filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-2 sticky top-[105px] z-30 bg-[#0f0f0f] py-2">
          {/* Video Type Filter: All / Clips / YouTube */}
          <div className="flex items-center gap-1 mr-2 border-r border-[#3f3f3f] pr-2">
            <button
              onClick={() => { setVideoTypeFilter('all'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                videoTypeFilter === 'all'
                  ? 'bg-white text-black'
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              <FaVideo className="text-[10px]" /> All
            </button>
            <button
              onClick={() => { setVideoTypeFilter('uploaded'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                videoTypeFilter === 'uploaded'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              <FaPlay className="text-[10px]" /> Clips
            </button>
            <button
              onClick={() => { setVideoTypeFilter('youtube'); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                videoTypeFilter === 'youtube'
                  ? 'bg-red-600 text-white'
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              <FaYoutube className="text-[10px]" /> YouTube
            </button>
          </div>

          {/* Category Filters */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Grid - YouTube Style */}
        {videos.length === 0 ? (
          <div className="text-center py-20">
            {videoTypeFilter === 'youtube' ? (
              <FaYoutube className="text-5xl text-gray-600 mx-auto mb-4" />
            ) : videoTypeFilter === 'uploaded' ? (
              <FaPlay className="text-5xl text-gray-600 mx-auto mb-4" />
            ) : (
              <FaPlay className="text-5xl text-gray-600 mx-auto mb-4" />
            )}
            <p className="text-gray-400 text-lg">No videos found</p>
            <p className="text-gray-500 text-sm mt-1">
              {videoTypeFilter !== 'all' 
                ? `Try a different filter or category` 
                : 'Try a different category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => {
              const isUploadedVideo = video.videoType !== 'youtube' && video.videoUrl;
              const isHovered = hoveredVideoId === video._id;
              
              return (
                <Link
                  key={video._id}
                  to={getVideoLink(video)}
                  className="group"
                >
                  {/* Thumbnail / Video Preview */}
                  <div 
                    className="relative aspect-video rounded-xl overflow-hidden bg-[#272727] mb-3 cursor-pointer"
                    onMouseEnter={() => isUploadedVideo && handleVideoHover(video._id)}
                    onMouseLeave={() => isUploadedVideo && handleVideoLeave(video._id)}
                  >
                    {/* Video element for preview (only for uploaded videos) */}
                    {isUploadedVideo && (
                      <video
                        ref={el => videoRefs.current[video._id] = el}
                        src={video.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop={false}
                        playsInline
                        preload="metadata"
                        style={{ display: isHovered ? 'block' : 'none' }}
                      />
                    )}
                    
                    {/* Thumbnail Image - hide when video is playing */}
                    {(!isUploadedVideo || !isHovered) && (
                      <img
                        src={getThumbnail(video)}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          if (video.videoType === 'youtube' && video.youtubeId) {
                            e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
                          }
                        }}
                      />
                    )}
                    
                    {/* Duration Badge - Only for uploaded videos */}
                    {video.videoType !== 'youtube' && formatDuration(video.duration) && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded font-medium z-10">
                        {formatDuration(video.duration)}
                      </div>
                    )}

                    {/* YouTube Badge */}
                    {video.videoType === 'youtube' && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-600/90 text-white text-xs rounded font-medium flex items-center gap-1 z-10">
                        <FaYoutube className="text-[10px]" /> YouTube
                      </div>
                    )}

                    {/* Hover Play/Pause Indicator */}
                    {isUploadedVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          {isHovered ? (
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-black border-b-[8px] border-b-transparent ml-0.5" />
                          ) : (
                            <FaPlay className="text-black text-lg ml-0.5" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Hover overlay for non-uploaded videos */}
                    {!isUploadedVideo && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <FaPlay className="text-black text-lg ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Watch Later / Save */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toast.info('Watch later feature coming soon');
                        }}
                        className="p-1.5 bg-black/80 rounded-full hover:bg-black"
                      >
                        <FaBookmark className="text-white text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Video Info */}
                  <div className="flex gap-3">
                    {/* Channel Avatar */}
                    <div className="flex-shrink-0">
                      {video.authorProfile ? (
                        <img src={video.authorProfile} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          video.videoType === 'youtube' ? 'bg-red-600/20' : 'bg-[#272727]'
                        }`}>
                          {video.videoType === 'youtube' ? (
                            <FaYoutube className="text-red-500 text-sm" />
                          ) : (
                            <FaUser className="text-white/60 text-sm" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Title & Meta */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug group-hover:text-gray-300">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 hover:text-white transition-colors flex items-center gap-1.5">
                        {video.authorName || 'Unknown Creator'}
                        {video.videoType === 'youtube' && (
                          <span className="inline-flex items-center gap-0.5 text-red-500">
                            <FaYoutube className="text-[10px]" />
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <span>{formatViews(video.views)}</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {totalPages > currentPage && (
          <div className="text-center mt-8 pb-8">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-6 py-2.5 border border-[#3f3f3f] text-white rounded-full text-sm font-medium hover:bg-[#272727] transition-colors"
            >
              Load More Videos
            </button>
          </div>
        )}
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

export default BiizzedVideos;