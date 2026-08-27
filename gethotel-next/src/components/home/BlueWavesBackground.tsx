'use client';


import { motion } from "framer-motion";

export default function BlueWavesBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-[#f8fafc]">
            {/* Simple Performance-Friendly Gradient */}
            <div className="absolute inset-0" 
                style={{
                    background: `linear-gradient(to bottom right, #eff6ff 0%, #f8fafc 50%, #eff6ff 100%)`
                }}
            />
        </div>
    );
}



