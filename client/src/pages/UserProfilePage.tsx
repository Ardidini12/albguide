import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
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
  const containerRef = useRef<HTMLDivElement>(null);

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


  useLayoutEffect(() => {
    if (!user) return;
    const ctx = gsap.context(() => {
      // Title
      gsap.from('.kinetic-header', {
        y: -50, opacity: 0, duration: 1, ease: 'power4.out'
      });

      // Cards
      gsap.from('.profile-card', {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3
      });

      // Inputs
      gsap.from('.input-group', {
        x: -20, opacity: 0, duration: 0.5, stagger: 0.05, delay: 0.6
      });

    }, containerRef);
    return () => ctx.revert();
  }, [user]);

  return (
    <div ref={containerRef} className="bg-black min-h-screen pt-24 pb-12 px-4 selection:bg-red-600 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="kinetic-header mb-12 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black italic uppercase text-white tracking-tighter mb-4">
            My <span className="text-red-600">Profile</span>
          </h1>
          <p className="text-xl text-zinc-400 border-l-4 border-red-600 pl-6 max-w-2xl">
            Manage your personal travel identity.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-4 text-sm font-bold text-red-200 animate-pulse">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 rounded-xl border border-green-900/50 bg-green-950/30 px-6 py-4 text-sm font-bold text-green-200">
            {successMsg}
          </div>
        )}

        {loading && !user ? (
          <div className="text-center py-20">
            <div className="text-2xl font-black text-zinc-700 uppercase animate-pulse">Loading Profile...</div>
          </div>
        ) : user ? (
          <div className="space-y-8">
            {/* Profile Picture Section */}
            <div className="profile-card bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-red-600/30 transition-colors">
              <h2 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-white/5 pb-4">Identity</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div
                  className="relative group w-32 h-32 rounded-full border-4 border-zinc-800 bg-black overflow-hidden flex items-center justify-center cursor-pointer shadow-2xl"
                  onClick={() => user.profile_picture && setShowImageModal(true)}
                >
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <span className="text-5xl font-black text-zinc-700 select-none">
                      {user.email.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  {user.profile_picture && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-bold text-white uppercase tracking-widest">View</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                    <label className="group relative inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-gray-200 cursor-pointer transition-all hover:scale-105 active:scale-95">
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
                        className="px-6 py-3 rounded-full border border-red-900/50 text-red-500 font-bold uppercase tracking-widest text-xs hover:bg-red-950/30 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    JPG, PNG or GIF • Max 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="profile-card bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-red-600/30 transition-colors">
              <h2 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-white/5 pb-4">Personal Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 input-group">
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Email Address</div>
                  <div className="text-lg font-bold text-white font-mono">{user.email}</div>
                </div>
                <div className="bg-black/50 p-4 rounded-xl border border-white/5">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Member Since</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="input-group">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="input-group px-8 py-4 bg-red-600 text-white font-black uppercase italic tracking-widest rounded-full hover:bg-red-700 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(220,38,38,0.3)]"
                  >
                    {loading ? 'Saving...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security */}
            <div className="profile-card bg-zinc-900 border border-white/10 rounded-3xl p-8 hover:border-red-600/30 transition-colors">
              <h2 className="text-2xl font-black italic uppercase text-white mb-8 border-b border-white/5 pb-4">Security</h2>
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="input-group">
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="input-group">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="input-group">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-white font-bold focus:border-red-600 focus:outline-none transition-colors placeholder-zinc-700"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="input-group px-8 py-4 border border-white/20 text-white font-black uppercase italic tracking-widest rounded-full hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>

      {showImageModal && user?.profile_picture && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white/50 hover:text-white text-xl font-black uppercase tracking-widest transition-colors"
            >
              Close [ESC]
            </button>
            <img
              src={user.profile_picture}
              alt="Profile"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
