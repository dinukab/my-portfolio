import React from 'react';
import ScrollAnimation from '../ui/ScrollAnimation';

const educationData = [
  {
    id: 1,
    title: "BSc (Hons) in Information Technology & Management",
    institution: "University of Moratuwa",
    period: "2022 - Present",
    status: "current",
  },
  {
    id: 2,
    title: "",
    institution: "",
    period: "",
    status: "skeleton",
  }
];

export default function Education() {
  return (
    <section id="education" className="relative py-12 px-6 bg-transparent overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-300/30 dark:bg-purple-900/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        <ScrollAnimation className="text-left mb-16">
          <h3 className="text-xl md:text-xl font-bold text-gray-900 dark:text-white">Education</h3>
        </ScrollAnimation>

        {/* Centered Timeline */}
        <div className="relative">
          {/* Middle Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[2px] bg-gradient-to-b from-blue-900 via-blue-800 to-transparent"></div>

          <div className="space-y-12">
            {educationData.map((item, index) => {
              // Alternate left and right
              const isLeft = index % 2 !== 0; // index 0 (first item) will be on the right, index 1 on the left

              return (
                <ScrollAnimation key={item.id} delay={index * 0.2} className={`flex items-center justify-between w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
                  
                  {/* Empty space for the opposite side */}
                  <div className="hidden md:block w-5/12"></div>
                  
                  {/* Center Node */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white dark:bg-[#0a0c10] border-2 border-blue-600 dark:border-blue-800 rounded-full z-10 relative">
                      {item.status === 'current' && (
                        <div className="absolute -inset-1 rounded-full bg-blue-800 animate-ping opacity-75" />
                      )}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="w-full md:w-5/12 relative group">
                    <div className={`bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-xl p-5 hover:border-gray-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-lg ${isLeft ? 'ml-auto text-right' : 'text-left'}`}>
                      {item.status === 'skeleton' ? (
                        <>
                          <div className={`flex flex-col gap-3 mb-3 ${isLeft ? 'items-end' : 'items-start'}`}>
                            <div className="w-16 h-5 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
                            <div className="w-3/4 h-5 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
                          </div>
                          <div className={`flex gap-1 mt-3 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                            <div className="w-1/3 h-4 bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className={`flex flex-col gap-1 mb-2 ${isLeft ? 'items-end' : 'items-start'}`}>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-white/5 border border-blue-200 dark:border-white/10 rounded-md text-[10px] font-mono text-blue-700 dark:text-blue-400 whitespace-nowrap">
                              {item.period}
                            </span>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white transition-colors">
                              {item.title}
                            </h4>
                          </div>
                          <h5 className={`text-xs text-gray-600 dark:text-gray-400 font-medium flex gap-1 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                            {item.institution}
                          </h5>
                        </>
                      )}
                    </div>
                  </div>

                </ScrollAnimation>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
