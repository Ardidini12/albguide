import { useEffect, useState, useRef } from 'react';
import { apiFetch, authHeader } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { profilePictureEvents } from '../utils/profilePictureEvents';

type UserData = {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  created_at: string;
  profile_picture?: string | null;
};

export function UserProfilePage() {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadUser = async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch('/users/me', { headers: authHeader(token) });
      setUser(data.user);
      setName(data.user.name || '');
      return data.user;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      await apiFetch('/users/me', {
        method: 'PATCH',
        headers: authHeader(token),
        body: JSON.stringify({ name }),
      });
      await loadUser();
      setSuccessMsg('Profile updated successfully!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/users/me/password', {
        method: 'PUT',
        headers: authHeader(token),
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMsg('Password changed successfully!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploadingPic(true);

    try {
      await apiFetch('/users/me/profile-picture', {
        method: 'DELETE',
        headers: authHeader(token),
      });

      await loadUser();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      profilePictureEvents.emit(null);
      setSuccessMsg('Profile picture removed successfully!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setUploadingPic(true);

    try {
      const signData = await apiFetch('/users/me/profile-picture/sign', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      await fetch(signData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await apiFetch('/users/me/profile-picture', {
        method: 'POST',
        headers: authHeader(token),
        body: JSON.stringify({
          path: signData.path,
        }),
      });

      const userData = await loadUser();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Emit the new profile picture URL
      if (userData?.profile_picture) {
        profilePictureEvents.emit(userData.profile_picture);
      }
      setSuccessMsg('Profile picture updated successfully!');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account settings</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {successMsg}
            </div>
          )}

          {loading && !user ? (
            <div className="mt-6 text-gray-600">Loading…</div>
          ) : user ? (
            <div className="mt-6 space-y-8">
              <div className="rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                <div className="flex items-center gap-6">
                  <div 
                    className="w-24 h-24 rounded-full bg-gray-100 border-2 flex items-center justify-center text-3xl font-semibold text-gray-800 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => user.profile_picture && setShowImageModal(true)}
                    title={user.profile_picture ? 'Click to view full size' : ''}
                  >
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      user.email.slice(0, 1).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex gap-2">
                      <label className="inline-flex items-center px-4 py-2 rounded-md border bg-white text-sm hover:bg-gray-50 cursor-pointer">
                        {uploadingPic ? 'Uploading...' : 'Change Picture'}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePicChange}
                          disabled={uploadingPic}
                        />
                      </label>
                      {user.profile_picture && (
                        <button
                          onClick={handleRemoveProfilePicture}
                          disabled={uploadingPic}
                          className="px-4 py-2 rounded-md border border-red-300 text-red-700 text-sm hover:bg-red-50 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">JPG, PNG or GIF. Max 5MB.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="mt-1 font-medium text-gray-900">{user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Member Since</div>
                    <div className="mt-1 font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      placeholder="Your name"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              <div className="rounded-xl border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full rounded-md border px-3 py-2"
                      required
                      minLength={6}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-md bg-red-700 text-white text-sm hover:bg-red-600 disabled:opacity-50"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {showImageModal && user?.profile_picture && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
            >
              ✕
            </button>
            <img 
              src={user.profile_picture} 
              alt="Profile" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
