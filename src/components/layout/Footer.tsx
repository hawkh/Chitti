import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Chitti AI</h3>
            <p className="text-gray-400 text-sm">AI-powered defect detection for manufacturing excellence</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/demo" className="text-gray-400 hover:text-white text-sm">Demo</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white text-sm">Pricing</Link></li>
              <li><Link href="/security" className="text-gray-400 hover:text-white text-sm">Security</Link></li>
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white text-sm">Contact</Link></li>
              <li><Link href="/legal/privacy" className="text-gray-400 hover:text-white text-sm">Privacy</Link></li>
              <li><Link href="/legal/terms" className="text-gray-400 hover:text-white text-sm">Terms</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">&copy; 2025 Chitti AI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
