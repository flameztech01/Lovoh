// screens/BizzzedArticleDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaLink,
  FaBookmark,
  FaRegBookmark,
  FaHeart,
  FaRegHeart,
  FaSpinner,
  FaArrowRight,
} from 'react-icons/fa';
import {
  useGetArticleBySlugQuery,
  useGetArticlesQuery,
} from '../slices/articlesApiSlice';
import BizzzedArticlesNavbar from '../components/BizzzedArticlesNavbar';
import Footer from '../components/Footer';

const BizzzedArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);

  const { data: article, isLoading, error } = useGetArticleBySlugQuery(slug);

  const { data: relatedData } = useGetArticlesQuery(
    {
      category: article?.category,
      limit: 6,
      status: 'published',
    },
    { skip: !article }
  );

  const relatedArticles =
    relatedData?.articles?.filter((item) => item.slug !== slug)?.slice(0, 5) || [];

  const images = article?.images || [];
  const hasImages = images.length > 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || 'Check out this article';

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        break;
      default:
        break;
    }
  };

  // Parse content into paragraphs and insert images between them like a magazine
  const renderContentWithImages = () => {
    if (!article?.content) return null;

    let content = article.content;

    // Detect if content contains HTML tags (from rich text editor)
    const hasHtmlTags = /<[a-z][\s\S]*?>/i.test(content);

    let paragraphs = [];

    if (hasHtmlTags) {
      // Extract content from <p> tags while PRESERVING inline formatting inside
      // Match <p>...</p> blocks and keep everything inside including <strong>, <em>, etc.
      const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);

      if (pMatches && pMatches.length > 1) {
        // We found multiple <p> tags — use them as paragraphs
        paragraphs = pMatches.map((match) => {
          // Keep the inner HTML (with <strong>, <em>, <a>, etc. intact)
          // Just remove the outer <p> and </p> tags
          return match.replace(/<p[^>]*>/i, '').replace(/<\/p>/i, '');
        });
      } else {
        // No <p> tags or only one — try splitting by <br> or <div>
        content = content
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/div>\s*<div[^>]*>/gi, '\n\n');

        paragraphs = content.split(/\n\s*\n/);
      }
    } else {
      // Plain text - split by double newlines
      paragraphs = content.split(/\n\s*\n/);
    }

    // Filter out empty/very short paragraphs
    const validParagraphs = paragraphs.filter((p) => p.trim().length > 10);

    // Skip first image (cover image already shown at top)
    const imagesToInsert = hasImages ? images.slice(1) : [];
    const imageCount = imagesToInsert.length;
    const totalParagraphs = validParagraphs.length;

    // If no valid paragraphs or no images, render content as-is
    if (totalParagraphs === 0 || imageCount === 0) {
      return (
        <div
          className="text-gray-700 leading-8 space-y-5 text-[15px] sm:text-base"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      );
    }

    // Distribute images evenly between paragraphs
    const insertPositions = [];
    const step = totalParagraphs / (imageCount + 1);
    for (let i = 1; i <= imageCount; i++) {
      insertPositions.push(Math.min(Math.round(i * step), totalParagraphs - 1));
    }

    const elements = [];
    let imageIndex = 0;

    for (let i = 0; i < validParagraphs.length; i++) {
      // Add paragraph — dangerouslySetInnerHTML preserves <strong>, <em>, <a>, etc.
      elements.push(
        <div
          key={`para-${i}`}
          className="text-gray-700 leading-8 text-[15px] sm:text-base"
          dangerouslySetInnerHTML={{ __html: validParagraphs[i].trim() }}
        />
      );

      // Add image after this paragraph if it's an insert position
      if (insertPositions.includes(i + 1) && imageIndex < imagesToInsert.length) {
        elements.push(
          <div key={`image-${imageIndex}`} className="my-8">
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
              <img
                src={imagesToInsert[imageIndex]}
                alt={`${article.title} - Image ${imageIndex + 2}`}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center italic">
              Photo: {article.category} insights
            </p>
          </div>
        );
        imageIndex++;
      }
    }

    return elements;
  };

  if (isLoading) {
    return (
      <>
        <BizzzedArticlesNavbar />
        <div className="min-h-screen bg-[#f8fafc] pt-20">
          <div className="flex justify-center items-center h-[70vh]">
            <FaSpinner className="w-12 h-12 text-[#1B3766] animate-spin" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <BizzzedArticlesNavbar />
        <div className="min-h-screen bg-[#f8fafc] pt-20">
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 mx-auto bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4">
              <FaBookmark className="text-3xl text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Article Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The article you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1B3766] text-white rounded-xl hover:bg-[#142952] transition-colors"
            >
              <FaArrowLeft />
              Go Back
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <BizzzedArticlesNavbar />

      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1B3766] transition-colors group"
            >
              <FaArrowLeft className="text-xs group-hover:-translate-x-1 transition-transform" />
              Back to articles
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Main Content */}
            <div className="xl:col-span-8">
              <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
                <div className="p-5 sm:p-7 lg:p-8">
                  <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    {article.author && (
                      <span className="font-medium text-gray-700">
                        {article.author}
                      </span>
                    )}
                    {article.category && (
                      <>
                        <span>•</span>
                        <span className="text-[#1B3766] font-medium">
                          {article.category}
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-[2.5rem] font-bold text-gray-900 leading-tight mb-4">
                    {article.title}
                  </h1>

                  {article.excerpt && (
                    <p className="text-base sm:text-lg text-gray-600 leading-7 mb-6 italic border-l-4 border-[#1B3766] pl-4">
                      {article.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-sm text-gray-500 border-t border-b border-gray-100 py-4 mb-6">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt className="text-xs" />
                      {formatDate(article.publishedAt || article.createdAt)}
                    </span>

                    {article.readTime && (
                      <span className="flex items-center gap-2">
                        <FaClock className="text-xs" />
                        {article.readTime}
                      </span>
                    )}

                    <span className="flex items-center gap-2">
                      <FaEye className="text-xs" />
                      {article.views || 0} views
                    </span>

                    <div className="ml-auto flex items-center gap-3">
                      <button
                        onClick={() => setBookmarked(!bookmarked)}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1B3766] hover:border-[#1B3766] transition-colors"
                      >
                        {bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                      </button>

                      <button
                        onClick={() => setLiked(!liked)}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors"
                      >
                        {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                      </button>
                    </div>
                  </div>

                  {/* Cover Image - stays at top */}
                  {hasImages && images[0] && (
                    <div className="mb-8">
                      <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        <img
                          src={images[0]}
                          alt={article.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center italic">
                        Featured image: {article.category}
                      </p>
                    </div>
                  )}

                  {/* Content with magazine-style images between paragraphs */}
                  <div className="space-y-5">
                    {renderContentWithImages()}
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#1B3766] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {article.author?.charAt(0) || 'E'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          Written by {article.author || 'Editorial Team'}
                        </p>
                        <p className="text-sm text-gray-500 leading-6">
                          Expert insights on business, technology, innovation, and
                          current affairs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="xl:col-span-4 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share to</h3>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1B3766] hover:border-[#1B3766] transition"
                  >
                    <FaTwitter />
                  </button>

                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1B3766] hover:border-[#1B3766] transition"
                  >
                    <FaFacebookF />
                  </button>

                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1B3766] hover:border-[#1B3766] transition"
                  >
                    <FaLinkedinIn />
                  </button>

                  <button
                    onClick={() => handleShare('copy')}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1B3766] hover:border-[#1B3766] transition"
                  >
                    <FaLink />
                  </button>
                </div>
              </div>

              {relatedArticles.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-3xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-5">
                    Related Articles
                  </h3>

                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related._id}
                        to={`/biizzed/articles/${related.slug}`}
                        className="flex gap-3 group"
                      >
                        <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={related.featuredImage}
                            alt={related.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#1B3766] transition line-clamp-2 leading-5">
                            {related.title}
                          </h4>

                          <p className="text-xs text-gray-500 mt-1">
                            {related.category}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                            <span>{formatDate(related.publishedAt || related.createdAt)}</span>
                            {related.readTime && (
                              <>
                                <span>•</span>
                                <span>{related.readTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Link
                      to={`/biizzed/articles?category=${article.category}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B3766] hover:gap-3 transition-all"
                    >
                      View more
                      <FaArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default BizzzedArticleDetails;