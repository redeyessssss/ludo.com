import { useState, useEffect } from 'react';

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
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold text-center mb-8">🏆 Leaderboard</h1>

          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                timeframe === 'daily' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                timeframe === 'weekly' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-6 py-2 rounded-lg font-semibold ${
                timeframe === 'all' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              All Time
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-100 to-yellow-50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold w-8">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <img
                      src={player.avatar || '/default-avatar.png'}
                      alt={player.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <div className="font-bold text-lg">{player.username}</div>
                      <div className="text-sm text-gray-600">
                        Level {player.level || 1}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {player.rating || 1000}
                    </div>
                    <div className="text-sm text-gray-600">
                      {player.wins || 0}W / {player.losses || 0}L
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
