// screens/BizzzedArticlesScreen.jsx – Full code with subscription status check
import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSpinner,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaRegComment,
  FaEye,
  FaFire,
  FaBookOpen,
  FaVideo,
  FaNewspaper,
  FaStar,
  FaPlus,
  FaEllipsisH,
  FaCheck,
  FaCheckCircle,
  FaPaperPlane,
  FaEnvelope,
} from "react-icons/fa";
import {
  useGetArticlesQuery,
  useLikeArticleMutation,
  useBookmarkArticleMutation,
} from "../slices/articlesApiSlice";
import {
  useGetUserSuggestionsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileInfoQuery,
} from "../slices/userApiSlice";
import {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriptionStatusQuery,
} from "../slices/subscribeApiSlice";
import BizzzedArticlesNavbar from "../components/BizzzedArticlesNavbar";
import BizzzedBottomBar from "../components/BizzzedBottomBar";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// ====== UTILS ======
const toStr = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  try {
    return v.toString();
  } catch {
    return String(v);
  }
};

const extractId = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    if (v._id) return toStr(v._id);
    if (v.toString) return v.toString();
  }
  return toStr(v);
};

const BizzzedArticlesScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData } = useGetProfileInfoQuery(undefined, {
    skip: !userInfo?._id,
  });

  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];

  // Optimistic state
  const [optLikes, setOptLikes] = useState({});
  const [optBookmarks, setOptBookmarks] = useState({});
  const [optFollows, setOptFollows] = useState({});

  const [likeArticle] = useLikeArticleMutation();
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Subscription hooks
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation();

  // Subscription status for logged-in users
  const {
    data: subStatus,
    isLoading: subStatusLoading,
  } = useGetSubscriptionStatusQuery(userInfo?.email, {
    skip: !userInfo?.email,
  });

  // Local UI state
  const [sidebarSubscribed, setSidebarSubscribed] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subName, setSubName] = useState("");

  // Sync UI with server status whenever it loads/changes
  useEffect(() => {
    if (subStatus) {
      setSidebarSubscribed(subStatus.subscribed);
    }
  }, [subStatus]);

  const { data: suggestionsData } = useGetUserSuggestionsQuery(undefined, {
    skip: !userInfo,
  });

  const articlesPerPage = 12;

  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category") || "";
  const urlFeatured = searchParams.get("featured") === "true";
  const urlSort = searchParams.get("sort") || "";

  const queryParams = {
    status: "published",
    page: currentPage,
    limit: articlesPerPage,
  };

  if (urlSearch) queryParams.search = urlSearch;
  if (urlCategory) queryParams.category = urlCategory;
  if (urlFeatured) queryParams.featured = true;
  if (urlSort === "latest") queryParams.sort = "-createdAt";
  if (urlSort === "trending") queryParams.sort = "-views";

  const {
    data: articlesData,
    isLoading,
    isFetching,
  } = useGetArticlesQuery(queryParams);

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.pages || 1;
  const suggestions = suggestionsData || [];

  useEffect(() => {
    setCurrentPage(1);
  }, [urlSearch, urlCategory, urlFeatured, urlSort]);

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date(),
      d = new Date(date),
      dm = Math.floor((now - d) / 60000);
    if (dm < 1) return "now";
    if (dm < 60) return `${dm}m`;
    const dh = Math.floor(dm / 60);
    if (dh < 24) return `${dh}h`;
    const dd = Math.floor(dh / 24);
    if (dd < 7) return `${dd}d`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // ====== ADMIN CHECK ======
  const isAdmin = (item) => {
    if (!item || item.type === "magazine") return false;
    const at = item.authorType;
    if (!at) return false;
    return String(at).toLowerCase().trim() === "admin";
  };

  // ====== OPTIMISTIC HANDLERS ======
  const handleLike = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myId) {
      toast.info("Login");
      return;
    }
    const k = `article-${extractId(item._id)}`;
    const cl = (item.likes || []).some((l) => extractId(l) === myId);
    const cc = item.likesCount || (item.likes || []).length;
    setOptLikes((p) => ({
      ...p,
      [k]: {
        liked: !(p[k]?.liked ?? cl),
        count: (p[k]?.count ?? cc) + (cl ? -1 : 1),
      },
    }));
    try {
      await likeArticle(item._id).unwrap();
    } catch {
      setOptLikes((p) => ({ ...p, [k]: { liked: cl, count: cc } }));
      toast.error("Failed");
    }
  };

  const handleBookmark = async (item, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myId) {
      toast.info("Login");
      return;
    }
    const k = `article-${extractId(item._id)}`;
    const cb = (item.bookmarks || []).some((b) => extractId(b) === myId);
    setOptBookmarks((p) => ({ ...p, [k]: !(p[k] ?? cb) }));
    try {
      await bookmarkArticle(item._id).unwrap();
    } catch {
      setOptBookmarks((p) => ({ ...p, [k]: cb }));
      toast.error("Failed");
    }
  };

  const handleFollowToggle = async (userId, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!myId) {
      toast.info("Login");
      return;
    }
    const tid = extractId(userId);
    if (!tid || tid === "" || tid === myId) return;
    const cf = followingList.some((f) => extractId(f) === tid);
    setOptFollows((p) => ({ ...p, [tid]: !(p[tid] ?? cf) }));
    try {
      if (cf) {
        await unfollowUser(tid).unwrap();
      } else {
        await followUser(tid).unwrap();
        toast.success(`Following ${name || "user"}!`);
      }
    } catch (err) {
      setOptFollows((p) => ({ ...p, [tid]: cf }));
      if (err?.data?.message?.includes("already"))
        setOptFollows((p) => ({ ...p, [tid]: true }));
      else toast.error("Failed");
    }
  };

  const handleShare = (article, e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/biizzed/articles/${article.slug}`;
    if (navigator.share) {
      navigator.share({ title: article.title, url });
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => toast.success("Link copied!"));
    }
  };

  // ====== SUBSCRIPTION HANDLERS ======
  const handleAuthSubscribeToggle = async () => {
    if (!userInfo?.email) {
      toast.error("No email address on your account");
      return;
    }
    try {
      if (sidebarSubscribed) {
        await unsubscribe({ email: userInfo.email }).unwrap();
        setSidebarSubscribed(false);
        toast.success("Unsubscribed");
      } else {
        await subscribe({
          email: userInfo.email,
          name: userInfo.name || userInfo.username || "",
          preferences: { magazines: true, articles: true, weeklyDigest: true },
        }).unwrap();
        setSidebarSubscribed(true);
        toast.success("Subscribed! Check your inbox.");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Subscription update failed");
    }
  };

  const handleSidebarSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail) {
      toast.error("Please enter your email address");
      return;
    }
    try {
      await subscribe({
        email: subEmail,
        name: subName,
        preferences: { magazines: true, articles: true, weeklyDigest: true },
      }).unwrap();
      setSidebarSubscribed(true);
      setSubEmail("");
      setSubName("");
      toast.success("Subscribed! Check your inbox.");
    } catch (error) {
      toast.error(error?.data?.message || "Subscription failed");
    }
  };

  const isF = (uid) => {
    const id = extractId(uid);
    if (!id) return false;
    if (optFollows[id] !== undefined) return optFollows[id];
    return followingList.some((f) => extractId(f) === id);
  };

  const getLD = (item) => {
    const k = `article-${extractId(item._id)}`;
    if (optLikes[k]) return optLikes[k];
    return {
      liked: (item.likes || []).some((l) => extractId(l) === myId),
      count: item.likesCount || (item.likes || []).length,
    };
  };

  const isB = (item) => {
    const k = `article-${extractId(item._id)}`;
    if (optBookmarks[k] !== undefined) return optBookmarks[k];
    return (item.bookmarks || []).some((b) => extractId(b) === myId);
  };

  const getArticleImage = (article) =>
    article.featuredImage || article.images?.[0] || "/placeholder-article.jpg";

  if (isLoading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BizzzedArticlesNavbar />
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
        </div>
        <BizzzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BizzzedArticlesNavbar />
      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex gap-6 px-0 lg:px-4 py-0 lg:py-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="fixed top-[120px] w-[280px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Browse
                </h3>
                <nav className="space-y-0.5">
                  {[
                    { name: "All Articles", icon: FaNewspaper, path: "/biizzed/articles" },
                    { name: "Magazines", icon: FaBookOpen, path: "/biizzed/magazines" },
                    { name: "Videos", icon: FaVideo, path: "/biizzed/videos" },
                    { name: "Featured", icon: FaStar, path: "/biizzed/articles?featured=true" },
                    { name: "Trending", icon: FaFire, path: "/biizzed/articles?sort=trending" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1B3766] font-medium"
                    >
                      <item.icon className="text-gray-400 text-sm" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-full lg:max-w-[680px] mx-auto lg:mx-0 pb-8 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:bg-white overflow-hidden bg-white">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-900 lg:text-2xl">
                {urlCategory || "All Articles"}
              </h1>
              <div className="flex items-center gap-2">
                {isFetching && (
                  <span className="w-3 h-3 border-2 border-[#1B3766] border-t-transparent rounded-full animate-spin" />
                )}
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set("sort", "trending");
                    setSearchParams(p);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                    urlSort === "trending"
                      ? "bg-[#1B3766] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#1B3766]"
                  }`}
                >
                  <FaFire className="text-[10px]" /> Trending
                </button>
                <button
                  onClick={() => {
                    const p = new URLSearchParams(searchParams);
                    p.set("sort", "latest");
                    setSearchParams(p);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${
                    urlSort === "latest"
                      ? "bg-[#1B3766] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#1B3766]"
                  }`}
                >
                  <FaClock className="text-[10px]" /> Latest
                </button>
              </div>
            </div>

            {/* Active filters */}
            {(urlSearch || urlCategory || urlFeatured) && (
              <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                {urlSearch && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-xs">
                    🔍 {urlSearch}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.delete("search");
                        setSearchParams(p);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                )}
                {urlCategory && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                    {urlCategory}
                    <button
                      onClick={() => {
                        const p = new URLSearchParams(searchParams);
                        p.delete("category");
                        setSearchParams(p);
                      }}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 ml-1">
                  Clear all
                </button>
              </div>
            )}

            {/* Articles list */}
            {articles.length === 0 ? (
              <div className="text-center py-16 px-4">
                <p className="text-gray-500">No articles found</p>
                <button onClick={clearFilters} className="mt-4 text-[#1B3766] hover:underline text-sm">
                  Clear filters
                </button>
              </div>
            ) : (
              <div>
                {articles.map((article, index) => {
                  const authorId = extractId(
                    article.authorId?._id || article.authorId || article.createdBy
                  );
                  const authorName = article.author || "Editorial";
                  const authorProfile = article.authorId?.profile || null;
                  const admin = isAdmin(article);
                  const following = isF(authorId);
                  const isOwn = myId && authorId ? myId === authorId : false;
                  const ld = getLD(article);
                  const bm = isB(article);

                  return (
                    <article
                      key={article._id}
                      className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    >
                      <Link to={`/biizzed/articles/${article.slug}`} className="block">
                        <div className="flex">
                          {/* Avatar column */}
                          <div className="flex flex-col items-center w-[48px] pt-3 px-2 sm:px-0">
                            <Link to={`/biizzed/user/${authorId}`} onClick={(e) => e.stopPropagation()}>
                              {authorProfile ? (
                                <img
                                  src={authorProfile}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold">
                                  {authorName[0]}
                                </div>
                              )}
                            </Link>
                            {index < articles.length - 1 && (
                              <div className="w-[2px] flex-1 bg-gray-200 mt-2" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pt-3 pr-3 sm:pr-4 pb-3">
                            {/* Author row */}
                            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                              <Link
                                to={`/biizzed/user/${authorId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="font-bold text-gray-900 text-[15px] hover:underline truncate"
                              >
                                {authorName}
                              </Link>
                              {admin && (
                                <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                                  <FaCheckCircle className="text-[8px]" /> Admin
                                </span>
                              )}
                              <span className="text-gray-500 text-[15px]">·</span>
                              <span className="text-gray-500 text-[15px]">
                                {formatDate(article.publishedAt || article.createdAt)}
                              </span>
                              {!isOwn && authorId && !admin && (
                                <button
                                  onClick={(e) => handleFollowToggle(authorId, authorName, e)}
                                  className={`ml-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                    following ? "bg-[#1B3766] text-white" : "text-[#1B3766] border border-[#1B3766]"
                                  }`}
                                >
                                  {following ? (
                                    <><FaCheck className="text-[8px]" /> Following</>
                                  ) : (
                                    <><FaPlus className="text-[8px]" /> Follow</>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="ml-auto text-gray-400 hover:text-[#1B3766] p-1 rounded-full"
                              >
                                <FaEllipsisH className="text-sm" />
                              </button>
                            </div>

                            {/* Category + read time */}
                            <span className="text-[#1B3766] text-[13px] font-medium block mb-1">
                              <FaNewspaper className="text-[10px] inline mr-1" />
                              {article.category || "Article"} ·{" "}
                              <span className="text-gray-500">{article.readTime || "5 min"} read</span>
                            </span>

                            <h2 className="text-[17px] font-semibold text-gray-900 leading-snug mb-1">
                              {article.title}
                            </h2>
                            {article.excerpt && (
                              <p className="text-[15px] text-gray-500 line-clamp-2 mb-2">
                                {article.excerpt}
                              </p>
                            )}
                            {getArticleImage(article) && (
                              <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200">
                                <img
                                  src={getArticleImage(article)}
                                  alt=""
                                  className="w-full h-auto max-h-[500px] object-cover"
                                  onError={(e) => (e.target.src = "/placeholder-article.jpg")}
                                />
                              </div>
                            )}

                            {/* Action bar */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleLike(article, e)}
                                  className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${
                                    ld.liked
                                      ? "text-red-500 bg-red-50"
                                      : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                                  }`}
                                >
                                  {ld.liked ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
                                  <span className="text-[13px] font-medium">{ld.count || 0}</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors"
                                >
                                  <FaRegComment className="text-sm" />
                                  <span className="text-[13px] font-medium">{article.comments?.length || 0}</span>
                                </button>

                                <div className="flex items-center gap-1.5 px-3 py-2 text-gray-500">
                                  <FaEye className="text-sm" />
                                  <span className="text-[13px] font-medium">{article.views || 0}</span>
                                </div>

                                <button
                                  onClick={(e) => handleShare(article, e)}
                                  className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors"
                                >
                                  <FaPaperPlane className="text-sm" />
                                </button>

                                <button
                                  onClick={(e) => handleBookmark(article, e)}
                                  className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${
                                    bm
                                      ? "text-[#1B3766] bg-[#1B3766]/5"
                                      : "text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5"
                                  }`}
                                >
                                  {bm ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
                                </button>
                              </div>
                              <span className="text-[11px] font-semibold text-[#1B3766] bg-[#1B3766]/5 px-2.5 py-1.5 rounded-full">
                                Biizzed
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}

            {totalPages > currentPage && (
              <div className="text-center py-6 border-t border-gray-200">
                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#1B3766]"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-[280px] flex-shrink-0">
            <div className="fixed top-[120px] w-[280px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              {/* People You May Know */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  People You May Know
                </h3>
                {userInfo ? (
                  suggestions.length > 0 ? (
                    <div className="space-y-3">
                      {suggestions
                        .filter((u) => extractId(u._id) !== myId)
                        .slice(0, 3)
                        .map((user) => {
                          const uid = extractId(user._id);
                          const ff = isF(uid);
                          return (
                            <div key={uid} className="flex items-center gap-3">
                              {user.profile ? (
                                <img
                                  src={user.profile}
                                  alt=""
                                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {(user.name || "U")[0].toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.followersCount || 0} followers</p>
                              </div>
                              <button
                                onClick={(e) => handleFollowToggle(uid, user.name, e)}
                                className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full flex-shrink-0 ${
                                  ff
                                    ? "bg-[#1B3766] text-white"
                                    : "text-[#1B3766] border border-[#1B3766] hover:bg-[#1B3766] hover:text-white"
                                }`}
                              >
                                {ff ? (
                                  <><FaCheck className="text-[8px]" /> Following</>
                                ) : (
                                  <><FaPlus className="text-[8px]" /> Follow</>
                                )}
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No suggestions yet</p>
                  )
                ) : (
                  <div className="text-center py-4">
                    <Link to="/biizzed/login" className="text-xs text-[#1B3766] font-medium hover:underline">
                      Login to connect
                    </Link>
                  </div>
                )}
              </div>

              {/* Weekly Digest Subscription Card */}
              <div className="bg-[#1B3766] rounded-2xl shadow-sm p-5 text-white">
                <FaEnvelope className="text-3xl mx-auto mb-3 text-[#79FFFF]" />

                {userInfo ? (
                  subStatusLoading ? (
                    <div className="text-center py-4">
                      <FaSpinner className="animate-spin text-2xl mx-auto text-white/70" />
                    </div>
                  ) : (
                    <>
                      <h4 className="font-semibold text-lg mb-2">Weekly Digest</h4>
                      <p className="text-xs text-white/70 mb-4 leading-relaxed">
                        {sidebarSubscribed
                          ? "You’re receiving our weekly highlights. Toggle to unsubscribe."
                          : "Get the best articles & magazines every Friday, straight to your inbox."}
                      </p>
                      <button
                        onClick={handleAuthSubscribeToggle}
                        disabled={isSubscribing || isUnsubscribing}
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
                          sidebarSubscribed
                            ? "bg-white/20 text-white hover:bg-white/30"
                            : "bg-white text-[#1B3766] hover:bg-gray-100"
                        }`}
                      >
                        {isSubscribing || isUnsubscribing
                          ? "Updating..."
                          : sidebarSubscribed
                          ? "Unsubscribe"
                          : "Subscribe Free"}
                      </button>
                      {sidebarSubscribed && <FaCheckCircle className="text-white/50 text-xs mx-auto mt-2" />}
                    </>
                  )
                ) : (
                  /* Non-authenticated user – email form */
                  <>
                    <h4 className="font-semibold text-lg mb-2">Weekly Digest</h4>
                    <p className="text-xs text-white/70 mb-4 leading-relaxed">
                      Best articles & magazines every Friday. No spam.
                    </p>
                    <form onSubmit={handleSidebarSubscribe}>
                      <input
                        type="email"
                        placeholder="Your email"
                        value={subEmail}
                        onChange={(e) => setSubEmail(e.target.value)}
                        className="w-full px-3 py-2 mb-2 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                        required
                      />
                      <input
                        type="text"
                        placeholder="First name (optional)"
                        value={subName}
                        onChange={(e) => setSubName(e.target.value)}
                        className="w-full px-3 py-2 mb-3 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button
                        type="submit"
                        disabled={isSubscribing}
                        className="w-full py-2 bg-white text-[#1B3766] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60"
                      >
                        {isSubscribing ? "Subscribing..." : "Subscribe Free"}
                      </button>
                    </form>
                    <p className="text-[10px] text-white/50 mt-3 text-center">
                      No spam, unsubscribe any time.
                    </p>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <BizzzedBottomBar />
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>
    </div>
  );
};

export default BizzzedArticlesScreen;