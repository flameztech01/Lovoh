// screens/BiizzedViewProfile.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaUser, FaNewspaper, FaBookOpen, FaVideo, FaHeart, FaBookmark,
  FaSpinner, FaArrowLeft, FaCheckCircle, FaUsers, FaCalendarAlt,
  FaUserPlus, FaUserCheck, FaClock, FaEye, FaTimes, FaExpand,
  FaCompress, FaDownload, FaShare, FaPlus, FaMinus, FaUndo,
  FaCog,
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

  const getImageStyle = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = viewportWidth - 80;
    const maxHeight = viewportHeight - 120;
    
    let displayWidth = imageDimensions.width;
    let displayHeight = imageDimensions.height;
    
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
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
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

          <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <p className="text-white text-sm font-medium">{title || 'Profile Image'}</p>
          </div>

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

  const { data: currentUser, refetch: refetchCurrentUser } = useGetProfileInfoQuery(undefined, {
    skip: !userInfo,
  });

  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useGetProfileByUsernameQuery(username, {
    skip: !username,
  });

  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
  } = useGetUserPostsQuery(
    { id: profileData?._id, type: activeTab, page: 1, limit: 50 },
    { skip: !profileData?._id }
  );

  const [followUser, { isLoading: isFollowLoading }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowLoading }] = useUnfollowUserMutation();

  const user = profileData;
  const posts = postsData?.posts?.[activeTab]?.items || [];
  const totalPostsCount = user?.postsCount?.total || 0;

  useEffect(() => {
    if (currentUser && user) {
      const isUserFollowing = currentUser.following?.some(
        (followed) => followed._id === user._id || followed === user._id
      );
      setIsFollowing(isUserFollowing || false);
      setFollowersCount(user.followersCount || 0);
    }
  }, [currentUser, user]);

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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
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
    <div className="min-h-screen bg-white">
      <BiizzedArticlesNavbar />

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 lg:px-8">
        {/* Desktop: Two-column layout for profile header */}
        <div className="lg:flex lg:items-start lg:gap-10 lg:mb-8">
          {/* Left: Avatar */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-shrink-0">
            {/* Mobile Top bar only */}
            <div className="w-full flex items-center justify-between mb-4 lg:hidden">
              <button onClick={handleGoBack} className="text-gray-900 text-lg p-1">
                <FaArrowLeft />
              </button>
              <div className="flex items-center gap-1">
                <h2 className="text-base font-bold text-gray-900">{user?.username || "user"}</h2>
                {user?.biizzed_contributor && <FaCheckCircle className="text-[#1B3766] text-sm" />}
              </div>
              <div className="w-8" />
            </div>

            {/* Avatar */}
            <div className="relative mb-3 lg:mb-4 group cursor-pointer" onClick={() => user?.profile && setShowImagePreview(true)}>
              {user?.profile ? (
                <img
                  src={user.profile}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200 lg:w-36 lg:h-36 transition-all duration-200 group-hover:scale-105"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-2xl font-bold border border-gray-200 lg:w-36 lg:h-36 lg:text-4xl">
                  {(user?.name || "U")[0].toUpperCase()}
                </div>
              )}
              {user?.profile && (
                <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <FaExpand className="text-[#1B3766] text-xs" />
                    </div>
                  </div>
                </div>
              )}
              {user?.biizzed_contributor && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                  <FaCheckCircle className="text-white text-xs" />
                </div>
              )}
            </div>

            {/* Desktop: Name & Username below avatar */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{user?.name || "User"}</h2>
                {user?.biizzed_contributor && <FaCheckCircle className="text-[#1B3766] text-sm" />}
              </div>
              <p className="text-sm text-gray-500 mb-1">@{user?.username || "user"}</p>
              {user?.bio && (
                <p className="text-sm text-gray-700 mb-3 max-w-xs">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Right: Stats, Buttons, Bio */}
          <div className="flex-1 w-full">
            {/* Mobile: Handle */}
            <p className="text-sm text-gray-900 font-semibold mb-4 lg:hidden">@{user?.username || "user"}</p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-4 w-full max-w-xs mx-auto lg:mx-0 lg:max-w-md lg:justify-start lg:gap-10">
              <div className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{followersCount}</span>
                <span className="text-xs text-gray-500">Subscribers</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{user?.followingCount || 0}</span>
                <span className="text-xs text-gray-500">Following</span>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{totalPostsCount}</span>
                <span className="text-xs text-gray-500">Posts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full max-w-sm mx-auto mb-3 lg:mx-0 lg:max-w-md">
              {!isOwnProfile && (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowLoading || isUnfollowLoading}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isFollowing
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-[#1B3766] text-white hover:bg-[#142952]"
                  }`}
                >
                  {isFollowLoading || isUnfollowLoading ? (
                    <FaSpinner className="animate-spin text-xs mx-auto" />
                  ) : isFollowing ? (
                    <span className="flex items-center justify-center gap-2"><FaUserCheck className="text-xs" /> Following</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><FaUserPlus className="text-xs" /> Follow</span>
                  )}
                </button>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => navigate('/settings')}
                  className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
                >
                  Edit profile
                </button>
              )}
              <button
                onClick={async () => {
                  const shareUrl = `${window.location.origin}/profile/${user?.username}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: `${user?.name} on Biizzed`, text: `Check out ${user?.name} on Biizzed!`, url: shareUrl });
                    } catch (err) { if (err.name !== 'AbortError') toast.error('Could not share'); }
                  } else if (navigator.clipboard) {
                    try { await navigator.clipboard.writeText(shareUrl); toast.success('Link copied!'); } catch { toast.error('Failed to copy'); }
                  } else { toast.info(shareUrl); }
                }}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaShare className="text-xs" /> Share profile
              </button>
            </div>

            {/* Mobile Bio */}
            {user?.bio && (
              <p className="text-sm text-gray-700 mb-3 max-w-sm mx-auto text-center lg:hidden">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <div className="border-t border-gray-100 mt-2 lg:mt-4">
          {/* Mobile: Icons only, no scroll, evenly spaced */}
          <div className="flex justify-between items-center lg:hidden">
            {[
              { id: "articles", icon: FaNewspaper },
              { id: "magazines", icon: FaBookOpen },
              { id: "videos", icon: FaVideo },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#1B3766] text-[#1B3766]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon className="text-xl" />
              </button>
            ))}
          </div>

          {/* Desktop: Horizontal tabs with text + count */}
          <div className="hidden lg:flex lg:justify-center">
            {[
              { id: "articles", label: "Articles", icon: FaNewspaper, count: user?.postsCount?.articles || 0 },
              { id: "magazines", label: "Magazines", icon: FaBookOpen, count: user?.postsCount?.magazines || 0 },
              { id: "videos", label: "Videos", icon: FaVideo, count: user?.postsCount?.videos || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-[#1B3766] text-[#1B3766]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="text-base" />
                <span className="text-sm font-medium">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-[#1B3766]/10 text-[#1B3766]" : "bg-gray-100 text-gray-500"
                }`}>
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === "articles" && <FaNewspaper className="text-2xl text-[#1B3766]" />}
              {activeTab === "magazines" && <FaBookOpen className="text-2xl text-[#1B3766]" />}
              {activeTab === "videos" && <FaVideo className="text-2xl text-[#1B3766]" />}
            </div>
            <p className="text-gray-500">
              No {activeTab} yet - check back later!
            </p>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-4">
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
                className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-all mb-3 lg:mb-0"
              >
                <div className="flex gap-4">
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default BiizzedViewProfile;