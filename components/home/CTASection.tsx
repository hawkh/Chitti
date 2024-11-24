import Link from "next/link";
import Button from "../shared/Button";
import "@/styles/globals.css";
const CTASection = () => {
  return (
    <section className="bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your quality control?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Get started with AI-powered defect detection today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/demo">
              <Button variant="secondary" size="lg">
                Request Demo
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-blue-700"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
