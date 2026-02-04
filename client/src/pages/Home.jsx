import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuthStore();
  const [diceValue, setDiceValue] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl animate-float opacity-20">🎲</div>
        <div className="absolute top-40 right-20 text-5xl animate-float opacity-20" style={{ animationDelay: '1s' }}>🎮</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-float opacity-20" style={{ animationDelay: '2s' }}>🏆</div>
        <div className="absolute bottom-40 right-10 text-6xl animate-float opacity-20" style={{ animationDelay: '1.5s' }}>⭐</div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Animated dice logo */}
        <div className="flex justify-center mb-8">
          <div className="dice-container animate-dice-roll text-6xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {diceValue}
          </div>
        </div>

        <h1 className="text-7xl font-bold text-white mb-6 animate-fade-in-up">
          🎲 Ludo<span className="text-yellow-300">.com</span>
        </h1>
        <p className="text-2xl text-white mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Challenge players from around the world in real-time multiplayer Ludo
        </p>
        
        <div className="flex justify-center space-x-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {user ? (
            <Link to="/dashboard" className="btn-primary text-xl px-8 py-4 animate-pulse-glow">
              🎮 Play Now
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-xl px-8 py-4">
                🚀 Get Started
              </Link>
              <Link to="/login" className="btn-secondary text-xl px-8 py-4">
                🔑 Login
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="card animate-slide-in-left hover:scale-105 transition-transform duration-300">
            <div className="text-5xl mb-4 animate-bounce">🌍</div>
            <h3 className="text-xl font-bold mb-2">Global Multiplayer</h3>
            <p className="text-gray-600">Play with friends or match with players worldwide</p>
          </div>
          
          <div className="card animate-fade-in-up hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl mb-4 animate-bounce" style={{ animationDelay: '0.1s' }}>🏆</div>
            <h3 className="text-xl font-bold mb-2">Ranked Matches</h3>
            <p className="text-gray-600">Climb the leaderboard and prove your skills</p>
          </div>
          
          <div className="card animate-slide-in-right hover:scale-105 transition-transform duration-300">
            <div className="text-5xl mb-4 animate-bounce" style={{ animationDelay: '0.2s' }}>🎮</div>
            <h3 className="text-xl font-bold mb-2">Multiple Modes</h3>
            <p className="text-gray-600">Quick play, ranked, tournaments, and private rooms</p>
          </div>
        </div>

        <div className="mt-16 card animate-scale-in">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center">
            <span className="mr-3 text-4xl animate-pulse">✨</span>
            Features
            <span className="ml-3 text-4xl animate-pulse">✨</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              '✅ Real-time multiplayer',
              '✅ Friend system',
              '✅ Daily missions',
              '✅ Achievements',
              '✅ Leaderboards',
              '✅ Chat system',
              '✅ Tournaments',
              '✅ Mobile friendly'
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Animated tokens showcase */}
        <div className="mt-16 flex justify-center space-x-4">
          {['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'].map((color, index) => (
            <div
              key={index}
              className={`token ${color} animate-token-bounce`}
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
