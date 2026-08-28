import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dinuka S Bandara | Portfolio',
  description: 'IT undergraduate at University of Moratuwa, building clean and fast web applications.',
};

import { ThemeProvider } from '../components/theme-provider';
import ParticleNetwork from '../components/ui/ParticleNetwork';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-[#0f1115] dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ParticleNetwork />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
