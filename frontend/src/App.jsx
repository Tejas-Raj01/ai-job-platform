import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import JobSelector from './components/JobSelector';
import ProcessingLoader from './components/ProcessingLoader';
import AnalysisDashboard from './components/AnalysisDashboard';

function App() {
  const [resumeId, setResumeId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleMatch = async () => {
    if (!resumeId || !jobId) return;
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/resumes/match?resume_id=${resumeId}&job_id=${jobId}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Match failed');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-50 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      
      <main className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            AI <span className="gradient-text">Job Matcher</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload your resume, select a job, and let our AI engine analyze your fit and discover missing skills.
          </p>
        </header>

        {results ? (
          <AnalysisDashboard results={results} onReset={() => setResults(null)} />
        ) : loading ? (
          <ProcessingLoader />
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-panel p-6 hover:shadow-brand-500/10 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">1. Upload Resume</h2>
              <FileUpload onUploadComplete={setResumeId} />
              {resumeId && <div className="mt-4 text-green-400 text-sm flex items-center"><span className="mr-2">✓</span> Resume ready</div>}
            </div>
            
            <div className="glass-panel p-6 hover:shadow-brand-500/10 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">2. Select Target Job</h2>
              <JobSelector onSelectJob={setJobId} selectedJobId={jobId} />
            </div>
          </div>
        )}

        {!results && !loading && (
          <div className="mt-12 text-center">
            <button 
              onClick={handleMatch}
              disabled={!resumeId || !jobId}
              className={`px-8 py-3 rounded-full font-bold text-white transition-all duration-300 transform ${
                resumeId && jobId 
                  ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/25' 
                  : 'bg-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              Analyze Match
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
