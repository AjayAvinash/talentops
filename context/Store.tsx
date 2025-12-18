import React, { createContext, useContext, useState, useEffect } from 'react';
import { Candidate, Job, Activity } from '../types';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
import { timelineService } from '../services/timelineService';

interface AppContextType {
  candidates: Candidate[];
  jobs: Job[];
  activities: Activity[];
  addCandidate: (candidate: Omit<Candidate, 'id' | 'addedAt' | 'fitScore'>, source?: 'manual' | 'upload') => Promise<Candidate | undefined>;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;
  deleteCandidate: (id: string) => void;
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'candidatesCount' | 'stages'>) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: Job['status']) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedCandidates, fetchedJobs] = await Promise.all([
        candidateService.getAll(),
        jobService.getAll()
      ]);
      setCandidates(fetchedCandidates);
      setJobs(fetchedJobs);
      // Future: Fetch timeline/activities. For now empty or we could fetch recent global events if API supported it.
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addCandidate = async (newCandidateData: Omit<Candidate, 'id' | 'addedAt' | 'fitScore'>, source: 'manual' | 'upload' = 'manual') => {
    try {
      // Check if candidate exists locally first (by email or phone if possible, but upsert returns the final object)
      const created = await candidateService.create(newCandidateData);

      setCandidates((prev) => {
        const index = prev.findIndex(c => c.id === created.id);
        if (index !== -1) {
          // Update existing
          const updated = [...prev];
          updated[index] = created;
          return updated;
        }
        // Add new
        return [created, ...prev];
      });

      // Add timeline event only if it's a "New" addition (or if we want to track updates too)
      // For now, let's fix the "double event" and "manual" vs "upload" distinction.
      // If the candidate was just created (id was not in prev), add "New Candidate" event.
      // However, the user says they get it twice. If N8N or something else adds one, we might not need this.
      // But let's at least make it accurate.

      const isNew = !candidates.some(c => c.id === created.id);
      if (isNew) {
        await timelineService.create({
          candidateId: created.id,
          type: source === 'upload' ? 'upload' : 'manual',
          title: 'New Candidate',
          description: `${created.name} was added ${source === 'upload' ? 'via resume upload' : 'manually'}`
        });
      }

      return created;
    } catch (e) {
      console.error(e);
      alert('Error adding candidate');
      return undefined;
    }
  };

  const updateCandidateStatus = async (id: string, status: Candidate['status']) => {
    // Optimistic update for UI
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

  const deleteCandidate = async (id: string) => {
    try {
      await candidateService.delete(id);
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      console.error(e);
      alert('Error deleting candidate');
    }
  };

  const addJob = async (newJobData: Omit<Job, 'id' | 'createdAt' | 'candidatesCount' | 'stages'>) => {
    try {
      const created = await jobService.create({
        ...newJobData,
        status: 'Open'
      });
      setJobs(prev => [created, ...prev]);
    } catch (e) {
      console.error(e);
      alert('Error adding job');
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await jobService.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
      alert('Error deleting job');
    }
  };

  const updateJobStatus = async (id: string, status: Job['status']) => {
    try {
      await jobService.updateStatus(id, status);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (e) {
      console.error(e);
      alert('Error updating job status');
    }
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
        deleteJob,
        updateJobStatus,
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
