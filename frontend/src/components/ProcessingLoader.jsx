import React from 'react';

export default function ProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-24 h-24">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-slate-700 border-t-brand-500 animate-spin"></div>
        {/* Inner pulsing circle */}
        <div className="absolute inset-2 rounded-full bg-brand-500/20 animate-pulse"></div>
        {/* Core icon */}
        <div className="absolute inset-0 flex items-center justify-center text-brand-400">
          <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
        </div>
      </div>
      <h3 className="mt-8 text-xl font-bold text-slate-200">Analyzing Match...</h3>
      <p className="mt-2 text-slate-400 max-w-sm text-center text-sm">
        Our AI is comparing your skills against the job description using vector embeddings.
      </p>
    </div>
  );
}
