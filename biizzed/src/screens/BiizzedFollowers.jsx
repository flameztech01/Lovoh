// screens/BiizzedFollowers.jsx - With Optimistic Follow/Unfollow
import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft, FaUser, FaSpinner, FaPlus, FaCheck,
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
  const { data: profileData } = useGetProfileInfoQuery(undefined, { skip: !userInfo?._id });
  
  const myId = extractId(userInfo?._id);
  const followingList = profileData?.following || [];
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'followers');
  const [optFollows, setOptFollows] = useState({});

  const { data: followersData, isLoading: followersLoading, refetch: refetchFollowers } = useGetFollowersQuery({ id: myId }, { skip: !myId });
  const { data: followingData, isLoading: followingLoading, refetch: refetchFollowing } = useGetFollowingQuery({ id: myId }, { skip: !myId });
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const followers = followersData?.followers || [];
  const following = followingData?.following || [];

  const handleFollowToggle = async (user, name, e) => {
    e.preventDefault(); e.stopPropagation();
    if (!myId) { toast.info('Login'); return; }
    
    const tid = extractId(user._id || user);
    if (!tid || tid === '' || tid === myId) return;
    
    const cf = followingList.some(f => extractId(f) === tid);
    
    // Optimistic update
    setOptFollows(p => ({ ...p, [tid]: !(p[tid] ?? cf) }));
    
    try {
      if (cf) { 
        await unfollowUser(tid).unwrap(); 
      } else { 
        await followUser(tid).unwrap(); 
        toast.success(`Following ${name || 'user'}!`); 
      }
      // Refetch both lists after follow/unfollow
      refetchFollowers();
      refetchFollowing();
    } catch (err) {
      setOptFollows(p => ({ ...p, [tid]: cf }));
      if (err?.data?.message?.includes('already')) {
        setOptFollows(p => ({ ...p, [tid]: true }));
      } else {
        toast.error('Failed');
      }
    }
  };

  const isF = (uid) => {
    const id = extractId(uid);
    if (!id) return false;
    if (optFollows[id] !== undefined) return optFollows[id];
    return followingList.some(f => extractId(f) === id);
  };

  const isLoading = followersLoading || followingLoading;

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-100">
        <BiizzedArticlesNavbar />
        <div className="text-center py-20">
          <FaUser className="text-5xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Login to view</p>
        </div>
        <BiizzedBottomBar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BiizzedArticlesNavbar />
      
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-200 flex items-center justify-center">
            <FaArrowLeft className="text-sm" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Connections</h1>
        </div>

        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200 mb-4">
          <button onClick={() => setActiveTab('followers')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'followers' ? 'bg-[#1B3766] text-white' : 'text-gray-500'}`}>
            {followers.length} Followers
          </button>
          <button onClick={() => setActiveTab('following')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'following' ? 'bg-[#1B3766] text-white' : 'text-gray-500'}`}>
            {following.length} Following
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-2xl text-[#1B3766]" /></div>
        ) : (
          <div className="space-y-2">
            {(activeTab === 'followers' ? followers : following).map((user) => {
              const uid = extractId(user._id || user);
              const ff = isF(uid);
              const isOwn = myId === uid;
              
              return (
                <div key={uid} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                  <Link to={`/user/${uid}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {user.profile ? (
                      <img src={user.profile} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
                        {(user.name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username || 'user'}</p>
                      {user.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{user.bio}</p>}
                    </div>
                  </Link>
                  
                  {!isOwn && (
                    <button 
                      onClick={(e) => handleFollowToggle(user, user.name, e)} 
                      className={`flex items-center gap-1 px-4 py-2 text-xs font-medium rounded-full transition-colors flex-shrink-0 ${
                        ff ? 'bg-[#1B3766] text-white hover:bg-red-500' : 'text-[#1B3766] border border-[#1B3766] hover:bg-[#1B3766] hover:text-white'
                      }`}
                    >
                      {ff ? <><FaCheck className="text-[10px]" /> Following</> : <><FaPlus className="text-[10px]" /> Follow</>}
                    </button>
                  )}
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