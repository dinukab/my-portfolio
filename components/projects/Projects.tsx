import React from 'react';
import ScrollAnimation from '../ui/ScrollAnimation';

const projectsData = [
  {
    id: 1,
    title: "Progressive Web App for Integrated POS & E-Commerce System",
    shortTitle: "RetailCore",
    subtitle: "Cloud-based retail and e-commerce platform",
    year: "2026",
    type: "WEB",
    description: "A single tenant progressive web application (PWA) integrating a point of sale (POS) System with an e commerce platform for Sri Lankan retailers. key features include real time inventory synchronization, multi-step checkout, role-based access control and sales analytics.",
    technologies: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    githubUrl: "https://github.com/dinukab/ecommerce_web_app.git",
    liveUrl: "https://d3cffcic66etk7.cloudfront.net/",
    githubUrl2: "https://github.com/Malze-26/OneShopPOS.git",
    liveUrl2: "https://pos.allinoneshop.store/",
    bannerGradient: "from-blue-900/80 to-indigo-900/80",
    accentColor: "bg-blue-400",
  },
  {
    id: 2,
    title: "Cricket Scoring Mobile App",
    shortTitle: "CricHero",
    subtitle: "Real-time match tracking application",
    year: "2026",
    type: "MOBILE APP",
    description: "A mobile application dedicated to scoring cricket matches in real-time. Features include ball-by-ball updates, player statistics tracking, comprehensive match summaries, and offline data sync for uninterrupted scoring on the field.",
    technologies: ["Flutter", "Firebase", "Dart", "Provider"],
    githubUrl: "#",
    liveUrl: "#",
    bannerGradient: "from-emerald-900/80 to-teal-900/80",
    accentColor: "bg-emerald-400",
  }
];

export default function Projects() {
  return (
    <section id="projects" className="relative py-15 px-6 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <ScrollAnimation className="text-left mb-16">
          <h2 className="text-xs text-gray-500 dark:text-white/50 font-mono mb-2">// Projects</h2>
          <h3 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Featured Work
          </h3>
        </ScrollAnimation>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {projectsData.map((project, index) => (
            <ScrollAnimation 
              key={project.id} 
              delay={index * 0.15}
              className="group rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1115] transition-all hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col h-full"
            >
              {/* Top Banner Section */}
              <div className={`relative p-8 h-64 bg-gradient-to-br ${project.bannerGradient} flex flex-col justify-between overflow-hidden`}>
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)]" />
                
                <div className="relative flex justify-between items-start z-10">
                  <span className="text-xs text-white/90 dark:text-white/80 tracking-[0.2em] font-mono flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${project.accentColor} shadow-[0_0_8px_currentColor]`}></span>
                    {project.year} · {project.type}
                  </span>
                  <span className="px-3 py-1 bg-white/20 dark:bg-white/10 rounded-full text-xs font-bold tracking-widest text-white backdrop-blur-md border border-white/30 dark:border-white/20">
                    FEATURED
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
                    {project.shortTitle}
                  </h3>
                  <p className="text-white/90 dark:text-white/80 font-sm  md:text-sm">
                    {project.subtitle}
                  </p>
                </div>
              </div>

              {/* Bottom Details Section */}
              <div className="p-5 flex flex-col flex-grow">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 leading-snug">
                  {project.title}
                </h4>
                
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm leading-relaxed mb-4 flex-grow">
                  {project.description}
                </p>

                <div className="space-y-4">
                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-2.5">
                    {project.technologies.map((tech) => (
                      <span 
                        key={tech} 
                        className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs font-sm text-gray-700 dark:text-gray-300 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Footer Icons */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex gap-2">
                      <a 
                        href={project.githubUrl} 
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group/btn"
                        aria-label="GitHub Repository"
                        title="E-commerce Web App Repository"
                      >
                        <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      </a>
                      {project.githubUrl2 && (
                        <a 
                          href={project.githubUrl2} 
                          className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 hover:bg-gray-100 dark:hover:bg-white/5 transition-all group/btn"
                          aria-label="POS System GitHub Repository"
                          title="POS System Repository"
                        >
                          <svg className="w-5 h-5 transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <a 
                        href={project.liveUrl} 
                        className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full border border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
                        aria-label="View Project"
                        title="E-commerce Web App Live"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                      {project.liveUrl2 && (
                        <a 
                          href={project.liveUrl2} 
                          className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full border border-transparent hover:bg-gray-100 dark:hover:bg-white/5"
                          aria-label="View POS System"
                          title="POS System Live"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
}
