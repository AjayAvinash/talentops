import { Candidate, Job, Activity } from './types';

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior React Developer',
    skills: ['React', 'TypeScript', 'Node.js'],
    experience: 6,
    status: 'Screening',
    fitScore: 92,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    location: 'San Francisco, CA',
    linkedIn: 'linkedin.com/in/sarahj',
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '+1 (555) 987-6543',
    role: 'Product Designer',
    skills: ['Figma', 'UI/UX', 'Prototyping'],
    experience: 4,
    status: 'New',
    fitScore: 85,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    location: 'Remote',
  },
  {
    id: 'c3',
    name: 'David Rossi',
    email: 'd.rossi@example.com',
    phone: '+1 (555) 456-7890',
    role: 'Backend Engineer',
    skills: ['Python', 'Django', 'PostgreSQL'],
    experience: 8,
    status: 'Technical',
    fitScore: 78,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    location: 'New York, NY',
  },
  {
    id: 'c4',
    name: 'Emily Blunt',
    email: 'emily.b@example.com',
    phone: '+1 (555) 222-3333',
    role: 'Marketing Manager',
    skills: ['SEO', 'Content Strategy', 'Analytics'],
    experience: 5,
    status: 'Rejected',
    fitScore: 60,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
  },
  {
    id: 'c5',
    name: 'James Wilson',
    email: 'j.wilson@example.com',
    phone: '+1 (555) 444-5555',
    role: 'Frontend Developer',
    skills: ['Vue.js', 'JavaScript', 'CSS'],
    experience: 3,
    status: 'Offer',
    fitScore: 95,
    addedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior React Developer',
    department: 'Engineering',
    openings: 2,
    candidatesCount: 12,
    status: 'Open',
    createdAt: '2023-10-01T10:00:00Z',
    stages: {
      New: ['c2'],
      Screening: ['c1'],
      Technical: ['c3'],
      Assignment: [],
      'Final HR': [],
      Offer: [],
      Rejected: ['c4'],
      Archived: []
    },
  },
  {
    id: 'j2',
    title: 'Product Designer',
    department: 'Design',
    openings: 1,
    candidatesCount: 5,
    status: 'Open',
    createdAt: '2023-10-15T14:30:00Z',
    stages: {
      New: [],
      Screening: [],
      Technical: [],
      Assignment: [],
      'Final HR': [],
      Offer: [],
      Rejected: [],
      Archived: []
    },
  },
  {
    id: 'j3',
    title: 'Marketing Specialist',
    department: 'Marketing',
    openings: 1,
    candidatesCount: 8,
    status: 'Closed',
    createdAt: '2023-09-20T09:00:00Z',
    stages: {
      New: [],
      Screening: [],
      Technical: [],
      Assignment: [],
      'Final HR': [],
      Offer: ['c5'],
      Rejected: [],
      Archived: []
    },
  },
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'a1',
    type: 'upload',
    title: 'Candidate Uploaded',
    description: 'Sarah Jenkins was added via PDF upload',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'a2',
    type: 'stage_change',
    title: 'Stage Updated',
    description: 'Michael Chen moved to Screening',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: 'a3',
    type: 'note',
    title: 'Note Added',
    description: 'Interview feedback added for David Rossi',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
