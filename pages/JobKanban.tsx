import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/Store';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { ArrowLeft, MoreHorizontal, GripVertical, Clock, MessageSquare } from 'lucide-react';
import { Candidate, Status } from '../types';

export const JobKanban: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { jobs, candidates, updateCandidateStatus } = useApp();
  const job = jobs.find(j => j.id === id);

  if (!job) return <div>Job not found</div>;

  const stages: Status[] = ['Applied', 'Screening', 'Technical', 'Manager', 'Offer', 'Hired', 'Rejected'];

  const handleDrop = (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const candidateId = e.dataTransfer.getData('candidateId');
    if (candidateId) {
       updateCandidateStatus(candidateId, newStatus);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidateId: string) => {
    e.dataTransfer.setData('candidateId', candidateId);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
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
              const stageCandidates = candidates.filter(c => c.status === stage); // Real app: filter by Job ID
              const isTerminal = stage === 'Hired' || stage === 'Rejected';
              
              return (
                <div 
                  key={stage} 
                  className={`w-80 flex flex-col rounded-xl max-h-full transition-colors ${isTerminal ? 'bg-gray-50/50' : 'bg-gray-100/50'}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700 text-sm">{stage}</span>
                      <span className="bg-white border border-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">{stageCandidates.length}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16}/></button>
                  </div>
                  
                  <div className="px-3 pb-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                    {stageCandidates.map(c => (
                      <div 
                        key={c.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, c.id)}
                        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200/60 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all group relative"
                      >
                         {/* Drag Handle */}
                         <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} className="text-gray-300" />
                         </div>

                         {/* Card Header */}
                         <div className="flex items-start gap-3 mb-3">
                            <Avatar name={c.name} size="sm" />
                            <div>
                               <h4 className="font-semibold text-gray-900 text-sm leading-tight">{c.name}</h4>
                               <p className="text-xs text-gray-500 mt-0.5">{c.role}</p>
                            </div>
                         </div>

                         {/* Skills Tags */}
                         <div className="flex flex-wrap gap-1.5 mb-4">
                            {c.skills.slice(0, 2).map(s => (
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
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
         </div>
       </div>
    </div>
  );
};