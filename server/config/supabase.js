import { createClient } from '@supabase/supabase-js';

let supabaseAdmin = null;

function validateSupabaseProjectUrl(url) {
  const u = String(url || '');
  if (!u) return;
  if (/storage\.supabase\.co/i.test(u) || /\/storage\/v1\//i.test(u) || /\/s3\b/i.test(u)) {
    throw new Error('SUPABASE_URL must be your Supabase project URL (https://<ref>.supabase.co), not a storage/s3 endpoint');
  }
}

export function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('SUPABASE_URL is not set');
  }

  validateSupabaseProjectUrl(url);

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }

  supabaseAdmin = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return supabaseAdmin;
}

export function getSupabaseBucket() {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error('SUPABASE_STORAGE_BUCKET is not set');
  }
  return bucket;
}

export function buildSupabasePublicObjectUrl({ bucket, path }) {
  const baseUrl = process.env.SUPABASE_URL;
  if (!baseUrl) {
    throw new Error('SUPABASE_URL is not set');
  }

  const normalizedBase = String(baseUrl).replace(/\/+$/, '');
  const normalizedPath = String(path).replace(/^\/+/, '');

  return `${normalizedBase}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}
