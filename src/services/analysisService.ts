import { supabase } from '../lib/supabaseClient';

export interface AnalysisRecord {
  id?: string;
  user_id?: string;
  repo_name: string;
  avg_score: number;
  total_commits: number;
  created_at?: string;
}

/**
 * Save an analysis record to Supabase.
 * Upserts by (user_id, repo_name) so re-analyzing updates the existing row.
 */
export const saveAnalysisToCloud = async (
  userId: string,
  repoName: string,
  avgScore: number,
  totalCommits: number
): Promise<boolean> => {
  const { error } = await supabase
    .from('analyses')
    .upsert(
      {
        user_id: userId,
        repo_name: repoName,
        avg_score: avgScore,
        total_commits: totalCommits,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,repo_name' }
    );

  if (error) {
    console.error('Failed to save analysis to cloud:', error.message);
    return false;
  }
  return true;
};

/**
 * Fetch all analyses for a user, sorted by newest first.
 */
export const fetchUserAnalyses = async (userId: string): Promise<AnalysisRecord[]> => {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch analyses:', error.message);
    return [];
  }
  return data || [];
};

/**
 * Delete a specific analysis record.
 */
export const deleteAnalysisFromCloud = async (
  userId: string,
  repoName: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('user_id', userId)
    .eq('repo_name', repoName);

  if (error) {
    console.error('Failed to delete analysis:', error.message);
    return false;
  }
  return true;
};
