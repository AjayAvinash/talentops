import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/Store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Candidates } from './pages/Candidates';
import { Jobs } from './pages/Jobs';
import { JobKanban } from './pages/JobKanban';
import { candidateService } from './services/candidateService';
import { jobService } from './services/jobService';

const App: React.FC = () => {
  useEffect(() => {
    // Self-healing: Check for and generate missing embeddings on app start
    const healEmbeddings = async () => {
      console.log('Starting background check for missing embeddings...');
      await Promise.allSettled([
        candidateService.generateMissingEmbeddings(),
        jobService.generateMissingEmbeddings()
      ]);
      console.log('Background check for embeddings completed.'); // Added self-healing log
    };

    healEmbeddings();
  }, []);
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobKanban />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
