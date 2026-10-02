import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  alpha: number;
};

function createParticles(w: number, h: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 24 + Math.random() * 56,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.28,
    alpha: 0.08 + Math.random() * 0.14,
  }));
}

/** Lightweight hero motion (no Three.js — safe on React 18). */
export default function LandingHeroAmbience() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let particles: Particle[] = [];
    let raf = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles(w, h, Math.max(8, Math.floor((w * h) / 90000)));
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -p.r) p.x = w + p.r;
        if (p.x > w + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = h + p.r;
        if (p.y > h + p.r) p.y = -p.r;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(255, 180, 160, ${p.alpha})`);
        g.addColorStop(0.45, `rgba(183, 28, 28, ${p.alpha * 0.65})`);
        g.addColorStop(1, "rgba(92, 15, 15, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame += 1;
      if (frame % 2 === 0) {
        const t = frame * 0.008;
        const cx = w * 0.72 + Math.sin(t) * 40;
        const cy = h * 0.35 + Math.cos(t * 0.7) * 30;
        const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
        g2.addColorStop(0, "rgba(255, 243, 241, 0.12)");
        g2.addColorStop(1, "rgba(255, 243, 241, 0)");
        ctx.fillStyle = g2;
        ctx.fillRect(0, 0, w, h);
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="landing-hero-canvas" aria-hidden>
      <canvas ref={canvasRef} className="landing-hero-canvas-el" />
    </div>
  );
}
