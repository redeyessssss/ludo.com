import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      username: `Guest${Math.floor(Math.random() * 10000)}`,
      isGuest: true,
    };
    setUser(guestUser, null);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl animate-float opacity-10">🎲</div>
        <div className="absolute bottom-10 right-10 text-6xl animate-float opacity-10" style={{ animationDelay: '1s' }}>🎮</div>
      </div>

      <div className="card max-w-md w-full animate-scale-in relative z-10">
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-bounce">🔑</div>
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-gray-600 mt-2">Login to continue playing</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-slide-in-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="animate-slide-in-right">
            <label className="block text-sm font-medium text-gray-700 mb-2">🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full animate-fade-in-up"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⚙️</span>
                Logging in...
              </span>
            ) : (
              '🚀 Login'
            )}
          </button>
        </form>

        <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <button onClick={handleGuestLogin} className="btn-secondary w-full">
            👤 Play as Guest
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </p>

        {/* Decorative tokens */}
        <div className="flex justify-center space-x-2 mt-6">
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'].map((color, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${color} animate-pulse`}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
