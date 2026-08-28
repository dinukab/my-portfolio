'use client';

import React, { useEffect, useRef } from 'react';

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 1;
    this.vy = (Math.random() - 0.5) * 1;
    this.radius = Math.random() * 0.5 + 0.1;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx = -this.vx;
    if (this.y < 0 || this.y > height) this.vy = -this.vy;
  }

  draw(ctx: CanvasRenderingContext2D, isDark: boolean) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.8)' : 'rgba(6, 63, 91, 0.7)';
    ctx.fill();
  }
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const mouse = { x: -1000, y: -1000 };
    const maxDistance = 150;

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Re-initialize particles on resize to ensure they cover the screen
      particles = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 15000); // Responsive particle count
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseOut = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    // Initial setup
    handleResize();

    // Animation Loop
    const animate = () => {
      // Check theme on the fly to support dynamic switching
      const isDark = document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.update(canvas.width, canvas.height);
        particle.draw(ctx, isDark);

        // Connect particles to each other
        for (let j = index; j < particles.length; j++) {
          const dx = particle.x - particles[j].x;
          const dy = particle.y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = 1 - distance / maxDistance;
            ctx.strokeStyle = isDark ? `rgba(59, 130, 246, ${opacity * 0.2})` : `rgba(0, 0, 0, ${opacity * 0.15})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect particles to mouse
        const dxMouse = particle.x - mouse.x;
        const dyMouse = particle.y - mouse.y;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < maxDistance * 1.5) { // Larger interaction radius for mouse
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(mouse.x, mouse.y);
          const opacity = 1 - distanceMouse / (maxDistance * 1.5);
          // Highlight connection to mouse with a slightly stronger color (blue-ish)
          ctx.strokeStyle = isDark ? `rgba(96, 165, 250, ${opacity * 0.2})` : `rgba(248, 113, 113, ${opacity * 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-50 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
