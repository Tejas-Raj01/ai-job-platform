import { motion } from 'framer-motion';
import { Building2, Search, Zap, ExternalLink } from 'lucide-react';
import type { JobSelectorProps } from '../types';

export default function JobSelector({ selectedJobId, onSelectJob, externalJobs }: JobSelectorProps) {
  return <div className="flex flex-col h-full overflow-hidden"><div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mt-2">
    {externalJobs.length === 0 ? <div className="text-center py-12 px-4 rounded-2xl border border-surfaceBorder border-dashed bg-surface/20"><Search className="w-6 h-6 text-zinc-500 mx-auto mb-4" /><p className="text-sm font-medium text-zinc-400 mb-1">No matches yet</p><p className="text-xs text-zinc-500">Upload a resume to scan live jobs</p></div> : <div className="flex flex-col gap-3">{externalJobs.map((job, index) => {
      const isSelected = selectedJobId === job.job_id;
      return <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} key={job.job_id} className={`relative p-4 rounded-2xl border transition-all group flex flex-col overflow-hidden ${isSelected ? 'border-primary-500/50 bg-primary-500/10' : 'border-surfaceBorder bg-surface/40 hover:border-zinc-500'}`}>
        <button type="button" className="text-left cursor-pointer flex-1 relative z-10" onClick={() => onSelectJob(job.job_id)}><div className="flex justify-between items-start mb-2 gap-2"><h3 className="font-bold text-base leading-tight text-zinc-200">{job.title}</h3>{job.match_score >= 80 && <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />}</div><div className="flex items-center justify-between mb-3"><span className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium bg-surface px-2 py-1 rounded-md"><Building2 className="w-3.5 h-3.5" />{job.company}</span><span className="text-xs font-bold px-2 py-1 rounded-md bg-primary-500/20 text-primary-300">{job.match_score}% Match</span></div><p className="text-xs text-zinc-400 line-clamp-2 mb-3">{job.short_description || 'No description available.'}</p></button>
        <div className="pt-3 flex items-center justify-between mt-auto relative z-10">{job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary-400 flex items-center gap-1.5" onClick={(event) => event.stopPropagation()}>Apply <ExternalLink className="w-3 h-3" /></a>}<button type="button" onClick={() => onSelectJob(job.job_id)} className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-zinc-300 ml-auto">{isSelected ? 'Analyzing' : 'Analyze'}</button></div>
      </motion.div>;
    })}</div>}
  </div></div>;
}
