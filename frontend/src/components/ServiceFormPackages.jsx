// components/ServiceFormPackages.jsx
import React, { useState } from "react";
import PackageCard from "./PackageCard";
import {
  FaChartBar,
  FaRocket,
  FaLaptopCode,
  FaShareAlt,
  FaBullhorn,
  FaQuestionCircle,
  FaCheckCircle,
  FaArrowRight,
  FaTimes,
  FaRegClock,
  FaRobot,
  FaBuilding,
} from "react-icons/fa";

const ServiceFormPackages = ({ onPackageSelect, onCustomWithServices }) => {
  const [expandedPackage, setExpandedPackage] = useState(null);
  const [selectedCustomServices, setSelectedCustomServices] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const packages = [
    {
      id: "foundation",
      name: "The Foundation",
      tagline: "Brand Strategy, Messaging & Visual Identity",
      shortDescription:
        "Core brand assets and strategic clarity — a defined voice, visual system, and brand story.",
      fullDescription:
        "For businesses building their brand from the ground up, or established brands that have outgrown their current identity. The Foundation gives a business the core assets and strategic clarity it needs before anything else — a defined voice, a visual system, and a brand story that holds together across every touchpoint.",
      timeline: "3 – 4 weeks",
      deliverables: [
        "Brand strategy document",
        "Messaging and voice guide",
        "Logo suite (primary, secondary, icon)",
        "Brand style guide (colours, typography, usage rules)",
      ],
      bestFor:
        "New businesses, founders relaunching, or established brands that need a strategic identity reset.",
      icon: <FaBuilding className="w-5 h-5" />, // FaBuilding is from React Icons but not imported? Actually, we need to adjust; we'll keep the same original icon
      bgGradient: "from-blue-600 to-indigo-700",
    },
    {
      id: "growth",
      name: "The Growth Engine",
      tagline: "Social Media, Paid Ads & Campaign",
      shortDescription:
        "Retainer-based engagement focused on building audience and driving traffic.",
      fullDescription:
        "For brands with an established identity that are ready to invest consistently in their digital presence. The Growth Engine is a retainer-based engagement focused on building audience, driving traffic, and converting attention into business results — across organic content, paid campaigns, and campaign strategy.",
      timeline: "Minimum 3-month retainer",
      deliverables: [
        "Social media management",
        "Paid advertising setup & optimisation",
        "Monthly campaign direction & calendar",
        "Performance reporting & insights",
      ],
      bestFor:
        "SMEs and growing brands with an existing identity, ready to invest consistently.",
      icon: <FaChartBar className="w-5 h-5" />,
      bgGradient: "from-purple-600 to-pink-600",
    },
    {
      id: "fullstack",
      name: "Full Stack",
      tagline: "End-to-End Brand Building & Execution",
      shortDescription:
        "Everything in Packages 1 and 2, plus website design and PR — all under one roof.",
      fullDescription:
        "Everything in Packages 1 and 2, plus website design and PR. Full Stack is for scaling businesses, funded startups, and corporate brands that want a single partner to handle brand foundation, digital growth, web presence, and public relations — all under one roof, with one consistent creative direction.",
      timeline: "6–8 weeks setup + retainer",
      deliverables: [
        "Everything in The Foundation & The Growth Engine",
        "Strategy & Consulting",
        "Website/App development and management",
        "PR, media relations & more",
      ],
      bestFor:
        "Scaling businesses, funded startups, and corporate brands seeking full execution.",
      icon: <FaRocket className="w-5 h-5" />,
      bgGradient: "from-emerald-600 to-teal-700",
    },
  ];

  // Updated custom services list
  const customServicesList = [
    {
      id: "Campaign & PR",
      icon: <FaBullhorn />,
      iconBg: "from-yellow-500 to-amber-500",
      bulletPoints: [
        "PR Strategy",
        "Campaign Management",
        "Media Buying",
        "Influencer Coordination",
        "Event Branding & Marketing",
      ],
    },
    {
      id: "Web & App Development",
      icon: <FaLaptopCode />,
      iconBg: "from-blue-500 to-blue-700",
      bulletPoints: [
        "Product Design",
        "Web App/Website Development",
        "Mobile App Development",
        "E-commerce Solutions",
      ],
    },
    {
      id: "Digitals & AI",
      icon: <FaRobot />,
      iconBg: "from-purple-500 to-pink-500",
      bulletPoints: [
        "Content & Email Marketing",
        "Sponsored Ads",
        "SEO | GEO | AEO",
        "System & AI Integration",
      ],
    },
    {
      id: "Socials & Content",
      icon: <FaShareAlt />,
      iconBg: "from-rose-500 to-orange-500",
      bulletPoints: [
        "Social Media Management",
        "Content Strategy & Creation",
        "Design & Video Production",
        "Copywriting/Script & Blog Writing",
        "Analytics & Reporting",
      ],
    },
    {
      id: "Strategy & Consulting",
      icon: <FaChartBar />,
      iconBg: "from-emerald-500 to-teal-500",
      bulletPoints: [
        "Growth Planning",
        "Digital Transformation",
        "Team Training & Workshops",
        "Market Analysis",
        "Competitive Research",
      ],
    },
  ];

  const toggleExpand = (packageId) => {
    setExpandedPackage(expandedPackage === packageId ? null : packageId);
  };

  const toggleCustomService = (serviceId) => {
    if (selectedCustomServices.includes(serviceId)) {
      setSelectedCustomServices(
        selectedCustomServices.filter((id) => id !== serviceId),
      );
    } else {
      setSelectedCustomServices([...selectedCustomServices, serviceId]);
    }
  };

  const handleCustomContinue = () => {
    if (selectedCustomServices.length > 0) {
      setShowCustomModal(false);
      onCustomWithServices(selectedCustomServices);
    }
  };

  const handleOpenModal = (pkg) => {
    setShowModal(pkg);
  };

  const handleOpenCustomModal = () => {
    setShowCustomModal(true);
  };

  // Custom Package Card Component
  const CustomPackageCard = ({ isMobile = false }) => {
    return (
      <div
        className={`bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 overflow-hidden transition-all duration-300 ${
          isMobile
            ? "w-[280px] flex-shrink-0 h-full flex flex-col"
            : "h-full flex flex-col"
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-4 text-white">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-2">
            <FaQuestionCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold leading-tight">Custom</h3>
          <p className="text-white/80 text-xs mt-0.5">Tailored Delivery</p>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <p className="text-gray-600 text-xs mb-3 leading-relaxed">
            Select your preferred services and we'll tailor a package for you
          </p>

          {/* Service Selection */}
          <div className="mb-3">
            <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Select Services
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {customServicesList.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleCustomService(service.id)}
                  className={`p-2 rounded-lg border transition-all duration-200 text-left w-full ${
                    selectedCustomServices.includes(service.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-1.5">
                    <div
                      className={`w-5 h-5 rounded bg-gradient-to-r ${service.iconBg} flex items-center justify-center text-white text-[10px] flex-shrink-0 mt-0.5`}
                    >
                      {service.icon}
                    </div>
                    <span className="text-[10px] font-medium text-gray-700 leading-tight">
                      {service.id}
                    </span>
                    {selectedCustomServices.includes(service.id) && (
                      <FaCheckCircle className="w-2.5 h-2.5 text-blue-500 ml-auto flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected count */}
          {selectedCustomServices.length > 0 && (
            <div className="mb-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">
                {selectedCustomServices.length} service
                {selectedCustomServices.length > 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Spacer to push button to bottom */}
          <div className="flex-1"></div>

          {/* View Details button */}
          <button
            type="button"
            onClick={handleOpenCustomModal}
            className="w-full py-2.5 text-blue-600 text-sm font-semibold rounded-lg border border-blue-600 hover:bg-blue-50 transition-all duration-300 mb-2"
          >
            View Details
          </button>

          {/* Continue button */}
          <button
            type="button"
            onClick={handleCustomContinue}
            disabled={selectedCustomServices.length === 0}
            className={`w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedCustomServices.length > 0
                ? "bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-md"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {selectedCustomServices.length > 0 ? (
              <>
                Continue
                <FaArrowRight className="w-3 h-3" />
              </>
            ) : (
              "Select Services"
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile: Horizontal scrollable packages - NO ARROWS */}
      <div className="block sm:hidden">
        <div
          className="flex gap-3 overflow-x-auto scrollbar-hide px-2 pb-4 -mx-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex">
              <PackageCard
                pkg={pkg}
                isMobile={true}
                isExpanded={expandedPackage === pkg.id}
                onToggleExpand={() => toggleExpand(pkg.id)}
                onSelect={() => onPackageSelect(pkg.id)}
                onOpenModal={handleOpenModal}
              />
            </div>
          ))}
          {/* Custom Card */}
          <div className="flex">
            <CustomPackageCard isMobile={true} />
          </div>
        </div>
      </div>

      {/* Desktop: Grid layout - 4 cards */}
      <div className="hidden sm:grid sm:grid-cols-4 gap-5 mb-8">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            isMobile={false}
            isExpanded={expandedPackage === pkg.id}
            onToggleExpand={() => toggleExpand(pkg.id)}
            onSelect={() => onPackageSelect(pkg.id)}
            onOpenModal={handleOpenModal}
          />
        ))}
        {/* Custom Card */}
        <CustomPackageCard isMobile={false} />
      </div>

      {/* Modal for full package details */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`bg-gradient-to-r ${showModal.bgGradient} p-6 text-white`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {showModal.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{showModal.name}</h3>
                    <p className="text-white/80 text-sm mt-1">
                      {showModal.tagline}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {showModal.fullDescription}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Timeline
                </h4>
                <div className="flex items-center gap-2">
                  <FaRegClock className="text-blue-600 w-4 h-4" />
                  <p className="text-gray-700 font-medium">
                    {showModal.timeline}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Deliverables
                </h4>
                <ul className="space-y-2">
                  {showModal.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Best For
                </h4>
                <p className="text-gray-700">{showModal.bestFor}</p>
              </div>

              <button
                onClick={() => {
                  onPackageSelect(showModal.id);
                  setShowModal(null);
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Select This Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Services Modal with Bullet Points */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 text-white sticky top-0">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Custom Package</h3>
                  <p className="text-white/80 text-sm mt-1">
                    Select the services you need - we'll build a tailored package for you
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {customServicesList.map((service) => (
                  <div
                    key={service.id}
                    className={`border rounded-xl p-5 transition-all duration-200 cursor-pointer ${
                      selectedCustomServices.includes(service.id)
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => toggleCustomService(service.id)}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-r ${service.iconBg} flex items-center justify-center text-white text-lg flex-shrink-0`}
                      >
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900">{service.id}</h4>
                          {selectedCustomServices.includes(service.id) && (
                            <FaCheckCircle className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 ml-2">
                      {service.bulletPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                {selectedCustomServices.length > 0 && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium">
                      {selectedCustomServices.length} service{selectedCustomServices.length > 1 ? "s" : ""} selected
                    </p>
                  </div>
                )}
                <button
                  onClick={handleCustomContinue}
                  disabled={selectedCustomServices.length === 0}
                  className={`w-full py-3 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    selectedCustomServices.length > 0
                      ? "bg-gradient-to-r from-gray-700 to-gray-900 hover:shadow-lg"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {selectedCustomServices.length > 0 ? (
                    <>
                      Continue with Selected Services
                      <FaArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    "Select at least one service to continue"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Add this style for hiding scrollbar and line-clamp
const style = document.createElement("style");
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .line-clamp-6 {
    display: -webkit-box;
    -webkit-line-clamp: 6;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);

export default ServiceFormPackages;