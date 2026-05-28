// screens/BiizzedFollowers.jsx - With Optimistic Follow/Unfollow & Profile Navigation using Username
import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaSpinner, FaPlus, FaCheck,
  FaUsers, FaUserPlus, FaUserCheck, FaSearch,
} from 'react-icons/fa';
import { useGetFollowersQuery, useGetFollowingQuery, useFollowUserMutation, useUnfollowUserMutation, useGetProfileInfoQuery } from '../slices/userApiSlice';
import { useSelector } from 'react-redux';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
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

const BiizzedFollowers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profileData, refetch: refetchProfile } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });
  
  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'followers');
  const [optFollows, setOptFollows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const { data: followersData, isLoading: followersLoading, refetch: refetchFollowers } = useGetFollowersQuery({ id: myId }, { skip: !myId });
  const { data: followingData, isLoading: followingLoading, refetch: refetchFollowing } = useGetFollowingQuery({ id: myId }, { skip: !myId });
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const followers = followersData?.followers || [];
  const following = followingData?.following || [];

  // Filter based on search term
  const filterUsers = (users) => {
    if (!searchTerm) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term) ||
      user.bio?.toLowerCase().includes(term)
    );
  };

  const filteredFollowers = filterUsers(followers);
  const filteredFollowing = filterUsers(following);

  const handleFollowToggle = async (user, e) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!myId) { 
      toast.info('Please login to follow users');
      navigate('/login');
      return; 
    }
    
    const tid = extractId(user._id || user);
    if (!tid || tid === '' || tid === myId) return;
    
    const cf = followingList.some(f => extractId(f) === tid);
    
    // Optimistic update
    setOptFollows(p => ({ ...p, [tid]: !(p[tid] ?? cf) }));
    
    try {
      if (cf) { 
        await unfollowUser(tid).unwrap(); 
        toast.success(`Unfollowed ${user.name || 'user'}`);
      } else { 
        await followUser(tid).unwrap(); 
        toast.success(`Now following ${user.name || 'user'}!`); 
      }
      refetchProfile();
      refetchFollowers();
      refetchFollowing();
    } catch (err) {
      setOptFollows(p => ({ ...p, [tid]: cf }));
      if (err?.data?.message?.includes('already')) {
        setOptFollows(p => ({ ...p, [tid]: true }));
      } else {
        toast.error(err?.data?.message || 'Action failed');
      }
    }
  };

  const isFollowingUser = (uid) => {
    const id = extractId(uid);
    if (!id) return false;
    if (optFollows[id] !== undefined) return optFollows[id];
    return followingList.some(f => extractId(f) === id);
  };

  // Updated to use username instead of ID
  const handleUserClick = (username) => {
    navigate(`/user/${username}`);
  };

  const isLoading = followersLoading || followingLoading;

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BiizzedArticlesNavbar />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="w-20 h-20 bg-[#1B3766]/10 rounded-full flex items-center justify-center mb-4">
            <FaUsers className="text-3xl text-[#1B3766]" />
          </div>
          <p className="text-gray-500 mb-4">Login to view your connections</p>
          <Link to="/login" className="px-6 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors shadow-sm">
            Login
          </Link>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  const currentList = activeTab === 'followers' ? filteredFollowers : filteredFollowing;
  const totalCount = activeTab === 'followers' ? followers.length : following.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <BiizzedArticlesNavbar />
      
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-all"
          >
            <FaArrowLeft className="text-gray-600 text-sm" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Connections</h1>
            <p className="text-xs text-gray-500 mt-0.5">{totalCount} total connections</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-4">
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab('followers')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'followers' 
                  ? 'bg-[#1B3766] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaUsers className="text-xs" />
              Followers
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'followers' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {followers.length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('following')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === 'following' 
                  ? 'bg-[#1B3766] text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FaUserPlus className="text-xs" />
              Following
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === 'following' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {following.length}
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]/20 focus:border-[#1B3766] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-2xl text-[#1B3766]" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-[#1B3766]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'followers' ? (
                <FaUsers className="text-2xl text-[#1B3766]" />
              ) : (
                <FaUserPlus className="text-2xl text-[#1B3766]" />
              )}
            </div>
            <p className="text-gray-500 mb-2">
              {activeTab === 'followers' 
                ? 'No followers yet' 
                : searchTerm 
                  ? 'No matching users found'
                  : 'Not following anyone yet'}
            </p>
            <p className="text-xs text-gray-400">
              {activeTab === 'followers' 
                ? 'When people follow you, they\'ll appear here' 
                : searchTerm
                  ? 'Try a different search term'
                  : 'Follow users to see them here'}
            </p>
            {activeTab === 'following' && !searchTerm && (
              <Link 
                to="/feed" 
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952] transition-colors"
              >
                <FaUserPlus className="text-xs" /> Discover Users
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentList.map((user) => {
              const uid = extractId(user._id || user);
              const isFollowing = isFollowingUser(uid);
              const isOwn = myId === uid;
              
              return (
                <div 
                  key={uid} 
                  className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group"
                  onClick={() => handleUserClick(user.username)} // Using username now
                >
                  <div className="p-4 flex items-center justify-between">
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Avatar */}
                      {user.profile ? (
                        <img 
                          src={user.profile} 
                          alt={user.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1B3766] to-[#142952] text-white flex items-center justify-center text-xl font-bold shadow-sm flex-shrink-0">
                          {(user.name || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      
                      {/* Details - Removed follower/following counts */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-base font-semibold text-gray-900 truncate">
                            {user.name}
                          </p>
                          {user.biizzed_contributor && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-medium">
                              Contributor
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">@{user.username || 'user'}</p>
                        {user.bio && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{user.bio}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Follow Button */}
                    {!isOwn && (
                      <button 
                        onClick={(e) => handleFollowToggle(user, e)} 
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all flex-shrink-0 ${
                          isFollowing 
                            ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200' 
                            : 'bg-[#1B3766] text-white hover:bg-[#142952] shadow-sm'
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <FaUserCheck className="text-[10px]" /> Following
                          </>
                        ) : (
                          <>
                            <FaPlus className="text-[10px]" /> Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedFollowers;