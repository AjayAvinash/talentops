import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Star, AlertCircle } from 'lucide-react';

interface RejectCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string, rating: number) => Promise<void>;
    candidateName: string;
}

export const RejectCandidateModal: React.FC<RejectCandidateModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    candidateName
}) => {
    const [reason, setReason] = useState('');
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            await onConfirm(reason, rating);
            onClose();
            setReason('');
            setRating(0);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reject Candidate">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex gap-3 text-red-800">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-semibold">You are about to reject {candidateName}</p>
                        <p className="mt-1 opacity-90">This action will move them to the "Rejected" column and log this feedback.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Interview Rating (Optional)</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className={`p-1 rounded transition-colors ${rating >= star ? 'text-amber-400' : 'text-gray-300 hover:text-amber-200'}`}
                            >
                                <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason</label>
                    <textarea
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 min-h-[100px] text-sm p-3 border"
                        placeholder="e.g. Lacks experience in React, Cultural fit issues..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
                    <Button variant="danger" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Rejecting...' : 'Reject Candidate'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
