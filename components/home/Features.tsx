import React from "react";
import { Zap, Target, Cog, BarChart3, Shield, Clock, Globe, Cpu } from "lucide-react";

const features = [
  {
    title: "AI-Powered Detection",
    description: "YOLO-based defect detection with enterprise precision",
    icon: Zap,
    gradient: "from-red-500 to-red-600",
  },
  {
    title: "Real-time Processing",
    description: "Instant analysis with sub-second response times",
    icon: Clock,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Component Profiles",
    description: "Customizable detection parameters for any material",
    icon: Cog,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Analytics Dashboard",
    description: "Comprehensive insights and performance metrics",
    icon: BarChart3,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Enterprise Security",
    description: "Bank-grade encryption and compliance standards",
    icon: Shield,
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    title: "Edge AI Support",
    description: "Deploy on-premise or cloud with IoT integration",
    icon: Cpu,
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    title: "Global Standards",
    description: "ISO 9001, ASTM compliant quality assurance",
    icon: Globe,
    gradient: "from-green-500 to-green-600",
  },
  {
    title: "Predictive Insights",
    description: "ML-powered failure prediction and trend analysis",
    icon: Target,
    gradient: "from-pink-500 to-pink-600",
  },
];

const Features = () => {
  return (
    <section className="py-24 relative overflow-hidden" id="features">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full mb-6 border border-gray-700">
            <Zap className="h-4 w-4 text-red-500" />
            <span className="text-sm font-semibold text-white">Enterprise Features</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">
              Built for Modern Manufacturing
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Industry-leading AI technology that transforms quality control operations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gray-900 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-800"
            >
              <div className="space-y-4">
                <div className={`h-14 w-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon
                    className="h-7 w-7 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
