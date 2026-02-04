import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Profile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-2xl">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-6">
          <div className="flex items-center space-x-6">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt={profile.username}
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h1 className="text-4xl font-bold">{profile.username}</h1>
              <p className="text-gray-600">Level {profile.level || 1}</p>
              <p className="text-primary font-bold text-xl">Rating: {profile.rating || 1000}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Statistics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="font-bold">{profile.gamesPlayed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="font-bold text-green-600">{profile.wins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Losses:</span>
                <span className="font-bold text-red-600">{profile.losses || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Win Rate:</span>
                <span className="font-bold">
                  {profile.gamesPlayed
                    ? ((profile.wins / profile.gamesPlayed) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tokens Captured:</span>
                <span className="font-bold">{profile.tokensCaptured || 0}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Achievements</h2>
            <div className="space-y-2">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl">🏆</div>
                <div className="font-bold">First Win</div>
                <div className="text-sm text-gray-600">Win your first game</div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg opacity-50">
                <div className="text-2xl">⭐</div>
                <div className="font-bold">10 Wins</div>
                <div className="text-sm text-gray-600">Win 10 games</div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg opacity-50">
                <div className="text-2xl">👑</div>
                <div className="font-bold">Champion</div>
                <div className="text-sm text-gray-600">Reach top 10 on leaderboard</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="text-2xl font-bold mb-4">Recent Games</h2>
          <div className="space-y-2">
            {[1, 2, 3].map((game) => (
              <div key={game} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-bold">Game #{game}</span>
                  <span className="text-gray-600 ml-2">2 hours ago</span>
                </div>
                <div className="text-green-600 font-bold">Victory</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
