// components/UduuaProductDisplay.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaStore, 
  FaTag, 
  FaSpinner,
  FaBox
} from 'react-icons/fa';
import { useGetProductsQuery } from '../slices/productApiSlice';

const UduuaProductDisplay = () => {
  const { data: productsData, isLoading } = useGetProductsQuery({
    available: true,
    limit: 8
  });

  const [animatedItems, setAnimatedItems] = useState([]);
  const products = productsData?.products || productsData || [];

  // Staggered fade-in with gentle rise
  useEffect(() => {
    if (products.length > 0) {
      const timers = products.map((_, index) => {
        return setTimeout(() => {
          setAnimatedItems(prev => [...prev, index]);
        }, index * 120);
      });
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [products]);

  const formatPrice = (price) => {
    if (!price) return "₦0";
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New": return { bg: "bg-green-500", text: "New" };
      case "Trending": return { bg: "bg-gradient-to-r from-orange-500 to-red-500", text: "Trending" };
      case "Bulk Available": return { bg: "bg-blue-500", text: "Bulk" };
      case "Shoppers Favourite": return { bg: "bg-purple-500", text: "Favourite" };
      default: return { bg: "bg-green-500", text: "New" };
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="w-10 h-10 text-[#0043FC] animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white via-white to-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 border border-[#0043FC]/20 px-4 py-2 rounded-full mb-4">
            <span className="w-2 h-2 bg-[#0043FC] rounded-full animate-pulse"></span>
            <span className="text-xs sm:text-sm font-semibold text-[#0043FC]">Handpicked For You</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Our Catalogue
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Discover our most popular items from fast-growing brands
          </p>
        </div>

        {/* Product Grid – Clean Catalogue Layout */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {products.slice(0, 8).map((product, index) => {
            const statusStyle = getStatusBadge(product.status);
            const productPrice = product.retailPrice || product.price;
            const productImage = product.images?.[0] || "/placeholder-product.jpg";
            const isAnimated = animatedItems.includes(index);

            return (
              <div
                key={product._id}
                className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-500 
                  ${isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                  animate-float-card`}
                style={{ 
                  transitionDelay: `${index * 60}ms`,
                  animationDelay: `${index * 0.3}s`
                }}
              >
                {/* Flowing gradient border (only visible on hover) */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-[-2px] rounded-2xl bg-gradient-to-r from-[#0043FC] via-[#79FFFF] to-[#0043FC] opacity-20 blur-sm animate-gradient-flow"></div>
                </div>

                {/* Soft sheen sweep across the card (independent from border) */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>

                {/* Product Image Area */}
                <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => { e.target.src = "/placeholder-product.jpg"; }}
                  />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 left-3 ${statusStyle.bg} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md z-10`}>
                    {statusStyle.text}
                  </div>

                  {/* Quick action icon (scale in on hover) */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                      <FaBox className="text-[#0043FC] text-xl" />
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="p-4 relative bg-white rounded-b-2xl">
                  {/* Brand */}
                  <div className="flex items-center gap-1 mb-1">
                    <FaStore className="text-gray-400 text-[10px]" />
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide truncate">
                      {product.brandName || "GENERIC"}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-1 mb-1">
                    <FaTag className="text-[#79FFFF] text-[10px]" />
                    <span className="text-[10px] text-gray-400 truncate">
                      {product.category || "General"}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px] group-hover:text-[#0043FC] transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i}
                        className={`text-[10px] ${i < Math.floor(product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">({product.numReviews || 0})</span>
                  </div>

                  {/* Price + Savings Badge */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-lg font-bold text-[#0043FC]">
                      {formatPrice(productPrice)}
                    </span>
                    {product.bulkPrice && product.bulkPrice < productPrice && (
                      <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Save {Math.round(((productPrice - product.bulkPrice) / productPrice) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Bulk Price Hint */}
                  {product.bulkPrice && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Bulk: {formatPrice(product.bulkPrice)} (2+ units)
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unique Animation Keyframes */}
      <style>{`
        /* Gentle floating – each card with a slightly different rhythm */
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-card {
          animation: floatCard 5s ease-in-out infinite;
        }

        /* Gradient border flow */
        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-flow {
          background-size: 200% 200%;
          animation: gradientFlow 4s ease infinite;
        }

        /* Staggered floating delays for organic feel */
        .grid > *:nth-child(2) { animation-delay: 0.6s; }
        .grid > *:nth-child(3) { animation-delay: 1.2s; }
        .grid > *:nth-child(4) { animation-delay: 0.3s; }
        .grid > *:nth-child(5) { animation-delay: 0.9s; }
        .grid > *:nth-child(6) { animation-delay: 1.5s; }
        .grid > *:nth-child(7) { animation-delay: 0.2s; }
        .grid > *:nth-child(8) { animation-delay: 0.8s; }
      `}</style>
    </section>
  );
};

export default UduuaProductDisplay;