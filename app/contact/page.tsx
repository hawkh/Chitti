'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-stone-950">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-amber-200 via-orange-100 to-amber-300 bg-clip-text text-transparent mb-6">Contact Us</h1>
        <p className="text-xl text-amber-200 mb-12 max-w-2xl">
          Request a pilot, schedule a demo, or get answers to your questions
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-amber-300 mb-2">Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 text-amber-100 rounded-xl border border-zinc-700 focus:border-amber-500 focus:outline-none" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-300 mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 text-amber-100 rounded-xl border border-zinc-700 focus:border-amber-500 focus:outline-none" placeholder="you@company.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-300 mb-2">Company</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 bg-zinc-900 text-amber-100 rounded-xl border border-zinc-700 focus:border-amber-500 focus:outline-none" placeholder="Company name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-amber-300 mb-2">Message</label>
                <textarea value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} rows={5} className="w-full px-4 py-3 bg-zinc-900 text-amber-100 rounded-xl border border-zinc-700 focus:border-amber-500 focus:outline-none" placeholder="Tell us about your needs..." />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-xl hover:from-orange-500 hover:to-rose-500 font-semibold shadow-lg">
                <Send className="h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-amber-100 mb-1">Email</h3>
                  <a href="mailto:ruthvikworking@gmail.com" className="text-amber-300 hover:text-amber-400">ruthvikworking@gmail.com</a>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-emerald-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-amber-100 mb-1">Phone</h3>
                  <a href="tel:+916303639831" className="text-amber-300 hover:text-emerald-400">+91 6303 639 831</a>
                </div>
              </div>
            </div>
            <div className="bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-amber-100 mb-1">Location</h3>
                  <p className="text-amber-300">Hyderabad, Telangana, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
