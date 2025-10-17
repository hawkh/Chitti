export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: January 2025</p>
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly, including name, email, company details, and uploaded images for defect detection analysis.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p>Your data is used to provide defect detection services, improve our AI models, and communicate with you about our services.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Security</h2>
            <p>We implement industry-standard security measures including AES-256 encryption at rest and TLS 1.3 in transit.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Retention</h2>
            <p>Demo data is retained for 30 days. Enterprise customers can configure custom retention policies.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@chitti-ai.com.</p>
          </section>
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. GDPR Compliance</h2>
            <p>We are fully GDPR compliant and provide data portability and erasure upon request.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
