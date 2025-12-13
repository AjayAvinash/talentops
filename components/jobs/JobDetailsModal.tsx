import React from 'react';
import { Modal } from '../ui/Modal';
import { Badge, getStatusBadgeVariant } from '../ui/Badge';
import { Job } from '../../types';
import { Users, MapPin, Briefcase, Calendar } from 'lucide-react';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: Job | null;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, job }) => {
    if (!job) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Job Details">
            <div className="space-y-6">
                <div>
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {job.department}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location || 'Remote'}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> Failed to parse date</span>
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(job.status)}>{job.status}</Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase">Openings</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{job.openings}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <span className="text-xs font-medium text-gray-500 uppercase">Active Candidates</span>
                        <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
                            {job.candidatesCount}
                            <Users size={16} className="text-gray-400" />
                        </p>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Roles & Responsibilities</h3>
                    <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-600 whitespace-pre-wrap">
                        {job.responsibilities || 'No specific responsibilities listed.'}
                    </div>
                </div>

                {/* Future: Add Skills here if we parse them or add a field for them */}

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};
