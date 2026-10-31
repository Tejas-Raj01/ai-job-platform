export interface JobMatch {
  job_id: number;
  title: string;
  company: string;
  match_score: number;
  url?: string;
  short_description?: string;
}

export interface AnalysisResult {
  analysis_id?: number;
  match_score: number;
  summary: string;
  missing_skills: string[];
  recommendations: string[];
}

export interface UploadResponse {
  resume_id: number;
  filename: string;
  message: string;
}

export interface JobResponse {
  matches: JobMatch[];
}

export interface FileUploadProps {
  resumeId: number | null;
  onUploadComplete: (id: number | null, name?: string) => void;
}

export interface JobSelectorProps {
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  externalJobs: JobMatch[];
}

export interface AnalysisDashboardProps {
  results: AnalysisResult;
  onReset: () => void;
}

export interface ProcessingLoaderProps {
  message: string;
}
