import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { Plus, MoreHorizontal, Users, Search } from 'lucide-react';
import { CreateJobModal } from '../components/jobs/CreateJobModal';

export const Jobs: React.FC = () => {
  const { jobs: allJobs } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filteredJobs, setFilteredJobs] = useState(allJobs);
  const [isSearching, setIsSearching] = useState(false);

  // Update filtered jobs when allJobs changes
  React.useEffect(() => {
    if (!search) {
      setFilteredJobs(allJobs);
    }
  }, [allJobs, search]);

  // Debounced search with vector search
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!search.trim()) {
        setFilteredJobs(allJobs);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { jobService } = await import('../services/jobService');
        const results = await jobService.search(search);
        setFilteredJobs(results);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to client-side filtering
        const filtered = allJobs.filter(j => 
          j.title.toLowerCase().includes(search.toLowerCase()) ||
          j.department.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredJobs(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, allJobs]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage job openings and hiring pipelines.</p>
        </div>
        <Button icon={<Plus size={18} />} onClick={() => setIsCreateModalOpen(true)}>Create Job</Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search jobs (e.g. 'software engineering role in product team')..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
         </div>
         <div className="flex items-center gap-2">
             {/* Placeholders for sorting/filtering if needed later */}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map(job => (
          <Link to={`/jobs/${job.id}`} key={job.id} className="block group h-full">
            <Card className="h-full hover:border-emerald-500/50 hover:shadow-lg transition-all duration-200 flex flex-col relative overflow-hidden">
               {/* Decorative top border for open jobs */}
               {job.status === 'Open' && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
              
              <div className="flex justify-between items-start mb-4">
                <div className="pr-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{job.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mt-1">{job.department}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 -mr-2 rounded-md hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                 <Badge variant={getStatusBadgeVariant(job.status)} className="px-2.5 py-0.5">{job.status}</Badge>
                 <span className="text-xs font-medium text-gray-500 flex items-center bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                    <Users size={12} className="mr-1.5"/> {job.candidatesCount} candidates
                 </span>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-50 space-y-3">
                 <div className="flex justify-between text-sm items-center">
                   <span className="text-gray-500 text-xs uppercase tracking-wide font-medium">Progress</span>
                   <span className="font-semibold text-gray-900">{job.openings} Openings</span>
                 </div>
                 <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-1/3 rounded-full"></div>
                 </div>
                 <div className="flex justify-between text-xs text-gray-400 pt-1">
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </Card>
          </Link>
        ))}
        {filteredJobs.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                    <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">No jobs found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or create a new job.</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setIsCreateModalOpen(true)}>Create Job</Button>
            </div>
        )}
      </div>

      <CreateJobModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </div>
  );
};