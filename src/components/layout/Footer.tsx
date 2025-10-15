import React from "react";
import { Linkedin, Github } from "lucide-react";

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
        name: "LinkedIn",
        href: "https://www.linkedin.com/company/chitti-ai/",
        icon: Linkedin,
      },
      {
        name: "GitHub",
        href: "https://github.com/Chitti-AI-Solutions/",
        icon: Github,
      },
    ],
  };

  return (
    <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
        <nav
          className="mb-4 flex flex-wrap justify-center space-x-4 sm:space-x-8"
          aria-label="Footer"
        >
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-400 hover:text-red-500 hover:underline transition-all duration-200 ease-in-out"
            >
              {item.name}
            </a>
          ))}
        </nav>

        <div className="mt-2 flex justify-center space-x-4 sm:space-x-8">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-red-500 transition-transform transform hover:scale-125"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-gray-500">
          &copy; 2024 Chitti AI NDT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
