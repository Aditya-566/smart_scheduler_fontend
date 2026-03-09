import { useEffect, useRef } from 'react';

export default function OceanBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-deep-950">
            {/* Soft background glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-ocean-600/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-ocean-800/20 blur-[150px]" />
            <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-deep-500/10 blur-[100px]" />
        </div>
    );
}
