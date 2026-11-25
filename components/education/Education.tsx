import React from 'react';
import ScrollAnimation from '../ui/ScrollAnimation';
import GlassPanel from '../ui/GlassPanel';

const educationData = [
  {
    id: 0,
    title: "G.C.E. Advanced Level (2022/23)",
    institution: "AM/D.S.Senanayake College",
    period: "2020 - 2021",
    status: "past",
  },
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
    <section id="education" data-img="/img/terrain.jpg" className="relative py-12 px-6 bg-transparent overflow-hidden">
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
                <div key={item.id} className={`flex items-center justify-between w-full ${isLeft ? 'flex-row-reverse' : ''}`}>
                  
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
                    <GlassPanel reveal={index > 0 ? index * 0.2 : true} className={isLeft ? 'ml-auto text-right' : 'text-left'}>
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
                            <span className="glass-badge font-mono">
                              {item.period}
                            </span>
                            <h4 className="text-sm font-semibold leading-snug tracking-[-0.01em] text-(--glass-text)">
                              {item.title}
                            </h4>
                          </div>
                          <h5 className={`text-xs text-(--glass-text-body) font-medium flex gap-1 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                            {item.institution}
                          </h5>
                        </>
                      )}
                    </GlassPanel>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
