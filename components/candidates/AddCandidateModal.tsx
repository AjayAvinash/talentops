import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useApp } from '../../context/Store';
import { UploadCloud, X } from 'lucide-react';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (candidateId: string) => Promise<void>;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { addCandidate } = useApp();
  // ... state ...

  // handleFileChange ...


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
  });

  // Tag input state
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setSkillInput('');
    }
    // Handle backspace to remove last tag if input is empty
    if (e.key === 'Backspace' && !skillInput && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate parsing
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: "Alex Morgan",
        email: "alex.morgan@example.com",
        phone: "+1 (555) 0123",
        role: "Senior Frontend Engineer",
        experience: "6"
      }));
      setSkills(["React", "TypeScript", "Node.js", "Tailwind CSS"]);
      setIsUploading(false);
      // In real app, we would upload to Supabase storage here
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addCandidate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      skills: skills,
      experience: parseInt(formData.experience) || 0,
    });

    if (result && onSuccess) {
      await onSuccess(result.id);
    }

    setFormData({ name: '', email: '', phone: '', role: '', experience: '' });
    setSkills([]);
    setSkillInput('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Candidate">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          name="name"
          placeholder="e.g. Jane Smith"
          required
          value={formData.name}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="jane@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <Input
            label="Phone"
            name="phone"
            placeholder="+1 (555) ..."
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        <Input
          label="Target Role"
          name="role"
          placeholder="e.g. Senior Frontend Dev"
          required
          value={formData.role}
          onChange={handleChange}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Experience (Years)"
            name="experience"
            type="number"
            placeholder="5"
            value={formData.experience}
            onChange={handleChange}
          />

          {/* Tag Input for Skills */}
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Skills</label>
            <div
              className="min-h-[46px] w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all shadow-sm"
              onClick={() => document.getElementById('skill-input')?.focus()}
            >
              {skills.map(skill => (
                <span key={skill} className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 animate-[scale-in_0.15s_ease-out]">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="ml-1.5 text-emerald-500 hover:text-emerald-800 focus:outline-none">
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input
                id="skill-input"
                type="text"
                className="flex-1 outline-none bg-transparent text-sm min-w-[100px] py-1 text-gray-900 placeholder-gray-400"
                placeholder={skills.length === 0 ? "Type skill & Press Enter" : ""}
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
              />
            </div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="mt-2">
          <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Resume</label>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
          <div
            className={`border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors cursor-pointer group ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud size={32} className={`mb-2 group-hover:text-emerald-500 ${isUploading ? 'animate-bounce' : ''}`} />
            <p className="text-sm font-medium group-hover:text-emerald-600">
              {isUploading ? 'Parsing Resume...' : 'Drag resume PDF or click to browse'}
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add Candidate</Button>
        </div>
      </form>
    </Modal>
  );
};