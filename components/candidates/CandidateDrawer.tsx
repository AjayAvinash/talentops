import React, { useState, useEffect } from 'react';
import { Drawer } from '../ui/Drawer';
import { Avatar } from '../ui/Avatar';
import { Badge, getStatusBadgeVariant } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
    Mail, Phone, Linkedin, Share2, Edit2, X, Star, Download
} from 'lucide-react';
import { Candidate, Activity } from '../../types';

interface CandidateDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate | null;
    onDelete: (id: string) => void;
}

export const CandidateDrawer: React.FC<CandidateDrawerProps> = ({
    isOpen,
    onClose,
    candidate,
    onDelete
}) => {
    const [activeTab, setActiveTab] = useState<'profile' | 'timeline'>('profile');
    const [timelineActivities, setTimelineActivities] = useState<Activity[]>([]);

    // Reset tab when candidate changes
    useEffect(() => {
        if (isOpen) {
            setActiveTab('profile');
        }
    }, [isOpen]);

    // Fetch timeline
    useEffect(() => {
        if (candidate && activeTab === 'timeline') {
            const loadTimeline = async () => {
                const { timelineService } = await import('../../services/timelineService');
                try {
                    // Fetch ANY type for now, as service returns raw data adaptable to UI
                    const data: any[] = await timelineService.getForCandidate(candidate.id);
                    setTimelineActivities(data);
                } catch (error) {
                    console.error('Failed to load timeline', error);
                }
            };
            loadTimeline();
        }
    }, [candidate, activeTab]);

    if (!candidate) return null;

    return (
        <Drawer isOpen={isOpen} onClose={onClose} size="2xl">
            <div className="flex flex-col h-full bg-white">
                {/* Drawer Header */}
                <div className="px-8 pt-8 pb-0 border-b border-gray-100 bg-white">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-5">
                            <Avatar name={candidate.name} size="xl" className="shadow-sm" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
                                <p className="text-base text-gray-500 mt-1 flex items-center gap-2">
                                    {candidate.role}
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="text-gray-400 text-sm">Added {new Date(candidate.addedAt).toLocaleDateString()}</span>
                                </p>
                                <div className="flex items-center gap-3 mt-4">
                                    <Badge variant={getStatusBadgeVariant(candidate.status)} className="px-3 py-1 text-sm">{candidate.status}</Badge>
                                    {candidate.fitScore > 80 && (
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
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" onClick={onClose}><X size={20} /></button>
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
                                                    <span className="block text-sm font-medium text-gray-900">{candidate.experience} Years</span>
                                                </div>
                                                <div className="p-4">
                                                    <span className="block text-xs text-gray-500 mb-1">Education</span>
                                                    <span className="block text-sm font-medium text-gray-900">B.S. Comp Sci</span>
                                                </div>
                                                <div className="p-4">
                                                    <span className="block text-xs text-gray-500 mb-1">Location</span>
                                                    <span className="block text-sm font-medium text-gray-900">{candidate.location || 'Remote'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Skills Section */}
                                    <section>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.skills.map(skill => (
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
                                            {candidate.name} appears to be a strong fit for the <b>{candidate.role}</b> position.
                                            Their {candidate.experience} years of experience align well with the seniority requirements.
                                            Specifically, their expertise in <b>{candidate.skills[0]}</b> stands out.
                                            <br /><br />
                                            Recommendation: Proceed to technical screening to verify depth in {candidate.skills[1]}.
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
                                                    <a href={`mailto:${candidate.email}`} className="hover:text-emerald-600 transition-colors">{candidate.email}</a>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Phone Number</label>
                                                <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                                                    <Phone size={14} className="text-gray-400" /> {candidate.phone}
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
                                        if (confirm('Are you sure you want to remove this candidate?')) {
                                            onDelete(candidate.id);
                                            onClose();
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
                                    {timelineActivities.length === 0 ? (
                                        <p className="text-gray-500 text-sm pl-8">No activity recorded yet.</p>
                                    ) : (
                                        timelineActivities.map((activity) => (
                                            <div key={activity.id} className="relative pl-8">
                                                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${activity.type === 'rejection' ? 'bg-red-500' :
                                                        activity.type === 'status_change' ? 'bg-emerald-500' :
                                                            'bg-gray-300'
                                                    }`}></div>

                                                {activity.type === 'note' || activity.type === 'rejection' ? (
                                                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg rounded-tl-none">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm font-semibold text-gray-900">{activity.title}</span>
                                                            <span className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">{activity.description}</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-900">{activity.title}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(activity.timestamp).toLocaleDateString()} • {activity.description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Drawer>
    );
};
