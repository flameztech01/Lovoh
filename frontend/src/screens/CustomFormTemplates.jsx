// screens/CustomFormTemplates.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaArrowLeft, FaPlus, FaEye, FaCopy, FaSpinner,
  FaClipboardList, FaStar, FaChartBar, FaUsers,
  FaFileAlt, FaVoteYea, FaCalendarCheck, FaAddressBook,
  FaShoppingCart, FaHeart, FaPlane,
} from 'react-icons/fa';
import { useDuplicateCustomFormMutation } from '../slices/customFormApiSlice';
import CustomFormSidebar from '../components/CustomFormSidebar';
import { toast } from 'react-toastify';

const TEMPLATES = [
  {
    id: 'contact',
    title: 'Contact Form',
    description: 'Simple contact form with name, email, and message',
    icon: FaAddressBook,
    color: 'bg-blue-500',
    type: 'form',
    fields: [
      { type: 'heading', label: 'Get in Touch', id: 'heading_1' },
      { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your name', id: 'name' },
      { type: 'email', label: 'Email Address', required: true, placeholder: 'you@example.com', id: 'email' },
      { type: 'phone', label: 'Phone Number', placeholder: '+234...', id: 'phone' },
      { type: 'select', label: 'Subject', options: [
        { label: 'General Inquiry', value: 'general' },
        { label: 'Support', value: 'support' },
        { label: 'Partnership', value: 'partnership' },
      ], id: 'subject' },
      { type: 'textarea', label: 'Message', required: true, placeholder: 'Write your message...', id: 'message' },
    ],
  },
  {
    id: 'feedback',
    title: 'Customer Feedback',
    description: 'Collect feedback with star ratings and comments',
    icon: FaStar,
    color: 'bg-yellow-500',
    type: 'form',
    fields: [
      { type: 'heading', label: 'We Value Your Feedback', id: 'heading_1' },
      { type: 'text', label: 'Your Name', id: 'name' },
      { type: 'email', label: 'Email', id: 'email' },
      { type: 'rating', label: 'Overall Experience', min: 1, max: 5, required: true, id: 'rating' },
      { type: 'rating', label: 'Customer Service', min: 1, max: 5, id: 'service' },
      { type: 'textarea', label: 'Additional Comments', placeholder: 'Tell us more...', id: 'comments' },
    ],
  },
  {
    id: 'registration',
    title: 'Event Registration',
    description: 'Register attendees for your events',
    icon: FaCalendarCheck,
    color: 'bg-green-500',
    type: 'registration',
    fields: [
      { type: 'heading', label: 'Event Registration', id: 'heading_1' },
      { type: 'text', label: 'Full Name', required: true, id: 'name' },
      { type: 'email', label: 'Email Address', required: true, id: 'email' },
      { type: 'phone', label: 'Phone Number', id: 'phone' },
      { type: 'select', label: 'Ticket Type', options: [
        { label: 'General Admission', value: 'general' },
        { label: 'VIP', value: 'vip' },
        { label: 'Early Bird', value: 'early' },
      ], required: true, id: 'ticket' },
      { type: 'number', label: 'Number of Tickets', min: 1, max: 10, id: 'quantity' },
      { type: 'textarea', label: 'Special Requirements', id: 'requirements' },
    ],
  },
  {
    id: 'survey',
    title: 'Customer Survey',
    description: 'Detailed survey with multiple choice questions',
    icon: FaVoteYea,
    color: 'bg-purple-500',
    type: 'survey',
    fields: [
      { type: 'heading', label: 'Customer Satisfaction Survey', id: 'heading_1' },
      { type: 'radio', label: 'How did you hear about us?', options: [
        { label: 'Social Media', value: 'social' },
        { label: 'Friend Referral', value: 'referral' },
        { label: 'Search Engine', value: 'search' },
        { label: 'Advertisement', value: 'ad' },
      ], id: 'source' },
      { type: 'radio', label: 'How likely are you to recommend us?', options: [
        { label: 'Very Likely', value: 'very' },
        { label: 'Likely', value: 'likely' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Unlikely', value: 'unlikely' },
      ], id: 'recommend' },
      { type: 'checkbox', label: 'Which services do you use? (Select all)', options: [
        { label: 'Product A', value: 'a' },
        { label: 'Product B', value: 'b' },
        { label: 'Product C', value: 'c' },
        { label: 'Product D', value: 'd' },
      ], id: 'services' },
      { type: 'textarea', label: 'Any suggestions?', id: 'suggestions' },
    ],
  },
  {
    id: 'quiz',
    title: 'Knowledge Quiz',
    description: 'Test knowledge with multiple choice quiz',
    icon: FaClipboardList,
    color: 'bg-red-500',
    type: 'quiz',
    fields: [
      { type: 'heading', label: 'Knowledge Check', id: 'heading_1' },
      { type: 'text', label: 'Your Name', required: true, id: 'name' },
      { type: 'radio', label: 'Question 1: What is the capital of France?', options: [
        { label: 'London', value: 'london' },
        { label: 'Paris', value: 'paris', isCorrect: true },
        { label: 'Berlin', value: 'berlin' },
        { label: 'Madrid', value: 'madrid' },
      ], id: 'q1' },
      { type: 'radio', label: 'Question 2: Which planet is closest to the sun?', options: [
        { label: 'Venus', value: 'venus' },
        { label: 'Mercury', value: 'mercury', isCorrect: true },
        { label: 'Earth', value: 'earth' },
        { label: 'Mars', value: 'mars' },
      ], id: 'q2' },
      { type: 'radio', label: 'Question 3: What is 2 + 2?', options: [
        { label: '3', value: '3' },
        { label: '4', value: '4', isCorrect: true },
        { label: '5', value: '5' },
      ], id: 'q3' },
    ],
  },
  {
    id: 'order',
    title: 'Order Form',
    description: 'Take orders with product selection and quantity',
    icon: FaShoppingCart,
    color: 'bg-orange-500',
    type: 'form',
    fields: [
      { type: 'heading', label: 'Place Your Order', id: 'heading_1' },
      { type: 'text', label: 'Full Name', required: true, id: 'name' },
      { type: 'email', label: 'Email', required: true, id: 'email' },
      { type: 'phone', label: 'Phone', required: true, id: 'phone' },
      { type: 'textarea', label: 'Delivery Address', required: true, id: 'address' },
      { type: 'select', label: 'Product', options: [
        { label: 'Product A - ₦5,000', value: 'a' },
        { label: 'Product B - ₦8,000', value: 'b' },
        { label: 'Product C - ₦12,000', value: 'c' },
      ], required: true, id: 'product' },
      { type: 'number', label: 'Quantity', min: 1, max: 100, required: true, id: 'qty' },
    ],
  },
];

const CustomFormTemplates = () => {
  const navigate = useNavigate();
  const [duplicateForm] = useDuplicateCustomFormMutation();
  const [loadingId, setLoadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredTemplates = TEMPLATES.filter(t => {
    const matchSearch = !searchTerm || t.title.toLowerCase().includes(searchTerm.toLowerCase()) || t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !typeFilter || t.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleUseTemplate = (template) => {
    // Navigate to create page with template data in state
    navigate('/custom-form/create', { state: { template } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomFormSidebar />

      <div className="lg:ml-[280px] p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600">
              <FaArrowLeft className="text-sm" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Templates</h1>
              <p className="text-sm text-gray-500">Start with a pre-built template</p>
            </div>
          </div>
          <Link to="/custom-form/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1B3766] text-white rounded-xl text-sm font-medium hover:bg-[#142952]">
            <FaPlus /> Blank Form
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3766]"
              />
            </div>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white">
              <option value="">All Types</option>
              <option value="form">Form</option>
              <option value="quiz">Quiz</option>
              <option value="survey">Survey</option>
              <option value="registration">Registration</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No templates match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                {/* Preview */}
                <div className={`h-32 ${template.color} bg-opacity-10 flex items-center justify-center relative`}>
                  <template.icon className={`text-5xl text-white opacity-80`} />
                  <div className={`absolute inset-0 ${template.color} opacity-20`}></div>
                  <span className="absolute top-3 right-3 text-xs font-medium text-white bg-black/30 px-2 py-0.5 rounded-full capitalize">
                    {template.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                    <FaClipboardList className="text-[10px]" />
                    <span>{template.fields.length} fields</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 py-2 bg-[#1B3766] text-white rounded-lg text-sm font-medium hover:bg-[#142952] transition-colors flex items-center justify-center gap-1"
                    >
                      <FaPlus className="text-xs" /> Use Template
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                      title="Preview"
                    >
                      <FaEye className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomFormTemplates;