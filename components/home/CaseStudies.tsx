import { TrendingUp, Award, Quote, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const caseStudies = [
  {
    company: 'Global Auto OEM',
    industry: 'Automotive',
    metric: '30%',
    metricLabel: 'Reduction in inspection time',
    quote: 'Chitti AI has completely transformed our weld inspection process. What used to take minutes now takes seconds.',
    author: 'Production Manager',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20'
  },
  {
    company: 'Precision Fabworks',
    industry: 'Metal Fabrication',
    metric: '$200k',
    metricLabel: 'Annual savings per line',
    quote: 'The accuracy of defect detection has helped us eliminate false positives and reduce material waste significantly.',
    author: 'Quality Director',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/20'
  }
];

export default function CaseStudies() {
  return (
    <section className="py-24 bg-black relative overflow-hidden" id="case-studies">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-zinc-900/20 skew-x-12 transform origin-top-right" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Proven Results</h2>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            See how leading manufacturers are achieving zero-defect production with Chitti AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-zinc-900 rounded-3xl p-8 md:p-12 border border-zinc-800 relative group hover:border-zinc-700 transition-all">
              <Quote className="absolute top-8 right-8 w-12 h-12 text-zinc-800 group-hover:text-zinc-700 transition-colors" />

              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${study.bg} ${study.color} border ${study.border}`}>
                      {study.industry}
                    </div>
                  </div>

                  <h3 className="text-4xl font-bold text-white mb-2">{study.metric}</h3>
                  <p className="text-zinc-400 mb-8">{study.metricLabel}</p>

                  <blockquote className="text-xl text-zinc-200 leading-relaxed mb-8">
                    "{study.quote}"
                  </blockquote>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-zinc-800">
                  <div>
                    <div className="font-bold text-white">{study.company}</div>
                    <div className="text-sm text-zinc-500">{study.author}</div>
                  </div>
                  <Link
                    href="/contact"
                    className="flex items-center gap-2 text-sm font-bold text-white hover:text-blue-400 transition-colors"
                  >
                    Read Story <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center">
            <p className="text-zinc-400 mb-4">Trusted by innovative teams at</p>
            <div className="flex gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos - in a real app these would be SVGs */}
              <div className="h-8 w-24 bg-zinc-800 rounded"></div>
              <div className="h-8 w-24 bg-zinc-800 rounded"></div>
              <div className="h-8 w-24 bg-zinc-800 rounded"></div>
              <div className="h-8 w-24 bg-zinc-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
