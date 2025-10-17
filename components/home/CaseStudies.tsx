import { TrendingUp, Award, Zap } from 'lucide-react';
import Link from 'next/link';

const caseStudies = [
  {
    company: 'AutoTech Manufacturing',
    industry: 'Automotive',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-blue-600',
    challenge: 'Manual inspection of 10,000+ welds daily causing bottlenecks',
    solution: 'Deployed Chitti AI for real-time weld defect detection',
    results: [
      '40% reduction in inspection time',
      '99.2% defect detection accuracy',
      '$2M annual cost savings'
    ],
    quote: 'Chitti AI transformed our quality control process. We now catch defects that human inspectors missed.',
    author: 'John Smith, QC Director'
  },
  {
    company: 'ElectroCore Systems',
    industry: 'Electronics',
    icon: Zap,
    gradient: 'from-purple-500 to-purple-600',
    challenge: 'PCB solder defects causing 15% failure rate in field',
    solution: 'Integrated Chitti AI into SMT production line',
    results: [
      '92% reduction in field failures',
      '3x faster inspection throughput',
      'ROI achieved in 4 months'
    ],
    quote: 'The AI catches micro-defects invisible to the naked eye. Our warranty claims dropped dramatically.',
    author: 'Sarah Chen, VP Operations'
  },
  {
    company: 'Precision Metals Inc',
    industry: 'Metal Fabrication',
    icon: Award,
    gradient: 'from-orange-500 to-orange-600',
    challenge: 'Surface crack detection requiring expensive X-ray equipment',
    solution: 'Replaced X-ray with Chitti AI visual inspection',
    results: [
      '60% equipment cost reduction',
      'Sub-second inspection time',
      'Zero false negatives in 6 months'
    ],
    quote: 'We eliminated our X-ray dependency while improving detection rates. Game changer.',
    author: 'Mike Rodriguez, Plant Manager'
  }
];

export default function CaseStudies() {
  return (
    <section className="py-24 bg-gradient-to-b from-black via-slate-900 to-black" id="case-studies">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Proven Results</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real companies achieving measurable improvements with Chitti AI
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <div key={index} className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-slate-600 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div>
                  <div className={`h-16 w-16 bg-gradient-to-br ${study.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <study.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{study.company}</h3>
                  <p className="text-gray-400 mb-4">{study.industry}</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-300">Challenge</p>
                      <p className="text-sm text-gray-400">{study.challenge}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">Solution</p>
                      <p className="text-sm text-gray-400">{study.solution}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-white mb-4">Key Results</h4>
                  <ul className="space-y-3">
                    {study.results.map((result, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className="h-6 w-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="h-2 w-2 bg-green-400 rounded-full" />
                        </div>
                        <span className="text-gray-300">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="bg-slate-900 rounded-lg p-6 mb-4">
                    <p className="text-gray-300 italic mb-4">"{study.quote}"</p>
                    <p className="text-sm text-gray-400">— {study.author}</p>
                  </div>
                  <Link href="/contact" className="text-blue-400 hover:text-blue-300 font-semibold text-center">
                    Read Full Case Study →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold text-lg">
            Request Your Custom Pilot
          </Link>
        </div>
      </div>
    </section>
  );
}
