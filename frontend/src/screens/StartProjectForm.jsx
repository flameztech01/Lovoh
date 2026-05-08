// screens/StartProjectForm.jsx
import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import ServiceFormPackages from '../components/ServiceFormPackages.jsx';
import { toast } from 'react-toastify';
import { useSubmitFormMutation } from '../slices/formApiSlice';
import { 
  FaArrowRight,
  FaRegClock,
  FaRegMoneyBillAlt,
  FaCheckCircle,
  FaCalendarAlt,
  FaTimes,
  FaBuilding,
  FaSearch,
  FaUsers,
  FaChartBar,
  FaSmile,
  FaShareAlt,
  FaBullhorn,
  FaBullseye,
  FaPenNib,
  FaGlobe,
  FaHeart,
  FaDatabase,
  FaUserFriends,
  FaRegLightbulb,
  FaStar,
  FaRobot,
  FaLaptopCode,
  FaArrowLeft
} from 'react-icons/fa';

const StartProjectForm = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedCustomServices, setSelectedCustomServices] = useState([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectTimeline: "",
    claritySessionDate: "",
    claritySessionTime: "",
  });
  const [submitted, setSubmitted] = useState(false);
  
  const [submitForm, { isLoading: isSubmitting }] = useSubmitFormMutation();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, []);

  // Also scroll to top when selectedPackage changes (when going back to packages)
  useEffect(() => {
    if (selectedPackage === null) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [selectedPackage]);

  // Project timeline options - exact from brief
  const projectTimelineOptions = [
    "Less than 1 month",
    "1 – 3 months",
    "3 – 6 months",
    "6 months and above",
    "Not sure yet"
  ];

  // Generate time slots from 9 AM to 5 PM with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push(`${displayHour}:00 ${ampm}`);
      if (hour < 17) {
        slots.push(`${displayHour}:30 ${ampm}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get tomorrow's date as minimum date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get date 30 days from now as max date
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  // Updated custom services for tab display
  const customServicesList = [
    { id: "Campaign & PR", icon: <FaBullhorn />, iconBg: "from-yellow-500 to-amber-500" },
    { id: "Web & App Development", icon: <FaLaptopCode />, iconBg: "from-blue-500 to-blue-700" },
    { id: "Digitals & AI", icon: <FaRobot />, iconBg: "from-purple-500 to-pink-500" },
    { id: "Socials & Content", icon: <FaShareAlt />, iconBg: "from-rose-500 to-orange-500" },
    { id: "Strategy & Consulting", icon: <FaChartBar />, iconBg: "from-emerald-500 to-teal-500" }
  ];

  // Package 1 Questions - The Foundation
  const foundationQuestions = [
    { 
      id: "currentIdentity", 
      question: "Do you currently have a brand identity?", 
      type: "select", 
      options: ["Yes", "No", "Partially"], 
      icon: <FaBuilding /> 
    },
    { 
      id: "brandPerception", 
      question: "How would you describe your brand's current perception in the market?", 
      type: "textarea", 
      placeholder: "Describe how customers and competitors view your brand today...", 
      icon: <FaSearch /> 
    },
    { 
      id: "idealCustomer", 
      question: "Who is your ideal customer? Describe them as specifically as you can.", 
      type: "textarea", 
      placeholder: "Age, location, interests, pain points, buying behavior...", 
      icon: <FaUsers /> 
    },
    { 
      id: "competitors", 
      question: "Which competitors do you admire or feel threatened by, and why?", 
      type: "textarea", 
      placeholder: "List competitors and what they do well or poorly...", 
      icon: <FaChartBar /> 
    },
    { 
      id: "brandFeeling", 
      question: "What feeling should people have when they encounter your brand?", 
      type: "textarea", 
      placeholder: "e.g., Inspired, Trusted, Excited, Empowered...", 
      icon: <FaSmile /> 
    },
    { 
      id: "budget", 
      question: "What is your estimated budget range?", 
      type: "text", 
      placeholder: "Enter your budget range or 'Not sure yet'", 
      icon: <FaRegMoneyBillAlt /> 
    }
  ];

  // Package 2 Questions - The Growth Engine
  const growthQuestions = [
    { 
      id: "platforms", 
      question: "What platforms are you currently active on, and how is that going?", 
      type: "textarea", 
      placeholder: "List platforms and describe your current performance...", 
      icon: <FaShareAlt /> 
    },
    { 
      id: "paidAds", 
      question: "Have you run paid ads before? If yes, what worked and what didn't?", 
      type: "textarea", 
      placeholder: "Share your experience with paid advertising...", 
      icon: <FaBullhorn /> 
    },
    { 
      id: "successDefinition", 
      question: "What does a successful campaign look like to you — more leads, sales, or awareness?", 
      type: "select", 
      options: ["More leads", "More sales", "Brand awareness"], 
      icon: <FaBullseye /> 
    },
    { 
      id: "targetAudience", 
      question: "Who are you trying to reach? Describe your target audience.", 
      type: "textarea", 
      placeholder: "Describe your ideal customer demographics and psychographics...", 
      icon: <FaUsers /> 
    },
    { 
      id: "monthlyBudget", 
      question: "What is your monthly marketing budget?", 
      type: "text", 
      placeholder: "Enter your monthly budget range", 
      icon: <FaRegMoneyBillAlt /> 
    },
    { 
      id: "content", 
      question: "Do you have existing content, or will you need Lovoh to create from scratch?", 
      type: "select", 
      options: ["We have existing content", "Need Lovoh to create from scratch"], 
      icon: <FaPenNib /> 
    }
  ];

  // Package 3 Questions - Full Stack
  const fullStackQuestions = [
    ...foundationQuestions,
    ...growthQuestions,
    { 
      id: "existingSite", 
      question: "Do you have an existing website or app, or are you building from scratch?", 
      type: "select", 
      options: ["Existing website/app", "Building from scratch"], 
      icon: <FaGlobe /> 
    },
    { 
      id: "sitePurpose", 
      question: "What is the primary purpose of this website/app? (e.g. sell products, generate leads, showcase work)", 
      type: "textarea", 
      placeholder: "Describe the main goals for your website or app...", 
      icon: <FaBullseye /> 
    },
    { 
      id: "designPreferences", 
      question: "Do you have design preferences or reference sites you like?", 
      type: "textarea", 
      placeholder: "Share links or describe styles you admire...", 
      icon: <FaHeart /> 
    },
    { 
      id: "features", 
      question: "What features or functionality do you need? (e.g. booking system, payment integration, user login)", 
      type: "textarea", 
      placeholder: "List required features and functionality...", 
      icon: <FaDatabase /> 
    },
    { 
      id: "siteManagement", 
      question: "Who will manage the site after it's built — your team or Lovoh?", 
      type: "select", 
      options: ["Our team will manage", "Lovoh will manage"], 
      icon: <FaUserFriends /> 
    },
    { 
      id: "prGoals", 
      question: "What campaign or PR goals do you have, if any?", 
      type: "textarea", 
      placeholder: "Describe any PR or campaign objectives...", 
      icon: <FaBullhorn /> 
    }
  ];

  // Custom path question sets – updated with new names and removed Brand Development
  const customQuestionSets = {
    "Campaign & PR": [
      { id: "campaignPurpose", question: "What is this campaign for?", type: "select", options: ["Product launch", "Brand awareness", "Event", "Rebranding", "Other"] },
      { id: "targetAudience", question: "Who is the target audience for this campaign?", type: "textarea", placeholder: "Describe your campaign's target audience..." },
      { id: "campaignChannels", question: "What channels do you want the campaign to run on?", type: "textarea", placeholder: "List desired channels (social, PR, events, etc.)..." },
      { id: "creativeAssets", question: "Do you have creative assets already, or will Lovoh handle production?", type: "select", options: ["We have creative assets", "Lovoh handles production"] },
      { id: "previousPR", question: "Have you done a PR campaign before? What was the result?", type: "textarea", placeholder: "Share your PR experience..." },
      { id: "campaignBudget", question: "What is your campaign budget and desired launch date?", type: "textarea", placeholder: "Enter budget range and target launch date..." }
    ],
    "Web & App Development": [
      { id: "existingSite", question: "Do you have an existing website or app, or are you building from scratch?", type: "select", options: ["Existing website/app", "Building from scratch"] },
      { id: "sitePurpose", question: "What is the primary purpose of this website/app? (e.g. sell products, generate leads, showcase work)", type: "textarea", placeholder: "Describe the main goals..." },
      { id: "designPreferences", question: "Do you have design preferences or reference sites you like?", type: "textarea", placeholder: "Share links or describe styles you admire..." },
      { id: "features", question: "What features or functionality do you need? (e.g. booking system, payment integration, user login)", type: "textarea", placeholder: "List required features..." },
      { id: "siteManagement", question: "Who will manage the site after it's built — your team or Lovoh?", type: "select", options: ["Our team will manage", "Lovoh will manage"] },
      { id: "budget", question: "What is your estimated budget range?", type: "text", placeholder: "Enter your budget range" }
    ],
    "Digitals & AI": [
      { id: "platforms", question: "What platforms are you currently active on, and how is that going?", type: "textarea", placeholder: "List platforms and describe your current performance..." },
      { id: "paidAds", question: "Have you run paid ads before? If yes, what worked and what didn't?", type: "textarea", placeholder: "Share your experience with paid advertising..." },
      { id: "successDefinition", question: "What does a successful campaign look like to you — more leads, sales, or awareness?", type: "select", options: ["More leads", "More sales", "Brand awareness"] },
      { id: "targetAudience", question: "Who are you trying to reach? Describe your target audience.", type: "textarea", placeholder: "Describe your ideal customer demographics and psychographics..." },
      { id: "monthlyBudget", question: "What is your monthly marketing budget?", type: "text", placeholder: "Enter your monthly budget range" },
      { id: "content", question: "Do you have existing content, or will you need Lovoh to create from scratch?", type: "select", options: ["We have existing content", "Need Lovoh to create from scratch"] }
    ],
    "Socials & Content": [
      { id: "platformFocus", question: "Which platforms do you want to focus on?", type: "textarea", placeholder: "List the social platforms you want to prioritize..." },
      { id: "postingFrequency", question: "What is your current posting frequency, and how is engagement?", type: "textarea", placeholder: "Describe your current social media activity..." },
      { id: "brandVoice", question: "Do you have a brand voice and visual identity already, or does that need to be developed?", type: "select", options: ["We have established brand voice/visuals", "Needs to be developed"] },
      { id: "contentProvision", question: "Will you be providing raw content (photos, videos), or does Lovoh handle full production?", type: "select", options: ["We'll provide raw content", "Lovoh handles full production"] },
      { id: "monthlyBudget", question: "What is your monthly budget for this service?", type: "text", placeholder: "Enter your monthly budget" }
    ],
    "Strategy & Consulting": [
      { id: "businessGoals", question: "What are your primary business goals?", type: "textarea", placeholder: "Describe your key business objectives..." },
      { id: "challenges", question: "What challenges are preventing you from achieving these goals?", type: "textarea", placeholder: "Describe obstacles and pain points..." },
      { id: "businessStage", question: "What stage is your business at?", type: "select", options: ["Idea", "Early Stage", "Growing", "Scaling", "Established"] },
      { id: "previousConsultant", question: "Have you worked with a strategy consultant or agency before? If yes, what was the outcome?", type: "textarea", placeholder: "Share your previous experience..." },
      { id: "successDefinition", question: "What does success look like at the end of this engagement?", type: "textarea", placeholder: "Define what a successful outcome would be..." },
      { id: "budget", question: "What is your estimated budget range?", type: "text", placeholder: "Enter your budget range" }
    ]
  };

  const handlePackageSelect = (packageId) => {
    setSelectedPackage(packageId);
    setSelectedCustomServices([]);
  };

  const handleCustomWithServices = (services) => {
    setSelectedCustomServices(services);
    setSelectedPackage('custom');
    setActiveServiceIndex(0);
  };

  const handleBackToPackages = () => {
    setSelectedPackage(null);
    setSelectedCustomServices([]);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePackageFormChange = (questionId, value) => {
    setFormData(prev => ({ ...prev, [`pkg_${questionId}`]: value }));
  };

  const handleCustomFormChange = (serviceId, questionId, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [`custom_${serviceId}_${questionId}`]: value 
    }));
  };

  const getCurrentQuestions = () => {
    if (selectedPackage === "foundation") return foundationQuestions;
    if (selectedPackage === "growth") return growthQuestions;
    if (selectedPackage === "fullstack") return fullStackQuestions;
    return [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email address");
      return;
    }

    if (!formData.projectTimeline) {
      toast.error("Please select your project timeline");
      return;
    }

    if (!formData.claritySessionDate || !formData.claritySessionTime) {
      toast.error("Please select your availability for the Clarity Session");
      return;
    }
    
    try {
      let submissionData = {
        formType: 'startproject',
        formName: 'Start Project Form',
        submittedFrom: 'Start Project Page',
        pageUrl: window.location.pathname,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company
        },
        formData: {
          projectTimeline: formData.projectTimeline,
          claritySessionAvailability: {
            date: formData.claritySessionDate,
            time: formData.claritySessionTime
          },
          selectedPackage: selectedPackage,
          isCustomPath: selectedPackage === 'custom',
          packageResponses: {},
          customServicesSelected: selectedCustomServices,
          customServicesResponses: {}
        }
      };

      if (selectedPackage && selectedPackage !== 'custom') {
        const questions = getCurrentQuestions();
        questions.forEach(q => {
          const value = formData[`pkg_${q.id}`];
          if (value) submissionData.formData.packageResponses[q.id] = value;
        });
      }

      if (selectedPackage === 'custom') {
        selectedCustomServices.forEach(serviceId => {
          const questions = customQuestionSets[serviceId];
          submissionData.formData.customServicesResponses[serviceId] = {};
          questions.forEach(q => {
            const value = formData[`custom_${serviceId}_${q.id}`];
            if (value) submissionData.formData.customServicesResponses[serviceId][q.id] = value;
          });
        });
      }

      await submitForm(submissionData).unwrap();

      toast.success("Project request sent! We'll confirm your Clarity Session shortly.");
      setSubmitted(true);
      
      setTimeout(() => {
        setSelectedPackage(null);
        setSelectedCustomServices([]);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          projectTimeline: "",
          claritySessionDate: "",
          claritySessionTime: "",
        });
        setSubmitted(false);
      }, 500);
      
    } catch (error) {
      toast.error(error?.data?.message || "Submission failed. Please try again.");
    }
  };

  // Contact Information Component (reusable for both package and custom forms)
  const ContactInformationFields = () => (
    <>
      <input
        type="text"
        placeholder="Full Name *"
        value={formData.name}
        onChange={(e) => handleFormChange('name', e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
        required
      />
      <input
        type="email"
        placeholder="Email Address *"
        value={formData.email}
        onChange={(e) => handleFormChange('email', e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
        required
      />
      <input
        type="text"
        placeholder="Company Name"
        value={formData.company}
        onChange={(e) => handleFormChange('company', e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => handleFormChange('phone', e.target.value)}
        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
      />
    </>
  );

  // Clarity Session Availability Fields
  const ClaritySessionFields = () => (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-800 block">
        When can you be available for the Clarity Session?
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Select Date</label>
          <input
            type="date"
            value={formData.claritySessionDate}
            onChange={(e) => handleFormChange('claritySessionDate', e.target.value)}
            min={getTomorrowDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Select Time</label>
          <select
            value={formData.claritySessionTime}
            onChange={(e) => handleFormChange('claritySessionTime', e.target.value)}
            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
            required
          >
            <option value="">Select time</option>
            {timeSlots.map(slot => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Business hours: 9:00 AM - 5:00 PM, Monday - Friday
      </p>
    </div>
  );

  // Back Button Component
  const BackButton = () => (
    <button
      type="button"
      onClick={handleBackToPackages}
      className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
    >
      <FaArrowLeft className="w-3 h-3" />
      <span className="text-sm font-medium">Back to Packages</span>
    </button>
  );

  // Clarity Session CTA after submission
  if (submitted) {
    return (
      <>
        <Header />
        <main className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen pt-20 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-green-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <FaCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Thank You for Your Project Request!</h2>
              <p className="text-gray-600 mb-6">
                We've received your information and will confirm your Clarity Session for {formData.claritySessionDate} at {formData.claritySessionTime}.
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 mb-6 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  What's Next?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We'll send a calendar invitation to {formData.email} with your Clarity Session details. 
                  This is a structured 30-minute call where we listen to your goals and recommend the best path forward.
                </p>
                <p className="text-xs text-gray-500">
                  You can also book directly at:
                </p>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    window.open('https://calendly.com/lovoh/clarity-session', '_blank');
                  }}
                  className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm mt-2"
                >
                  calendly.com/lovoh/clarity-session
                  <FaArrowRight className="w-3 h-3" />
                </a>
              </div>
              
              <button
                onClick={() => setSubmitted(false)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ← Submit Another Project
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      
      <main className="bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 backdrop-blur-sm px-4 py-2 mb-4 shadow-sm">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-600 font-semibold text-xs uppercase tracking-wider">
                Start Your Project
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
              <span className="text-gray-900">Choose Your</span>{' '}
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">Path Forward</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Select a package that fits your needs, and we'll create a tailored solution that delivers results.
            </p>
          </div>

          {/* Package Selection - 4 Cards */}
          {!selectedPackage && (
            <ServiceFormPackages 
              onPackageSelect={handlePackageSelect}
              onCustomWithServices={handleCustomWithServices}
            />
          )}

          {/* Package Form */}
          {selectedPackage && selectedPackage !== 'custom' && (
            <div className="max-w-2xl mx-auto">
              {/* Back Button - Visible above form */}
              <div className="mb-4">
                <BackButton />
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedPackage === 'foundation' ? 'The Foundation' : 
                     selectedPackage === 'growth' ? 'The Growth Engine' : 'Full Stack'}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {selectedPackage === 'foundation' ? 'Brand Strategy, Messaging & Visual Identity' : 
                     selectedPackage === 'growth' ? 'Social Media Management, Paid Advertising & Campaign Direction' : 
                     'End-to-End Brand Building, Growth, and Execution'}
                  </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  {getCurrentQuestions().map((q) => (
                    <div key={q.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 flex-shrink-0 text-sm">
                          {q.icon}
                        </div>
                        <label className="text-sm font-semibold text-gray-800">
                          {q.question}
                        </label>
                      </div>
                      
                      <div className="ml-9">
                        {q.type === "text" && (
                          <input
                            type="text"
                            value={formData[`pkg_${q.id}`] || ''}
                            onChange={(e) => handlePackageFormChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            placeholder={q.placeholder}
                            required
                          />
                        )}
                        
                        {q.type === "textarea" && (
                          <textarea
                            rows="3"
                            value={formData[`pkg_${q.id}`] || ''}
                            onChange={(e) => handlePackageFormChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
                            placeholder={q.placeholder}
                            required
                          />
                        )}
                        
                        {q.type === "select" && (
                          <select
                            value={formData[`pkg_${q.id}`] || ''}
                            onChange={(e) => handlePackageFormChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
                            required
                          >
                            <option value="">Select an option</option>
                            {q.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Project Timeline Dropdown */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 flex-shrink-0 text-sm">
                        <FaCalendarAlt />
                      </div>
                      <label className="text-sm font-semibold text-gray-800">
                        Project Timeline
                      </label>
                    </div>
                    <div className="ml-9">
                      <select
                        value={formData.projectTimeline}
                        onChange={(e) => handleFormChange('projectTimeline', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
                        required
                      >
                        <option value="">Select project timeline</option>
                        {projectTimelineOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-base font-bold text-gray-800 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <ContactInformationFields />
                    </div>
                  </div>

                  {/* Clarity Session Availability */}
                  <div className="border-t border-gray-200 pt-4">
                    <ClaritySessionFields />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit & Schedule Clarity Session
                        <FaArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                    <FaCheckCircle className="w-3 h-3" />
                    We'll confirm your Clarity Session within 24 hours
                  </p>
                </form>
              </div>
            </div>
          )}

          {/* Custom Path Form */}
          {selectedPackage === 'custom' && selectedCustomServices.length > 0 && (
            <div className="max-w-2xl mx-auto">
              {/* Back Button - Visible above form */}
              <div className="mb-4">
                <BackButton />
              </div>
              
              {/* Service Tabs */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedCustomServices.map((serviceId, idx) => {
                  const service = customServicesList.find(s => s.id === serviceId);
                  return (
                    <button
                      key={serviceId}
                      onClick={() => setActiveServiceIndex(idx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-xs ${
                        activeServiceIndex === idx
                          ? `bg-gradient-to-r ${service.iconBg} text-white shadow-sm`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-sm">{service.icon}</span>
                      <span className="hidden sm:inline">{service.id}</span>
                      <span className="sm:hidden">{service.id.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
              
              <form onSubmit={handleSubmit}>
                {/* Active Service Form */}
                <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
                  <div className={`bg-gradient-to-r ${customServicesList.find(s => s.id === selectedCustomServices[activeServiceIndex])?.iconBg} p-3 -m-5 mb-4 rounded-t-xl text-white`}>
                    <h3 className="text-base font-bold">
                      {selectedCustomServices[activeServiceIndex]}
                    </h3>
                    <p className="text-white/70 text-xs">
                      Service {activeServiceIndex + 1} of {selectedCustomServices.length}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {customQuestionSets[selectedCustomServices[activeServiceIndex]].map((q) => (
                      <div key={q.id}>
                        <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                          {q.question}
                        </label>
                        
                        {q.type === "text" && (
                          <input
                            type="text"
                            value={formData[`custom_${selectedCustomServices[activeServiceIndex]}_${q.id}`] || ''}
                            onChange={(e) => handleCustomFormChange(selectedCustomServices[activeServiceIndex], q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            placeholder={q.placeholder}
                            required
                          />
                        )}
                        
                        {q.type === "textarea" && (
                          <textarea
                            rows="3"
                            value={formData[`custom_${selectedCustomServices[activeServiceIndex]}_${q.id}`] || ''}
                            onChange={(e) => handleCustomFormChange(selectedCustomServices[activeServiceIndex], q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none text-sm"
                            placeholder={q.placeholder}
                            required
                          />
                        )}
                        
                        {q.type === "select" && (
                          <select
                            value={formData[`custom_${selectedCustomServices[activeServiceIndex]}_${q.id}`] || ''}
                            onChange={(e) => handleCustomFormChange(selectedCustomServices[activeServiceIndex], q.id, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
                            required
                          >
                            <option value="">Select an option</option>
                            {q.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between gap-3 mb-4">
                  {activeServiceIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setActiveServiceIndex(activeServiceIndex - 1)}
                      className="px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition-all duration-300 text-sm"
                    >
                      ← Previous
                    </button>
                  )}
                  {activeServiceIndex < selectedCustomServices.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setActiveServiceIndex(activeServiceIndex + 1)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium hover:shadow-md transition-all duration-300 ml-auto text-sm"
                    >
                      Next →
                    </button>
                  )}
                </div>
                
                {/* Contact & Timeline - Show on last service */}
                {activeServiceIndex === selectedCustomServices.length - 1 && (
                  <>
                    <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
                      <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                        Project Timeline
                      </label>
                      <select
                        value={formData.projectTimeline}
                        onChange={(e) => handleFormChange('projectTimeline', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm text-gray-700"
                        required
                      >
                        <option value="">Select project timeline</option>
                        {projectTimelineOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
                      <h4 className="text-base font-bold text-gray-800 mb-3">Contact Information</h4>
                      <div className="space-y-2">
                        <ContactInformationFields />
                      </div>
                    </div>

                    {/* Clarity Session Availability */}
                    <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
                      <ClaritySessionFields />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 hover:shadow-lg text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit & Schedule Clarity Session
                          <FaArrowRight className="w-3 h-3" />
                        </>
                      )}
                    </button>
                    
                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1 mt-3">
                      <FaCheckCircle className="w-3 h-3" />
                      We'll confirm your Clarity Session within 24 hours
                    </p>
                  </>
                )}
              </form>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default StartProjectForm;