import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuthStore();
  const [diceValue, setDiceValue] = useState(1);
  const [animatedTokens, setAnimatedTokens] = useState([]);

  useEffect(() => {
    // Animate dice
    const diceInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
    }, 2000);

    // Animate tokens moving on board
    const tokenInterval = setInterval(() => {
      setAnimatedTokens(prev => {
        const newTokens = [...prev];
        if (newTokens.length < 4) {
          newTokens.push({ id: Date.now(), color: ['red', 'green', 'blue', 'yellow'][newTokens.length] });
        }
        return newTokens;
      });
    }, 500);

    return () => {
      clearInterval(diceInterval);
      clearInterval(tokenInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Side - Animated Ludo Board */}
          <div className="flex justify-center items-center">
            <div className="relative">
              {/* Simplified Ludo Board Preview */}
              <div className="w-[400px] h-[400px] bg-white rounded-2xl shadow-2xl p-4 relative overflow-hidden">
                {/* Board Grid */}
                <div className="grid grid-cols-15 gap-0 h-full">
                  {/* Red Corner */}
                  <div className="absolute top-4 left-4 w-32 h-32 bg-red-500 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 bg-red-700 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Green Corner */}
                  <div className="absolute top-4 right-4 w-32 h-32 bg-green-500 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 bg-green-700 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Yellow Corner */}
                  <div className="absolute bottom-4 left-4 w-32 h-32 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 bg-yellow-600 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Blue Corner */}
                  <div className="absolute bottom-4 right-4 w-32 h-32 bg-blue-500 rounded-lg flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-2">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-6 h-6 bg-blue-700 rounded-full border-2 border-white"></div>
                      ))}
                    </div>
                  </div>

                  {/* Center Dice */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-2xl flex items-center justify-center text-3xl font-bold text-white animate-dice-roll">
                      {diceValue}
                    </div>
                  </div>

                  {/* Animated Tokens */}
                  {animatedTokens.map((token, idx) => (
                    <div
                      key={token.id}
                      className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-lg animate-token-bounce`}
                      style={{
                        backgroundColor: token.color,
                        top: `${20 + idx * 15}%`,
                        left: `${30 + idx * 10}%`,
                        animationDelay: `${idx * 0.2}s`
                      }}
                    />
                  ))}
                </div>

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl pointer-events-none"></div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 text-6xl animate-float">🎲</div>
              <div className="absolute -bottom-8 -left-8 text-6xl animate-float" style={{ animationDelay: '1s' }}>🏆</div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold leading-tight">
                Play Ludo Online
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  on the #1 Site!
                </span>
              </h1>
              
              <p className="text-xl text-gray-300">
                Join millions of players in the world's most popular Ludo game
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl text-center"
                >
                  Play Now
                </Link>
              ) : (
                <>
                  <Link 
                    to="/register" 
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl text-center"
                  >
                    Get Started
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-8 py-4 bg-gray-700 hover:bg-gray-600 text-white text-xl font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-xl text-center"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">10M+</div>
                <div className="text-sm text-gray-400">Players</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">50M+</div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            Why Play on Ludo.com?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-2xl font-bold mb-3">Global Multiplayer</h3>
              <p className="text-gray-400">
                Play with friends or match with players from around the world in real-time
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold mb-3">Ranked Matches</h3>
              <p className="text-gray-400">
                Climb the leaderboard and compete for the top spot with skill-based matchmaking
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 transition-all duration-300 hover:scale-105">
              <div className="text-5xl mb-4">🎮</div>
              <h3 className="text-2xl font-bold mb-3">Multiple Modes</h3>
              <p className="text-gray-400">
                Quick play, ranked matches, tournaments, and private rooms with friends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-5xl font-bold">
                Improve Your Game
              </h2>
              <p className="text-xl text-gray-300">
                Master Ludo with practice modes, tutorials, and compete in daily tournaments
              </p>
              <ul className="space-y-4">
                {[
                  'Real-time multiplayer matches',
                  'Private rooms with friends',
                  'Daily missions and rewards',
                  'Global leaderboards',
                  'Chat with players',
                  'Mobile-friendly design'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <span className="text-green-400 text-2xl">✓</span>
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Mode Cards */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">⚡</div>
                <h3 className="text-xl font-bold mb-2">Quick Play</h3>
                <p className="text-sm text-blue-100">Jump into a game instantly</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="text-xl font-bold mb-2">Ranked</h3>
                <p className="text-sm text-purple-100">Compete for rating</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-xl font-bold mb-2">Private</h3>
                <p className="text-sm text-green-100">Play with friends</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-6 hover:scale-105 transition-transform cursor-pointer">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="text-xl font-bold mb-2">Tournament</h3>
                <p className="text-sm text-orange-100">Win big prizes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to Play?</h2>
          <p className="text-2xl mb-8 text-green-50">Join millions of players today!</p>
          {!user && (
            <Link 
              to="/register" 
              className="inline-block px-12 py-5 bg-white text-green-600 text-2xl font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-2xl"
            >
              Sign Up - It's Free!
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
