import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowLeft, Lightbulb, Target, Trophy } from 'lucide-react';

export default function AnalysisDashboard({ results, onReset }) {
  if (!results) return null;
  const { match_score, missing_skills, recommendations, summary } = results;

  // Determine score color
  let scoreColor = "text-teal-400";
  let ringColor = "stroke-teal-500";
  if (match_score < 70) {
    scoreColor = "text-amber-400";
    ringColor = "stroke-amber-500";
  }
  if (match_score < 40) {
    scoreColor = "text-rose-400";
    ringColor = "stroke-rose-500";
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const scoreValue = Math.round(match_score);

  return (
    <div className="h-full flex flex-col pt-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-['Outfit']">Analysis Results</h2>
          <p className="text-sm text-zinc-400 mt-1">Detailed AI-driven breakdown of your fit.</p>
        </div>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface border border-surfaceBorder hover:bg-surfaceHover hover:border-zinc-600 text-white text-sm font-medium transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Scan</span>
        </button>
      </div>

      <div className="bento-grid flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
        
        {/* Score Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bento-item flex flex-col items-center justify-center text-center group"
        >
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Match Score</span>
          </div>
          <div className="relative w-40 h-40 flex items-center justify-center mt-6">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="80" cy="80" r="60" 
                className="stroke-surfaceBorder/80" strokeWidth="12" fill="none"
              />
              <motion.circle 
                cx="80" cy="80" r="60"
                className={`${ringColor} transition-all duration-1000 ease-out`}
                strokeWidth="12" fill="none" strokeLinecap="round"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - ((scoreValue / 100) * circumference) }}
                style={{ strokeDasharray: circumference, filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            </svg>
            <div className="flex flex-col items-center justify-center z-10">
              <span className={`text-5xl font-black tracking-tight ${scoreColor} font-['Outfit']`}>
                {scoreValue}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Summary Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bento-item bento-item-wide group"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceBorder/50 pb-4">
            <Target className="w-5 h-5 text-accent-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white tracking-wide font-['Outfit']">Executive Summary</h3>
          </div>
          <p className="text-base leading-relaxed text-zinc-300">
            {summary || (
             match_score >= 80 ? "Excellent fit! You have most of the required skills for this role. Your experience aligns closely with the job description." : 
             match_score >= 50 ? "Good potential, but there are some notable gaps in your skillset. Focusing on these areas will improve your chances." : 
             "Significant gaps detected. Consider upskilling or targeting a different level role before applying."
            )}
          </p>
          <div className="mt-auto pt-6 flex gap-2">
             <span className="text-xs px-2 py-1 bg-surface border border-surfaceBorder rounded-md text-zinc-400">AI Generated</span>
             <span className="text-xs px-2 py-1 bg-surface border border-surfaceBorder rounded-md text-zinc-400">Gemini 1.5 Pro</span>
          </div>
        </motion.div>

        {/* Missing Skills Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bento-item group"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceBorder/50 pb-4">
            <XCircle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white font-['Outfit']">Missing Skills</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            {missing_skills && missing_skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missing_skills.map((skill, i) => (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + (i * 0.05) }}
                    key={i} 
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-teal-500/5 rounded-xl border border-teal-500/10">
                <CheckCircle2 className="w-8 h-8 text-teal-400 mb-2 opacity-80" />
                <span className="text-sm font-medium text-teal-200">No major missing skills detected!</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recommendations Bento Item */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bento-item bento-item-wide group"
        >
          <div className="flex items-center gap-2 mb-4 border-b border-surfaceBorder/50 pb-4">
            <Lightbulb className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-semibold text-white font-['Outfit']">Actionable Recommendations</h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            {recommendations && recommendations.length > 0 ? (
              <ul className="space-y-4">
                {recommendations.map((rec, i) => (
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                    key={i} 
                    className="flex gap-4 text-sm text-zinc-300 bg-surface/30 p-3 rounded-xl border border-surfaceBorder/50 hover:border-surfaceBorder hover:bg-surface/50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-surface border border-surfaceBorder flex items-center justify-center text-xs font-bold text-zinc-400 shadow-inner">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed pt-1">{rec}</span>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-zinc-500">No specific recommendations at this time.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
