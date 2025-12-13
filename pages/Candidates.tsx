import React, { useState } from 'react';
import { useApp } from '../context/Store';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge, getStatusBadgeVariant } from '../components/ui/Badge';
import { Drawer } from '../components/ui/Drawer';
import { Avatar } from '../components/ui/Avatar'; 
import { AddCandidateModal } from '../components/candidates/AddCandidateModal';
import { 
  Search, Plus, Filter, MoreHorizontal, Download, 
  MapPin, Mail, Phone, Linkedin, Calendar, CheckSquare,
  Briefcase, GraduationCap, Globe, Edit2, Share2, Star, X, SlidersHorizontal
} from 'lucide-react';
import { Candidate } from '../types';

export const Candidates: React.FC = () => {
  const { candidates: allCandidates, updateCandidateStatus, deleteCandidate } = useApp();
  const [search, setSearch] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>(allCandidates);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'timeline'>('profile');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
           <Button icon={<Plus size={18} />} onClick={() => setIsAddModalOpen(true)}>Add Candidate</Button>
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
                bg-white border border-gray-200 rounded-xl 
                text-gray-900 placeholder-gray-400 text-base font-medium
                shadow-sm transition-all duration-200
                focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500
                hover:border-gray-300 hover:shadow-md
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
      <Card padding="none" className="flex-1 overflow-hidden border-gray-200 shadow-sm mt-2">
        <div className="overflow-x-auto h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
              <tr className="border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wide">
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
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Skills</th>
                <th className="p-4 text-right">Exp</th>
                {search && <th className="p-4 text-right">Fit</th>}
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
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
                        <span className="block font-semibold text-gray-900 text-base">{candidate.name}</span>
                        <span className="block text-sm text-gray-500 mt-0.5">{candidate.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">{candidate.role}</td>
                  <td className="p-4">
                    <Badge variant={getStatusBadgeVariant(candidate.status)}>{candidate.status}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {candidate.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="text-xs font-medium bg-gray-50 text-gray-700 px-2.5 py-1 rounded border border-gray-200">{skill}</span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-xs text-gray-500 pl-1 font-medium">+{candidate.skills.length - 3}</span>
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
      <Drawer 
        isOpen={!!selectedCandidate} 
        onClose={() => setSelectedCandidate(null)}
        size="2xl"
      >
        {selectedCandidate && (
          <div className="flex flex-col h-full bg-white">
            {/* Drawer Header */}
            <div className="px-8 pt-8 pb-0 border-b border-gray-100 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex gap-5">
                   <Avatar name={selectedCandidate.name} size="xl" className="shadow-sm" />
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900">{selectedCandidate.name}</h2>
                     <p className="text-base text-gray-500 mt-1 flex items-center gap-2">
                       {selectedCandidate.role} 
                       <span className="w-1 h-1 rounded-full bg-gray-300"></span> 
                       <span className="text-gray-400 text-sm">Added {new Date(selectedCandidate.addedAt).toLocaleDateString()}</span>
                     </p>
                     <div className="flex items-center gap-3 mt-4">
                       <Badge variant={getStatusBadgeVariant(selectedCandidate.status)} className="px-3 py-1 text-sm">{selectedCandidate.status}</Badge>
                       {selectedCandidate.fitScore > 80 && (
                          <span className="flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                             <Star size={12} className="mr-1 fill-amber-600" /> Top Match
                          </span>
                       )}
                     </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"><Share2 size={18} /></button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"><Edit2 size={18} /></button>
                   <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setSelectedCandidate(null)}><X size={20} /></button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 mt-8">
                <button 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-emerald-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Overview
                </button>
                <button 
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-emerald-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline & Notes
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-8">
                {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-8">
                       {/* Credentials Section */}
                       <section>
                         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Credentials</h3>
                         
                         <div className="bg-white rounded-lg border border-gray-100 p-0">
                            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                               <div className="p-4">
                                  <span className="block text-xs text-gray-500 mb-1">Experience</span>
                                  <span className="block text-sm font-medium text-gray-900">{selectedCandidate.experience} Years</span>
                               </div>
                               <div className="p-4">
                                  <span className="block text-xs text-gray-500 mb-1">Education</span>
                                  <span className="block text-sm font-medium text-gray-900">B.S. Comp Sci</span>
                               </div>
                               <div className="p-4">
                                  <span className="block text-xs text-gray-500 mb-1">Location</span>
                                  <span className="block text-sm font-medium text-gray-900">{selectedCandidate.location || 'Remote'}</span>
                               </div>
                            </div>
                         </div>
                       </section>

                       {/* Skills Section */}
                       <section>
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Skills</h3>
                          <div className="flex flex-wrap gap-2">
                             {selectedCandidate.skills.map(skill => (
                               <span key={skill} className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:border-emerald-300 transition-colors">
                                 {skill}
                               </span>
                             ))}
                             <button className="px-3 py-1.5 text-sm text-gray-400 border border-dashed border-gray-300 rounded-lg hover:text-emerald-600 hover:border-emerald-400 transition-colors">
                               + Add Skill
                             </button>
                          </div>
                       </section>

                       {/* AI Summary Section */}
                       <section className="bg-gradient-to-br from-emerald-50/50 to-white rounded-xl border border-emerald-100/50 p-6">
                          <div className="flex items-center gap-2 mb-3">
                             <div className="p-1.5 bg-emerald-100 rounded text-emerald-600"><Star size={14} /></div>
                             <h3 className="text-sm font-semibold text-gray-900">AI Assessment</h3>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedCandidate.name} appears to be a strong fit for the <b>{selectedCandidate.role}</b> position. 
                            Their {selectedCandidate.experience} years of experience align well with the seniority requirements. 
                            Specifically, their expertise in <b>{selectedCandidate.skills[0]}</b> stands out. 
                            <br/><br/>
                            Recommendation: Proceed to technical screening to verify depth in {selectedCandidate.skills[1]}.
                          </p>
                       </section>
                    </div>

                    {/* Right Column (Contact & Meta) */}
                    <div className="space-y-6">
                       <section className="bg-gray-50/50 rounded-xl border border-gray-200 p-6">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Info</h3>
                          
                          <div className="space-y-4">
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">Email Address</label>
                                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                   <Mail size={14} className="text-gray-400" /> 
                                   <a href={`mailto:${selectedCandidate.email}`} className="hover:text-emerald-600 transition-colors">{selectedCandidate.email}</a>
                                </div>
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
                                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                   <Phone size={14} className="text-gray-400" /> {selectedCandidate.phone}
                                </div>
                             </div>
                             <div>
                                <label className="text-xs text-gray-500 mb-1 block">Social</label>
                                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                                   <Linkedin size={14} /> 
                                   <a href="#" className="hover:underline">LinkedIn Profile</a>
                                </div>
                             </div>
                          </div>
                       </section>

                       <section className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Files</h3>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer group">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs font-bold">PDF</div>
                                <div>
                                   <p className="text-xs font-medium text-gray-900 group-hover:text-emerald-600">Resume_Final.pdf</p>
                                   <p className="text-[10px] text-gray-400">2.4 MB • Added 2d ago</p>
                                </div>
                             </div>
                             <Download size={14} className="text-gray-400 group-hover:text-gray-600" />
                          </div>
                       </section>
                       
                       <Button variant="danger" className="w-full justify-center" size="sm" onClick={() => {
                          if(confirm('Are you sure you want to remove this candidate?')) {
                            deleteCandidate(selectedCandidate.id);
                            setSelectedCandidate(null);
                          }
                       }}>
                          Remove Candidate
                       </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="max-w-2xl">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Activity & Notes</h3>
                        <Button size="sm" variant="secondary">Add Note</Button>
                     </div>

                     <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-px before:bg-gray-200">
                        {/* Note Item */}
                        <div className="relative pl-8">
                           <div className="absolute left-0 top-1 w-2.5 h-2.5 bg-gray-400 rounded-full ring-4 ring-white"></div>
                           <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg rounded-tl-none">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm font-semibold text-gray-900">Interview Feedback</span>
                                 <span className="text-xs text-gray-500">Yesterday</span>
                              </div>
                              <p className="text-sm text-gray-600">Strong cultural fit. Technical skills are solid, though they haven't used our specific state management library recently. Recommend moving to next stage.</p>
                              <div className="mt-3 flex items-center gap-2">
                                 <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">JD</div>
                                 <span className="text-xs text-gray-500">Jane Doe</span>
                              </div>
                           </div>
                        </div>

                        {/* Status Change Item */}
                        <div className="relative pl-8">
                           <div className="absolute left-0 top-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-white"></div>
                           <p className="text-sm text-gray-900">Moved to <span className="font-medium text-emerald-600">Screening</span></p>
                           <p className="text-xs text-gray-500 mt-1">2 days ago • Changed by System</p>
                        </div>

                        {/* Creation Item */}
                        <div className="relative pl-8">
                           <div className="absolute left-0 top-1.5 w-2.5 h-2.5 bg-gray-300 rounded-full ring-4 ring-white"></div>
                           <p className="text-sm text-gray-900">Candidate added to platform</p>
                           <p className="text-xs text-gray-500 mt-1">{new Date(selectedCandidate.addedAt).toLocaleDateString()} • Manual Import</p>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      <AddCandidateModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};