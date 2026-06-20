import React, { useState, useEffect } from 'react';

export default function JobSelector({ selectedJobId, onSelectJob }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs/');
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerScrape = async () => {
    try {
      await fetch('http://localhost:8000/api/jobs/scrape', { method: 'POST' });
      alert("Scraping started! Refresh after a few seconds.");
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <div className="text-slate-400 flex items-center"><div className="animate-spin w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full mr-2"></div>Loading jobs...</div>;

  return (
    <div className="flex flex-col h-full">
      {jobs.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-slate-400 text-sm mb-4">No jobs found in database.</p>
          <button onClick={triggerScrape} className="text-brand-400 text-sm hover:underline">
            Trigger Async Scraper
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {jobs.map((job) => (
            <div 
              key={job.id} 
              onClick={() => onSelectJob(job.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedJobId === job.id 
                  ? 'border-brand-500 bg-brand-500/10' 
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              <h3 className="font-semibold text-slate-200">{job.title}</h3>
              <p className="text-xs text-slate-400">{job.company}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
