import React, { useEffect, useRef } from 'react';

const CursorEffect = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const positionRef = useRef({ x: -100, y: -100 });
    const lastPosRef = useRef({ x: -100, y: -100 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Update mouse position
        const handleMouseMove = (e) => {
            positionRef.current = { x: e.clientX, y: e.clientY };
        };

        // Mobile touch support
        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                positionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        // Particle Class (functional)
        const createParticle = (x, y) => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 0.5 + 0.2; // Slower, more floaty
            return {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 2 + 0.5, // Smaller, dust-like
                color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})` // Varying opacity white
            };
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Emit particles if mouse moved
            const dx = positionRef.current.x - lastPosRef.current.x;
            const dy = positionRef.current.y - lastPosRef.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1) {
                // Emit more particles for a continuous trail
                const count = Math.min(Math.floor(dist), 8);
                for (let i = 0; i < count; i++) {
                    // Interpolate position for smoother trail
                    const t = Math.random();
                    const tx = lastPosRef.current.x + dx * t;
                    const ty = lastPosRef.current.y + dy * t;
                    particlesRef.current.push(createParticle(tx, ty));
                }
            }

            lastPosRef.current = { ...positionRef.current };

            // Update & Draw
            ctx.fillStyle = "white"; // Fallback

            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                const p = particlesRef.current[i];

                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;

                if (p.life <= 0) {
                    particlesRef.current.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                // Glow effect using shadow
                ctx.shadowBlur = p.size * 2;
                ctx.shadowColor = "white";
                ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Reset shadow for performance? Ideally we batch, but for simple trail it's okay.
                ctx.shadowBlur = 0;
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none', // Click through!
                zIndex: 9999 // On TOP of everything
            }}
        />
    );
};

export default CursorEffect;
