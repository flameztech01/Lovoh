// screens/BiizzedProfile.jsx – Fixed dropdown menu overflow issue
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser, FaNewspaper, FaBookOpen, FaVideo, FaHeart, FaBookmark,
  FaSpinner, FaEdit, FaTrashAlt, FaPlus, FaEllipsisV, FaSignOutAlt,
  FaCamera, FaTimes, FaCheck, FaCog, FaEnvelope, FaCheckCircle,
  FaStar, FaClock, FaEye, FaEyeSlash, FaFilter,
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
import BiizzedArticlesNavbar from "../components/BiizzedArticlesNavbar";
import BiizzedBottomBar from "../components/BiizzedBottomBar";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearAllAuth } from "../slices/authslice";

const BiizzedProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("articles");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showDrafts, setShowDrafts] = useState(true);
  const menuButtonRef = useRef(null);

  // Edit Profile Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuButtonRef.current && !menuButtonRef.current.contains(e.target)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpenId]);

  // Profile
  const {
    data: profile, isLoading: profileLoading, refetch: refetchProfile,
  } = useGetProfileInfoQuery(undefined, { skip: !userInfo });

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
    setMenuOpenId(null);
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
    setMenuOpenId(null);
  };

  // ====== EDIT NAVIGATION ======
  const handleEdit = (type, id) => {
    const routes = {
      article: `/edit-article/${id}`,
      magazine: `/edit-magazine/${id}`,
      video: `/edit-video/${id}`,
    };
    navigate(routes[type]);
    setMenuOpenId(null);
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
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      if (editProfilePic) formData.append("profile", editProfilePic);
      await updateProfile(formData).unwrap();
      toast.success("Profile updated");
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

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <FaUser className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Login to view your profile</p>
          <Link to="/login" className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium">
            Login
          </Link>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-2xl text-[#1B3766]" />
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const totalPosts = filteredArticles.length + filteredMagazines.length + myVideos.length;

  // Status badge renderer
  const StatusBadge = ({ item }) => {
    const status = getItemStatus(item);
    if (status === "published" && !item.isFeatured && !item.featuredRequest) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
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

  // ====== FIXED MENU RENDERER ======
  const MenuDropdown = ({ type, item }) => {
    const isFeatured = item.isFeatured === true;
    const isFeaturedRequested = item.featuredRequest === true;
    const showFeaturedRequest = type === "article" || type === "magazine";
    const status = getItemStatus(item);

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[100] min-w-[160px]">
        <div className="px-3 py-1.5 text-[10px] text-gray-400 border-b border-gray-100 mb-1">
          Status: <span className="font-medium capitalize">{status}</span>
        </div>
        
        {showFeaturedRequest && status !== "draft" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              handleRequestFeatured(type, item._id);
            }}
            disabled={isFeaturedRequested || isFeatured}
            className={`flex items-center gap-2 px-3 py-2 text-xs w-full text-left transition-colors ${
              isFeaturedRequested || isFeatured
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#1B3766] hover:bg-gray-50"
            }`}
          >
            <FaStar className="text-[10px]" />
            {isFeatured ? "Already Featured" : isFeaturedRequested ? "Request Pending" : "Request Featured"}
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            handleEdit(type, item._id);
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
        >
          <FaEdit className="text-[10px]" /> Edit
        </button>
        
        {status === "coming_soon" && (
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/edit-${type}/${item._id}?publish=true`);
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs text-green-600 hover:bg-green-50 w-full text-left transition-colors"
          >
            <FaCheck className="text-[10px]" /> Publish Now
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.preventDefault();
            handleDelete(type, item._id);
          }}
          className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left transition-colors"
        >
          <FaTrashAlt className="text-[10px]" /> Delete
        </button>
      </div>
    );
  };

  // ====== FIXED CONTENT CARD - NO overflow-hidden ======
  const ContentCard = ({ item, type }) => {
    const status = getItemStatus(item);
    const imageUrl = type === "magazine" 
      ? (item.coverImage || "/placeholder-article.jpg")
      : (item.featuredImage || item.images?.[0] || "/placeholder-article.jpg");
    const linkTo = type === "magazine" 
      ? `/${item.slug}` 
      : `/articles/${item.slug}`;
    const isMenuOpen = menuOpenId === `${type}-${item._id}`;

    return (
      <div key={item._id} className={`relative bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${
        status === "draft" ? "border-gray-200 opacity-75" : 
        status === "coming_soon" ? "border-orange-200" : "border-gray-100"
      }`}>
        <Link to={linkTo} className="flex gap-3 p-4">
          <img 
            src={imageUrl} 
            alt="" 
            className={`w-24 h-24 rounded-lg object-cover flex-shrink-0 ${
              status === "draft" ? "grayscale-[30%]" : ""
            }`} 
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{item.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {item.category} {type !== "magazine" && `• ${item.readTime || "5 min"}`}
            </p>
            
            <StatusBadge item={item} />
            
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span><FaHeart className="inline mr-1" />{item.likes?.length || 0}</span>
              <span><FaEye className="inline mr-1" />{item.views || 0}</span>
              {status === "coming_soon" && (
                <span className="text-orange-400">Not yet published</span>
              )}
              {status === "draft" && (
                <span className="text-gray-400">Only you can see this</span>
              )}
            </div>
          </div>
        </Link>
        
        {/* Menu button */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newId = isMenuOpen ? null : `${type}-${item._id}`;
              setMenuOpenId(newId);
            }}
            className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <FaEllipsisV className="text-gray-500 text-xs" />
          </button>
        </div>

        {/* Fixed dropdown - portal-like behavior with fixed positioning */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpenId(null)}>
            <div 
              className="absolute z-[100]"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <MenuDropdown type={type} item={item} />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate menu position when opening
  const handleMenuOpen = (e, type, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX - 140, // align right edge of menu with button
    });
    setMenuOpenId(`${type}-${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {profile?.profile ? (
              <img src={profile.profile} alt={profile.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-2xl font-bold">
                {(profile?.name || "U")[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-900">{profile?.name || "User"}</h1>
              <p className="text-sm text-gray-500">@{profile?.username || "user"}</p>
              {profile?.bio && <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>}

              <div className="flex items-center justify-center sm:justify-start gap-6 mt-3">
                <button onClick={() => navigate("/followers")} className="text-center hover:opacity-80 transition-opacity">
                  <p className="text-lg font-bold text-gray-900">{profile?.followersCount || 0}</p>
                  <p className="text-xs text-gray-500">Followers</p>
                </button>
                <button onClick={() => navigate("/followers?tab=following")} className="text-center hover:opacity-80 transition-opacity">
                  <p className="text-lg font-bold text-gray-900">{profile?.followingCount || 0}</p>
                  <p className="text-xs text-gray-500">Following</p>
                </button>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">{totalPosts}</p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <button onClick={openEditModal} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <FaEdit className="text-xs" /> Edit Profile
                </button>
                <Link to="/settings" className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                  <FaCog className="text-xs" /> Settings
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDigestToggle}
                  disabled={isSubscribing || isUnsubscribing || subStatusLoading}
                  className={`px-4 py-2 border rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                    digestSubscribed ? "bg-[#1B3766]/10 border-[#1B3766]/30 text-[#1B3766]" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {subStatusLoading ? <FaSpinner className="animate-spin text-xs" /> : digestSubscribed ? <FaCheckCircle className="text-xs" /> : <FaEnvelope className="text-xs" />}
                  {isSubscribing || isUnsubscribing ? "Updating..." : digestSubscribed ? "Weekly Digest On" : "Weekly Digest Off"}
                </button>
                <button onClick={handleLogout} className="px-4 py-2 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
                  <FaSignOutAlt className="text-xs" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 mb-4 overflow-x-auto">
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
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id ? "bg-[#1B3766] text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <tab.icon className="text-xs" /> {tab.label}
              <span className="text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Drafts Toggle for Articles/Magazines */}
        {(activeTab === "articles" || activeTab === "magazines") && (
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                showDrafts ? "bg-gray-800 text-white" : "bg-gray-200 text-gray-600"
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

        {/* MY ARTICLES */}
        {activeTab === "articles" && (
          articlesLoading ? (
            <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaNewspaper className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">
                {showDrafts ? "No articles yet" : "No published articles yet"}
              </p>
              <Link to="/create-article" className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952] transition-colors">
                <FaPlus className="text-xs" /> Write Article
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map((article) => (
                <ContentCard key={article._id} item={article} type="article" />
              ))}
            </div>
          )
        )}

        {/* MY MAGAZINES */}
        {activeTab === "magazines" && (
          magazinesLoading ? (
            <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
          ) : filteredMagazines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaBookOpen className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">
                {showDrafts ? "No magazines yet" : "No published magazines yet"}
              </p>
              <Link to="/create-magazine" className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952] transition-colors">
                <FaPlus className="text-xs" /> Create Magazine
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMagazines.map((magazine) => (
                <ContentCard key={magazine._id} item={magazine} type="magazine" />
              ))}
            </div>
          )
        )}

        {/* MY VIDEOS */}
        {activeTab === "videos" && (
          videosLoading ? (
            <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
          ) : myVideos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaVideo className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No videos yet</p>
              <Link to="/create-video" className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm hover:bg-[#142952] transition-colors">
                <FaPlus className="text-xs" /> Upload Video
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myVideos.map((video) => (
                <div key={video._id} className="relative bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <Link to={`/videos/${video._id}`} className="flex gap-3 p-4">
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaVideo className="text-2xl text-gray-600" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                        {video.duration ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")}` : "0:00"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{video.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{video.category || "General"}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span><FaHeart className="inline mr-1" />{video.likes?.length || 0}</span>
                        <span>{video.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                  {/* Video menu button */}
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const isOpen = menuOpenId === `video-${video._id}`;
                        if (!isOpen) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + window.scrollY + 4,
                            left: rect.left + window.scrollX - 140,
                          });
                        }
                        setMenuOpenId(isOpen ? null : `video-${video._id}`);
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur rounded-full shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <FaEllipsisV className="text-gray-500 text-xs" />
                    </button>
                  </div>
                  {/* Video dropdown */}
                  {menuOpenId === `video-${video._id}` && (
                    <div className="fixed inset-0 z-[90]" onClick={() => setMenuOpenId(null)}>
                      <div 
                        className="absolute z-[100]"
                        style={{
                          top: menuPosition.top,
                          left: menuPosition.left,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-[100] min-w-[160px]">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleEdit("video", video._id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <FaEdit className="text-[10px]" /> Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDelete("video", video._id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left transition-colors"
                          >
                            <FaTrashAlt className="text-[10px]" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* LIKED ARTICLES */}
        {activeTab === "liked" && (
          likedArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaHeart className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No liked posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {likedArticles.map((article) => (
                <Link key={article._id} to={`/articles/${article.slug}`} className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <img src={article.featuredImage || article.images?.[0] || "/placeholder-article.jpg"} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{article.category} • {article.readTime || "5 min"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* SAVED (Articles + Magazines) */}
        {activeTab === "saved" && (
          bookmarkedArticles.length === 0 && bookmarkedMagazines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaBookmark className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedArticles.map((article) => (
                <Link key={article._id} to={`/articles/${article.slug}`} className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <img src={article.featuredImage || article.images?.[0] || "/placeholder-article.jpg"} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{article.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{article.category}</p>
                  </div>
                </Link>
              ))}
              {bookmarkedMagazines.map((magazine) => (
                <Link key={magazine._id} to={`/${magazine.slug}`} className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <img src={magazine.coverImage || "/placeholder-article.jpg"} alt="" className="w-16 h-20 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{magazine.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{magazine.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeEditModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button onClick={closeEditModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {editPreview ? (
                  <img src={editPreview} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : profile?.profile ? (
                  <img src={profile.profile} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                    {(profile?.name || "U")[0].toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1B3766] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#142952] transition-colors shadow">
                  <FaCamera className="text-xs" />
                  <input type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Click the camera to change photo</p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                placeholder="Your name" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] transition-all" 
              />
            </div>
            <div className="flex gap-3">
              <button onClick={closeEditModal} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile} 
                disabled={isUpdating} 
                className="flex-1 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isUpdating ? <><FaSpinner className="animate-spin text-xs" /> Saving...</> : <><FaCheck className="text-xs" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <BiizzedBottomBar />
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.28s ease-out; }
      `}</style>
    </div>
  );
};

export default BiizzedProfile;