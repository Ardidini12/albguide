import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';

export async function createSignedReadUrl(path, expiresInSeconds = 3600) {
  if (!path) return null;

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

  if (error) {
    console.error(error);
    return null;
  }

  return data?.signedUrl || null;
}

export function isLikelyExternalUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}
