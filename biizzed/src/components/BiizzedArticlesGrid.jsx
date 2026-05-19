// components/BiizzedArticlesGrid.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaSpinner, 
  FaAd, 
  FaChartLine, 
  FaBullhorn,
  FaWhatsapp,
  FaImage,
  FaVideo,
  FaPlay,
  FaPause,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { useGetMagazinesQuery } from '../slices/magApiSlice';
import { useGetAdsQuery, useTrackAdClickMutation, useTrackAdViewMutation } from '../slices/adsApiSlice';

const BiizzedArticlesGrid = () => {
  // Fetch featured magazines only
  const { data: magazinesData, isLoading: magazinesLoading } = useGetMagazinesQuery({
    status: 'published',
    featured: true,
    limit: 6
  });

  // Fetch ads for Biizzed FEATURED placement (square ad in grid)
  const { data: featuredAdsData, isLoading: featuredAdsLoading } = useGetAdsQuery({
    page: 'biizzed',
    placement: 'featured',
    supportsImage: true,
    supportsVideo: true,
    limit: 2,
  });

  // Fetch ads for Biizzed BANNER placement (horizontal banner ad)
  const { data: bannerAdsData, isLoading: bannerAdsLoading } = useGetAdsQuery({
    page: 'biizzed',
    placement: 'banner',
    supportsImage: true,
    supportsVideo: true,
    limit: 2,
  });

  const [trackClick] = useTrackAdClickMutation();
  const [trackView] = useTrackAdViewMutation();

  const magazines = magazinesData?.magazines || [];
  const featuredAds = featuredAdsData?.ads || [];
  const bannerAds = bannerAdsData?.ads || [];

  // Create "Advertise with us" ad
  const createAdvertiseAd = (placement) => ({
    _id: `advertise-biizzed-${placement}`,
    title: 'Advertise With Biizzed',
    subtitle: placement === 'featured' ? 'Reach business leaders' : 'Premium Business Intelligence',
    description: 'Connect with decision-makers and industry professionals',
    ctaText: 'Message on WhatsApp',
    ctaLink: 'https://wa.me/2348055766461?text=Hello%2C%20I%27m%20interested%20in%20advertising%20on%20Biizzed',
    mediaType: 'image',
    image: '/campus1.jpg',
    bgColor: 'from-gray-800 to-gray-900',
    accentColor: '#79FFFF',
    isAdvertiseAd: true,
  });

  // Get square ad (featured placement) - first ad or advertise
  const squareAd = featuredAds.length > 0 ? featuredAds[0] : createAdvertiseAd('featured');

  // Get banner ad (banner placement) - first ad or advertise
  const bannerAd = bannerAds.length > 0 ? bannerAds[0] : createAdvertiseAd('banner');

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

    // ALWAYS use <a> tag for external URLs or advertise ads
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

    // Only use Link for internal routes (starting with /)
    return (
      <Link to={formattedUrl || '#'} className={className} onClick={() => handleAdClick(ad)}>
        {children}
      </Link>
    );
  };

  // Render Square Ad (featured placement) - LIGHTER OVERLAY, TEXT AT BOTTOM
  const renderSquareAd = (ad) => {
    const isAdvertise = ad.isAdvertiseAd;
    const hasVideo = ad.mediaType === 'video' && ad.video;
    
    return (
      <div 
        className="relative rounded-lg overflow-hidden shadow-md h-full group"
        onMouseEnter={() => handleAdView(ad)}
      >
        {/* Background Media - Full visibility */}
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
        
        {/* Lighter Gradient Overlay - Only at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        
        {/* Content - Positioned at bottom */}
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

  // Render Banner Ad (banner placement) - LIGHTER OVERLAY
  const renderBannerAd = (ad) => {
    const isAdvertise = ad.isAdvertiseAd;
    const hasVideo = ad.mediaType === 'video' && ad.video;
    
    return (
      <div 
        className="relative rounded-lg overflow-hidden shadow-md h-full min-h-[100px] group"
        onMouseEnter={() => handleAdView(ad)}
      >
        {/* Background Media - Full visibility */}
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
        
        {/* Lighter Gradient Overlay - Left to right gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
        
        {/* Content */}
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

  const isLoading = magazinesLoading || featuredAdsLoading || bannerAdsLoading;

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="w-10 h-10 text-[#1B3766] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50" id="category-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Featured Editions
          </h2>
          <p className="text-gray-500 mt-2 text-sm">
            Curated premium content for business leaders
          </p>
        </div>

        {/* Grid - 2 columns on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Magazine 1 */}
          {magazines[0] && (
            <Link 
              to={`/story/${magazines[0].slug}`}
              className="group block"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img 
                    src={magazines[0].coverImage} 
                    alt={magazines[0].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 text-[#1B3766] px-1.5 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm">
                    {magazines[0].category}
                  </span>
                </div>
                {magazines[0].isFeatured && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#1B3766] text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold shadow-md">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* AD BOX 1 - Square Ad (featured placement) */}
          <div className="aspect-[3/4]">
            {renderSquareAd(squareAd)}
          </div>

          {/* Magazine 2 */}
          {magazines[1] && (
            <Link 
              to={`/story/${magazines[1].slug}`}
              className="group block"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img 
                    src={magazines[1].coverImage} 
                    alt={magazines[1].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 text-[#1B3766] px-1.5 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm">
                    {magazines[1].category}
                  </span>
                </div>
                {magazines[1].isFeatured && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#1B3766] text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold shadow-md">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Magazine 3 */}
          {magazines[2] && (
            <Link 
              to={`/story/${magazines[2].slug}`}
              className="group block"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                  <img 
                    src={magazines[2].coverImage} 
                    alt={magazines[2].title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-white/90 text-[#1B3766] px-1.5 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-sm">
                    {magazines[2].category}
                  </span>
                </div>
                {magazines[2].isFeatured && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-[#1B3766] text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold shadow-md">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Second Row - Banner Ad + More Editions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* AD BOX 2 - Horizontal Banner Style (banner placement) */}
          <div className="min-h-[100px]">
            {renderBannerAd(bannerAd)}
          </div>

          {/* More Editions Coming Soon */}
          {magazines[3] ? (
            <Link 
              to={`/story/${magazines[3].slug}`}
              className="group block"
            >
              <div className="relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center h-full">
                  <div className="w-24 h-24 overflow-hidden bg-gray-100 shrink-0">
                    <img 
                      src={magazines[3].coverImage} 
                      alt={magazines[3].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-gray-200 text-[#1B3766] px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
                        {magazines[3].category}
                      </span>
                      {magazines[3].isFeatured && (
                        <span className="bg-[#1B3766] text-white px-1.5 py-0.5 rounded-md text-[10px] font-semibold">
                          Featured
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {magazines[3].title}
                    </h4>
                    <p className="text-[#1B3766] text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read Edition
                      <FaArrowRight className="text-[10px]" />
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative rounded-lg overflow-hidden shadow-md bg-gray-200 flex items-center justify-center">
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mb-3">
                  <FaArrowRight className="text-gray-500 text-xl" />
                </div>
                <p className="text-gray-600 font-semibold text-sm">More Editions</p>
                <p className="text-gray-400 text-xs mt-1">Coming soon</p>
              </div>
            </div>
          )}
        </div>

        {/* View All Magazines Button */}
        <div className="text-center mt-10">
          <Link
            to="/magazines"
            className="inline-flex items-center gap-2 px-5 py-2 bg-[#1B3766] hover:bg-[#142952] text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
          >
            View All Magazines
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BiizzedArticlesGrid;