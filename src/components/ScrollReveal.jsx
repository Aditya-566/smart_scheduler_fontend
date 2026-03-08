import { useEffect, useRef, useState } from 'react';

/**
 * ScrollReveal — wraps children and animates them in when they scroll into view.
 * direction: 'left' | 'right' | 'up' | 'down' | 'fade'
 * delay: delay in seconds
 */
export default function ScrollReveal({ children, direction = 'up', delay = 0, className = '', distance = 60 }) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const transforms = {
        left: `translateX(-${distance}px)`,
        right: `translateX(${distance}px)`,
        up: `translateY(${distance}px)`,
        down: `translateY(-${distance}px)`,
        fade: 'scale(0.95)',
    };

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateX(0) translateY(0) scale(1)' : transforms[direction],
                transition: `opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
