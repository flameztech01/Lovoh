// screens/AdminEditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaImage,
  FaPlus,
  FaTrashAlt,
  FaInfoCircle,
  FaTag,
  FaBox,
  FaDollarSign,
  FaPercentage,
  FaLayerGroup,
  FaChevronDown,
  FaChevronUp,
  FaSpinner,
  FaStore,
  FaFlag,
  FaChartLine,
  FaTruck,
  FaCheckCircle
} from 'react-icons/fa';
import { useGetProductByIdQuery, useUpdateProductMutation, useGetCategoriesQuery } from '../slices/productApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { data: productData, isLoading: isLoadingProduct, error: productError } = useGetProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData || [];
  
  const product = productData;

  // Status options
  const statusOptions = [
    { value: 'New', label: 'New', color: 'bg-green-500' },
    { value: 'Trending', label: 'Trending', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
    { value: 'Bulk Available', label: 'Bulk Available', color: 'bg-blue-500' },
    { value: 'Shoppers Favourite', label: 'Shoppers Favourite', color: 'bg-purple-500' },
    { value: 'Limited', label: 'Limited', color: 'bg-yellow-500' },
    { value: 'Featured', label: 'Featured', color: 'bg-pink-500' },
  ];

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    description: '',
    retailPrice: '',
    bulkPrice: '',
    category: '',
    status: 'New',
    quantityAvailable: '',
    minOrderAmount: '60000',
    isAvailable: true,
    isSoldOut: false,
    discount: '',
    discountStartDate: '',
    discountEndDate: '',
    payOnDelivery: true,
    payOnline: true,
  });

  // Bulk pricing state
  const [bulkTiers, setBulkTiers] = useState([]);
  const [newTier, setNewTier] = useState({ minQuantity: '', price: '' });
  const [showBulkPricing, setShowBulkPricing] = useState(false);
  
  // Images state
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Seller info
  const [sellerInfo, setSellerInfo] = useState(null);

  // Load product data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        brandName: product.brandName || '',
        description: product.description || '',
        retailPrice: product.retailPrice?.toString() || '',
        bulkPrice: product.bulkPrice?.toString() || '',
        category: product.category || '',
        status: product.status || 'New',
        quantityAvailable: product.quantityAvailable?.toString() || '',
        minOrderAmount: product.minOrderAmount?.toString() || '60000',
        isAvailable: product.isAvailable ?? true,
        isSoldOut: product.isSoldOut ?? false,
        discount: product.discount?.toString() || '',
        discountStartDate: product.discountStartDate ? product.discountStartDate.split('T')[0] : '',
        discountEndDate: product.discountEndDate ? product.discountEndDate.split('T')[0] : '',
        payOnDelivery: product.deliveryOptions?.payOnDelivery ?? true,
        payOnline: product.deliveryOptions?.payOnline ?? true,
      });
      
      if (product.bulkPricing && product.bulkPricing.length > 0) {
        setBulkTiers(product.bulkPricing.map(tier => ({
          minQuantity: tier.minQuantity,
          price: tier.price
        })));
        setShowBulkPricing(true);
      }
      
      if (product.images && product.images.length > 0) {
        setExistingImages(product.images);
      }
      
      if (product.seller) {
        setSellerInfo(product.seller);
      }
    }
  }, [product]);

  // Handle product not found
  useEffect(() => {
    if (productError) {
      toast.error('Product not found');
      navigate('/admin/products');
    }
  }, [productError, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result]);
          setNewImages(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is not an image file`);
      }
    });
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Add bulk pricing tier
  const addBulkTier = () => {
    if (!newTier.minQuantity || !newTier.price) {
      toast.error('Please fill in both min quantity and price');
      return;
    }
    
    const minQty = parseInt(newTier.minQuantity);
    const price = parseFloat(newTier.price);
    
    if (isNaN(minQty) || isNaN(price)) {
      toast.error('Please enter valid numbers');
      return;
    }
    
    if (bulkTiers.some(tier => tier.minQuantity === minQty)) {
      toast.error('Minimum quantity already exists');
      return;
    }
    
    setBulkTiers(prev => [...prev, { minQuantity: minQty, price: price }].sort((a, b) => a.minQuantity - b.minQuantity));
    setNewTier({ minQuantity: '', price: '' });
  };

  // Remove bulk tier
  const removeBulkTier = (index) => {
    setBulkTiers(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate savings percentage
  const calculateSavings = () => {
    const retail = parseFloat(formData.retailPrice);
    const bulk = parseFloat(formData.bulkPrice);
    if (retail && bulk && retail > bulk) {
      return Math.round(((retail - bulk) / retail) * 100);
    }
    return 0;
  };

  // Get discounted price
  const getDiscountedPrice = () => {
    const retail = parseFloat(formData.retailPrice);
    const discount = parseFloat(formData.discount);
    if (retail && discount && discount > 0) {
      const now = new Date();
      const startDate = formData.discountStartDate ? new Date(formData.discountStartDate) : null;
      const endDate = formData.discountEndDate ? new Date(formData.discountEndDate) : null;
      const isDiscountValid = (!startDate || now >= startDate) && (!endDate || now <= endDate);
      if (isDiscountValid) {
        return retail * (1 - discount / 100);
      }
    }
    return retail;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.brandName.trim()) {
      toast.error('Brand name is required');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Product description is required');
      return;
    }
    
    if (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) {
      toast.error('Valid retail price is required');
      return;
    }
    
    if (!formData.bulkPrice || parseFloat(formData.bulkPrice) <= 0) {
      toast.error('Valid bulk price is required');
      return;
    }
    
    if (parseFloat(formData.retailPrice) <= parseFloat(formData.bulkPrice)) {
      toast.error('Retail price must be greater than bulk price');
      return;
    }
    
    if (!formData.category) {
      toast.error('Product category is required');
      return;
    }
    
    if (!formData.quantityAvailable || parseInt(formData.quantityAvailable) < 0) {
      toast.error('Valid quantity is required');
      return;
    }
    
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('name', formData.name.trim());
    submitData.append('brandName', formData.brandName.trim().toUpperCase());
    submitData.append('description', formData.description.trim());
    submitData.append('retailPrice', parseFloat(formData.retailPrice));
    submitData.append('bulkPrice', parseFloat(formData.bulkPrice));
    submitData.append('category', formData.category);
    submitData.append('status', formData.status);
    submitData.append('quantityAvailable', parseInt(formData.quantityAvailable));
    submitData.append('minOrderAmount', parseInt(formData.minOrderAmount) || 60000);
    submitData.append('isAvailable', formData.isAvailable);
    submitData.append('isSoldOut', formData.isSoldOut);
    submitData.append('payOnDelivery', formData.payOnDelivery);
    submitData.append('payOnline', formData.payOnline);
    
    if (formData.discount && parseFloat(formData.discount) > 0) {
      submitData.append('discount', parseFloat(formData.discount));
      if (formData.discountStartDate) submitData.append('discountStartDate', formData.discountStartDate);
      if (formData.discountEndDate) submitData.append('discountEndDate', formData.discountEndDate);
    }
    
    if (bulkTiers.length > 0) {
      submitData.append('bulkPricing', JSON.stringify(bulkTiers));
    }
    
    // Append existing images to keep
    if (existingImages.length > 0) {
      existingImages.forEach(image => {
        submitData.append('keepImages', image);
      });
    }
    
    // Append new images
    newImages.forEach(image => {
      submitData.append('images', image);
    });
    
    try {
      setUploading(true);
      await updateProduct({ id, data: submitData }).unwrap();
      toast.success('Product updated successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update product');
    } finally {
      setUploading(false);
    }
  };

  const addNewCategory = () => {
    const newCategory = prompt('Enter new category name:');
    if (newCategory && newCategory.trim()) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      toast.success('Category selected');
    }
  };

  // Loading state
  if (isLoadingProduct) {
    return (
      <AdminSidebar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="text-4xl text-[#0043FC] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading product...</p>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-500 hover:text-[#0043FC] mb-3 transition-colors group"
          >
            <FaArrowLeft className="text-sm group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Back to Products</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-1">Update product information</p>
        </div>

        {/* Seller Info Banner */}
        {sellerInfo && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <FaStore className="text-[#0043FC] text-xl" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Seller: {sellerInfo.businessName || sellerInfo.name}</p>
                <p className="text-xs text-gray-600">Email: {sellerInfo.email} | Phone: {sellerInfo.phone || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">Product status: {product?.isApproved ? 
                  <span className="text-green-600">Approved ✓</span> : 
                  <span className="text-yellow-600">Pending Approval ⏳</span>}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Content - Left */}
            <div className="flex-1 space-y-5">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaInfoCircle className="text-[#0043FC] text-sm" />
                    Basic Information
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Premium Cotton T-Shirt"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaStore className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                        <input
                          type="text"
                          name="brandName"
                          value={formData.brandName}
                          onChange={handleChange}
                          placeholder="e.g., URBAN STITCH"
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors uppercase"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      placeholder="Detailed product description..."
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                        >
                          <option value="">Select a category</option>
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={addNewCategory}
                          className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:border-[#0043FC] hover:text-[#0043FC] transition-colors"
                        >
                          <FaPlus className="text-sm" />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="border-t border-gray-100 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Options
                    </label>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="payOnDelivery"
                          checked={formData.payOnDelivery}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <FaTruck className="text-xs" /> Pay on Delivery
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="payOnline"
                          checked={formData.payOnline}
                          onChange={handleChange}
                          className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          <FaCheckCircle className="text-xs" /> Pay Online
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Availability Toggles */}
                  <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
                      />
                      <span className="text-sm text-gray-700">Product Available</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isSoldOut"
                        checked={formData.isSoldOut}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#0043FC] border-gray-300 rounded focus:ring-[#0043FC]"
                      />
                      <span className="text-sm text-gray-700">Mark as Sold Out</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaDollarSign className="text-[#0043FC] text-sm" />
                    Pricing & Stock
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retail Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="retailPrice"
                        value={formData.retailPrice}
                        onChange={handleChange}
                        placeholder="15000"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Price for single unit purchase</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bulk Price (₦) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="bulkPrice"
                        value={formData.bulkPrice}
                        onChange={handleChange}
                        placeholder="12000"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Price for 2+ units</p>
                    </div>
                  </div>
                  
                  {/* Savings Indicator */}
                  {calculateSavings() > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                      <FaChartLine className="text-green-600 text-sm" />
                      <span className="text-sm text-green-700">
                        Bulk buyers save <strong>{calculateSavings()}%</strong> off retail price
                      </span>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Available <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantityAvailable"
                        value={formData.quantityAvailable}
                        onChange={handleChange}
                        placeholder="100"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Order Amount (₦)
                      </label>
                      <input
                        type="number"
                        name="minOrderAmount"
                        value={formData.minOrderAmount}
                        onChange={handleChange}
                        placeholder="60000"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                      <p className="text-xs text-gray-400 mt-1">Default: ₦60,000</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Discount Section */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaPercentage className="text-[#0043FC] text-sm" />
                    Discount (Optional)
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount (%)
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="discountStartDate"
                        value={formData.discountStartDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="discountEndDate"
                        value={formData.discountEndDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC] transition-colors"
                      />
                    </div>
                  </div>
                  
                  {getDiscountedPrice() < parseFloat(formData.retailPrice) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                      <FaPercentage className="text-blue-600 text-sm" />
                      <span className="text-sm text-blue-700">
                        Discounted price: ₦{getDiscountedPrice().toLocaleString()} (Save {formData.discount}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bulk Pricing */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBulkPricing(!showBulkPricing)}
                  className="w-full px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FaLayerGroup className="text-[#0043FC] text-sm" />
                    <h2 className="text-base font-semibold text-gray-900">Advanced Bulk Pricing</h2>
                    <span className="text-xs text-gray-400">(Optional)</span>
                  </div>
                  {showBulkPricing ? <FaChevronUp className="text-gray-400 text-sm" /> : <FaChevronDown className="text-gray-400 text-sm" />}
                </button>
                
                {showBulkPricing && (
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="number"
                        placeholder="Min Quantity"
                        value={newTier.minQuantity}
                        onChange={(e) => setNewTier({ ...newTier, minQuantity: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
                      />
                      <input
                        type="number"
                        placeholder="Price per Unit (₦)"
                        value={newTier.price}
                        onChange={(e) => setNewTier({ ...newTier, price: e.target.value })}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0043FC] focus:ring-1 focus:ring-[#0043FC]"
                      />
                      <button
                        type="button"
                        onClick={addBulkTier}
                        className="px-4 py-2.5 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0033cc] transition-colors"
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    </div>
                    
                    {bulkTiers.length > 0 && (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="divide-y divide-gray-100">
                          {bulkTiers.map((tier, index) => (
                            <div key={index} className="flex items-center justify-between p-3">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{tier.minQuantity}+ units</span>
                                <span className="text-sm text-gray-600 ml-2">→ ₦{tier.price.toLocaleString()}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeBulkTier(index)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <FaTrashAlt className="text-xs" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400">
                      Add custom bulk pricing tiers for larger quantities (overrides default bulk price)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="lg:w-96 space-y-5">
              {/* Product Images */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
                <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <FaImage className="text-[#0043FC] text-sm" />
                    Product Images <span className="text-red-500">*</span>
                  </h2>
                </div>
                <div className="p-5">
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <>
                      <p className="text-xs text-gray-500 mb-2">Current Images</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {existingImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">Main</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Upload New Images */}
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0043FC] transition-colors">
                      <FaImage className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload new images</p>
                      <p className="text-xs text-gray-400 mt-1">Max 5 images total, JPG, PNG</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </label>
                  
                  {/* New Image Previews */}
                  {newImagePreviews.length > 0 && (
                    <>
                      <p className="text-xs text-gray-500 mt-4 mb-2">New Images</p>
                      <div className="grid grid-cols-2 gap-3">
                        {newImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    First image will be the main product image
                  </p>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FaInfoCircle className="text-[#0043FC] text-sm" />
                  Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <FaStore className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Brand names are automatically capitalized</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaDollarSign className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Retail price must be higher than bulk price</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaFlag className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Status helps products stand out</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaBox className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Add high-quality images for better sales</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaPercentage className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Discounts expire after end date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaTruck className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Enable delivery options based on logistics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || uploading}
              className="flex-1 md:flex-none px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0033cc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaSave className="text-sm" />
              {uploading || isUpdating ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminEditProduct;