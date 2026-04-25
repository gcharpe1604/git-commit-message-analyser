import { supabase } from '../lib/supabaseClient';

type Provider = 'groq' | 'openrouter' | 'gemini';

interface UserApiKey {
  provider: Provider;
  api_key: string;
}

/**
 * Fetch all API keys for the current user from Supabase.
 */
export const getUserApiKeys = async (userId: string): Promise<Record<Provider, string>> => {
  const { data, error } = await supabase
    .from('user_api_keys')
    .select('provider, api_key')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching API keys:', error.message);
    return { groq: '', openrouter: '', gemini: '' };
  }

  const keys: Record<Provider, string> = { groq: '', openrouter: '', gemini: '' };
  (data as UserApiKey[])?.forEach((row) => {
    keys[row.provider] = row.api_key;
  });
  return keys;
};

/**
 * Save (upsert) a single API key for a provider.
 */
export const saveUserApiKey = async (
  userId: string,
  provider: Provider,
  apiKey: string
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_api_keys')
    .upsert(
      { user_id: userId, provider, api_key: apiKey, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,provider' }
    );

  if (error) {
    console.error('Error saving API key:', error.message);
    return false;
  }
  return true;
};

/**
 * Delete a single API key for a provider.
 */
export const deleteUserApiKey = async (
  userId: string,
  provider: Provider
): Promise<boolean> => {
  const { error } = await supabase
    .from('user_api_keys')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);

  if (error) {
    console.error('Error deleting API key:', error.message);
    return false;
  }
  return true;
};
