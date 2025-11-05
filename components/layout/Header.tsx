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

  const mainNav: NavigationItem[] = [
    { name: "Detection", href: "/detection" },
    { name: "Projects", href: "/projects" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  const moreNav: NavigationItem[] = [
    { name: "Work Orders", href: "/work-orders" },
    { name: "Defect Library", href: "/defect-library" },
    { name: "Demo", href: "/demo" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const [showMore, setShowMore] = useState(false);

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
            {mainNav.map(({ name, href }) => (
              <Link
                key={name}
                href={href}
                className="text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                {name}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="text-gray-300 hover:text-white hover:bg-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              >
                More ▾
              </button>
              {showMore && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg py-2 z-50">
                  {moreNav.map(({ name, href }) => (
                    <Link
                      key={name}
                      href={href}
                      className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-slate-700"
                      onClick={() => setShowMore(false)}
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/detection"
              className="ml-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-semibold shadow-md hover:from-red-500 hover:to-red-600"
            >
              Start Detection
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
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-3 text-base font-medium text-gray-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="border-t border-slate-700 my-2 pt-2">
              <div className="text-xs text-gray-500 px-4 mb-2">MORE</div>
              {moreNav.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <Link
              href="/detection"
              className="block text-center bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 rounded-lg font-semibold mt-2"
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
