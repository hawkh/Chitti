"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
}
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation: NavigationItem[] = [
    { name: "Demo", href: "/demo" },
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Security", href: "/security" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-lg border-b border-slate-800/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Image
                src="/logoc.jpg"
                alt="Chitti AI NDT"
                width={40}
                height={40}
                className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
              />
            </div>
            <span className="font-bold text-xl text-white">Chitti AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {name}
              </Link>
            ))}
            <Link
              href="/login"
              className="ml-4 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
            >
              Login
            </Link>
            <Link
              href="/demo"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold shadow-md hover:from-red-500 hover:to-red-600"
            >
              Try Demo
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/demo"
              className="block text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Try Demo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
