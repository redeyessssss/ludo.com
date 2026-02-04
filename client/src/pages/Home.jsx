import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Play Ludo Online
        </h1>
        <p className="text-2xl text-white mb-8">
          Challenge players from around the world in real-time multiplayer Ludo
        </p>
        
        <div className="flex justify-center space-x-4 mb-12">
          {user ? (
            <Link to="/dashboard" className="btn-primary text-xl px-8 py-4">
              Play Now
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary text-xl px-8 py-4">
                Get Started
              </Link>
              <Link to="/login" className="btn-secondary text-xl px-8 py-4">
                Login
              </Link>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="card">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">Global Multiplayer</h3>
            <p className="text-gray-600">Play with friends or match with players worldwide</p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Ranked Matches</h3>
            <p className="text-gray-600">Climb the leaderboard and prove your skills</p>
          </div>
          
          <div className="card">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Multiple Modes</h3>
            <p className="text-gray-600">Quick play, ranked, tournaments, and private rooms</p>
          </div>
        </div>

        <div className="mt-16 card">
          <h2 className="text-3xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div>✅ Real-time multiplayer</div>
            <div>✅ Friend system</div>
            <div>✅ Daily missions</div>
            <div>✅ Achievements</div>
            <div>✅ Leaderboards</div>
            <div>✅ Chat system</div>
            <div>✅ Tournaments</div>
            <div>✅ Mobile friendly</div>
          </div>
        </div>
      </div>
    </div>
  );
}
