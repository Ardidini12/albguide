import { useEffect, useState } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';

type ReviewRow = {
  id: string;
  booking_id: string;
  user_id: string;
  package_id: string;
  rating: number;
  title: string | null;
  body: string;
  moderation_status: string;
  created_at: string;
  images?: Array<{ 
    id: string;
    url: string; 
    path: string; 
    file_type: string; 
    file_size: number; 
    created_at: string;
  }>;
};

export function UserReviewsPage() {
  const { token } = useAuth();

  const [items, setItems] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editMsg, setEditMsg] = useState<string | null>(null);
  const [uploadingTo, setUploadingTo] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/reviews/me', { headers: authHeader(token) });
      setItems(data.reviews || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const startEdit = (r: ReviewRow) => {
    setEditingId(r.id);
    setEditRating(r.rating);
    setEditTitle(r.title || '');
    setEditBody(r.body);
    setEditMsg(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMsg(null);
  };

  const saveEdit = async (reviewId: string) => {
    setEditMsg(null);
    try {
      await apiFetch(`/reviews/${reviewId}`, {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({
          rating: editRating,
          title: editTitle || undefined,
          body: editBody,
        }),
      });
      setEditMsg('Review updated successfully!');
      await load();
      setEditingId(null);
    } catch (e) {
      setEditMsg((e as Error).message);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    setError(null);
    try {
      await apiFetch(`/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteMedia = async (reviewId: string, mediaId: string) => {
    if (!confirm('Delete this media file?')) {
      return;
    }

    setError(null);
    try {
      await apiFetch(`/reviews/${reviewId}/images/${mediaId}`, {
        method: 'DELETE',
        headers: authHeader(token),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleFileUpload = async (reviewId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const review = items.find(r => r.id === reviewId);
    if (!review) return;

    const currentSize = (review.images || []).reduce((sum, img) => sum + img.file_size, 0);
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
    let runningSize = currentSize;

    setUploadingTo(reviewId);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        if (runningSize + file.size > MAX_TOTAL_SIZE) {
          setError(`Total file size would exceed 50MB limit. Current: ${(runningSize / 1024 / 1024).toFixed(2)}MB, Adding: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
          break;
        }

        const isVideo = file.type.startsWith('video/');
        let videoDuration: number | undefined;
        
        if (isVideo) {
          const duration = await getVideoDuration(file);
          videoDuration = duration;
          if (duration > 30) {
            setError(`Video "${file.name}" is ${duration.toFixed(1)}s long. Maximum is 30 seconds.`);
            continue;
          }
        }

        const fileType = isVideo ? 'video' : 'image';

        const signData = await apiFetch(`/reviews/${reviewId}/images/sign`, {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({ 
            contentType: file.type,
            file_type: fileType,
            file_size: file.size,
            video_duration: videoDuration
          }),
        });

        const uploadResponse = await fetch(signData.uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for "${file.name}" with status ${uploadResponse.status}`);
        }

        await apiFetch(`/reviews/${reviewId}/images`, {
          method: 'POST',
          headers: authHeader(token),
          body: JSON.stringify({ 
            path: signData.path,
            file_type: fileType,
            file_size: file.size
          }),
        });

        runningSize += file.size;
      }

      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingTo(null);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  };

  const getTotalSize = (images?: Array<{ file_size: number }>) => {
    if (!images) return 0;
    return images.reduce((sum, img) => sum + img.file_size, 0);
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
              <p className="mt-1 text-gray-600">Manage your reviews and media.</p>
            </div>
            <button onClick={load} className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
              Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {editMsg && (
            <div className="mt-4 rounded-lg border px-3 py-2 text-sm text-green-800 bg-green-50">
              {editMsg}
            </div>
          )}

          {loading ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-xl border bg-gray-50 p-8 text-center text-gray-600">No reviews yet.</div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((r) => (
                <div key={r.id} className="rounded-xl border p-4">
                  {editingId === r.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={editRating}
                          onChange={(e) => setEditRating(Number(e.target.value))}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Review *</label>
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          className="mt-1 w-full rounded-md border px-3 py-2"
                          rows={4}
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(r.id)}
                          className="px-4 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600"
                          type="button"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 rounded-md border text-sm hover:bg-gray-50"
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-gray-900">{r.title || 'Review'}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            Package: {r.package_id} • {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-yellow-700">{r.rating}/5</div>
                      </div>

                      <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{r.body}</div>

                      {Array.isArray(r.images) && r.images.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs text-gray-500 mb-2">
                            Media ({r.images.length}) - Total: {formatSize(getTotalSize(r.images))} / 50 MB
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {r.images.map((media) => (
                              <div key={media.id} className="relative group">
                                {media.file_type === 'video' ? (
                                  <video
                                    src={media.url}
                                    controls
                                    className="h-24 w-full object-cover rounded-lg border bg-black"
                                    preload="metadata"
                                  />
                                ) : (
                                  <img
                                    src={media.url}
                                    alt=""
                                    className="h-24 w-full object-cover rounded-lg border"
                                    loading="lazy"
                                  />
                                )}
                                <button
                                  onClick={() => deleteMedia(r.id, media.id)}
                                  className="absolute top-1 right-1 bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  type="button"
                                  title="Delete media"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => startEdit(r)}
                          className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                          type="button"
                        >
                          Edit Review
                        </button>
                        <label className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 cursor-pointer">
                          {uploadingTo === r.id ? 'Uploading...' : 'Add Media'}
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(r.id, e.target.files)}
                            disabled={uploadingTo === r.id}
                          />
                        </label>
                        <button
                          onClick={() => deleteReview(r.id)}
                          className="px-3 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600"
                          type="button"
                        >
                          Delete Review
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
