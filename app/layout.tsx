import type { Metadata, Viewport } from 'next';
import 'lenis/dist/lenis.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dinuka S Bandara | Portfolio',
  description: 'IT undergraduate at University of Moratuwa, building clean and fast web applications.',
};

// viewport-fit=cover lets the mobile tab bar use env(safe-area-inset-bottom)
export const viewport: Viewport = {
  viewportFit: 'cover',
};

import { ThemeProvider } from '../components/theme-provider';
import ThemedBackground from '../components/ui/ThemedBackground';
import SmoothScroll from '../components/SmoothScroll';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Montserrat:wght@300;400;500&family=Sora:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f2efed] text-[#1d1b1a] dark:bg-[#050506] dark:text-white transition-colors duration-300">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <SmoothScroll>
            <ThemedBackground />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
