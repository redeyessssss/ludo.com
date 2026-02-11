import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('all'); // all, weekly, daily
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/leaderboard?timeframe=${timeframe}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'from-yellow-400 via-yellow-300 to-yellow-500';
    if (index === 1) return 'from-gray-300 via-gray-200 to-gray-400';
    if (index === 2) return 'from-orange-400 via-orange-300 to-orange-500';
    return 'from-gray-50 to-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-600">Top players ranked by rating</p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex justify-center space-x-2 md:space-x-4 mb-8">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
                timeframe === 'daily' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
                timeframe === 'weekly' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 ${
                timeframe === 'all' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Time
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-xl text-gray-600 mb-2">No players yet!</p>
              <p className="text-gray-500">Be the first to play and claim the top spot!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <Link
                  key={player.id}
                  to={`/profile/${player.id}`}
                  className={`block transition-all duration-300 hover:scale-102 hover:shadow-xl`}
                >
                  <div
                    className={`flex items-center justify-between p-4 md:p-5 rounded-xl bg-gradient-to-r ${getRankColor(index)} border-2 ${
                      index < 3 ? 'border-yellow-400' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                      {/* Rank Badge */}
                      <div className="text-2xl md:text-3xl font-bold w-12 md:w-16 text-center">
                        {getRankBadge(index)}
                      </div>
                      
                      {/* Avatar */}
                      <img
                        src={player.avatar || '/default-avatar.png'}
                        alt={player.username}
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-white shadow-lg"
                      />
                      
                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base md:text-lg text-gray-800 truncate">
                          {player.username}
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                          <span className="bg-white px-2 py-0.5 rounded-full">
                            Level {player.level || 1}
                          </span>
                          <span>•</span>
                          <span>{player.gamesPlayed || 0} games</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="text-right ml-2">
                      <div className="text-xl md:text-2xl font-bold text-blue-600">
                        {player.rating || 1000}
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        <span className="text-green-600 font-semibold">{player.wins || 0}W</span>
                        {' / '}
                        <span className="text-red-600 font-semibold">{player.losses || 0}L</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {player.winRate}% WR
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
