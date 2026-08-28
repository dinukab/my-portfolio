'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Blog', href: '#blog' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes navSlideDown {
          0% { transform: translateY(-150%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .nav-animate {
          animation: navSlideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        `
      }} />
      
      <div className="fixed top-6 left-0 right-0 z-[1000] flex justify-center pointer-events-none px-4">
        <nav className="nav-animate pointer-events-auto flex items-center p-1.5 bg-white dark:bg-[#111111] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-white/10 gap-1 transition-colors duration-300 overflow-x-auto max-w-full no-scrollbar">
          
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActiveSection(link.href.replace('#', ''))}
                className={`px-4 md:px-5 py-2.5 rounded-full text-[14px] md:text-[15px] transition-all duration-200 font-inter whitespace-nowrap ${
                  isActive 
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-black font-semibold' 
                    : 'bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium'
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Dark mode toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2.5 ml-1 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center justify-center shrink-0"
            aria-label="Toggle theme"
          >
            {!mounted ? (
              <div className="w-[18px] h-[18px]" />
            ) : theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
