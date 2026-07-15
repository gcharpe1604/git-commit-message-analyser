import { supabase } from '../lib/supabaseClient';

export interface AnalysisRecord {
  id?: string;
  user_id?: string;
  repo_name: string;
  avg_score: number;
  total_commits: number;
  created_at?: string;
}

export class AnalysisStorageError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'AnalysisStorageError';
    this.code = code;
  }
}

const storageError = (operation: string, error: { message: string; code?: string }) => {
  const setupHint = error.code === '42P01' || /relation .*analyses.* does not exist/i.test(error.message)
    ? ' The analyses table has not been configured in Supabase.'
    : '';
  return new AnalysisStorageError(`${operation}.${setupHint}`.trim(), error.code);
};

const getAuthenticatedUserId = async (): Promise<string | null> => {
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user?.id ?? null;
};

/**
 * Save an analysis record to Supabase.
 * Upserts by (user_id, repo_name) so re-analyzing updates the existing row.
 */
export const saveAnalysisToCloud = async (
  repoName: string,
  avgScore: number,
  totalCommits: number
): Promise<boolean> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) return false;
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
    throw storageError('Could not save this analysis to History', error);
  }
  return true;
};

/**
 * Fetch all analyses for a user, sorted by newest first.
 */
export const fetchUserAnalyses = async (): Promise<AnalysisRecord[]> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) return [];
  const { data, error } = await supabase
    .from('analyses')
    .select('id,user_id,repo_name,avg_score,total_commits,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch analyses:', error.message);
    throw storageError('Could not load History', error);
  }
  return data || [];
};

/**
 * Delete a specific analysis record.
 */
export const deleteAnalysisFromCloud = async (
  repoName: string
): Promise<boolean> => {
  const userId = await getAuthenticatedUserId();
  if (!userId) return false;
  const { error } = await supabase
    .from('analyses')
    .delete()
    .eq('user_id', userId)
    .eq('repo_name', repoName);

  if (error) {
    console.error('Failed to delete analysis:', error.message);
    throw storageError('Could not delete this History item', error);
  }
  return true;
};
