import { Link } from "react-router-dom";
import {
  FiTarget,
  FiMessageSquare,
  FiTrendingDown,
  FiArrowRight,
} from "react-icons/fi";
import {
  BsLightbulb,
  BsExclamationTriangle,
  BsCheckCircle,
} from "react-icons/bs";

const Problem = () => {
  const painPoints = [
    {
      title: "No clear positioning",
      description:
        "You blend in with competitors instead of standing out. Your ideal clients can't tell why they should choose you.",
      icon: FiTarget,
      color: "from-blue-600 via-blue-700 to-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      title: "Inconsistent messaging",
      description:
        "Your website says one thing, your social media says another. Confusion kills conversions.",
      icon: FiMessageSquare,
      color: "from-blue-600 via-blue-700 to-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      title: "Running ads without strategy",
      description:
        "Burning through budget on ads that don't convert because your foundation isn't solid.",
      icon: FiTrendingDown,
      color: "from-blue-600 via-blue-700 to-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-700",
    },
  ];

  return (
    <section
      id="problem"
      className="relative py-20 md:py-10 bg-gradient-to-b from-white to-blue-50 overflow-hidden"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-700/15 rounded-full filter blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          {/* Section Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6 shadow-sm">
            <BsExclamationTriangle className="w-4 h-4 text-blue-700" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              The Reality Check
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              Ideas
            </span>{" "}
            <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              that Work
            </span>{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 bg-clip-text text-transparent">
              are Worked.
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto flex items-center justify-center gap-2">
            Many businesses hit a wall because they're missing the fundamentals.
            Here are some hidden hold backs.
          </p>
        </div>

        {/* Pain Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 border border-blue-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />

              {/* Icon */}
              <div
                className={`relative w-14 h-14 ${point.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-100`}
              >
                <point.icon className={`w-7 h-7 ${point.iconColor}`} />
              </div>

              {/* Number Indicator */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-semibold text-sm border border-gray-200">
                {index + 1}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                {point.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                {point.description}
              </p>

              {/* Decorative Line */}
              <div className="w-12 h-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-500 rounded-full group-hover:w-20 transition-all duration-300"></div>

              {/* Dot Pattern */}
              <div className="absolute bottom-4 right-4 flex gap-1">
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;