import React, { useEffect, useRef } from 'react';
import { useStore } from '../store';

const StarBackground = () => {
    const canvasRef = useRef(null);
    const { isWarping } = useStore();

    // Refs for animation state
    const starsRef = useRef([]);
    const speedRef = useRef(0.2); // Much slower base speed

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Initialize stars
        const initStars = () => {
            const count = 500; // Visible count
            const stars = [];
            for (let i = 0; i < count; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5, // Smaller stars (0 to 1.5px)
                    speedFactor: Math.random() * 0.5 + 0.5 // Parallax effect: some move faster
                });
            }
            starsRef.current = stars;
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial setup

        const render = () => {
            // 1. Clear Screen
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Update Speed
            // Warp speed = 25 (horizontal streak), Normal = 0.5 (slow drift)
            const targetSpeed = isWarping ? 25 : 0.5;
            speedRef.current += (targetSpeed - speedRef.current) * 0.05;

            // 3. Draw Stars
            ctx.fillStyle = 'white';

            starsRef.current.forEach(star => {
                // Movement: Diagonal (Right and slightly Down)
                // Primary movement is Right (+x)
                star.x += speedRef.current * star.speedFactor;

                // Secondary movement is Down (+y), but very subtle
                star.y += (speedRef.current * 0.2) * star.speedFactor;

                // Reset logic
                // If star goes off the right edge
                if (star.x > canvas.width) {
                    star.x = 0;
                    star.y = Math.random() * canvas.height;
                }
                // If star goes off the bottom edge
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }

                // Warp effect: stretch stars into lines when warping
                const length = isWarping ? speedRef.current * 2 : star.size;

                if (star.size > 0) {
                    ctx.beginPath();
                    if (isWarping) {
                        // Draw line for warp (Trail behind, so to the LEFT)
                        ctx.moveTo(star.x, star.y);
                        ctx.lineTo(star.x - length, star.y - length * 0.2); // Trail follows direction
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + star.speedFactor * 0.5})`;
                        ctx.lineWidth = star.size;
                        ctx.stroke();
                    } else {
                        // Draw dot for normal
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
