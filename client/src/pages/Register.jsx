import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [username, setUsername] = useState('');
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setUser(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 text-6xl animate-float opacity-10">🎲</div>
        <div className="absolute bottom-20 left-10 text-6xl animate-float opacity-10" style={{ animationDelay: '1.5s' }}>🏆</div>
        <div className="absolute top-1/2 left-1/4 text-5xl animate-float opacity-10" style={{ animationDelay: '0.5s' }}>⭐</div>
      </div>

      <div className="card max-w-md w-full animate-scale-in relative z-10">
        <div className="text-center mb-6">
          <div className="inline-block text-6xl mb-4 animate-bounce">🚀</div>
          <h2 className="text-3xl font-bold">Join Ludo.com</h2>
          <p className="text-gray-600 mt-2">Create your account and start playing!</p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="animate-slide-in-left">
            <label className="block text-sm font-medium text-gray-700 mb-2">👤 Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>

          <div className="animate-slide-in-right">
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

          <div className="animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-medium text-gray-700 mb-2">🔒 Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full animate-fade-in-up"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⚙️</span>
                Creating account...
              </span>
            ) : (
              '🎮 Sign Up'
            )}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Login
          </Link>
        </p>

        {/* Decorative animated tokens */}
        <div className="flex justify-center space-x-3 mt-6">
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'].map((color, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full ${color} shadow-lg animate-token-bounce`}
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
