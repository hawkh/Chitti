import { Factory, Cpu, Package, Wrench, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const useCases = [
  {
    title: 'Automotive Manufacturing',
    description: 'Automated inspection of weld seams, surface finish, and assembly verification.',
    details: ['Weld seam analysis', 'Paint defect detection', 'Gap & flush measurement'],
    icon: Factory,
    stats: '40% faster inspection',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20'
  },
  {
    title: 'Electronics Assembly',
    description: 'High-speed verification of PCB components, solder joints, and connector alignment.',
    details: ['Solder bridge detection', 'Missing component check', 'Polarity verification'],
    icon: Cpu,
    stats: '99.9% accuracy',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20'
  },
  {
    title: 'Packaging & FMCG',
    description: 'Ensure label integrity, seal quality, and code legibility at production speeds.',
    details: ['Label placement check', 'Seal integrity verification', 'OCR/Barcode reading'],
    icon: Package,
    stats: '3x throughput',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20'
  },
  {
    title: 'Heavy Fabrication',
    description: 'Detect structural defects in large-scale metal components and infrastructure.',
    details: ['Corrosion mapping', 'Crack detection', 'Structural integrity'],
    icon: Wrench,
    stats: '95% defect detection',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20'
  }
];

export default function UseCases() {
  return (
    <section className="py-24 bg-zinc-900" id="use-cases">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Industry Applications</h2>
            <p className="text-xl text-zinc-400">
              Tailored solutions for specific manufacturing challenges across diverse sectors.
            </p>
          </div>
          <Link
            href="/contact"
            className="hidden md:flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors"
          >
            View all industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase, index) => (
            <div key={index} className="group bg-black rounded-2xl p-8 border border-zinc-800 hover:border-zinc-700 transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between mb-6">
                <div className={`h-14 w-14 ${useCase.bg} rounded-xl flex items-center justify-center border ${useCase.border}`}>
                  <useCase.icon className={`h-7 w-7 ${useCase.color}`} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${useCase.bg} ${useCase.color} border ${useCase.border}`}>
                  {useCase.stats}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">{useCase.title}</h3>
              <p className="text-zinc-400 mb-6">{useCase.description}</p>

              <div className="space-y-3 pt-6 border-t border-zinc-800">
                {useCase.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className={`w-1.5 h-1.5 rounded-full ${useCase.bg.replace('/10', '')}`} />
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-400 transition-colors"
          >
            View all industries <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
