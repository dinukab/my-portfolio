import React from 'react';
import GlassPanel, { GlassHeading } from '../ui/GlassPanel';

interface Project {
  id: number;
  title: string;
  shortTitle: string;
  subtitle?: string;
  year: string;
  type: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  githubUrl2?: string;
  liveUrl2?: string;
  bannerGradient: string;
  accentColor: string;
  image?: string;
}

const projectsData: Project[] = [
  {
    id: 1,
    title: "Progressive Web App for Integrated POS & E-Commerce System",
    shortTitle: "OneShop",
    year: "2026",
    type: "WEB",
    description: "A single tenant progressive web application (PWA) integrating a point of sale (POS) System with an e commerce platform for Sri Lankan retailers. key features include real time inventory synchronization, multi-step checkout, role-based access control and sales analytics.",
    technologies: ["Next.js", "Node.js", "MongoDB", "Tailwind CSS"],
    githubUrl: "https://github.com/dinukab/ecommerce_web_app.git",
    liveUrl: "https://opendoor.allinoneshop.store/",
    githubUrl2: "https://github.com/Malze-26/OneShopPOS.git",
    liveUrl2: "https://pos.allinoneshop.store/",
    bannerGradient: "from-blue-900/80 to-indigo-900/80",
    accentColor: "bg-blue-400",
    image: "/OneShop.png",
  },
  {
    id: 2,
    title: "Cricket Scoring Web Application",
    shortTitle: "CricHero",
    year: "2026",
    type: "WEB",
    description: "A web application dedicated to scoring cricket matches in real-time. Features include ball-by-ball updates, player statistics tracking, comprehensive match summaries, and offline data sync for uninterrupted scoring on the field.",
    technologies: ["Next.js", "Tailwind CSS", "Firebase", "JavaScript"],
    githubUrl: "https://github.com/Yasiru-ruwantha/Cricapp.git",
    liveUrl: "#",
    bannerGradient: "from-emerald-900/80 to-teal-900/80",
    accentColor: "bg-emerald-400",
  },
  {
    id: 3,
    title: "Portfolio",
    shortTitle: "Portfolio",
    year: "2026",
    type: "WEB",
    description: "Full-stack server-rendered portfolio with secure admin dashboard enabling dynamic content management, real-time CV uploads, MongoDB schemas, Nodemailer SMTP API, and kinetic Lenis animations.",
    technologies: ["Next.js", "Tailwind CSS", "TypeScript"],
    githubUrl: "https://github.com/dinukab/my-portfolio.git",
    liveUrl: "https://dinukasbandara.vercel.app/",
    bannerGradient: "from-emerald-900/80 to-teal-900/80",
    accentColor: "bg-emerald-400",
  }
];

const GITHUB_PATH =
  'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z';

const iconLink =
  'flex size-11 items-center justify-center rounded-full border border-(--glass-border) text-(--glass-text-muted) outline-none transition-colors hover:border-(--glass-border-hover) hover:text-(--glass-text) focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a27a]';

function GithubIcon() {
  return (
    <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d={GITHUB_PATH} />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

const hasUrl = (url?: string) => Boolean(url && url !== '#');

export default function Projects() {
  return (
    <section id="projects" data-img="/img/hand.jpg" className="relative px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <GlassPanel reveal aria-labelledby="projects-title" className="mb-6 max-w-2xl">
          <GlassHeading id="projects-title" title="Featured Work" accent="projects." />
          <p className="text-[15px] leading-relaxed text-(--glass-text-body)">
            A few things I&apos;ve designed and built recently.
          </p>
        </GlassPanel>

        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:max-w-5xl">
          {projectsData.map((project, index) => (
            <li key={project.id} className="flex">
              <GlassPanel
                as="article"
                reveal={index * 0.12}
                aria-labelledby={`project-${project.id}-title`}
                className="flex w-full flex-col"
              >
                {project.image && (
                  <div className="mb-5 overflow-hidden rounded-xl border border-(--glass-border)">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={project.image} alt="" className="h-40 w-full object-cover opacity-90" />
                  </div>
                )}

                <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-(--glass-text-muted)">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-(--glass-accent)" />
                  {project.year} · {project.type}
                </div>

                <h3 id={`project-${project.id}-title`} className="mt-3 font-display text-2xl font-semibold tracking-[-0.01em] text-(--glass-text)">
                  {project.shortTitle}
                </h3>
                <p className="mt-1 text-sm font-medium text-(--glass-text-body)">{project.title}</p>

                <p className="mt-3 flex-grow text-sm leading-relaxed text-(--glass-text-muted)">{project.description}</p>

                <ul aria-label="Tech stack" className="mt-5 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="glass-badge">
                      {tech}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between border-t border-(--glass-border) pt-4">
                  <div className="flex gap-2">
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`${project.shortTitle} source code on GitHub`}>
                      <GithubIcon />
                    </a>
                    {hasUrl(project.githubUrl2) && (
                      <a href={project.githubUrl2} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`${project.shortTitle} second repository on GitHub`}>
                        <GithubIcon />
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {hasUrl(project.liveUrl) && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`Open ${project.shortTitle} live site`}>
                        <ArrowIcon />
                      </a>
                    )}
                    {hasUrl(project.liveUrl2) && (
                      <a href={project.liveUrl2} target="_blank" rel="noopener noreferrer" className={iconLink} aria-label={`Open ${project.shortTitle} second live site`}>
                        <ArrowIcon />
                      </a>
                    )}
                  </div>
                </div>
              </GlassPanel>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
