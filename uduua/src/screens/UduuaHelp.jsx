// screens/UduuaHelp.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaQuestionCircle,
  FaShoppingBag,
  FaTruck,
  FaCreditCard,
  FaExchangeAlt,
  FaUser,
  FaBox,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaSearch,
  FaArrowRight,
  FaHeadset,
  FaClock,
  FaCheckCircle,
  FaStore,
  FaTag,
  FaShieldAlt,
  FaTimes,
  FaPlus,
  FaMinus,
  FaStar,
  FaRocket,
  FaHeart,
  FaFileInvoice,
} from 'react-icons/fa';
import ShopNavbar from '../components/ShopNavbar';

const UduuaHelp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);

  // FAQ Categories
  const categories = [
    { id: 'all', name: 'All Topics', icon: FaQuestionCircle },
    { id: 'orders', name: 'Orders & Delivery', icon: FaTruck },
    { id: 'payments', name: 'Payments', icon: FaCreditCard },
    { id: 'returns', name: 'Returns & Refunds', icon: FaExchangeAlt },
    { id: 'account', name: 'Account', icon: FaUser },
    { id: 'products', name: 'Products & Pricing', icon: FaBox },
  ];

  // FAQ Data - Corrected with accurate information
  const faqs = [
    // Orders & Delivery
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order on Úduua?',
      answer: 'To place an order, browse products on our marketplace, select the items you want, choose the quantity (retail or bulk), and click "Add to Cart". Once you\'re ready, go to your cart and proceed to checkout. Fill in your shipping details, select a payment method (Paystack, Pay on Delivery, or On-site), and confirm your order.',
      relatedLinks: ['/shop']
    },
    {
      id: 2,
      category: 'orders',
      question: 'How does delivery work?',
      answer: 'Delivery times and methods vary by seller. Each seller handles their own delivery, so you\'ll see estimated delivery times on the product page. You\'ll receive a tracking number once your order is shipped. For any delivery issues, please contact the seller directly.',
      relatedLinks: ['/shop']
    },
    {
      id: 3,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order is confirmed and shipped, you\'ll receive a tracking number from the seller via email or SMS. You can also track your order status in the "My Orders" section of your account dashboard. Contact the seller directly if you haven\'t received tracking information.',
      relatedLinks: []
    },
    {
      id: 4,
      category: 'orders',
      question: 'What is bulk pricing?',
      answer: 'Bulk pricing offers discounted rates when you purchase multiple units of the same product. The discount applies automatically when you add 2 or more units to your cart. Some products also have tiered pricing for larger quantities (e.g., 5+ units, 10+ units).',
      relatedLinks: ['/shop']
    },
    
    // Payments
    {
      id: 5,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept Paystack (card and bank transfers), Pay on Delivery (available for select locations), and On-site Payment (for our physical pickup locations). All payments are processed securely through Paystack.',
      relatedLinks: []
    },
    {
      id: 6,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, absolutely. We use Paystack, a PCI-DSS compliant payment gateway, to process all transactions. Your card details are never stored on our servers and are handled securely by Paystack.',
      relatedLinks: []
    },
    {
      id: 7,
      category: 'payments',
      question: 'Can I pay on delivery?',
      answer: 'Yes, Pay on Delivery is available for select locations within Nigeria. The option will appear at checkout if available for your delivery address. Please note that a confirmation fee may apply for Pay on Delivery orders.',
      relatedLinks: []
    },
    {
      id: 8,
      category: 'payments',
      question: 'How do I get a receipt for my order?',
      answer: 'A receipt is automatically generated and sent to your email after successful payment. You can also download your receipts from the "My Orders" section in your account dashboard.',
      relatedLinks: []
    },

    // Returns & Refunds
    {
      id: 9,
      category: 'returns',
      question: 'What is the return policy?',
      answer: 'Returns are handled directly between buyers and sellers. If you receive a defective, damaged, or incorrect item, contact the seller within 7 days of delivery to arrange a return or replacement. For disputes, please contact our support team.',
      relatedLinks: []
    },
    {
      id: 10,
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To initiate a return, go to "My Orders", select the order containing the item, and click "Contact Seller". Provide the reason for return and upload photos if applicable. Work directly with the seller to arrange return shipping and refund/replacement.',
      relatedLinks: []
    },
    {
      id: 11,
      category: 'returns',
      question: 'How does the refund process work?',
      answer: 'Refunds are processed by the seller directly. Once the seller agrees to a refund, it will be processed through the original payment method. Refund timing depends on your bank, typically 3-5 business days.',
      relatedLinks: []
    },

    // Account
    {
      id: 12,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top navigation. You can register using your email address or continue with Google. Fill in your name, phone number, and create a password. Verify your email address to activate your account.',
      relatedLinks: ['/shop/signup']
    },
    {
      id: 13,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Login" then "Forgot Password". Enter your registered email address, and we\'ll send you a password reset code. Use the code to create a new password. The code expires after 10 minutes for security.',
      relatedLinks: ['/shop/login']
    },
    {
      id: 14,
      category: 'account',
      question: 'How do I update my account information?',
      answer: 'Log in to your account, click on your profile picture or name, and select "Account Settings". From there, you can update your name, phone number, and shipping addresses.',
      relatedLinks: []
    },

    // Products & Pricing
    {
      id: 15,
      category: 'products',
      question: 'Are all products authentic?',
      answer: 'Yes, we work directly with verified brands and authorized distributors. All sellers undergo a verification process before being allowed to list products. If you suspect a counterfeit product, please report it to our support team.',
      relatedLinks: []
    },
    {
      id: 16,
      category: 'products',
      question: 'How do I know if a product is in stock?',
      answer: 'Each product page shows real-time stock status. "In Stock" means available for immediate shipping. "Low Stock" means limited quantity available. "Out of Stock" products cannot be ordered.',
      relatedLinks: ['/shop']
    },
    {
      id: 17,
      category: 'products',
      question: 'How do I become a seller on Úduua?',
      answer: 'Visit our "Partnership" page and click "Apply as Seller". You\'ll need to provide business information, required documents (CAC, ID, Proof of Address, TIN), and bank account details. Once approved, you can start listing products and selling to thousands of customers.',
      relatedLinks: ['/services']
    },
  ];

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category for display
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  return (
    <>
      <ShopNavbar />
      
      {/* Hero Section with Images */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0043FC] via-[#0038D4] to-[#002a9e]"></div>
          {/* Floating Images */}
          <div className="absolute top-20 left-10 w-32 h-32 rounded-2xl overflow-hidden shadow-2xl rotate-12 animate-float">
            <img 
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format"
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-20 right-10 w-40 h-40 rounded-2xl overflow-hidden shadow-2xl -rotate-12 animate-float-delayed">
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&auto=format"
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-2xl overflow-hidden shadow-2xl rotate-45 animate-float-slow">
            <img 
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150&auto=format"
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-1/3 left-1/4 w-28 h-28 rounded-2xl overflow-hidden shadow-2xl -rotate-6 animate-float">
            <img 
              src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=150&auto=format"
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Floating Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#79FFFF]/20 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6 animate-fadeInUp">
            <FaHeadset className="text-white text-sm animate-pulse" />
            <span className="text-sm font-semibold text-white">24/7 Support Available</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 animate-fadeInUp">
            How Can We
            <span className="block text-[#79FFFF]"> Help You Today?</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            Find answers to your questions about shopping, payments, delivery, and more on Úduua Marketplace
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mt-8 animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <div className="relative group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0043FC] transition-colors" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0043FC] shadow-xl"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-12 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`group relative p-4 rounded-2xl text-center transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-[#0043FC] to-[#0038D4] text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Icon className={`text-2xl mx-auto mb-2 transition-all ${isActive ? 'text-white' : 'text-[#0043FC] group-hover:scale-110'}`} />
                  <span className="text-xs font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          {searchTerm && (
            <div className="mb-6 text-center">
              <p className="text-gray-500">
                Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </p>
            </div>
          )}

          {/* FAQ List */}
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaQuestionCircle className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-500 mb-6">
                We couldn't find any articles matching "{searchTerm}"
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-2.5 bg-[#0043FC] text-white rounded-xl text-sm font-medium hover:bg-[#0038D4] transition-all transform hover:scale-105"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedFaqs).map(([categoryId, categoryFaqs]) => (
                <div key={categoryId} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#0043FC] rounded-full"></span>
                      {getCategoryName(categoryId)}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categoryFaqs.map((faq) => (
                      <div key={faq.id} className="transition-all">
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                        >
                          <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">
                            {faq.question}
                          </span>
                          <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all group-hover:bg-[#0043FC]/10 ${expandedFaq === faq.id ? 'bg-[#0043FC]/10' : ''}`}>
                            {expandedFaq === faq.id ? (
                              <FaMinus className="text-[#0043FC] text-xs" />
                            ) : (
                              <FaPlus className="text-gray-400 text-xs group-hover:text-[#0043FC]" />
                            )}
                          </div>
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="px-6 pb-5">
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {faq.answer}
                            </p>
                            {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                              <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                                {faq.relatedLinks.map((link, idx) => (
                                  <Link
                                    key={idx}
                                    to={link}
                                    className="inline-flex items-center gap-2 text-sm text-[#0043FC] hover:text-[#0038D4] font-medium"
                                  >
                                    {link === '/shop' && 'Browse Products'}
                                    {link === '/shop/login' && 'Sign In'}
                                    {link === '/shop/signup' && 'Create Account'}
                                    {link === '/services' && 'Become a Seller'}
                                    {!link.includes('/shop') && !link.includes('/services') && 'Learn More'}
                                    <FaArrowRight className="text-xs" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Helpful Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-all group-hover:scale-110">
                <FaClock className="text-blue-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">24/7</p>
              <p className="text-sm text-gray-500">Support Available</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-all group-hover:scale-110">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">98%</p>
              <p className="text-sm text-gray-500">Satisfaction Rate</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-all group-hover:scale-110">
                <FaRocket className="text-purple-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">&lt;2hr</p>
              <p className="text-sm text-gray-500">Avg Response Time</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-all group-hover:scale-110">
                <FaHeart className="text-orange-600 text-xl" />
              </div>
              <p className="text-2xl font-bold text-gray-900">10k+</p>
              <p className="text-sm text-gray-500">Happy Customers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help Section - Enhanced */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0043FC] to-[#0038D4]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-2 rounded-full mb-6">
            <FaHeadset className="text-white text-sm" />
            <span className="text-sm font-semibold text-white">Still Need Help?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            We're Here For You
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is ready to assist you with any questions or issues.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0043FC] rounded-xl font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              <FaEnvelope className="text-sm" />
              Contact Support
            </button>
            
            <a
              href="https://wa.me/2348055766461"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-lg"
            >
              <FaWhatsapp className="text-lg" />
              Chat on WhatsApp
            </a>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <FaPhone className="text-xs" />
              <span>+234 705 958 5905</span>
            </div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-xs" />
              <span>support@uduua.com</span>
            </div>
            <div className="w-1 h-1 bg-white/30 rounded-full"></div>
            <div className="flex items-center gap-2">
              <FaClock className="text-xs" />
              <span>Mon - Fri, 9AM - 6PM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
            <p className="text-sm text-gray-500">Navigate to important pages</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/shop"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-lg transition-all group"
            >
              <FaShoppingBag className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Shop Products</span>
            </Link>
            <Link
              to="/shop/cart"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-lg transition-all group"
            >
              <FaBox className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">View Cart</span>
            </Link>
            <Link
              to="/services"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-lg transition-all group"
            >
              <FaStore className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Become a Seller</span>
            </Link>
            <Link
              to="/shop/login"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-lg transition-all group"
            >
              <FaUser className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">My Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0043FC]/10 rounded-full flex items-center justify-center">
                    <FaHeadset className="text-[#0043FC] text-lg" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Contact Support</h3>
                </div>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                Choose how you'd like to reach us. We typically respond within 2 hours during business hours.
              </p>
              
              <div className="space-y-4">
                <a
                  href="https://wa.me/2348055766461"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaWhatsapp className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">WhatsApp Chat</p>
                    <p className="text-sm text-gray-500">Fastest response, usually within minutes</p>
                  </div>
                  <FaArrowRight className="text-green-600 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a
                  href="tel:+2347059585905"
                  className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaPhone className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-500">+234 705 958 5905</p>
                  </div>
                  <FaArrowRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                </a>
                
                <a
                  href="mailto:support@uduua.com"
                  className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-500">support@uduua.com</p>
                  </div>
                  <FaArrowRight className="text-purple-600 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <FaClock className="text-[#0043FC]" />
                  <span>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM WAT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes floatDelayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-5deg); }
        }
        
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: floatDelayed 5s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: floatSlow 6s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </>
  );
};

export default UduuaHelp;