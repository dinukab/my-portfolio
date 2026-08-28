import React from 'react';
import ScrollAnimation from '../ui/ScrollAnimation';

export default function About() {
  return (
    <section id="about" className="relative py-24 px-6 overflow-hidden bg-transparent">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-[100px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Stats Grid */}
          <ScrollAnimation className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#111111]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center transition-transform hover:-translate-y-0.125 shadow-sm dark:shadow-none">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">2+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-2 tracking-widest uppercase font-medium">Projects</div>
            </div>
            
            <div className="bg-white dark:bg-[#111111]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center transition-transform hover:-translate-y-0.125 shadow-sm dark:shadow-none">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">10+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-2 tracking-widest uppercase font-medium">Technologies</div>
            </div>

            <div className="bg-white dark:bg-[#111111]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center transition-transform hover:-translate-y-0.125 shadow-sm dark:shadow-none">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">10K+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-2 tracking-widest uppercase font-medium">Lines of Code</div>
            </div>

            <div className="bg-white dark:bg-[#111111]/50 border border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col justify-center transition-transform hover:-translate-y-0.125 shadow-sm dark:shadow-none">
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">2+</div>
              <div className="text-[10px] sm:text-xs text-gray-500 mt-2 tracking-widest uppercase font-medium">Years Writing Code</div>
            </div>
          </ScrollAnimation>
          {/* Right Side: Content */}
          <ScrollAnimation delay={0.2} className="flex flex-col space-y-6 text-left">
            <h2 className="text-xs text-gray-500 dark:text-white/50 font-mono">
            // About
            </h2>

            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
              Who I am
            </h2>

            <p className="text-gray-600 dark:text-gray-300 text-md leading-relaxed">
              Hi, I'm Dinuka, an Information Technology and Management undergraduate at the University of Moratuwa, building clean and fast web applications.           </p>

            <p className="text-gray-600 dark:text-gray-300 text-md leading-relaxed">
              Passionate about full-stack development and exploring Cybersecurity. I believe in writing clean code, solving complex problems creatively, and continuously learning in this fast-paced digital world.
            </p>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
