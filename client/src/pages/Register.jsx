import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: username
      });

      // Create user document in Firestore
      const userData = {
        id: firebaseUser.uid,
        username,
        email: firebaseUser.email,
        rating: 1000,
        highestRating: 1000,
        level: 1,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        tokensCaptured: 0,
        tokensFinished: 0,
        matchHistory: [],
        avatar: '/default-avatar.png',
        bio: '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Get Firebase ID token
      const token = await firebaseUser.getIdToken();

      setUser(userData, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Register error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message || 'Registration failed');
      }
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
