import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BrainCircuit } from 'lucide-react';

export default function ProcessingLoader({ message }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 p-10 max-w-md w-full">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Deep ambient glow */}
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-primary-600/30 blur-[40px]"
        />
        
        {/* Orbital rings */}
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute inset-0 rounded-full border border-primary-500/40 border-t-teal-400/80 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute inset-4 rounded-full border border-accent-500/30 border-b-accent-400/80"
        />
        
        {/* Center floating icon */}
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 w-16 h-16 rounded-2xl glass-panel flex items-center justify-center border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-teal-500/20 rounded-2xl"></div>
          <BrainCircuit className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </motion.div>
      </div>

      <div className="glass-card w-full p-6 text-center space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-bg opacity-30"></div>
        <h3 className="text-xl font-semibold text-white tracking-tight font-['Outfit'] relative z-10">AI Engine Processing</h3>
        <p className="text-sm text-zinc-400 relative z-10">
          {message || "Vectorizing your resume and cross-referencing semantic gaps using Gemini 1.5 Pro..."}
        </p>
        
        {/* Progress Bar Mock */}
        <div className="w-full h-1 bg-zinc-800/50 rounded-full overflow-hidden mt-4 relative z-10">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary-400 via-accent-400 to-teal-400"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 15, ease: "circOut" }}
          />
        </div>
      </div>
    </div>
  );
}
