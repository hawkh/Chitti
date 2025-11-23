import React from "react";
import { Zap, Target, Cog, BarChart3, Shield, Clock, Globe, Cpu, Eye, Magnet, TestTube, Waves, Radio, Layers, CheckCircle } from "lucide-react";

const featureGroups = [
  {
    title: "Core Technology",
    description: "Powered by state-of-the-art computer vision models",
    features: [
      {
        title: "AI-Powered Detection",
        description: "YOLO-based defect detection with enterprise precision",
        icon: Zap,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
      },
      {
        title: "Real-time Processing",
        description: "Instant analysis with sub-second response times",
        icon: Clock,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
      },
      {
        title: "Edge AI Support",
        description: "Deploy on-premise or cloud with IoT integration",
        icon: Cpu,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
      },
      {
        title: "Predictive Insights",
        description: "ML-powered failure prediction and trend analysis",
        icon: Target,
        color: "text-red-400",
        bg: "bg-red-400/10",
      },
    ]
  },
  {
    title: "NDT Methods",
    description: "Comprehensive support for standard testing protocols",
    features: [
      {
        title: "Visual Testing (VT)",
        description: "Automated surface crack and corrosion detection",
        icon: Eye,
        color: "text-teal-400",
        bg: "bg-teal-400/10",
      },
      {
        title: "Magnetic Particle (MT)",
        description: "Particle accumulation pattern analysis",
        icon: Magnet,
        color: "text-indigo-400",
        bg: "bg-indigo-400/10",
      },
      {
        title: "Ultrasonic (UT)",
        description: "AI-enhanced signal processing for internal flaws",
        icon: Waves,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
      },
      {
        title: "Radiographic (RT)",
        description: "Deep learning analysis of X-ray imagery",
        icon: Radio,
        color: "text-orange-400",
        bg: "bg-orange-400/10",
      },
    ]
  },
  {
    title: "Enterprise Ready",
    description: "Built for scale, security, and compliance",
    features: [
      {
        title: "Analytics Dashboard",
        description: "Comprehensive insights and performance metrics",
        icon: BarChart3,
        color: "text-green-400",
        bg: "bg-green-400/10",
      },
      {
        title: "Enterprise Security",
        description: "Bank-grade encryption and compliance standards",
        icon: Shield,
        color: "text-slate-400",
        bg: "bg-slate-400/10",
      },
      {
        title: "Global Standards",
        description: "ISO 9001, ASTM compliant quality assurance",
        icon: Globe,
        color: "text-sky-400",
        bg: "bg-sky-400/10",
      },
      {
        title: "Custom Profiles",
        description: "Tailored detection parameters for your materials",
        icon: Cog,
        color: "text-pink-400",
        bg: "bg-pink-400/10",
      },
    ]
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-black relative" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Comprehensive Quality Control
          </h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            A complete suite of AI-powered tools designed to transform your inspection workflow.
          </p>
        </div>

        <div className="space-y-24">
          {featureGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <div className="flex items-center gap-4 mb-10">
                <div className="h-px flex-1 bg-zinc-800"></div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-2">{group.title}</h3>
                  <p className="text-zinc-500">{group.description}</p>
                </div>
                <div className="h-px flex-1 bg-zinc-800"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.features.map((feature, index) => (
                  <div
                    key={index}
                    className="group relative bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>

                    <h4 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

