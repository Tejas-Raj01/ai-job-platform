import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FileUpload({ onUploadComplete, resumeId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/resumes/upload?user_id=1`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      onUploadComplete(data.resume_id, data.filename);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Is the backend running?");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    onUploadComplete(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {resumeId && file ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card bg-teal-500/5 border-teal-500/20 p-5 flex items-center justify-between"
            >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                <CheckCircle2 className="w-6 h-6 text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              </div>
              <div className="truncate">
                <p className="text-base font-semibold text-teal-100 truncate">{file.name}</p>
                <p className="text-xs text-teal-400/80 uppercase tracking-wider mt-0.5">Processed & Ready</p>
              </div>
            </div>
            <button 
              onClick={removeFile}
              className="p-2.5 hover:bg-teal-500/20 rounded-full transition-colors text-teal-400 hover:text-teal-300"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className={`
                relative group flex flex-col items-center justify-center p-12 rounded-3xl transition-all duration-500 overflow-hidden cursor-pointer
                ${dragActive 
                  ? 'border-primary-400 bg-primary-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)]' 
                  : file ? 'border-surfaceBorder bg-surface/80' : 'border-surfaceBorder bg-surface/40 hover:bg-surface/60'}
              `}
              style={{
                border: `2px ${dragActive ? 'solid' : 'dashed'} ${dragActive ? '#60A5FA' : 'rgba(255,255,255,0.1)'}`
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface/20 pointer-events-none"></div>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleChange}
              />
              
              {!file ? (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-surface border border-surfaceBorder flex items-center justify-center group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 shadow-xl">
                      <UploadCloud className={`w-8 h-8 ${dragActive ? 'text-primary-400' : 'text-zinc-400 group-hover:text-primary-400'} transition-colors duration-300`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 font-['Outfit']">Upload your Resume</h3>
                  <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">
                    Drag and drop your PDF file here, or click to browse from your computer.
                  </p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="px-6 py-2.5 rounded-full bg-surface border border-surfaceBorder hover:border-primary-500/50 hover:bg-primary-500/10 text-sm font-medium text-white transition-all duration-300 relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">Select PDF File</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600/0 via-primary-600/20 to-primary-600/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center w-full relative z-10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4 glass-card px-5 py-4 w-full max-w-sm mb-6">
                    <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20">
                      <FileText className="w-6 h-6 text-primary-400 flex-shrink-0" />
                    </div>
                    <span className="text-sm font-medium text-zinc-200 truncate flex-1">{file.name}</span>
                    <button onClick={removeFile} className="p-1.5 rounded-md hover:bg-red-500/20 text-zinc-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button 
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full max-w-sm relative group overflow-hidden flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-500 hover:to-accent-500 text-white py-3.5 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]"
                  >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      {uploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing PDF...
                        </>
                      ) : (
                        <>
                          Confirm & Process
                          <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </>
                      )}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
