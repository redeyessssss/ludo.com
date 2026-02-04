import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 animate-slide-in-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="text-3xl group-hover:animate-bounce">🎲</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ludo.com
              </span>
            </Link>
            <div className="hidden md:flex ml-10 space-x-8">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-110"
              >
                🎮 Play
              </Link>
              <Link 
                to="/leaderboard" 
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:scale-110"
              >
                🏆 Leaderboard
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  to={`/profile/${user.id}`} 
                  className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold animate-pulse-glow">
                    {user.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium hidden sm:block">{user.username}</span>
                </Link>
                <button 
                  onClick={logout} 
                  className="text-gray-700 hover:text-red-500 transition-all duration-200 hover:scale-110"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-primary transition-all duration-200 hover:scale-110"
                >
                  🔑 Login
                </Link>
                <Link to="/register" className="btn-primary">
                  🚀 Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
