import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/Store';
import { Avatar } from '../components/ui/Avatar';
import { ArrowLeft, MoreHorizontal, GripVertical, Clock, MessageSquare, Plus, Upload, UserPlus, X } from 'lucide-react';
import { Candidate, Status } from '../types';
import { jobService } from '../services/jobService';
import { AddCandidateModal } from '../components/candidates/AddCandidateModal';
import { AddExistingCandidateModal } from '../components/candidates/AddExistingCandidateModal';
import { RejectCandidateModal } from '../components/candidates/RejectCandidateModal';
import { CandidateDrawer } from '../components/candidates/CandidateDrawer';

export const JobKanban: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const { jobs, updateCandidateStatus } = useApp();
   const [boardCandidates, setBoardCandidates] = React.useState<Candidate[]>([]);
   const job = jobs.find(j => j.id === id);

   // Modal states
   const [isAddCandidateOpen, setIsAddCandidateOpen] = useState(false);
   const [isAddExistingOpen, setIsAddExistingOpen] = useState(false);
   const [activeStage, setActiveStage] = useState<Status | null>(null);
   const [menuOpenStage, setMenuOpenStage] = useState<Status | null>(null);
   const [rejectCandidateId, setRejectCandidateId] = useState<string | null>(null);
   const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

   const handleRejectConfirm = async (reason: string, rating: number) => {
      if (!id || !rejectCandidateId) return;

      // Update local state immediately
      setBoardCandidates(prev => prev.map(c =>
         c.id === rejectCandidateId ? { ...c, status: 'Rejected' } : c
      ));

      // Sync global store
      updateCandidateStatus(rejectCandidateId, 'Rejected');

      try {
         await jobService.rejectCandidate(id, rejectCandidateId, reason, rating, job?.title);
         // Refresh board just in case
         loadBoard();
      } catch (error) {
         console.error(error);
      }
   };

   const loadBoard = () => {
      if (id) {
         jobService.getBoard(id).then(data => {
            const mapped = data.map((item: any) => ({
               ...item.candidate,
               status: item.status,
               fitScore: item.fitScore
            }));
            setBoardCandidates(mapped);
         }).catch(err => console.error(err));
      }
   };

   React.useEffect(() => {
      loadBoard();
   }, [id]);

   if (!job) return <div>Job not found</div>;

   const stages: Status[] = ['Applied', 'Screening', 'Technical', 'Manager', 'Offer', 'Hired', 'Rejected'];

   const handleDrop = async (e: React.DragEvent, newStatus: Status) => {
      e.preventDefault();
      const candidateId = e.dataTransfer.getData('candidateId');

      if (candidateId && id) {
         setBoardCandidates(prev => prev.map(c =>
            c.id === candidateId ? { ...c, status: newStatus } : c
         ));

         // Sync global store status
         updateCandidateStatus(candidateId, newStatus);

         try {
            await jobService.updateStage(id, candidateId, newStatus, 0, job?.title);
         } catch (error) {
            console.error('Failed to update stage', error);
         }
      }
   };

   const handleDragStart = (e: React.DragEvent, candidateId: string) => {
      e.dataTransfer.setData('candidateId', candidateId);
   };

   // Actions
   const handleAddExisting = async (candidateId: string) => {
      if (!id || !activeStage) return;
      await jobService.assignCandidate(id, candidateId, activeStage);
      loadBoard();
   };

   const handleAddNewSuccess = async (candidateId: string) => {
      if (!id || !activeStage) return;
      // The service logic in modal creates the candidate, but we need to link it to this job & stage
      await jobService.assignCandidate(id, candidateId, activeStage);
      loadBoard();
   };

   return (
      <div className="h-[calc(100vh-8rem)] flex flex-col" onClick={() => setMenuOpenStage(null)}>
         {/* Header */}
         <div className="flex items-center gap-4 mb-6">
            <Link to="/jobs" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
               <ArrowLeft size={20} />
            </Link>
            <div>
               <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{job.title}</h1>
               <p className="text-sm text-gray-500 flex items-center gap-2">
                  {job.department} <span className="text-gray-300">•</span> <span className="text-gray-700 font-medium">{job.openings} Openings</span>
               </p>
            </div>
         </div>

         {/* Kanban Board */}
         <div className="flex-1 overflow-x-auto pb-4">
            <div className="flex gap-4 h-full min-w-max px-1">
               {stages.map(stage => {
                  const stageCandidates = boardCandidates.filter(c => c.status === stage);
                  const isTerminal = stage === 'Hired' || stage === 'Rejected';

                  return (
                     <div
                        key={stage}
                        className={`w-80 flex flex-col rounded-xl max-h-full transition-colors ${isTerminal ? 'bg-gray-50/50' : 'bg-gray-100/50'}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, stage)}
                     >
                        <div className="p-4 flex justify-between items-center relative group">
                           <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-700 text-sm">{stage}</span>
                              <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">{stageCandidates.length}</span>
                           </div>
                           <div className="flex items-center">
                              <button
                                 className="text-gray-400 hover:text-emerald-600 p-1 hover:bg-white rounded transition-all mr-1 opacity-0 group-hover:opacity-100"
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenStage(stage === menuOpenStage ? null : stage);
                                 }}
                              >
                                 <Plus size={16} />
                              </button>

                           </div>

                           {/* Action Menu */}
                           {menuOpenStage === stage && (
                              <div className="absolute right-2 top-10 bg-white shadow-xl border border-gray-100 rounded-lg py-1 w-48 z-10 animate-in fade-in zoom-in-95 duration-100">
                                 <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                       setActiveStage(stage);
                                       setIsAddCandidateOpen(true);
                                    }}
                                 >
                                    <Upload size={14} /> Upload CV
                                 </button>
                                 <button
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                       setActiveStage(stage);
                                       setIsAddExistingOpen(true);
                                    }}
                                 >
                                    <UserPlus size={14} /> Add Existing
                                 </button>
                              </div>
                           )}
                        </div>

                        <div className="px-3 pb-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                           {stageCandidates.map(c => (
                              <div
                                 key={c.id}
                                 draggable
                                 onDragStart={(e) => handleDragStart(e, c.id)}
                                 className="bg-white p-4 rounded-xl shadow-sm border border-gray-300 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-400 transition-all group relative"
                              >
                                 {/* Drag Handle */}
                                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical size={14} className="text-gray-300" />
                                 </div>

                                 {/* Card Header */}
                                 <div className="flex items-start gap-3 mb-3">
                                    <Avatar name={c.name} size="sm" />
                                    <div>
                                       <h4
                                          className="font-semibold text-gray-900 text-sm leading-tight hover:text-emerald-600 hover:underline cursor-pointer"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             setSelectedCandidate(c);
                                          }}
                                       >{c.name}</h4>
                                       <p className="text-xs text-gray-500 mt-0.5">{c.role}</p>
                                    </div>
                                 </div>

                                 {/* Skills Tags */}
                                 <div className="flex flex-wrap gap-1.5 mb-4">
                                    {c.skills && c.skills.slice(0, 2).map(s => (
                                       <span key={s} className="px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 text-[10px] border border-gray-100 font-medium">
                                          {s}
                                       </span>
                                    ))}
                                 </div>

                                 {/* Footer */}
                                 <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-400">
                                       <div className="flex items-center gap-1 text-[10px]">
                                          <MessageSquare size={12} /> 2
                                       </div>
                                       <div className="flex items-center gap-1 text-[10px]">
                                          <Clock size={12} /> 1d
                                       </div>
                                    </div>

                                    {c.fitScore > 80 ? (
                                       <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                          {c.fitScore}% Match
                                       </span>
                                    ) : (
                                       <span className="text-[10px] font-medium text-gray-500">
                                          {c.fitScore}% Match
                                       </span>
                                    )}
                                 </div>

                                 {/* Card Actions (Hover) */}
                                 <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex bg-white rounded shadow-sm border border-gray-100 p-0.5 z-10">
                                    <button
                                       className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded"
                                       title="Reject Candidate"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          setRejectCandidateId(c.id);
                                       }}
                                    >
                                       <X size={14} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Modals */}
         <AddCandidateModal
            isOpen={isAddCandidateOpen}
            onClose={() => setIsAddCandidateOpen(false)}
            onSuccess={handleAddNewSuccess}
         />

         {id && (
            <AddExistingCandidateModal
               isOpen={isAddExistingOpen}
               onClose={() => setIsAddExistingOpen(false)}
               jobId={id}
               currentCandidateIds={boardCandidates.map(c => c.id)}
               onAdd={handleAddExisting}
            />
         )}

         <RejectCandidateModal
            isOpen={!!rejectCandidateId}
            onClose={() => setRejectCandidateId(null)}
            candidateName={boardCandidates.find(c => c.id === rejectCandidateId)?.name || 'Candidate'}
            onConfirm={handleRejectConfirm}
         />

         <CandidateDrawer
            isOpen={!!selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            candidate={selectedCandidate}
            onDelete={() => { }} // Read-only or Implement delete if needed
         />
      </div>
   );
};