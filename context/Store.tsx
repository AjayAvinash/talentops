import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Candidate, Job, Activity } from '../types';
import { candidateService } from '../services/candidateService';
import { jobService } from '../services/jobService';
import { timelineService } from '../services/timelineService';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

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
  const { addToast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Track IDs added via this client to avoid duplicate toasts
  const recentlyAddedIds = useRef<Set<string>>(new Set());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedCandidates, fetchedJobs] = await Promise.all([
        candidateService.getAll(),
        jobService.getAll()
      ]);
      setCandidates(fetchedCandidates);
      setJobs(fetchedJobs);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up realtime subscription for new candidates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'candidates'
        },
        async (payload) => {
          const newCandidate = payload.new as Candidate;

          // If we didn't add this ourselves just now, show a toast
          if (!recentlyAddedIds.current.has(newCandidate.id)) {
            addToast(`New candidate added: ${newCandidate.name}`, 'success');

            // Immediately update local state to include the new candidate
            // (We might want to re-fetch or just append if payload is complete)
            setCandidates(prev => {
              if (prev.some(c => c.id === newCandidate.id)) return prev;
              return [newCandidate, ...prev];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addToast]);

  const addCandidate = async (newCandidateData: Omit<Candidate, 'id' | 'addedAt' | 'fitScore'>, source: 'manual' | 'upload' = 'manual') => {
    try {
      const created = await candidateService.create(newCandidateData);

      // Mark as recently added so realtime listener ignores it
      recentlyAddedIds.current.add(created.id);
      setTimeout(() => recentlyAddedIds.current.delete(created.id), 5000);

      setCandidates((prev) => {
        const index = prev.findIndex(c => c.id === created.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = created;
          return updated;
        }
        return [created, ...prev];
      });

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
      addToast('Error adding candidate', 'error');
      return undefined;
    }
  };

  const updateCandidateStatus = async (id: string, status: Candidate['status']) => {
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
      addToast('Error deleting candidate', 'error');
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
      addToast('Error adding job', 'error');
    }
  };

  const deleteJob = async (id: string) => {
    try {
      await jobService.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (e) {
      console.error(e);
      addToast('Error deleting job', 'error');
    }
  };

  const updateJobStatus = async (id: string, status: Job['status']) => {
    try {
      await jobService.updateStatus(id, status);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (e) {
      console.error(e);
      addToast('Error updating job status', 'error');
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

