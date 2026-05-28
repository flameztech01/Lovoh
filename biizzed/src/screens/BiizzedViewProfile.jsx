// screens/BiizzedViewProfile.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaUser, FaNewspaper, FaBookOpen, FaVideo, FaHeart, FaBookmark,
  FaSpinner, FaArrowLeft, FaCheckCircle, FaUsers, FaCalendarAlt,
  FaUserPlus, FaUserCheck, FaClock, FaEye, FaTimes, FaExpand,
  FaCompress, FaDownload, FaShare, FaPlus, FaMinus, FaUndo,
} from "react-icons/fa";
import {
  useGetProfileByUsernameQuery,
  useGetUserPostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileInfoQuery,
} from "../slices/userApiSlice";
import BiizzedArticlesNavbar from "../components/BiizzedArticlesNavbar";
import BiizzedBottomBar from "../components/BiizzedBottomBar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// ====== IMAGE PREVIEW MODAL ======
const ImagePreviewModal = ({ image, title, onClose }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Get image dimensions on load
  useEffect(() => {
    if (imgRef.current) {
      const img = imgRef.current;
      const updateDimensions = () => {
        setImageDimensions({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      if (img.complete) {
        updateDimensions();
      } else {
        img.addEventListener('load', updateDimensions);
        return () => img.removeEventListener('load', updateDimensions);
      }
    }
  }, [image]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title || 'profile'}-image.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || 'Profile Image',
          text: `Check out ${title || 'this profile'} on Biizzed!`,
          url: image,
        });
      } else {
        await navigator.clipboard.writeText(image);
        toast.success('Image link copied!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to share image');
      }
    }
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      handleReset();
    } else {
      handleZoomIn();
    }
  };

  // Get image style
  const getImageStyle = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate base size (fit within viewport with padding)
    const maxWidth = viewportWidth - 80;
    const maxHeight = viewportHeight - 120;
    
    let displayWidth = imageDimensions.width;
    let displayHeight = imageDimensions.height;
    
    // Scale down if too large
    if (displayWidth > maxWidth) {
      const ratio = maxWidth / displayWidth;
      displayWidth = maxWidth;
      displayHeight = displayHeight * ratio;
    }
    if (displayHeight > maxHeight) {
      const ratio = maxHeight / displayHeight;
      displayHeight = maxHeight;
      displayWidth = displayWidth * ratio;
    }
    
    // Apply zoom
    displayWidth = displayWidth * scale;
    displayHeight = displayHeight * scale;
    
    return {
      width: `${displayWidth}px`,
      height: `${displayHeight}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
      cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      maxWidth: 'none',
      maxHeight: 'none',
    };
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar Controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          {/* Zoom Controls - Left */}
          <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all ${
                scale <= 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaMinus className="text-sm" />
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className={`w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all ${
                scale >= 4 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaPlus className="text-sm" />
            </button>
            <button
              onClick={handleReset}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <FaUndo className="text-sm" />
            </button>
          </div>

          {/* Title - Center */}
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-white text-sm font-medium">{title || 'Profile Image'}</p>
          </div>

          {/* Right Controls */}
          <div className="flex gap-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5">
            <button
              onClick={handleDownload}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <FaDownload className="text-sm" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <FaShare className="text-sm" />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div
          ref={containerRef}
          className="flex items-center justify-center overflow-hidden"
          style={{ width: '100%', height: '100%' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        >
          <img
            ref={imgRef}
            src={image}
            alt={title || "Profile"}
            style={getImageStyle()}
            className="object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Hint Text */}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-white/40 text-xs">
            {scale > 1 ? '🖱️ Click and drag to move • Double-click to reset' : '🖱️ Double-click to zoom • Use buttons to zoom in/out'}
          </p>
        </div>
      </div>
    </div>
  );
};

const BiizzedViewProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("articles");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Get current user's profile to check follow status
  const { data: currentUser, refetch: refetchCurrentUser } = useGetProfileInfoQuery(undefined, {
    skip: !userInfo,
  });

  // Get the viewed user's profile
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileByUsernameQuery(username, {
    skip: !username,
  });

  // Get user's posts
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetUserPostsQuery(
    { id: profileData?._id, type: activeTab, page: 1, limit: 50 },
    { skip: !profileData?._id }
  );

  // Follow/Unfollow mutations
  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();

  const user = profileData;
  const posts = postsData?.posts?.[activeTab]?.items || [];
  const totalPostsCount = user?.postsCount?.total || 0;

  // Check if current user is following this profile
  useEffect(() => {
    if (currentUser && user) {
      const isUserFollowing = currentUser.following?.some(
        (followed) => followed._id === user._id || followed === user._id
      );
      setIsFollowing(isUserFollowing || false);
      setFollowersCount(user.followersCount || 0);
    }
  }, [currentUser, user]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!userInfo) {
      toast.error("Please login to follow users");
      navigate("/login");
      return;
    }

    if (userInfo._id === user?._id) {
      toast.error("You cannot follow yourself");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(user._id).unwrap();
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        toast.success(`Unfollowed @${user.username}`);
      } else {
        await followUser(user._id).unwrap();
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success(`Following @${user.username}`);
      }
      refetchCurrentUser();
      refetchProfile();
    } catch (error) {
      toast.error(error?.data?.message || "Action failed");
    }
  };

  // Go back
  const handleGoBack = () => {
    navigate(-1);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-[#1B3766]" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (profileError || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-3xl text-red-500" />
          </div>
          <p className="text-gray-500 mb-2">User not found</p>
          <p className="text-sm text-gray-400 mb-4">@{username} doesn't exist or has been deleted</p>
          <button
            onClick={handleGoBack}
            className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm flex items-center gap-2"
          >
            <FaArrowLeft className="text-xs" /> Go Back
          </button>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const isOwnProfile = userInfo?._id === user._id;

  return (
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1B3766] mb-4 transition-colors group"
        >
          <FaArrowLeft className="text-sm group-hover:-translate-x-0.5 transition-transform" /> Back
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Cover/Header Area */}
          <div className="h-24 bg-gradient-to-r from-[#1B3766]/10 to-[#1B3766]/5"></div>

          {/* Profile Info Section */}
          <div className="px-6 pb-6 relative">
            {/* Avatar with badge - CLICKABLE FOR PREVIEW */}
            <div className="relative -mt-12 mb-4">
              <div className="relative inline-block group cursor-pointer">
                <div
                  onClick={() => user?.profile && setShowImagePreview(true)}
                  className="relative"
                >
                  {user?.profile ? (
                    <img
                      src={user.profile}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-xl">
                      {(user?.name || "U")[0].toUpperCase()}
                    </div>
                  )}
                  {/* Hover Overlay */}
                  {user?.profile && (
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                          <FaExpand className="text-[#1B3766] text-xs" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {user?.biizzed_contributor && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
                  {user?.biizzed_contributor && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <FaCheckCircle className="text-[10px]" /> Contributor
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">@{user?.username}</p>
                {user?.bio && (
                  <p className="text-sm text-gray-600 mt-2 max-w-lg">{user.bio}</p>
                )}
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading || isUnfollowLoading}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                      : "bg-[#1B3766] text-white hover:bg-[#142952]"
                  }`}
                >
                  {isFollowLoading || isUnfollowLoading ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : isFollowing ? (
                    <>
                      <FaUserCheck className="text-xs" /> Following
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="text-xs" /> Follow
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-8 mt-5 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{followersCount}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 justify-center">
                  <FaUsers className="text-[10px]" /> Subscribers
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{user?.followingCount || 0}</p>
                <p className="text-xs text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">{totalPostsCount}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-5">
          <div className="flex overflow-x-auto hide-scrollbar">
            {[
              { id: "articles", label: "Articles", icon: FaNewspaper, count: user?.postsCount?.articles || 0 },
              { id: "magazines", label: "Magazines", icon: FaBookOpen, count: user?.postsCount?.magazines || 0 },
              { id: "videos", label: "Videos", icon: FaVideo, count: user?.postsCount?.videos || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#1B3766] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-xs" />
                {tab.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Display */}
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-[#1B3766]" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === "articles" && <FaNewspaper className="text-2xl text-[#1B3766]" />}
              {activeTab === "magazines" && <FaBookOpen className="text-2xl text-[#1B3766]" />}
              {activeTab === "videos" && <FaVideo className="text-2xl text-[#1B3766]" />}
            </div>
            <p className="text-gray-500">
              No {activeTab} yet
              {activeTab === "articles" && " - check back later!"}
              {activeTab === "magazines" && " - check back later!"}
              {activeTab === "videos" && " - check back later!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={
                  activeTab === "articles"
                    ? `/articles/${post.slug}`
                    : activeTab === "magazines"
                    ? `/${post.slug}`
                    : `/videos/${post._id}`
                }
                className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all hover:border-gray-200"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <img
                    src={
                      post.featuredImage ||
                      post.coverImage ||
                      post.thumbnail ||
                      "/placeholder-article.jpg"
                    }
                    alt=""
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500">{post.category}</p>

                    {post.excerpt && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <FaHeart className="text-[10px]" /> {post.likesCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-[10px]" /> {post.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-[10px]" />{" "}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {post.status === "coming_soon" && (
                      <span className="inline-flex items-center gap-1 mt-2 text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                        <FaClock className="text-[8px]" /> Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && user?.profile && (
        <ImagePreviewModal
          image={user.profile}
          title={user.name}
          onClose={() => setShowImagePreview(false)}
        />
      )}

      <BiizzedBottomBar />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BiizzedViewProfile;