// components/UduuaFeaturedProducts.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShoppingCart,
  FaArrowRight,
  FaStar,
  FaFire,
  FaTag,
  FaStore,
} from "react-icons/fa";
import { useGetProductsQuery } from "../slices/productApiSlice";

const UduuaFeaturedProducts = () => {
  // Fetch available products
  const { data: productsData, isLoading, error } = useGetProductsQuery({
    available: true,
  });

  const allProducts = productsData || [];
  
  // Get random 6 products
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (allProducts.length > 0) {
      // Shuffle array and get first 6
      const shuffled = [...allProducts];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setProducts(shuffled.slice(0, 6));
    }
  }, [allProducts]);

  // Format price
  const formatPrice = (price) => {
    if (!price) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return {
          bg: "bg-green-500",
          text: "New",
        };
      case "Trending":
        return {
          bg: "bg-gradient-to-r from-orange-500 to-red-500",
          text: "Trending",
        };
      case "Bulk Available":
        return {
          bg: "bg-blue-500",
          text: "Bulk Available",
        };
      case "Shoppers Favourite":
        return {
          bg: "bg-purple-500",
          text: "Shoppers Favourite",
        };
      case "Limited":
        return {
          bg: "bg-yellow-500",
          text: "Limited",
        };
      case "Featured":
        return {
          bg: "bg-pink-500",
          text: "Featured",
        };
      default:
        return {
          bg: "bg-gray-500",
          text: status || "New",
        };
    }
  };

  // Render star rating based on product rating
  const renderRating = (rating) => {
    const fullStars = Math.floor(rating || 5);
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-[8px] md:text-[10px] ${
              i < fullStars ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded-full mb-3"></div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-gray-200 rounded mt-4 sm:mt-0"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl h-72"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    console.error("Error fetching products:", error);
    return null;
  }

  // No products
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0043FC]/10 to-[#79FFFF]/10 px-3 py-1 rounded-full mb-3">
              <FaFire className="text-[#0043FC] text-sm" />
              <span className="text-xs font-semibold text-[#0043FC]">
                Trending Now
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Discover our handpicked selection
            </p>
          </div>

          <Link
            to="/uduua/shop"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-[#0043FC] font-semibold hover:gap-3 transition-all text-sm"
          >
            View All Products <FaArrowRight />
          </Link>
        </div>

        {/* Products Grid - 2 columns on mobile, 3 on tablet, 6 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {products.map((product) => {
            const statusStyle = getStatusBadge(product.status);
            const productImage = product.images?.[0] || "/placeholder-product.jpg";
            
            return (
              <Link
                key={product._id}
                to={`/uduua/shop/product/${product._id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                {/* Product Image - Smaller aspect ratio */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = "/placeholder-product.jpg";
                    }}
                  />

                  {/* Status Badge - Top Left */}
                  <div
                    className={`absolute top-2 left-2 ${statusStyle.bg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full`}
                  >
                    {statusStyle.text}
                  </div>

                  {/* Stock Badge - If sold out */}
                  {product.isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-xs px-2 py-1 bg-red-500 rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Low Stock Badge */}
                  {!product.isSoldOut && product.quantityAvailable > 0 && product.quantityAvailable < 10 && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Low Stock
                    </div>
                  )}
                </div>

                {/* Product Info - Compact */}
                <div className="p-2 md:p-3">
                  {/* Brand Name - Bold All Caps Grey */}
                  <div className="flex items-center gap-1 mb-0.5">
                    <FaStore className="text-gray-400 text-[8px] md:text-[10px]" />
                    <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wide truncate">
                      {product.brandName || "GENERIC"}
                    </span>
                  </div>

                  {/* Category - Original position */}
                  <div className="flex items-center gap-1 mb-1">
                    <FaTag className="text-[#79FFFF] text-[8px] md:text-[10px]" />
                    <span className="text-[10px] md:text-xs text-gray-400 truncate">
                      {product.category || "General"}
                    </span>
                  </div>

                  {/* Product Name - Compact */}
                  <h3 className="font-semibold text-gray-900 text-xs md:text-sm mb-1 line-clamp-2 min-h-[32px] md:min-h-[40px]">
                    {product.name}
                  </h3>

                  {/* Rating - From backend */}
                  <div className="mb-1">
                    {renderRating(product.rating || 5)}
                  </div>

                  {/* Retail Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm md:text-base font-bold text-[#0043FC]">
                      {formatPrice(product.retailPrice)}
                    </span>
                  </div>

                  {/* Bulk Price */}
                  <div className="hidden md:block mt-1 text-[10px] text-gray-400">
                    Bulk: {formatPrice(product.bulkPrice)}
                  </div>

                  {/* Savings Badge */}
                  {product.retailPrice > product.bulkPrice && (
                    <div className="mt-1 md:hidden">
                      <span className="text-[10px] text-green-600 font-medium">
                        Save {Math.round(((product.retailPrice - product.bulkPrice) / product.retailPrice) * 100)}% on bulk
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Shop Button */}
        <div className="mt-10 text-center">
          <Link
            to="/uduua/shop"
            className="inline-flex items-center gap-2 bg-[#0043FC] hover:bg-[#0038D4] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
          >
            <FaShoppingCart />
            Visit Marketplace
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default UduuaFeaturedProducts;