import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Particle = ({ delay }) => (
  <motion.div
    initial={{ y: 0, x: 0, opacity: 0 }}
    animate={{ 
      y: [0, -100, -200],
      x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
      opacity: [0, 1, 0],
      scale: [0, 1, 0.5]
    }}
    transition={{ 
      duration: 3, 
      repeat: Infinity, 
      delay,
      ease: "easeOut" 
    }}
    className="absolute h-1 w-1 rounded-full bg-primary/40 blur-[1px]"
  />
);

const GlobalLoader = () => {
    const loadingText = "DEVELOPING THE FUTURE";
    const particles = Array.from({ length: 20 });
    
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030712] overflow-hidden">
            {/* Ambient Background Noise/Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Dynamic Mesh Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 rounded-full blur-[120px]"
                />
            </div>

            {/* Main Visual Component */}
            <div className="relative flex items-center justify-center scale-110">
                {/* Floating Particles Around Core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {particles.map((_, i) => (
                        <Particle key={i} delay={i * 0.2} />
                    ))}
                </div>

                {/* Outer Rotating Cyber Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="h-48 w-48 rounded-full border border-dashed border-primary/30 flex items-center justify-center"
                >
                    <div className="h-4 w-4 rounded-full bg-primary absolute top-0 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                </motion.div>

                {/* Middle Pulse Ring */}
                <motion.div
                    animate={{ 
                        scale: [1, 1.15, 1],
                        borderColor: ["rgba(99,102,241,0.2)", "rgba(168,85,247,0.5)", "rgba(99,102,241,0.2)"]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute h-36 w-36 rounded-full border-2 border-primary/20"
                />

                {/* The "Power" Core */}
                <div className="absolute h-24 w-24 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden">
                    <motion.div
                        animate={{ 
                            height: ["20%", "60%", "20%"],
                            width: ["60%", "20%", "60%"],
                            borderRadius: ["30%", "50%", "30%"],
                            rotate: 360
                        }}
                        transition={{ 
                            duration: 3, 
                            repeat: Infinity, 
                            ease: "easeInOut" 
                        }}
                        className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    />
                </div>
            </div>

            {/* Typography Section */}
            <div className="mt-20 flex flex-col items-center gap-6">
                <div className="flex gap-1">
                    {loadingText.split("").map((char, i) => (
                        <motion.span
                            key={i}
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            transition={{ 
                                delay: i * 0.05,
                                duration: 0.8,
                                repeat: Infinity,
                                repeatDelay: 3,
                                repeatType: "reverse"
                            }}
                            className={`text-sm font-black tracking-[0.4em] ${char === " " ? "w-2" : ""} text-white/80`}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                {/* Loading Bar */}
                <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                    <motion.div
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent"
                    />
                </div>

                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-[10px] uppercase font-bold tracking-[0.6em] text-primary/60"
                >
                    System Initializing
                </motion.div>
            </div>
            
            {/* Corner Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 border-t border-l border-primary/20 rounded-tl-2xl" />
            <div className="absolute bottom-10 right-10 w-20 h-20 border-b border-r border-secondary/20 rounded-br-2xl" />
        </div>
    );
};

export default GlobalLoader;
