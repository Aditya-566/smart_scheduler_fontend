import { useEffect, useRef } from 'react';

export default function OceanBackground() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let time = 0;
        let mouseX = -100;
        let mouseY = -100;
        let prevMouseX = -100;
        let prevMouseY = -100;
        let mouseSpeed = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Track cursor globally (canvas has pointerEvents: none, so we listen on window)
        const onMouseMove = (e) => {
            const dx = e.clientX - prevMouseX;
            const dy = e.clientY - prevMouseY;
            mouseSpeed = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
            prevMouseX = mouseX;
            prevMouseY = mouseY;
            mouseX = e.clientX;
            mouseY = e.clientY;
            // Spawn ripple on faster movement
            if (mouseSpeed > 3) {
                ripples.push({
                    x: mouseX,
                    y: mouseY,
                    radius: 0,
                    maxRadius: 30 + mouseSpeed * 2,
                    opacity: 0.15 + mouseSpeed * 0.004,
                    speed: 1.5 + mouseSpeed * 0.05
                });
                // Spawn extra particles on very fast movement
                if (mouseSpeed > 12) {
                    for (let i = 0; i < 2; i++) {
                        particles.push({
                            x: mouseX + (Math.random() - 0.5) * 20,
                            y: mouseY + (Math.random() - 0.5) * 20,
                            vx: (Math.random() - 0.5) * mouseSpeed * 0.3,
                            vy: (Math.random() - 0.5) * mouseSpeed * 0.3 - 1,
                            life: 1,
                            decay: 0.015 + Math.random() * 0.01,
                            size: Math.random() * 3 + 1
                        });
                    }
                }
            }
        };
        window.addEventListener('mousemove', onMouseMove);

        // Ripples array
        const ripples = [];
        // Interactive particles
        const particles = [];

        // Bubbles
        const bubbles = Array.from({ length: 30 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight + window.innerHeight,
            size: Math.random() * 6 + 2,
            speed: Math.random() * 0.5 + 0.2,
            wobble: Math.random() * 2,
            opacity: Math.random() * 0.3 + 0.1
        }));

        // Light rays
        const rays = Array.from({ length: 6 }, (_, i) => ({
            x: (window.innerWidth / 6) * i + Math.random() * 100,
            width: Math.random() * 60 + 30,
            opacity: Math.random() * 0.03 + 0.02,
            speed: Math.random() * 0.3 + 0.1
        }));

        // Floating particles (ambient)
        const ambientParticles = Array.from({ length: 40 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.2 - 0.1,
            opacity: Math.random() * 0.3 + 0.05,
            pulse: Math.random() * Math.PI * 2
        }));

        const draw = (t) => {
            const w = canvas.width;
            const h = canvas.height;

            // Light rays from top
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

            // Cursor glow — subtle light that follows the mouse
            if (mouseX > 0 && mouseY > 0) {
                const glowRadius = 120 + mouseSpeed * 3;
                const glowGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
                glowGrad.addColorStop(0, `rgba(0, 200, 230, ${0.06 + mouseSpeed * 0.002})`);
                glowGrad.addColorStop(0.5, `rgba(0, 178, 203, ${0.02 + mouseSpeed * 0.001})`);
                glowGrad.addColorStop(1, 'rgba(0, 178, 203, 0)');
                ctx.fillStyle = glowGrad;
                ctx.fillRect(mouseX - glowRadius, mouseY - glowRadius, glowRadius * 2, glowRadius * 2);
            }

            // Draw & update ripples (cursor interaction)
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.radius += r.speed;
                r.opacity -= 0.003;
                if (r.opacity <= 0 || r.radius >= r.maxRadius) {
                    ripples.splice(i, 1);
                    continue;
                }
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 220, 255, ${r.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Inner ring
                if (r.radius > 5) {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 178, 203, ${r.opacity * 0.5})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Draw & update cursor particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.02; // slight gravity
                p.vx *= 0.98;
                p.life -= p.decay;
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 220, 255, ${p.life * 0.6})`;
                ctx.fill();
            }

            // Ambient floating particles
            ambientParticles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;
                p.pulse += 0.02;
                if (p.x < -10) p.x = w + 10;
                if (p.x > w + 10) p.x = -10;
                if (p.y < -10) p.y = h + 10;
                if (p.y > h + 10) p.y = -10;

                // Particles drift away from cursor
                const dxm = p.x - mouseX;
                const dym = p.y - mouseY;
                const distM = Math.sqrt(dxm * dxm + dym * dym);
                if (distM < 150 && distM > 0) {
                    const force = (150 - distM) / 150 * 0.5;
                    p.x += (dxm / distM) * force;
                    p.y += (dym / distM) * force;
                }

                const alpha = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 200, 230, ${alpha})`;
                ctx.fill();
            });

            // Flowing waves at bottom — cursor affects wave height
            for (let layer = 0; layer < 3; layer++) {
                const baseY = h - 60 + layer * 25;
                const alpha = 0.06 - layer * 0.015;
                ctx.beginPath();
                ctx.moveTo(0, baseY);
                for (let x = 0; x <= w; x += 3) {
                    // Cursor proximity effect on waves
                    const dxWave = x - mouseX;
                    const dyWave = baseY - mouseY;
                    const distWave = Math.sqrt(dxWave * dxWave + dyWave * dyWave);
                    const cursorInfluence = distWave < 300 ? Math.sin((1 - distWave / 300) * Math.PI) * 15 * (mouseSpeed * 0.05 + 1) : 0;

                    const y = baseY +
                        Math.sin(x * 0.008 + t * 0.001 + layer) * 12 +
                        Math.sin(x * 0.015 + t * 0.002 + layer * 2) * 6 +
                        Math.cos(x * 0.005 + t * 0.0015) * 8 -
                        cursorInfluence;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(w, h);
                ctx.lineTo(0, h);
                ctx.closePath();
                ctx.fillStyle = `rgba(0, 178, 203, ${alpha})`;
                ctx.fill();
            }

            // Bubbles — cursor pushes them
            bubbles.forEach(b => {
                b.y -= b.speed;
                b.x += Math.sin(t * 0.002 + b.wobble) * 0.3;

                // Cursor repulsion
                const bDx = b.x - mouseX;
                const bDy = b.y - mouseY;
                const bDist = Math.sqrt(bDx * bDx + bDy * bDy);
                if (bDist < 120 && bDist > 0) {
                    const push = (120 - bDist) / 120 * 2;
                    b.x += (bDx / bDist) * push;
                    b.y += (bDy / bDist) * push;
                }

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
            mouseSpeed *= 0.92; // decay speed
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw(time);
            animationId = requestAnimationFrame(animate);
        };
        animate(0);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
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
