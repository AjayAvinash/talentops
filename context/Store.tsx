import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Job, Activity } from '../types';
import { MOCK_CANDIDATES, MOCK_JOBS, MOCK_ACTIVITIES } from '../constants';

interface AppContextType {
  candidates: Candidate[];
  jobs: Job[];
  activities: Activity[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'addedAt' | 'fitScore'>) => void;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;
  deleteCandidate: (id: string) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'candidatesCount' | 'stages'>) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate initial fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setCandidates(MOCK_CANDIDATES);
      setJobs(MOCK_JOBS);
      setActivities(MOCK_ACTIVITIES);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const addCandidate = (newCandidateData: Omit<Candidate, 'id' | 'addedAt' | 'fitScore'>) => {
    const newCandidate: Candidate = {
      ...newCandidateData,
      id: `c${Date.now()}`,
      addedAt: new Date().toISOString(),
      fitScore: Math.floor(Math.random() * (98 - 70) + 70), // Random fit score for demo
    };
    setCandidates((prev) => [newCandidate, ...prev]);
    
    // Add activity
    const newActivity: Activity = {
      id: `a${Date.now()}`,
      type: 'upload',
      title: 'New Candidate',
      description: `${newCandidate.name} was added manually`,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
     // Add activity
     const candidate = candidates.find(c => c.id === id);
     if(candidate) {
       const newActivity: Activity = {
         id: `a${Date.now()}`,
         type: 'stage_change',
         title: 'Status Updated',
         description: `${candidate.name} moved to ${status}`,
         timestamp: new Date().toISOString(),
       };
       setActivities(prev => [newActivity, ...prev]);
     }
  };

  const deleteCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const addJob = (newJobData: Omit<Job, 'id' | 'createdAt' | 'candidatesCount' | 'stages'>) => {
    const newJob: Job = {
      ...newJobData,
      id: `j${Date.now()}`,
      createdAt: new Date().toISOString(),
      candidatesCount: 0,
      stages: {
        Applied: [], Screening: [], Technical: [], Manager: [], Offer: [], Hired: [], Rejected: []
      }
    };
    setJobs(prev => [newJob, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        candidates,
        jobs,
        activities,
        addCandidate,
        updateCandidateStatus,
        deleteCandidate,
        addJob,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
