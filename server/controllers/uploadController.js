import crypto from 'crypto';
import { getSupabaseAdmin, getSupabaseBucket } from '../config/supabase.js';
import { createSignedReadUrl } from '../services/storageService.js';

function getExtensionFromMime(mime) {
  const m = String(mime || '').toLowerCase();
  if (m === 'image/jpeg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  if (m === 'video/mp4') return 'mp4';
  if (m === 'video/webm') return 'webm';
  if (m === 'video/quicktime') return 'mov';
  return '';
}

export async function uploadMedia(req, res) {
  const folder = String(req.body?.folder || 'destinations');
  const contentType = String(req.body?.contentType || 'application/octet-stream');

  const bucket = getSupabaseBucket();
  const supabase = getSupabaseAdmin();

  const ext = getExtensionFromMime(contentType);
  const randomName = crypto.randomBytes(16).toString('hex');
  const fileName = ext ? `${randomName}.${ext}` : randomName;
  const path = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error || !data?.token) {
    console.error(error);
    return res.status(500).json({
      message: 'Unable to create signed upload URL',
      details: error?.message || String(error || ''),
    });
  }

  return res.status(201).json({ bucket, path, token: data.token, signedUrl: data.signedUrl });
}

export async function createReadUrl(req, res) {
  const path = String(req.body?.path || '');
  if (!path) {
    return res.status(400).json({ message: 'path is required' });
  }

  const expiresIn = Number(req.body?.expiresInSeconds || 3600);
  const signedUrl = await createSignedReadUrl(path, Number.isFinite(expiresIn) ? expiresIn : 3600);

  if (!signedUrl) {
    return res.status(500).json({ message: 'Unable to create signed URL' });
  }

  return res.json({ signedUrl });
}
