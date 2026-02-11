import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

const SimpleStarfield = () => {
    const canvasRef = useRef(null);
    const { isWarping } = useStore();

    // Use Refs to store state that changes frequently without triggering re-renders
    const isWarpingRef = useRef(isWarping);
    const speedRef = useRef(0.2); // Initial low speed
    const starsRef = useRef([]);

    // Sync ref when store updates
    useEffect(() => {
        isWarpingRef.current = isWarping;
    }, [isWarping]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Initialize stars if not already done
        if (starsRef.current.length === 0) {
            const numStars = 1000;
            const w = window.innerWidth;
            const h = window.innerHeight;

            for (let i = 0; i < numStars; i++) {
                starsRef.current.push({
                    x: (Math.random() - 0.5) * w,
                    y: (Math.random() - 0.5) * h,
                    z: Math.random() * w // Depth
                });
            }
        }

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // On resize, we might want to re-distribute stars or just let them be
        };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const render = () => {
            // 1. Clear with solid black
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Update speed based on warp state
            // Warp speed = 50, Regular speed = 0.5
            const targetSpeed = isWarpingRef.current ? 40 : 2;
            speedRef.current += (targetSpeed - speedRef.current) * 0.05;

            // 3. Draw stars
            ctx.fillStyle = '#ffffff';

            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            const w = canvas.width;

            starsRef.current.forEach(star => {
                // Move towards camera
                star.z -= speedRef.current;

                // Reset star if it passes camera
                if (star.z <= 0) {
                    star.z = w;
                    star.x = (Math.random() - 0.5) * w;
                    star.y = (Math.random() - 0.5) * canvas.height;
                }

                // 3D Projection logic
                // x' = x / z
                const k = 128.0 / Math.max(star.z, 0.1);
                const px = star.x * k + cx;
                const py = star.y * k + cy;

                // Opacity/Size based on depth
                const size = (1 - star.z / w) * 3;
                const opacity = (1 - star.z / w);

                if (px >= 0 && px <= w && py >= 0 && py <= canvas.height && size > 0) {
                    ctx.globalAlpha = opacity;
                    ctx.beginPath();
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
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
                zIndex: -1, // Behind everything
                background: '#000000',
                pointerEvents: 'none'
            }}
        />
    );
};

export default SimpleStarfield;
