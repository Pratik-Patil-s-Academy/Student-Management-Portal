import React from 'react';
import { motion } from 'framer-motion';

const GlobalLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm">
            {/* Elegant Spinning Circles */}
            <div className="relative w-24 h-24 flex items-center justify-center">
                <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-t-[#2C3E50] border-r-transparent border-b-transparent border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-2 rounded-full border-[3px] border-t-transparent border-r-[#3498DB] border-b-transparent border-l-transparent"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                    className="absolute inset-4 rounded-full border-[3px] border-t-transparent border-r-transparent border-b-[#2C3E50] border-l-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
                />
                {/* Center dot */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-3 h-3 bg-[#3498DB] rounded-full shadow-lg" 
                />
            </div>

            {/* Loading Text */}
            <motion.div 
                className="mt-8 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="text-[#2C3E50] font-bold tracking-[0.3em] text-lg flex items-center">
                    LOADING
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-6 inline-block text-left"
                    >...</motion.span>
                </div>
                <div className="text-gray-500 text-xs tracking-wider font-medium uppercase">
                    Please wait
                </div>
            </motion.div>
        </div>
    );
};

export default GlobalLoader;
