import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Search, Plus, Check } from 'lucide-react';
import { Candidate } from '../../types';
import { candidateService } from '../../services/candidateService';
import { useApp } from '../../context/Store';

interface AddExistingCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    currentCandidateIds: string[];
    onAdd: (candidateId: string) => Promise<void>;
}

export const AddExistingCandidateModal: React.FC<AddExistingCandidateModalProps> = ({
    isOpen,
    onClose,
    jobId,
    currentCandidateIds,
    onAdd
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingId, setAddingId] = useState<string | null>(null);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            loadCandidates();
        }
    }, [isOpen]);

    const loadCandidates = async (searchQuery = '') => {
        setLoading(true);
        try {
            const data = await candidateService.search(searchQuery);
            // Filter out candidates already in the board
            setResults(data.filter(c => !currentCandidateIds.includes(c.id)));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        // Debounce could be added here
        loadCandidates(val);
    };

    const handleAdd = async (candidateId: string) => {
        setAddingId(candidateId);
        try {
            await onAdd(candidateId);
            // Remove from list locally
            setResults(prev => prev.filter(c => c.id !== candidateId));
        } catch (error) {
            console.error(error);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add from Talent Pool">
            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or skills..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all bg-white shadow-sm"
                        value={query}
                        onChange={handleSearch}
                        autoFocus
                    />
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-8 text-gray-400 text-sm">Loading...</div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No new candidates found</div>
                    ) : (
                        results.map(candidate => (
                            <div key={candidate.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all group">
                                <div className="flex items-center gap-3">
                                    <Avatar name={candidate.name} size="sm" />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{candidate.name}</h4>
                                        <p className="text-xs text-gray-500">{candidate.role}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleAdd(candidate.id)}
                                    disabled={addingId === candidate.id}
                                >
                                    {addingId === candidate.id ? <Check size={14} /> : <Plus size={14} />}
                                    <span className="ml-1.5">Add</span>
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};
