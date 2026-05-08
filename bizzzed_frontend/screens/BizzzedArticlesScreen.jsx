// screens/BizzzedArticlesScreen.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaArrowRight, FaSpinner, FaUser, FaCalendarAlt, FaClock, FaTh, FaList, FaImage } from 'react-icons/fa';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';
import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import Footer from '../components/Footer';

const BizzzedArticlesScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('articlesViewMode');
    if (saved) return saved;
    return window.innerWidth < 768 ? 'list' : 'grid';
  });
  
  const articlesPerPage = 9;
  
  // Read filters from URL
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlFeatured = searchParams.get('featured') === 'true';
  const urlEditorsPick = searchParams.get('editorsPick') === 'true';
  const urlSort = searchParams.get('sort') || '';

  // Build query params for backend
  const queryParams = {
    status: 'published',
    page: currentPage,
    limit: articlesPerPage,
  };

  if (urlSearch) queryParams.search = urlSearch;
  if (urlCategory) queryParams.category = urlCategory;
  if (urlFeatured) queryParams.featured = true;
  if (urlEditorsPick) queryParams.editorsPick = true;
  if (urlSort === 'latest') queryParams.sort = '-createdAt';
  if (urlSort === 'trending') queryParams.sort = '-views';
  if (urlSort === 'popular') queryParams.sort = '-views';

  const { data: articlesData, isLoading, isFetching } = useGetArticlesQuery(queryParams);

  const articles = articlesData?.articles || [];
  const totalPages = articlesData?.pages || 1;
  const total = articlesData?.total || 0;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [urlSearch, urlCategory, urlFeatured, urlEditorsPick, urlSort]);

  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('articlesViewMode', viewMode);
  }, [viewMode]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPageTitle = () => {
    if (urlSearch) return `Search: "${urlSearch}"`;
    if (urlCategory) return `${urlCategory.charAt(0).toUpperCase() + urlCategory.slice(1)} Articles`;
    if (urlFeatured) return 'Featured Articles';
    if (urlEditorsPick) return "Editor's Pick";
    if (urlSort === 'trending') return 'Trending Articles';
    if (urlSort === 'popular') return 'Popular Articles';
    return 'All Articles';
  };

  const getArticleImage = (article) => {
    if (article.featuredImage) return article.featuredImage;
    if (article.images && article.images.length > 0) return article.images[0];
    return '/placeholder-article.jpg';
  };

  const getAuthorName = (article) => {
    return article.author || 'Editorial Team';
  };

  if (isLoading && currentPage === 1 && articles.length === 0) {
    return (
      <>
        <BizzzedArticlesNavbar />
        <div className="min-h-screen bg-gray-50 pt-20">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <BizzzedArticlesNavbar />
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-8">
          {/* Header with View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-gray-500 mt-2">
                {total > 0 ? `Showing ${articles.length} of ${total} articles` : 'Discover insights from industry experts'}
                {isFetching && !isLoading && (
                  <span className="ml-2 inline-block w-4 h-4 border-2 border-[#1B3766] border-t-transparent rounded-full animate-spin"></span>
                )}
              </p>
            </div>
            
            {/* View Toggle Buttons */}
            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#1B3766] text-white'
                    : 'text-gray-500 hover:text-[#1B3766]'
                }`}
              >
                <FaTh />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#1B3766] text-white'
                    : 'text-gray-500 hover:text-[#1B3766]'
                }`}
              >
                <FaList />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
          
          {/* Active Filters */}
          {(urlSearch || urlCategory || urlFeatured || urlEditorsPick || urlSort) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>
              {urlSearch && (
                <span className="px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-sm">
                  Search: {urlSearch}
                </span>
              )}
              {urlCategory && (
                <span className="px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-sm">
                  {urlCategory}
                </span>
              )}
              {urlFeatured && (
                <span className="px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-sm">
                  Featured
                </span>
              )}
              {urlEditorsPick && (
                <span className="px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-sm">
                  Editor's Pick
                </span>
              )}
              {urlSort && (
                <span className="px-3 py-1 bg-[#1B3766]/10 text-[#1B3766] rounded-full text-sm">
                  {urlSort === 'latest' ? 'Latest' : urlSort === 'trending' ? 'Trending' : 'Popular'}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:text-red-600 font-medium ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Articles Display */}
          {articles.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No articles found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#1B3766] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* GRID VIEW - 2 columns on mobile, 3 on desktop */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {articles.map((article) => (
                    <article 
                      key={article._id}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                    >
                      <Link to={`/biizzed/articles/${article.slug}`}>
                        <div className="aspect-square overflow-hidden bg-gray-100">
                          <img 
                            src={getArticleImage(article)} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = '/placeholder-article.jpg'; }}
                          />
                        </div>
                        
                        <div className="p-3 sm:p-4">
                          <div className="mb-1.5">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#1B3766] text-[10px] sm:text-xs font-semibold rounded capitalize">
                              {article.category || 'General'}
                            </span>
                            {article.isFeatured && (
                              <span className="inline-block ml-1 px-2 py-0.5 bg-[#1B3766] text-white text-[10px] sm:text-xs font-semibold rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1.5 group-hover:text-[#1B3766] transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">
                            {article.excerpt || article.description?.substring(0, 100) || 'Click to read more...'}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                            <span className="flex items-center gap-0.5">
                              <FaUser className="text-[8px] sm:text-[10px]" />
                              {getAuthorName(article).split(' ')[0]}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <FaCalendarAlt className="text-[8px] sm:text-[10px]" />
                              {formatDate(article.publishedAt || article.createdAt).split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}

              {/* LIST VIEW - Image left, content right */}
              {viewMode === 'list' && (
                <div className="space-y-4">
                  {articles.map((article) => (
                    <article 
                      key={article._id}
                      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                    >
                      <Link to={`/biizzed/articles/${article.slug}`} className="flex flex-col sm:flex-row">
                        {/* Image - Left side */}
                        <div className="w-full sm:w-48 h-48 sm:h-auto overflow-hidden bg-gray-100">
                          <img 
                            src={getArticleImage(article)} 
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => { e.target.src = '/placeholder-article.jpg'; }}
                          />
                        </div>
                        
                        {/* Content - Right side */}
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#1B3766] text-xs font-semibold rounded capitalize">
                              {article.category || 'General'}
                            </span>
                            {article.isFeatured && (
                              <span className="inline-block px-2 py-0.5 bg-[#1B3766] text-white text-xs font-semibold rounded">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 group-hover:text-[#1B3766] transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2 sm:line-clamp-3">
                            {article.excerpt || article.description?.substring(0, 150) || 'Click to read more...'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FaUser className="text-[10px]" />
                              {getAuthorName(article)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaCalendarAlt className="text-[10px]" />
                              {formatDate(article.publishedAt || article.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-[10px]" />
                              {article.readTime || '5 min read'}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center gap-1 text-[#1B3766] text-sm font-semibold group">
                            Read Article
                            <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#1B3766] hover:text-[#1B3766] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-[#1B3766] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#1B3766] hover:text-[#1B3766]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:border-[#1B3766] hover:text-[#1B3766] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BizzzedArticlesScreen;