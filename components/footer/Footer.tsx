import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="px-6 pt-8 pb-28 md:pb-8 bg-[#f2efed]/80 dark:bg-[#050506]/80 border-t border-black/10 dark:border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">
          &copy; {currentYear} Dinuka S Bandara. All rights reserved.
        </p>
        
        
      </div>
    </footer>
  );
}
