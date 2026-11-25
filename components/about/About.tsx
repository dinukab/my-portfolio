import React from 'react';
import GlassPanel from '../ui/GlassPanel';

export default function About() {
  return (
    <section id="about" data-img="/img/halo.jpg" className="relative py-24 px-6 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <GlassPanel reveal className="flex flex-col justify-center">
              <div className="font-display text-3xl md:text-4xl font-semibold text-(--glass-text) tracking-[-0.01em] leading-[1.05]">5+</div>
              <div className="text-[10px] sm:text-xs text-(--glass-text-body) mt-2 tracking-widest uppercase font-medium">Projects</div>
            </GlassPanel>
            
            <GlassPanel reveal={0.08} className="flex flex-col justify-center">
              <div className="font-display text-3xl md:text-4xl font-semibold text-(--glass-text) tracking-[-0.01em] leading-[1.05]">20+</div>
              <div className="text-[10px] sm:text-xs text-(--glass-text-body) mt-2 tracking-widest uppercase font-medium">Technologies</div>
            </GlassPanel>

            <GlassPanel reveal={0.16} className="flex flex-col justify-center">
              <div className="font-display text-3xl md:text-4xl font-semibold text-(--glass-text) tracking-[-0.01em] leading-[1.05]">10K+</div>
              <div className="text-[10px] sm:text-xs text-(--glass-text-body) mt-2 tracking-widest uppercase font-medium">Lines of Code</div>
            </GlassPanel>

            <GlassPanel reveal={0.24} className="flex flex-col justify-center">
              <div className="font-display text-3xl md:text-4xl font-semibold text-(--glass-text) tracking-[-0.01em] leading-[1.05]">2+</div>
              <div className="text-[10px] sm:text-xs text-(--glass-text-body) mt-2 tracking-widest uppercase font-medium">Years Writing Code</div>
            </GlassPanel>
          </div>
          {/* Right Side: Content */}
          <GlassPanel reveal={0.2} data-hand-grip className="flex flex-col space-y-6 text-left">
            <h2 className="text-xs font-light text-(--glass-accent) font-mono">
              {'// About'}
            </h2>

            <h2 className="font-display text-2xl md:text-3xl font-semibold leading-[1.05] tracking-[-0.01em] text-(--glass-text)">
              Who I am
            </h2>

            <p className="text-(--glass-text-body) text-md leading-relaxed">
              Hi, I&apos;m Dinuka, an Information Technology and Management undergraduate at the University of Moratuwa, building clean and fast web applications.           </p>

            <p className="text-(--glass-text-body) text-md leading-relaxed">
              Passionate about full-stack development and exploring Cybersecurity. I believe in writing clean code, solving complex problems creatively, and continuously learning in this fast-paced digital world.
            </p>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
}
