import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useApp } from '../../context/Store';

interface CreateJobDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateJobDrawer: React.FC<CreateJobDrawerProps> = ({ isOpen, onClose }) => {
    const { addJob } = useApp();
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        location: '',
        openings: '1',
        responsibilities: '',
        skills: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addJob({
            title: formData.title,
            department: formData.department,
            location: formData.location,
            openings: parseInt(formData.openings) || 1,
            responsibilities: formData.responsibilities,
            required_skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        });
        setFormData({ title: '', department: '', location: '', openings: '1', responsibilities: '', skills: '' });
        onClose();
    };

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Create New Job" size="lg">
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <form id="create-job-form" onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Job Title"
                            name="title"
                            placeholder="e.g. Senior Product Designer"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            autoFocus
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Department"
                                name="department"
                                placeholder="e.g. Engineering"
                                required
                                value={formData.department}
                                onChange={handleChange}
                            />
                            <Input
                                label="Location"
                                name="location"
                                placeholder="e.g. New York, Remote"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Number of Openings"
                            name="openings"
                            type="number"
                            min="1"
                            placeholder="1"
                            required
                            value={formData.openings}
                            onChange={handleChange}
                        />

                        <div className="w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Roles & Responsibilities</label>
                            <textarea
                                name="responsibilities"
                                rows={6}
                                className="block w-full rounded-lg border border-gray-200 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 shadow-sm"
                                placeholder="Describe the key responsibilities and requirements for this role..."
                                value={formData.responsibilities}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="w-full">
                            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Required Skills</label>
                            <Input
                                name="skills"
                                placeholder="e.g. React, TypeScript, Node.js (comma separated)"
                                value={formData.skills}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-sm text-gray-500">
                            <p>Skills required will be used to match candidates.</p>
                        </div>
                    </form>
                </div>

                <div className="border-t border-gray-200 px-8 py-5 flex items-center justify-end gap-3 bg-white">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="create-job-form">Create Job</Button>
                </div>
            </div>
        </Drawer>
    );
};
