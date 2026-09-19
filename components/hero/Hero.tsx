import React from 'react';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96  rounded-full blur-[100px] -z-10 " />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px]  rounded-full blur-[120px] -z-10 " />

      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] -z-20 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center z-10">

        {/* Left Side: Content */}
        <div className="flex flex-col items-start text-left space-y-6">

          <h1 className="animate-fade-in-up text-3xl md:text-6xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            <span className="block text-gray-600 dark:text-gray-300 text-sm sm:text-md font-light">Hello, I'm</span>
            <span className="text-gray-900 dark:text-white">
              Dinuka S Bandara
            </span>
          </h1>

          {/* Shifting Text Animation */}
          <div className="animate-fade-in-up delay-100 h-7 sm:h-8 overflow-hidden relative w-full text-md sm:text-xl font-semibold">
            <div className="animate-[shiftUp_8s_cubic-bezier(0.4,0,0.2,1)_infinite] flex flex-col">
              <span className="h-8 sm:h-8 flex items-center w-fit bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">Problem Solver</span>
              <span className="h-8 sm:h-8 flex items-center w-fit bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">UI/UX Designer</span>
              <span className="h-8 sm:h-8 flex items-center w-fit bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">Full Stack Developer</span>
              <span className="h-8 sm:h-8 flex items-center w-fit bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-900">Problem Solver</span>
            </div>
          </div>

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes shiftUp {
              0%, 22% { transform: translateY(0); }
              33%, 55% { transform: translateY(-25%); }
              66%, 88% { transform: translateY(-50%); }
              100% { transform: translateY(-75%); }
            }
            @keyframes fadeInUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              opacity: 0;
            }
            .delay-100 { animation-delay: 100ms; }
            .delay-200 { animation-delay: 200ms; }
            .delay-300 { animation-delay: 300ms; }
            .delay-400 { animation-delay: 400ms; }
            .delay-500 { animation-delay: 500ms; }
          `}} />

          <p className="animate-fade-in-up delay-200 text-sm text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed mt-4">
            IT undergraduate at University of Moratuwa, building clean and fast web applications. Passionate about full-stack development and exploring Cybersecurity.
          </p>

          {/* Social Icons */}
          <div className="animate-fade-in-up delay-300 flex items-center gap-5 pt-2">
            <a href="https://github.com/dinukab" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/dinuka-sandaruwan-642a42305" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="mailto:dinukasandaruwan487@gmail.com" className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
              <span className="sr-only">Email</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>

          <div className="animate-fade-in-up delay-400 flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#projects"
              className="px-4 py-2 rounded-full text-gray-900 dark:text-white text-sm border border-gray-300 dark:border-white/30 font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300 shadow-[0_0_3px_rgba(0,0,0,0.1)] dark:shadow-[0_0_3px_rgba(255,255,255,0.2)] flex items-center gap-2"
            >
              View Projects
            </a>
            <a
              href="/Dinuka_Sandaruwan_New_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full border border-gray-300 dark:border-white/30 text-gray-900 dark:text-white text-sm font-medium hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-300 flex items-center gap-2 shadow-[0_0_3px_rgba(0,0,0,0.1)] dark:shadow-[0_0_3px_rgba(255,255,255,0.2)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              CV
            </a>
          </div>
        </div>

        {/* Right Side: Profile Image */}
        <div className="animate-fade-in-up delay-500 relative flex justify-center lg:justify-end items-center mt-10 lg:mt-0">
          <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 group">
            {/* Glowing background blob */}
            <div className="absolute inset-0 bg-blue-300/30 dark:bg-blue-600/20 rounded-full blur-[60px] -z-10 group-hover:bg-blue-400/40 dark:group-hover:bg-blue-500/30 transition-colors duration-500" />
            
            {/* Image Container */}
            <div className="relative w-full h-full rounded-[2rem] overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] group-hover:border-gray-300 dark:group-hover:border-white/20">
              <img 
                src="/profile.png" 
                alt="Dinuka S Bandara" 
                className="object-cover w-full h-full"
              />
            </div>
            
            {/* Decorative corner accents */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-blue-500/50 rounded-tr-[2.5rem] -z-20 transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 opacity-50" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-blue-500/50 rounded-bl-[2.5rem] -z-20 transition-all duration-500 group-hover:-translate-x-2 group-hover:translate-y-2 opacity-50" />
          </div>
        </div>

      </div>
    </section>

  );
}
