import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { gsap } from 'gsap';

export function RegisterPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 40,
      duration: 1.2,
      ease: 'power4.out',
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      setToken(String(data.token));
      navigate('/user');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 min-h-[80vh] flex items-center justify-center py-20">
      <div ref={containerRef} className="max-w-md w-full mx-auto px-4">
        <div className="bg-zinc-900 border border-white/10 rounded-3xl p-10 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-transparent opacity-50" />
          <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Join Us</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Create your credentials for the journey.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white focus:border-red-600 transition-colors outline-none"
                type="text"
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white focus:border-red-600 transition-colors outline-none"
                type="email"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Secret Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white focus:border-red-600 transition-colors outline-none"
                type="password"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-red-600 text-white py-4 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 mt-4 active:scale-95"
              type="submit"
            >
              {loading ? 'Registering…' : 'Establish Identity'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
