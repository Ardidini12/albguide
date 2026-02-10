import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';

export async function createSignedReadUrl(path, expiresInSeconds = 3600) {
  if (!path) return null;

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);

  if (error) {
    // 404 means file doesn't exist yet - this is acceptable during upload flow
    if (error.statusCode !== '404' && error.status !== 404) {
      console.error('Error creating signed URL:', error);
    }
    return null;
  }

  return data?.signedUrl || null;
}

export function isLikelyExternalUrl(value) {
  return typeof value === 'string' && /^https?:\/\//i.test(value);
}

export async function deleteFromStorage(path) {
  if (!path) return { success: false, error: 'No path provided' };

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    // 404 means file doesn't exist - this is acceptable during deletion
    if (error.statusCode === '404' || error.status === 404) {
      return { success: true, data: [], notFound: true };
    }
    console.error('Error deleting from storage:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteMultipleFromStorage(paths) {
  if (!paths || paths.length === 0) return { success: false, error: 'No paths provided' };

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    console.error('Error deleting multiple from storage:', error);
    return { success: false, error };
  }

  return { success: true, data };
}

export function extractPathFromSignedUrl(signedUrl) {
  if (!signedUrl || typeof signedUrl !== 'string') return null;
  
  try {
    const url = new URL(signedUrl);
    const pathMatch = url.pathname.match(/\/object\/sign\/[^/]+\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1].split('?')[0]);
    }
    
    const simpleMatch = url.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)/);
    if (simpleMatch && simpleMatch[1]) {
      return decodeURIComponent(simpleMatch[1].split('?')[0]);
    }
  } catch (e) {
    console.error('Error extracting path from URL:', e);
  }
  
  return null;
}
