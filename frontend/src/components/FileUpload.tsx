import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, Loader2, X, Sparkles } from 'lucide-react';
import type { FileUploadProps, UploadResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function FileUpload({ onUploadComplete, resumeId }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      window.alert('Please upload a PDF file.');
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', '1');

    try {
      const response = await fetch(`${API_URL}/api/resumes/upload?user_id=1`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      });
      const data = (await response.json().catch(() => null)) as (UploadResponse & { message?: string }) | null;
      if (!response.ok || !data) throw new Error(data?.message || 'Upload failed');
      onUploadComplete(data.resume_id, data.filename);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      window.alert(`Upload failed: ${message}`);
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
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card bg-teal-500/5 border-teal-500/20 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <CheckCircle2 className="w-6 h-6 text-teal-400 flex-shrink-0" />
              <div className="truncate"><p className="text-base font-semibold text-teal-100 truncate">{file.name}</p><p className="text-xs text-teal-400/80 uppercase tracking-wider">Processed and ready</p></div>
            </div>
            <button type="button" aria-label="Remove file" onClick={removeFile} className="p-2.5 hover:bg-teal-500/20 rounded-full text-teal-400"><X className="w-5 h-5" /></button>
          </motion.div>
        ) : (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={`relative group flex flex-col items-center justify-center p-12 rounded-3xl transition-all duration-500 overflow-hidden cursor-pointer ${dragActive ? 'border-primary-400 bg-primary-500/10' : 'border-surfaceBorder bg-surface/40 hover:bg-surface/60'}`} style={{ border: `2px ${dragActive ? 'solid' : 'dashed'} ${dragActive ? '#60A5FA' : 'rgba(255,255,255,0.1)'}` }} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} onClick={() => !file && inputRef.current?.click()}>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleChange} />
              {!file ? (
                <>
                  <UploadCloud className={`w-8 h-8 mb-6 ${dragActive ? 'text-primary-400' : 'text-zinc-400'}`} />
                  <h3 className="text-xl font-semibold text-white mb-2">Upload your resume</h3>
                  <p className="text-sm text-zinc-400 mb-6 text-center max-w-sm">Drag and drop a PDF file here, or browse from your computer.</p>
                  <button type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }} className="px-6 py-2.5 rounded-full bg-surface border border-surfaceBorder text-sm font-medium text-white">Select PDF file</button>
                </>
              ) : (
                <div className="flex flex-col items-center w-full" onClick={(event) => event.stopPropagation()}>
                  <div className="flex items-center gap-4 glass-card px-5 py-4 w-full max-w-sm mb-6"><FileText className="w-6 h-6 text-primary-400" /><span className="text-sm font-medium text-zinc-200 truncate flex-1">{file.name}</span><button type="button" aria-label="Remove selected file" onClick={removeFile}><X className="w-4 h-4" /></button></div>
                  <button type="button" onClick={handleUpload} disabled={uploading} className="w-full max-w-sm flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3.5 rounded-xl font-semibold disabled:opacity-50">{uploading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing PDF...</> : <>Confirm and process <Sparkles className="w-4 h-4" /></>}</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
