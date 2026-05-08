// components/services/ServiceFAQ.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServiceFAQ = () => {
  const [openItems, setOpenItems] = useState([0]);

  const toggleItem = (index) => {
    setOpenItems((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index],
    );
  };

  const faqItems = [
    {
      question: "How long does a typical project take to complete?",
      answer:
        "Project timelines vary based on scope and complexity. Each project follows a clearly defined timeline with structured phases, milestones, and delivery checkpoints. We provide detailed timelines during our initial consultation.",
      category: "Timeline",
    },
    {
      question: "What's included in your service packages?",
      answer:
        "Our services cover strategy, creative execution, production, implementation, and ongoing support. Each engagement is tailored to fit your specific needs and objectives.",
      category: "Services",
    },
    {
      question: "Do you work with startups and small businesses?",
      answer:
        "Absolutely. We work with larger organizations and SMEs, delivering scalable solutions that support growth at different stages.",
      category: "Clients",
    },
    {
      question: "What makes your approach different from other agencies?",
      answer:
        "We combine strategic thinking, data insights, technical excellence, and creative execution, ensuring every idea, decision, and implementation serves a clear business purpose.",
      category: "Approach",
    },
    {
      question: "How do you handle project communication and updates?",
      answer:
        "We maintain transparent communication through project management platforms, supported by regular progress reports and status updates, so you always have full visibility on your project at every stage.",
      category: "Communication",
    },
    {
      question: "What happens after my project launches?",
      answer:
        "We provide comprehensive post-launch support, including training, documentation, and ongoing maintenance where needed. We remain available to ensure continued performance, consistency, and long-term success.",
      category: "Support",
    },
    {
      question: "Can you work with our existing team and tools?",
      answer:
        "Yes, we seamlessly integrate with your existing teams and workflows, and we're experienced with a wide range of project management and collaboration tools.",
      category: "Collaboration",
    },
    {
      question: "What are your payment terms and options?",
      answer:
        "We offer flexible payment structures, including milestone-based payments and monthly retainers. We'll work with you to structure a model that aligns with your project scope and engagement needs.",
      category: "Payment",
    },
  ];

  const categories = [
    "All",
    "Timeline",
    "Services",
    "Clients",
    "Approach",
    "Communication",
    "Support",
    "Collaboration",
    "Payment",
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFaqItems =
    activeCategory === "All"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#254899]/20 bg-[#254899]/5 px-6 py-3 mb-6">
            <div className="w-2 h-2 bg-[#254899] rounded-full"></div>
            <span className="text-[#254899] font-semibold text-sm uppercase tracking-wider">
              FAQ
            </span>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get answers to common questions about our services, process, and how
            we work with clients.
          </p>
        </div>

        {/* Category Filter - Updated active state to blue gradient */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeCategory === category
                  ? "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-[#254899] hover:text-[#254899]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFaqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full text-left p-6 lg:p-8 flex items-center justify-between gap-4 hover:bg-gray-50 rounded-2xl transition-colors duration-300"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                      openItems.includes(index)
                        ? "bg-[#ebed17]"
                        : "bg-gradient-to-r from-blue-600 to-blue-800"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-2">
                      {item.question}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-[#254899]/10 text-[#254899] text-xs font-semibold rounded-full">
                      {item.category}
                    </span>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-4 h-4 text-[#254899]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {openItems.includes(index) && (
                <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                  <div className="pl-7 border-l-2 border-[#ebed17]">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions - Updated with blue gradient */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl lg:text-3xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Our team is here to help you get the answers you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/#contact"
                className="bg-[#ebed17] hover:bg-[#f0f269] text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Contact Us Now
              </Link>

              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-[#254899] px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                Schedule Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceFAQ;
