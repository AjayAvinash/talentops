export type Status = 'Applied' | 'Screening' | 'Technical' | 'Manager' | 'Offer' | 'Hired' | 'Rejected';

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
}

export interface Job {
  id: string;
  title: string;
  department: string;
  openings: number;
  candidatesCount: number;
  status: 'Open' | 'Closed' | 'On Hold';
  createdAt: string;
  stages: Record<Status, string[]>; // candidate IDs per stage
}

export interface Activity {
  id: string;
  type: 'upload' | 'assignment' | 'stage_change' | 'rating' | 'note';
  title: string;
  description: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalCandidates: number;
  newCandidates: number; // last 7 days
  activeJobs: number;
  avgTimeToHire: number; // days
}
