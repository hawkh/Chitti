import { Factory, Cpu, Package, Wrench } from 'lucide-react';
import Link from 'next/link';

const useCases = [
  {
    title: 'Automotive Manufacturing',
    description: 'Detect surface defects, dimensional variance, and weld quality in real-time',
    icon: Factory,
    stats: '40% faster inspection',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Electronics Assembly',
    description: 'Identify solder defects, component placement errors, and PCB anomalies',
    icon: Cpu,
    stats: '99.2% accuracy',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Packaging & Labeling',
    description: 'Verify print quality, seal integrity, and packaging consistency',
    icon: Package,
    stats: '3x throughput',
    gradient: 'from-green-500 to-green-600'
  },
  {
    title: 'Metal Fabrication',
    description: 'Detect cracks, corrosion, deformation, and surface irregularities',
    icon: Wrench,
    stats: '95% defect detection',
    gradient: 'from-orange-500 to-orange-600'
  }
];

export default function UseCases() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-slate-900 to-black" id="use-cases">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Industry Applications</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Trusted by manufacturers across industries for critical quality control
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all">
              <div className={`h-16 w-16 bg-gradient-to-br ${useCase.gradient} rounded-xl flex items-center justify-center mb-6`}>
                <useCase.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{useCase.title}</h3>
              <p className="text-gray-400 mb-4">{useCase.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-green-400 font-semibold">{useCase.stats}</span>
                <Link href="/contact" className="text-blue-400 hover:text-blue-300 font-semibold">
                  See case study →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
