import React, { useEffect, useRef } from 'react';

export const BackgroundParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isLight = document.documentElement.classList.contains('light');

    // Coffee Steam & Matrix Particles
    const particlesCount = Math.floor((width * height) / 16000);
    const symbols = ['~', '°', '•', '0', '1', '☕', '§', '✦'];

    const particles = Array.from({ length: particlesCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: 0.2 + Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.3,
      size: 11 + Math.random() * 14,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      opacity: 0.08 + Math.random() * 0.3,
      hue: Math.random() > 0.4 ? 'amber' : 'gold',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Faint Warm Coffee Grid
      const isDarkTheme = !document.documentElement.classList.contains('light');
      ctx.strokeStyle = isDarkTheme ? 'rgba(212, 163, 115, 0.04)' : 'rgba(181, 118, 53, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Render Floating Steam / Matrix Particles
      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += Math.sin(p.y * 0.02) * p.speedX;

        if (p.y < -30) {
          p.y = height + 30;
          p.x = Math.random() * width;
        }

        ctx.font = `${p.size}px sans-serif`;
        
        if (p.hue === 'amber') {
          ctx.fillStyle = isDarkTheme
            ? `rgba(229, 142, 38, ${p.opacity})`
            : `rgba(200, 106, 17, ${p.opacity})`;
        } else {
          ctx.fillStyle = isDarkTheme
            ? `rgba(212, 163, 115, ${p.opacity})`
            : `rgba(181, 118, 53, ${p.opacity})`;
        }

        ctx.fillText(p.symbol, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-500"
    />
  );
};

