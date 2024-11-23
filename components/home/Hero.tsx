import Image from 'next/image';
import Link from 'next/link';

export default function Hero(): JSX.Element {
  return (
    <div className="relative bg-gradient-to-b from-blue-50 to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              AI-Powered Defect Detection for Modern Manufacturing
            </h1>
            <p className="text-xl text-gray-600">
              Enhance quality control with real-time AI detection that spots defects 
              with 99.9% accuracy, reducing waste and improving production efficiency.
            </p>
            <div className="space-x-4">
              <Link
                href="/demo"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Request Demo
              </Link>
              <Link
                href="/technology"
                className="inline-block border border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src="/images/hero-image.jpg"
              alt="AI Detection Demo"
              fill
              className="object-cover rounded-xl shadow-2xl"
              priority
            />
          </div>
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600 mb-8">Trusted by industry leaders</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-70">
            {/* Add partner logos here */}
          </div>
        </div>
      </div>
    </div>
  );
} 