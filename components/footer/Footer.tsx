import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 px-6 bg-gray-50 dark:bg-[#0a0c10] border-t border-gray-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <p className="text-gray-500 text-xs font-medium">
          &copy; {currentYear} Dinuka S Bandara. All rights reserved.
        </p>
        
        
      </div>
    </footer>
  );
}
