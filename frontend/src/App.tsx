import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Briefcase, ChevronRight, Search, CheckCircle2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import JobSelector from './components/JobSelector';
import ProcessingLoader from './components/ProcessingLoader';
import AnalysisDashboard from './components/AnalysisDashboard';
import type { AnalysisResult, JobMatch, JobResponse } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [resumeId, setResumeId] = useState<number | null>(() => Number(localStorage.getItem('nexus_resume_id')) || null);
  const [resumeName, setResumeName] = useState<string | null>(() => localStorage.getItem('nexus_resume_name'));
  const [jobId, setJobId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [topJobs, setTopJobs] = useState<JobMatch[]>([]);
  const [customJd, setCustomJd] = useState('');

  useEffect(() => {
    if (resumeId) { localStorage.setItem('nexus_resume_id', String(resumeId)); if (resumeName) localStorage.setItem('nexus_resume_name', resumeName); }
    else { localStorage.removeItem('nexus_resume_id'); localStorage.removeItem('nexus_resume_name'); setTopJobs([]); setJobId(null); setResults(null); setResumeName(null); }
  }, [resumeId, resumeName]);

  const handleMatch = async (targetJobId: number, precalculatedScore?: number) => {
    if (!resumeId) return;
    setLoading(true); setLoadingMsg('Analyzing skill gaps for this role...');
    try { const response = await fetch(`${API_URL}/api/resumes/match?resume_id=${resumeId}&job_id=${targetJobId}`, { method: 'POST' }); if (!response.ok) throw new Error('Match failed'); const data = await response.json() as AnalysisResult; if (precalculatedScore !== undefined) data.match_score = precalculatedScore; setResults(data); } catch { window.alert('Analysis failed. Please check the backend server.'); } finally { setLoading(false); }
  };

  const handleFindJobs = async () => {
    if (!resumeId) return; setLoading(true); setLoadingMsg('Extracting keywords and searching job boards...');
    try { const response = await fetch(`${API_URL}/api/resumes/${resumeId}/analyze-and-fetch`, { method: 'POST' }); if (!response.ok) throw new Error('Job search failed'); const data = await response.json() as JobResponse; setTopJobs(data.matches || []); if (data.matches?.[0]) { setJobId(data.matches[0].job_id); void handleMatch(data.matches[0].job_id, data.matches[0].match_score); } else setLoading(false); } catch { setLoading(false); window.alert('Job search failed. Please check the backend server.'); }
  };

  const handleCustomJdMatch = async () => {
    if (!resumeId || !customJd.trim()) return; setLoading(true); setLoadingMsg('Analyzing your custom job description...');
    try { const response = await fetch(`${API_URL}/api/resumes/${resumeId}/match_custom`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Custom Target Job', company: 'Custom Target Company', jd_text: customJd }) }); if (!response.ok) throw new Error('Custom match failed'); const data = await response.json() as JobResponse; setTopJobs(data.matches || []); if (data.matches?.[0]) { setJobId(data.matches[0].job_id); void handleMatch(data.matches[0].job_id, data.matches[0].match_score); } else setLoading(false); } catch { setLoading(false); window.alert('Custom job analysis failed.'); }
  };

  return <div className="relative min-h-screen overflow-hidden bg-background font-sans text-zinc-300"><div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-primary-950/30 via-background to-teal-950/20" /><nav className="relative z-10 border-b border-surfaceBorder bg-background/50 backdrop-blur-md"><div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-accent-500 to-teal-400 p-[1px]"><div className="w-full h-full rounded-xl bg-surface flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary-400" /></div></div><span className="text-2xl font-bold tracking-tight text-white">Nexus<span className="font-light text-zinc-400">Match</span></span></div><span className="text-xs font-medium px-3 py-1 rounded-full bg-surface border border-surfaceBorder text-zinc-400">v3.0 AI Feed</span></div></nav>
    <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-8"><aside className="w-full md:w-80 flex-shrink-0 flex flex-col h-full"><div className="flex items-center gap-2 mb-4 px-1"><Briefcase className="w-5 h-5 text-primary-400" /><h2 className="text-sm font-semibold tracking-wider text-zinc-100 uppercase">Top matches</h2></div><div className="flex-1 glass-panel p-4 overflow-hidden"><JobSelector externalJobs={topJobs} selectedJobId={jobId} onSelectJob={(id) => { setJobId(id); setResults(null); void handleMatch(id); }} /></div></aside>
      <section className="flex-1 h-full flex flex-col"><AnimatePresence mode="wait">{results ? <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full"><AnalysisDashboard results={results} onReset={() => setResults(null)} /></motion.div> : loading ? <motion.div key="loading" className="h-full flex items-center justify-center"><ProcessingLoader message={loadingMsg} /></motion.div> : <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col justify-center max-w-2xl mx-auto w-full"><div className="text-center mb-12"><div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-6"><Sparkles className="w-4 h-4" />AI-powered matching engine</div><h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-4 leading-tight">Discover <span className="gradient-text">your best fit</span></h1><p className="text-lg text-zinc-400 max-w-xl mx-auto font-light">Upload your resume and let our intelligent engine find your strongest matches.</p></div><div className="glass-panel p-8 mb-8">{resumeId ? <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-primary-500/30 rounded-xl bg-primary-500/5"><CheckCircle2 className="w-10 h-10 text-primary-400 mb-3" /><h3 className="text-lg font-semibold text-white">Active resume</h3><p className="text-sm text-zinc-400 mb-4">{resumeName || 'Your profile is ready for analysis.'}</p><button type="button" onClick={() => setResumeId(null)} className="text-xs font-medium px-4 py-2 rounded-full bg-surface border border-surfaceBorder text-zinc-300">Upload a different resume</button></div> : <FileUpload resumeId={resumeId} onUploadComplete={(id, name) => { setResumeId(id); setResumeName(name || null); setResults(null); setTopJobs([]); setJobId(null); }} />}</div><div className="flex justify-center mb-8"><button type="button" onClick={() => void handleFindJobs()} disabled={!resumeId} className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-white bg-primary-600 disabled:bg-surface disabled:text-zinc-500"><Search className="w-5 h-5" />Auto-find jobs from the internet<ChevronRight className="w-5 h-5" /></button></div><div className="relative flex items-center py-5"><div className="flex-grow border-t border-surfaceBorder" /><span className="mx-4 text-zinc-500 text-sm font-medium tracking-widest">OR TARGET A SPECIFIC ROLE</span><div className="flex-grow border-t border-surfaceBorder" /></div><div className="glass-panel p-6 mt-2"><p className="text-sm text-zinc-400 mb-3 font-medium">Paste a specific job description</p><textarea className="w-full h-32 bg-surface border border-surfaceBorder rounded-lg p-3 text-sm text-zinc-300 resize-none mb-3" placeholder="Paste job description text here..." value={customJd} onChange={(event) => setCustomJd(event.target.value)} /><button type="button" onClick={() => void handleCustomJdMatch()} disabled={!resumeId || !customJd.trim()} className="w-full py-3 rounded-lg font-semibold bg-zinc-100 text-zinc-900 disabled:bg-surface disabled:text-zinc-500">Analyze custom job</button></div></motion.div>}</AnimatePresence></section></main></div>;
}
