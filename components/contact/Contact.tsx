'use client';

import React, { useState } from 'react';
import ScrollAnimation from '../ui/ScrollAnimation';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Failed to send message.' });
      }
    } catch (error) {
      setSubmitStatus({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <section id="contact" className="relative py-16 px-6 bg-transparent overflow-hidden">
      {/* Background decorations */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-300/30 dark:bg-purple-600/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <ScrollAnimation className="text-center mb-16">
          <h2 className="text-xs text-gray-500 dark:text-white/50 font-mono mb-2">// Contact</h2>
          <h3 className="text-3xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
            Let's Connect
          </h3>
        </ScrollAnimation>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <ScrollAnimation delay={0.2} className="bg-white dark:bg-[#111111] p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-xl">
             <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                <div>
                  <label htmlFor="name" className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Name</label>
                  <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" className="w-full bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Email</label>
                  <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="Your Email" className="w-full bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Subject(optional)</label>
                  <input type="text" id="subject" value={formData.subject} onChange={handleChange} placeholder="Your Subject" className="w-full bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/50 transition-all" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-[10px] font-mono text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Message</label>
                  <textarea id="message" value={formData.message} onChange={handleChange} required rows={4} placeholder="Your Message" className="w-full bg-gray-50 dark:bg-[#0a0c10] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"></textarea>
                </div>
                
                {submitStatus.message && (
                  <div className={`p-3 rounded-xl text-sm ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {submitStatus.message}
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 rounded-xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black font-semibold text-sm dark:hover:bg-gray-300 hover:cursor-pointer transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
             </form>
          </ScrollAnimation>

        </div>
      </div>
    </section>
  );
}
