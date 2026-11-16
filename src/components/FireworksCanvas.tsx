import React, { useEffect, useRef } from 'react';

interface FireworksCanvasProps {
  durationMs?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  sparkle: boolean;
}

interface Rocket {
  x: number;
  y: number;
  targetY: number;
  vx: number;
  vy: number;
  color: string;
}

const PALETTE = [
  '#06b6d4', // cyan
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#fbbf24', // gold
  '#10b981', // emerald
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#ffffff', // white sparkle
];

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({
  durationMs = 9000,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    const startTime = Date.now();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles: Particle[] = [];
    const rockets: Rocket[] = [];

    const createExplosion = (x: number, y: number, baseColor?: string) => {
      const count = 75 + Math.floor(Math.random() * 50);
      const chosenColor = baseColor || PALETTE[Math.floor(Math.random() * PALETTE.length)];

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6.5 + 1.5;
        const color = Math.random() < 0.25 ? '#ffffff' : Math.random() < 0.5 ? chosenColor : PALETTE[Math.floor(Math.random() * PALETTE.length)];

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          color,
          size: Math.random() * 2.5 + 1.5,
          sparkle: Math.random() < 0.3,
        });
      }
    };

    const spawnRocket = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const x = Math.random() * (width * 0.8) + width * 0.1;
      const targetY = Math.random() * (height * 0.45) + height * 0.1;
      const speed = Math.random() * 3 + 11;
      const angle = (Math.random() - 0.5) * 0.25 - Math.PI / 2;

      rockets.push({
        x,
        y: height,
        targetY,
        vx: Math.cos(angle) * speed * 0.2,
        vy: -speed,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      });
    };

    // Initial volley
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (isRunning) spawnRocket();
      }, i * 280);
    }

    let lastRocketTime = Date.now();

    const loop = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed > durationMs && particles.length === 0 && rockets.length === 0) {
        isRunning = false;
        if (onComplete) onComplete();
        return;
      }

      // Periodically spawn rockets while within duration
      if (elapsed < durationMs && now - lastRocketTime > 350 + Math.random() * 400) {
        spawnRocket();
        if (Math.random() < 0.4) spawnRocket(); // Double burst
        lastRocketTime = now;
      }

      // Semi-transparent clear for smooth trailing effect
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.globalCompositeOperation = 'lighter';

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.15; // slight gravity deceleration

        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.shadowColor = r.color;
        ctx.shadowBlur = 8;
        ctx.fill();

        // Trail spark
        if (Math.random() < 0.6) {
          particles.push({
            x: r.x + (Math.random() - 0.5) * 2,
            y: r.y + Math.random() * 4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 1.5 + 0.5,
            alpha: 0.7,
            decay: 0.04,
            color: '#fbbf24',
            size: 1.2,
            sparkle: false,
          });
        }

        if (r.y <= r.targetY || r.vy >= 0) {
          createExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; // gravity
        p.vx *= 0.98; // air resistance
        p.vy *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        const displaySize = p.sparkle && Math.random() < 0.5 ? p.size * 1.5 : p.size;
        ctx.arc(p.x, p.y, displaySize, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      if (isRunning) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [durationMs, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
    />
  );
};
