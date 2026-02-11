import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If viewing own profile and user is logged in
    if (!userId && currentUser) {
      fetchProfile();
      fetchMatches();
    } else if (userId) {
      // Viewing another user's profile
      fetchProfile();
      fetchMatches();
    } else {
      // Not logged in and no userId - redirect to login
      setLoading(false);
    }
  }, [userId, currentUser]);

  const fetchProfile = async () => {
    if (!currentUser && !userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const targetUserId = userId || currentUser?.id;
      
      // For guest users, create a mock profile
      if (targetUserId?.startsWith('guest_')) {
        setProfile({
          id: targetUserId,
          username: currentUser?.username || 'Guest',
          rating: currentUser?.rating || 1000,
          highestRating: currentUser?.highestRating || currentUser?.rating || 1000,
          level: currentUser?.level || 1,
          gamesPlayed: currentUser?.gamesPlayed || 0,
          wins: currentUser?.wins || 0,
          losses: currentUser?.losses || 0,
          tokensCaptured: currentUser?.tokensCaptured || 0,
          tokensFinished: currentUser?.tokensFinished || 0,
          avatar: '/default-avatar.png',
          createdAt: Date.now(),
        });
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/users/${targetUserId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      // If fetch fails but we have currentUser, show their data
      if (currentUser && !userId) {
        setProfile({
          ...currentUser,
          highestRating: currentUser.highestRating || currentUser.rating || 1000,
          tokensCaptured: currentUser.tokensCaptured || 0,
          tokensFinished: currentUser.tokensFinished || 0,
          avatar: currentUser.avatar || '/default-avatar.png',
          createdAt: currentUser.createdAt || Date.now(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    if (!currentUser && !userId) {
      return;
    }
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const targetUserId = userId || currentUser?.id;
      
      // Skip for guest users
      if (targetUserId?.startsWith('guest_')) {
        setMatches([]);
        return;
      }
      
      const response = await fetch(`${API_URL}/api/users/${targetUserId}/matches?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
          <div className="text-white text-2xl mt-4">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <div className="text-white text-2xl">Profile not found</div>
          <Link to="/dashboard" className="mt-4 inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const winRate = profile.gamesPlayed > 0 
    ? ((profile.wins / profile.gamesPlayed) * 100).toFixed(1) 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <img
              src={profile.avatar || '/default-avatar.png'}
              alt={profile.username}
              className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg"
            />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
                {profile.username}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-bold">
                  Level {profile.level || 1}
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-bold text-xl">
                  ⭐ {profile.rating || 1000}
                </span>
              </div>
              <div className="text-gray-600">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-2">📊</span>
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Games Played</span>
                <span className="text-2xl font-bold text-blue-600">{profile.gamesPlayed || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Wins</span>
                <span className="text-2xl font-bold text-green-600">{profile.wins || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Losses</span>
                <span className="text-2xl font-bold text-red-600">{profile.losses || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Win Rate</span>
                <span className="text-2xl font-bold text-purple-600">{winRate}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Tokens Captured</span>
                <span className="text-2xl font-bold text-yellow-600">{profile.tokensCaptured || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-semibold">Highest Rating</span>
                <span className="text-2xl font-bold text-blue-600">{profile.highestRating || profile.rating || 1000}</span>
              </div>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <span className="text-3xl mr-2">🏆</span>
              Achievements
            </h2>
            <div className="space-y-3">
              <div className={`p-4 rounded-lg border-2 ${profile.wins >= 1 ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎯</div>
                  <div>
                    <div className="font-bold text-lg">First Victory</div>
                    <div className="text-sm text-gray-600">Win your first game</div>
                  </div>
                  {profile.wins >= 1 && <div className="ml-auto text-2xl">✓</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${profile.wins >= 10 ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">⭐</div>
                  <div>
                    <div className="font-bold text-lg">Winning Streak</div>
                    <div className="text-sm text-gray-600">Win 10 games</div>
                  </div>
                  {profile.wins >= 10 && <div className="ml-auto text-2xl">✓</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${profile.rating >= 1500 ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">👑</div>
                  <div>
                    <div className="font-bold text-lg">Master Player</div>
                    <div className="text-sm text-gray-600">Reach 1500 rating</div>
                  </div>
                  {profile.rating >= 1500 && <div className="ml-auto text-2xl">✓</div>}
                </div>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${profile.tokensCaptured >= 50 ? 'bg-yellow-50 border-yellow-400' : 'bg-gray-100 border-gray-300 opacity-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🎯</div>
                  <div>
                    <div className="font-bold text-lg">Token Hunter</div>
                    <div className="text-sm text-gray-600">Capture 50 tokens</div>
                  </div>
                  {profile.tokensCaptured >= 50 && <div className="ml-auto text-2xl">✓</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-3xl mr-2">🎮</span>
            Recent Matches
          </h2>
          {matches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">🎲</div>
              <p>No matches played yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg border-2 ${
                    match.result === 'win' 
                      ? 'bg-green-50 border-green-300' 
                      : 'bg-red-50 border-red-300'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                        match.result === 'win' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {match.result === 'win' ? '✓ Victory' : '✗ Defeat'}
                      </span>
                      <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-semibold capitalize">
                        {match.mode || 'Quick'}
                      </span>
                      {match.disconnected && (
                        <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-semibold">
                          Opponent Left
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTimeAgo(match.timestamp)}
                    </div>
                  </div>
                  
                  {match.ratingChange && (
                    <div className="mt-2 md:mt-0 text-right">
                      <div className={`text-xl font-bold ${
                        match.ratingChange.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {match.ratingChange.change >= 0 ? '+' : ''}{match.ratingChange.change}
                      </div>
                      <div className="text-sm text-gray-600">
                        {match.ratingChange.old} → {match.ratingChange.new}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
