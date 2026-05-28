// screens/BiizzedSearch.jsx - Using new searchApiSlice
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaSpinner, FaSearch, FaTimes, FaArrowLeft,
  FaNewspaper, FaBookOpen, FaVideo, FaYoutube, FaPlay,
  FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaRegComment, FaEye, FaPaperPlane, FaUser, FaCheckCircle,
  FaFire, FaClock, FaPlus, FaCheck, FaEllipsisH,
  FaFilter, FaChevronDown, FaExternalLinkAlt, FaUserCircle,
} from 'react-icons/fa';
import { useSearchAllQuery, useLazyQuickSearchQuery } from '../slices/searchApiSlice';
import { useGetProfileInfoQuery, useFollowUserMutation, useUnfollowUserMutation } from '../slices/userApiSlice';
import { useLikeArticleMutation, useBookmarkArticleMutation } from '../slices/articlesApiSlice';
import { useLikeMagazineMutation, useBookmarkMagazineMutation } from '../slices/magApiSlice';
import { useLikeVideoMutation } from '../slices/videoApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// ====== UTILS ======
const toStr = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  try { return v.toString(); } catch { return String(v); }
};

const extractId = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    if (v._id) return toStr(v._id);
    if (v.toString) return v.toString();
  }
  return toStr(v);
};

const BiizzedSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });

  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];

  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [activeTab, setActiveTab] = useState('all');

  // Optimistic state
  const [optLikes, setOptLikes] = useState({});
  const [optBookmarks, setOptBookmarks] = useState({});
  const [optFollows, setOptFollows] = useState({});

  const [likeArticle] = useLikeArticleMutation();
  const [bookmarkArticle] = useBookmarkArticleMutation();
  const [likeMagazine] = useLikeMagazineMutation();
  const [bookmarkMagazine] = useBookmarkMagazineMutation();
  const [likeVideo] = useLikeVideoMutation();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  // Use the new search API
  const { data: searchData, isLoading, isFetching, refetch } = useSearchAllQuery(
    { q: query, type: activeTab === 'all' ? undefined : activeTab, page: 1, limit: 50 },
    { skip: !query || query.length < 2 }
  );

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const articles = searchData?.articles?.items || [];
  const magazines = searchData?.magazines?.items || [];
  const videos = searchData?.videos?.items || [];
  const users = searchData?.users?.items || [];

  const totalResults = articles.length + magazines.length + videos.length + users.length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      setSearchParams({ q: searchInput.trim() });
    } else if (searchInput.trim().length < 2 && searchInput.trim()) {
      toast.error('Please enter at least 2 characters');
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  // ====== FORMATTERS ======
  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date(), d = new Date(date), dm = Math.floor((now - d) / 60000);
    if (dm < 1) return 'now'; if (dm < 60) return `${dm}m`;
    const dh = Math.floor(dm / 60); if (dh < 24) return `${dh}h`;
    const dd = Math.floor(dh / 24); if (dd < 7) return `${dd}d`;
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
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), sec = Math.floor(seconds % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  };

  // ====== OPTIMISTIC HANDLERS ======
  const getLikeKey = (item) => `${item.type}-${extractId(item._id)}`;

  const doLike = async (item, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!myId) { toast.info('Login to like'); return; }
    const k = getLikeKey(item);
    const cl = (item.likes || []).some(l => extractId(l) === myId);
    const cc = item.likesCount || (item.likes || []).length;
    setOptLikes(p => ({ ...p, [k]: { liked: !(p[k]?.liked ?? cl), count: (p[k]?.count ?? cc) + (cl ? -1 : 1) } }));
    try {
      if (item.type === 'magazine') await likeMagazine(item._id).unwrap();
      else if (item.type === 'video') await likeVideo(item._id).unwrap();
      else await likeArticle(item._id).unwrap();
    } catch { setOptLikes(p => ({ ...p, [k]: { liked: cl, count: cc } })); toast.error('Failed'); }
  };

  const doBook = async (item, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!myId) { toast.info('Login to bookmark'); return; }
    if (item.type === 'video') return;
    const k = getLikeKey(item);
    const cb = (item.bookmarks || []).some(b => extractId(b) === myId);
    setOptBookmarks(p => ({ ...p, [k]: !(p[k] ?? cb) }));
    try {
      if (item.type === 'magazine') await bookmarkMagazine(item._id).unwrap();
      else await bookmarkArticle(item._id).unwrap();
    } catch { setOptBookmarks(p => ({ ...p, [k]: cb })); toast.error('Failed'); }
  };

  const doFollow = async (uid, username, name, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!myId) { toast.info('Login to follow'); return; }
    const tid = extractId(uid);
    if (!tid || tid === '' || tid === myId) return;
    const cf = followingList.some(f => extractId(f) === tid);
    setOptFollows(p => ({ ...p, [tid]: !(p[tid] ?? cf) }));
    try {
      if (cf) { await unfollowUser(tid).unwrap(); }
      else { await followUser(tid).unwrap(); toast.success(`Following @${username || name || 'user'}!`); }
    } catch (err) {
      setOptFollows(p => ({ ...p, [tid]: cf }));
      if (err?.data?.message?.includes('already')) setOptFollows(p => ({ ...p, [tid]: true }));
      else toast.error('Failed');
    }
  };

  const isF = (uid) => {
    const id = extractId(uid);
    if (!id) return false;
    if (optFollows[id] !== undefined) return optFollows[id];
    return followingList.some(f => extractId(f) === id);
  };

  const getLD = (item) => {
    const k = getLikeKey(item);
    if (optLikes[k]) return optLikes[k];
    return { liked: (item.likes || []).some(l => extractId(l) === myId), count: item.likesCount || (item.likes || []).length };
  };

  const isB = (item) => {
    const k = getLikeKey(item);
    if (optBookmarks[k] !== undefined) return optBookmarks[k];
    return (item.bookmarks || []).some(b => extractId(b) === myId);
  };

  const getImage = (item) => {
    if (item.type === 'video') {
      if (item.videoType === 'youtube') return item.youtubeThumbnail || item.thumbnail;
      return item.thumbnail;
    }
    if (item.type === 'magazine') return item.coverImage;
    return item.featuredImage || item.images?.[0] || '/placeholder-article.jpg';
  };

  const getLink = (item) => {
    if (item.type === 'article') return `/articles/${item.slug}`;
    if (item.type === 'magazine') return `/${item.slug}`;
    if (item.type === 'video') return `/videos/${item._id}`;
    if (item.type === 'user') return `/user/${item.username}`;
    return '#';
  };

  const getTypeIcon = (item) => {
    if (item.type === 'video' && item.videoType === 'youtube') return <FaYoutube className="text-red-600" />;
    if (item.type === 'video') return <FaVideo className="text-red-500" />;
    if (item.type === 'magazine') return <FaBookOpen className="text-purple-600" />;
    if (item.type === 'user') return <FaUserCircle className="text-green-500" />;
    return <FaNewspaper className="text-[#1B3766]" />;
  };

  const getTypeLabel = (item) => {
    if (item.type === 'video' && item.videoType === 'youtube') return 'YouTube Video';
    if (item.type === 'video') return 'Video';
    if (item.type === 'magazine') return 'Magazine';
    if (item.type === 'user') return 'User';
    return 'Article';
  };

  const getTypeColor = (item) => {
    if (item.type === 'user') return 'bg-green-100 text-green-700';
    if (item.type === 'video') return 'bg-red-100 text-red-700';
    if (item.type === 'magazine') return 'bg-purple-100 text-purple-700';
    return 'bg-blue-100 text-blue-700';
  };

  // Combine all results for 'all' tab
  const allItems = [
    ...articles.map(a => ({ ...a, type: 'article' })),
    ...magazines.map(m => ({ ...m, type: 'magazine' })),
    ...videos.map(v => ({ ...v, type: 'video' })),
    ...users.map(u => ({ ...u, type: 'user' })),
  ].sort((a, b) => {
    const dateA = a.createdAt || a.publishedAt;
    const dateB = b.createdAt || b.publishedAt;
    return new Date(dateB) - new Date(dateA);
  });

  const displayItems = () => {
    if (activeTab === 'articles') return articles;
    if (activeTab === 'magazines') return magazines;
    if (activeTab === 'videos') return videos;
    if (activeTab === 'users') return users;
    return allItems;
  };

  const items = displayItems();

  const tabs = [
    { id: 'all', label: 'All', count: totalResults, icon: FaSearch },
    { id: 'articles', label: 'Articles', count: articles.length, icon: FaNewspaper },
    { id: 'magazines', label: 'Magazines', count: magazines.length, icon: FaBookOpen },
    { id: 'videos', label: 'Videos', count: videos.length, icon: FaVideo },
    { id: 'users', label: 'Users', count: users.length, icon: FaUser },
  ];

  // Trending searches suggestions
  const trendingSearches = [
    'president', 'billionaire', 'rich people', 'flagship phones',
    'business', 'technology', 'startups', 'leadership', 'finance',
    'education', 'innovation', 'entrepreneurship'
  ];

  // User Card Component
  const UserCard = ({ user }) => {
    const follow = isF(user._id);
    const isOwn = myId === user._id;
    
    return (
      <Link to={`/user/${user.username}`} className="block bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition-all">
        <div className="flex items-center gap-4">
          {user.profile ? (
            <img src={user.profile} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B3766] to-[#142952] text-white flex items-center justify-center text-xl font-bold">
              {(user.name || 'U')[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-gray-900">{user.name}</h3>
              {user.biizzed_contributor && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Contributor</span>
              )}
            </div>
            <p className="text-sm text-gray-500">@{user.username}</p>
            {user.bio && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{user.bio}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span><FaUser className="inline mr-1 text-[10px]" /> {user.followersCount || 0} subscribers</span>
              <span>{user.followingCount || 0} following</span>
            </div>
          </div>
          {!isOwn && (
            <button
              onClick={(e) => doFollow(user._id, user.username, user.name, e)}
              className={`flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-full transition-colors ${
                follow ? 'bg-[#1B3766] text-white' : 'text-[#1B3766] border border-[#1B3766] hover:bg-[#1B3766] hover:text-white'
              }`}
            >
              {follow ? <><FaCheck className="text-[10px]" /> Following</> : <><FaPlus className="text-[10px]" /> Follow</>}
            </button>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      
      <div className="max-w-3xl mx-auto px-4 py-4">
        {/* Search Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles, magazines, videos, users..."
              className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1B3766] focus:border-transparent text-sm"
              autoFocus={!query}
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </form>
        </div>

        {/* Results Section */}
        {query && query.length >= 2 ? (
          <>
            {/* Results Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Results for "<span className="text-[#1B3766]">{query}</span>"
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {isLoading ? (
                      <span className="flex items-center gap-2"><FaSpinner className="animate-spin text-xs" /> Searching...</span>
                    ) : isFetching ? (
                      <span className="flex items-center gap-2"><FaSpinner className="animate-spin text-xs" /> Loading...</span>
                    ) : (
                      <span>{searchData?.total || 0} result{searchData?.total !== 1 ? 's' : ''} found</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Tab Filters */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#1B3766] text-white shadow-sm'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="text-[10px]" />
                    {tab.label}
                    <span className={`${activeTab === tab.id ? 'text-white/75' : 'text-gray-400'}`}>
                      ({tab.count})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Results List */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="text-center">
                  <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Searching across all content...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <FaSearch className="text-5xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 text-sm mb-4">
                  We couldn't find anything for "<strong>{query}</strong>"
                </p>
                <p className="text-gray-400 text-xs mb-6">Try different keywords or check your spelling</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="text-xs text-gray-500">Suggestions:</span>
                  {trendingSearches.slice(0, 5).map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchParams({ q: term })}
                      className="px-3 py-1 bg-gray-100 hover:bg-[#1B3766]/10 text-xs text-gray-600 hover:text-[#1B3766] rounded-full transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  if (item.type === 'user') {
                    return <UserCard key={`user-${item._id}`} user={item} />;
                  }
                  
                  const ld = getLD(item);
                  const bm = isB(item);
                  const typeLabel = getTypeLabel(item);
                  const typeIcon = getTypeIcon(item);
                  const typeColor = getTypeColor(item);

                  return (
                    <Link
                      key={`${item.type}-${item._id}`}
                      to={getLink(item)}
                      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
                    >
                      <div className="flex gap-4 p-4">
                        {/* Thumbnail */}
                        <div className="relative w-28 h-28 sm:w-36 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {getImage(item) ? (
                            <img
                              src={getImage(item)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                if (item.type === 'video' && item.videoType === 'youtube' && item.youtubeId) {
                                  e.target.src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`;
                                } else {
                                  e.target.src = '/placeholder-article.jpg';
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {typeIcon}
                            </div>
                          )}
                          
                          {/* Type badge */}
                          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${typeColor}`}>
                            {typeIcon}
                            <span className="hidden sm:inline">{typeLabel}</span>
                          </div>

                          {/* Duration for uploaded videos */}
                          {item.type === 'video' && item.videoType !== 'youtube' && formatDuration(item.duration) && (
                            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-[10px] rounded font-medium">
                              {formatDuration(item.duration)}
                            </div>
                          )}

                          {/* YouTube badge */}
                          {item.type === 'video' && item.videoType === 'youtube' && (
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-red-600/90 text-white text-[10px] rounded font-medium flex items-center gap-1">
                              <FaYoutube className="text-[8px]" /> YT
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            {/* Type & Category */}
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeColor}`}>
                                {typeLabel}
                              </span>
                              {item.category && (
                                <span className="text-[10px] text-gray-400">{item.category}</span>
                              )}
                              {item.readTime && (
                                <>
                                  <span className="text-gray-300 text-[10px]">·</span>
                                  <span className="text-[10px] text-gray-400">{item.readTime} read</span>
                                </>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 leading-snug">
                              {item.title}
                            </h3>

                            {/* Description */}
                            {item.excerpt && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.excerpt}</p>
                            )}
                            {item.summary && !item.excerpt && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.summary}</p>
                            )}
                            {item.description && !item.excerpt && !item.summary && (
                              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                            )}
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <FaHeart className="text-[10px]" /> {ld.count}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaRegComment className="text-[10px]" /> {item.comments?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaEye className="text-[10px]" /> {formatViews(item.views)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={e => doLike(item, e)}
                                className={`p-1.5 rounded-full transition-colors ${
                                  ld.liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                              >
                                {ld.liked ? <FaHeart className="text-xs" /> : <FaRegHeart className="text-xs" />}
                              </button>
                              
                              {item.type !== 'video' && (
                                <button
                                  onClick={e => doBook(item, e)}
                                  className={`p-1.5 rounded-full transition-colors ${
                                    bm ? 'text-[#1B3766] bg-[#1B3766]/5' : 'text-gray-400 hover:text-[#1B3766] hover:bg-[#1B3766]/5'
                                  }`}
                                >
                                  {bm ? <FaBookmark className="text-xs" /> : <FaRegBookmark className="text-xs" />}
                                </button>
                              )}

                              {item.type === 'video' && item.videoType === 'youtube' && item.youtubeId && (
                                <a
                                  href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <FaExternalLinkAlt className="text-[10px]" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        ) : query && query.length < 2 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-700 text-sm">Please enter at least 2 characters to search</p>
          </div>
        ) : (
          /* Empty State - No Query */
          <div className="space-y-4">
            {/* Trending Searches */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FaFire className="text-yellow-500" /> Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchParams({ q: term })}
                    className="px-4 py-2 bg-gray-50 hover:bg-[#1B3766]/5 text-sm text-gray-600 hover:text-[#1B3766] rounded-xl transition-colors border border-gray-100 hover:border-[#1B3766]/20"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Search Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse by Category</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['Business', 'Technology', 'Startups', 'Leadership', 'Finance', 'Education', 'News', 'Entertainment', 'Tutorial'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSearchParams({ q: cat.toLowerCase() })}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-[#1B3766]/5 rounded-xl text-sm text-gray-600 hover:text-[#1B3766] transition-colors"
                  >
                    <FaSearch className="text-[10px] text-gray-400" />
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Tips */}
            <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] rounded-2xl shadow-sm p-5 text-white">
              <h3 className="text-sm font-semibold mb-2">💡 Search Tips</h3>
              <ul className="text-xs text-white/70 space-y-1.5">
                <li>• Search for topics like "president", "billionaire", "rich people"</li>
                <li>• Find videos by searching "flagship phones", "tech reviews"</li>
                <li>• Look for magazines on "business", "finance", "leadership"</li>
                <li>• Search for users by their name or username</li>
                <li>• Use specific keywords for better results</li>
              </ul>
            </div>
          </div>
        )}

        <div className="h-16"></div>
      </div>

      <BiizzedBottomBar />
      <style>{`
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>
    </div>
  );
};

export default BiizzedSearch;