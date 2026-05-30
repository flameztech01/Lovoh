// screens/BiizzedProfile.jsx – Fixed menu and renamed followers to subscribers
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaNewspaper, FaBookOpen, FaVideo, FaHeart, FaBookmark,
  FaSpinner, FaEdit, FaTrashAlt, FaPlus, FaEllipsisV, FaSignOutAlt,
  FaCamera, FaTimes, FaCheck, FaCog, FaEnvelope, FaStar, FaClock,
  FaEye, FaEyeSlash, FaFilter, FaUserEdit, FaUsers, FaShareAlt,
} from "react-icons/fa";
import {
  useGetProfileInfoQuery, useUpdateProfileMutation, useLogoutMutation,
} from "../slices/userApiSlice";
import {
  useGetMyArticlesQuery, useDeleteArticleMutation, useRequestFeaturedArticleMutation,
} from "../slices/articlesApiSlice";
import {
  useGetMyMagazinesQuery, useDeleteMagazineMutation, useRequestFeaturedMagazineMutation,
} from "../slices/magApiSlice";
import {
  useGetMyVideosQuery, useDeleteVideoMutation,
} from "../slices/videoApiSlice";
import {
  useSubscribeMutation, useUnsubscribeMutation, useGetSubscriptionStatusQuery,
} from "../slices/subscribeApiSlice";
import { useGetContributorStatusQuery } from "../slices/contributorApiSlice";
import BiizzedArticlesNavbar from "../components/BiizzedArticlesNavbar";
import BiizzedBottomBar from "../components/BiizzedBottomBar";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearAllAuth } from "../slices/authslice";

// ====== VERIFIED CONTRIBUTOR BADGE (Facebook/Meta Style) ======
const ContributorBadge = ({ className = "", size = "md", showTooltip = true }) => {
  const [showTooltipText, setShowTooltipText] = useState(false);
  
  const sizes = {
    sm: { wrapper: "w-4 h-4", icon: "w-3 h-3", tooltip: "text-xs" },
    md: { wrapper: "w-5 h-5", icon: "w-3.5 h-3.5", tooltip: "text-sm" },
    lg: { wrapper: "w-6 h-6", icon: "w-4 h-4", tooltip: "text-base" },
  };
  
  const currentSize = sizes[size] || sizes.md;
  
  return (
    <div 
      className={`relative inline-flex items-center justify-center ${currentSize.wrapper} ${className}`}
      onMouseEnter={() => setShowTooltipText(true)}
      onMouseLeave={() => setShowTooltipText(false)}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path 
          d="M12 0L14.59 4.41L19.39 2.61L18.8 7.8L24 9L20.49 12.51L24 15L18.8 16.2L19.39 21.39L14.59 19.59L12 24L9.41 19.59L4.61 21.39L5.2 16.2L0 15L3.51 12.51L0 9L5.2 7.8L4.61 2.61L9.41 4.41L12 0Z" 
          fill="#0095F6"
        />
        <path 
          d="M18 9L10.5 16.5L6 12" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Tooltip */}
      {showTooltip && showTooltipText && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 text-white rounded-lg whitespace-nowrap z-20 shadow-lg">
          <span className={`${currentSize.tooltip} font-medium`}>Verified Contributor</span>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};

// ====== CONTRIBUTOR STATUS BADGE ======
const ContributorStatusBadge = ({ status, size = "sm" }) => {
  const statusConfig = {
    approved: {
      icon: FaCheck,
      text: "Verified Contributor",
      bgClass: "bg-green-50",
      textClass: "text-green-700",
      borderClass: "border-green-200",
    },
    pending: {
      icon: FaClock,
      text: "Pending Approval",
      bgClass: "bg-yellow-50",
      textClass: "text-yellow-700",
      borderClass: "border-yellow-200",
    },
    rejected: {
      icon: FaTimes,
      text: "Not Verified",
      bgClass: "bg-red-50",
      textClass: "text-red-700",
      borderClass: "border-red-200",
    },
  };
  
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgClass} ${config.textClass} border ${config.borderClass}`}>
      <Icon className={`${size === "sm" ? "text-[10px]" : "text-xs"}`} />
      <span className={`${size === "sm" ? "text-[10px]" : "text-xs"} font-medium`}>{config.text}</span>
    </div>
  );
};

const BiizzedProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("articles");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showDrafts, setShowDrafts] = useState(true);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  // Close menu when clicking outside
  useEffect(() => {
    if (!activeMenuId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest('.menu-dropdown') && !e.target.closest('.menu-button')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  // Profile
  const {
    data: profile, isLoading: profileLoading, refetch: refetchProfile,
  } = useGetProfileInfoQuery(undefined, { skip: !userInfo });

  // Contributor status
  const {
    data: contribData, isLoading: contribLoading,
  } = useGetContributorStatusQuery(undefined, { skip: !userInfo?._id });

  // User's own content
  const {
    data: myArticlesData, isLoading: articlesLoading, refetch: refetchArticles,
  } = useGetMyArticlesQuery({ limit: 50, status: "published,coming_soon,draft" }, { skip: !userInfo });

  const {
    data: myMagazinesData, isLoading: magazinesLoading, refetch: refetchMagazines,
  } = useGetMyMagazinesQuery({ limit: 50, status: "published,coming_soon,draft" }, { skip: !userInfo });

  const {
    data: myVideosData, isLoading: videosLoading, refetch: refetchVideos,
  } = useGetMyVideosQuery({ limit: 50 }, { skip: !userInfo });

  // Mutations
  const [deleteArticle] = useDeleteArticleMutation();
  const [deleteMagazine] = useDeleteMagazineMutation();
  const [deleteVideo] = useDeleteVideoMutation();
  const [requestFeaturedArticle] = useRequestFeaturedArticleMutation();
  const [requestFeaturedMagazine] = useRequestFeaturedMagazineMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [logout] = useLogoutMutation();

  // Subscription
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation();
  const { data: subStatus, isLoading: subStatusLoading } =
    useGetSubscriptionStatusQuery(userInfo?.email, { skip: !userInfo?.email });
  const [digestSubscribed, setDigestSubscribed] = useState(false);

  useEffect(() => {
    if (subStatus) setDigestSubscribed(subStatus.subscribed);
  }, [subStatus]);

  // Extract arrays
  const myArticles = myArticlesData?.magazines || myArticlesData?.articles || [];
  const myMagazines = myMagazinesData?.magazines || [];
  const myVideos = myVideosData?.videos || [];

  const likedArticles = profile?.likedArticles || [];
  const bookmarkedArticles = profile?.bookmarkedArticles || [];
  const bookmarkedMagazines = profile?.bookmarkedMagazines || [];

  // Status helpers
  const getItemStatus = useCallback((item) => {
    if (!item) return "unknown";
    if (item.status === "coming_soon" || item.comingSoon === true) return "coming_soon";
    if (item.status === "draft") return "draft";
    if (item.status === "published") return "published";
    return item.status || "unknown";
  }, []);

  const isComingSoon = useCallback((item) => getItemStatus(item) === "coming_soon", [getItemStatus]);
  const isDraft = useCallback((item) => getItemStatus(item) === "draft", [getItemStatus]);
  const isPublished = useCallback((item) => getItemStatus(item) === "published", [getItemStatus]);

  // Filter content
  const filterContent = useCallback((items) => {
    if (showDrafts) return items;
    return items.filter(item => isPublished(item) || isComingSoon(item));
  }, [showDrafts, isPublished, isComingSoon]);

  const filteredArticles = filterContent(myArticles);
  const filteredMagazines = filterContent(myMagazines);

  // ====== DELETE HANDLER ======
  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}? This cannot be undone.`)) return;
    try {
      if (type === "article") {
        await deleteArticle(id).unwrap();
        refetchArticles();
      } else if (type === "magazine") {
        await deleteMagazine(id).unwrap();
        refetchMagazines();
      } else if (type === "video") {
        await deleteVideo(id).unwrap();
        refetchVideos();
      }
      toast.success(`${type} deleted`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to delete");
    }
    setActiveMenuId(null);
  };

  // ====== REQUEST FEATURED ======
  const handleRequestFeatured = async (type, id) => {
    try {
      if (type === "article") {
        await requestFeaturedArticle(id).unwrap();
        refetchArticles();
      } else if (type === "magazine") {
        await requestFeaturedMagazine(id).unwrap();
        refetchMagazines();
      }
      toast.success("Featured request submitted for admin approval");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to request featured");
    }
    setActiveMenuId(null);
  };

  // ====== EDIT NAVIGATION ======
  const handleEdit = (type, id) => {
    const routes = {
      article: `/edit-article/${id}`,
      magazine: `/edit-magazine/${id}`,
      video: `/edit-video/${id}`,
    };
    navigate(routes[type]);
    setActiveMenuId(null);
  };

  // ====== LOGOUT ======
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    try {
      await logout().unwrap();
      dispatch(clearAllAuth());
      localStorage.removeItem("userInfo");
      localStorage.removeItem("biizzed-pwa-dismissed");
      sessionStorage.clear();
      toast.success("Logged out successfully");
      navigate("/feed");
      setTimeout(() => window.location.reload(), 300);
    } catch {
      toast.error("Logout failed");
    }
  };

  // ====== EDIT PROFILE ======
  const openEditModal = () => {
    setEditName(profile?.name || "");
    setEditUsername(profile?.username || "");
    setEditPhone(profile?.phone || "");
    setEditBio(profile?.bio || "");
    setEditProfilePic(null);
    setEditPreview("");
    setShowEditModal(true);
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, AVIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setEditProfilePic(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editUsername.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!editPhone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      formData.append("username", editUsername.trim());
      formData.append("phone", editPhone.trim());
      formData.append("bio", editBio.trim() || "");
      if (editProfilePic) formData.append("profile", editProfilePic);
      
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully");
      setShowEditModal(false);
      refetchProfile();
      if (editPreview) URL.revokeObjectURL(editPreview);
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Failed to update profile");
    }
  };

  const closeEditModal = () => {
    if (editPreview) URL.revokeObjectURL(editPreview);
    setShowEditModal(false);
    setEditProfilePic(null);
    setEditPreview("");
  };

  // ====== DIGEST TOGGLE ======
  const handleDigestToggle = async () => {
    if (!userInfo?.email) {
      toast.error("No email address on your account");
      return;
    }
    try {
      if (digestSubscribed) {
        await unsubscribe({ email: userInfo.email }).unwrap();
        setDigestSubscribed(false);
        toast.success("Unsubscribed from weekly digest");
      } else {
        await subscribe({
          email: userInfo.email,
          name: userInfo.name || userInfo.username || "",
          preferences: { magazines: true, articles: true, weeklyDigest: true },
        }).unwrap();
        setDigestSubscribed(true);
        toast.success("Subscribed to weekly digest!");
      }
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Subscription failed");
    }
  };

  // ====== SHARE PROFILE ======
  const handleShareProfile = async () => {
    const shareUrl = `${window.location.origin}/profile/${profile?.username || userInfo?._id}`;
    const shareData = {
      title: `${profile?.name || profile?.username || 'Biizzed Profile'} on Biizzed`,
      text: `Check out ${profile?.name || profile?.username || 'this profile'} on Biizzed!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Could not share profile');
        }
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Profile link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    } else {
      toast.info(shareUrl);
    }
  };

  // ====== MENU HANDLER ======
  const handleMenuOpen = (e, type, id) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 170;
    setMenuPosition({
      top: rect.top - 8,
      left: rect.right - menuWidth,
    });
    setActiveMenuId(`${type}-${id}`);
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-white">
        <BiizzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-[#1B3766]/10 rounded-full flex items-center justify-center mb-4">
            <FaUser className="text-3xl text-[#1B3766]" />
          </div>
          <p className="text-gray-500 mb-4">Login to view your profile</p>
          <Link to="/login" className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm">
            Login
          </Link>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

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

  const totalPosts = filteredArticles.length + filteredMagazines.length + myVideos.length;

  // Contributor status helpers
  const contribApplicationData = contribData?.data?.contributor_application;
  const isContributorApproved = contribData?.data?.biizzed_contributor === true || contribData?.biizzed_contributor === true;
  const contributorAppStatus = contribApplicationData?.status;
  const isContributorPending = contributorAppStatus === "pending";
  const isContributorRejected = contributorAppStatus === "rejected";
  const hasNotApplied = contributorAppStatus === "not_applied" || !contributorAppStatus;

  // Status badge renderer
  const StatusBadge = ({ item }) => {
    const status = getItemStatus(item);
    if (status === "published" && !item.isFeatured && !item.featuredRequest) return null;

    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {status === "coming_soon" && (
          <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
            <FaClock className="text-[8px]" /> Coming Soon
          </span>
        )}
        {status === "draft" && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            <FaEyeSlash className="text-[8px]" /> Draft
          </span>
        )}
        {item.featuredRequest && !item.isFeatured && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
            <FaClock className="text-[8px]" /> Pending Featured
          </span>
        )}
        {item.isFeatured && (
          <span className="inline-flex items-center gap-1 text-[10px] text-[#1B3766] bg-blue-50 px-2 py-0.5 rounded-full font-medium">
            <FaStar className="text-[8px]" /> Featured
          </span>
        )}
      </div>
    );
  };

  // Menu Dropdown Component
  const MenuDropdown = ({ type, item }) => {
    const isFeatured = item.isFeatured === true;
    const isFeaturedRequested = item.featuredRequest === true;
    const showFeaturedRequest = type === "article" || type === "magazine";
    const status = getItemStatus(item);

    return (
      <div className="menu-dropdown bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[170px] overflow-hidden">
        <div className="px-3 py-2 text-[10px] text-gray-400 border-b border-gray-100 bg-gray-50/50">
          Status: <span className="font-medium text-gray-600 capitalize">{status}</span>
        </div>
        {showFeaturedRequest && status !== "draft" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleRequestFeatured(type, item._id);
            }}
            disabled={isFeaturedRequested || isFeatured}
            className={`flex items-center gap-2.5 px-3 py-2.5 text-xs w-full text-left transition-colors ${
              isFeaturedRequested || isFeatured
                ? "text-gray-400 cursor-not-allowed bg-gray-50"
                : "text-[#1B3766] hover:bg-[#1B3766]/5"
            }`}
          >
            <FaStar className="text-[11px]" />
            {isFeatured ? "Already Featured" : isFeaturedRequested ? "Request Pending" : "Request Featured"}
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleEdit(type, item._id);
          }}
          className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
        >
          <FaEdit className="text-[11px]" /> Edit
        </button>
        {status === "coming_soon" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/edit-${type}/${item._id}?publish=true`);
            }}
            className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-green-600 hover:bg-green-50 w-full text-left transition-colors"
          >
            <FaCheck className="text-[11px]" /> Publish Now
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleDelete(type, item._id);
          }}
          className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 w-full text-left transition-colors border-t border-gray-100 mt-1"
        >
          <FaTrashAlt className="text-[11px]" /> Delete
        </button>
      </div>
    );
  };

  const totalContentCount = filteredArticles.length + filteredMagazines.length + myVideos.length;

  return (
    <div className="min-h-screen bg-white">
      <BiizzedArticlesNavbar />

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-24 lg:px-8">
        {/* Desktop: Two-column layout for profile header */}
        <div className="lg:flex lg:items-start lg:gap-10 lg:mb-8">
          {/* Left: Avatar & Actions */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:flex-shrink-0">
            {/* Mobile Top bar - REMOVED username, only settings icon now */}
            <div className="w-full flex items-center justify-end mb-4 lg:hidden">
              <button onClick={() => navigate('/settings')} className="text-gray-900 text-lg p-1">
                <FaCog />
              </button>
            </div>

            {/* Avatar */}
            <div className="relative mb-3 lg:mb-4">
              {profile?.profile ? (
                <img
                  src={profile.profile}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200 lg:w-36 lg:h-36"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-2xl font-bold border border-gray-200 lg:w-36 lg:h-36 lg:text-4xl">
                  {(profile?.name || "U")[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={openEditModal}
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#1B3766] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm lg:w-9 lg:h-9"
              >
                <FaCamera className="text-xs lg:text-sm" />
              </button>
            </div>

            {/* Mobile: Name + Username under avatar, centered (only place where username appears on mobile) */}
            <div className="lg:hidden flex flex-col items-center mb-4">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-lg font-bold text-gray-900">{profile?.name || "User"}</h2>
                {isContributorApproved && <ContributorBadge size="md" />}
              </div>
              <p className="text-sm text-gray-500">@{profile?.username || "user"}</p>
            </div>

            {/* Desktop: Name & Username below avatar */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-gray-900">{profile?.name || "User"}</h2>
                {isContributorApproved && <ContributorBadge size="lg" showTooltip={true} />}
              </div>
              <p className="text-sm text-gray-500 mb-1">@{profile?.username || "user"}</p>
              {profile?.bio && (
                <p className="text-sm text-gray-700 mb-3 max-w-xs">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Right: Stats, Buttons, Bio */}
          <div className="flex-1 w-full">
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mb-4 w-full max-w-xs mx-auto lg:mx-0 lg:max-w-md lg:justify-start lg:gap-10">
              <button onClick={() => navigate("/subscribers")} className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{profile?.followingCount || 0}</span>
                <span className="text-xs text-gray-500">Following</span>
              </button>
              <div className="w-px h-8 bg-gray-200" />
              <button onClick={() => navigate("/subscribers?tab=following")} className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{profile?.followersCount || 0}</span>
                <span className="text-xs text-gray-500">Subscribers</span>
              </button>
              <div className="w-px h-8 bg-gray-200" />
              <div className="flex flex-col items-center min-w-[60px] lg:items-start">
                <span className="text-lg font-bold text-gray-900 lg:text-xl">{totalContentCount}</span>
                <span className="text-xs text-gray-500">Posts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full max-w-sm mx-auto mb-3 lg:mx-0 lg:max-w-md">
              <button
                onClick={openEditModal}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
              >
                Edit profile
              </button>
              <button
                onClick={handleShareProfile}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaShareAlt className="text-xs" /> Share profile
              </button>
              <button
                onClick={() => navigate("/subscribers")}
                className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-900 hover:bg-gray-200 transition-colors lg:hidden"
              >
                <FaUsers className="text-sm" />
              </button>
            </div>

            {/* Mobile Bio */}
            {profile?.bio && (
              <p className="text-sm text-gray-700 mb-3 max-w-sm mx-auto text-center lg:hidden">{profile.bio}</p>
            )}

            {/* Contributor & Digest */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-2 lg:justify-start">
              {contribLoading ? (
                <span className="text-xs text-gray-400 inline-flex items-center gap-1">
                  <FaSpinner className="animate-spin" /> Loading...
                </span>
              ) : hasNotApplied ? (
                <button
                  onClick={() => navigate('/contributor/apply')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B3766] text-white rounded-full text-xs font-medium"
                >
                  <FaPlus className="text-[10px]" /> Apply to Contribute
                </button>
              ) : isContributorPending ? (
                <ContributorStatusBadge status="pending" />
              ) : isContributorRejected ? (
                <ContributorStatusBadge status="rejected" />
              ) : isContributorApproved ? (
                <ContributorStatusBadge status="approved" />
              ) : null}

              <button
                onClick={handleDigestToggle}
                disabled={isSubscribing || isUnsubscribing || subStatusLoading}
                className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 transition-all ${
                  digestSubscribed
                    ? "bg-[#1B3766] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {subStatusLoading ? (
                  <FaSpinner className="animate-spin text-[10px]" />
                ) : digestSubscribed ? (
                  <FaCheck className="text-[10px]" />
                ) : (
                  <FaEnvelope className="text-[10px]" />
                )}
                {isSubscribing || isUnsubscribing ? "Updating..." : digestSubscribed ? "Weekly Digest On" : "Weekly Digest Off"}
              </button>
            </div>
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
              { id: "liked", icon: FaHeart },
              { id: "saved", icon: FaBookmark },
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
              { id: "articles", label: "Articles", icon: FaNewspaper, count: filteredArticles.length },
              { id: "magazines", label: "Magazines", icon: FaBookOpen, count: filteredMagazines.length },
              { id: "videos", label: "Videos", icon: FaVideo, count: myVideos.length },
              { id: "liked", label: "Liked", icon: FaHeart, count: likedArticles.length },
              { id: "saved", label: "Saved", icon: FaBookmark, count: bookmarkedArticles.length + bookmarkedMagazines.length },
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

        {/* Drafts Toggle for Articles/Magazines */}
        {(activeTab === "articles" || activeTab === "magazines") && (
          <div className="flex items-center justify-between mb-4 px-1 mt-3 lg:max-w-3xl lg:mx-auto">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showDrafts ? "bg-[#1B3766] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaFilter className="text-[10px]" />
              {showDrafts ? "Showing All" : "Published Only"}
            </button>
            <span className="text-xs text-gray-400">
              {activeTab === "articles"
                ? `${myArticles.filter(a => isDraft(a)).length} drafts, ${myArticles.filter(a => isComingSoon(a)).length} coming soon`
                : `${myMagazines.filter(m => isDraft(m)).length} drafts, ${myMagazines.filter(m => isComingSoon(m)).length} coming soon`
              }
            </span>
          </div>
        )}

        {/* Content Grid - Desktop responsive */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
          {/* MY ARTICLES */}
          {activeTab === "articles" && (
            articlesLoading ? (
              <div className="flex justify-center py-12 lg:col-span-2"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-16 lg:col-span-2">
                <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaNewspaper className="text-2xl text-[#1B3766]" />
                </div>
                <p className="text-gray-500 mb-4">{showDrafts ? "No articles yet" : "No published articles yet"}</p>
                <Link to="/create-article" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm">
                  <FaPlus className="text-xs" /> Write Your First Article
                </Link>
              </div>
            ) : (
              filteredArticles.map((article) => (
                <div key={article._id} className="relative bg-white rounded-xl border border-gray-100 transition-all hover:shadow-sm mb-3 lg:mb-0">
                  <Link to={`/articles/${article.slug}`} className="flex gap-4 p-4">
                    <img
                      src={article.featuredImage || article.images?.[0] || "/placeholder-article.jpg"}
                      alt=""
                      className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">{article.title}</h3>
                      <p className="text-xs text-gray-500">{article.category} • {article.readTime || "5 min"} read</p>
                      <StatusBadge item={article} />
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span><FaHeart className="inline mr-1 text-[10px]" />{article.likes?.length || 0}</span>
                        <span><FaEye className="inline mr-1 text-[10px]" />{article.views || 0}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      className="menu-button p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={(e) => handleMenuOpen(e, "article", article._id)}
                    >
                      <FaEllipsisV className="text-gray-400 text-xs" />
                    </button>
                    {activeMenuId === `article-${article._id}` && (
                      <div className="absolute right-0 bottom-full mb-2 z-50">
                        <MenuDropdown type="article" item={article} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* MY MAGAZINES */}
          {activeTab === "magazines" && (
            magazinesLoading ? (
              <div className="flex justify-center py-12 lg:col-span-2"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
            ) : filteredMagazines.length === 0 ? (
              <div className="text-center py-16 lg:col-span-2">
                <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBookOpen className="text-2xl text-[#1B3766]" />
                </div>
                <p className="text-gray-500 mb-4">{showDrafts ? "No magazines yet" : "No published magazines yet"}</p>
                <Link to="/create-magazine" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm">
                  <FaPlus className="text-xs" /> Create Your First Magazine
                </Link>
              </div>
            ) : (
              filteredMagazines.map((magazine) => (
                <div key={magazine._id} className="relative bg-white rounded-xl border border-gray-100 transition-all hover:shadow-sm mb-3 lg:mb-0">
                  <Link to={`/${magazine.slug}`} className="flex gap-4 p-4">
                    <img
                      src={magazine.coverImage || "/placeholder-article.jpg"}
                      alt=""
                      className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">{magazine.title}</h3>
                      <p className="text-xs text-gray-500">{magazine.category}</p>
                      <StatusBadge item={magazine} />
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span><FaHeart className="inline mr-1 text-[10px]" />{magazine.likes?.length || 0}</span>
                        <span><FaEye className="inline mr-1 text-[10px]" />{magazine.views || 0}</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      className="menu-button p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={(e) => handleMenuOpen(e, "magazine", magazine._id)}
                    >
                      <FaEllipsisV className="text-gray-400 text-xs" />
                    </button>
                    {activeMenuId === `magazine-${magazine._id}` && (
                      <div className="absolute right-0 bottom-full mb-2 z-50">
                        <MenuDropdown type="magazine" item={magazine} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* MY VIDEOS */}
          {activeTab === "videos" && (
            videosLoading ? (
              <div className="flex justify-center py-12 lg:col-span-2"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
            ) : myVideos.length === 0 ? (
              <div className="text-center py-16 lg:col-span-2">
                <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaVideo className="text-2xl text-[#1B3766]" />
                </div>
                <p className="text-gray-500 mb-4">No videos yet</p>
                <Link to="/create-video" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm">
                  <FaPlus className="text-xs" /> Upload Your First Video
                </Link>
              </div>
            ) : (
              myVideos.map((video) => (
                <div key={video._id} className="relative bg-white rounded-xl border border-gray-100 transition-all hover:shadow-sm mb-3 lg:mb-0">
                  <Link to={`/videos/${video._id}`} className="flex gap-4 p-4">
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-gray-900 flex-shrink-0">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                          <FaVideo className="text-2xl text-gray-500" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                        {video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")}` : "0:00"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-1">{video.title}</h3>
                      <p className="text-xs text-gray-500">{video.category || "General"}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span><FaHeart className="inline mr-1 text-[10px]" />{video.likes?.length || 0}</span>
                        <span><FaEye className="inline mr-1 text-[10px]" />{video.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      className="menu-button p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                      onClick={(e) => handleMenuOpen(e, "video", video._id)}
                    >
                      <FaEllipsisV className="text-gray-400 text-xs" />
                    </button>
                    {activeMenuId === `video-${video._id}` && (
                      <div className="absolute right-0 bottom-full mb-2 z-50">
                        <div className="menu-dropdown bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[170px] overflow-hidden">
                          <button
                            onClick={() => handleEdit("video", video._id)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <FaEdit className="text-[11px]" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete("video", video._id)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50 w-full text-left transition-colors border-t border-gray-100 mt-1"
                          >
                            <FaTrashAlt className="text-[11px]" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}

          {/* LIKED ARTICLES */}
          {activeTab === "liked" && (
            likedArticles.length === 0 ? (
              <div className="text-center py-16 lg:col-span-2">
                <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaHeart className="text-2xl text-[#1B3766]" />
                </div>
                <p className="text-gray-500">No liked posts yet</p>
                <p className="text-xs text-gray-400 mt-1">Articles you like will appear here</p>
              </div>
            ) : (
              likedArticles.map((article) => (
                <Link key={article._id} to={`/articles/${article.slug}`} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all mb-3 lg:mb-0">
                  <img src={article.featuredImage || article.images?.[0] || "/placeholder-article.jpg"} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{article.category} • {article.readTime || "5 min"} read</p>
                  </div>
                </Link>
              ))
            )
          )}

          {/* SAVED CONTENT */}
          {activeTab === "saved" && (
            bookmarkedArticles.length === 0 && bookmarkedMagazines.length === 0 ? (
              <div className="text-center py-16 lg:col-span-2">
                <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBookmark className="text-2xl text-[#1B3766]" />
                </div>
                <p className="text-gray-500">No saved posts yet</p>
                <p className="text-xs text-gray-400 mt-1">Bookmark articles and magazines to read later</p>
              </div>
            ) : (
              <>
                {bookmarkedArticles.map((article) => (
                  <Link key={article._id} to={`/articles/${article.slug}`} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all mb-3 lg:mb-0">
                    <img src={article.featuredImage || article.images?.[0] || "/placeholder-article.jpg"} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{article.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{article.category}</p>
                    </div>
                  </Link>
                ))}
                {bookmarkedMagazines.map((magazine) => (
                  <Link key={magazine._id} to={`/${magazine.slug}`} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all mb-3 lg:mb-0">
                    <img src={magazine.coverImage || "/placeholder-article.jpg"} alt="" className="w-20 h-24 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{magazine.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{magazine.category}</p>
                    </div>
                  </Link>
                ))}
              </>
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaUserEdit className="text-white/80 text-lg" />
                  <h3 className="text-lg font-bold text-white">Edit Profile</h3>
                </div>
                <button 
                  onClick={closeEditModal} 
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
              <p className="text-white/60 text-xs mt-1">Update your personal information</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#1B3766]/20 shadow-lg">
                    {editPreview ? (
                      <img src={editPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.profile ? (
                      <img src={profile.profile} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1B3766] text-white flex items-center justify-center text-3xl font-bold">
                        {(profile?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1B3766] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#142952] transition-colors shadow-md group-hover:scale-105 transition-transform">
                    <FaCamera className="text-xs" />
                    <input type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-400 mt-2">Click the camera to change photo</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                  />
                </div>

                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="username"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Your phone number"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
                  />
                </div>

                {/* Bio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows="3"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">{editBio.length}/160 characters</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button 
                onClick={closeEditModal} 
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {isUpdating ? (
                  <><FaSpinner className="animate-spin text-xs" /> Saving...</>
                ) : (
                  <><FaCheck className="text-xs" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BiizzedBottomBar />
      
      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px) scale(0.98); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default BiizzedProfile;