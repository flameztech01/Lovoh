// screens/BizzzedProfile.jsx – Complete with Logout, Edit Profile, Settings, and Weekly Digest Toggle
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaNewspaper,
  FaBookOpen,
  FaVideo,
  FaHeart,
  FaBookmark,
  FaSpinner,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaEllipsisV,
  FaSignOutAlt,
  FaCamera,
  FaTimes,
  FaCheck,
  FaCog,
  FaEnvelope,
  FaCheckCircle,
} from "react-icons/fa";
import {
  useGetProfileInfoQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} from "../slices/userApiSlice";
import {
  useGetArticlesQuery,
  useDeleteArticleMutation,
} from "../slices/articlesApiSlice";
import {
  useGetMagazinesQuery,
  useDeleteMagazineMutation,
} from "../slices/magApiSlice";
import {
  useGetUserVideosQuery,
  useDeleteVideoMutation,
} from "../slices/videoApiSlice";
import {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriptionStatusQuery,
} from "../slices/subscribeApiSlice";
import BizzzedArticlesNavbar from "../components/BizzzedArticlesNavbar";
import BizzzedBottomBar from "../components/BizzzedBottombar";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { clearAllAuth } from "../slices/authslice";

const BizzzedProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("articles");
  const [showMenu, setShowMenu] = useState(null);

  // Edit Profile Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editProfilePic, setEditProfilePic] = useState(null);
  const [editPreview, setEditPreview] = useState("");

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useGetProfileInfoQuery(undefined, { skip: !userInfo });

  const { data: articlesData, refetch: refetchArticles } = useGetArticlesQuery({
    status: "published",
    limit: 50,
  });
  const { data: magazinesData, refetch: refetchMagazines } =
    useGetMagazinesQuery({ status: "published", limit: 50 });
  const { data: videosData, refetch: refetchVideos } = useGetUserVideosQuery(
    userInfo?._id,
    { skip: !userInfo },
  );

  const [deleteArticle] = useDeleteArticleMutation();
  const [deleteMagazine] = useDeleteMagazineMutation();
  const [deleteVideo] = useDeleteVideoMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [logout] = useLogoutMutation();

  // Subscription hooks
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation();
  const { data: subStatus, isLoading: subStatusLoading } =
    useGetSubscriptionStatusQuery(userInfo?.email, { skip: !userInfo?.email });
  const [digestSubscribed, setDigestSubscribed] = useState(false);

  useEffect(() => {
    if (subStatus) {
      setDigestSubscribed(subStatus.subscribed);
    }
  }, [subStatus]);

  // Filter content by current user
  const myArticles =
    articlesData?.articles?.filter(
      (a) => a.authorId?._id === userInfo?._id || a.createdBy === userInfo?._id,
    ) || [];
  const myMagazines =
    magazinesData?.magazines?.filter((m) => m.createdBy === userInfo?._id) ||
    [];
  const myVideos = videosData?.videos || [];

  const likedArticles = profile?.likedArticles || [];
  const bookmarkedArticles = profile?.bookmarkedArticles || [];
  const bookmarkedMagazines = profile?.bookmarkedMagazines || [];

  // ====== DELETE HANDLER ======
  const handleDelete = async (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return;
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
    } catch {
      toast.error("Failed to delete");
    }
    setShowMenu(null);
  };

  // ====== LOGOUT HANDLER ======
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;
    try {
      await logout().unwrap();
      dispatch(clearAllAuth());
      localStorage.removeItem("userInfo");
      localStorage.removeItem("bizzzed-pwa-dismissed");
      sessionStorage.clear();
      dispatch({ type: "RESET_ALL" });
      toast.success("Logged out successfully");
      navigate("/biizzed/feed");
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  // ====== EDIT PROFILE HANDLERS ======
  const openEditModal = () => {
    setEditName(profile?.name || "");
    setEditProfilePic(null);
    setEditPreview("");
    setShowEditModal(true);
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WebP, and AVIF images are allowed");
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
      if (editProfilePic) {
        formData.append("profile", editProfilePic);
      }
      await updateProfile(formData).unwrap();
      toast.success("Profile updated successfully!");
      setShowEditModal(false);
      refetchProfile();
      if (editPreview) URL.revokeObjectURL(editPreview);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update profile");
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
        toast.success("Subscribed! Check your inbox.");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Subscription update failed");
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BizzzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <FaUser className="text-5xl text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Login to view your profile</p>
          <Link
            to="/biizzed/login"
            className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium"
          >
            Login
          </Link>
        </div>
        <BizzzedBottomBar />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BizzzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-2xl text-[#1B3766]" />
        </div>
        <BizzzedBottomBar />
      </div>
    );
  }

  const totalPosts = myArticles.length + myMagazines.length + myVideos.length;

  return (
    <div className="min-h-screen bg-gray-100">
      <BizzzedArticlesNavbar />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {profile?.profile ? (
              <img
                src={profile.profile}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-2xl font-bold">
                {(profile?.name || "U")[0].toUpperCase()}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.name || "User"}
              </h1>
              <p className="text-sm text-gray-500">
                @{profile?.username || "user"}
              </p>
              {profile?.bio && (
                <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
              )}

              <div className="flex items-center justify-center sm:justify-start gap-6 mt-3">
                <button
                  onClick={() => navigate("/biizzed/followers")}
                  className="text-center hover:opacity-80"
                >
                  <p className="text-lg font-bold text-gray-900">
                    {profile?.followersCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">Followers</p>
                </button>
                <button
                  onClick={() => navigate("/biizzed/followers?tab=following")}
                  className="text-center hover:opacity-80"
                >
                  <p className="text-lg font-bold text-gray-900">
                    {profile?.followingCount || 0}
                  </p>
                  <p className="text-xs text-gray-500">Following</p>
                </button>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-900">
                    {totalPosts}
                  </p>
                  <p className="text-xs text-gray-500">Posts</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col items-center sm:items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={openEditModal}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaEdit className="text-xs" /> Edit Profile
                </button>
                <Link
                  to="/biizzed/settings"
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FaCog className="text-xs" /> Settings
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDigestToggle}
                  disabled={isSubscribing || isUnsubscribing || subStatusLoading}
                  className={`px-4 py-2 border rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
                    digestSubscribed
                      ? "bg-[#1B3766]/10 border-[#1B3766]/30 text-[#1B3766] hover:bg-[#1B3766]/20"
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {subStatusLoading ? (
                    <FaSpinner className="animate-spin text-xs" />
                  ) : digestSubscribed ? (
                    <FaCheckCircle className="text-xs" />
                  ) : (
                    <FaEnvelope className="text-xs" />
                  )}
                  {isSubscribing || isUnsubscribing
                    ? "Updating..."
                    : digestSubscribed
                    ? "Weekly Digest On"
                    : "Weekly Digest Off"}
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-200 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <FaSignOutAlt className="text-xs" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 mb-4 overflow-x-auto">
          {[
            {
              id: "articles",
              label: "Articles",
              icon: FaNewspaper,
              count: myArticles.length,
            },
            {
              id: "magazines",
              label: "Magazines",
              icon: FaBookOpen,
              count: myMagazines.length,
            },
            {
              id: "videos",
              label: "Videos",
              icon: FaVideo,
              count: myVideos.length,
            },
            {
              id: "liked",
              label: "Liked",
              icon: FaHeart,
              count: likedArticles.length,
            },
            {
              id: "saved",
              label: "Saved",
              icon: FaBookmark,
              count: bookmarkedArticles.length + bookmarkedMagazines.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#1B3766] text-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="text-xs" /> {tab.label}
              <span className="text-xs opacity-75">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* MY ARTICLES */}
        {activeTab === "articles" &&
          (myArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaNewspaper className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No articles yet</p>
              <Link
                to="/biizzed/create-article"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm"
              >
                <FaPlus className="text-xs" /> Write Article
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myArticles.map((article) => (
                <div
                  key={article._id}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                >
                  <Link
                    to={`/biizzed/articles/${article.slug}`}
                    className="flex gap-3 p-4"
                  >
                    <img
                      src={
                        article.featuredImage ||
                        article.images?.[0] ||
                        "/placeholder-article.jpg"
                      }
                      alt=""
                      className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {article.category} • {article.readTime || "5 min"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          <FaHeart className="inline mr-1" />
                          {article.likes?.length || 0}
                        </span>
                        <span>{article.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(
                          showMenu === article._id ? null : article._id,
                        );
                      }}
                      className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaEllipsisV className="text-gray-500 text-xs" />
                    </button>
                    {showMenu === article._id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[100px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete("article", article._id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left"
                        >
                          <FaTrashAlt className="text-[10px]" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* MY MAGAZINES */}
        {activeTab === "magazines" &&
          (myMagazines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaBookOpen className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No magazines yet</p>
              <Link
                to="/biizzed/create-magazine"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm"
              >
                <FaPlus className="text-xs" /> Upload Magazine
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myMagazines.map((magazine) => (
                <div
                  key={magazine._id}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                >
                  <Link
                    to={`/biizzed/${magazine.slug}`}
                    className="flex gap-3 p-4"
                  >
                    <img
                      src={magazine.coverImage || "/placeholder-article.jpg"}
                      alt=""
                      className="w-20 h-28 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {magazine.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {magazine.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {magazine.summary}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          <FaHeart className="inline mr-1" />
                          {magazine.likes?.length || 0}
                        </span>
                        <span>{magazine.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(
                          showMenu === magazine._id ? null : magazine._id,
                        );
                      }}
                      className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaEllipsisV className="text-gray-500 text-xs" />
                    </button>
                    {showMenu === magazine._id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[100px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete("magazine", magazine._id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left"
                        >
                          <FaTrashAlt className="text-[10px]" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* MY VIDEOS */}
        {activeTab === "videos" &&
          (myVideos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaVideo className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-3">No videos yet</p>
              <Link
                to="/biizzed/create-video"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#1B3766] text-white rounded-lg text-sm"
              >
                <FaPlus className="text-xs" /> Upload Video
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myVideos.map((video) => (
                <div
                  key={video._id}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
                >
                  <Link
                    to={`/biizzed/videos/${video._id}`}
                    className="flex gap-3 p-4"
                  >
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FaVideo className="text-2xl text-gray-600" />
                        </div>
                      )}
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                        {video.duration
                          ? `${Math.floor(video.duration / 60)}:${String(Math.floor(video.duration % 60)).padStart(2, "0")}`
                          : "0:00"}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {video.category || "General"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                        <span>
                          <FaHeart className="inline mr-1" />
                          {video.likes?.length || 0}
                        </span>
                        <span>{video.views || 0} views</span>
                      </div>
                    </div>
                  </Link>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowMenu(showMenu === video._id ? null : video._id);
                      }}
                      className="p-1.5 bg-white rounded-full shadow hover:bg-gray-100"
                    >
                      <FaEllipsisV className="text-gray-500 text-xs" />
                    </button>
                    {showMenu === video._id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-10 min-w-[100px]">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete("video", video._id);
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 w-full text-left"
                        >
                          <FaTrashAlt className="text-[10px]" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}

        {/* LIKED */}
        {activeTab === "liked" &&
          (likedArticles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaHeart className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No liked posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {likedArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/biizzed/articles/${article.slug}`}
                  className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <img
                    src={
                      article.featuredImage ||
                      article.images?.[0] ||
                      "/placeholder-article.jpg"
                    }
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {article.category} • {article.readTime || "5 min"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ))}

        {/* SAVED */}
        {activeTab === "saved" &&
          (bookmarkedArticles.length === 0 &&
          bookmarkedMagazines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl">
              <FaBookmark className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No saved posts yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/biizzed/articles/${article.slug}`}
                  className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <img
                    src={
                      article.featuredImage ||
                      article.images?.[0] ||
                      "/placeholder-article.jpg"
                    }
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {article.category}
                    </p>
                  </div>
                </Link>
              ))}
              {bookmarkedMagazines.map((magazine) => (
                <Link
                  key={magazine._id}
                  to={`/biizzed/${magazine.slug}`}
                  className="flex gap-3 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <img
                    src={magazine.coverImage || "/placeholder-article.jpg"}
                    alt=""
                    className="w-16 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">
                      {magazine.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {magazine.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ))}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-slideUp">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={closeEditModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {editPreview ? (
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : profile?.profile ? (
                  <img
                    src={profile.profile}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                    {(profile?.name || "U")[0].toUpperCase()}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-[#1B3766] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#142952] transition-colors shadow">
                  <FaCamera className="text-xs" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePicChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Click the camera to change photo
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeEditModal}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 py-2.5 bg-[#1B3766] text-white rounded-xl font-medium text-sm hover:bg-[#142952] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <FaSpinner className="animate-spin text-xs" /> Saving...
                  </>
                ) : (
                  <>
                    <FaCheck className="text-xs" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <BizzzedBottomBar />
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.28s ease-out; }
      `}</style>
    </div>
  );
};

export default BizzzedProfile;