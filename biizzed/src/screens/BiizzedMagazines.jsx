// screens/BiizzedMagazines.jsx – With Coming Soon section
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FaSpinner, FaEye, FaHeart, FaRegHeart, FaBookmark, FaRegBookmark,
  FaShare, FaFire, FaClock, FaDownload, FaUser, FaComment, FaNewspaper,
  FaHourglassHalf,
} from 'react-icons/fa';
import { useGetMagazinesQuery, useLikeMagazineMutation, useBookmarkMagazineMutation } from '../slices/magApiSlice';
import BiizzedArticlesNavbar from '../components/BiizzedArticlesNavbar';
import BiizzedBottomBar from '../components/BiizzedBottomBar';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const BiizzedMagazines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [likeMagazine] = useLikeMagazineMutation();
  const [bookmarkMagazine] = useBookmarkMagazineMutation();
  
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlFeatured = searchParams.get('featured') === 'true';
  const urlSort = searchParams.get('sort') || '';

  // Fetch both published and coming soon magazines
  const queryParams = {
    status: 'published,coming_soon',   // get both statuses
    page: currentPage,
    limit: 12,
  };

  if (urlSearch) queryParams.search = urlSearch;
  if (urlCategory) queryParams.category = urlCategory;
  if (urlFeatured) queryParams.featured = true;
  if (urlSort === 'latest') queryParams.sort = '-createdAt';
  if (urlSort === 'trending') queryParams.sort = '-views';

  const { data: magazinesData, isLoading, isFetching } = useGetMagazinesQuery(queryParams);

  const allMagazines = magazinesData?.magazines || [];
  const totalPages = magazinesData?.pages || 1;
  const total = magazinesData?.total || 0;

  // Split into published and coming soon
  const publishedMagazines = allMagazines.filter(m => m.status !== 'coming_soon');
  const comingSoonMagazines = allMagazines.filter(m => m.status === 'coming_soon');

  useEffect(() => {
    setCurrentPage(1);
  }, [urlSearch, urlCategory, urlFeatured, urlSort]);

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const magazineDate = new Date(date);
    const diffMs = now - magazineDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return magazineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleLike = async (magazineId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) { toast.info('Login to like magazines'); return; }
    try { await likeMagazine(magazineId).unwrap(); } catch { toast.error('Failed to like'); }
  };

  const handleBookmark = async (magazineId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userInfo) { toast.info('Login to bookmark magazines'); return; }
    try { await bookmarkMagazine(magazineId).unwrap(); } catch { toast.error('Failed to bookmark'); }
  };

  if (isLoading && allMagazines.length === 0) {
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
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
              {urlCategory || 'Magazines'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {total > 0 ? `${total} editions` : 'Premium digital magazines'}
              {isFetching && (
                <span className="inline-block w-3 h-3 border-2 border-[#1B3766] border-t-transparent rounded-full animate-spin ml-2"></span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { const p = new URLSearchParams(searchParams); p.set('sort', 'trending'); setSearchParams(p); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                urlSort === 'trending' ? 'bg-[#1B3766] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1B3766]'
              }`}
            >
              <FaFire className="text-[10px]" /> Trending
            </button>
            <button
              onClick={() => { const p = new URLSearchParams(searchParams); p.set('sort', 'latest'); setSearchParams(p); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                urlSort === 'latest' ? 'bg-[#1B3766] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1B3766]'
              }`}
            >
              <FaClock className="text-[10px]" /> Latest
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(urlSearch || urlCategory || urlFeatured) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {urlSearch && (
              <span className="flex items-center gap-1 px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-xs">
                🔍 {urlSearch}
                <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('search'); setSearchParams(p); }} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            {urlCategory && (
              <span className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs">
                {urlCategory}
                <button onClick={() => { const p = new URLSearchParams(searchParams); p.delete('category'); setSearchParams(p); }} className="ml-1 hover:text-red-500">×</button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 ml-1">Clear all</button>
          </div>
        )}

        {/* COMING SOON SECTION */}
        {comingSoonMagazines.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FaHourglassHalf className="text-amber-500 text-lg" />
              <h2 className="text-lg font-bold text-gray-900">Coming Soon</h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                {comingSoonMagazines.length} issues
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {comingSoonMagazines.map((magazine) => (
                <Link
                  key={magazine._id}
                  to={`/${magazine.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <img
                      src={magazine.coverImage}
                      alt={magazine.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Coming Soon Badge */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <FaHourglassHalf className="text-[10px]" /> Coming Soon
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs font-semibold text-gray-800 line-clamp-2">{magazine.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">{magazine.author || 'Biizzed'}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Main Published Magazines Grid */}
        {publishedMagazines.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <FaNewspaper className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No published magazines found</p>
            {comingSoonMagazines.length === 0 && (
              <button onClick={clearFilters} className="mt-4 text-[#1B3766] hover:underline text-sm">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Grid */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {publishedMagazines.map((magazine) => (
                <Link 
                  key={magazine._id}
                  to={`/${magazine.slug}`}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    {magazine.coverImage ? (
                      <img 
                        src={magazine.coverImage} 
                        alt={magazine.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1B3766] flex items-center justify-center">
                        <span className="text-white text-xl font-bold">Biizzed</span>
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleLike(magazine._id, e)}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          {magazine.likes?.includes(userInfo?._id) ? (
                            <FaHeart className="text-red-400 text-sm" />
                          ) : (
                            <FaRegHeart className="text-white text-sm" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleBookmark(magazine._id, e)}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                        >
                          {magazine.bookmarks?.includes(userInfo?._id) ? (
                            <FaBookmark className="text-[#79FFFF] text-sm" />
                          ) : (
                            <FaRegBookmark className="text-white text-sm" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.share?.({ title: magazine.title, url: `${window.location.origin}/${magazine.slug}` });
                          }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors ml-auto"
                        >
                          <FaShare className="text-white text-sm" />
                        </button>
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {magazine.isFeatured && (
                      <div className="absolute top-2 left-2">
                        <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full shadow">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-[#1B3766] transition-colors">
                      {magazine.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaUser className="text-[10px]" />
                        {magazine.author || 'Editorial'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-[10px]" />
                        {magazine.views || 0}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Mobile List */}
            <div className="sm:hidden space-y-3">
              {publishedMagazines.map((magazine) => (
                <Link
                  key={magazine._id}
                  to={`/${magazine.slug}`}
                  className="flex gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {magazine.coverImage ? (
                      <img src={magazine.coverImage} alt={magazine.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1B3766] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">Biizzed</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{magazine.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{magazine.author || 'Editorial'}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><FaEye className="text-[10px]" />{magazine.views || 0}</span>
                      <span className="flex items-center gap-1"><FaHeart className="text-[10px]" />{magazine.likesCount || magazine.likes?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-[#1B3766]/10 text-[#1B3766] text-[10px] font-medium rounded-full">
                        Read Magazine
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Load More (only for published) */}
        {totalPages > currentPage && publishedMagazines.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-[#1B3766] hover:text-[#1B3766] transition-colors"
            >
              Load More Magazines
            </button>
          </div>
        )}

        {publishedMagazines.length > 0 && currentPage >= totalPages && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-gray-400 text-sm">
              <div className="w-8 h-px bg-gray-300"></div>
              You've seen all published magazines
              <div className="w-8 h-px bg-gray-300"></div>
            </div>
          </div>
        )}
      </div>

      <BiizzedBottomBar />
    </div>
  );
};

export default BiizzedMagazines;