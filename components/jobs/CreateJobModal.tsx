import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useApp } from '../../context/Store';

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose }) => {
  const { addJob } = useApp();
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    openings: '1',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addJob({
      title: formData.title,
      department: formData.department,
      openings: parseInt(formData.openings) || 1,
      status: 'Open'
    });
    setFormData({ title: '', department: '', openings: '1' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Job">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input 
          label="Job Title" 
          name="title" 
          placeholder="e.g. Senior Product Designer" 
          required 
          value={formData.title} 
          onChange={handleChange}
          autoFocus
        />
        
        <Input 
          label="Department" 
          name="department" 
          placeholder="e.g. Design, Engineering, Marketing" 
          required 
          value={formData.department} 
          onChange={handleChange} 
        />
        
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

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Create Job</Button>
        </div>
      </form>
    </Modal>
  );
};