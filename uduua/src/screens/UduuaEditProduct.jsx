// screens/UduuaEditProduct.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaUpload,
  FaSpinner,
  FaTrashAlt,
  FaPlus,
  FaTag,
  FaStore,
  FaBox,
  FaTruck,
  FaMoneyBill,
  FaPercent,
  FaInfoCircle,
  FaTimes,
  FaHashtag,
  FaSave,
  FaImage
} from 'react-icons/fa';
import { 
  useGetProductByIdQuery, 
  useUpdateProductMutation 
} from '../slices/productApiSlice';
import { useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaEditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: product, isLoading: isLoadingProduct } = useGetProductByIdQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  
  // Check if user is an approved seller
  const { data: applicationStatus, isLoading: isLoadingStatus } = useGetSellerApplicationStatusQuery(undefined, {
    skip: !userInfo,
  });
  
  const isApprovedSeller = applicationStatus?.sellerStatus === 'approved' && applicationStatus?.isSeller === true;

  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    description: '',
    retailPrice: '',
    bulkPrice: '',
    category: [], // Ensure it's always an array
    status: 'New',
    quantityAvailable: '',
    minOrderAmount: '60000',
    payOnDelivery: true,
    payOnline: true,
    discount: '',
    discountStartDate: '',
    discountEndDate: '',
    isAvailable: true,
  });

  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [customCategories, setCustomCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imagesToKeep, setImagesToKeep] = useState([]);
  const [errors, setErrors] = useState({});

  // Predefined categories
  const predefinedCategories = [
    'Electronics', 'Fashion', 'Home & Living', 'Beauty & Personal Care',
    'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Books & Stationery',
    'Health & Wellness', 'Grocery', 'Phones & Tablets', 'Computers',
    'Gaming', 'Music & Instruments', 'Furniture', 'Jewelry', 'Toys',
    'Pet Supplies', 'Office Supplies', 'Industrial', 'Others'
  ];

  const statusOptions = ['New', 'Trending', 'Bulk Available', 'Shoppers Favourite', 'Limited', 'Featured'];

  // Load product data when available
  useEffect(() => {
    if (product) {
      // Check if user owns this product
      if (product.seller?._id !== userInfo?._id && !userInfo?.isAdmin) {
        toast.error('You are not authorized to edit this product');
        navigate('/shop');
        return;
      }

      // Handle categories - ensure it's an array
      let productCategories = product.category || [];
      if (typeof productCategories === 'string') {
        productCategories = productCategories.split(',').map(c => c.trim()).filter(c => c);
      }
      if (!Array.isArray(productCategories)) {
        productCategories = [];
      }

      // Handle tags - ensure it's an array
      let productTags = product.tags || [];
      if (typeof productTags === 'string') {
        productTags = productTags.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
      }
      if (!Array.isArray(productTags)) {
        productTags = [];
      }

      setFormData({
        name: product.name || '',
        brandName: product.brandName || '',
        description: product.description || '',
        retailPrice: product.retailPrice || '',
        bulkPrice: product.bulkPrice || '',
        category: productCategories,
        status: product.status || 'New',
        quantityAvailable: product.quantityAvailable || '',
        minOrderAmount: product.minOrderAmount || '60000',
        payOnDelivery: product.deliveryOptions?.payOnDelivery ?? true,
        payOnline: product.deliveryOptions?.payOnline ?? true,
        discount: product.discount || '',
        discountStartDate: product.discountStartDate ? product.discountStartDate.split('T')[0] : '',
        discountEndDate: product.discountEndDate ? product.discountEndDate.split('T')[0] : '',
        isAvailable: product.isAvailable ?? true,
      });

      setTags(productTags);
      setExistingImages(product.images || []);
      setImagesToKeep(product.images || []);
    }
  }, [product, userInfo, navigate]);

  // Redirect if not logged in or not an approved seller
  if (!userInfo) {
    navigate('/shop/login', { state: { from: `/uduua/seller/edit-product/${id}` } });
    return null;
  }

  if (!isLoadingStatus && !isApprovedSeller) {
    toast.error('You must be an approved seller to edit products');
    navigate('/shop');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Category management
  const addCategory = () => {
    const newCategory = categoryInput.trim();
    if (!newCategory) return;
    
    if (formData.category.includes(newCategory)) {
      toast.error('Category already added');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      category: [...prev.category, newCategory]
    }));
    setCategoryInput('');
    
    // Add to custom categories if not predefined
    if (!predefinedCategories.includes(newCategory) && !customCategories.includes(newCategory)) {
      setCustomCategories(prev => [...prev, newCategory]);
    }
  };

  const removeCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.filter(cat => cat !== categoryToRemove)
    }));
  };

  const selectPredefinedCategory = (category) => {
    if (formData.category.includes(category)) {
      toast.error('Category already added');
      return;
    }
    setFormData(prev => ({
      ...prev,
      category: [...prev.category, category]
    }));
  };

  // Tags management
  const addTag = () => {
    const newTag = tagInput.trim().toLowerCase();
    if (!newTag) return;
    if (newTag.length > 30) {
      toast.error('Tag too long (max 30 characters)');
      return;
    }
    if (tags.includes(newTag)) {
      toast.error('Tag already added');
      return;
    }
    if (tags.length >= 10) {
      toast.error('Maximum 10 tags allowed');
      return;
    }
    
    setTags([...tags, newTag]);
    setTagInput('');
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'category') {
        addCategory();
      } else if (action === 'tag') {
        addTag();
      }
    }
  };

  // Image management
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    // Validate file sizes (max 5MB each)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Image ${file.name} exceeds 5MB limit`);
        return;
      }
    }

    setImages(prev => [...prev, ...files]);
    
    // Create previews for new images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index];
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    setImagesToKeep(prev => prev.filter(img => img !== imageToRemove));
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brandName.trim()) newErrors.brandName = 'Brand name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.retailPrice || parseFloat(formData.retailPrice) <= 0) {
      newErrors.retailPrice = 'Valid retail price is required';
    }
    if (formData.bulkPrice && parseFloat(formData.bulkPrice) >= parseFloat(formData.retailPrice)) {
      newErrors.bulkPrice = 'Bulk price must be less than retail price';
    }
    if (formData.category.length === 0) {
      newErrors.category = 'At least one category is required';
    }
    if (!formData.quantityAvailable || parseInt(formData.quantityAvailable) <= 0) {
      newErrors.quantityAvailable = 'Valid quantity is required';
    }
    if (existingImages.length === 0 && images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('brandName', formData.brandName);
    submitData.append('description', formData.description);
    submitData.append('retailPrice', formData.retailPrice);
    submitData.append('bulkPrice', formData.bulkPrice || '0');
    
    // Send categories as comma-separated string
    submitData.append('category', formData.category.join(','));
    
    // Send tags as comma-separated string
    if (tags.length > 0) {
      submitData.append('tags', tags.join(','));
    }
    
    submitData.append('status', formData.status);
    submitData.append('quantityAvailable', formData.quantityAvailable);
    submitData.append('minOrderAmount', formData.minOrderAmount);
    submitData.append('payOnDelivery', formData.payOnDelivery);
    submitData.append('payOnline', formData.payOnline);
    submitData.append('isAvailable', formData.isAvailable);
    
    if (formData.discount) submitData.append('discount', formData.discount);
    if (formData.discountStartDate) submitData.append('discountStartDate', formData.discountStartDate);
    if (formData.discountEndDate) submitData.append('discountEndDate', formData.discountEndDate);
    
    // Add images to keep
    imagesToKeep.forEach(image => {
      submitData.append('keepImages', image);
    });
    
    // Add new images
    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      await updateProduct({ id, data: submitData }).unwrap();
      toast.success('Product updated successfully! It will be reviewed by admin.');
      navigate('/shop');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to update product');
    }
  };

  if (isLoadingProduct || isLoadingStatus) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-[#0043FC] mx-auto mb-4" />
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <ShopNavbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Product not found</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 px-4 py-2 bg-[#0043FC] text-white rounded-lg"
            >
              Back to Shop
            </button>
          </div>
        </div>
        <UduuaFooter />
      </>
    );
  }

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors"
            >
              <FaArrowLeft className="text-sm" /> Back to Shop
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                <FaSave className="text-[#0043FC] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-sm text-gray-500">Update your product information</p>
              </div>
            </div>
          </div>

          {/* Re-approval Info Banner */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-yellow-600 text-lg mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Re-approval Required</p>
                <p className="text-sm text-yellow-700">
                  Any significant changes to your product will require admin re-approval 
                  before it appears on the marketplace.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {/* Basic Information */}
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaStore className="text-[#0043FC]" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.brandName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter brand name"
                  />
                  {errors.brandName && <p className="mt-1 text-xs text-red-500">{errors.brandName}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe your product in detail"
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>
              </div>
            </div>

            {/* Categories - Flexible */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTag className="text-[#0043FC]" />
                Categories *
              </h2>

              {/* Selected Categories */}
              {formData.category && formData.category.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.category.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="hover:text-blue-900"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}

              {/* Predefined Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select from predefined categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {predefinedCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => selectPredefinedCategory(cat)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Custom Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or add custom category
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, 'category')}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="Enter custom category"
                  />
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-4 py-2.5 bg-[#0043FC] text-white rounded-lg hover:bg-[#0038D4] transition-colors"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">Press Enter or click Add to add category</p>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaHashtag className="text-[#0043FC]" />
                Tags (Optional)
              </h2>
              <p className="text-xs text-gray-400">Tags help customers find your product (max 10 tags)</p>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-gray-800"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'tag')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  placeholder="Enter tag (e.g., sale, new, featured)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={tags.length >= 10}
                  className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Add Tag
                </button>
              </div>
            </div>

            {/* Status & Availability */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTag className="text-[#0043FC]" />
                Product Status
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Badge
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Availability
                  </label>
                  <select
                    name="isAvailable"
                    value={formData.isAvailable}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  >
                    <option value={true}>In Stock</option>
                    <option value={false}>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaMoneyBill className="text-[#0043FC]" />
                Pricing
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retail Price (₦) *
                  </label>
                  <input
                    type="number"
                    name="retailPrice"
                    value={formData.retailPrice}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.retailPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.retailPrice && <p className="mt-1 text-xs text-red-500">{errors.retailPrice}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bulk Price (₦) (for 2+ units)
                  </label>
                  <input
                    type="number"
                    name="bulkPrice"
                    value={formData.bulkPrice}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.bulkPrice ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.bulkPrice && <p className="mt-1 text-xs text-red-500">{errors.bulkPrice}</p>}
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPercent className="text-[#0043FC]" />
                Discount (Optional)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="0"
                    min="0"
                    max="100"
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
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
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBox className="text-[#0043FC]" />
                Inventory
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Available *
                  </label>
                  <input
                    type="number"
                    name="quantityAvailable"
                    value={formData.quantityAvailable}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.quantityAvailable ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.quantityAvailable && <p className="mt-1 text-xs text-red-500">{errors.quantityAvailable}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount (₦)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC]"
                    placeholder="60000"
                  />
                  <p className="text-xs text-gray-400 mt-1">Minimum total order value required</p>
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaTruck className="text-[#0043FC]" />
                Delivery Options
              </h2>

              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="payOnDelivery"
                    checked={formData.payOnDelivery}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#0043FC] rounded focus:ring-[#0043FC]"
                  />
                  <span className="text-sm text-gray-700">Pay on Delivery</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="payOnline"
                    checked={formData.payOnline}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#0043FC] rounded focus:ring-[#0043FC]"
                  />
                  <span className="text-sm text-gray-700">Pay Online (Card/Bank Transfer)</span>
                </label>
              </div>
            </div>

            {/* Product Images */}
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaImage className="text-[#0043FC]" />
                Product Images *
              </h2>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTrashAlt className="text-[8px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Upload */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                errors.images ? 'border-red-500' : 'border-gray-300 hover:border-[#0043FC]'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="cursor-pointer block">
                  <FaUpload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Click to add more images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB each, max 5 total images)</p>
                </label>
              </div>
              {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Images
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                        <img src={preview} alt={`New Preview ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FaTrashAlt className="text-[8px]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/shop')}
                  className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <FaSpinner className="animate-spin" /> Updating...
                    </>
                  ) : (
                    <>
                      <FaSave /> Update Product
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Products with significant changes will be reviewed by admin before reappearing
              </p>
            </div>
          </form>
        </div>
      </div>
      <UduuaFooter />
    </>
  );
};

export default UduuaEditProduct;