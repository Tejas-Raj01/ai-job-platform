import React, { useState } from 'react';

export default function FileUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Hardcoded user_id=1 for demo
      const response = await fetch('http://localhost:8000/api/resumes/upload?user_id=1', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onUploadComplete(data.resume_id);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
      <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
      <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
        Select PDF
        <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
      </label>
      {file && <p className="mt-3 text-sm text-slate-300">{file.name}</p>}
      
      {file && (
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 w-full bg-brand-600 hover:bg-brand-500 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Confirm Upload'}
        </button>
      )}
    </div>
  );
}
