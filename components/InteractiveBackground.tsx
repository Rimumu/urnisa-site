import React, { useRef, useEffect } from 'react';

// Define the structure of a particle
interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  isStar: boolean;
  twinkleOffset: number;
  twinkleSpeed: number;
  driftVx?: number;
  driftVy?: number;
}

const InteractiveBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: Infinity, y: Infinity, radius: 200 });
  const particles = useRef<Particle[]>([]);
  // Fix: Explicitly pass `undefined` as the initial value to `useRef`.
  const animationFrameId = useRef<number | undefined>(undefined);
  const scrollFactor = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles.current = [];
      const particleCount = Math.floor((canvas.width * canvas.height) / 6000); // Increased density even more
      
      for (let i = 0; i < particleCount; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 1.5 + 0.5;
        const isStar = Math.random() < 0.10; // 10% are stars
        let color: string;
        if (isStar) {
          color = '#f7c548'; // brand-accent
        } else {
          color = 'rgba(255, 255, 255, 0.3)'; // Faint dots
        }

        const particle: Particle = {
          x: x,
          y: y,
          originX: x,
          originY: y,
          vx: 0,
          vy: 0,
          radius: isStar ? radius * 2.5 : radius,
          color: color,
          isStar: isStar,
          twinkleOffset: Math.random() * 100,
          twinkleSpeed: 0.0005 + Math.random() * 0.001,
          // All particles get a drift velocity now.
          // Stars drift a bit faster than the faint dust particles for a parallax effect.
          driftVx: (Math.random() - 0.5) * (isStar ? 0.1 : 0.05),
          driftVy: (Math.random() - 0.5) * (isStar ? 0.1 : 0.05),
        };

        particles.current.push(particle);
      }
    };

    const lerp = (start: number, end: number, t: number): number => {
        return start * (1 - t) + end * t;
    };
    
    const animate = () => {
      // Get the current scroll factor
      const currentScrollFactor = scrollFactor.current;

      // Define start and end colors for the gradient
      const startTop = { r: 58, g: 16, b: 23 }; // #3a1017
      const startBottom = { r: 31, g: 9, b: 12 }; // #1f090c
      const endTop = { r: 10, g: 2, b: 3 };     // Dark reddish black
      const endBottom = { r: 0, g: 0, b: 0 };     // Black

      // Interpolate colors based on scroll factor
      const topR = Math.round(lerp(startTop.r, endTop.r, currentScrollFactor));
      const topG = Math.round(lerp(startTop.g, endTop.g, currentScrollFactor));
      const topB = Math.round(lerp(startTop.b, endTop.b, currentScrollFactor));

      const bottomR = Math.round(lerp(startBottom.r, endBottom.r, currentScrollFactor));
      const bottomG = Math.round(lerp(startBottom.g, endBottom.g, currentScrollFactor));
      const bottomB = Math.round(lerp(startBottom.b, endBottom.b, currentScrollFactor));

      const currentTopColor = `rgb(${topR}, ${topG}, ${topB})`;
      const currentBottomColor = `rgb(${bottomR}, ${bottomG}, ${bottomB})`;

      // Create and apply the gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, currentTopColor);
      gradient.addColorStop(1, currentBottomColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now();

      for (const p of particles.current) {
        // Interaction with mouse
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let forceDirectionX = 0;
        let forceDirectionY = 0;

        if (distance < mouse.current.radius) {
          // Enhance parallax: stars (closer) are pushed more strongly than dust (further).
          const parallaxMultiplier = p.isStar ? 1 : 0.3;
          const force = (mouse.current.radius - distance) / mouse.current.radius * parallaxMultiplier;
          forceDirectionX = (dx / distance) * force * -1; // Push away
          forceDirectionY = (dy / distance) * force * -1;
        }

        // Return to origin
        const returnForceX = (p.originX - p.x) * 0.01;
        const returnForceY = (p.originY - p.y) * 0.01;

        // Combine forces
        p.vx += forceDirectionX + returnForceX;
        p.vy += forceDirectionY + returnForceY;

        // Apply friction
        p.vx *= 0.92;
        p.vy *= 0.92;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Make the particle's origin point drift slowly
        if (typeof p.driftVx !== 'undefined' && typeof p.driftVy !== 'undefined') {
            p.originX += p.driftVx;
            p.originY += p.driftVy;

            // If the origin goes off-screen, reverse its drift direction to keep it within bounds.
            if (p.originX < 0 || p.originX > canvas.width) {
                p.driftVx *= -1;
            }
            if (p.originY < 0 || p.originY > canvas.height) {
                p.driftVy *= -1;
            }
        }
        
        // Base value for twinkle effect (0 to 1)
        const twinkleValue = (Math.sin(time * p.twinkleSpeed + p.twinkleOffset) + 1) / 2;

        // Draw particle
        if (p.isStar) {
            const opacity = 0.4 + twinkleValue * 0.6; // Varies between 0.4 and 1.0
            const currentRadius = p.radius * (0.8 + twinkleValue * 0.4); // Pulsates between 80% and 120% of original size
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.globalAlpha = 1;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 0;
        }

        ctx.fill();

        // Reset for next particle
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
    };
    
    const handleMouseLeave = () => {
        mouse.current.x = Infinity;
        mouse.current.y = Infinity;
    }

    const handleResize = () => {
      setup();
    };

    const handleScroll = () => {
        // The scroll distance over which the background transitions to its darkest state.
        const scrollThreshold = 500; 
        const factor = Math.min(window.scrollY / scrollThreshold, 1);
        scrollFactor.current = factor;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call to set the color based on initial scroll position
    handleScroll();
    setup();
    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -10,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

export default InteractiveBackground;
