// screens/MagazineStoryDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaChevronLeft, 
  FaChevronRight, 
  FaDownload,
  FaSpinner,
  FaBookOpen,
  FaEye,
  FaUser,
  FaCalendarAlt,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useGetMagazineBySlugQuery, useGetMagazinesQuery } from '../slices/magApiSlice';
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const MagazineStoryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobilePage, setCurrentMobilePage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  
  const leftCanvasRef = useRef(null);
  const rightCanvasRef = useRef(null);
  const mobileCanvasRef = useRef(null);
  const mobileContainerRef = useRef(null);

  const { data: magazine, isLoading, error } = useGetMagazineBySlugQuery(slug);
  
  const { data: otherMagazinesData } = useGetMagazinesQuery({
    status: 'published',
    limit: 4,
    featured: false
  });
  const otherMagazines = otherMagazinesData?.magazines?.filter(m => m.slug !== slug) || [];

  useEffect(() => {
    if (magazine?.pdfUrl && !pdfDoc) {
      setLoadingPdf(true);
      const loadPDF = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument(magazine.pdfUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setTotalPages(pdf.numPages);
          setCurrentPage(0);
          setCurrentMobilePage(0);
          setLoadingPdf(false);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setLoadingPdf(false);
        }
      };
      loadPDF();
    }
  }, [magazine?.pdfUrl, pdfDoc]);

  useEffect(() => {
    if (pdfDoc && leftCanvasRef.current && rightCanvasRef.current && window.innerWidth >= 768) {
      renderDesktopPages();
    }
  }, [pdfDoc, currentPage]);

  useEffect(() => {
    if (pdfDoc && mobileCanvasRef.current && window.innerWidth < 768) {
      renderMobilePage();
    }
  }, [pdfDoc, currentMobilePage]);

  const renderDesktopPages = async () => {
    const leftPageNum = currentPage + 1;
    const rightPageNum = currentPage + 2;
    if (leftPageNum <= totalPages) {
      const page = await pdfDoc.getPage(leftPageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = leftCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
    if (rightPageNum <= totalPages) {
      const page = await pdfDoc.getPage(rightPageNum);
      const viewport = page.getViewport({ scale: 1.2 });
      const canvas = rightCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const renderMobilePage = async () => {
    const pageNum = currentMobilePage + 1;
    if (pageNum <= totalPages) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = mobileCanvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
    }
  };

  const handleTouchStart = (e) => {
    if (isAnimating) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (isAnimating) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isAnimating || !touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50 && currentMobilePage < totalPages - 1) {
      setCurrentMobilePage(currentMobilePage + 1);
    }
    if (distance < -50 && currentMobilePage > 0) {
      setCurrentMobilePage(currentMobilePage - 1);
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleDesktopPrevSpread = () => {
    if (currentPage - 2 >= 0 && !isAnimating) {
      setCurrentPage(currentPage - 2);
    }
  };

  const handleDesktopNextSpread = () => {
    if (currentPage + 2 < totalPages && !isAnimating) {
      setCurrentPage(currentPage + 2);
    }
  };

  const handleMobilePrevPage = () => {
    if (currentMobilePage > 0 && !isAnimating) {
      setCurrentMobilePage(currentMobilePage - 1);
    }
  };

  const handleMobileNextPage = () => {
    if (currentMobilePage < totalPages - 1 && !isAnimating) {
      setCurrentMobilePage(currentMobilePage + 1);
    }
  };

  // Auto download PDF
  const handleDownload = async () => {
    if (!magazine?.pdfUrl) return;
    
    setDownloading(true);
    try {
      const response = await fetch(magazine.pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${magazine.title || 'magazine'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Download failed. Please try again.');
    }
    setDownloading(false);
  };

  // Custom share handlers
  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = magazine?.title || 'Check out this magazine';
    const text = `Check out "${title}" on Bizzzed Magazine`;

    switch(platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
          '_blank',
          'width=600,height=400'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank',
          'width=600,height=500'
        );
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          toast.success('Link copied to clipboard!');
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error('Failed to copy link');
        }
        break;
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex justify-center items-center h-96">
          <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !magazine) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <FaBookOpen className="text-3xl text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Magazine Not Found</h1>
          <p className="text-gray-600 mb-6">The magazine you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const leftPageNum = currentPage + 1;
  const rightPageNum = currentPage + 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm group"
          >
            <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to Magazine</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {magazine.title}
            </span>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all text-sm shadow-md hover:shadow-lg disabled:opacity-70"
            >
              {downloading ? (
                <FaSpinner className="text-xs animate-spin" />
              ) : (
                <FaDownload className="text-xs" />
              )}
              <span className="hidden sm:inline">{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Magazine Header Card */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full -mr-10 -mt-10" />
          
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-5">
              {magazine.coverImage ? (
                <div className="relative">
                  <img src={magazine.coverImage} alt={magazine.title} className="w-20 h-28 object-cover rounded-xl shadow-md" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <FaBookOpen className="text-white text-xs" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-28 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                  <FaBookOpen className="text-white text-2xl" />
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{magazine.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-blue-500" />
                    {magazine.author || 'Editorial Team'}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    <FaCalendarAlt className="text-blue-500" />
                    {formatDate(magazine.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaEye className="text-blue-500" />
                    {magazine.views || 0} views
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                    {totalPages} Pages
                  </span>
                </div>
              </div>
            </div>
            
            {/* Share Buttons - Custom */}
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 hidden md:block mr-2">Share:</span>
              <button 
                onClick={() => handleShare('twitter')} 
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-all"
                title="Share on Twitter"
              >
                <FaTwitter />
              </button>
              <button 
                onClick={() => handleShare('facebook')} 
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Share on Facebook"
              >
                <FaFacebookF />
              </button>
              <button 
                onClick={() => handleShare('linkedin')} 
                className="p-2 text-gray-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                title="Share on LinkedIn"
              >
                <FaLinkedinIn />
              </button>
              <button 
                onClick={() => handleShare('copy')} 
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all relative"
                title="Copy link"
              >
                {copied ? <FaCheck className="text-green-500" /> : <FaLink />}
              </button>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block relative">
          {loadingPdf ? (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-center items-center py-32">
                <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading magazine...</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-gradient-to-b from-[#f8f6f0] to-[#efe9df] rounded-2xl shadow-2xl p-6 md:p-10 border border-gray-200">
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">Reading Progress</span>
                    <span className="text-xs font-semibold text-blue-600">
                      {totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
                      style={{ width: `${totalPages > 0 ? (currentPage / totalPages) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="book-container relative">
                  <div className="flex flex-row gap-4 md:gap-8 justify-center perspective-1000">
                    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden relative border border-gray-100">
                      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-100/50 to-transparent pointer-events-none z-10 rounded-l-xl" />
                      <div className="p-4 bg-white min-h-[500px] flex items-center justify-center">
                        <canvas ref={leftCanvasRef} className="w-full h-auto rounded-lg" />
                      </div>
                      <div className="text-center py-2.5 text-xs font-medium text-gray-500 bg-gray-50 border-t border-gray-100">
                        Page {leftPageNum} of {totalPages}
                      </div>
                    </div>

                    <div className="flex-1 bg-white rounded-xl shadow-xl overflow-hidden relative border border-gray-100">
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-100/50 to-transparent pointer-events-none z-10 rounded-r-xl" />
                      <div className="p-4 bg-white min-h-[500px] flex items-center justify-center">
                        <canvas ref={rightCanvasRef} className="w-full h-auto rounded-lg" />
                      </div>
                      <div className="text-center py-2.5 text-xs font-medium text-gray-500 bg-gray-50 border-t border-gray-100">
                        Page {rightPageNum} of {totalPages}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <button
                      onClick={handleDesktopPrevSpread}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                    >
                      <FaChevronLeft />
                      <span className="hidden sm:inline">Previous Spread</span>
                    </button>

                    <div className="text-sm text-gray-500 font-medium">
                      <span className="hidden sm:inline">Pages {leftPageNum} – </span>
                      <span>{Math.min(rightPageNum, totalPages)} of {totalPages}</span>
                    </div>

                    <button
                      onClick={handleDesktopNextSpread}
                      disabled={currentPage + 2 >= totalPages}
                      className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-md"
                    >
                      <span className="hidden sm:inline">Next Spread</span>
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden">
          {loadingPdf ? (
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex justify-center items-center py-32">
                <FaSpinner className="w-12 h-12 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading...</span>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Reading Progress</span>
                  <span className="text-xs font-semibold text-blue-600">
                    {totalPages > 0 ? Math.round((currentMobilePage / totalPages) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-500"
                    style={{ width: `${totalPages > 0 ? (currentMobilePage / totalPages) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div 
                ref={mobileContainerRef}
                className="relative bg-gradient-to-b from-[#f8f6f0] to-[#efe9df] rounded-2xl shadow-lg p-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[400px] flex items-center justify-center">
                  <canvas ref={mobileCanvasRef} className="w-full h-auto" />
                </div>
                
                <div className="text-center py-3 text-sm font-medium text-gray-600">
                  Page {currentMobilePage + 1} of {totalPages}
                </div>
              </div>

              <div className="flex justify-between gap-3 mt-4">
                <button
                  onClick={handleMobilePrevPage}
                  disabled={currentMobilePage === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:text-blue-600 hover:border-blue-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  <FaChevronLeft />
                  Previous
                </button>
                <button
                  onClick={handleMobileNextPage}
                  disabled={currentMobilePage === totalPages - 1}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-md"
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>

              <div className="text-center mt-3 text-xs text-gray-400 animate-pulse">
                ← Swipe to flip pages →
              </div>
            </div>
          )}
        </div>

        {/* Magazine Info Footer */}
        {magazine.summary && (
          <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FaBookOpen className="text-blue-600" />
              About This Edition
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{magazine.summary}</p>
            {magazine.tags && magazine.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {magazine.tags.map((tag, idx) => (
                  <span key={idx} className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other Magazines */}
        {otherMagazines.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaBookOpen className="text-blue-600" />
              More Magazines
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {otherMagazines.map((mag) => (
                <Link 
                  key={mag._id}
                  to={`/biizzed/${mag.slug}`}
                  className="group block transform transition-all duration-300 hover:-translate-y-2"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <div className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                    <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                      {mag.coverImage ? (
                        <img 
                          src={mag.coverImage} 
                          alt={mag.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          <FaBookOpen className="text-white text-2xl" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                      <h3 className="text-white text-xs font-semibold line-clamp-2">{mag.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .book-container::before {
          content: '';
          position: absolute;
          top: 5%; bottom: 5%;
          left: 50%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.1), rgba(0,0,0,0.1), transparent);
          transform: translateX(-50%);
          z-index: 20;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default MagazineStoryDetail;