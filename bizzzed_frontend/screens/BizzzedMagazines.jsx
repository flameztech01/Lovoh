// screens/BizzzedMagazines.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaArrowRight, FaSpinner, FaEye } from 'react-icons/fa';
import { useGetMagazinesQuery } from '../slices/magApiSlice';
import BizzzedNavbar from '../components/BizzzedNavbar';
import Footer from '../components/Footer';

const BizzzedMagazines = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  // Read filters from URL
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';
  const urlFeatured = searchParams.get('featured') === 'true';
  const urlEditorsPick = searchParams.get('editorsPick') === 'true';
  const urlSort = searchParams.get('sort') || '';

  // Build query params
  const queryParams = {
    status: 'published',
    page: currentPage,
    limit: 12,
  };

  if (urlSearch) queryParams.search = urlSearch;
  if (urlCategory) queryParams.category = urlCategory;
  if (urlFeatured) queryParams.isFeatured = true;
  if (urlEditorsPick) queryParams.isEditorsPick = true;
  if (urlSort === 'latest') queryParams.sort = '-createdAt';
  if (urlSort === 'trending') queryParams.sort = '-views';

  const { data: magazinesData, isLoading } = useGetMagazinesQuery(queryParams);

  const magazines = magazinesData?.magazines || [];
  const totalPages = magazinesData?.pages || 1;
  const total = magazinesData?.total || 0;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [urlSearch, urlCategory, urlFeatured, urlEditorsPick, urlSort]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  // Generate page title based on filters
  const getPageTitle = () => {
    if (urlSearch) return `Search: "${urlSearch}"`;
    if (urlCategory) return `${urlCategory} Magazines`;
    if (urlFeatured) return 'Featured Magazines';
    if (urlEditorsPick) return "Editor's Pick";
    if (urlSort === 'trending') return 'Trending Magazines';
    return 'All Magazines';
  };

  if (isLoading && currentPage === 1 && magazines.length === 0) {
    return (
      <>
        <BizzzedNavbar />
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
      <BizzzedNavbar />
      <div className="min-h-screen bg-gray-50 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{getPageTitle()}</h1>
            <p className="text-gray-500 mt-2">
              {total > 0 ? `Showing ${magazines.length} of ${total} magazines` : 'Discover our premium editions'}
            </p>
            
            {/* Active Filters */}
            {(urlSearch || urlCategory || urlFeatured || urlEditorsPick || urlSort) && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
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
                    {urlSort === 'latest' ? 'Latest' : 'Trending'}
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
          </div>

          {/* Magazines Grid - Clean cover-only design */}
          {magazines.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-500">No magazines found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#1B3766] hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {magazines.map((magazine) => (
                <Link 
                  key={magazine._id}
                  to={`/biizzed/${magazine.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Cover Image Only */}
                  {magazine.coverImage ? (
                    <img 
                      src={magazine.coverImage} 
                      alt={magazine.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1B3766] flex items-center justify-center">
                      <span className="text-white text-lg font-bold">Bizzzed</span>
                    </div>
                  )}
                  
                  {/* Hover Overlay with minimal info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
                      {magazine.title}
                    </h3>
                    <div className="flex items-center justify-between text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <FaEye className="text-[10px]" />
                        {magazine.views || 0}
                      </span>
                      <span className="flex items-center gap-1 text-[#1B3766] bg-white/90 px-2 py-1 rounded">
                        Read
                        <FaArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </div>

                  {/* Featured Badge - Small corner badge */}
                  {magazine.isFeatured && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-[#1B3766] text-white px-2 py-1 rounded text-[10px] font-bold shadow-md">
                        Featured
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
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
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
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

export default BizzzedMagazines;