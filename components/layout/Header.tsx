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
    { name: "Detection", href: "/detection" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Profiles", href: "/profiles" },
    { name: "Full System", href: "/integrated-detection" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
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
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Chitti AI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {name}
              </Link>
            ))}
            <Link
              href="/detection"
              className="ml-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold shadow-md"
            >
              Start Detection
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/detection"
              className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-lg font-semibold mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Start Detection
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
