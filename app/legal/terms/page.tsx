export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">Terms of Service</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2025</p>
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing Chitti AI NDT services, you agree to these terms and conditions.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Service Description</h2>
            <p>Chitti AI provides AI-powered defect detection for manufacturing quality control.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use</h2>
            <p>You may not use our services for illegal purposes or in violation of any applicable laws.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p>All AI models, software, and documentation remain the property of Chitti AI.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>Chitti AI is not liable for any indirect, incidental, or consequential damages arising from use of our services.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
