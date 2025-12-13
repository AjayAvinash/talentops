import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useApp } from '../../context/Store';
import { candidateService } from '../../services/candidateService';

interface UploadCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadCandidateModal: React.FC<UploadCandidateModalProps> = ({ isOpen, onClose }) => {
    const { addCandidate } = useApp();
    const [step, setStep] = useState<'upload' | 'parsing' | 'review'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form data for review step
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        experience: '',
    });
    const [skills, setSkills] = useState<string[]>([]);
    const [skillInput, setSkillInput] = useState('');

    const handleFileSelect = async (selectedFile: File) => {
        if (!selectedFile) return;

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        // Relaxing validation for demo to allow text/doc if needed, but keeping strict for now based on request
        // if (!validTypes.includes(selectedFile.type)) {
        //    setError('Please upload a PDF or Excel file.');
        //    return;
        // }

        setFile(selectedFile);
        setError(null);
        setStep('parsing');

        try {
            // 1. Upload to Supabase Storage
            const publicUrl = await candidateService.uploadResume(selectedFile);

            // 2. Call N8N Webhook (mocked in service if env var missing)
            const parsedData = await candidateService.parseResume(publicUrl);

            // 3. Pre-fill form
            setFormData({
                name: parsedData.name || '',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                role: parsedData.role || '',
                experience: parsedData.experience || '',
            });
            setSkills(parsedData.skills || []);
            setStep('review');

        } catch (err) {
            console.error(err);
            setError('Failed to upload or parse file. Please try again or enter details manually.');
            setStep('upload'); // Go back to upload or stick to review with empty data?
            // Optionally could go to 'review' with empty data to let user fill manually
            setStep('review');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addCandidate({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            skills: skills,
            experience: parseInt(formData.experience) || 0,
        });

        // Reset
        setFile(null);
        setStep('upload');
        setFormData({ name: '', email: '', phone: '', role: '', experience: '' });
        setSkills([]);
        onClose();
    };

    // ... Helper functions for skills (reuse from AddCandidateModal logic) ...
    const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && skillInput.trim()) {
            e.preventDefault();
            if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
        if (e.key === 'Backspace' && !skillInput && skills.length > 0) setSkills(skills.slice(0, -1));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 'review' ? 'Review Candidate Details' : 'Upload Candidate'}>

            {step === 'upload' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Upload a resume (PDF) or Excel file to automatically parse candidate details.</p>

                    <div
                        className={`
                            border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all
                            ${isDragOver ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 hover:bg-gray-50'}
                            ${error ? 'border-red-300 bg-red-50' : ''}
                        `}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".pdf,.xlsx,.xls,.doc,.docx"
                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        />

                        {error ? (
                            <>
                                <AlertCircle size={48} className="text-red-400 mb-4" />
                                <p className="text-red-600 font-medium">{error}</p>
                                <p className="text-sm text-gray-400 mt-2">Click to try again</p>
                            </>
                        ) : (
                            <>
                                <div className="bg-emerald-100 p-4 rounded-full mb-4">
                                    <UploadCloud size={32} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Click to upload or drag and drop</h3>
                                <p className="text-sm text-gray-500 mt-1">PDF, Excel, or Word documents</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            {step === 'parsing' && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 text-center">Analysing Document...</h3>
                        <p className="text-sm text-gray-500 text-center mt-1">Extracting details via N8N pipeline.</p>
                    </div>
                </div>
            )}

            {step === 'review' && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {file && (
                        <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-4">
                            <FileText size={20} className="text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-900 flex-1 truncate">{file.name}</span>
                            <CheckCircle size={16} className="text-emerald-500" />
                        </div>
                    )}

                    <Input label="Full Name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="Phone" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>

                    <Input label="Role" name="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required />

                    <Input label="Experience (Years)" name="experience" type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} />

                    {/* Simple Skills Input for Review */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Skills</label>
                        <div className="min-h-[46px] w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 flex flex-wrap gap-2">
                            {skills.map(skill => (
                                <span key={skill} className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    {skill}
                                    <button type="button" onClick={() => setSkills(skills.filter(s => s !== skill))} className="ml-1.5 text-emerald-500 hover:text-emerald-800"><X size={14} /></button>
                                </span>
                            ))}
                            <input
                                className="flex-1 outline-none text-sm min-w-[100px] py-1"
                                placeholder="Add skill..."
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyDown}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setStep('upload')}>Back to Upload</Button>
                        <Button type="submit">Add Candidate</Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
