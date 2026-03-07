import { useEffect, useRef } from 'react';

export default function OceanBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Bubbles
        const bubbles = Array.from({ length: 25 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight + window.innerHeight,
            size: Math.random() * 6 + 2,
            speed: Math.random() * 0.5 + 0.2,
            wobble: Math.random() * 2,
            opacity: Math.random() * 0.3 + 0.1
        }));

        // Light rays
        const rays = Array.from({ length: 5 }, (_, i) => ({
            x: (window.innerWidth / 5) * i + Math.random() * 100,
            width: Math.random() * 60 + 30,
            opacity: Math.random() * 0.03 + 0.02,
            speed: Math.random() * 0.3 + 0.1
        }));

        const drawWaves = (t) => {
            const w = canvas.width;
            const h = canvas.height;

            // Draw light rays from top
            rays.forEach(ray => {
                const gradient = ctx.createLinearGradient(ray.x, 0, ray.x, h * 0.7);
                gradient.addColorStop(0, `rgba(0, 178, 203, ${ray.opacity})`);
                gradient.addColorStop(1, 'rgba(0, 178, 203, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                const sway = Math.sin(t * ray.speed * 0.001) * 30;
                ctx.moveTo(ray.x + sway - ray.width / 2, 0);
                ctx.lineTo(ray.x + sway + ray.width / 2, 0);
                ctx.lineTo(ray.x + sway + ray.width, h * 0.7);
                ctx.lineTo(ray.x + sway - ray.width, h * 0.7);
                ctx.closePath();
                ctx.fill();
            });

            // Draw flowing waves at bottom
            for (let layer = 0; layer < 3; layer++) {
                const baseY = h - 60 + layer * 25;
                const alpha = 0.06 - layer * 0.015;
                ctx.beginPath();
                ctx.moveTo(0, baseY);
                for (let x = 0; x <= w; x += 3) {
                    const y = baseY +
                        Math.sin(x * 0.008 + t * 0.001 + layer) * 12 +
                        Math.sin(x * 0.015 + t * 0.002 + layer * 2) * 6 +
                        Math.cos(x * 0.005 + t * 0.0015) * 8;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fillStyle = `rgba(0, 178, 203, ${alpha})`;
                ctx.fill();
            }

            // Draw bubbles
            bubbles.forEach(b => {
                b.y -= b.speed;
                b.x += Math.sin(t * 0.002 + b.wobble) * 0.3;
                if (b.y < -20) {
                    b.y = h + 20;
                    b.x = Math.random() * w;
                }

                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                const grad = ctx.createRadialGradient(
                    b.x - b.size * 0.3, b.y - b.size * 0.3, 0,
                    b.x, b.y, b.size
                );
                grad.addColorStop(0, `rgba(0, 220, 255, ${b.opacity * 0.8})`);
                grad.addColorStop(0.7, `rgba(0, 178, 203, ${b.opacity * 0.3})`);
                grad.addColorStop(1, `rgba(0, 178, 203, 0)`);
                ctx.fillStyle = grad;
                ctx.fill();

                // Bubble highlight
                ctx.beginPath();
                ctx.arc(b.x - b.size * 0.25, b.y - b.size * 0.25, b.size * 0.2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.5})`;
                ctx.fill();
            });
        };

        const animate = (timestamp) => {
            time = timestamp || 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawWaves(time);
            animationId = requestAnimationFrame(animate);
        };
        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none'
            }}
        />
    );
}
