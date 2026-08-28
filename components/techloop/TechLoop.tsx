import React from 'react';

const technologies = [
  "Next.js", "Node.js", "Git", "Figma", "JavaScript", 
  "Python", "MongoDB", "MySQL", "Flutter"
];

export default function TechLoop() {
  return (
    <section className="py-3 overflow-hidden flex relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-22 bg-gradient-to-r from-gray-50 dark:from-[#0f1115] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-50 dark:from-[#0f1115] to-transparent z-10" />

      <div className="flex w-max animate-[marquee_15s_linear_infinite]">
        {/* First set of items */}
        <div className="flex items-center justify-around gap-12 px-6">
          {technologies.map((tech, index) => (
            <span key={index} className="text-gray-500 dark:text-gray-400 text-xl md:text-2xl font-semibold tracking-wider whitespace-nowrap">
              {tech}
            </span>
          ))}
        </div>
        {/* Second identical set of items for seamless looping */}
        <div className="flex items-center justify-around gap-12 px-6">
          {technologies.map((tech, index) => (
            <span key={`duplicate-${index}`} className="text-gray-500 dark:text-gray-400 text-xl md:text-2xl font-semibold tracking-wider whitespace-nowrap">
              {tech}
            </span>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </section>
  );
}
