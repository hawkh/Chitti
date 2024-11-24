import React from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Monitor,
  Shield,
  Zap,
} from "lucide-react";
import "@/styles/globals.css";
const Homepage = () => {
  const features = [
    {
      title: "Real-time Detection",
      description:
        "Monitor and detect defects in real-time with our advanced AI algorithms",
      icon: Monitor,
    },
    {
      title: "High Accuracy",
      description:
        "Industry-leading accuracy rates backed by deep learning technology",
      icon: Check,
    },
    {
      title: "Fast Integration",
      description:
        "Seamlessly integrate with your existing manufacturing processes",
      icon: Zap,
    },
  ];

  const industries = [
    "Automotive",
    "Electronics",
    "Aerospace",
    "Pharmaceuticals",
    "Food Processing",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Revolutionizing Quality Control with AI-Powered Defect Detection
            </h1>
            <p className="text-xl mb-8">
              Transform your manufacturing process with real-time AI detection
              that spots defects with unprecedented accuracy.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center">
                Request Demo <ArrowRight className="ml-2" size={20} />
              </button>
              <button className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Why Choose Our Solution?
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            Industries We Serve
          </h2>
          <div className="grid md:grid-cols-5 gap-6">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="text-center p-6 border rounded-lg hover:border-blue-500 transition cursor-pointer"
              >
                <p className="font-medium">{industry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Quality Control?
          </h2>
          <p className="mb-8 text-lg">
            Join leading manufacturers who trust our AI solution
          </p>
          <button className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center mx-auto">
            Get Started Today <ChevronRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
