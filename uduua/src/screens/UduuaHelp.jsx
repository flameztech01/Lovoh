// screens/UduuaHelp.jsx - Cleaned routes (no /uduua prefix)
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
  FaChevronDown,
  FaChevronUp,
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
  FaMinus
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

  // FAQ Data
  const faqs = [
    // Orders & Delivery
    {
      id: 1,
      category: 'orders',
      question: 'How do I place an order on Úduua?',
      answer: 'To place an order, browse products on our marketplace, select the items you want, choose the quantity (retail or bulk), and click "Add to Cart". Once you\'re ready, go to your cart and proceed to checkout. Fill in your shipping details, select a payment method, and confirm your order.',
      relatedLinks: ['/shop', '/cart']
    },
    {
      id: 2,
      category: 'orders',
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3-5 business days within Lagos and 5-7 business days for other states in Nigeria. Express delivery (where available) takes 1-2 business days. Delivery times may vary during peak seasons or due to unforeseen circumstances.',
      relatedLinks: []
    },
    {
      id: 3,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'Once your order is confirmed and shipped, you\'ll receive a tracking number via email and SMS. You can track your order status in the "My Orders" section of your account dashboard. If you haven\'t received tracking information, please contact our support team.',
      relatedLinks: ['/account/orders']
    },
    {
      id: 4,
      category: 'orders',
      question: 'What is the minimum order amount?',
      answer: 'The minimum order amount varies by product but typically starts from ₦60,000. Each product page displays its minimum order requirement. Bulk purchases (2+ units) qualify for discounted bulk pricing.',
      relatedLinks: ['/shop']
    },
    
    // Payments
    {
      id: 5,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept bank transfers, card payments (Visa, Mastercard, Verve), and USSD payments. For on-site pickup orders, you can pay on delivery. All payments are processed securely through our payment partners.',
      relatedLinks: []
    },
    {
      id: 6,
      category: 'payments',
      question: 'Is my payment information secure?',
      answer: 'Yes, absolutely. We use industry-standard SSL encryption to protect your payment information. We do not store your card details on our servers. All payments are processed through secure, PCI-compliant payment gateways.',
      relatedLinks: []
    },
    {
      id: 7,
      category: 'payments',
      question: 'Can I pay on delivery?',
      answer: 'Pay on delivery is available for orders within Lagos and select cities. This option will appear at checkout if available for your location. Please note that a confirmation fee may apply for pay-on-delivery orders.',
      relatedLinks: []
    },
    {
      id: 8,
      category: 'payments',
      question: 'How do I get a receipt for my order?',
      answer: 'A receipt is automatically generated and sent to your email after successful payment. You can also download your receipts from the "My Orders" section in your account dashboard.',
      relatedLinks: ['/account/orders']
    },

    // Returns & Refunds
    {
      id: 9,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We accept returns within 7 days of delivery for items that are defective, damaged, or incorrect. The item must be unused, in original packaging, and with all tags attached. Some items like perishables and custom orders are non-returnable.',
      relatedLinks: []
    },
    {
      id: 10,
      category: 'returns',
      question: 'How do I return an item?',
      answer: 'To initiate a return, go to "My Orders", select the order containing the item, and click "Request Return". Provide the reason for return and upload photos if applicable. Our team will review your request within 24-48 hours and provide return instructions.',
      relatedLinks: ['/account/orders']
    },
    {
      id: 11,
      category: 'returns',
      question: 'How long does a refund take?',
      answer: 'Once your return is received and inspected, refunds are processed within 3-5 business days. The time it takes for the refund to reflect in your account depends on your payment method and bank.',
      relatedLinks: []
    },
    {
      id: 12,
      category: 'returns',
      question: 'Who pays for return shipping?',
      answer: 'If the return is due to our error (wrong item, defective product), we cover the return shipping cost. For other returns (changed mind, wrong size), the customer is responsible for return shipping.',
      relatedLinks: []
    },

    // Account
    {
      id: 13,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click "Sign Up" in the top navigation. You can register using your email address or continue with Google. Fill in your name, phone number, and create a password. Verify your email address to activate your account.',
      relatedLinks: ['/shop/signup']
    },
    {
      id: 14,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Login" then "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link. Click the link in the email to create a new password. The link expires after 24 hours.',
      relatedLinks: ['/shop/login']
    },
    {
      id: 15,
      category: 'account',
      question: 'How do I update my account information?',
      answer: 'Log in to your account, click on your profile picture or name, and select "Account Settings". From there, you can update your name, phone number, shipping addresses, and notification preferences.',
      relatedLinks: ['/account/settings']
    },

    // Products & Pricing
    {
      id: 16,
      category: 'products',
      question: 'What is the difference between retail and bulk pricing?',
      answer: 'Retail price is for single unit purchases. Bulk price applies when you buy 2 or more units of the same product, offering a discount. Some products also have tiered bulk pricing for larger quantities (e.g., 5+ units, 10+ units).',
      relatedLinks: ['/shop']
    },
    {
      id: 17,
      category: 'products',
      question: 'Are all products authentic?',
      answer: 'Yes, we work directly with verified brands and authorized distributors to ensure all products on Úduua are 100% authentic. Each seller undergoes a verification process before being allowed to list products.',
      relatedLinks: []
    },
    {
      id: 18,
      category: 'products',
      question: 'How do I know if a product is in stock?',
      answer: 'Each product page shows real-time stock status. "In Stock" means available for immediate shipping. "Low Stock" means limited quantity available. "Out of Stock" products cannot be ordered but you can sign up for restock notifications.',
      relatedLinks: ['/shop']
    },
    {
      id: 19,
      category: 'products',
      question: 'Can I sell my products on Úduua?',
      answer: 'Yes! We welcome brands and sellers to join our marketplace. Visit the "Grow your Brand" section or contact our seller support team. We offer market access, visibility, and support for fast-growing brands.',
      relatedLinks: ['/services', '/seller/register']
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
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#0043FC]/10 border border-[#0043FC]/20 px-4 py-2 rounded-full mb-4">
              <FaHeadset className="text-[#0043FC] text-sm" />
              <span className="text-xs font-semibold text-[#0043FC]">Help Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              How can we help you?
            </h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Find answers to common questions about shopping, payments, delivery, and more on Úduua Marketplace.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0043FC] focus:ring-2 focus:ring-[#0043FC]/20 shadow-sm"
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

          {/* Category Tabs */}
          <div className="flex overflow-x-auto pb-2 mb-8 gap-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#0043FC] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0043FC] hover:text-[#0043FC]'
                  }`}
                >
                  <Icon className="text-xs" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* FAQ List */}
          <div className="space-y-6">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <FaQuestionCircle className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">
                  We couldn't find any articles matching "{searchTerm}"
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="px-4 py-2 bg-[#0043FC] text-white rounded-lg text-sm font-medium hover:bg-[#0033cc]"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              Object.entries(groupedFaqs).map(([categoryId, categoryFaqs]) => (
                <div key={categoryId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="font-semibold text-gray-900">
                      {getCategoryName(categoryId)}
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {categoryFaqs.map((faq) => (
                      <div key={faq.id}>
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 text-sm sm:text-base pr-4">
                            {faq.question}
                          </span>
                          {expandedFaq === faq.id ? (
                            <FaMinus className="text-[#0043FC] text-xs flex-shrink-0" />
                          ) : (
                            <FaPlus className="text-gray-400 text-xs flex-shrink-0" />
                          )}
                        </button>
                        
                        {expandedFaq === faq.id && (
                          <div className="px-5 pb-5">
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                              {faq.answer}
                            </p>
                            {faq.relatedLinks.length > 0 && (
                              <div className="flex flex-wrap gap-3">
                                {faq.relatedLinks.map((link, idx) => (
                                  <Link
                                    key={idx}
                                    to={link}
                                    className="inline-flex items-center gap-1 text-xs text-[#0043FC] hover:text-[#0033cc] font-medium"
                                  >
                                    {link.includes('orders') && 'Go to My Orders'}
                                    {link.includes('shop') && 'Browse Products'}
                                    {link.includes('cart') && 'View Cart'}
                                    {link.includes('account') && 'Account Settings'}
                                    {link.includes('login') && 'Sign In'}
                                    {link.includes('signup') && 'Create Account'}
                                    {link.includes('seller') && 'Become a Seller'}
                                    {!link.includes('orders') && !link.includes('shop') && !link.includes('cart') && !link.includes('account') && !link.includes('login') && !link.includes('signup') && !link.includes('seller') && 'Learn More'}
                                    <FaArrowRight className="text-[10px]" />
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
              ))
            )}
          </div>

          {/* Still Need Help Section */}
          <div className="mt-12 bg-gradient-to-r from-[#0043FC] to-[#0038D4] rounded-2xl p-8 text-white">
            <div className="text-center max-w-2xl mx-auto">
              <FaHeadset className="text-4xl mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-3">Still need help?</h2>
              <p className="text-white/80 mb-6">
                Can't find what you're looking for? Our support team is here to help you with any questions or issues.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#0043FC] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  <FaEnvelope className="text-sm" />
                  Contact Support
                </button>
                
                <a
                  href="https://wa.me/2347059585905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#20bd5a] transition-colors"
                >
                  <FaWhatsapp className="text-lg" />
                  Chat on WhatsApp
                </a>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <FaPhone className="text-xs" />
                  <span>+234 705 958 5905</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-xs" />
                  <span>support@lovohcreate.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-xs" />
                  <span>Mon - Fri, 9AM - 6PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/shop"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-md transition-all group"
            >
              <FaShoppingBag className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Shop Products</span>
            </Link>
            <Link
              to="/cart"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-md transition-all group"
            >
              <FaBox className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">View Cart</span>
            </Link>
            <Link
              to="/account/orders"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-md transition-all group"
            >
              <FaTruck className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Track Order</span>
            </Link>
            <Link
              to="/account/settings"
              className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#0043FC] hover:shadow-md transition-all group"
            >
              <FaUser className="text-2xl text-[#0043FC] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">My Account</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Contact Support</h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                Choose how you'd like to reach us. We typically respond within 2 hours during business hours.
              </p>
              
              <div className="space-y-4">
                <a
                  href="https://wa.me/2347059585905"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <FaWhatsapp className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">WhatsApp Chat</p>
                    <p className="text-sm text-gray-500">Fastest response, usually within minutes</p>
                  </div>
                  <FaArrowRight className="text-green-600" />
                </a>
                
                <a
                  href="tel:+2347059585905"
                  className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <FaPhone className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-500">+234 705 958 5905</p>
                  </div>
                  <FaArrowRight className="text-blue-600" />
                </a>
                
                <Link
                  to="/contact"
                  onClick={() => setShowContactModal(false)}
                  className="flex items-center gap-4 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Email Form</p>
                    <p className="text-sm text-gray-500">Send us a detailed message</p>
                  </div>
                  <FaArrowRight className="text-purple-600" />
                </Link>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaClock className="text-[#0043FC]" />
                  <span>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM WAT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UduuaHelp;