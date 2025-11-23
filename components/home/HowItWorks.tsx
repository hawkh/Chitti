import React from 'react';
import { Camera, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
    {
        id: '01',
        title: 'Capture or Upload',
        description: 'Use your device camera or upload high-resolution images of your components directly to our secure platform.',
        icon: Camera,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20'
    },
    {
        id: '02',
        title: 'AI Analysis',
        description: 'Our advanced computer vision models instantly analyze the media to detect micro-defects, cracks, and anomalies.',
        icon: Cpu,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20'
    },
    {
        id: '03',
        title: 'Instant Results',
        description: 'Receive immediate, detailed reports with defect classification and confidence scores to make quick decisions.',
        icon: CheckCircle2,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20'
    }
];

export default function HowItWorks() {
    return (
        <section className="py-24 bg-zinc-950 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-semibold text-blue-400 tracking-wide uppercase mb-3">Simple Workflow</h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        From Detection to Insight in Seconds
                    </h3>
                    <p className="text-xl text-gray-400">
                        Streamline your quality control process with our intuitive three-step workflow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2 z-0"></div>

                    {steps.map((step, index) => (
                        <div key={index} className="relative z-10 group">
                            <div className={`h-full bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-8 border ${step.border} hover:border-opacity-50 transition-all duration-300 hover:-translate-y-2`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-xl ${step.bg} flex items-center justify-center border ${step.border}`}>
                                        <step.icon className={`w-7 h-7 ${step.color}`} />
                                    </div>
                                    <span className="text-4xl font-black text-zinc-800 group-hover:text-zinc-700 transition-colors select-none">
                                        {step.id}
                                    </span>
                                </div>

                                <h4 className="text-xl font-bold text-white mb-4">{step.title}</h4>
                                <p className="text-gray-400 leading-relaxed mb-6">
                                    {step.description}
                                </p>

                                {index < steps.length - 1 && (
                                    <div className="md:hidden flex justify-center py-4">
                                        <ArrowRight className="w-6 h-6 text-zinc-700 rotate-90" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link
                        href="/demo"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-colors"
                    >
                        Try it yourself
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
