// screens/AdminAddProduct.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FaStore,
  FaFlag,
  FaChartLine,
  FaStar
} from 'react-icons/fa';
import { useCreateProductMutation, useGetCategoriesQuery } from '../slices/productApiSlice';
import { toast } from 'react-toastify';
import AdminSidebar from '../adminComponents/AdminSidebar';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { data: categoriesData } = useGetCategoriesQuery();
  const categories = categoriesData || [];

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
  });

  // Bulk pricing state
  const [bulkTiers, setBulkTiers] = useState([]);
  const [newTier, setNewTier] = useState({ minQuantity: '', price: '' });
  const [showBulkPricing, setShowBulkPricing] = useState(false);
  
  // Images state
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result]);
          setImages(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error(`${file.name} is not an image file`);
      }
    });
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    
    if (images.length === 0) {
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
    
    if (bulkTiers.length > 0) {
      submitData.append('bulkPricing', JSON.stringify(bulkTiers));
    }
    
    images.forEach(image => {
      submitData.append('images', image);
    });
    
    try {
      setUploading(true);
      await createProduct(submitData).unwrap();
      toast.success('Product created successfully!');
      navigate('/admin/products');
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to create product');
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

  const formatPrice = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-NG').format(value);
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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Create a new product for your marketplace</p>
        </div>

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

              {/* Bulk Pricing - Collapsible on Mobile */}
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
                  <label className="block w-full cursor-pointer">
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0043FC] transition-colors">
                      <FaImage className="text-3xl text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Click to upload images</p>
                      <p className="text-xs text-gray-400 mt-1">Max 5 images, JPG, PNG</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
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
                  )}
                  
                  <p className="text-xs text-gray-400 mt-3 text-center">
                    First image will be the main product image
                  </p>
                </div>
              </div>

              {/* Quick Tips - Desktop */}
              <div className="hidden lg:block bg-gray-50 rounded-xl border border-gray-200 p-5">
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
                    <span>Add high-quality images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FaPercentage className="text-[#0043FC] text-xs mt-0.5" />
                    <span>Bulk pricing encourages larger orders</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button - Sticky on Mobile */}
          <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-6 bg-white border-t border-gray-200 md:border-0 p-4 md:p-0 shadow-lg md:shadow-none z-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || uploading}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-[#0043FC] text-white rounded-lg font-medium hover:bg-[#0033cc] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaSave className="text-sm" />
                  {uploading ? 'Creating...' : 'Create Product'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Spacer for Mobile */}
          <div className="h-20 md:h-0"></div>
        </form>
      </div>
    </AdminSidebar>
  );
};

export default AdminAddProduct;