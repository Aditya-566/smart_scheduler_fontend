import { useRef, useCallback } from 'react';

/**
 * Tilt3D — wraps any child in a 3D perspective-tilt container.
 * On mouse hover, the card tilts toward the cursor position.
 * Props: intensity (tilt degrees), glare (show light glare), className, children
 */
export default function Tilt3D({ children, intensity = 8, glare = true, className = '', scale = 1.02, style = {} }) {
    const ref = useRef(null);
    const glareRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -intensity;
        const rotateY = ((x - centerX) / centerX) * intensity;

        el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

        if (glare && glareRef.current) {
            const glareX = (x / rect.width) * 100;
            const glareY = (y / rect.height) * 100;
            glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(0, 220, 255, 0.12), transparent 60%)`;
            glareRef.current.style.opacity = '1';
        }
    }, [intensity, scale, glare]);

    const handleMouseLeave = useCallback(() => {
        const el = ref.current;
        if (!el) return;
        el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (glareRef.current) {
            glareRef.current.style.opacity = '0';
        }
    }, []);

    return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 0.15s ease-out',
                willChange: 'transform',
                position: 'relative',
                ...style
            }}
        >
            {children}
            {glare && (
                <div
                    ref={glareRef}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        pointerEvents: 'none',
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                        zIndex: 1,
                    }}
                />
            )}
        </div>
    );
}
