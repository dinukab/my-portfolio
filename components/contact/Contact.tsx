'use client';

import React, { useState } from 'react';
import GlassPanel, { GlassHeading } from '../ui/GlassPanel';

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
  const label = 'mb-2 block font-mono text-[10px] uppercase tracking-widest text-(--glass-text-muted)';

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <GlassPanel reveal aria-labelledby="contact-title">
          <GlassHeading id="contact-title" title="Let's Connect" accent="contact." />

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <div>
              <label htmlFor="name" className={label}>Name</label>
              <input type="text" id="name" value={formData.name} onChange={handleChange} required placeholder="Your Name" autoComplete="name" className="glass-input" />
            </div>
            <div>
              <label htmlFor="email" className={label}>Email</label>
              <input type="email" id="email" value={formData.email} onChange={handleChange} required placeholder="Your Email" autoComplete="email" className="glass-input" />
            </div>
            <div>
              <label htmlFor="subject" className={label}>Subject (optional)</label>
              <input type="text" id="subject" value={formData.subject} onChange={handleChange} placeholder="Your Subject" className="glass-input" />
            </div>
            <div>
              <label htmlFor="message" className={label}>Message</label>
              <textarea data-lenis-prevent id="message" value={formData.message} onChange={handleChange} required rows={4} placeholder="Your Message" className="glass-input resize-none" />
            </div>

            {submitStatus.message && (
              <div
                role="status"
                className={`rounded-xl p-3 text-sm ${submitStatus.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}
              >
                {submitStatus.message}
              </div>
            )}

            <button
              type="submit"
              data-fingerprint
              disabled={isSubmitting}
              className="mt-2 min-h-11 w-full rounded-xl bg-[#e8b56a] py-3 text-sm font-semibold text-[#1a1206] outline-none transition-colors hover:bg-[#f0c584] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[#c9a27a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </GlassPanel>
      </div>
    </section>
  );
}
