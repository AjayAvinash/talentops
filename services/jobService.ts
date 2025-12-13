
import { supabase } from '../lib/supabase';
import { Job, Status, Candidate } from '../types';
import { generateEmbedding, vectorSearchJobs } from './searchService';

export const jobService = {
    async getAll() {
        const { data, error } = await supabase
            .from('jobs')
            .select(`
                *,
                candidates:job_candidates(count)
            `)
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
        // Generate embedding for semantic search
        // Combine title and department for embedding (description and skills_required are in DB but not in Job type)
        const embeddingText = [
            job.title,
            job.department || '',
        ].filter(Boolean).join(' ');

        let embedding: number[] | null = null;
        try {
            embedding = await generateEmbedding(embeddingText);
        } catch (error) {
            console.warn('Failed to generate embedding for job, continuing without it:', error);
        }

        const insertData: any = {
            title: job.title,
            department: job.department,
            openings: job.openings,
            status: job.status,
            location: job.location,
            roles_and_responsibilities: job.responsibilities,
            required_skills: job.required_skills || [],
        };

        if (embedding) {
            insertData.embedding = `[${embedding.join(',')}]`;
        }

        const { data, error } = await supabase
            .from('jobs')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;

        // After creation, update embedding if we have description/skills from DB
        const { data: fullJob } = await supabase
            .from('jobs')
            .select('description, skills_required')
            .eq('id', data.id)
            .single();

        if (fullJob && (fullJob.description || fullJob.skills_required)) {
            const fullEmbeddingText = [
                job.title,
                job.department || '',
                fullJob.description || '',
                Array.isArray(fullJob.skills_required) ? fullJob.skills_required.join(', ') : '',
            ].filter(Boolean).join(' ');

            try {
                const fullEmbedding = await generateEmbedding(fullEmbeddingText);
                await supabase
                    .from('jobs')
                    .update({ embedding: `[${fullEmbedding.join(',')}]` })
                    .eq('id', data.id);
            } catch (error) {
                console.warn('Failed to update job embedding with full text:', error);
            }
        }

        return mapToJob(data);
    },

    // Get candidates for a specific job, organized for the board
    async assignCandidate(jobId: string, candidateId: string, status: Status = 'Applied') {
        const { error } = await supabase
            .from('job_candidates')
            .insert([{
                job_id: jobId,
                candidate_id: candidateId,
                status: status
            }]);

        if (error) throw error;

        // Sync global candidate status
        await supabase
            .from('candidates')
            .update({ status: status })
            .eq('id', candidateId);

        // Get job title for timeline
        const { data: job } = await supabase.from('jobs').select('title').eq('id', jobId).single();

        // Log to timeline
        const { timelineService } = await import('./timelineService');
        await timelineService.create({
            candidateId,
            jobId,
            type: 'assignment', // Fixed: matches enum 'assignment'
            title: `Applied to ${job?.title || 'Job'}`,
            description: `Candidate was assigned to ${status} stage`
        });
    },
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

    async updateStage(jobId: string, candidateId: string, status: Status, index: number, jobTitle?: string) {
        // 1. Update status
        // 2. Update order (if we implement strict ordering)
        const { error } = await supabase
            .from('job_candidates')
            .update({ status, stage_order: index, updated_at: new Date().toISOString() })
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId);

        if (error) throw error;

        // Update global candidate status
        await supabase
            .from('candidates')
            .update({ status })
            .eq('id', candidateId);

        // Log to timeline
        if (jobTitle) {
            const { timelineService } = await import('./timelineService');
            await timelineService.create({
                candidateId,
                jobId,
                type: 'stage_change', // Fixed: matches enum 'stage_change'
                title: `Moved to ${status}`,
                description: `Candidate was moved to ${status} stage for ${jobTitle}`
            });
        }
    },

    async rejectCandidate(jobId: string, candidateId: string, reason: string, rating: number, jobTitle?: string) {
        // Update status to rejected
        const { error } = await supabase
            .from('job_candidates')
            .update({
                status: 'Rejected',
                rating: rating, // Assuming we have a rating column or store it in jsonb, let's check schema. We have rating column in job_candidates.
                updated_at: new Date().toISOString()
            })
            .eq('job_id', jobId)
            .eq('candidate_id', candidateId);

        if (error) throw error;

        // Update global candidate status
        await supabase
            .from('candidates')
            .update({ status: 'Rejected' })
            .eq('id', candidateId);

        // Log to timeline
        const { timelineService } = await import('./timelineService');
        await timelineService.create({
            candidateId,
            jobId,
            type: 'stage_change', // Fixed: 'rejection' is not in enum, using 'stage_change' as it maps to Rejected status
            title: 'Application Rejected',
            description: `Rejected for ${jobTitle || 'job'}. Reason: ${reason}. Rating: ${rating}/5`
        });
    },

    // Semantic search using vector embeddings
    async search(query: string): Promise<Job[]> {
        if (!query || query.trim().length === 0) {
            // If empty query, return all jobs
            return this.getAll();
        }

        try {
            // Use vector search for semantic matching
            const results = await vectorSearchJobs(query.trim(), 50);

            // Map results to Job format
            return results.map(({ job, similarity }) => {
                return mapToJob(job);
            });
        } catch (error) {
            console.error('Vector search failed, falling back to text search:', error);

            // Fallback to text-based search if vector search fails
            const { data, error: textError } = await supabase
                .from('jobs')
                .select('*')
                .or(`title.ilike.%${query}%,department.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (textError) throw textError;
            return data.map(mapToJob);
        }
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateStatus(id: string, status: 'Open' | 'Closed' | 'On Hold') {
        const { error } = await supabase
            .from('jobs')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    async generateMissingEmbeddings() {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .is('embedding', null);

        if (error) {
            console.error('Error fetching jobs with missing embeddings:', error);
            return;
        }

        if (!jobs || jobs.length === 0) return;

        console.log(`Found ${jobs.length} jobs with missing embeddings. Regenerating...`);

        for (const job of jobs) {
            const embeddingText = [
                job.title,
                job.department || '',
                job.description || '',
                Array.isArray(job.skills_required) ? job.skills_required.join(', ') : '',
            ].filter(Boolean).join(' ');

            try {
                const embedding = await generateEmbedding(embeddingText);
                // Format as string for vector type update
                const embeddingString = `[${embedding.join(',')}]`;

                const { error: updateError } = await supabase
                    .from('jobs')
                    .update({ embedding: embeddingString } as any)
                    .eq('id', job.id);

                if (updateError) throw updateError;
                console.log(`Regenerated embedding for job: ${job.title} (${job.id})`);
            } catch (err) {
                console.error(`Failed to regenerate embedding for job ${job.id}:`, err);
            }
        }
    }
};

function mapToJob(row: any): Job {
    return {
        id: row.id,
        title: row.title,
        department: row.department,
        openings: row.openings,
        candidatesCount: row.candidates ? row.candidates[0]?.count : 0, // Handle count from join
        status: row.status,
        location: row.location,
        responsibilities: row.roles_and_responsibilities,
        required_skills: row.required_skills || [],
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
