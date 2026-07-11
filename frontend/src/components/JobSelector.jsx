import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Zap, ExternalLink } from 'lucide-react';

export default function JobSelector({ selectedJobId, onSelectJob, externalJobs = [] }) {
  const jobs = externalJobs;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mt-2">
        {jobs.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl border border-surfaceBorder border-dashed bg-surface/20">
            <div className="w-14 h-14 rounded-xl bg-surface mx-auto flex items-center justify-center mb-4 shadow-lg">
              <Search className="w-6 h-6 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400 mb-1">No matches yet</p>
            <p className="text-xs text-zinc-500">Upload resume to scan live jobs</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {jobs.map((job, idx) => {
              const isSelected = selectedJobId === job.job_id;
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={job.job_id} 
                  className={`
                    relative p-4 rounded-2xl border transition-all duration-300 group flex flex-col overflow-hidden
                    ${isSelected 
                      ? 'border-primary-500/50 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]' 
                      : 'border-surfaceBorder bg-surface/40 hover:border-zinc-500 hover:bg-surface/80'}
                  `}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-transparent pointer-events-none"></div>
                  )}
                  {isSelected && (
                    <motion.div layoutId="active-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400" />
                  )}
                  <div className="cursor-pointer flex-1 relative z-10" onClick={() => onSelectJob(job.job_id)}>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h3 className={`font-bold text-base leading-tight ${isSelected ? 'text-white' : 'text-zinc-200 group-hover:text-white transition-colors'}`}>
                        {job.title}
                      </h3>
                      {job.match_score >= 80 && (
                        <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]" />
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium bg-surface px-2 py-1 rounded-md border border-surfaceBorder/50">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="truncate max-w-[120px]">{job.company}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${job.match_score >= 80 ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30' : 'bg-surface border border-surfaceBorder text-zinc-400'}`}>
                        {job.match_score}% Match
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                      {job.short_description || "No description available."}
                    </p>
                  </div>
                  
                  <div className="pt-3 flex items-center justify-between mt-auto relative z-10">
                    {job.url && (
                      <a 
                        href={job.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1.5 transition-colors group/link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Apply <ExternalLink className="w-3 h-3 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                    <button 
                      onClick={() => onSelectJob(job.job_id)}
                      className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all duration-300 ml-auto ${isSelected ? 'bg-primary-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-surface border border-surfaceBorder text-zinc-300 hover:bg-surfaceHover hover:border-zinc-500'}`}
                    >
                      {isSelected ? 'Analyzing' : 'Analyze'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
