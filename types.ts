export type Status = 'New' | 'Screening' | 'Technical' | 'Assignment' | 'Final HR' | 'Offer' | 'Rejected' | 'Archived';

export type JobStatus = 'Open' | 'Closed' | 'On Hold';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  skills: string[];
  experience: number;
  status: Status;
  fitScore: number;
  addedAt: string;
  linkedIn?: string;
  location?: string;
  resumeUrl?: string; // New field from DB
  resumeText?: string; // New field from DB
  updatedAt?: string; // New field from DB
}

export interface Job {
  id: string;
  title: string;
  department: string;
  openings: number;
  candidatesCount: number;
  status: JobStatus;
  location?: string;
  responsibilities?: string; // Mapped from roles_and_responsibilities
  required_skills?: string[]; // Mapped from skills_required (jsonb)
  description?: string; // New field from DB
  createdAt: string;
  stages: Record<Status, string[]>; // candidate IDs per stage
}

export interface JobCandidate {
  id: string;
  jobId: string;
  candidateId: string;
  status: Status;
  stageOrder: number;
  fitScore?: number;
  rating?: number;
  rejectedReason?: string;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'upload' | 'assignment' | 'stage_change' | 'rating' | 'note';
  title: string;
  description: string;
  timestamp: string;
  candidateId?: string;
  jobId?: string;
}

export interface DashboardMetrics {
  totalCandidates: number;
  newCandidates: number; // last 7 days
  activeJobs: number;
  avgTimeToHire: number; // days
}
