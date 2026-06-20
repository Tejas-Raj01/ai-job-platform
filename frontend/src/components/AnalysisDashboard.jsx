import React from 'react';

export default function AnalysisDashboard({ results, onReset }) {
  const { match_score, missing_skills } = results;
  
  // Parse missing skills if it's a string
  const skillsList = typeof missing_skills === 'string' ? JSON.parse(missing_skills) : missing_skills;
  
  // Determine color based on score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="glass-panel p-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Match Results</h2>
        <div className="relative inline-flex items-center justify-center mt-6">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
            <circle 
              cx="64" cy="64" r="60" 
              stroke="currentColor" 
              strokeWidth="8" 
              fill="transparent" 
              strokeDasharray={377} 
              strokeDashoffset={377 - (377 * match_score) / 100} 
              className={`${getScoreColor(match_score)} transition-all duration-1000 ease-out`} 
            />
          </svg>
          <span className={`absolute text-4xl font-black ${getScoreColor(match_score)}`}>{match_score}%</span>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          Actionable Gap Analysis
        </h3>
        
        {skillsList && skillsList.length > 0 ? (
          <ul className="space-y-3">
            {skillsList.map((skill, index) => (
              <li key={index} className="flex items-start bg-slate-800/80 p-3 rounded-lg border border-slate-700/30">
                <span className="text-red-400 mr-3 mt-0.5">⊗</span>
                <span className="text-slate-300 text-sm">{skill}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 italic">No missing skills detected. You're a great fit!</p>
        )}
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={onReset}
          className="px-6 py-2 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
        >
          Analyze Another Match
        </button>
      </div>
    </div>
  );
}
