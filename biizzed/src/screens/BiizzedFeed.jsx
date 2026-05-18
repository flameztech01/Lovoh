// screens/BiizzedFeed.jsx – Full code with Auth Modal and Capacitor share
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSpinner, FaUser, FaClock,
  FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaRegComment, FaEye,
  FaNewspaper, FaBookOpen, FaVideo, FaPlus, FaPlay, FaVolumeMute, FaVolumeUp,
  FaCheck, FaCheckCircle, FaStar, FaArrowRight, FaBolt, FaArrowUp,
  FaChevronLeft, FaChevronRight, FaYoutube, FaPaperPlane, FaExternalLinkAlt,
  FaEnvelope, FaAd, FaTimes,
} from 'react-icons/fa';
import { useGetArticlesQuery, useLikeArticleMutation, useBookmarkArticleMutation } from '../slices/articlesApiSlice';
import { useGetMagazinesQuery, useLikeMagazineMutation, useBookmarkMagazineMutation } from '../slices/magApiSlice';
import { useGetVideosQuery, useLikeVideoMutation } from '../slices/videoApiSlice';
import {
  useGetUserSuggestionsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileInfoQuery,
} from '../slices/userApiSlice';
import {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriptionStatusQuery,
} from '../slices/subscribeApiSlice';
import { useGetAdsQuery, useTrackAdViewMutation, useTrackAdClickMutation } from '../slices/adsApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// ========== CONFIG ==========
const WEBSITE_URL = 'https://biizzed.lovohcreate.com';

// ========== UTILS ==========
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

// ====== AUTH MODAL ======
const AuthModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative animate-fadeInUp">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <FaTimes />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <FaUser className="text-[#1B3766] text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Join the Conversation</h3>
          <p className="text-sm text-gray-500 mt-1">Sign in to like, bookmark, and follow creators</p>
        </div>
        <div className="space-y-3">
          <Link
            to="/login"
            className="block w-full py-2.5 bg-[#1B3766] text-white rounded-xl text-center font-medium hover:bg-[#142952] transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block w-full py-2.5 border border-gray-200 text-gray-700 rounded-xl text-center font-medium hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
        <p className="text-center text-xs text-gray-400 mt-4">
          By continuing, you agree to Biizzed's Terms of Service.
        </p>
      </div>
    </div>
  );
};

const BiizzedFeed = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });

  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];

  const [showNewPosts, setShowNewPosts] = useState(false);
  const [lastPostCount, setLastPostCount] = useState(0);
  const [optLikes, setOptLikes] = useState({});
  const [optBookmarks, setOptBookmarks] = useState({});
  const [optFollows, setOptFollows] = useState({});
  const [featIdx, setFeatIdx] = useState(0);
  const touchS = useRef(0);
  const touchE = useRef(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Ads
  const { data: inlineAdsData } = useGetAdsQuery({ page: 'biizzed', placement: 'inline', limit: 10 });
  const { data: sidebarAdsData } = useGetAdsQuery({ page: 'biizzed', placement: 'sidebar', limit: 10 });
  const { data: bannerAdsData } = useGetAdsQuery({ page: 'biizzed', placement: 'banner', limit: 3 });
  const [trackAdView] = useTrackAdViewMutation();
  const [trackAdClick] = useTrackAdClickMutation();

  const inlineAds = inlineAdsData?.ads || [];
  const sidebarAds = sidebarAdsData?.ads || [];
  const bannerAds = bannerAdsData?.ads || [];

  // Sidebar slider state
  const [sidebarAdIndex, setSidebarAdIndex] = useState(0);
  const sidebarAdTimer = useRef(null);

  useEffect(() => {
    if (sidebarAds.length > 1) {
      sidebarAdTimer.current = setInterval(() => {
        setSidebarAdIndex(prev => (prev + 1) % sidebarAds.length);
      }, 5000);
      return () => clearInterval(sidebarAdTimer.current);
    }
  }, [sidebarAds.length]);

  // Mutations
  const [likeA] = useLikeArticleMutation();
  const [bookA] = useBookmarkArticleMutation();
  const [likeM] = useLikeMagazineMutation();
  const [bookM] = useBookmarkMagazineMutation();
  const [likeV] = useLikeVideoMutation();
  const [followU] = useFollowUserMutation();
  const [unfollowU] = useUnfollowUserMutation();

  // Subscriptions
  const [subscribe, { isLoading: isSubscribing }] = useSubscribeMutation();
  const [unsubscribe, { isLoading: isUnsubscribing }] = useUnsubscribeMutation();

  const { data: subStatus, isLoading: subStatusLoading } = useGetSubscriptionStatusQuery(userInfo?.email, {
    skip: !userInfo?.email,
  });

  const [sidebarSubscribed, setSidebarSubscribed] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subName, setSubName] = useState('');

  useEffect(() => {
    if (subStatus) setSidebarSubscribed(subStatus.subscribed);
  }, [subStatus]);

  // Data queries
  const { data: aD, refetch: refetchArticles } = useGetArticlesQuery(
    { status: 'published', page: 1, limit: 12, sort: '-createdAt' },
    { pollingInterval: 60000 }
  );
  const { data: mD } = useGetMagazinesQuery(
    { status: 'published', page: 1, limit: 6, sort: '-createdAt' },
    { pollingInterval: 60000 }
  );
  const { data: vD } = useGetVideosQuery(
    { page: 1, limit: 4, sort: '-createdAt' },
    { pollingInterval: 60000 }
  );
  const { data: sugD } = useGetUserSuggestionsQuery(undefined, { skip: !myId });

  const arts = aD?.articles || [];
  const mags = mD?.magazines || [];
  const vids = vD?.videos || [];
  const sugs = sugD || [];

  // Merge feed items and inject inline ads
  const allContent = [
    ...arts.filter(a => !a.isFeatured).map(a => ({ ...a, type: 'article' })),
    ...mags.filter(m => !m.isFeatured).map(m => ({ ...m, type: 'magazine' })),
    ...vids.map(v => ({ ...v, type: 'video' })),
  ].sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt));

  // Insert inline ads after positions 2, 6, 10, 14... (0‑based)
  const items = [];
  let adIndex = 0;
  for (let i = 0; i < allContent.length; i++) {
    items.push(allContent[i]);
    if ((i === 2 || i === 6 || i === 10 || i === 14) && adIndex < inlineAds.length) {
      items.push({ ad: inlineAds[adIndex], type: 'ad' });
      adIndex++;
    }
  }

  // New posts detection
  useEffect(() => {
    const t = allContent.length;
    if (lastPostCount > 0 && t > lastPostCount && window.scrollY > 200) setShowNewPosts(true);
    setLastPostCount(t);
  }, [allContent.length]);

  // Featured items
  const feat = [
    ...arts.filter(a => a.isFeatured).slice(0, 2).map(a => ({ ...a, type: 'article' })),
    ...mags.filter(m => m.isFeatured).slice(0, 2).map(m => ({ ...m, type: 'magazine' })),
  ];

  // Helpers
  const fmtD = (d) => {
    if (!d) return '';
    const n = new Date(), o = new Date(d), dm = Math.floor((n - o) / 60000);
    if (dm < 1) return 'now'; if (dm < 60) return `${dm}m`;
    const dh = Math.floor(dm / 60); if (dh < 24) return `${dh}h`;
    const dd = Math.floor(dh / 24); if (dd < 7) return `${dd}d`;
    return o.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const fmtDur = (s) => {
    if (!s || s === 0) return null;
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
  };

  const getImg = (item) => item.featuredImage || item.images?.[0] || '/placeholder-article.jpg';

  const getAid = (item) => {
    if (item.type === 'article') return extractId(item.authorId?._id || item.authorId || item.createdBy);
    if (item.type === 'video') return extractId(item.user?._id || item.user);
    return '';
  };

  const getName = (item) => {
    if (item.type === 'article') return item.author || item.authorName || item.authorId?.name || 'Editorial';
    if (item.type === 'video') return item.authorName || item.user?.name || item.user?.username || 'Editorial';
    return 'Editorial';
  };

  const getProf = (item) => {
    if (item.type === 'article') return item.authorId?.profile || item.authorProfile || null;
    if (item.type === 'video') return item.authorProfile || item.user?.profile || null;
    return null;
  };

  const isAdmin = (item) => {
    if (item.type !== 'article') return false;
    const at = item.authorType;
    if (!at) return false;
    return String(at).toLowerCase().trim() === 'admin';
  };

  const isYouTube = (item) => item?.videoType === 'youtube';

  // Auth‑guarded actions
  const requireAuth = (actionName) => {
    if (!myId) {
      setPendingAction(actionName);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  // Interaction handlers with modal
  const doLike = async (item, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth('like')) return;
    const k = `${item.type}-${extractId(item._id)}`;
    const cl = (item.likes || []).some(l => extractId(l) === myId);
    const cc = item.likesCount || (item.likes || []).length;
    setOptLikes(p => ({ ...p, [k]: { liked: !(p[k]?.liked ?? cl), count: (p[k]?.count ?? cc) + (cl ? -1 : 1) } }));
    try {
      if (item.type === 'article') await likeA(item._id).unwrap();
      else if (item.type === 'magazine') await likeM(item._id).unwrap();
      else await likeV(item._id).unwrap();
    } catch { setOptLikes(p => ({ ...p, [k]: { liked: cl, count: cc } })); toast.error('Failed'); }
  };

  const doBook = async (item, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth('bookmark')) return;
    const k = `${item.type}-${extractId(item._id)}`;
    const cb = (item.bookmarks || []).some(b => extractId(b) === myId);
    setOptBookmarks(p => ({ ...p, [k]: !(p[k] ?? cb) }));
    try {
      if (item.type === 'article') await bookA(item._id).unwrap();
      else await bookM(item._id).unwrap();
    } catch { setOptBookmarks(p => ({ ...p, [k]: cb })); toast.error('Failed'); }
  };

  const doFollow = async (uid, name, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth('follow')) return;
    const tid = extractId(uid);
    if (!tid || tid === '' || tid === 'undefined' || tid === 'null') return;
    if (tid === myId) return;
    const cf = followingList.some(f => extractId(f) === tid);
    setOptFollows(p => ({ ...p, [tid]: !(p[tid] ?? cf) }));
    try {
      if (cf) { await unfollowU(tid).unwrap(); }
      else { await followU(tid).unwrap(); toast.success(`Following ${name || 'user'}!`); }
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
    const k = `${item.type}-${extractId(item._id)}`;
    if (optLikes[k]) return optLikes[k];
    return { liked: (item.likes || []).some(l => extractId(l) === myId), count: item.likesCount || (item.likes || []).length };
  };

  const isB = (item) => {
    const k = `${item.type}-${extractId(item._id)}`;
    if (optBookmarks[k] !== undefined) return optBookmarks[k];
    return (item.bookmarks || []).some(b => extractId(b) === myId);
  };

  // Featured carousel helpers
  const ftS = (e) => { touchS.current = e.targetTouches[0].clientX; };
  const ftM = (e) => { touchE.current = e.targetTouches[0].clientX; };
  const ftE = () => {
    const d = touchS.current - touchE.current;
    if (Math.abs(d) > 50) {
      if (d > 0 && featIdx < feat.length - 1) setFeatIdx(i => i + 1);
      else if (d < 0 && featIdx > 0) setFeatIdx(i => i - 1);
    }
  };
  const sFeat = (dir) => {
    if (dir === 'next' && featIdx < feat.length - 1) setFeatIdx(i => i + 1);
    if (dir === 'prev' && featIdx > 0) setFeatIdx(i => i - 1);
  };

  // Capacitor share handler (same as BiizzedArticlesScreen)
  const handleShare = async (item, e, path) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${WEBSITE_URL}${path}`;
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: item.title,
        text: item.title,
        url: url,
      });
    } catch (err) {
      // Fallback: browser clipboard or manual copy
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

  // Ad handlers
  const handleAdClick = (ad, e) => {
    e.preventDefault(); e.stopPropagation();
    trackAdClick(ad._id).catch(err => console.error('Ad click track error:', err));
    if (ad.ctaLink) window.open(ad.ctaLink, '_blank');
  };

  // Track ad view when it appears in viewport
  const AdTracker = ({ ad, id }) => {
    const ref = useRef(null);
    const tracked = useRef(false);
    useEffect(() => {
      if (!ad?._id || tracked.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !tracked.current) {
              trackAdView(ad._id).catch(err => console.error('Ad view track error:', err));
              tracked.current = true;
            }
          });
        },
        { threshold: 0.5 }
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [ad]);
    return <div ref={ref} data-ad-id={id} />;
  };

  // Subscription handlers
  const handleAuthSubscribeToggle = async () => {
    if (!userInfo?.email) { toast.error('No email address on your account'); return; }
    try {
      if (sidebarSubscribed) {
        await unsubscribe({ email: userInfo.email }).unwrap();
        setSidebarSubscribed(false);
        toast.success('Unsubscribed');
      } else {
        await subscribe({
          email: userInfo.email,
          name: userInfo.name || userInfo.username || '',
          preferences: { magazines: true, articles: true, weeklyDigest: true },
        }).unwrap();
        setSidebarSubscribed(true);
        toast.success('Subscribed! Check your inbox.');
      }
    } catch (error) {
      toast.error(error?.data?.message || 'Subscription update failed');
    }
  };

  const handleSidebarSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail) { toast.error('Please enter your email address'); return; }
    try {
      await subscribe({
        email: subEmail,
        name: subName,
        preferences: { magazines: true, articles: true, weeklyDigest: true },
      }).unwrap();
      setSidebarSubscribed(true);
      setSubEmail('');
      setSubName('');
      toast.success('Subscribed! Check your inbox.');
    } catch (error) {
      toast.error(error?.data?.message || 'Subscription failed');
    }
  };

  // Loading state
  if (!arts.length && !mags.length && !vids.length) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />

      {showNewPosts && (
        <button
          onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setShowNewPosts(false); }}
          className="fixed top-[120px] left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-full shadow-lg hover:bg-[#142952] animate-bounce"
        >
          <FaArrowUp className="text-sm" /> New posts
        </button>
      )}

      <div className="flex justify-center">
        <div className="w-full max-w-[1280px] flex gap-6 px-0 lg:px-4 py-0 lg:py-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="fixed top-[120px] w-[280px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              {/* Browse Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Browse</h3>
                <nav className="space-y-0.5">
                  {[
                    { name: 'Feed', icon: FaNewspaper, path: '/feed' },
                    { name: 'Articles', icon: FaNewspaper, path: '/articles' },
                    { name: 'Magazines', icon: FaBookOpen, path: '/magazines' },
                    { name: 'Videos', icon: FaVideo, path: '/videos' },
                  ].map(i => (
                    <Link key={i.name} to={i.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${i.path === '/feed' ? 'bg-[#1B3766]/5 text-[#1B3766]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#1B3766]'}`}>
                      <i.icon className="text-gray-400 text-sm" />{i.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Sidebar Ad Slider (horizontal carousel) */}
              {sidebarAds.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 overflow-hidden">
                  <div className="relative">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${sidebarAdIndex * 100}%)` }}
                    >
                      {sidebarAds.map((ad) => (
                        <div
                          key={ad._id}
                          className="w-full flex-shrink-0 cursor-pointer"
                          onClick={(e) => handleAdClick(ad, e)}
                        >
                          <AdTracker ad={ad} id={ad._id} />
                          {ad.mediaType === 'image' && ad.image && (
                            <img src={ad.image} alt={ad.title} className="w-full rounded-xl" />
                          )}
                          {ad.mediaType === 'video' && ad.video && (
                            <video src={ad.video} className="w-full rounded-xl" autoPlay muted loop playsInline />
                          )}
                          <div className="mt-2 text-xs text-gray-500 text-center">
                            <FaAd className="inline mr-1 text-[10px]" /> Sponsored
                          </div>
                        </div>
                      ))}
                    </div>
                    {sidebarAds.length > 1 && (
                      <div className="flex justify-center gap-1.5 mt-2">
                        {sidebarAds.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSidebarAdIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              i === sidebarAdIndex ? 'bg-[#1B3766]' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Banner Ad Cards (stacked) */}
              {bannerAds.map((ad) => (
                <div key={ad._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 cursor-pointer" onClick={(e) => handleAdClick(ad, e)}>
                  <AdTracker ad={ad} id={ad._id} />
                  {ad.mediaType === 'image' && ad.image && <img src={ad.image} alt={ad.title} className="w-full rounded-xl" />}
                  {ad.mediaType === 'video' && ad.video && <video src={ad.video} className="w-full rounded-xl" autoPlay muted loop playsInline />}
                  <div className="mt-2 text-xs text-gray-500 text-center"><FaAd className="inline mr-1 text-[10px]" /> Sponsored</div>
                </div>
              ))}

              {/* Subscription Card */}
              <div className="bg-[#1B3766] rounded-2xl shadow-sm p-5 text-white">
                <FaEnvelope className="text-3xl mx-auto mb-3 text-[#79FFFF]" />
                {userInfo ? (
                  subStatusLoading ? (
                    <div className="text-center py-4"><FaSpinner className="animate-spin text-2xl mx-auto text-white/70" /></div>
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
                        className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${sidebarSubscribed ? "bg-white/20 text-white hover:bg-white/30" : "bg-white text-[#1B3766] hover:bg-gray-100"}`}
                      >
                        {isSubscribing || isUnsubscribing ? "Updating..." : sidebarSubscribed ? "Unsubscribe" : "Subscribe Free"}
                      </button>
                      {sidebarSubscribed && <FaCheckCircle className="text-white/50 text-xs mx-auto mt-2" />}
                    </>
                  )
                ) : (
                  <>
                    <h4 className="font-semibold text-lg mb-2">Weekly Digest</h4>
                    <p className="text-xs text-white/70 mb-4 leading-relaxed">Best articles & magazines every Friday. No spam.</p>
                    <form onSubmit={handleSidebarSubscribe}>
                      <input type="email" placeholder="Your email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} className="w-full px-3 py-2 mb-2 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" required />
                      <input type="text" placeholder="First name (optional)" value={subName} onChange={(e) => setSubName(e.target.value)} className="w-full px-3 py-2 mb-3 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
                      <button type="submit" disabled={isSubscribing} className="w-full py-2 bg-white text-[#1B3766] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60">{isSubscribing ? "Subscribing..." : "Subscribe Free"}</button>
                    </form>
                    <p className="text-[10px] text-white/50 mt-3 text-center">No spam, unsubscribe any time.</p>
                  </>
                )}
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <main className="flex-1 max-w-full lg:max-w-[680px] mx-auto lg:mx-0 pb-8 lg:rounded-2xl lg:shadow-sm lg:border lg:border-gray-200 lg:bg-white overflow-hidden bg-white">
            <div className="bg-gradient-to-r from-[#1B3766] to-[#142952] p-5 text-white lg:rounded-t-2xl">
              <h2 className="text-lg font-bold mb-1">Discover & Connect 📰</h2>
              <p className="text-white/70 text-sm">Articles, magazines, videos, and sponsored content from creators worldwide.</p>
            </div>

            {/* Featured Carousel */}
            {feat.length > 0 && (
              <div className="border-b-2 border-[#1B3766]">
                <div className="flex items-center justify-between px-4 py-2 bg-[#1B3766]/5">
                  <div className="flex items-center gap-2"><FaBolt className="text-yellow-500" /><span className="text-xs font-bold text-[#1B3766] uppercase">Featured</span></div>
                  <div className="hidden lg:flex items-center gap-1">
                    <button onClick={() => sFeat('prev')} disabled={featIdx === 0} className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-30"><FaChevronLeft className="text-xs" /></button>
                    <span className="text-xs text-gray-500 mx-1">{featIdx + 1}/{feat.length}</span>
                    <button onClick={() => sFeat('next')} disabled={featIdx >= feat.length - 1} className="p-1.5 rounded-full hover:bg-gray-200 disabled:opacity-30"><FaChevronRight className="text-xs" /></button>
                  </div>
                </div>
                {/* Mobile touch slider */}
                <div className="lg:hidden relative overflow-hidden" onTouchStart={ftS} onTouchMove={ftM} onTouchEnd={ftE}>
                  <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${featIdx * 100}%)` }}>
                    {feat.map((item) => (
                      <div key={`f-${item._id}`} className="w-full flex-shrink-0">
                        {item.type === 'magazine' ? <FMC item={item} fmtD={fmtD} getLD={getLD} isB={isB} doLike={doLike} doBook={doBook} /> : <FAC item={item} fmtD={fmtD} getImg={getImg} getLD={getLD} isB={isB} doLike={doLike} doBook={doBook} />}
                      </div>
                    ))}
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {feat.map((_, i) => <button key={i} onClick={() => setFeatIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === featIdx ? 'bg-white scale-125' : 'bg-white/50'}`} />)}
                  </div>
                </div>
                <div className="hidden lg:block">
                  {feat.map((item, i) => (
                    <div key={`f-${item._id}`} className={i === featIdx ? '' : 'hidden'}>
                      {item.type === 'magazine' ? <FMC item={item} fmtD={fmtD} getLD={getLD} isB={isB} doLike={doLike} doBook={doBook} /> : <FAC item={item} fmtD={fmtD} getImg={getImg} getLD={getLD} isB={isB} doLike={doLike} doBook={doBook} />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feed items (including inline ads) */}
            <div>
              {items.map((item, idx) => {
                if (item.type === 'ad') {
                  const ad = item.ad;
                  return (
                    <div key={`ad-${ad._id}`} className="border-b border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={(e) => handleAdClick(ad, e)}>
                      <AdTracker ad={ad} id={ad._id} />
                      <div className="flex items-center gap-2 mb-2">
                        <FaAd className="text-gray-400 text-sm" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsored</span>
                      </div>
                      {ad.mediaType === 'image' && ad.image && <img src={ad.image} alt={ad.title} className="w-full rounded-xl mb-2" />}
                      {ad.mediaType === 'video' && ad.video && <video src={ad.video} className="w-full rounded-xl mb-2" controls autoPlay muted playsInline />}
                      <h3 className="font-semibold text-gray-900 mt-2">{ad.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{ad.subtitle || ad.description}</p>
                      {ad.ctaText && ad.ctaLink && <div className="mt-3 text-sm font-medium text-[#1B3766] hover:underline inline-block">{ad.ctaText} →</div>}
                    </div>
                  );
                }
                const itemObj = item;
                const aid = getAid(itemObj);
                const aname = getName(itemObj);
                const aprof = getProf(itemObj);
                const f = isF(aid);
                const own = myId && aid ? myId === aid : false;
                const ld = getLD(itemObj);
                const bm = isB(itemObj);
                const admin = isAdmin(itemObj);
                const yt = isYouTube(itemObj);
                if (itemObj.type === 'magazine') return <MBC key={`m-${itemObj._id}`} item={itemObj} idx={idx} total={items.length} ld={ld} bm={bm} fmtD={fmtD} doLike={doLike} doBook={doBook} handleShare={handleShare} />;
                if (itemObj.type === 'video') return <VC key={`v-${itemObj._id}`} item={itemObj} idx={idx} total={items.length} aid={aid} aname={aname} aprof={aprof} f={f} own={own} admin={admin} yt={yt} ld={ld} fmtD={fmtD} fmtDur={fmtDur} doLike={doLike} doFollow={doFollow} handleShare={handleShare} />;
                return <AC key={`a-${itemObj._id}`} item={itemObj} idx={idx} total={items.length} aid={aid} aname={aname} aprof={aprof} f={f} own={own} admin={admin} ld={ld} bm={bm} fmtD={fmtD} getImg={getImg} doLike={doLike} doBook={doBook} doFollow={doFollow} handleShare={handleShare} />;
              })}
            </div>

            <div className="text-center py-6 border-t border-gray-200">
              <Link to="/articles" className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-colors inline-block">
                View All Content
              </Link>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-[280px] flex-shrink-0">
            <div className="fixed top-[120px] w-[280px] h-[calc(100vh-140px)] overflow-y-auto space-y-4 pb-8 no-scrollbar">
              {/* People You May Know */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">People You May Know</h3>
                {myId ? (sugs.length > 0 ? (
                  <div className="space-y-3">
                    {sugs.filter(u => extractId(u._id) !== myId).slice(0, 5).map(user => {
                      const uid = extractId(user._id);
                      const ff = isF(uid);
                      return (
                        <div key={uid} className="flex items-center gap-3">
                          {user.profile ? <img src={user.profile} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <div className="w-10 h-10 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{(user.name||'U')[0].toUpperCase()}</div>}
                          <Link to={`/user/${uid}`} className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate hover:underline">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.followersCount||0} followers</p>
                          </Link>
                          <button onClick={(e) => doFollow(uid, user.name, e)} className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full transition-colors flex-shrink-0 ${ff ? 'bg-[#1B3766] text-white hover:bg-red-500' : 'text-[#1B3766] border border-[#1B3766] hover:bg-[#1B3766] hover:text-white'}`}>
                            {ff ? <><FaCheck className="text-[8px]" /> Following</> : <><FaPlus className="text-[8px]" /> Follow</>}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-gray-400 text-center py-4">No suggestions yet</p>) : (<div className="text-center py-4"><Link to="/login" className="text-xs text-[#1B3766] font-medium hover:underline">Login to connect</Link></div>)}
              </div>

              {/* Subscription Card */}
              <div className="bg-[#1B3766] rounded-2xl shadow-sm p-5 text-white">
                <FaEnvelope className="text-3xl mx-auto mb-3 text-[#79FFFF]" />
                {userInfo ? (subStatusLoading ? (<div className="text-center py-4"><FaSpinner className="animate-spin text-2xl mx-auto text-white/70" /></div>) : (<>
                  <h4 className="font-semibold text-lg mb-2">Weekly Digest</h4>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed">{sidebarSubscribed ? "You’re receiving our weekly highlights. Toggle to unsubscribe." : "Get the best articles & magazines every Friday, straight to your inbox."}</p>
                  <button onClick={handleAuthSubscribeToggle} disabled={isSubscribing || isUnsubscribing} className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${sidebarSubscribed ? "bg-white/20 text-white hover:bg-white/30" : "bg-white text-[#1B3766] hover:bg-gray-100"}`}>{isSubscribing || isUnsubscribing ? "Updating..." : sidebarSubscribed ? "Unsubscribe" : "Subscribe Free"}</button>
                  {sidebarSubscribed && <FaCheckCircle className="text-white/50 text-xs mx-auto mt-2" />}
                </>)) : (<>
                  <h4 className="font-semibold text-lg mb-2">Weekly Digest</h4>
                  <p className="text-xs text-white/70 mb-4 leading-relaxed">Best articles & magazines every Friday. No spam.</p>
                  <form onSubmit={handleSidebarSubscribe}>
                    <input type="email" placeholder="Your email" value={subEmail} onChange={(e) => setSubEmail(e.target.value)} className="w-full px-3 py-2 mb-2 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" required />
                    <input type="text" placeholder="First name (optional)" value={subName} onChange={(e) => setSubName(e.target.value)} className="w-full px-3 py-2 mb-3 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
                    <button type="submit" disabled={isSubscribing} className="w-full py-2 bg-white text-[#1B3766] rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60">{isSubscribing ? "Subscribing..." : "Subscribe Free"}</button>
                  </form>
                  <p className="text-[10px] text-white/50 mt-3 text-center">No spam, unsubscribe any time.</p>
                </>)}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <BiizzedBottomBar />
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}.line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}@keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}.animate-fadeInUp{animation:fadeInUp 0.28s ease-out}`}</style>
    </div>
  );
};

// ====== FEATURED ARTICLE CARD ======
const FAC = ({ item, fmtD, getImg, getLD, isB, doLike, doBook }) => {
  const { liked, count } = getLD(item);
  const n = item.author || 'Editorial';
  const p = item.authorId?.profile;
  return (
    <Link to={`/articles/${item.slug}`} className="block relative w-full h-[300px] sm:h-[400px] lg:h-[350px] overflow-hidden">
      <img src={getImg(item)} alt="" className="w-full h-full object-cover" onError={e => e.target.src='/placeholder-article.jpg'} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full"><FaStar className="text-[10px] inline mr-1"/>FEATURED</span>
        <span className="px-3 py-1 bg-white/90 text-gray-900 text-xs font-bold rounded-full"><FaNewspaper className="text-[10px] inline mr-1"/>Article</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-2">
          {p ? <img src={p} alt="" className="w-6 h-6 rounded-full object-cover border border-white/50" /> : <div className="w-6 h-6 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-[10px] font-bold">{n[0]}</div>}
          <span className="text-white/90 text-sm">{n}</span><span className="text-white/50 text-sm">·</span><span className="text-white/50 text-sm">{fmtD(item.publishedAt || item.createdAt)}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight mb-2">{item.title}</h2>
        <div className="flex items-center gap-4">
          <button onClick={e => doLike(item, e)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${liked ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>{liked ? <FaHeart/> : <FaRegHeart/>} {count}</button>
          <button onClick={e => doBook(item, e)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isB(item) ? 'bg-[#1B3766] text-white' : 'bg-white/20 text-white'}`}>{isB(item) ? <FaBookmark/> : <FaRegBookmark/>} Save</button>
        </div>
      </div>
    </Link>
  );
};

// ====== FEATURED MAGAZINE CARD ======
const FMC = ({ item, fmtD, getLD, isB, doLike, doBook }) => {
  const { liked, count } = getLD(item);
  return (
    <Link to={`/${item.slug}`} className="block relative w-full h-[300px] sm:h-[400px] lg:h-[350px] overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-800 to-[#1B3766]">
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
        <div className="flex items-center justify-center gap-1 sm:gap-2 transform rotate-[-2deg]">
          <div className="w-[45%] aspect-[3/4] bg-white/10 rounded-l-lg rounded-r-sm shadow-2xl border-l-4 border-white/20 flex items-center justify-center"><FaBookOpen className="text-4xl text-white/30"/></div>
          <div className="w-[45%] aspect-[3/4] bg-white rounded-r-lg rounded-l-sm shadow-2xl overflow-hidden flex flex-col">
            {item.coverImage ? <img src={item.coverImage} alt="" className="w-full h-[60%] object-cover"/> : <div className="w-full h-[60%] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><FaBookOpen className="text-4xl text-white/50"/></div>}
            <div className="flex-1 p-3 flex flex-col justify-between"><span className="text-[10px] font-bold text-purple-600 uppercase">Magazine</span><h3 className="text-sm font-bold text-gray-900 line-clamp-2 mt-0.5">{item.title}</h3><div className="flex justify-between"><span className="text-[10px] text-gray-500">{fmtD(item.createdAt)}</span><FaArrowRight className="text-purple-600 text-xs"/></div></div>
          </div>
        </div>
      </div>
      <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full"><FaStar className="text-[10px] inline mr-1"/>FEATURED</span></div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          <button onClick={e => doLike(item, e)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${liked ? 'bg-red-500 text-white' : 'bg-white/20 text-white'}`}>{liked ? <FaHeart/> : <FaRegHeart/>} {count}</button>
          <button onClick={e => doBook(item, e)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isB(item) ? 'bg-[#1B3766] text-white' : 'bg-white/20 text-white'}`}>{isB(item) ? <FaBookmark/> : <FaRegBookmark/>} Save</button>
        </div>
      </div>
    </Link>
  );
};

// ====== ARTICLE CARD ======
const AC = ({ item, idx, total, aid, aname, aprof, f, own, admin, ld, bm, fmtD, getImg, doLike, doBook, doFollow, handleShare }) => {
  const sharePath = `/articles/${item.slug}`;
  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer">
      <Link to={`/articles/${item.slug}`} className="block">
        <div className="flex">
          <div className="flex flex-col items-center w-[48px] pt-3 px-2">
            <Link to={`/user/${aid}`} onClick={e => e.stopPropagation()}>
              {aprof ? <img src={aprof} alt="" className="w-10 h-10 rounded-full object-cover"/> : <div className="w-10 h-10 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold">{aname[0]}</div>}
            </Link>
            {idx < total - 1 && <div className="w-[2px] flex-1 bg-gray-200 mt-2"/>}
          </div>
          <div className="flex-1 pt-3 pr-3 pb-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Link to={`/user/${aid}`} onClick={e=>e.stopPropagation()} className="font-bold text-gray-900 text-[15px] hover:underline truncate">{aname}</Link>
              {admin && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full"><FaCheckCircle className="text-[8px]" /> Admin</span>}
              <span className="text-gray-500 text-[15px]">·</span><span className="text-gray-500 text-[15px]">{fmtD(item.publishedAt || item.createdAt)}</span>
              {!own && !!aid && !admin && (
                <button onClick={e => doFollow(aid, aname, e)} className={`ml-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${f ? 'bg-[#1B3766] text-white' : 'text-[#1B3766] border border-[#1B3766]'}`}>{f ? <><FaCheck className="text-[8px]"/>Following</> : <><FaPlus className="text-[8px]"/>Follow</>}</button>
              )}
            </div>
            <span className="text-[#1B3766] text-[13px] font-medium block mb-1"><FaNewspaper className="text-[10px] inline mr-1"/>Article · <span className="text-gray-500">{item.readTime||'5 min'} read</span></span>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-1">{item.title}</h2>
            {item.excerpt && <p className="text-[15px] text-gray-500 line-clamp-2 mb-2">{item.excerpt}</p>}
            <div className="mb-3 rounded-2xl overflow-hidden border border-gray-200"><img src={getImg(item)} alt="" className="w-full h-auto max-h-[500px] object-cover" onError={e=>e.target.src='/placeholder-article.jpg'}/></div>
            <AB item={item} ld={ld} bm={bm} doLike={doLike} doBook={doBook} handleShare={handleShare} sharePath={sharePath} />
          </div>
        </div>
      </Link>
    </article>
  );
};

// ====== MAGAZINE CARD ======
const MBC = ({ item, idx, total, ld, bm, fmtD, doLike, doBook, handleShare }) => {
  const sharePath = `/${item.slug}`;
  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer">
      <Link to={`/${item.slug}`} className="block">
        <div className="flex">
          <div className="flex flex-col items-center w-[48px] pt-3 px-2"><div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center"><FaBookOpen/></div>{idx < total - 1 && <div className="w-[2px] flex-1 bg-gray-200 mt-2"/>}</div>
          <div className="flex-1 pt-3 pr-3 pb-3">
            <div className="flex items-center gap-1.5 mb-2"><span className="font-bold text-gray-900 text-[15px]">{item.author||'Editorial'}</span><span className="text-gray-500">·</span><span className="text-gray-500 text-[15px]">{fmtD(item.createdAt)}</span><span className="ml-auto px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">MAGAZINE</span></div>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-3">{item.title}</h2>
            <div className="mb-3 flex justify-center gap-0">
              <div className="w-3 h-[200px] sm:h-[260px] bg-gradient-to-r from-gray-300 to-gray-400 rounded-l-sm"/><div className="w-[45%] h-[200px] sm:h-[260px] bg-white rounded-r-md shadow-xl overflow-hidden flex flex-col border border-gray-200">{item.coverImage ? <img src={item.coverImage} alt="" className="w-full h-[65%] object-cover"/> : <div className="w-full h-[65%] bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center"><FaBookOpen className="text-4xl text-white/50"/></div>}<div className="flex-1 p-2 flex flex-col justify-between"><h3 className="text-xs font-bold text-gray-900 line-clamp-2">{item.title}</h3></div></div><div className="w-[6%] h-[190px] sm:h-[250px] bg-gray-100 rounded-r-sm shadow-md -ml-1 border border-gray-200"/>
            </div>
            <AB item={item} ld={ld} bm={bm} doLike={doLike} doBook={doBook} handleShare={handleShare} sharePath={sharePath} />
          </div>
        </div>
      </Link>
    </article>
  );
};

// ====== VIDEO CARD WITH AUTO-PLAY ======
const VC = ({ item, idx, total, aid, aname, aprof, f, own, admin, yt, ld, fmtD, fmtDur, doLike, doFollow, handleShare }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const sharePath = `/videos/${item._id}`;

  useEffect(() => {
    if (yt) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.6 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => { if (containerRef.current) observer.unobserve(containerRef.current); };
  }, [yt]);

  const toggleMute = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const getVideoThumbnail = () => {
    if (yt) return item.youtubeThumbnail || item.thumbnail;
    return item.thumbnail;
  };

  return (
    <article className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors cursor-pointer relative">
      <Link to={`/videos/${item._id}`} className="block">
        <div className="flex">
          <div className="flex flex-col items-center w-[48px] pt-3 px-2">
            <Link to={`/user/${aid}`} onClick={e=>e.stopPropagation()}>
              {aprof ? <img src={aprof} alt="" className="w-10 h-10 rounded-full object-cover"/> : (
                <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold ${yt ? 'bg-red-600' : 'bg-red-500'}`}>
                  {yt ? <FaYoutube className="text-lg" /> : aname[0]}
                </div>
              )}
            </Link>
            {idx < total - 1 && <div className="w-[2px] flex-1 bg-gray-200 mt-2"/>}
          </div>
          <div className="flex-1 pt-3 pr-3 pb-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Link to={`/user/${aid}`} onClick={e=>e.stopPropagation()} className="font-bold text-gray-900 text-[15px] hover:underline truncate">{aname}</Link>
              {yt && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full"><FaYoutube className="text-[8px]" /> YouTube</span>}
              {admin && <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full"><FaCheckCircle className="text-[8px]" /> Admin</span>}
              <span className="text-gray-500">·</span><span className="text-gray-500 text-[15px]">{fmtD(item.createdAt)}</span>
              {!own && !!aid && !admin && (
                <button onClick={e => doFollow(aid, aname, e)} className={`ml-2 flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${f ? 'bg-[#1B3766] text-white' : 'text-[#1B3766] border border-[#1B3766]'}`}>{f ? <><FaCheck className="text-[8px]"/>Following</> : <><FaPlus className="text-[8px]"/>Follow</>}</button>
              )}
            </div>
            <span className={`text-[13px] font-medium block mb-1 ${yt ? 'text-red-600' : 'text-red-500'}`}>
              {yt ? <FaYoutube className="text-[10px] inline mr-1"/> : <FaVideo className="text-[10px] inline mr-1"/>}
              Video{yt ? ' (YouTube)' : ''} · <span className="text-gray-500">{yt ? 'YouTube' : fmtDur(item.duration) || '0:00'}</span>
            </span>
            <h2 className="text-[17px] font-semibold text-gray-900 mb-1">{item.title}</h2>
            <div ref={containerRef} className="mb-3 relative rounded-2xl overflow-hidden border border-gray-200 bg-black">
              {!yt && item.videoUrl ? (
                <>
                  <video ref={videoRef} src={item.videoUrl} className="w-full h-auto block" style={{ maxHeight: 'none' }} muted loop playsInline preload="auto" poster={item.thumbnail} onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (videoRef.current) { videoRef.current.paused ? videoRef.current.play().catch(()=>{}) : videoRef.current.pause(); setIsPlaying(!videoRef.current.paused); } }} />
                  <button onClick={toggleMute} className="absolute bottom-2 left-2 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors z-10">{isMuted ? <FaVolumeMute className="text-sm" /> : <FaVolumeUp className="text-sm" />}</button>
                  {!isPlaying && (<div className="absolute inset-0 flex items-center justify-center bg-black/20"><FaPlay className="text-white text-4xl opacity-80" /></div>)}
                </>
              ) : yt ? (
                <div className="w-full">
                  <img src={getVideoThumbnail()} alt={item.title} className="w-full h-auto block" style={{ maxHeight: 'none' }} onError={(e) => { if (item.youtubeId) e.target.src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`; }} />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-red-600/90 text-white text-xs rounded flex items-center gap-1"><FaYoutube className="text-[10px]" /> YouTube</div>
                </div>
              ) : (
                <div className="w-full bg-gray-900 flex items-center justify-center" style={{ minHeight: '200px' }}><FaVideo className="text-5xl text-gray-600" /></div>
              )}
              {!yt && fmtDur(item.duration) && (<div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">{fmtDur(item.duration)}</div>)}
            </div>
            <AB item={item} ld={ld} doLike={doLike} sharePath={sharePath} handleShare={handleShare} yt={yt} />
          </div>
        </div>
      </Link>
    </article>
  );
};

// ====== ACTION BAR ======
// Uses the same Capacitor share function as BiizzedArticlesScreen
const AB = ({ item, ld, bm, doLike, doBook, handleShare, sharePath, yt }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <button onClick={e => doLike(item, e)} className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${ld.liked ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}>
          {ld.liked ? <FaHeart className="text-sm" /> : <FaRegHeart className="text-sm" />}
          <span className="text-[13px] font-medium">{ld.count || 0}</span>
        </button>
        <button onClick={e => { e.preventDefault(); e.stopPropagation(); }} className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors">
          <FaRegComment className="text-sm" />
          <span className="text-[13px] font-medium">{item.comments?.length || 0}</span>
        </button>
        <div className="flex items-center gap-1.5 px-3 py-2 text-gray-500">
          <FaEye className="text-sm" />
          <span className="text-[13px] font-medium">{item.views || 0}</span>
        </div>
        {/* Share button using Capacitor + fallback */}
        <button
          onClick={(e) => handleShare(item, e, sharePath)}
          className="group flex items-center gap-1.5 px-3 py-2 rounded-full text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5 transition-colors"
        >
          <FaPaperPlane className="text-sm" />
        </button>
        {doBook && (
          <button onClick={e => doBook(item, e)} className={`group flex items-center gap-1.5 px-3 py-2 rounded-full transition-colors ${bm ? 'text-[#1B3766] bg-[#1B3766]/5' : 'text-gray-500 hover:text-[#1B3766] hover:bg-[#1B3766]/5'}`}>
            {bm ? <FaBookmark className="text-sm" /> : <FaRegBookmark className="text-sm" />}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {yt && (<a href={`https://www.youtube.com/watch?v=${item.youtubeId}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 rounded-full text-[11px] font-medium hover:bg-red-100 transition-colors"><FaYoutube className="text-xs" /><span className="hidden sm:inline">Watch on YouTube</span><FaExternalLinkAlt className="text-[8px] hidden sm:inline" /></a>)}
        <span className="text-[11px] font-semibold text-[#1B3766] bg-[#1B3766]/5 px-2.5 py-1.5 rounded-full">Biizzed</span>
      </div>
    </div>
  );
};

export default BiizzedFeed;