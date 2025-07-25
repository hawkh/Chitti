import React from "react";
import { Twitter, Linkedin, Github } from "lucide-react";

const Footer = () => {
  const navigation = {
    main: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
    ],
    social: [
      {
        name: "Twitter",
        href: "#",
        icon: Twitter,
      },
      {
        name: "LinkedIn",
        href: "#",
        icon: Linkedin,
      },
      {
        name: "GitHub",
        href: "#",
        icon: Github,
      },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        {/* Navigation Links */}
        <nav
          className="mb-4 flex flex-wrap justify-center space-x-4 sm:space-x-8"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 hover:underline transition-all duration-200 ease-in-out"
            >
              {item.name}
            </a>
          ))}
        </nav>

        {/* Social Links */}
        <div className="mt-2 flex justify-center space-x-4 sm:space-x-8">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-500 hover:text-blue-600 transition-transform transform hover:scale-125"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>

        {/* Footer Text */}
        <p className="mt-4 text-center text-sm text-gray-500">
          &copy; 2024 Chitti AI NDT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
