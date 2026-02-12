import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

const StarBackground = () => {
    const canvasRef = useRef(null);
    const { isWarping } = useStore();

    // Refs for animation state
    const starsRef = useRef([]);
    const chemParticlesRef = useRef([]);
    const speedRef = useRef(0.2);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Initialize particles
        const initParticles = () => {
            // Stars
            const starCount = 350;
            const stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.1,
                    speedFactor: Math.random() * 0.4 + 0.3
                });
            }
            starsRef.current = stars;

            // Golden Chemistry Particles & Molecular Clusters
            const chemCount = 45;
            const chemParticles = [];
            for (let i = 0; i < chemCount; i++) {
                const isCluster = Math.random() > 0.85;
                chemParticles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: isCluster ? Math.random() * 1.5 + 2 : Math.random() * 1.5 + 1,
                    speedFactor: Math.random() * 0.15 + 0.05,
                    opacity: Math.random() * 0.3 + 0.2,
                    driftX: (Math.random() - 0.5) * 0.3,
                    driftY: (Math.random() - 0.5) * 0.3,
                    isCluster,
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.02
                });
            }
            chemParticlesRef.current = chemParticles;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        const render = () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const targetSpeed = isWarping ? 25 : 0.5;
            speedRef.current += (targetSpeed - speedRef.current) * 0.05;

            // 1. Draw Golden Chemistry Particles (Back Layer)
            chemParticlesRef.current.forEach(p => {
                p.x += (speedRef.current * 0.3 + p.driftX);
                p.y += (speedRef.current * 0.1 + p.driftY);
                p.rotation += p.rotationSpeed;

                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;
                if (p.y > canvas.height) p.y = 0;
                if (p.y < 0) p.y = canvas.height;

                if (p.isCluster && !isWarping) {
                    // Draw a Cluster of 3 atoms connected
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);

                    // Connection lines
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(p.size * 4, 0);
                    ctx.moveTo(0, 0);
                    ctx.lineTo(-p.size * 2, p.size * 3);
                    ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Center Atom
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity + 0.1})`;
                    ctx.fill();

                    // Satellite Atom 1
                    ctx.beginPath();
                    ctx.arc(p.size * 4, 0, p.size * 0.7, 0, Math.PI * 2);
                    ctx.fill();

                    // Satellite Atom 2
                    ctx.beginPath();
                    ctx.arc(-p.size * 2, p.size * 3, p.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();

                    // Cluster Glow
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = '#fbbf24';
                    ctx.stroke(); // trigger shadow on lines too

                    ctx.restore();
                } else {
                    // Glowing Single Atom
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
                    if (!isWarping) {
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = '#fbbf24';
                    }
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Subtle Orbital Ring for "Big" single atoms
                    if (p.size > 2.0 && !isWarping) {
                        ctx.beginPath();
                        ctx.ellipse(p.x, p.y, p.size * 3, p.size * 1, p.rotation, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(251, 191, 36, ${p.opacity * 0.3})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            });

            // 2. Draw White Stars (Front Layer)
            ctx.fillStyle = 'white';
            starsRef.current.forEach(star => {
                star.x += speedRef.current * star.speedFactor;
                star.y += (speedRef.current * 0.2) * star.speedFactor;

                if (star.x > canvas.width) {
                    star.x = 0;
                    star.y = Math.random() * canvas.height;
                }
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }

                const length = isWarping ? speedRef.current * 2 : star.size;

                if (star.size > 0) {
                    ctx.beginPath();
                    if (isWarping) {
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(star.x - length, star.y - (length * 0.2));
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + star.speedFactor * 0.4})`;
                        ctx.lineWidth = star.size;
                        ctx.stroke();
                    } else {
                        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isWarping]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'black'
            }}
        />
    );
};

export default StarBackground;
