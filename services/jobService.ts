
import { supabase } from '../lib/supabase';
import { Job, Status, Candidate } from '../types';

export const jobService = {
    async getAll() {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToJob);
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToJob(data);
    },

    async create(job: Omit<Job, 'id' | 'createdAt' | 'candidatesCount' | 'stages'>) {
        const { data, error } = await supabase
            .from('jobs')
            .insert([{
                title: job.title,
                department: job.department,
                openings: job.openings,
                status: job.status,
            }])
            .select()
            .single();

        if (error) throw error;
        return mapToJob(data);
    },

    // Get candidates for a specific job, organized for the board
    async getBoard(jobId: string) {
        const { data, error } = await supabase
            .from('job_candidates')
            .select(`
        *,
        candidate:candidates(*)
      `)
            .eq('job_id', jobId)
            .order('stage_order');

        if (error) throw error;

        // We can return the raw list and let the UI group them, or group them here.
        // The UI 'Job' interface expects 'stages: Record<Status, string[]>'.
        // Let's stick to the UI expectation but maybe return full candidate objects?
        // Actually the UI types might need adjustment, but let's try to match.
        // The UI likely wants the full candidates for the cards.

        // Let's return a richer structure than the basic 'Job' type implies for the board view.
        return data.map(row => ({
            ...mapToJobCandidate(row),
            candidate: mapCandidateFromJoin(row.candidate)
        }));
    },

    async updateStage(jobId: string, candidateId: string, status: Status, index: number) {
        // 1. Update status
        // 2. Update order (if we implement strict ordering)
        const { error } = await supabase
            .from('job_candidates')
            .update({ status, stage_order: index, updated_at: new Date().toISOString() })
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId);

        if (error) throw error;
    },

    async assignCandidate(jobId: string, candidateId: string) {
        const { error } = await supabase
            .from('job_candidates')
            .insert([{
                job_id: jobId,
                candidate_id: candidateId,
                status: 'Applied'
            }]);

        if (error) throw error;
    }
};

function mapToJob(row: any): Job {
    return {
        id: row.id,
        title: row.title,
        department: row.department,
        openings: row.openings,
        candidatesCount: 0, // Need aggregation query for this
        status: row.status,
        createdAt: row.created_at,
        stages: { // Placeholder, needs real data if we use this field
            'Applied': [],
            'Screening': [],
            'Technical': [],
            'Manager': [],
            'Offer': [],
            'Hired': [],
            'Rejected': []
        }
    };
}

function mapToJobCandidate(row: any) {
    return {
        id: row.id,
        jobId: row.job_id,
        candidateId: row.candidate_id,
        status: row.status,
        fitScore: row.fit_score,
        rating: row.rating,
        stageOrder: row.stage_order
    };
}

function mapCandidateFromJoin(row: any): Candidate {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        skills: row.skills,
        experience: row.experience,
        status: 'Applied', // This context is tricky in join, but handled by wrapper
        fitScore: 0,
        addedAt: row.created_at,
        linkedIn: row.linkedin,
        location: row.location
    }
}
