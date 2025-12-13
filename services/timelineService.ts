
import { supabase } from '../lib/supabase';
import { Activity } from '../types';

export const timelineService = {
    // Get timeline for a specific candidate
    async getForCandidate(candidateId: string) {
        const { data, error } = await supabase
            .from('timeline')
            .select('*')
            .eq('candidate_id', candidateId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToActivity);
    },

    // Create a timeline event
    async create(event: { candidateId: string; jobId?: string; type: string; title: string; description: string }) {
        const { error } = await supabase
            .from('timeline')
            .insert([{
                candidate_id: event.candidateId,
                job_id: event.jobId,
                type: event.type, // Ensure this matches enum 'activity_type' or cast it
                title: event.title,
                description: event.description
            }]);

        if (error) throw error;
    }
};

function mapToActivity(row: any): Activity {
    return {
        id: row.id,
        type: row.type,
        title: row.title,
        description: row.description,
        timestamp: row.created_at
    };
}
