// screens/UduuaAddProduct.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { useCreateProductMutation } from '../slices/productApiSlice';
import { useGetSellerApplicationStatusQuery } from '../slices/sellerApiSlice';
import ShopNavbar from '../components/ShopNavbar';
import UduuaFooter from '../components/UduuaFooter';

const UduuaAddProduct = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [createProduct, { isLoading }] = useCreateProductMutation();
  
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
    category: '',
    status: 'New',
    quantityAvailable: '',
    minOrderAmount: '60000',
    payOnDelivery: true,
    payOnline: true,
    discount: '',
    discountStartDate: '',
    discountEndDate: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const categories = [
    'Electronics', 'Fashion', 'Home & Living', 'Beauty & Personal Care',
    'Baby & Kids', 'Sports & Outdoors', 'Automotive', 'Books & Stationery',
    'Health & Wellness', 'Grocery', 'Phones & Tablets', 'Computers',
    'Gaming', 'Music & Instruments', 'Others'
  ];

  const statusOptions = ['New', 'Trending', 'Bulk Available', 'Shoppers Favourite', 'Limited', 'Featured'];

  // Redirect if not logged in or not an approved seller
  if (!userInfo) {
    navigate('/uduua/shop/login', { state: { from: '/uduua/seller/add-product' } });
    return null;
  }

  if (!isLoadingStatus && !isApprovedSeller) {
    toast.error('You must be an approved seller to add products');
    navigate('/uduua/shop');
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images, ...files];
    
    if (newImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImages(newImages);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
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
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantityAvailable || parseInt(formData.quantityAvailable) <= 0) {
      newErrors.quantityAvailable = 'Valid quantity is required';
    }
    if (images.length === 0) newErrors.images = 'At least one product image is required';

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
    submitData.append('category', formData.category);
    submitData.append('status', formData.status);
    submitData.append('quantityAvailable', formData.quantityAvailable);
    submitData.append('minOrderAmount', formData.minOrderAmount);
    submitData.append('payOnDelivery', formData.payOnDelivery);
    submitData.append('payOnline', formData.payOnline);
    
    if (formData.discount) submitData.append('discount', formData.discount);
    if (formData.discountStartDate) submitData.append('discountStartDate', formData.discountStartDate);
    if (formData.discountEndDate) submitData.append('discountEndDate', formData.discountEndDate);
    
    images.forEach(image => {
      submitData.append('images', image);
    });

    try {
      await createProduct(submitData).unwrap();
      toast.success('Product submitted for approval! It will be visible once approved.');
      navigate('/uduua/shop');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to add product');
    }
  };

  return (
    <>
      <ShopNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/uduua/shop')}
              className="flex items-center gap-2 text-gray-600 hover:text-[#0043FC] mb-4 transition-colors"
            >
              <FaArrowLeft className="text-sm" /> Back to Shop
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                <FaPlus className="text-[#0043FC] text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-500">Fill in the details to list your product</p>
              </div>
            </div>
          </div>

          {/* Approval Info Banner */}
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FaInfoCircle className="text-yellow-600 text-lg mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">Product Approval Required</p>
                <p className="text-sm text-yellow-700">
                  Your product will be reviewed by our admin team before appearing on the marketplace. 
                  This usually takes 1-2 business days.
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0043FC] ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
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
                <FaUpload className="text-[#0043FC]" />
                Product Images *
              </h2>

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
                  <p className="text-sm text-gray-600">Click to upload product images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB each, up to 5 images)</p>
                </label>
              </div>
              {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <FaTrashAlt className="text-[8px]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/uduua/shop')}
                  className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0038D4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <FaPlus /> Add Product
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">
                Products will be reviewed by admin before appearing on the marketplace
              </p>
            </div>
          </form>
        </div>
      </div>
      <UduuaFooter />
    </>
  );
};

export default UduuaAddProduct;