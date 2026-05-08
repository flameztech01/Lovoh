// adminScreen/AdminMagazineDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaEdit,
  FaTrashAlt,
  FaStar,
  FaRegStar,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
  FaBookmark,
  FaRegBookmark,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaShare,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaEye as FaViewIcon
} from 'react-icons/fa';
import {
  useGetMagazineByIdQuery,
  useDeleteMagazineMutation,
  useToggleFeaturedMagazineMutation
} from '../slices/magApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminMagazineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);

  const { data: magazine, isLoading, refetch } = useGetMagazineByIdQuery(id);
  const [deleteMagazine] = useDeleteMagazineMutation();
  const [toggleFeatured] = useToggleFeaturedMagazineMutation();

  // Load PDF using pdf.js
  useEffect(() => {
    if (magazine?.pdfUrl) {
      setLoadingPdf(true);
      // Dynamically import pdf.js
      import('pdfjs-dist/build/pdf').then(async (pdfjs) => {
        // Set worker source
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        
        try {
          const loadingTask = pdfjs.getDocument(magazine.pdfUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(0);
          setLoadingPdf(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setLoadingPdf(false);
        }
      });
    }
  }, [magazine?.pdfUrl]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this magazine?')) {
      try {
        await deleteMagazine(id).unwrap();
        toast.success('Magazine deleted successfully');
        navigate('/admin/magazines');
      } catch (error) {
        toast.error(error?.data?.message || 'Failed to delete magazine');
      }
    }
  };

  const handleToggleFeatured = async () => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success(
        magazine?.isFeatured ? 'Removed from featured' : 'Added to featured'
      );
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update featured status');
    }
  };

  const handleNextSpread = () => {
    if (currentPage + 2 < totalPages) {
      setCurrentPage(currentPage + 2);
    }
  };

  const handlePrevSpread = () => {
    if (currentPage - 2 >= 0) {
      setCurrentPage(currentPage - 2);
    }
  };

  const openPDF = () => {
    window.open(magazine?.pdfUrl, '_blank');
  };

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
        </div>
      </AdminSidebar>
    );
  }

  if (!magazine) {
    return (
      <AdminSidebar>
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Magazine Not Found</h2>
          <button
            onClick={() => navigate('/admin/magazines')}
            className="px-4 py-2 bg-[#0043FC] text-white rounded-lg"
          >
            Back to Magazines
          </button>
        </div>
      </AdminSidebar>
    );
  }

  // Render PDF page component
  const PDFPageRenderer = ({ pageNum, side }) => {
    const [canvasRef, setCanvasRef] = useState(null);

    useEffect(() => {
      if (pdfDoc && pageNum <= totalPages && canvasRef) {
        const renderPage = async () => {
          const pdfPage = await pdfDoc.getPage(pageNum);
          const viewport = pdfPage.getViewport({ scale: 1.2 });
          
          const context = canvasRef.getContext('2d');
          canvasRef.width = viewport.width;
          canvasRef.height = viewport.height;
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await pdfPage.render(renderContext).promise;
        };
        renderPage();
      }
    }, [pdfDoc, pageNum, canvasRef, totalPages]);

    if (pageNum > totalPages) {
      return (
        <div className="bg-gray-100 rounded-lg flex items-center justify-center h-full min-h-[500px]">
          <p className="text-gray-400 text-sm">End of Magazine</p>
        </div>
      );
    }

    return (
      <canvas 
        ref={setCanvasRef} 
        className="w-full h-auto rounded-lg shadow-lg"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
      />
    );
  };

  const leftPageNum = currentPage + 1;
  const rightPageNum = currentPage + 2;

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f5f3ef]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Top Admin Bar */}
          <div className="flex items-center justify-between py-4 mb-6 bg-white rounded-xl px-6 shadow-sm">
            <button
              onClick={() => navigate('/admin/magazines')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back to Magazines</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={handleToggleFeatured}
                className={`text-sm transition-colors ${
                  magazine.isFeatured
                    ? 'text-yellow-500'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={magazine.isFeatured ? 'Remove featured' : 'Make featured'}
              >
                {magazine.isFeatured ? <FaStar /> : <FaRegStar />}
              </button>

              <button
                onClick={() => navigate(`/admin/magazines/edit/${id}`)}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Book Layout */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Book Header */}
            <div className="border-b border-gray-200 px-8 py-6 bg-gradient-to-r from-[#0043FC]/5 to-[#79FFFF]/5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#0043FC]">
                      {magazine.category || 'MAGAZINE'}
                    </span>
                    {magazine.isFeatured && (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                        <FaStar className="text-[10px]" />
                        Featured
                      </span>
                    )}
                    {magazine.status === 'published' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <FaCheckCircle className="text-[10px]" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        <FaTimesCircle className="text-[10px]" />
                        Draft
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {magazine.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-xs" />
                      By {magazine.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      {formatDate(magazine.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaViewIcon className="text-xs" />
                      {magazine.views || 0} views
                    </span>
                  </div>
                </div>
                <button
                  onClick={openPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
                >
                  <FaDownload />
                  Download PDF
                </button>
              </div>
            </div>

            {/* Summary Section */}
            {magazine.summary && (
              <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
                <div className="max-w-3xl">
                  <p className="text-gray-600 italic leading-relaxed">
                    "{magazine.summary}"
                  </p>
                </div>
              </div>
            )}

            {/* Book Viewer */}
            <div className="p-8 bg-[#e8e4df]">
              {loadingPdf ? (
                <div className="flex justify-center items-center py-32">
                  <FaSpinner className="w-12 h-12 text-[#0043FC] animate-spin" />
                  <span className="ml-3 text-gray-600">Loading magazine...</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Book Spread - Two Pages Side by Side */}
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
                    {/* Left Page */}
                    <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden relative">
                      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-200/50 to-transparent pointer-events-none z-10"></div>
                      <div className="p-4 bg-white min-h-[600px] flex items-center justify-center">
                        <PDFPageRenderer pageNum={leftPageNum} side="left" />
                      </div>
                      <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100">
                        Page {leftPageNum} of {totalPages}
                      </div>
                    </div>

                    {/* Right Page */}
                    <div className="flex-1 bg-white rounded-lg shadow-2xl overflow-hidden relative">
                      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-200/50 to-transparent pointer-events-none z-10"></div>
                      <div className="p-4 bg-white min-h-[600px] flex items-center justify-center">
                        <PDFPageRenderer pageNum={rightPageNum} side="right" />
                      </div>
                      <div className="text-center py-2 text-xs text-gray-400 border-t border-gray-100">
                        Page {rightPageNum} of {totalPages}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <div className="flex justify-center gap-4 mt-8">
                    <button
                      onClick={handlePrevSpread}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <FaChevronLeft />
                      Previous Spread
                    </button>
                    <button
                      onClick={handleNextSpread}
                      disabled={currentPage + 2 >= totalPages}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:border-[#0043FC] hover:text-[#0043FC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next Spread
                      <FaChevronRight />
                    </button>
                  </div>

                  {/* Page Indicator */}
                  <div className="text-center mt-4 text-sm text-gray-500">
                    Viewing pages {leftPageNum} - {Math.min(rightPageNum, totalPages)} of {totalPages}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 px-8 py-6 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0043FC] to-[#79FFFF] text-white flex items-center justify-center text-sm font-bold">
                    {magazine.author?.charAt(0) || 'E'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {magazine.author || 'Editorial Team'}
                    </div>
                    <div className="text-xs uppercase tracking-[0.14em] text-gray-400">
                      Publisher
                    </div>
                  </div>
                </div>

                {magazine.tags && magazine.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <FaTag className="text-gray-400 text-xs" />
                    {magazine.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-400">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-gray-400 mr-1">
                    Share
                  </span>
                  <button className="hover:text-[#0043FC] transition-colors">
                    <FaTwitter className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#0043FC] transition-colors">
                    <FaFacebookF className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#0043FC] transition-colors">
                    <FaLinkedinIn className="w-4 h-4" />
                  </button>
                  <button className="hover:text-[#0043FC] transition-colors">
                    <FaLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
};

export default AdminMagazineDetail;