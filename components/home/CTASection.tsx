import Link from "next/link";
import Button from "@/components/shared/Button";
const CTASection = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-slate-900 to-black border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your quality control?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Experience live AI detection with your camera or upload images instantly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/integrated-detection">
              <Button variant="secondary" size="lg" className="bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 border-0">
                Full System
              </Button>
            </Link>
            <Link href="/detection">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-slate-700 hover:bg-slate-800"
              >
                Quick Start
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
