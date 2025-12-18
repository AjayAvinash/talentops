import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/Store';
import { candidateService } from '../../services/candidateService';

interface UploadCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UploadCandidateModal: React.FC<UploadCandidateModalProps> = ({ isOpen, onClose }) => {
    const { addCandidate } = useApp();
    const [step, setStep] = useState<'upload' | 'parsing'>('upload');
    const [isDragOver, setIsDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File) => {
        if (!selectedFile) return;

        setError(null);
        setStep('parsing');

        try {
            // 1. Upload to Supabase Storage
            const publicUrl = await candidateService.uploadResume(selectedFile);

            // 2. Call N8N Webhook (mocked in service if env var missing)
            const parsedData = await candidateService.parseResume(publicUrl);

            // 3. Directly add candidate
            await addCandidate({
                name: parsedData.name || 'Unknown Candidate',
                email: parsedData.email || '',
                phone: parsedData.phone || '',
                role: parsedData.role || 'New Applicant',
                skills: parsedData.skills || [],
                experience: parseInt(parsedData.experience) || 0,
            }, 'upload');

            // Reset and close
            setStep('upload');
            onClose();

        } catch (err) {
            console.error(err);
            setError('Failed to process file. Please ensure it is a valid resume and try again.');
            setStep('upload');
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Upload Candidate">

            {step === 'upload' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">Upload a resume (PDF) or Excel file to automatically add candidate details.</p>

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
                        <h3 className="text-lg font-semibold text-gray-900 text-center">Processing Candidate...</h3>
                        <p className="text-sm text-gray-500 text-center mt-1">Extracting details and adding to system.</p>
                    </div>
                </div>
            )}
        </Modal>
    );
};
