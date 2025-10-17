import { Shield, Lock, FileCheck, Server, Eye, Award } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-6">Security & Compliance</h1>
        <p className="text-xl text-gray-300 mb-12 max-w-3xl">
          Enterprise-grade security with SOC 2 Type II and ISO 27001 compliance
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 rounded-lg p-6">
            <Lock className="h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Encryption</h3>
            <p className="text-gray-400">AES-256 encryption at rest, TLS 1.3 in transit</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Shield className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Access Control</h3>
            <p className="text-gray-400">Role-based access with SSO/SAML support</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <FileCheck className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Audit Logs</h3>
            <p className="text-gray-400">Complete activity tracking for compliance</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Server className="h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Data Residency</h3>
            <p className="text-gray-400">On-premise or cloud deployment options</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Eye className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Privacy</h3>
            <p className="text-gray-400">GDPR compliant with data erasure policies</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6">
            <Award className="h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Certifications</h3>
            <p className="text-gray-400">SOC 2 Type II, ISO 27001 certified</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">Data Protection</h2>
          <div className="space-y-4 text-gray-300">
            <p>All data is encrypted using industry-standard AES-256 encryption at rest and TLS 1.3 in transit.</p>
            <p>We implement strict access controls with role-based permissions and support SSO/SAML for enterprise authentication.</p>
            <p>Complete audit logs track all system activities for compliance and security monitoring.</p>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-white mb-6">Deployment Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Cloud</h3>
              <p className="text-gray-400">Fully managed SaaS deployment with 99.9% uptime SLA</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">On-Premise</h3>
              <p className="text-gray-400">Deploy within your infrastructure for complete control</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-2">Edge</h3>
              <p className="text-gray-400">Run inference at the edge for low-latency detection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
