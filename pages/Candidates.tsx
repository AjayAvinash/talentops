import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
// import { Drawer } from '../components/ui/Drawer';
import { Avatar } from '../components/ui/Avatar';
import { UploadCandidateModal } from '../components/candidates/UploadCandidateModal';
import { CandidateDrawer } from '../components/candidates/CandidateDrawer';
import {
  Search, Plus, Filter, MoreHorizontal, Download,
  MapPin, Mail, Phone, Linkedin, Calendar, CheckSquare,
  Briefcase, GraduationCap, Globe, Edit2, Share2, Star, X, SlidersHorizontal, UploadCloud
} from 'lucide-react';
import { Candidate } from '../types';

export const Candidates: React.FC = () => {
  const { candidates: allCandidates, updateCandidateStatus, deleteCandidate } = useApp();
  const [search, setSearch] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(allCandidates);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline'>('profile');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [timelineActivities, setTimelineActivities] = useState<any[]>([]);

  // Fetch timeline when tab changes or candidate selected
  React.useEffect(() => {
    if (selectedCandidate && activeTab === 'timeline') {
      const loadTimeline = async () => {
        const { timelineService } = await import('../services/timelineService');
        try {
          const data = await timelineService.getForCandidate(selectedCandidate.id);
          setTimelineActivities(data);
        } catch (error) {
          console.error('Failed to load timeline', error);
        }
      };
      loadTimeline();
    }
  }, [selectedCandidate, activeTab]);

  // Update filtered candidates when allCandidates changes (e.g., new candidate added)
  React.useEffect(() => {
    if (!search) {
      setFilteredCandidates(allCandidates);
    }
  }, [allCandidates, search]);

  // Debounced search with vector search
  React.useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!search.trim()) {
        setFilteredCandidates(allCandidates);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { candidateService } = await import('../services/candidateService');
        const results = await candidateService.search(search);
        setFilteredCandidates(results);
      } catch (error) {
        console.error('Search error:', error);
        // Fallback to client-side filtering
        const filtered = allCandidates.filter(c =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.role.toLowerCase().includes(search.toLowerCase()) ||
          c.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
        );
        setFilteredCandidates(filtered);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [search, allCandidates]);

  // Select All Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCandidates.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const allSelected = filteredCandidates.length > 0 && selectedIds.size === filteredCandidates.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < filteredCandidates.length;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage your talent pool.</p>
          </div>
          <Button icon={<UploadCloud size={18} />} onClick={() => setIsUploadModalOpen(true)}>Upload Candidate</Button>
        </div>

        {/* Prominent Search Bar Area */}
        <div className="relative group max-w-3xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search by name, role, skills (e.g. 'experienced React developer with TypeScript')..."
            className="
                block w-full pl-12 pr-4 py-3.5 
                bg-white border border-gray-300 rounded-xl 
                text-gray-900 placeholder-gray-400 text-base font-medium
                shadow-sm transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500
                hover:border-gray-400 hover:shadow-md
              "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-12 flex items-center">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="absolute inset-y-0 right-2 flex items-center">
            <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" title="Advanced Filters">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card padding="none" className="flex-1 overflow-hidden border-2 border-gray-300 shadow-sm mt-2">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-b border-gray-300">
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wide">
                <th className="p-4 w-12 pl-6">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer transition-transform active:scale-95"
                    checked={allSelected}
                    ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-4">Candidate</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Skills</th>
                <th className="p-4 text-right">Exp</th>
                {search && <th className="p-4 text-right">Fit</th>}
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCandidates.map(candidate => (
                <tr
                  key={candidate.id}
                  className={`
                    transition-colors cursor-pointer group
                    ${selectedIds.has(candidate.id) ? 'bg-emerald-50/30' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <td className="p-4 pl-6" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                      checked={selectedIds.has(candidate.id)}
                      onChange={() => handleSelectOne(candidate.id)}
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={candidate.name} size="md" className="text-sm font-bold" />
                      <div>
                        {/* Updated styling: same as Role text (medium/gray-700 style) per request, but keeping it distinct enough */}
                        <span className="block font-medium text-gray-900 text-sm">{candidate.name}</span>
                        {/* Email removed from here as per request for separate column */}
                        {/* <span className="block text-sm text-gray-500 mt-0.5">{candidate.email}</span> */}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{candidate.email}</td>
                  <td className="p-4 text-sm text-gray-700 font-medium">{candidate.role}</td>
                  <td className="p-4">
                    <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {(candidate.skills ?? []).slice(0, 3).map(skill => (
                        <span key={skill} className="text-xs font-medium bg-gray-50 text-gray-700 px-2.5 py-1 rounded border border-gray-200">{skill}</span>
                      ))}
                      {(candidate.skills?.length ?? 0) > 3 && (
                        <span className="text-xs text-gray-500 pl-1 font-medium">+{(candidate.skills?.length ?? 0) - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right text-sm text-gray-900 font-medium">{candidate.experience}y</td>
                  {search && (
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${candidate.fitScore}%` }}></div>
                        </div>
                        <span className="text-sm font-bold text-emerald-700">{candidate.fitScore}%</span>
                      </div>
                    </td>
                  )}
                  <td className="p-4 text-right relative pr-6">
                    <button className="text-gray-400 hover:text-gray-700 p-2 rounded-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-24 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-4 rounded-full mb-4 border border-gray-100">
                        <Search size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-900 font-medium text-lg">No candidates found</p>
                      <p className="text-sm mt-1 text-gray-500 max-w-sm mx-auto">We couldn't find anyone matching "{search}". Try adjusting your search terms or filters.</p>
                      <Button variant="secondary" className="mt-6" onClick={() => setSearch('')}>Clear Search</Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Improved Candidate Drawer */}
      <CandidateDrawer
        isOpen={!!selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        onDelete={(id) => {
          deleteCandidate(id);
          setSelectedCandidate(null);
        }}
      />

      <UploadCandidateModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
};