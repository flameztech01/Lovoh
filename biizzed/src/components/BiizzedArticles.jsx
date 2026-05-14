// components/BiizzedArticles.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaAd, 
  FaChartLine, 
  FaSpinner,
  FaBullhorn,
  FaWhatsapp,
  FaExternalLinkAlt,
  FaPlay,
  FaPause
} from 'react-icons/fa';
import { useGetArticlesQuery } from '../slices/articlesApiSlice';
import { useGetAdsQuery, useTrackAdClickMutation, useTrackAdViewMutation } from '../slices/adsApiSlice';

const BiizzedArticles = () => {
  // Fetch featured article and regular articles
  const { data: featuredData, isLoading: featuredLoading } = useGetArticlesQuery({
    featured: true,
    limit: 1,
    status: 'published'
  });

  const { data: regularData, isLoading: regularLoading } = useGetArticlesQuery({
    featured: false,
    limit: 4,
    status: 'published',
    sort: '-createdAt'
  });

  // Fetch ads: banner placement (horizontal) and sidebar placement (square)
  const { data: bannerAdsData, isLoading: bannerAdsLoading } = useGetAdsQuery({
    page: 'biizzed',
    placement: 'banner',
    supportsImage: true,
    supportsVideo: true,
    limit: 1,
  });

  const { data: sidebarAdsData, isLoading: sidebarAdsLoading } = useGetAdsQuery({
    page: 'biizzed',
    placement: 'sidebar',
    supportsImage: true,
    supportsVideo: true,
    limit: 1,
  });

  const [trackClick] = useTrackAdClickMutation();
  const [trackView] = useTrackAdViewMutation();

  const isLoading = featuredLoading || regularLoading || bannerAdsLoading || sidebarAdsLoading;

  const featuredArticle = featuredData?.articles?.[0] || null;
  const regularArticles = regularData?.articles || [];
  const bannerAds = bannerAdsData?.ads || [];
  const sidebarAds = sidebarAdsData?.ads || [];

  // Create fallback "Advertise with us" ads
  const createBannerAdvertiseAd = () => ({
    _id: 'advertise-biizzed-banner',
    title: 'Advertise With Biizzed',
    subtitle: 'Reach business leaders and decision-makers',
    ctaText: 'Message on WhatsApp',
    ctaLink: 'https://wa.me/2348055766461?text=Hello%2C%20I%27m%20interested%20in%20advertising%20on%20Biizzed',
    mediaType: 'image',
    image: '/campus1.jpg',
    bgColor: 'from-[#1B3766] to-[#142952]',
    accentColor: '#79FFFF',
    isAdvertiseAd: true,
  });

  const createSidebarAdvertiseAd = () => ({
    _id: 'advertise-biizzed-sidebar',
    title: 'Advertise Here',
    subtitle: 'Reach business leaders worldwide',
    ctaText: 'Message on WhatsApp',
    ctaLink: 'https://wa.me/2348055766461?text=Hello%2C%20I%27m%20interested%20in%20advertising%20on%20Biizzed',
    mediaType: 'image',
    image: '/campus1.jpg',
    bgColor: 'from-gray-800 to-gray-900',
    accentColor: '#79FFFF',
    isAdvertiseAd: true,
  });

  const bannerAd = bannerAds.length > 0 ? bannerAds[0] : createBannerAdvertiseAd();
  const sidebarAd = sidebarAds.length > 0 ? sidebarAds[0] : createSidebarAdvertiseAd();

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleAdClick = (ad) => {
    if (!ad.isAdvertiseAd) {
      trackClick(ad._id);
    }
  };

  const handleAdView = (ad) => {
    if (!ad.isAdvertiseAd && ad._id) {
      trackView(ad._id);
    }
  };

  const isExternalUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http://') || 
           url.startsWith('https://') || 
           url.startsWith('//') ||
           /\.(com|ng|org|net|io|co|uk|app|dev)/.test(url);
  };

  const formatExternalUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.includes('.') && !url.includes('/') && !url.includes(' ')) return `https://${url}`;
    return url;
  };

  const renderAdLink = (ad, className, children) => {
    const external = isExternalUrl(ad.ctaLink);
    const formattedUrl = external ? formatExternalUrl(ad.ctaLink) : ad.ctaLink;

    if (external || ad.isAdvertiseAd) {
      return (
        <a
          href={formattedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={() => handleAdClick(ad)}
        >
          {children}
        </a>
      );
    }

    return (
      <Link to={formattedUrl || '#'} className={className} onClick={() => handleAdClick(ad)}>
        {children}
      </Link>
    );
  };

  // Horizontal Banner Ad (banner placement) - same UI as BiizzedArticlesGrid
  const renderBannerAd = (ad) => {
    const isAdvertise = ad.isAdvertiseAd;
    const hasVideo = ad.mediaType === 'video' && ad.video;
    
    return (
      <div 
        className="relative rounded-lg overflow-hidden shadow-md h-full min-h-[120px] group"
        onMouseEnter={() => handleAdView(ad)}
      >
        {hasVideo ? (
          <video
            src={ad.video}
            poster={ad.thumbnail || ad.image}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={ad.image || '/campus1.jpg'}
            alt={ad.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        
        <div className="relative h-full flex items-center p-5">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                {isAdvertise ? <FaBullhorn className="text-xs" /> : <FaAd className="text-xs" />}
                {isAdvertise ? 'Advertise Here' : 'Sponsored'}
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{ad.title}</h3>
            <p className="text-white/80 text-sm mb-4">{ad.subtitle}</p>
            
            {renderAdLink(
              ad,
              isAdvertise
                ? "inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
                : "inline-flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2 rounded-lg font-semibold text-sm transition-colors",
              <>
                {isAdvertise && <FaWhatsapp className="text-xs" />}
                {ad.ctaText || (isAdvertise ? 'Message on WhatsApp' : 'Learn More')}
                {!isAdvertise && isExternalUrl(ad.ctaLink) && <FaExternalLinkAlt className="text-xs ml-1" />}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Square Ad (sidebar placement) - same UI as featured ad in grid
  const renderSidebarAd = (ad) => {
    const isAdvertise = ad.isAdvertiseAd;
    const hasVideo = ad.mediaType === 'video' && ad.video;
    
    return (
      <div 
        className="relative rounded-lg overflow-hidden shadow-md h-full group"
        onMouseEnter={() => handleAdView(ad)}
      >
        {hasVideo ? (
          <video
            src={ad.video}
            poster={ad.thumbnail || ad.image}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={ad.image || '/campus1.jpg'}
            alt={ad.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
              {isAdvertise ? <FaBullhorn className="text-xs" /> : <FaAd className="text-xs" />}
              {isAdvertise ? 'Advertise Here' : 'Sponsored'}
            </span>
          </div>
          <h3 className="font-bold text-base mb-1 line-clamp-1">{ad.title}</h3>
          <p className="text-white/80 text-xs mb-3 line-clamp-2">{ad.subtitle}</p>
          
          {renderAdLink(
            ad,
            isAdvertise
              ? "inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              : "inline-flex items-center gap-1 bg-white hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-xs font-semibold transition-colors",
            <>
              {isAdvertise && <FaWhatsapp className="text-xs" />}
              {ad.ctaText || (isAdvertise ? 'Message on WhatsApp' : 'Learn More')}
              {!isAdvertise && isExternalUrl(ad.ctaLink) && <FaExternalLinkAlt className="text-[10px] ml-1" />}
            </>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (!featuredArticle && regularArticles.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Featured Articles
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Insights, analysis, and stories from industry experts
          </p>
        </div>

        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-12">
            <Link 
              to={`/biizzed/articles/${featuredArticle.slug}`}
              className="group block"
            >
              {/* Mobile layout */}
              <div className="flex flex-row md:hidden bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-28 h-28 overflow-hidden flex-shrink-0">
                  <img 
                    src={featuredArticle.featuredImage} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1 p-3 flex flex-col justify-center">
                  <div className="mb-1">
                    <span className="inline-block px-2 py-0.5 bg-[#1B3766] text-white text-[10px] font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#1B3766] transition-colors line-clamp-2">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                    {featuredArticle.excerpt?.substring(0, 80)}...
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5">
                      <FaUser className="text-[8px]" />
                      {featuredArticle.author?.split(' ')[0]}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <FaClock className="text-[8px]" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop layout */}
              <div className="hidden md:grid md:grid-cols-2 gap-6 bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="h-80 overflow-hidden">
                  <img 
                    src={featuredArticle.featuredImage} 
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-[#1B3766] text-white text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#1B3766] transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <FaUser className="text-xs" />
                      {featuredArticle.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock className="text-xs" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[#1B3766] font-semibold text-sm group">
                    Read Article
                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Regular Articles Grid with Ads */}
        <div className="mb-10">
          {/* Mobile list */}
          <div className="space-y-4 md:hidden">
            {regularArticles.slice(0, 4).map((article, index) => (
              <React.Fragment key={article._id}>
                <Link to={`/biizzed/articles/${article.slug}`} className="group block">
                  <div className="flex flex-row bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="w-28 h-28 overflow-hidden flex-shrink-0 bg-gray-100">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 p-3">
                      <div className="mb-1">
                        <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-[#1B3766] text-[10px] font-semibold rounded capitalize">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#1B3766] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-xs mb-1 line-clamp-2">
                        {article.excerpt?.substring(0, 80)}...
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <FaUser className="text-[8px]" />
                          {article.author?.split(' ')[0]}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <FaClock className="text-[8px]" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Banner ad after 2nd article */}
                {index === 1 && (
                  <div className="min-h-[120px]">
                    {renderBannerAd(bannerAd)}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {regularArticles.slice(0, 4).map((article, index) => (
              <React.Fragment key={article._id}>
                <Link 
                  to={`/biizzed/articles/${article.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 h-full">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#1B3766] text-xs font-semibold rounded">
                          {article.category}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#1B3766] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaUser className="text-[10px]" />
                          {article.author?.split(' ')[0]}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-[10px]" />
                          {article.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Banner ad after 2nd article (replaces 3rd position) */}
                {index === 1 && (
                  <div className="h-full">
                    {renderBannerAd(bannerAd)}
                  </div>
                )}

                {/* Sidebar ad after 4th article (replaces 5th position) */}
                {index === 3 && (
                  <div className="h-full">
                    {renderSidebarAd(sidebarAd)}
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* View More Articles Button */}
        <div className="text-center">
          <Link
            to="/biizzed/articles"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1B3766] hover:bg-[#142952] text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
          >
            View More Articles
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BiizzedArticles;