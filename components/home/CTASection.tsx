import Link from "next/link";
import Button from "@/components/shared/Button";
const CTASection = () => {
  return (
    <section className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your quality control?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Experience live AI detection with your camera or upload images instantly.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/integrated-detection">
              <Button variant="secondary" size="lg">
                Full System
              </Button>
            </Link>
            <Link href="/detection">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-blue-700"
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
