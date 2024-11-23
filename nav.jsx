import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Solutions', href: '/solutions' },
    { label: 'Technology', href: '/technology' },
    { label: 'Industries', href: '/industries' },
    { label: 'Resources', href: '/resources' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="text-2xl font-bold text-blue-900">
              AI Detect
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-900 transition"
                >
                  {item.label}
                </a>
              ))}
              <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">
                Request Demo
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-blue-900"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6">
            <div className="flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-900 transition block py-2"
                >
                  {item.label}
                </a>
              ))}
              <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition w-full">
                Request Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;